from fastapi import APIRouter, Depends, Response
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.models import AttendanceModel
from app.authorization.rbac import get_current_user

router = APIRouter(prefix="/reports", tags=["Reports Export"])

@router.get("/export")
async def export_report(
    format: str = "csv",
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(select(AttendanceModel))
    records = result.scalars().all()
    
    csv_lines = ["ID,User,Department,ClockIn,Status,Confidence"]
    for r in records:
        csv_lines.append(f"{r.id},{r.user_name},{r.department},{r.clock_in},{r.status},{r.confidence_score}%")
    
    csv_content = "\n".join(csv_lines)
    return Response(content=csv_content, media_type="text/csv", headers={"Content-Disposition": "attachment; filename=attendance_report.csv"})
