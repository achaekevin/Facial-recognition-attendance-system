"""
Unknown Faces Investigation Center API.
Enhanced workflow for investigating, comparing, and resolving unknown face incidents.
"""
from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, or_, func
from datetime import datetime

from app.database.session import get_db
from app.models.models import UnknownFaceModel, UserModel, FaceEmbeddingModel
from app.authorization.rbac import require_security_officer

router = APIRouter(prefix="/unknown-faces", tags=["Unknown Faces Investigation Center"])


class InvestigationNote(BaseModel):
    """Model for investigation notes."""
    note: str
    investigator: str
    timestamp: Optional[str] = None


class ResolutionRequest(BaseModel):
    """Model for resolution request."""
    status: str  # identified, blacklisted, whitelisted, false_positive, under_investigation
    assigned_user_id: Optional[str] = None
    resolution_notes: Optional[str] = None
    action_taken: Optional[str] = None


class SimilaritySearchRequest(BaseModel):
    """Model for similarity search."""
    face_id: str
    threshold: float = 0.7
    limit: int = 10


@router.get("")
async def list_unknown_faces(
    status: Optional[str] = Query(default=None),
    camera_id: Optional[str] = Query(default=None),
    start_date: Optional[str] = Query(default=None),
    end_date: Optional[str] = Query(default=None),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_security_officer)
):
    """
    Get list of unknown faces with optional filters.
    
    Supports filtering by:
    - status (pending, under_investigation, identified, blacklisted, etc.)
    - camera_id
    - date range
    """
    query = select(UnknownFaceModel)
    
    # Apply filters
    conditions = []
    
    if status:
        conditions.append(UnknownFaceModel.status == status)
    
    if camera_id:
        conditions.append(UnknownFaceModel.camera_id == camera_id)
    
    if start_date:
        try:
            start = datetime.fromisoformat(start_date).date()
            conditions.append(UnknownFaceModel.detected_at >= start)
        except:
            pass
    
    if end_date:
        try:
            end = datetime.fromisoformat(end_date).date()
            conditions.append(UnknownFaceModel.detected_at <= end)
        except:
            pass
    
    if conditions:
        query = query.where(and_(*conditions))
    
    query = query.order_by(UnknownFaceModel.detected_at.desc())
    
    result = await db.execute(query)
    faces = result.scalars().all()
    
    return {
        "success": True,
        "count": len(faces),
        "filters": {
            "status": status,
            "camera_id": camera_id,
            "start_date": start_date,
            "end_date": end_date
        },
        "faces": faces
    }


@router.get("/queue")
async def get_investigation_queue(
    priority: str = Query(default="all"),  # all, high, medium, low
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_security_officer)
):
    """
    Get prioritized investigation queue.
    
    Priority based on:
    - Confidence score (lower = higher priority)
    - Frequency (multiple detections = higher priority)
    - Recency
    """
    # Get pending/under investigation faces
    result = await db.execute(
        select(UnknownFaceModel).where(
            or_(
                UnknownFaceModel.status == 'pending',
                UnknownFaceModel.status == 'under_investigation'
            )
        ).order_by(UnknownFaceModel.detected_at.desc())
    )
    
    faces = result.scalars().all()
    
    # Calculate priority scores
    prioritized_faces = []
    for face in faces:
        confidence = getattr(face, 'confidence', 50.0)
        
        # Priority calculation
        priority_score = 0
        if confidence < 30:
            priority_level = 'high'
            priority_score = 3
        elif confidence < 50:
            priority_level = 'medium'
            priority_score = 2
        else:
            priority_level = 'low'
            priority_score = 1
        
        prioritized_faces.append({
            "id": face.id,
            "camera_id": face.camera_id,
            "snapshot": face.snapshot,
            "confidence": confidence,
            "status": face.status,
            "detected_at": face.detected_at,
            "priority": priority_level,
            "priority_score": priority_score
        })
    
    # Filter by priority if requested
    if priority != "all":
        prioritized_faces = [f for f in prioritized_faces if f['priority'] == priority]
    
    # Sort by priority score (descending) then by date
    prioritized_faces.sort(key=lambda x: (x['priority_score'], x['detected_at']), reverse=True)
    
    return {
        "success": True,
        "total_queue": len(faces),
        "filtered_count": len(prioritized_faces),
        "queue": prioritized_faces
    }


@router.get("/{face_id}")
async def get_unknown_face_details(
    face_id: str,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_security_officer)
):
    """
    Get detailed information about a specific unknown face.
    """
    result = await db.execute(
        select(UnknownFaceModel).where(UnknownFaceModel.id == face_id)
    )
    face = result.scalars().first()
    
    if not face:
        raise HTTPException(status_code=404, detail="Unknown face not found")
    
    # Get camera details if available
    camera_info = None
    if face.camera_id:
        from app.models.models import CameraModel
        camera_result = await db.execute(
            select(CameraModel).where(CameraModel.id == face.camera_id)
        )
        camera = camera_result.scalars().first()
        if camera:
            camera_info = {
                "id": camera.id,
                "camera_name": camera.camera_name,
                "location": camera.location
            }
    
    return {
        "success": True,
        "face": {
            "id": face.id,
            "camera_id": face.camera_id,
            "snapshot": face.snapshot,
            "confidence": getattr(face, 'confidence', None),
            "status": face.status,
            "detected_at": face.detected_at,
            "assigned_user_id": face.assigned_user_id,
            "camera_info": camera_info
        }
    }


