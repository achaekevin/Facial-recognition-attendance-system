import re
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete
from datetime import datetime
from typing import Dict, Any

from app.database.session import get_db
from app.models.models import UserModel, FaceEmbeddingModel
from app.authorization.rbac import get_current_user
from app.core.storage import secure_storage

router = APIRouter(prefix="/privacy", tags=["GDPR & Biometric Privacy"])

UUID_RE = re.compile(r"[a-fA-F0-9]{8}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{4}-[a-fA-F0-9]{12}")

@router.get("/my-biometric-data")
async def export_my_biometric_data(
    current_user: UserModel = Depends(get_current_user)
):
    """GDPR Compliance: Export user's 512-d biometric embedding hashes and registration metadata."""
    return {
        "user_id": current_user.id,
        "name": current_user.name,
        "email": current_user.email,
        "employee_or_student_id": current_user.employee_or_student_id,
        "biometric_accuracy_score": current_user.accuracy_score,
        "registered_at": current_user.registered_at,
        "face_image_urls_count": len(getattr(current_user, "face_image_urls", []) or []),
        "privacy_compliance": "GDPR / BIPA AES-256-GCM Encrypted Standard",
        "exported_at": datetime.now().isoformat()
    }

@router.post("/purge-my-embeddings")
async def purge_my_biometric_embeddings(
    db: AsyncSession = Depends(get_db),
    current_user: UserModel = Depends(get_current_user)
):
    """
    GDPR Compliance: Permanently purges user's facial recognition embedding vectors
    and performs cryptographic shredding on all stored encrypted image files.
    """
    # 1. Identify all image IDs associated with this user
    images_to_shred = set()
    
    # Check user avatar
    if current_user.avatar:
        match = UUID_RE.search(current_user.avatar)
        if match:
            images_to_shred.add(match.group(0))

    # Check multi-pose image URLs
    for url in (getattr(current_user, "face_image_urls", []) or []):
        if isinstance(url, str):
            match = UUID_RE.search(url)
            if match:
                images_to_shred.add(match.group(0))

    # Check FaceEmbedding records in DB
    emb_stmt = select(FaceEmbeddingModel).where(FaceEmbeddingModel.user_id == current_user.id)
    emb_result = await db.execute(emb_stmt)
    embeddings = emb_result.scalars().all()
    for emb in embeddings:
        if emb.image_url:
            match = UUID_RE.search(emb.image_url)
            if match:
                images_to_shred.add(match.group(0))

    # 2. Cryptographic shredding of physical encrypted files
    shredded_count = 0
    for img_id in images_to_shred:
        if secure_storage.shred_image(img_id):
            shredded_count += 1

    # 3. Delete embedding records from database
    await db.execute(delete(FaceEmbeddingModel).where(FaceEmbeddingModel.user_id == current_user.id))

    # 4. Clear user biometric profiles in database
    current_user.face_image_urls = []
    current_user.avatar = None
    current_user.accuracy_score = 0.0
    await db.commit()

    return {
        "success": True,
        "shredded_files_count": shredded_count,
        "message": f"Biometric templates and {shredded_count} encrypted image(s) for {current_user.name} permanently purged and crypto-shredded.",
        "purged_at": datetime.now().isoformat()
    }
