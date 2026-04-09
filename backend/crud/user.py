from typing import List
from motor.motor_asyncio import AsyncIOMotorDatabase, AsyncIOMotorCollection
from models.models import User
from core.security import get_password_hash, verify_password
from bson import ObjectId

async def create_user(db: AsyncIOMotorDatabase, user: User) -> dict:
    user_data = user.to_dict()
    result = await db.users.insert_one(user_data)
    return {**user_data, "_id": str(result.inserted_id)}

async def get_user_by_email(db: AsyncIOMotorDatabase, email: str) -> dict:
    user = await db.users.find_one({"email": email})
    return user

async def get_user_by_id(db: AsyncIOMotorDatabase, user_id: str) -> dict:
    user = await db.users.find_one({"_id": ObjectId(user_id)})
    return user

async def get_users_by_ids(db: AsyncIOMotorDatabase, user_ids: List[str]) -> List[dict]:
    object_ids = [ObjectId(uid) for uid in user_ids]
    cursor = db.users.find({"_id": {"$in": object_ids}})
    return await cursor.to_list(length=len(user_ids))

async def authenticate_user(db: AsyncIOMotorDatabase, email: str, password: str):
    user = await get_user_by_email(db, email)
    if not user or not verify_password(password, user["hashed_password"]):
        return None
    return user

async def update_user(db: AsyncIOMotorDatabase, user_id: str, update_data: dict):
    result = await db.users.update_one(
        {"_id": ObjectId(user_id)},
        {"$set": update_data}
    )
    return result.modified_count > 0