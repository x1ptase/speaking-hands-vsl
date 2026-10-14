from typing import List

class Settings:
    PROJECT_NAME: str = "Speaking Hands VSL API"
    VERSION: str = "1.0.0"
    BACKEND_CORS_ORIGINS: List[str] = [
        "http://localhost:5173", # Frontend dev server
    ]

settings = Settings()
