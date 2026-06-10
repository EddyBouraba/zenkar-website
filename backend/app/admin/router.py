import os, uuid, shutil
from fastapi import APIRouter, Depends, HTTPException, UploadFile, File
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

BADGE_UPLOAD_DIR = "uploads/badges"
os.makedirs(BADGE_UPLOAD_DIR, exist_ok=True)
from app.database import get_db
from app.models import User, News, NewsReaction, REACTION_EMOJIS, Badge, UserBadge
from app.schemas import UserResponse, NewsResponse, BadgeCreate, BadgeResponse, UserBadgeResponse
from app.auth.utils import require_admin

VALID_GRADES = {None, 'pionnier', 'veteran', 'conquerant', 'legende', 'vip'}

class SetGradeRequest(BaseModel):
    grade: str | None = None

router = APIRouter(prefix="/admin", tags=["admin"])


@router.get("/news", response_model=list[NewsResponse])
async def list_all_news(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = await db.execute(select(News).order_by(News.created_at.desc()))
    return result.scalars().all()


@router.get("/users", response_model=list[UserResponse])
async def list_users(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    return result.scalars().all()


@router.get("/stats")
async def admin_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    users_count = await db.scalar(select(func.count()).select_from(User))
    news_count = await db.scalar(select(func.count()).select_from(News))
    published_count = await db.scalar(select(func.count()).select_from(News).where(News.published == True))
    return {
        "users_total": users_count,
        "news_total": news_count,
        "news_published": published_count,
    }


@router.get("/reactions-stats")
async def reactions_stats(
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    # tous les articles publiés
    news_rows = await db.execute(
        select(News.id, News.title, News.slug, News.view_count)
        .where(News.published == True)
        .order_by(News.created_at.desc())
    )
    articles: dict[str, dict] = {
        row.id: {
            "id": row.id,
            "title": row.title,
            "slug": row.slug,
            "views": row.view_count or 0,
            "total": 0,
            "counts": {e: 0 for e in REACTION_EMOJIS},
        }
        for row in news_rows
    }

    # réactions groupées par article + emoji
    reaction_rows = await db.execute(
        select(NewsReaction.news_id, NewsReaction.emoji, func.count().label("n"))
        .group_by(NewsReaction.news_id, NewsReaction.emoji)
    )
    for row in reaction_rows:
        if row.news_id in articles:
            articles[row.news_id]["counts"][row.emoji] = row.n
            articles[row.news_id]["total"] += row.n

    return sorted(articles.values(), key=lambda x: x["total"], reverse=True)


# ── Badges ────────────────────────────────────────────────────────────────────

@router.get("/badges", response_model=list[BadgeResponse])
async def list_badges(db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(Badge).order_by(Badge.created_at.desc()))
    return result.scalars().all()


@router.post("/badges", response_model=BadgeResponse, status_code=201)
async def create_badge(body: BadgeCreate, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    existing = await db.execute(select(Badge).where(Badge.name == body.name))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Un badge avec ce nom existe déjà")
    badge = Badge(**body.model_dump())
    db.add(badge)
    await db.commit()
    await db.refresh(badge)
    return badge


@router.post("/badges/{badge_id}/upload-icon")
async def upload_badge_icon(
    badge_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    if file.content_type not in {"image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml"}:
        raise HTTPException(status_code=400, detail="Format non supporté (jpg, png, webp, gif, svg)")
    result = await db.execute(select(Badge).where(Badge.id == badge_id))
    badge = result.scalar_one_or_none()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge introuvable")

    # supprimer l'ancienne icône si elle existe
    if badge.icon_url:
        old_path = badge.icon_url.lstrip("/")
        if os.path.exists(old_path):
            os.remove(old_path)

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "png"
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(BADGE_UPLOAD_DIR, filename)
    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    badge.icon_url = f"/uploads/badges/{filename}"
    await db.commit()
    await db.refresh(badge)
    return {"icon_url": badge.icon_url}


@router.delete("/badges/{badge_id}", status_code=204)
async def delete_badge(badge_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(Badge).where(Badge.id == badge_id))
    badge = result.scalar_one_or_none()
    if not badge:
        raise HTTPException(status_code=404, detail="Badge introuvable")
    await db.delete(badge)
    await db.commit()


@router.get("/users/{user_id}/badges", response_model=list[UserBadgeResponse])
async def get_user_badges(user_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(UserBadge).where(UserBadge.user_id == user_id))
    user_badges = result.scalars().all()
    out = []
    for ub in user_badges:
        badge_row = await db.execute(select(Badge).where(Badge.id == ub.badge_id))
        badge = badge_row.scalar_one_or_none()
        if badge:
            out.append({"badge": badge, "assigned_at": ub.assigned_at})
    return out


@router.post("/users/{user_id}/badges/{badge_id}", status_code=201)
async def assign_badge(user_id: str, badge_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    user = await db.execute(select(User).where(User.id == user_id))
    if not user.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    badge = await db.execute(select(Badge).where(Badge.id == badge_id))
    if not badge.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Badge introuvable")
    existing = await db.execute(select(UserBadge).where(UserBadge.user_id == user_id, UserBadge.badge_id == badge_id))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Badge déjà attribué")
    db.add(UserBadge(user_id=user_id, badge_id=badge_id))
    await db.commit()
    return {"ok": True}


@router.delete("/users/{user_id}/badges/{badge_id}", status_code=204)
async def revoke_badge(user_id: str, badge_id: str, db: AsyncSession = Depends(get_db), _: User = Depends(require_admin)):
    result = await db.execute(select(UserBadge).where(UserBadge.user_id == user_id, UserBadge.badge_id == badge_id))
    ub = result.scalar_one_or_none()
    if not ub:
        raise HTTPException(status_code=404, detail="Attribution introuvable")
    await db.delete(ub)
    await db.commit()


@router.patch("/users/{user_id}/toggle-admin", response_model=UserResponse)
async def toggle_admin(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or user.id == current_user.id:
        raise HTTPException(status_code=400, detail="Action impossible")
    user.is_admin = not user.is_admin
    await db.commit()
    await db.refresh(user)
    return user


@router.patch("/users/{user_id}/grade", response_model=UserResponse)
async def set_grade(
    user_id: str,
    body: SetGradeRequest,
    db: AsyncSession = Depends(get_db),
    _: User = Depends(require_admin),
):
    if body.grade not in VALID_GRADES:
        raise HTTPException(status_code=400, detail="Grade invalide")
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="Utilisateur introuvable")
    user.grade = body.grade
    await db.commit()
    await db.refresh(user)
    return user
