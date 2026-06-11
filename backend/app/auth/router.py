import secrets
import hashlib
import httpx
from datetime import datetime, timezone, timedelta
from pydantic import BaseModel
from fastapi import APIRouter, Depends, HTTPException, Request, Response, status
from fastapi.responses import RedirectResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, update
from app.database import get_db
from app.models import User, Badge, UserBadge, PasswordResetToken
from app.schemas import RegisterRequest, LoginRequest, TokenResponse, UserResponse, UserBadgeResponse, BadgeResponse, ForgotPasswordRequest, ResetPasswordRequest
from app.auth.utils import hash_password, verify_password, create_access_token, get_current_user, require_admin, COOKIE_NAME
from app.auth.discord import get_discord_oauth_url, exchange_code, get_discord_user
from app.config import settings

from app.limiter import limiter

router = APIRouter(prefix="/auth", tags=["auth"])

MC_CHANGE_COOLDOWN = timedelta(hours=24)
COOKIE_MAX_AGE = settings.access_token_expire_minutes * 60


def set_auth_cookie(response: Response, token: str) -> None:
    is_prod = settings.env == "production"
    response.set_cookie(
        key=COOKIE_NAME,
        value=token,
        max_age=COOKIE_MAX_AGE,
        httponly=True,
        secure=is_prod,
        samesite="lax",
        path="/",
    )


async def verify_turnstile(token: str) -> bool:
    if not settings.turnstile_secret_key:
        return True
    async with httpx.AsyncClient() as client:
        resp = await client.post(
            "https://challenges.cloudflare.com/turnstile/v0/siteverify",
            data={"secret": settings.turnstile_secret_key, "response": token},
        )
        return resp.json().get("success", False)


@router.post("/register", status_code=status.HTTP_201_CREATED)
@limiter.limit("5/hour")
async def register(request: Request, response: Response, body: RegisterRequest, db: AsyncSession = Depends(get_db)):
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
    token = create_access_token(user.id)
    set_auth_cookie(response, token)
    return {"detail": "Compte créé"}


