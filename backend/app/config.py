from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    database_url: str
    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 60 * 24 * 7  # 7 jours

    frontend_url: str = "https://zenkar.fr"
    env: str = "production"  # "development" en local

    discord_client_id: str = ""
    discord_client_secret: str = ""
    discord_redirect_uri: str = "https://api.zenkar.fr/auth/discord/callback"

    turnstile_secret_key: str = ""

    model_config = {"env_file": ".env", "extra": "ignore"}


settings = Settings()
