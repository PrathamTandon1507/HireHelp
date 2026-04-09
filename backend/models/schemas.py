from pydantic import BaseModel, EmailStr, Field
from typing import Optional, List
from datetime import datetime
from enum import Enum

class UserRole(str, Enum):
    ADMIN = "admin"
    RECRUITER = "recruiter"
    APPLICANT = "applicant"

class ApplicationStage(str, Enum):
    APPLIED = "applied"
    SCREENING = "screening"
    INTERVIEW = "interview"
    OFFER = "offer"
    ACCEPTED = "accepted"
    REJECTED = "rejected"

class ApplicationStatus(str, Enum):
    PENDING = "pending"
    SHORTLISTED = "shortlisted"
    REJECTED = "rejected"
    ACCEPTED = "accepted"

# Auth Schemas
class UserRegister(BaseModel):
    email: EmailStr
    full_name: str
    password: str
    company_name: Optional[str] = None
    role: UserRole = UserRole.APPLICANT

class UserLogin(BaseModel):
    email: EmailStr
    password: str

class TokenResponse(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user_id: str
    role: UserRole

class UserResponse(BaseModel):
    id: str = Field(alias="_id")
    email: EmailStr
    full_name: str
    role: UserRole
    company_name: Optional[str] = None
    bio: Optional[str] = ""
    skills: List[str] = []
    resume_path: Optional[str] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None
    is_active: bool
    created_at: datetime
    
    model_config = {"populate_by_name": True}

class UserProfileUpdate(BaseModel):
    full_name: Optional[str] = None
    bio: Optional[str] = None
    skills: Optional[List[str]] = None
    phone: Optional[str] = None
    location: Optional[str] = None
    linkedin: Optional[str] = None
    github: Optional[str] = None


# Job Schemas
class JobCreate(BaseModel):
    title: str
    description: str
    requirements: List[str]
    skills: List[str]
    responsibilities: List[str] = []
    location: str
    type: str
    department: str
    company_name: Optional[str] = None

class JobResponse(BaseModel):
    id: str = Field(alias="_id")
    title: str
    description: str
    requirements: List[str]
    skills: List[str] = []
    responsibilities: List[str] = []
    company_name: str
    location: Optional[str] = "Remote"
    type: Optional[str] = "Full-time"
    department: Optional[str] = "General"
    posted_by: str
    is_active: bool
    created_at: datetime
    
    model_config = {"populate_by_name": True}

# Application Schemas
class ApplicationCreate(BaseModel):
    job_id: str

class ApplicationResponse(BaseModel):
    id: str = Field(alias="_id")
    job_id: str
    applicant_id: str
    applicant_name: Optional[str] = None
    applicant_email: Optional[str] = None
    resume_url: Optional[str] = None
    stage: ApplicationStage
    status: ApplicationStatus
    ai_match_score: float
    ai_explanation: str
    ai_pros: List[str] = []
    ai_cons: List[str] = []
    ai_skill_gaps: List[str] = []
    ai_interview_questions: List[str] = []
    interview_feedback: Optional[str] = None
    interview_details: Optional[dict] = {}
    offer_details: Optional[dict] = {}
    feedback_history: List[dict] = []
    created_at: datetime
    updated_at: datetime
    
    model_config = {"populate_by_name": True}

class WorkflowTransition(BaseModel):
    application_id: str
    new_stage: ApplicationStage
    feedback: Optional[str] = None
    interview_details: Optional[dict] = None
    offer_details: Optional[dict] = None

class AIAnalysisResponse(BaseModel):
    application_id: str
    match_score: float
    explanation: str
    interview_questions: List[str]
    skill_gaps: List[str]

class AuditResponse(BaseModel):
    application_id: str
    decision_hash: str
    blockchain_tx: Optional[str]
    created_at: datetime