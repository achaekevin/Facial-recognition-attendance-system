from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.schemas import AttendanceResponse, AttendanceCreate
from app.models.models import AttendanceModel, UserModel
from app.authorization.rbac import get_current_user, require_hr_admin

router = APIRouter(prefix="/attendance", tags=["Attendance Management"])

@router.get("", response_model=List[AttendanceResponse])
async def get_attendance_records(
    date: Optional[str] = None,
    user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stmt = select(AttendanceModel)
    if date:
        stmt = stmt.where(AttendanceModel.date == date)
    if user_id:
        stmt = stmt.where(AttendanceModel.user_id == user_id)
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.post("/manual-override", response_model=AttendanceResponse)
async def manual_attendance_override(
    req: AttendanceCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(require_hr_admin)
):
    new_att = AttendanceModel(
        user_id=req.user_id,
        user_name=req.user_name,
        user_category=req.user_category,
        user_avatar=req.user_avatar,
        department=req.department,
        date=req.date,
        clock_in=req.clock_in,
        clock_out=req.clock_out,
        status=req.status,
        confidence_score=100.0,
        recognition_image_url=req.recognition_image_url,
        camera_name="Admin Manual Override",
        camera_id=req.camera_id or "cam-manual",
        location=req.location or "HR Console",
        device_used=req.device_used,
        notes=req.notes,
        approval_status="approved",
        approved_by=current_user.name
    )
    db.add(new_att)
    await db.commit()
    await db.refresh(new_att)
    return new_att
