from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.models.models import UnknownFaceModel
from app.authorization.rbac import require_security_officer

router = APIRouter(prefix="/unknown-faces", tags=["Unknown Faces Incident Resolution"])

@router.get("")
async def list_unknown_faces(
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_security_officer)
):
    result = await db.execute(select(UnknownFaceModel))
    return result.scalars().all()

@router.post("/{face_id}/resolve")
async def resolve_unknown_face(
    face_id: str,
    status: str,
    assigned_user_id: Optional[str] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_security_officer)
):
    result = await db.execute(select(UnknownFaceModel).where(UnknownFaceModel.id == face_id))
    face = result.scalars().first()
    if not face:
        raise HTTPException(status_code=404, detail="Unknown face record not found")
    
    face.status = status
    if assigned_user_id:
        face.assigned_user_id = assigned_user_id
    
    await db.commit()
    return {"id": face.id, "status": face.status, "assigned_user_id": face.assigned_user_id}
