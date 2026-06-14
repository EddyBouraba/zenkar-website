import uuid
from datetime import datetime, date
from sqlalchemy import String, Boolean, Date, DateTime, Text, func, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column
from app.database import Base


class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    username: Mapped[str] = mapped_column(String(20), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    password_hash: Mapped[str | None] = mapped_column(String, nullable=True)
    date_of_birth: Mapped[date] = mapped_column(Date, nullable=False)

    discord_id: Mapped[str | None] = mapped_column(String, unique=True, nullable=True)
    discord_username: Mapped[str | None] = mapped_column(String, nullable=True)
    discord_avatar: Mapped[str | None] = mapped_column(String, nullable=True)

    minecraft_username: Mapped[str | None] = mapped_column(String(20), nullable=True)
    minecraft_uuid: Mapped[str | None] = mapped_column(String(36), nullable=True)
    minecraft_linked_at: Mapped[datetime | None] = mapped_column(DateTime(timezone=True), nullable=True)

    grade: Mapped[str | None] = mapped_column(String(20), nullable=True)  # pionnier | veteran | conquerant | legende | vip

    is_active: Mapped[bool] = mapped_column(Boolean, default=True)
    is_admin: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class News(Base):
    __tablename__ = "news"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    slug: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    category: Mapped[str] = mapped_column(String(20), nullable=False)  # annonce | event | update | communaute
    excerpt: Mapped[str] = mapped_column(Text, nullable=False)
    content: Mapped[str | None] = mapped_column(Text, nullable=True)
    image_url: Mapped[str | None] = mapped_column(String, nullable=True)
    published: Mapped[bool] = mapped_column(Boolean, default=True)
    view_count: Mapped[int] = mapped_column(default=0)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    author_id: Mapped[str | None] = mapped_column(String, nullable=True)


REACTION_EMOJIS = {"fire", "heart", "gg", "surprised"}


class Badge(Base):
    __tablename__ = "badges"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    name: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[str | None] = mapped_column(String(255), nullable=True)
    icon: Mapped[str] = mapped_column(String(10), nullable=False)      # emoji fallback
    icon_url: Mapped[str | None] = mapped_column(String, nullable=True)  # image custom uploadée
    color: Mapped[str] = mapped_column(String(30), nullable=False)   # classe tailwind ex: text-gold
    season: Mapped[str | None] = mapped_column(String(30), nullable=True)  # ex: Saison 1
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class UserBadge(Base):
    __tablename__ = "user_badges"
    __table_args__ = (UniqueConstraint("user_id", "badge_id", name="uq_user_badge"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    badge_id: Mapped[str] = mapped_column(String, ForeignKey("badges.id", ondelete="CASCADE"), nullable=False)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token_hash: Mapped[str] = mapped_column(String(64), unique=True, nullable=False)
    expires_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    used: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


# ── Leaderboard ───────────────────────────────────────────────────────────────

class LbPlayer(Base):
    __tablename__ = "lb_players"

    uuid: Mapped[str] = mapped_column(String(36), primary_key=True)
    username: Mapped[str] = mapped_column(String(20), nullable=False)
    money: Mapped[float] = mapped_column(default=0.0)
    playtime_ticks: Mapped[int] = mapped_column(default=0)
    kills: Mapped[int] = mapped_column(default=0)
    deaths: Mapped[int] = mapped_column(default=0)
    jobs_json: Mapped[str | None] = mapped_column(Text, nullable=True)
    last_synced: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class LbGuild(Base):
    __tablename__ = "lb_guilds"

    id: Mapped[str] = mapped_column(String(36), primary_key=True)
    name: Mapped[str] = mapped_column(String(100), nullable=False)
    tier_level: Mapped[int] = mapped_column(default=1)
    tier_name: Mapped[str] = mapped_column(String(30), nullable=False, default="Campement")
    members_count: Mapped[int] = mapped_column(default=1)
    max_members: Mapped[int] = mapped_column(default=10)
    leader_uuid: Mapped[str] = mapped_column(String(36), nullable=False)
    leader_name: Mapped[str] = mapped_column(String(20), nullable=False)
    balance: Mapped[float] = mapped_column(default=0.0)
    last_synced: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())


class NewsReaction(Base):
    __tablename__ = "news_reactions"
    __table_args__ = (UniqueConstraint("news_id", "user_id", "emoji", name="uq_reaction"),)

    id: Mapped[str] = mapped_column(String, primary_key=True, default=lambda: str(uuid.uuid4()))
    news_id: Mapped[str] = mapped_column(String, ForeignKey("news.id", ondelete="CASCADE"), nullable=False)
    user_id: Mapped[str] = mapped_column(String, ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    emoji: Mapped[str] = mapped_column(String(20), nullable=False)  # fire | heart | gg | surprised
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
