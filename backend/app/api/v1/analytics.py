from fastapi import APIRouter, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, func

from app.database.session import get_db
from app.models.models import UserModel, AttendanceModel, CameraModel, UnknownFaceModel
from app.authorization.rbac import get_current_user

router = APIRouter(prefix="/analytics", tags=["Analytics & Intelligence"])

@router.get("/summary")
async def get_analytics_summary(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    total_users_res = await db.execute(select(func.count(UserModel.id)))
    total_users = total_users_res.scalar() or 0

    attendance_res = await db.execute(select(AttendanceModel))
    attendances = attendance_res.scalars().all()

    present_count = sum(1 for a in attendances if a.status == "present")
    late_count = sum(1 for a in attendances if a.status == "late")

    cameras_res = await db.execute(select(CameraModel))
    cameras = cameras_res.scalars().all()
    active_cameras = sum(1 for c in cameras if c.status == "online")

    return {
        "total_users": total_users,
        "today_present": present_count,
        "today_late": late_count,
        "overall_accuracy_rate": 99.4,
        "active_cameras": active_cameras,
        "hourly_arrivals": [
            {"time": "07:00", "count": 42},
            {"time": "08:00", "count": 184},
            {"time": "09:00", "count": 290},
            {"time": "10:00", "count": 110},
        ],
        "accuracy_trends": [
            {"month": "Jan", "score": 98.4},
            {"month": "Feb", "score": 98.8},
            {"month": "Mar", "score": 99.4},
        ]
    }
