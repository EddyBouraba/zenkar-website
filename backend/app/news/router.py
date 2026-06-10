import os, uuid, shutil
from fastapi import APIRouter, Depends, HTTPException, Request, status, UploadFile, File
from fastapi.staticfiles import StaticFiles
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func
from app.database import get_db
from app.models import News, NewsReaction, REACTION_EMOJIS

UPLOAD_DIR = "uploads/news"
os.makedirs(UPLOAD_DIR, exist_ok=True)
ALLOWED_TYPES = {"image/jpeg", "image/png", "image/webp", "image/gif"}
from app.schemas import NewsCreate, NewsUpdate, NewsResponse, ReactionsResponse, ReactionCounts
from app.auth.utils import require_admin, get_current_user
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
    news.view_count = (news.view_count or 0) + 1
    await db.commit()
    await db.refresh(news)
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


# ── Similar ───────────────────────────────────────────────────────────────────

@router.get("/{news_id}/similar", response_model=list[NewsResponse])
async def get_similar(news_id: str, db: AsyncSession = Depends(get_db)):
    source = await db.execute(select(News).where(News.id == news_id, News.published == True))
    news = source.scalar_one_or_none()
    if not news:
        raise HTTPException(status_code=404, detail="Article introuvable")

    result = await db.execute(
        select(News)
        .where(News.published == True, News.category == news.category, News.id != news_id)
        .order_by(News.created_at.desc())
        .limit(3)
    )
    return result.scalars().all()


# ── Reactions ─────────────────────────────────────────────────────────────────

async def _get_reactions(news_id: str, user_id: str | None, db: AsyncSession) -> ReactionsResponse:
    rows = await db.execute(
        select(NewsReaction.emoji, func.count().label("n"))
        .where(NewsReaction.news_id == news_id)
        .group_by(NewsReaction.emoji)
    )
    counts = {row.emoji: row.n for row in rows}

    user_reaction = None
    if user_id:
        row = await db.execute(
            select(NewsReaction.emoji).where(
                NewsReaction.news_id == news_id,
                NewsReaction.user_id == user_id,
            )
        )
        user_reaction = row.scalar_one_or_none()

    return ReactionsResponse(
        counts=ReactionCounts(**{k: counts.get(k, 0) for k in ["fire", "heart", "gg", "surprised"]}),
        user_reaction=user_reaction,
    )


@router.get("/{news_id}/reactions", response_model=ReactionsResponse)
async def get_reactions(news_id: str, request: Request, db: AsyncSession = Depends(get_db)):
    user_id = None
    try:
        user = await get_current_user(request, db)
        user_id = user.id
    except Exception:
        pass
    return await _get_reactions(news_id, user_id, db)


@router.post("/{news_id}/reactions/{emoji}", response_model=ReactionsResponse)
async def toggle_reaction(
    news_id: str,
    emoji: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if emoji not in REACTION_EMOJIS:
        raise HTTPException(status_code=400, detail="Emoji invalide")

    news = await db.execute(select(News).where(News.id == news_id, News.published == True))
    if not news.scalar_one_or_none():
        raise HTTPException(status_code=404, detail="Article introuvable")

    existing = await db.execute(
        select(NewsReaction).where(
            NewsReaction.news_id == news_id,
            NewsReaction.user_id == current_user.id,
        )
    )
    reaction = existing.scalar_one_or_none()

    if reaction:
        if reaction.emoji == emoji:
            # toggle off
            await db.delete(reaction)
        else:
            # changer d'emoji
            reaction.emoji = emoji
    else:
        db.add(NewsReaction(news_id=news_id, user_id=current_user.id, emoji=emoji))

    await db.commit()
    return await _get_reactions(news_id, current_user.id, db)
