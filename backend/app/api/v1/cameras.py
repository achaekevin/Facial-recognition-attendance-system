from typing import List
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.schemas import CameraResponse, CameraCreate
from app.models.models import CameraModel
from app.authorization.rbac import get_current_user, require_security_officer

router = APIRouter(prefix="/cameras", tags=["Camera Management"])

@router.get("", response_model=List[CameraResponse])
async def list_cameras(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    result = await db.execute(select(CameraModel))
    return result.scalars().all()

@router.post("", response_model=CameraResponse)
async def register_camera(
    req: CameraCreate,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_security_officer)
):
    new_cam = CameraModel(
        name=req.name,
        location=req.location,
        department=req.department,
        stream_url=req.stream_url,
        status=req.status,
        ip_address=req.ip_address,
        resolution=req.resolution,
        fps=req.fps,
        bitrate=req.bitrate,
    )
    db.add(new_cam)
    await db.commit()
    await db.refresh(new_cam)
    return new_cam

@router.delete("/{camera_id}")
async def delete_camera(
    camera_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_security_officer)
):
    result = await db.execute(select(CameraModel).where(CameraModel.id == camera_id))
    cam = result.scalars().first()
    if not cam:
        raise HTTPException(status_code=404, detail="Camera node not found")
    await db.delete(cam)
    await db.commit()
    return {"success": True, "message": f"Camera {cam.name} deleted"}
