from motor.motor_asyncio import AsyncIOMotorDatabase
from models.models import Job
from bson import ObjectId
from typing import List

async def create_job(db: AsyncIOMotorDatabase, job: Job) -> dict:
    job_data = job.to_dict()
    result = await db.jobs.insert_one(job_data)
    return {**job_data, "_id": str(result.inserted_id)}

async def get_job_by_id(db: AsyncIOMotorDatabase, job_id: str) -> dict:
    job = await db.jobs.find_one({"_id": ObjectId(job_id)})
    return job

async def list_jobs(db: AsyncIOMotorDatabase, skip: int = 0, limit: int = 10) -> List[dict]:
    cursor = db.jobs.find({"is_active": True}).sort("created_at", -1).skip(skip).limit(limit)
    jobs = await cursor.to_list(length=limit)
    return jobs

async def list_jobs_by_recruiter(db: AsyncIOMotorDatabase, recruiter_id: str) -> List[dict]:
    cursor = db.jobs.find({"posted_by": recruiter_id}).sort("created_at", -1)
    return await cursor.to_list(length=100)

async def list_jobs_by_company(db: AsyncIOMotorDatabase, company_name: str) -> List[dict]:
    cursor = db.jobs.find({"company_name": company_name}).sort("created_at", -1)
    return await cursor.to_list(length=100)

async def update_job(db: AsyncIOMotorDatabase, job_id: str, update_data: dict):
    result = await db.jobs.update_one(
        {"_id": ObjectId(job_id)},
        {"$set": update_data}
    )
    return result.matched_count > 0