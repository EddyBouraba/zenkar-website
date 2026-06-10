import os, uuid, shutil
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.database import get_db
from app.models import News

UPLOAD_DIR = "uploads/news"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
from app.schemas import NewsCreate, NewsUpdate, NewsResponse
from app.auth.utils import require_admin
from app.models import User

router = APIRouter(prefix="/news", tags=["news"])


@router.get("", response_model=list[NewsResponse])
async def list_news(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(News).where(News.published == True).order_by(News.created_at.desc())
    )
    return result.scalars().all()


@router.get("/{slug}", response_model=NewsResponse)
async def get_news(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(News).where(News.slug == slug, News.published == True))
    news = result.scalar_one_or_none()
    if not news:
        raise HTTPException(status_code=404, detail="Article introuvable")
    return news


@router.post("", response_model=NewsResponse, status_code=status.HTTP_201_CREATED)
async def create_news(
    body: NewsCreate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    existing = await db.execute(select(News).where(News.slug == body.slug))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=409, detail="Ce slug est déjà utilisé")

    news = News(**body.model_dump(), author_id=current_user.id)
    db.add(news)
    await db.commit()
    await db.refresh(news)
    return news


@router.patch("/{news_id}", response_model=NewsResponse)
async def update_news(
    news_id: str,
    body: NewsUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(News).where(News.id == news_id))
    news = result.scalar_one_or_none()
    if not news:
        raise HTTPException(status_code=404, detail="Article introuvable")

    for field, value in body.model_dump(exclude_unset=True).items():
        setattr(news, field, value)

    await db.commit()
    await db.refresh(news)
    return news


@router.delete("/{news_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_news(
    news_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    result = await db.execute(select(News).where(News.id == news_id))
    news = result.scalar_one_or_none()
    if not news:
        raise HTTPException(status_code=404, detail="Article introuvable")

    await db.delete(news)
    await db.commit()


@router.post("/{news_id}/upload-image")
async def upload_image(
    news_id: str,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(require_admin),
):
    if file.content_type not in ALLOWED_TYPES:
        raise HTTPException(status_code=400, detail="Format non supporté (jpg, png, webp, gif)")

    ext = file.filename.rsplit(".", 1)[-1] if "." in file.filename else "jpg"
    filename = f"{uuid.uuid4()}.{ext}"
    path = os.path.join(UPLOAD_DIR, filename)

    with open(path, "wb") as f:
        shutil.copyfileobj(file.file, f)

    image_url = f"/uploads/news/{filename}"

    result = await db.execute(select(News).where(News.id == news_id))
    news = result.scalar_one_or_none()
    if news:
        news.image_url = image_url
        await db.commit()

    return {"image_url": image_url}
