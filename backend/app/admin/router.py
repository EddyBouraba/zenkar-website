from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import User, News, NewsReaction, REACTION_EMOJIS
from app.schemas import UserResponse, NewsResponse
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
