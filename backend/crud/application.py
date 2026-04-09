from motor.motor_asyncio import AsyncIOMotorDatabase
from models.models import Application, ApplicationStage, ApplicationStatus
from bson import ObjectId
from typing import List
from datetime import datetime

async def create_application(db: AsyncIOMotorDatabase, app: Application) -> dict:
    app_data = app.to_dict()
    result = await db.applications.insert_one(app_data)
    return {**app_data, "_id": str(result.inserted_id)}

async def get_application_by_id(db: AsyncIOMotorDatabase, app_id: str) -> dict:
    app = await db.applications.find_one({"_id": ObjectId(app_id)})
    return app

async def list_applications_for_job(db: AsyncIOMotorDatabase, job_id: str) -> List[dict]:
    cursor = db.applications.find({"job_id": job_id})
    apps = await cursor.to_list(length=None)
    return apps

async def list_applications_for_applicant(db: AsyncIOMotorDatabase, applicant_id: str) -> List[dict]:
    cursor = db.applications.find({"applicant_id": applicant_id})
    apps = await cursor.to_list(length=None)
    return apps

async def update_application(db: AsyncIOMotorDatabase, app_id: str, update_data: dict):
    update_data["updated_at"] = datetime.utcnow()
    result = await db.applications.update_one(
        {"_id": ObjectId(app_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0

async def update_application_stage(
    db: AsyncIOMotorDatabase,
    app_id: str,
    new_stage: ApplicationStage,
    feedback: str = None,
    interview_details: dict = None,
    offer_details: dict = None
):
    update_data = {"$set": {"stage": new_stage, "updated_at": datetime.utcnow()}}
    
    if interview_details:
        update_data["$set"]["interview_details"] = interview_details
    if offer_details:
        update_data["$set"]["offer_details"] = offer_details
    
    if feedback:
        feedback_obj = {
            "stage": new_stage,
            "feedback": feedback,
            "date": datetime.utcnow().isoformat(),
            "by": "Recruiter"
        }
        update_data["$push"] = {"feedback_history": feedback_obj}
        # Also set the latest interview feedback string to maintain backward compatibility
        update_data["$set"]["interview_feedback"] = feedback
    
    result = await db.applications.update_one(
        {"_id": ObjectId(app_id)},
        update_data
    )
    return result.modified_count > 0