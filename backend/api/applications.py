from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File
from typing import Optional
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.schemas import ApplicationCreate, ApplicationResponse, WorkflowTransition
from models.models import Application, ApplicationStage, Notification
from crud.notification import create_notification
from crud.application import (
    create_application,
    get_application_by_id,
    list_applications_for_applicant,
    list_applications_for_job,
    update_application_stage
)
from crud.job import get_job_by_id, list_jobs_by_company, list_jobs_by_recruiter
from crud.user import get_user_by_id, get_users_by_ids
from core.dependencies import get_current_user, require_recruiter
from core.database import get_db
from services.ai_services import ai_service
import os
from datetime import datetime

router = APIRouter(prefix="/applications", tags=["applications"])

@router.post("/{job_id}")
async def apply_for_job(
    job_id: str,
    file: Optional[UploadFile] = File(None),
    current_user_info: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Apply for a job (Upload resume or use profile resume)."""
    # Get full user data to check for saved resume
    user = await get_user_by_id(db, current_user_info["user_id"])
    
    file_path = None
    resume_text = ""
    
    if file:
        # Save uploaded resume file
        os.makedirs("uploads", exist_ok=True)
        file_path = f"uploads/{user['_id']}_{job_id}_{file.filename}"
        
        with open(file_path, "wb") as f:
            contents = await file.read()
            f.write(contents)
        
        # Extract resume text
        resume_text = ai_service.extract_resume_text(file_path)
    elif user.get("resume_path"):
        # Use saved resume from profile
        file_path = user["resume_path"]
        resume_text = user.get("resume_text", "")
    else:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="No resume provided. Please upload a resume or save one to your profile."
        )

    job = await get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    # Check if already applied
    existing = await db.applications.find_one({
        "job_id": job_id,
        "applicant_id": str(user["_id"])
    })
    if existing:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="You have already applied for this job."
        )
    
    # Create application
    application = Application(
        job_id=job_id,
        applicant_id=str(user["_id"]),
        resume_path=file_path,
        resume_text=resume_text
    )
    
    created_app = await create_application(db, application)
    
    # Note: Legacy vector store indexing skipped in favor of Advanced RAG (ml/rag_system.py)
    
    # Pre-define safe defaults — ensures return always has valid data even if RAG fails
    analysis_results = {
        "ai_match_score": 0,
        "ai_explanation": "AI Analysis is processing.",
        "ai_pros": [],
        "ai_cons": [],
        "ai_skill_gaps": [],
        "ai_interview_questions": []
    }

    # Trigger Advanced RAG match analysis (FAISS + Groq)
    try:
        from ml.rag_system import analyze_application
        from ml.models import JobModel, CandidateProfile
        
        # Prepare models for RAG
        job_model = JobModel(
            job_id=str(job["_id"]),
            title=job.get("title", ""),
            description=job.get("description", ""),
            company_name=job.get("company_name", "Independent"),
            requirements=job.get("requirements", []),
            skills=job.get("skills", [])
        )
        
        candidate_model = CandidateProfile(
            application_id=str(created_app["_id"]),
            resume_text=resume_text,
            bio=user.get("bio", ""),
            skills=user.get("skills", [])
        )
        
        # Run RAG Analysis
        analysis_results = await analyze_application(
            str(created_app["_id"]),
            job_model,
            candidate_model
        )
        
    except Exception as e:
        print(f"RAG Analysis failed for {created_app['_id']}: {e}")
        analysis_results["ai_explanation"] = "AI Analysis currently unavailable."

    # Always persist whatever we have (success or fallback)
    from crud.application import update_application
    await update_application(db, str(created_app["_id"]), analysis_results)
    
    return {
        "_id": str(created_app["_id"]),
        "job_id": created_app["job_id"],
        "applicant_id": created_app["applicant_id"],
        "stage": created_app["stage"],
        "status": created_app["status"],
        "created_at": created_app["created_at"],
        **analysis_results
    }

@router.get("/applicant/my-applications")
async def my_applications(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all applications for logged-in applicant with job details."""
    applications = await list_applications_for_applicant(db, current_user["user_id"])
    
    # Enrich with job details
    enriched_apps = []
    for app in applications:
        job = await get_job_by_id(db, app["job_id"])
        enriched_apps.append({
            "_id": str(app["_id"]),
            "job_id": app["job_id"],
            "title": job.get("title", "Unknown Job") if job else "Unknown Job",
            "company": job.get("company_name", "Independent") if job else "Independent",
            "department": job.get("department", "Engineering") if job else "Engineering",
            "location": job.get("location", "Remote") if job else "Remote",
            "type": job.get("type", "Full-time") if job else "Full-time",
            "stage": app["stage"],
            "status": app["status"],
            "ai_match_score": app.get("ai_match_score", 0.0),
            "created_at": app["created_at"]
        })
    return enriched_apps

@router.get("/stats/summary")
async def get_application_stats(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Aggregate stats for the dashboard based on user role."""
    if current_user["role"] == "recruiter":
        company_name = current_user.get("company_name", "Independent")
        if company_name == "Independent":
            my_jobs = await list_jobs_by_recruiter(db, current_user["user_id"])
        else:
            my_jobs = await list_jobs_by_company(db, company_name)
            
        job_ids = [str(j["_id"]) for j in my_jobs]
        
        pipeline = [
            {"$match": {"job_id": {"$in": job_ids}}},
            {"$group": {"_id": "$stage", "count": {"$sum": 1}}}
        ]
        results = await db.applications.aggregate(pipeline).to_list(length=10)
        
        stats = {
            "myJobs": len(my_jobs),
            "totalApplications": sum(r["count"] for r in results),
            "byStage": {r["_id"]: r["count"] for r in results},
            "interviews": next((r["count"] for r in results if r["_id"] == "interview"), 0),
            "offers": next((r["count"] for r in results if r["_id"] == "offer"), 0)
        }
    else:
        applications = await list_applications_for_applicant(db, current_user["user_id"])
        stats = {
            "applicationsSubmitted": len(applications),
            "inReview": len([a for a in applications if a["stage"] in ["applied", "screening"]]),
            "interviews": len([a for a in applications if a["stage"] == "interview"]),
            "offers": len([a for a in applications if a["stage"] == "offer"])
        }
    
    return stats

@router.get("/recruiter/my-candidates")
async def get_recruiter_candidates(
    current_user: dict = Depends(require_recruiter),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all candidates for all jobs posted by the recruiter."""
    # We fetch jobs owned by the Recruiter's Company
    company_name = current_user.get("company_name", "Independent")
    if company_name == "Independent":
        my_jobs = await list_jobs_by_recruiter(db, current_user["user_id"])
    else:
        my_jobs = await list_jobs_by_company(db, company_name)
    job_ids = [str(j["_id"]) for j in my_jobs]
    
    cursor = db.applications.find({"job_id": {"$in": job_ids}}).sort("created_at", -1).limit(20)
    applications = await cursor.to_list(length=20)
    
    # Enrich with applicant details
    applicant_ids = [app["applicant_id"] for app in applications]
    applicants = await get_users_by_ids(db, applicant_ids)
    applicant_map = {str(u["_id"]): u for u in applicants}
    
    enriched_apps = []
    for app in applications:
        user = applicant_map.get(app["applicant_id"])
        enriched_apps.append({
            "_id": str(app["_id"]),
            "job_id": app["job_id"],   # ← needed for navigation
            "applicant_id": app["applicant_id"],
            "applicant_name": user["full_name"] if user else "Unknown Applicant",
            "applicant_email": user["email"] if user else "Unknown Email",
            "stage": app["stage"],
            "status": app["status"],
            "ai_match_score": app.get("ai_match_score", 0.0),
            "created_at": app["created_at"]
        })
    return enriched_apps

@router.get("/job/{job_id}")
async def applications_for_job(
    job_id: str,
    current_user: dict = Depends(require_recruiter),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get all applications for a specific job with applicant details (Recruiter only)."""
    
    job = await get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Job not found")
        
    company_name = current_user.get("company_name", "Independent")
    if job.get("company_name", "Independent") != company_name:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You can only view candidates for your own company")
        
    applications = await list_applications_for_job(db, job_id)
    
    # Enrich with applicant details
    applicant_ids = [app["applicant_id"] for app in applications]
    applicants = await get_users_by_ids(db, applicant_ids)
    applicant_map = {str(u["_id"]): u for u in applicants}
    
    enriched_apps = []
    for app in applications:
        user = applicant_map.get(app["applicant_id"])
        # Build skills list: from user profile skills
        user_skills = user.get("skills", []) if user else []
        enriched_apps.append({
            "_id": str(app["_id"]),
            "job_id": app["job_id"],
            "applicant_id": app["applicant_id"],
            "applicant_name": user["full_name"] if user else "Unknown Applicant",
            "applicant_email": user["email"] if user else "Unknown Email",
            "phone": user.get("phone") if user else None,
            "location": user.get("location") if user else None,
            "skills": user_skills,
            "resume_url": app.get("resume_path"),
            "stage": app["stage"],
            "status": app["status"],
            "ai_match_score": app.get("ai_match_score", 0.0),
            "interview_feedback": app.get("interview_feedback"),
            "feedback_history": app.get("feedback_history", []),
            "created_at": app["created_at"]
        })
    return enriched_apps

@router.get("/{app_id}")
async def get_application(
    app_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get full application details including applicant profile data."""
    app = await get_application_by_id(db, app_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # RBAC: Verify user has permission to view this application
    user_id = current_user["user_id"]
    role = current_user["role"]
    
    if role == "applicant" and app["applicant_id"] != user_id:
        raise HTTPException(status_code=403, detail="Unauthorized")
    
    if role == "recruiter":
        job = await get_job_by_id(db, app["job_id"])
        if not job:
            raise HTTPException(status_code=404, detail="Job not found")
        
        user_company = current_user.get("company_name", "Independent")
        job_company = job.get("company_name", "Independent")
        
        if user_company != job_company:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Unauthorized: This application belongs to another company."
            )
            
    user = await get_user_by_id(db, app["applicant_id"])
    job = await get_job_by_id(db, app["job_id"])
    
    return {
        "_id": str(app["_id"]),
        "job_id": app["job_id"],
        "job_title": job.get("title") if job else "Unknown Job",
        "job_company": job.get("company_name", "Independent") if job else "Independent",
        "applicant_id": app["applicant_id"],
        "applicant_name": user["full_name"] if user else "Unknown Applicant",
        "applicant_email": user["email"] if user else "Unknown Email",
        "phone": user.get("phone") if user else None,
        "location": user.get("location") if user else None,
        "bio": user.get("bio", "") if user else "",
        "skills": user.get("skills", []) if user else [],
        "resume_url": app.get("resume_path"),
        "stage": app["stage"],
        "status": app["status"],
        "ai_match_score": app.get("ai_match_score", 0.0),
        "ai_explanation": app.get("ai_explanation", ""),
        "ai_pros": app.get("ai_pros", []),
        "ai_cons": app.get("ai_cons", []),
        "ai_skill_gaps": app.get("ai_skill_gaps", []),
        "ai_interview_questions": app.get("ai_interview_questions", []),
        "interview_feedback": app.get("interview_feedback"),
        "feedback_history": app.get("feedback_history", []),
        "created_at": app["created_at"],
        "updated_at": app["updated_at"],
        "interview_details": app.get("interview_details", {}),
        "offer_details": app.get("offer_details", {})
    }

@router.post("/action/{app_id}/accept-offer")
async def accept_offer(
    app_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Applicant accepts the offer, moving stage to hired."""
    app = await get_application_by_id(db, app_id)
    if not app or str(app["applicant_id"]) != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if str(app.get("stage")).lower() != ApplicationStage.OFFER.value.lower():
        raise HTTPException(status_code=400, detail=f"Cannot accept. This application is in '{app.get('stage')}' stage, not in '{ApplicationStage.OFFER.value}' stage.")
        
    await update_application_stage(db, app_id, ApplicationStage.ACCEPTED, "Candidate accepted the offer")
    
    # Notify recruiter
    job = await get_job_by_id(db, app["job_id"])
    if job:
        notif = Notification(
            recipient_id=job["posted_by"],
            sender_id=current_user["user_id"],
            message=f"Candidate {current_user.get('full_name', 'Candidate')} has ACCEPTED the offer for {job['title']}.",
            type="success",
            link=f"/jobs/{job['_id']}/candidates/{app_id}"
        )
        await create_notification(db, notif)
        
    return {"message": "Offer accepted"}

@router.post("/action/{app_id}/reject-offer")
async def reject_offer(
    app_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Applicant rejects the offer."""
    app = await get_application_by_id(db, app_id)
    if not app or str(app["applicant_id"]) != current_user["user_id"]:
        raise HTTPException(status_code=404, detail="Application not found")
        
    if str(app.get("stage")).lower() != ApplicationStage.OFFER.value.lower():
        raise HTTPException(status_code=400, detail=f"Cannot reject. This application is in '{app.get('stage')}' stage, not in '{ApplicationStage.OFFER.value}' stage.")
        
    await update_application_stage(db, app_id, ApplicationStage.REJECTED, "Candidate rejected the offer")
    return {"message": "Offer rejected"}