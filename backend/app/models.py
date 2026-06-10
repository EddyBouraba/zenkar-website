import uuid
from datetime import datetime, date
from sqlalchemy import String, Boolean, Date, DateTime, Text, func
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
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), server_default=func.now())
    author_id: Mapped[str | None] = mapped_column(String, nullable=True)
