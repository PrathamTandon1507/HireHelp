import sys
import os
import logging

# ============================================================================
# MONKEYPATCH: Fix passlib/bcrypt 4.0+ compatibility
# This prevents "Internal Server Error" (500) during login/password verification
# ============================================================================
try:
    import bcrypt
    # passlib looks for bcrypt.__about__.__version__ which was removed in 4.0
    if not hasattr(bcrypt, "__about__"):
        bcrypt.__about__ = type("About", (), {"__version__": bcrypt.__version__})
    print("✓ Passlib/Bcrypt compatibility patch applied")
except ImportError:
    print("⚠️ Bcrypt not found, skipping compatibility patch")

# Set up PYTHONPATH at the earliest possible moment
backend_dir = os.path.dirname(os.path.abspath(__file__))
project_root = os.path.dirname(backend_dir)
if backend_dir not in sys.path:
    sys.path.insert(0, backend_dir)
if project_root not in sys.path:
    sys.path.insert(0, project_root)

from fastapi import FastAPI, Depends
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from contextlib import asynccontextmanager
from motor.motor_asyncio import AsyncIOMotorClient, AsyncIOMotorDatabase
# Core database and config
from core.config import settings
from core.database import db, get_db

from api import auth, jobs, applications, ai_analysis, workflow, audit, notifications
import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create MongoDB client instantly (non-blocking)
    db.client = AsyncIOMotorClient(
        settings.mongodb_url,
        serverSelectionTimeoutMS=5000
    )
    # RAG/AI models are initialized lazily on first request via get_rag_analyzer() fallback
    # DO NOT block startup with model loading — Render will timeout waiting for the port
    print("✓ MongoDB client created")
    print("✓ Server ready — AI models will load on first request")

    yield  # <-- Port opens HERE immediately

    # Shutdown
    if db.client:
        db.client.close()
        print("✓ Disconnected from MongoDB")

app = FastAPI(
    title=settings.app_name,
    description="AI-Assisted Recruitment Platform",
    version="1.0.0",
    lifespan=lifespan
)

# CORS configuration
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(jobs.router)
app.include_router(applications.router)
app.include_router(ai_analysis.router)
app.include_router(workflow.router)
app.include_router(audit.router)
app.include_router(notifications.router)

# Ensure uploads directory exists and mount it
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

@app.get("/health")
async def health(db: AsyncIOMotorDatabase = Depends(get_db)):
    try:
        await db.command("ping")
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        return {"status": "error", "database": str(e)}

@app.get("/")
async def root():
    return {
        "status": "online",
        "message": "Welcome to HireHelp Backend",
        "docs": "/docs",
        "api_hierarchy": {
            "auth": "/auth",
            "jobs": "/jobs",
            "applications": "/applications",
            "ai": "/analyze",
            "workflow": "/workflow",
            "audit": "/audit"
        }
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)