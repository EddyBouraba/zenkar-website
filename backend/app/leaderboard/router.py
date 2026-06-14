import json
import secrets
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.config import settings
from app.database import get_db
from app.models import LbPlayer, LbGuild
from app.schemas import LbSyncPayload, LbPlayerResponse, LbGuildResponse

router = APIRouter(prefix="/leaderboard", tags=["leaderboard"])

VALID_TABS = {"money", "playtime", "kills"}


def _verify_sync_key(x_sync_key: str = Header(default=None)):
    key = settings.leaderboard_sync_key
    if not key:
        raise HTTPException(status_code=503, detail="Sync non configuré côté serveur")
    if not x_sync_key or not secrets.compare_digest(x_sync_key, key):
        raise HTTPException(status_code=401, detail="Clé de synchronisation invalide")


# ── Sync (Minecraft VPS → Site) ───────────────────────────────────────────────

@router.post("/sync", dependencies=[Depends(_verify_sync_key)])
async def sync_leaderboard(
    payload: LbSyncPayload,
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(timezone.utc)

    # Upsert players
    for p in payload.players:
        result = await db.execute(select(LbPlayer).where(LbPlayer.uuid == p.uuid))
        player = result.scalar_one_or_none()
        jobs_str = json.dumps({k: v.model_dump() for k, v in p.jobs.items()}) if p.jobs else None

        if player:
            player.username = p.username
            player.money = p.money
            player.playtime_ticks = p.playtime_ticks
            player.kills = p.kills
            player.deaths = p.deaths
            player.jobs_json = jobs_str
            player.last_synced = now
        else:
            db.add(LbPlayer(
                uuid=p.uuid,
                username=p.username,
                money=p.money,
                playtime_ticks=p.playtime_ticks,
                kills=p.kills,
                deaths=p.deaths,
                jobs_json=jobs_str,
                last_synced=now,
            ))

    # Upsert guilds
    for g in payload.guilds:
        result = await db.execute(select(LbGuild).where(LbGuild.id == g.id))
        guild = result.scalar_one_or_none()

        if guild:
            guild.name = g.name
            guild.tier_level = g.tier_level
            guild.tier_name = g.tier_name
            guild.members_count = g.members_count
            guild.max_members = g.max_members
            guild.leader_uuid = g.leader_uuid
            guild.leader_name = g.leader_name
            guild.balance = g.balance
            guild.last_synced = now
        else:
            db.add(LbGuild(
                id=g.id,
                name=g.name,
                tier_level=g.tier_level,
                tier_name=g.tier_name,
                members_count=g.members_count,
                max_members=g.max_members,
                leader_uuid=g.leader_uuid,
                leader_name=g.leader_name,
                balance=g.balance,
                last_synced=now,
            ))

    await db.commit()
    return {
        "ok": True,
        "synced_players": len(payload.players),
        "synced_guilds": len(payload.guilds),
        "at": now.isoformat(),
    }


# ── Public endpoints ──────────────────────────────────────────────────────────

@router.get("/players")
async def get_players(
    tab: str = "money",
    limit: int = 25,
    db: AsyncSession = Depends(get_db),
):
    if tab not in VALID_TABS:
        raise HTTPException(status_code=400, detail=f"tab invalide — valeurs : {', '.join(VALID_TABS)}")

    limit = min(max(limit, 1), 100)

    order_col = {
        "money":    LbPlayer.money.desc(),
        "playtime": LbPlayer.playtime_ticks.desc(),
        "kills":    LbPlayer.kills.desc(),
    }[tab]

    result = await db.execute(
        select(LbPlayer).order_by(order_col).limit(limit)
    )
    rows = result.scalars().all()

    last_synced = None
    if rows:
        ts_result = await db.execute(select(func.max(LbPlayer.last_synced)))
        last_synced = ts_result.scalar()

    players = []
    for p in rows:
        jobs = json.loads(p.jobs_json) if p.jobs_json else {}
        kdr = round(p.kills / p.deaths, 2) if p.deaths > 0 else float(p.kills)
        players.append({
            "uuid":           p.uuid,
            "username":       p.username,
            "money":          p.money,
            "playtime_ticks": p.playtime_ticks,
            "kills":          p.kills,
            "deaths":         p.deaths,
            "kdr":            kdr,
            "jobs":           jobs,
            "last_synced":    p.last_synced,
        })

    return {"players": players, "last_synced": last_synced}


@router.get("/guilds")
async def get_guilds(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(LbGuild).order_by(
            LbGuild.tier_level.desc(),
            LbGuild.members_count.desc(),
            LbGuild.balance.desc(),
        )
    )
    rows = result.scalars().all()

    last_synced = None
    if rows:
        ts_result = await db.execute(select(func.max(LbGuild.last_synced)))
        last_synced = ts_result.scalar()

    guilds = [
        {
            "id":            g.id,
            "name":          g.name,
            "tier_level":    g.tier_level,
            "tier_name":     g.tier_name,
            "members_count": g.members_count,
            "max_members":   g.max_members,
            "leader_name":   g.leader_name,
            "balance":       g.balance,
            "last_synced":   g.last_synced,
        }
        for g in rows
    ]
    return {"guilds": guilds, "last_synced": last_synced}
