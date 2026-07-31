from typing import List
from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.schemas import SystemNotificationResponse
from app.models.models import NotificationModel
from app.authorization.rbac import get_current_user

router = APIRouter(prefix="/notifications", tags=["Notifications"])

@router.get("", response_model=List[SystemNotificationResponse])
async def list_notifications(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(select(NotificationModel))
    return result.scalars().all()

@router.put("/{notification_id}/read")
async def mark_notification_read(
    notification_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(select(NotificationModel).where(NotificationModel.id == notification_id))
    notif = result.scalars().first()
    if notif:
        notif.is_read = True
        await db.commit()
    return {"success": True}

from app.notifications.multi_channel import multi_channel_notifier

@router.post("/send-multi-channel")
async def send_multi_channel_notification(
    payload: dict,
    current_user = Depends(get_current_user)
):
    result = multi_channel_notifier.dispatch_multi_channel(payload)
    return result
