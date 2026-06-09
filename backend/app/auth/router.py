import secrets
import httpx
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from website.zenkar.backend.app.database import get_db
from website.zenkar.backend.app.models import User
from website.zenkar.backend.app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from website.zenkar.backend.app.auth.utils import hash_password, verify_password, create_access_token, get_current_user
from website.zenkar.backend.app.auth.discord import get_discord_oauth_url, exchange_code, get_discord_user
from website.zenkar.backend.app.config import settings

router = APIRouter(prefix="/auth", tags=["auth"])

FRONTEND_URL = "https://zenkar.fr"


async def verify_turnstile(token: str) -> bool:
    if not settings.turnstile_secret_key:
        return True  # désactivé si pas configuré
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": settings.turnstile_secret_key, "response": token},
        )
        return resp.json().get("success", False)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
async def register(body: RegisterRequest, db: AsyncSession = Depends(get_db)):
    if not await verify_turnstile(body.turnstile_token):
        raise HTTPException(status_code=400, detail="Captcha invalide")

    existing = await db.execute(
        select(User).where((User.email == body.email) | (User.username == body.username))
    )
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Email ou pseudo déjà utilisé")

    user = User(
        username=body.username,
        email=body.email,
        password_hash=hash_password(body.password),
        date_of_birth=body.date_of_birth,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)

    return TokenResponse(access_token=create_access_token(user.id))


@router.post("/login", response_model=TokenResponse)
async def login(body: LoginRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    return TokenResponse(access_token=create_access_token(user.id))


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.post("/logout")
async def logout():
    return {"detail": "Déconnecté"}


# ── Discord OAuth ─────────────────────────────────────────────────────────────

@router.get("/discord")
async def discord_login():
    state = secrets.token_urlsafe(16)
    return RedirectResponse(get_discord_oauth_url(state))


@router.get("/discord/callback")
async def discord_callback(code: str, db: AsyncSession = Depends(get_db)):
    try:
        token_data = await exchange_code(code)
        discord_user = await get_discord_user(token_data["access_token"])
    except Exception:
        raise HTTPException(status_code=400, detail="Erreur Discord OAuth")

    discord_id = discord_user["id"]
    discord_username = discord_user.get("username", "")
    discord_avatar = discord_user.get("avatar")
    discord_email = discord_user.get("email", "")

    result = await db.execute(select(User).where(User.discord_id == discord_id))
    user = result.scalar_one_or_none()

    if not user:
        # Vérifie si l'email Discord est déjà utilisé
        if discord_email:
            email_result = await db.execute(select(User).where(User.email == discord_email))
            user = email_result.scalar_one_or_none()

        if user:
            # Lie le compte Discord au compte existant
            user.discord_id = discord_id
            user.discord_username = discord_username
            user.discord_avatar = discord_avatar
        else:
            # Crée un nouveau compte via Discord
            from datetime import date
            user = User(
                username=discord_username[:20],
                email=discord_email or f"{discord_id}@discord.zenkar.fr",
                date_of_birth=date(2000, 1, 1),  # placeholder, à compléter
                discord_id=discord_id,
                discord_username=discord_username,
                discord_avatar=discord_avatar,
            )
            db.add(user)

        await db.commit()
        await db.refresh(user)

    token = create_access_token(user.id)
    return RedirectResponse(f"{FRONTEND_URL}?token={token}")
