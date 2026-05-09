from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
import os

from api.routes import router
from core.config import settings

if settings.HF_TOKEN:
    os.environ['HF_TOKEN'] = settings.HF_TOKEN

app = FastAPI(
    title="Table Extraction API",
    description="ML pipeline for detecting and extracting structured table data from images.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=settings.ALLOWED_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(router, prefix="/api/v1")


@app.get("/", tags=["Root"])
async def root():
    return {
        "service": "Table Extraction API",
        "version": "1.0.0",
        "docs": "/docs",
        "health": "/api/v1/health",
    }
