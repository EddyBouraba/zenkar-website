from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import User, News
from app.schemas import UserResponse, NewsResponse
from app.auth.utils import require_admin

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


@router.patch("/users/{user_id}/toggle-admin", response_model=UserResponse)
async def toggle_admin(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user or user.id == current_user.id:
        from fastapi import HTTPException
        raise HTTPException(status_code=400, detail="Action impossible")
    user.is_admin = not user.is_admin
    await db.commit()
    await db.refresh(user)
    return user
