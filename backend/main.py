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
    # Startup: Initialize DB Client with timeout
    db.client = AsyncIOMotorClient(
        settings.mongodb_url,
        serverSelectionTimeoutMS=5000
    )
    
    # Test connection with strict timeout
    try:
        # Avoid hanging forever if network is slow
        await asyncio.wait_for(db.client.admin.command('ping'), timeout=5.0)
        print("✓ Connected to MongoDB")
    except Exception as e:
        print(f"✗ MongoDB Connection Warning: {e}")
        # We continue to allow the server to start
    
    # Initialize RAG System (FAISS + Groq)
    try:
        from ml.rag_system import initialize_rag, sync_rag_with_db
        initialize_rag(settings.groq_api_key)
        print("✓ RAG System Initialized (FAISS + Groq)")
        
        # Sync index with MongoDB (handles Render restarts)
        db_instance = db.client[settings.database_name]
        indexed_count = await sync_rag_with_db(db_instance)
        if indexed_count > 0:
            print(f"✓ RAG Sync: {indexed_count} candidates cached in memory")
    except Exception as e:
        print(f"✗ RAG Initialization/Sync Error: {e}")
    
    yield
    
    # Shutdown: Close DB Client
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