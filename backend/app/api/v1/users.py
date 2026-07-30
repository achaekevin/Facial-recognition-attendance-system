from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.schemas import UserResponse, UserCreate
from app.models.models import UserModel
from app.authorization.rbac import get_current_user, require_hr_admin, require_super_admin
from app.core.security import get_password_hash

router = APIRouter(prefix="/users", tags=["Users"])

@router.get("", response_model=List[UserResponse])
async def list_users(
    category: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    stmt = select(UserModel)
    if category and category != "all":
        stmt = stmt.where(UserModel.category == category)
    
    result = await db.execute(stmt)
    return result.scalars().all()

@router.get("/{user_id}", response_model=UserResponse)
async def get_user_by_id(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=44, detail="User not found")
    return user

@router.post("", response_model=UserResponse)
async def create_user(
    req: UserCreate,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(require_hr_admin)
):
    new_user = UserModel(
        name=req.name,
        email=req.email,
        hashed_password=get_password_hash(req.password),
        phone=req.phone,
        role=req.role,
        category=req.category,
        department_id=req.department_id,
        department_name=req.department_name,
        avatar=req.avatar,
        face_image_urls=req.face_image_urls,
        status=req.status,
        accuracy_score=req.accuracy_score,
        employee_or_student_id=req.employee_or_student_id,
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)
    return new_user

@router.post("/{user_id}/status")
async def toggle_user_status(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(require_hr_admin)
):
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    user.status = "suspended" if user.status == "active" else "active"
    await db.commit()
    return {"id": user.id, "name": user.name, "new_status": user.status}

@router.delete("/{user_id}")
async def delete_user(
    user_id: str,
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(require_super_admin)
):
    result = await db.execute(select(UserModel).where(UserModel.id == user_id))
    user = result.scalars().first()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    
    await db.delete(user)
    await db.commit()
    return {"success": True, "message": f"User {user.name} deleted"}
