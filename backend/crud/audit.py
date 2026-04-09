from motor.motor_asyncio import AsyncIOMotorDatabase
from models.models import AuditLog
from bson import ObjectId
from typing import List

async def create_audit_log(db: AsyncIOMotorDatabase, log: AuditLog) -> dict:
    log_data = log.to_dict()
    result = await db.audit_logs.insert_one(log_data)
    return {**log_data, "_id": str(result.inserted_id)}

async def get_audit_by_application(db: AsyncIOMotorDatabase, app_id: str) -> List[dict]:
    cursor = db.audit_logs.find({"application_id": app_id})
    logs = await cursor.to_list(length=None)
    return logs