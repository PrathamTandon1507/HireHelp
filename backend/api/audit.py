from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from models.schemas import AuditResponse
from crud.audit import get_audit_by_application
from core.dependencies import require_recruiter
from core.database import get_db

router = APIRouter(prefix="/audit", tags=["audit"])

@router.get("/{app_id}")
async def get_audit_trail(
    app_id: str,
    current_user: dict = Depends(require_recruiter),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get audit trail for an application."""
    audit_logs = await get_audit_by_application(db, app_id)
    
    return [
        {
            "application_id": log["application_id"],
            "action": log["action"],
            "decision_hash": log["decision_hash"],
            "blockchain_tx": log.get("blockchain_tx"),
            "created_at": log["created_at"]
        }
        for log in audit_logs
    ]