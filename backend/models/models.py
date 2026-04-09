from datetime import datetime
from typing import Optional, List
from enum import Enum
from pydantic import BaseModel, Field, EmailStr

# Enums
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

# Database Models (Motor/MongoDB)
class User:
    def __init__(
        self,
        email: str,
        full_name: str,
        hashed_password: str,
        company_name: Optional[str] = None,
        role: UserRole = UserRole.APPLICANT,
        bio: Optional[str] = "",
        skills: List[str] = None,
        phone: Optional[str] = None,
        location: Optional[str] = None,
        linkedin: Optional[str] = None,
        github: Optional[str] = None,
        resume_path: Optional[str] = None,
        resume_text: Optional[str] = None,
        is_active: bool = True,
        created_at: datetime = None,
        _id: Optional[str] = None,
    ):
        self._id = _id
        self.email = email
        self.full_name = full_name
        self.hashed_password = hashed_password
        self.company_name = company_name
        self.role = role
        self.bio = bio
        self.skills = skills or []
        self.phone = phone
        self.location = location
        self.linkedin = linkedin
        self.github = github
        self.resume_path = resume_path
        self.resume_text = resume_text
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            "email": self.email,
            "full_name": self.full_name,
            "hashed_password": self.hashed_password,
            "company_name": self.company_name,
            "role": self.role,
            "bio": self.bio,
            "skills": self.skills,
            "phone": self.phone,
            "location": self.location,
            "linkedin": self.linkedin,
            "github": self.github,
            "resume_path": self.resume_path,
            "resume_text": self.resume_text,
            "is_active": self.is_active,
            "created_at": self.created_at,
        }

class Job:
    def __init__(
        self,
        title: str,
        description: str,
        requirements: List[str],
        skills: List[str],
        responsibilities: List[str],
        location: str,
        job_type: str,
        department: str,
        posted_by: str,  # User ID
        company_name: str = "Independent",
        is_active: bool = True,
        created_at: datetime = None,
        _id: Optional[str] = None,
    ):
        self._id = _id
        self.title = title
        self.description = description
        self.requirements = requirements
        self.skills = skills or []
        self.responsibilities = responsibilities or []
        self.location = location
        self.job_type = job_type
        self.department = department
        self.posted_by = posted_by
        self.company_name = company_name
        self.is_active = is_active
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            "title": self.title,
            "description": self.description,
            "requirements": self.requirements,
            "skills": self.skills,
            "responsibilities": self.responsibilities,
            "location": self.location,
            "type": self.job_type,
            "department": self.department,
            "posted_by": self.posted_by,
            "company_name": self.company_name,
            "is_active": self.is_active,
            "created_at": self.created_at,
        }

class Application:
    def __init__(
        self,
        job_id: str,
        applicant_id: str,
        resume_path: str,
        resume_text: str,
        stage: ApplicationStage = ApplicationStage.APPLIED,
        status: ApplicationStatus = ApplicationStatus.PENDING,
        ai_match_score: float = 0.0,
        ai_explanation: str = "",
        ai_pros: List[str] = None,
        ai_cons: List[str] = None,
        ai_skill_gaps: List[str] = None,
        ai_interview_questions: List[str] = None,
        interview_feedback: Optional[str] = None,
        interview_details: dict = None,
        offer_details: dict = None,
        feedback_history: List[dict] = None,
        created_at: datetime = None,
        updated_at: datetime = None,
        _id: Optional[str] = None,
    ):
        self._id = _id
        self.job_id = job_id
        self.applicant_id = applicant_id
        self.resume_path = resume_path
        self.resume_text = resume_text
        self.stage = stage
        self.status = status
        self.ai_match_score = ai_match_score
        self.ai_explanation = ai_explanation
        self.ai_pros = ai_pros or []
        self.ai_cons = ai_cons or []
        self.ai_skill_gaps = ai_skill_gaps or []
        self.ai_interview_questions = ai_interview_questions or []
        self.interview_feedback = interview_feedback
        self.interview_details = interview_details or {}
        self.offer_details = offer_details or {}
        self.feedback_history = feedback_history or []
        self.created_at = created_at or datetime.utcnow()
        self.updated_at = updated_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            "job_id": self.job_id,
            "applicant_id": self.applicant_id,
            "resume_path": self.resume_path,
            "resume_text": self.resume_text,
            "stage": self.stage,
            "status": self.status,
            "ai_match_score": self.ai_match_score,
            "ai_explanation": self.ai_explanation,
            "ai_pros": self.ai_pros,
            "ai_cons": self.ai_cons,
            "ai_skill_gaps": self.ai_skill_gaps,
            "ai_interview_questions": self.ai_interview_questions,
            "interview_feedback": self.interview_feedback,
            "interview_details": self.interview_details,
            "offer_details": self.offer_details,
            "feedback_history": self.feedback_history,
            "created_at": self.created_at,
            "updated_at": self.updated_at,
        }

class AuditLog:
    def __init__(
        self,
        application_id: str,
        action: str,
        decision_hash: str,
        blockchain_tx: Optional[str] = None,
        created_at: datetime = None,
        _id: Optional[str] = None,
    ):
        self._id = _id
        self.application_id = application_id
        self.action = action
        self.decision_hash = decision_hash
        self.blockchain_tx = blockchain_tx
        self.created_at = created_at or datetime.utcnow()
    
    def to_dict(self):
        return {
            "application_id": self.application_id,
            "action": self.action,
            "decision_hash": self.decision_hash,
            "blockchain_tx": self.blockchain_tx,
            "created_at": self.created_at,
        }