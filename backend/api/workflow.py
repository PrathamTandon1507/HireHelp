from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.schemas import WorkflowTransition
from crud.application import get_application_by_id, update_application_stage
from crud.job import get_job_by_id
from crud.audit import create_audit_log
from services.workflow import workflow_validator
from services.blockchain import blockchain_service
from models.models import AuditLog
from core.dependencies import require_recruiter
from core.database import get_db

router = APIRouter(prefix="/workflow", tags=["workflow"])

@router.patch("/transition")
async def transition_stage(
    transition: WorkflowTransition,
    current_user: dict = Depends(require_recruiter),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Move a candidate to a new stage (verified by Z3)."""
    app = await get_application_by_id(db, transition.application_id)
    if not app:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Application not found"
        )
    
    # RBAC: Verify company match
    if current_user["role"] != "admin":
        job = await get_job_by_id(db, app["job_id"])
        if not job:
            raise HTTPException(status_code=404, detail="Job associated with application not found")
        
        user_company = current_user.get("company_name", "Independent")
        job_company = job.get("company_name", "Independent")
        
        if user_company != job_company:
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="You can only manage candidates for jobs within your company"
            )
    if app["stage"] == transition.new_stage:
        if not transition.feedback:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Cannot transition to the same stage without providing feedback."
            )
        # Skip Z3 validation and audit for pure feedback updates
        await update_application_stage(
            db,
            transition.application_id,
            transition.new_stage,
            transition.feedback,
            transition.interview_details,
            transition.offer_details
        )
        return {
            "message": "Feedback added successfully",
            "application_id": transition.application_id,
            "new_stage": transition.new_stage
        }
    
    # Validate transition using Z3
    is_valid, message = workflow_validator.validate_transition(
        current_stage=app["stage"],
        new_stage=transition.new_stage,
        has_interview_feedback=bool(app.get("interview_feedback")),
        has_screening_passed=True # Implicitly true as the recruiter initiates this manually
    )
    
    if not is_valid:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=message
        )
    
    # Update application stage
    await update_application_stage(
        db,
        transition.application_id,
        transition.new_stage,
        transition.feedback,
        transition.interview_details,
        transition.offer_details
    )
    
    # Generate audit log
    decision_hash = blockchain_service.generate_decision_hash(
        transition.application_id,
        str(transition.new_stage),
        app.get("ai_match_score", 0.0),
        {"previous_stage": str(app["stage"]), "feedback": transition.feedback}
    )
    
    blockchain_tx = None
    if transition.new_stage == "offer":
        blockchain_tx = blockchain_service.store_hash_on_blockchain(
            decision_hash, transition.application_id
        )
    
    audit_log = AuditLog(
        application_id=transition.application_id,
        action=f"Transitioned from {app['stage']} to {transition.new_stage}",
        decision_hash=decision_hash,
        blockchain_tx=blockchain_tx
    )
    
    await create_audit_log(db, audit_log)
    
    return {
        "message": "Transition successful",
        "application_id": transition.application_id,
        "new_stage": transition.new_stage,
        "audit_hash": decision_hash,
        "blockchain_tx": blockchain_tx
    }