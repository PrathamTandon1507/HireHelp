from fastapi import APIRouter, Depends, HTTPException, status
from motor.motor_asyncio import AsyncIOMotorDatabase
from typing import List
from core.database import get_db
from core.dependencies import get_current_user
from models.schemas import NotificationResponse
from crud.notification import get_user_notifications, mark_as_read, get_unread_count

router = APIRouter(prefix="/notifications", tags=["notifications"])

@router.get("/", response_model=List[NotificationResponse])
async def list_notifications(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """List recent notifications for the current user."""
    notifications = await get_user_notifications(db, current_user["user_id"])
    return notifications

@router.get("/unread-count")
async def unread_count(
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Get the number of unread notifications."""
    count = await get_unread_count(db, current_user["user_id"])
    return {"unread_count": count}

@router.patch("/{notification_id}/read")
async def read_notification(
    notification_id: str,
    current_user: dict = Depends(get_current_user),
    db: AsyncIOMotorDatabase = Depends(get_db)
):
    """Mark a notification as read."""
    # Note: In a full implementation, we'd verify the notification belongs to current_user
    success = await mark_as_read(db, notification_id)
    if not success:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Notification not found"
        )
    return {"message": "Notification marked as read"}
