import random
from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.schemas import VisitorResponse, VisitorCreate
from app.models.models import VisitorModel
from app.authorization.rbac import get_current_user

router = APIRouter(prefix="/visitors", tags=["Visitors"])

@router.get("", response_model=List[VisitorResponse])
async def list_visitors(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(select(VisitorModel))
    return result.scalars().all()

@router.post("", response_model=VisitorResponse)
async def register_visitor(
    req: VisitorCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    badge = f"VIS-{random.randint(1000, 9999)}"
    new_vis = VisitorModel(
        full_name=req.full_name,
        email=req.email,
        phone=req.phone,
        company=req.company,
        host_user_id=req.host_user_id,
        host_name=req.host_name,
        purpose=req.purpose,
        expected_arrival=req.expected_arrival,
        expected_departure=req.expected_departure,
        face_image_url=req.face_image_url,
        badge_number=badge,
        status="checked_in"
    )
    db.add(new_vis)
    await db.commit()
    await db.refresh(new_vis)
    return new_vis

@router.put("/{visitor_id}/checkout", response_model=VisitorResponse)
async def checkout_visitor(
    visitor_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(select(VisitorModel).where(VisitorModel.id == visitor_id))
    vis = result.scalars().first()
    if not vis:
        raise HTTPException(status_code=404, detail="Visitor record not found")
    
    vis.status = "checked_out"
    await db.commit()
    await db.refresh(vis)
    return vis
