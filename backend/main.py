import sys
import os

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

from api import auth, jobs, applications, ai_analysis, workflow, audit
import asyncio

import asyncio

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Create MongoDB client instantly (non-blocking)
    db.client = AsyncIOMotorClient(
        settings.mongodb_url,
        serverSelectionTimeoutMS=5000
    )
    print("✓ MongoDB client created")
    print("✓ RAG system will lazy-load on first request")

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

# Ensure uploads directory exists and mount it
os.makedirs("uploads", exist_ok=True)
app.mount("/uploads", StaticFiles(directory="uploads"), name="uploads")

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