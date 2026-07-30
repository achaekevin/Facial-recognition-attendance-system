from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.schemas import DepartmentResponse, DepartmentCreate
from app.models.models import DepartmentModel
from app.authorization.rbac import get_current_user, require_hr_admin

router = APIRouter(prefix="/departments", tags=["Departments"])

@router.get("", response_model=List[DepartmentResponse])
async def list_departments(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(select(DepartmentModel))
    return result.scalars().all()

@router.post("", response_model=DepartmentResponse)
async def create_department(
    req: DepartmentCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_hr_admin)
):
    new_dept = DepartmentModel(
        name=req.name,
        code=req.code,
        parent_id=req.parent_id,
        type=req.type,
        manager_name=req.manager_name,
        building_name=req.building_name,
    )
    db.add(new_dept)
    await db.commit()
    await db.refresh(new_dept)
    return new_dept
