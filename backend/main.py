from contextlib import asynccontextmanager
import os
import time
import httpx
from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import Response
from slowapi import _rate_limit_exceeded_handler
from slowapi.errors import RateLimitExceeded
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.limiter import limiter
from app.database import engine, Base, get_db
from app.models import News
from app.auth.router import router as auth_router
from app.news.router import router as news_router
from app.admin.router import router as admin_router
from app.config import settings


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Zenkar API", version="0.1.0", lifespan=lifespan)

app.state.limiter = limiter
app.add_exception_handler(RateLimitExceeded, _rate_limit_exceeded_handler)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://zenkar.fr", "https://www.zenkar.fr", "http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(news_router)
app.include_router(admin_router)

os.makedirs("uploads/news", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/sitemap.xml", response_class=Response)
async def sitemap(db: AsyncSession = Depends(get_db)):
    base = settings.frontend_url.rstrip("/")

    static_urls = [
        ("", "daily",   "1.0"),
        ("/boutique",   "weekly",  "0.9"),
        ("/vote",       "weekly",  "0.8"),
        ("/modes",      "monthly", "0.7"),
        ("/regles",     "monthly", "0.6"),
        ("/classements","weekly",  "0.5"),
        ("/carte",      "weekly",  "0.5"),
        ("/wiki",       "weekly",  "0.5"),
    ]

    result = await db.execute(
        select(News).where(News.published == True).order_by(News.created_at.desc())
    )
    articles = result.scalars().all()

    urls = []
    for path, freq, priority in static_urls:
        urls.append(f"""  <url>
    <loc>{base}{path}</loc>
    <changefreq>{freq}</changefreq>
    <priority>{priority}</priority>
  </url>""")

    for article in articles:
        lastmod = article.created_at.strftime("%Y-%m-%d")
        urls.append(f"""  <url>
    <loc>{base}/news/{article.slug}</loc>
    <lastmod>{lastmod}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>""")

    xml = '<?xml version="1.0" encoding="UTF-8"?>\n'
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n'
    xml += "\n".join(urls)
    xml += "\n</urlset>"

    return Response(content=xml, media_type="application/xml")


_stats_cache: dict = {}
_stats_cache_at: float = 0.0
_STATS_TTL = 60.0
_MC_SERVER = "play.zenkar.net"

@app.get("/stats")
async def stats():
    global _stats_cache, _stats_cache_at
    if time.time() - _stats_cache_at < _STATS_TTL and _stats_cache:
        return _stats_cache
    try:
        async with httpx.AsyncClient(timeout=5.0) as client:
            r = await client.get(f"https://api.mcsrvstat.us/3/{_MC_SERVER}")
            data = r.json()
        online = data.get("online", False)
        _stats_cache = {
            "players_online": data.get("players", {}).get("online", 0) if online else 0,
            "max_players":    data.get("players", {}).get("max", 100)   if online else 100,
            "version":        data.get("version", "1.21.x"),
            "status":         "online" if online else "offline",
            "tps":            20.0,
        }
        _stats_cache_at = time.time()
    except Exception:
        if not _stats_cache:
            _stats_cache = {"players_online": 0, "max_players": 100, "version": "1.21.x", "status": "offline", "tps": 20.0}
    return _stats_cache


