from motor.motor_asyncio import AsyncIOMotorDatabase
from bson import ObjectId
from models.models import Notification
from typing import List, Optional

async def create_notification(db: AsyncIOMotorDatabase, notification: Notification) -> str:
    """Create a new notification."""
    notif_dict = notification.to_dict()
    result = await db.notifications.insert_one(notif_dict)
    return str(result.inserted_id)

async def get_user_notifications(db: AsyncIOMotorDatabase, user_id: str, limit: int = 20) -> List[dict]:
    """Get recent notifications for a specific user."""
    cursor = db.notifications.find({"recipient_id": user_id}).sort("created_at", -1).limit(limit)
    notifications = await cursor.to_list(length=limit)
    
    # Map _id to string
    for notif in notifications:
        notif["_id"] = str(notif["_id"])
    
    return notifications

async def mark_as_read(db: AsyncIOMotorDatabase, notification_id: str) -> bool:
    """Mark a notification as read."""
    result = await db.notifications.update_one(
        {"_id": ObjectId(notification_id)},
        {"$set": {"is_read": True}}
    )
    return result.modified_count > 0

async def get_unread_count(db: AsyncIOMotorDatabase, user_id: str) -> int:
    """Get the count of unread notifications for a user."""
    return await db.notifications.count_documents({"recipient_id": user_id, "is_read": False})
