from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.schemas import LeaveResponse, LeaveCreate
from app.models.models import LeaveModel
from app.authorization.rbac import get_current_user, require_hr_admin

router = APIRouter(prefix="/leave", tags=["Leave Requests"])

@router.get("", response_model=List[LeaveResponse])
async def list_leaves(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(select(LeaveModel))
    return result.scalars().all()

@router.post("", response_model=LeaveResponse)
async def request_leave(
    req: LeaveCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    new_leave = LeaveModel(
        user_id=req.user_id,
        user_name=req.user_name,
        user_avatar=req.user_avatar,
        department=req.department,
        leave_type=req.leave_type,
        start_date=req.start_date,
        end_date=req.end_date,
        total_days=req.total_days,
        reason=req.reason,
        status="pending"
    )
    db.add(new_leave)
    await db.commit()
    await db.refresh(new_leave)
    return new_leave

@router.put("/{leave_id}/status", response_model=LeaveResponse)
async def update_leave_status(
    leave_id: str,
    status: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_hr_admin)
):
    result = await db.execute(select(LeaveModel).where(LeaveModel.id == leave_id))
    leave = result.scalars().first()
    if not leave:
        raise HTTPException(status_code=404, detail="Leave request not found")
    
    leave.status = status
    leave.approved_by = current_user.name
    await db.commit()
    await db.refresh(leave)
    return leave
