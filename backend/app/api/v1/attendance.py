from typing import List, Optional
from datetime import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.schemas import AttendanceResponse, AttendanceCreate, MobileGeofenceCheckinRequest, MobileGeofenceCheckinResponse
from app.models.models import AttendanceModel, UserModel
from app.authorization.rbac import get_current_user, require_hr_admin
from app.attendance.geofence import geofence_engine

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

@router.post("/mobile-checkin", response_model=MobileGeofenceCheckinResponse)
async def mobile_geofence_checkin(
    req: MobileGeofenceCheckinRequest,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    is_inside, dist, msg = geofence_engine.verify_checkin_location(req.latitude, req.longitude)
    
    if not is_inside:
        return MobileGeofenceCheckinResponse(
            success=False,
            status="denied_geofence",
            distance_meters=dist,
            message=msg,
            timestamp=datetime.now().isoformat()
        )

    # Log mobile attendance checkin record
    today = datetime.now().strftime("%Y-%m-%d")
    now_time = datetime.now().strftime("%H:%M:%S")

    att_record = AttendanceModel(
        user_id=current_user.id,
        user_name=current_user.name,
        user_category=current_user.category,
        user_avatar=current_user.avatar,
        department=current_user.department_name or "General",
        date=today,
        clock_in=now_time,
        status="present",
        confidence_score=99.2,
        recognition_image_url=req.image_data if len(req.image_data) < 200 else "",
        camera_name="Mobile GPS Check-in",
        camera_id="cam-mobile-gps",
        location=f"GPS Geofence ({dist}m)",
        device_used="Smartphone Mobile Web",
        notes=msg,
        approval_status="approved"
    )
    db.add(att_record)
    await db.commit()

    return MobileGeofenceCheckinResponse(
        success=True,
        status="present",
        distance_meters=dist,
        message=f"Mobile Check-in Verified! {msg}",
        timestamp=datetime.now().isoformat()
    )
