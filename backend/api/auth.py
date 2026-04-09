from fastapi import APIRouter, Depends, HTTPException, status
from datetime import timedelta
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.schemas import UserRegister, UserLogin, TokenResponse, UserResponse
from models.models import User, UserRole
from crud.user import create_user, get_user_by_email, authenticate_user
from core.security import get_password_hash, create_access_token
from core.database import get_db
from core.config import settings
from core.dependencies import get_current_user
from crud.user import get_user_by_id

router = APIRouter(prefix="/auth", tags=["authentication"])

@router.post("/register", response_model=UserResponse)
async def register(
    user_data: UserRegister,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Register a new user."""
    existing_user = await get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    
    user = User(
        email=user_data.email,
        full_name=user_data.full_name,
        hashed_password=get_password_hash(user_data.password),
        company_name=user_data.company_name,
        role=user_data.role
    )
    
    created_user = await create_user(db, user)
    return {
        "_id": str(created_user["_id"]),
        "email": created_user["email"],
        "full_name": created_user["full_name"],
        "role": created_user["role"],
        "company_name": created_user.get("company_name"),
        "is_active": created_user["is_active"],
        "created_at": created_user["created_at"],
        "bio": created_user.get("bio", ""),
        "skills": created_user.get("skills", []),
        "phone": created_user.get("phone", None),
        "location": created_user.get("location", None),
        "linkedin": created_user.get("linkedin", None),
        "github": created_user.get("github", None),
        "resume_path": created_user.get("resume_path")
    }

@router.post("/login", response_model=TokenResponse)
async def login(
    credentials: UserLogin,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Login and get access token."""
    user = await authenticate_user(db, credentials.email, credentials.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid email or password"
        )
    
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user["_id"]), "role": user["role"]},
        expires_delta=access_token_expires
    )
    
    return {
        "access_token": access_token,
        "token_type": "bearer",
        "user_id": str(user["_id"]),
        "role": user["role"]
    }

@router.get("/me", response_model=UserResponse)
async def get_me(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get current user details."""
    user = await get_user_by_id(db, current_user["user_id"])
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )
    return {
        "_id": str(user["_id"]),
        "email": user["email"],
        "full_name": user["full_name"],
        "role": user["role"],
        "company_name": user.get("company_name"),
        "is_active": user["is_active"],
        "created_at": user["created_at"],
        "bio": user.get("bio", ""),
        "skills": user.get("skills", []),
        "phone": user.get("phone", None),
        "location": user.get("location", None),
        "linkedin": user.get("linkedin", None),
        "github": user.get("github", None),
        "resume_path": user.get("resume_path")
    }

from models.schemas import UserProfileUpdate
from bson import ObjectId
import os

@router.patch("/profile", response_model=UserResponse)
async def update_profile(
    profile_data: UserProfileUpdate,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update current user profile information."""
    # Use model_dump with exclude_unset=False so we save all provided fields,
    # including empty strings (for clearing values). Only skip truly missing (None) fields.
    raw = profile_data.model_dump()
    update_data = {k: v for k, v in raw.items() if v is not None}
    
    if not update_data:
        raise HTTPException(status_code=400, detail="No data provided to update")
        
    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": update_data}
    )
    
    updated_user = await get_user_by_id(db, current_user["user_id"])
    return {
        "_id": str(updated_user["_id"]),
        "email": updated_user["email"],
        "full_name": updated_user["full_name"],
        "role": updated_user["role"],
        "company_name": updated_user.get("company_name"),
        "is_active": updated_user["is_active"],
        "created_at": updated_user["created_at"],
        "bio": updated_user.get("bio", ""),
        "skills": updated_user.get("skills", []),
        "phone": updated_user.get("phone", None),
        "location": updated_user.get("location", None),
        "linkedin": updated_user.get("linkedin", None),
        "github": updated_user.get("github", None),
        "resume_path": updated_user.get("resume_path")
    }

from fastapi import UploadFile, File
from services.ai_services import ai_service
from bson import ObjectId

@router.post("/profile/resume")
async def upload_profile_resume(
    file: UploadFile = File(...),
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Upload and save resume to user profile."""
    os.makedirs("uploads/profiles", exist_ok=True)
    file_path = f"uploads/profiles/{current_user['user_id']}_{file.filename}"
    
    with open(file_path, "wb") as f:
        contents = await file.read()
        f.write(contents)
    
    # Extract text for future RAG use
    resume_text = ai_service.extract_resume_text(file_path)
    
    await db.users.update_one(
        {"_id": ObjectId(current_user["user_id"])},
        {"$set": {
            "resume_path": file_path,
            "resume_text": resume_text
        }}
    )
    
    return {"message": "Resume uploaded successfully", "resume_path": file_path}