@router.post("/login")
@limiter.limit("20/minute")
async def login(request: Request, response: Response, body: LoginRequest, db: AsyncSession = Depends(get_db)):
    if body.turnstile_token and not await verify_turnstile(body.turnstile_token):
        raise HTTPException(status_code=400, detail="Captcha invalide")
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash or not verify_password(body.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Email ou mot de passe incorrect")

    token = create_access_token(user.id)
    set_auth_cookie(response, token)
    return {"detail": "Connecté"}


@router.get("/me", response_model=UserResponse)
async def me(current_user: User = Depends(get_current_user)):
    return current_user


@router.get("/me/badges", response_model=list[UserBadgeResponse])
async def me_badges(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(UserBadge).where(UserBadge.user_id == current_user.id))
    user_badges = result.scalars().all()
    out = []
    for ub in user_badges:
        badge_row = await db.execute(select(Badge).where(Badge.id == ub.badge_id))
        badge = badge_row.scalar_one_or_none()
        if badge:
            out.append({"badge": badge, "assigned_at": ub.assigned_at})
    return out


@router.post("/logout")
async def logout(response: Response):
    response.delete_cookie(key=COOKIE_NAME, path="/")
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


# ── Password reset ───────────────────────────────────────────────────────────

_RESET_EMAIL_HTML = """<!DOCTYPE html>
<html><head><meta charset="utf-8"></head>
<body style="background:#09080c;color:#c4b5a5;font-family:Arial,sans-serif;margin:0;padding:40px 20px;">
  <div style="max-width:480px;margin:0 auto;">
    <div style="text-align:center;margin-bottom:32px;">
      <span style="font-size:26px;font-weight:900;color:#c9a84c;letter-spacing:6px;">ZENKAR</span>
    </div>
    <div style="background:#110e1a;border:1px solid #2a2438;border-radius:8px;padding:32px;">
      <h2 style="color:#e8c56d;font-size:18px;margin:0 0 12px;">Réinitialisation de mot de passe</h2>
      <p style="font-size:14px;line-height:1.7;color:#8b7d9a;margin:0 0 24px;">
        Bonjour <strong style="color:#c4b5a5;">{username}</strong>,<br><br>
        Tu as demandé à réinitialiser ton mot de passe sur Zenkar.<br>
        Ce lien est valable <strong style="color:#c4b5a5;">1 heure</strong>.
      </p>
      <div style="text-align:center;margin:24px 0;">
        <a href="{reset_url}" style="display:inline-block;padding:12px 32px;background:linear-gradient(135deg,#c9a84c,#e8c56d);color:#09080c;font-weight:700;font-size:13px;text-decoration:none;border-radius:4px;letter-spacing:1px;">
          RÉINITIALISER MON MOT DE PASSE
        </a>
      </div>
      <p style="font-size:12px;color:#6b5f7a;margin:0;line-height:1.6;">
        Si tu n'es pas à l'origine de cette demande, ignore cet email.<br>
        Lien : <a href="{reset_url}" style="color:#c9a84c;word-break:break-all;">{reset_url}</a>
      </p>
    </div>
    <p style="text-align:center;font-size:11px;color:#4a3f5a;margin-top:24px;">
      © 2026 Zenkar &nbsp;·&nbsp; <a href="https://zenkar.fr" style="color:#4a3f5a;">zenkar.fr</a>
    </p>
  </div>
</body></html>"""


async def send_reset_email(to_email: str, username: str, reset_url: str) -> None:
    if not settings.resend_api_key:
        return
    html = _RESET_EMAIL_HTML.format(username=username, reset_url=reset_url)
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            await client.post(
                "https://api.resend.com/emails",
                headers={"Authorization": f"Bearer {settings.resend_api_key}"},
                json={
                    "from": "noreply@zenkar.fr",
                    "to": [to_email],
                    "subject": "Réinitialisation de ton mot de passe — Zenkar",
                    "html": html,
                },
            )
    except Exception:
        pass  # Ne pas bloquer la réponse si l'email échoue


@router.post("/forgot-password")
@limiter.limit("3/hour")
async def forgot_password(request: Request, body: ForgotPasswordRequest, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(User).where(User.email == body.email))
    user = result.scalar_one_or_none()

    if user and user.password_hash:
        # Invalider les tokens existants
        await db.execute(
            update(PasswordResetToken)
            .where(PasswordResetToken.user_id == user.id, PasswordResetToken.used == False)
            .values(used=True)
        )
        raw_token = secrets.token_urlsafe(32)
        token_hash = hashlib.sha256(raw_token.encode()).hexdigest()
        reset_token = PasswordResetToken(
            user_id=user.id,
            token_hash=token_hash,
            expires_at=datetime.now(timezone.utc) + timedelta(hours=1),
        )
        db.add(reset_token)
        await db.commit()
        reset_url = f"{settings.frontend_url}/reinitialiser-mot-de-passe?token={raw_token}"
        await send_reset_email(user.email, user.username, reset_url)

    # Toujours renvoyer 200 pour éviter l'énumération d'emails
    return {"detail": "Si cet email est enregistré, un lien de réinitialisation t'a été envoyé."}


@router.post("/reset-password")
@limiter.limit("10/hour")
async def reset_password(request: Request, body: ResetPasswordRequest, db: AsyncSession = Depends(get_db)):
    token_hash = hashlib.sha256(body.token.encode()).hexdigest()
    result = await db.execute(
        select(PasswordResetToken).where(
            PasswordResetToken.token_hash == token_hash,
            PasswordResetToken.used == False,
        )
    )
    reset_token = result.scalar_one_or_none()

    if not reset_token:
        raise HTTPException(status_code=400, detail="Lien invalide ou déjà utilisé")

    expires = reset_token.expires_at
    if expires.tzinfo is None:
        expires = expires.replace(tzinfo=timezone.utc)
    if expires < datetime.now(timezone.utc):
        raise HTTPException(status_code=400, detail="Lien expiré — fais une nouvelle demande")

    user_result = await db.execute(select(User).where(User.id == reset_token.user_id))
    user = user_result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=400, detail="Utilisateur introuvable")

    user.password_hash = hash_password(body.password)
    reset_token.used = True
    await db.commit()
    return {"detail": "Mot de passe mis à jour"}


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
async def discord_login(response: Response):
    state = secrets.token_urlsafe(16)
    response = RedirectResponse(get_discord_oauth_url(state))
    response.set_cookie(
        key="oauth_state",
        value=state,
        max_age=300,
        httponly=True,
        secure=settings.env == "production",
        samesite="lax",
        path="/",
    )
    return response


@router.get("/discord/callback")
async def discord_callback(request: Request, code: str, state: str, db: AsyncSession = Depends(get_db)):
    stored_state = request.cookies.get("oauth_state")
    if not stored_state or stored_state != state:
        raise HTTPException(status_code=400, detail="State OAuth invalide")

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
    redirect = RedirectResponse(url=settings.frontend_url, status_code=302)
    set_auth_cookie(redirect, token)
    redirect.delete_cookie("oauth_state", path="/")
    return redirect
