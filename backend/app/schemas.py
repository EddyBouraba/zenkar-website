from datetime import date, datetime
from pydantic import BaseModel, EmailStr, field_validator


class RegisterRequest(BaseModel):
    username: str
    email: EmailStr
    password: str
    date_of_birth: date
    turnstile_token: str

    @field_validator("username")
    @classmethod
    def username_valid(cls, v: str) -> str:
        if not 3 <= len(v) <= 20:
            raise ValueError("Le pseudo doit faire entre 3 et 20 caractères")
        if not v.replace("_", "").isalnum():
            raise ValueError("Le pseudo ne peut contenir que des lettres, chiffres et underscores")
        return v

    @field_validator("password")
    @classmethod
    def password_valid(cls, v: str) -> str:
        if len(v) < 8:
            raise ValueError("Le mot de passe doit faire au moins 8 caractères")
        return v

    @field_validator("date_of_birth")
    @classmethod
    def age_valid(cls, v: date) -> date:
        from datetime import date as dt
        today = dt.today()
        age = today.year - v.year - ((today.month, today.day) < (v.month, v.day))
        if age < 13:
            raise ValueError("Tu dois avoir au moins 13 ans pour t'inscrire")
        return v


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"


class UserResponse(BaseModel):
    id: str
    username: str
    email: str
    discord_id: str | None
    discord_username: str | None
    discord_avatar: str | None
    created_at: datetime

    class Config:
        from_attributes = True
