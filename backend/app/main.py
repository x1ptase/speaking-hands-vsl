"""
main.py — Speaking Hands VSL entry point.

FastAPI Application Entry Point
"""

import sys
import os

# Tắt log từ abseil/TensorFlow
os.environ["TF_CPP_MIN_LOG_LEVEL"] = "3"
os.environ["GLOG_minloglevel"] = "2"

# Ensure the 'app/' directory is on sys.path so that
# 'from app.model import ddnet' resolves correctly.
APP_DIR = os.path.dirname(os.path.abspath(__file__))
if APP_DIR not in sys.path:
    sys.path.insert(0, APP_DIR)

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.config import settings
from app.api.routes import health, recognition

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="Vietnamese Sign Language Recognition API",
    version=settings.VERSION,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.BACKEND_CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(health.router, prefix="/api", tags=["health"])
app.include_router(recognition.router, prefix="/api/recognition", tags=["recognition"])

# Initialize RecognitionService at startup
@app.on_event("startup")
async def startup_event():
    # Calling get_recognition_service() will load the model weights once.
    from app.api.routes.recognition import get_recognition_service
    get_recognition_service()
