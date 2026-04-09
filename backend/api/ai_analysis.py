from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.schemas import AIAnalysisResponse
from crud.application import get_application_by_id, list_applications_for_job, update_application
from crud.job import get_job_by_id
from services.ai_services import ai_service
from core.dependencies import require_recruiter
from core.database import get_db
from models.models import ApplicationStatus
from datetime import datetime

router = APIRouter(prefix="/analyze", tags=["ai-analysis"])

@router.post("/shortlist/{job_id}")
async def shortlist_candidates(
    job_id: str,
    current_user: dict = Depends(require_recruiter),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """AI-powered semantic search to shortlist candidates for a job."""
    job = await get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Search for similar resumes
    job_description = f"{job['title']} {job['description']} {' '.join(job['requirements'])}"
    candidates = ai_service.search_similar_resumes(job_description, top_k=10)
    
    results = []
    for app_id, score in candidates:
        app = await get_application_by_id(db, app_id)
        if app:
            results.append({
                "application_id": str(app["_id"]),
                "match_score": score,
                "applicant_name": "Unknown",  # Would need to fetch user
                "resume_preview": app["resume_text"][:200]
            })
    
    return results

@router.post("/explain/{app_id}", response_model=AIAnalysisResponse)
async def explain_match(
    app_id: str,
    current_user: dict = Depends(require_recruiter),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Generate AI-powered match explanation for an application."""
    app = await get_application_by_id(db, app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    job = await get_job_by_id(db, app["job_id"])
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Generate explanation
    score, explanation, skill_gaps, questions = ai_service.generate_match_explanation(
        job["description"],
        app["resume_text"]
    )
    
    # Update application with AI analysis
    await update_application(db, app_id, {
        "ai_match_score": score,
        "ai_explanation": explanation,
        "status": ApplicationStatus.SHORTLISTED
    })
    
    return {
        "application_id": app_id,
        "match_score": score,
        "explanation": explanation,
        "interview_questions": questions,
        "skill_gaps": skill_gaps
    }