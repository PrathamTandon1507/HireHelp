from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.schemas import JobCreate, JobResponse
from models.models import Job
from crud.job import create_job, get_job_by_id, list_jobs, update_job, list_jobs_by_recruiter
from core.dependencies import require_recruiter
from core.database import get_db

router = APIRouter(prefix="/jobs", tags=["jobs"])

@router.get("/my-jobs", response_model=list)
async def get_my_jobs(
    current_user: dict = Depends(require_recruiter),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """List all jobs posted by the logged-in recruiter's company."""
    from crud.job import list_jobs_by_company
    company_name = current_user.get("company_name", "Independent")
    jobs = await list_jobs_by_company(db, company_name)
    return [
        {
            "_id": str(job["_id"]),
            "title": job["title"],
            "description": job["description"],
            "requirements": job["requirements"],
            "department": job.get("department", "General"),
            "location": job.get("location", "Remote"),
            "type": job.get("type", "Full-time"),
            "posted_by": job["posted_by"],
            "company_name": job.get("company_name", "Independent"),
            "skills": job.get("skills", []),
            "responsibilities": job.get("responsibilities", []),
            "status": "active" if job.get("is_active", True) else "closed",
            "is_active": job["is_active"],
            "created_at": job["created_at"]
        }
        for job in jobs
    ]

@router.post("", response_model=JobResponse)
async def post_job(
    job_data: JobCreate,
    current_user: dict = Depends(require_recruiter),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Create a new job posting (Recruiter only)."""
    # RBAC: Recruiters can only post for their own company
    user_company = current_user.get("company_name", "Independent")
    
    if current_user["role"] != "admin":
        if user_company == "Independent" and job_data.company_name:
            # Lazy-fix the recruiter's profile if it was missing the company
            from crud.user import update_user
            from bson import ObjectId
            await update_user(db, current_user["user_id"], {"company_name": job_data.company_name})
            final_company = job_data.company_name
        else:
            final_company = user_company
    else:
        # Admins can post for any company or the provided one
        final_company = job_data.company_name or "Independent"

    job = Job(
        title=job_data.title,
        description=job_data.description,
        requirements=job_data.requirements,
        location=job_data.location,
        job_type=job_data.type,
        department=job_data.department,
        posted_by=current_user["user_id"],
        company_name=final_company,
        skills=job_data.skills,
        responsibilities=job_data.responsibilities
    )
    
    created_job = await create_job(db, job)
    return {
        "_id": str(created_job["_id"]),
        "title": created_job["title"],
        "description": created_job["description"],
        "requirements": created_job["requirements"],
        "posted_by": created_job["posted_by"],
        "company_name": created_job.get("company_name", "Independent"),
        "skills": created_job.get("skills", []),
        "responsibilities": created_job.get("responsibilities", []),
        "status": "active" if created_job.get("is_active", True) else "closed",
        "is_active": created_job["is_active"],
        "created_at": created_job["created_at"]
    }

@router.get("", response_model=list)
async def list_all_jobs(
    skip: int = 0,
    limit: int = 10,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """List all active job postings."""
    jobs = await list_jobs(db, skip, limit)
    return [
        {
            "_id": str(job["_id"]),
            "title": job["title"],
            "description": job["description"],
            "requirements": job["requirements"],
            "department": job.get("department", "General"),
            "location": job.get("location", "Remote"),
            "type": job.get("type", "Full-time"),
            "posted_by": job["posted_by"],
            "company_name": job.get("company_name", "Independent"),
            "skills": job.get("skills", []),
            "responsibilities": job.get("responsibilities", []),
            "status": "active" if job.get("is_active", True) else "closed",
            "is_active": job["is_active"],
            "created_at": job["created_at"]
        }
        for job in jobs
    ]

@router.get("/{job_id}", response_model=JobResponse)
async def get_job(
    job_id: str,
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get a specific job posting."""
    job = await get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Job not found"
        )
    
    return {
        "_id": str(job["_id"]),
        "title": job["title"],
        "description": job["description"],
        "requirements": job["requirements"],
        "posted_by": job["posted_by"],
        "company_name": job.get("company_name", "Independent"),
        "skills": job.get("skills", []),
        "responsibilities": job.get("responsibilities", []),
        "status": "active" if job.get("is_active", True) else "closed",
        "is_active": job["is_active"],
        "created_at": job["created_at"]
    }

@router.put("/{job_id}")
async def update_job_api(
    job_id: str,
    job_data: dict,
    current_user: dict = Depends(require_recruiter),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Update a job posting (Recruiter/Admin only)."""
    job = await get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # RBAC: Only admin or recruiter from same company
    if current_user["role"] != "admin":
        user_company = current_user.get("company_name", "Independent")
        job_company = job.get("company_name", "Independent")
        if user_company != job_company:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only update jobs for your own company"
            )
            
    success = await update_job(db, job_id, job_data)
    if success is None:
        raise HTTPException(status_code=500, detail="Failed to update job")
        
    return {"message": "Job updated successfully"}

@router.delete("/{job_id}")
async def delete_job_api(
    job_id: str,
    current_user: dict = Depends(require_recruiter),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Delete (deactivate) a job posting."""
    job = await get_job_by_id(db, job_id)
    if not job:
        raise HTTPException(status_code=404, detail="Job not found")
        
    # RBAC check
    if current_user["role"] != "admin":
        if current_user.get("company_name") != job.get("company_name"):
            raise HTTPException(status_code=403, detail="Forbidden")
            
    success = await update_job(db, job_id, {"is_active": False})
    return {"message": "Job deactivated"}