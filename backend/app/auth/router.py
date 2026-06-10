import secrets
import httpx
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Request, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import User
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse
from app.auth.utils import hash_password, verify_password, create_access_token, get_current_user, require_admin
from app.auth.discord import get_discord_oauth_url, exchange_code, get_discord_user
from app.config import settings

from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])

MC_CHANGE_COOLDOWN = timedelta(hours=24)


async def verify_turnstile(token: str) -> bool:
    if not settings.turnstile_secret_key:
        return True
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": settings.turnstile_secret_key, "response": token},
        )
        return resp.json().get("success", False)


@router.post("/register", response_model=TokenResponse, status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def register(request: Request, body: RegisterRequest, db: AsyncSession = Depends(get_db)):
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
@limiter.limit("20/minute")
async def login(request: Request, body: LoginRequest, db: AsyncSession = Depends(get_db)):
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


@router.post("/bootstrap-admin", response_model=UserResponse)
async def bootstrap_admin(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    existing = await db.execute(select(User).where(User.is_admin == True))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=403, detail="Un admin existe déjà")
    current_user.is_admin = True
    await db.commit()
    await db.refresh(current_user)
    return current_user


# ── Minecraft ────────────────────────────────────────────────────────────────

class MinecraftLinkRequest(BaseModel):
    username: str


@router.post("/minecraft", response_model=UserResponse)
@limiter.limit("10/hour")
async def link_minecraft(
    request: Request,
    body: MinecraftLinkRequest,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Cooldown : 24h entre chaque changement
    if current_user.minecraft_linked_at:
        elapsed = datetime.now(timezone.utc) - current_user.minecraft_linked_at.replace(tzinfo=timezone.utc)
        remaining = MC_CHANGE_COOLDOWN - elapsed
        if remaining.total_seconds() > 0:
            hours = int(remaining.total_seconds() // 3600)
            minutes = int((remaining.total_seconds() % 3600) // 60)
            raise HTTPException(
                status_code=429,
                detail=f"Tu pourras changer ton compte Minecraft dans {hours}h{minutes:02d}m"
            )

    async with httpx.AsyncClient() as client:
        resp = await client.get(f"https://api.mojang.com/users/profiles/minecraft/{body.username}")
    if resp.status_code == 404 or resp.status_code == 204:
        raise HTTPException(status_code=404, detail="Pseudo Minecraft introuvable")
    if resp.status_code != 200:
        raise HTTPException(status_code=502, detail="Impossible de contacter l'API Mojang")

    data = resp.json()
    mc_uuid = data.get("id")
    mc_name = data.get("name", body.username)

    if mc_uuid and len(mc_uuid) == 32:
        mc_uuid = f"{mc_uuid[:8]}-{mc_uuid[8:12]}-{mc_uuid[12:16]}-{mc_uuid[16:20]}-{mc_uuid[20:]}"

    current_user.minecraft_username = mc_name
    current_user.minecraft_uuid = mc_uuid
    current_user.minecraft_linked_at = datetime.now(timezone.utc)
    await db.commit()
    await db.refresh(current_user)
    return current_user


@router.delete("/minecraft", response_model=UserResponse)
async def unlink_minecraft(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    # Le cooldown s'applique aussi à la déliason pour éviter le spam lier/délier
    if current_user.minecraft_linked_at:
        elapsed = datetime.now(timezone.utc) - current_user.minecraft_linked_at.replace(tzinfo=timezone.utc)
        remaining = MC_CHANGE_COOLDOWN - elapsed
        if remaining.total_seconds() > 0:
            hours = int(remaining.total_seconds() // 3600)
            minutes = int((remaining.total_seconds() % 3600) // 60)
            raise HTTPException(
                status_code=429,
                detail=f"Tu pourras modifier ton compte Minecraft dans {hours}h{minutes:02d}m"
            )

    current_user.minecraft_username = None
    current_user.minecraft_uuid = None
    current_user.minecraft_linked_at = None
    await db.commit()
    await db.refresh(current_user)
    return current_user


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
        if discord_email:
            email_result = await db.execute(select(User).where(User.email == discord_email))
            user = email_result.scalar_one_or_none()

        if user:
            user.discord_id = discord_id
            user.discord_username = discord_username
            user.discord_avatar = discord_avatar
        else:
            from datetime import date
            user = User(
                username=discord_username[:20],
                email=discord_email or f"{discord_id}@discord.zenkar.fr",
                date_of_birth=date(2000, 1, 1),
                discord_id=discord_id,
                discord_username=discord_username,
                discord_avatar=discord_avatar,
            )
            db.add(user)

        await db.commit()
        await db.refresh(user)

    token = create_access_token(user.id)
    return RedirectResponse(f"{settings.frontend_url}?token={token}")
