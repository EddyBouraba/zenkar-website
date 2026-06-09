from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.database import engine, Base
from app.auth.router import router as auth_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    yield


app = FastAPI(title="Zenkar API", version="0.1.0", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["https://zenkar.fr", "https://www.zenkar.fr"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)


@app.get("/health")
def health():
    return {"status": "ok"}


@app.get("/stats")
def stats():
    return {
        "players_online": 0,
        "max_players": 100,
        "version": "1.21.4",
        "status": "offline",
        "tps": 20.0,
    }


@app.get("/news")
def news():
    return [
        {
            "id": "1",
            "title": "Bienvenue sur Zenkar — Saison 1",
            "date": "2025-06-01",
            "category": "annonce",
            "excerpt": "Le serveur ouvre bientôt ses portes. Prépare-toi pour la Saison 1 !",
            "slug": "bienvenue-saison-1",
        }
    ]