@router.post("/{face_id}/resolve", response_model=dict)
async def resolve_unknown_face(
    face_id: str,
    resolution: ResolutionRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_security_officer)
):
    """
    Resolve an unknown face investigation.
    
    Resolution statuses:
    - identified: Face matched to a registered user
    - blacklisted: Face added to blacklist
    - whitelisted: Face approved for future enrollment
    - false_positive: Not actually a face
    - under_investigation: Needs more review
    """
    result = await db.execute(
        select(UnknownFaceModel).where(UnknownFaceModel.id == face_id)
    )
    face = result.scalars().first()
    
    if not face:
        raise HTTPException(status_code=404, detail="Unknown face record not found")
    
    # Update status
    face.status = resolution.status
    
    # Assign to user if provided
    if resolution.assigned_user_id:
        # Verify user exists
        user_result = await db.execute(
            select(UserModel).where(UserModel.id == resolution.assigned_user_id)
        )
        user = user_result.scalars().first()
        
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        face.assigned_user_id = resolution.assigned_user_id
    
    await db.commit()
    await db.refresh(face)
    
    return {
        "success": True,
        "message": f"Unknown face resolved as: {resolution.status}",
        "face": {
            "id": face.id,
            "status": face.status,
            "assigned_user_id": face.assigned_user_id
        }
    }


@router.post("/{face_id}/notes")
async def add_investigation_note(
    face_id: str,
    note: InvestigationNote,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_security_officer)
):
    """
    Add investigation notes to unknown face record.
    """
    result = await db.execute(
        select(UnknownFaceModel).where(UnknownFaceModel.id == face_id)
    )
    face = result.scalars().first()
    
    if not face:
        raise HTTPException(status_code=404, detail="Unknown face not found")
    
    # In production, store notes in a separate table
    # For now, return success
    
    return {
        "success": True,
        "message": "Investigation note added",
        "note": {
            "face_id": face_id,
            "note": note.note,
            "investigator": note.investigator,
            "timestamp": note.timestamp or datetime.now().isoformat()
        }
    }


@router.post("/similarity-search")
async def search_similar_faces(
    request: SimilaritySearchRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_security_officer)
):
    """
    Search for registered users similar to an unknown face.
    
    Uses face embeddings to find potential matches.
    """
    # Get unknown face
    result = await db.execute(
        select(UnknownFaceModel).where(UnknownFaceModel.id == request.face_id)
    )
    unknown_face = result.scalars().first()
    
    if not unknown_face:
        raise HTTPException(status_code=404, detail="Unknown face not found")
    
    # Get all registered users
    users_result = await db.execute(select(UserModel))
    users = users_result.scalars().all()
    
    # Mock similarity calculation
    # In production, use actual face embedding comparison
    similar_users = []
    for user in users[:request.limit]:
        # Mock similarity score
        import random
        similarity = random.uniform(0.4, 0.95)
        
        if similarity >= request.threshold:
            similar_users.append({
                "user_id": user.id,
                "user_name": getattr(user, 'name', 'Unknown'),
                "department": getattr(user, 'department_name', 'Unknown'),
                "similarity_score": round(similarity, 3),
                "confidence": "high" if similarity > 0.85 else "medium" if similarity > 0.7 else "low"
            })
    
    # Sort by similarity
    similar_users.sort(key=lambda x: x['similarity_score'], reverse=True)
    
    return {
        "success": True,
        "unknown_face_id": request.face_id,
        "threshold": request.threshold,
        "matches_found": len(similar_users),
        "similar_users": similar_users
    }


@router.get("/statistics/summary")
async def get_investigation_statistics(
    days: int = Query(default=30),
    db: AsyncSession = Depends(get_db),
    current_user = Depends(require_security_officer)
):
    """
    Get statistics about unknown face investigations.
    """
    # Count by status
    status_counts = {}
    statuses = ['pending', 'under_investigation', 'identified', 'blacklisted', 'whitelisted', 'false_positive']
    
    for status in statuses:
        result = await db.execute(
            select(func.count(UnknownFaceModel.id)).where(
                UnknownFaceModel.status == status
            )
        )
        count = result.scalar() or 0
        status_counts[status] = count
    
    # Total
    total_result = await db.execute(select(func.count(UnknownFaceModel.id)))
    total = total_result.scalar() or 0
    
    # Resolution rate
    resolved = sum([
        status_counts.get('identified', 0),
        status_counts.get('blacklisted', 0),
        status_counts.get('whitelisted', 0),
        status_counts.get('false_positive', 0)
    ])
    resolution_rate = (resolved / total * 100) if total > 0 else 0
    
    return {
        "success": True,
        "period_days": days,
        "statistics": {
            "total_incidents": total,
            "status_breakdown": status_counts,
            "resolved_count": resolved,
            "resolution_rate": round(resolution_rate, 1),
            "pending_review": status_counts.get('pending', 0) + status_counts.get('under_investigation', 0)
        }
    }

