import datetime
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select

from app.database.session import get_db
from app.schemas.schemas import FaceRecognitionFrame, FaceRecognitionResult
from app.models.models import UserModel, FaceEmbeddingModel, AttendanceModel, UnknownFaceModel, CameraModel
from app.recognition.engine import biometric_engine
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/recognition", tags=["Live Face Recognition Engine"])

@router.post("/process-frame", response_model=FaceRecognitionResult)
async def process_live_frame(
    frame: FaceRecognitionFrame,
    db: AsyncSession = Depends(get_db)
):
    # 1. Liveness check
    is_valid_liveness, liveness_score = biometric_engine.check_liveness(frame.image_data)
    
    # 2. Extract 512-d target embedding
    target_vector = biometric_engine.extract_embedding(frame.image_data)
    
    # 3. Load database embeddings gallery
    result = await db.execute(select(FaceEmbeddingModel, UserModel).join(UserModel, FaceEmbeddingModel.user_id == UserModel.id))
    gallery_items = []
    for emb, user in result.all():
        gallery_items.append({
            "user_id": user.id,
            "vector": emb.embedding_vector,
            "metadata": {"name": user.name, "avatar": user.avatar, "dept": user.department_name, "category": user.category}
        })
    
    # 4. Match against gallery
    match = biometric_engine.match_against_gallery(target_vector, gallery_items, threshold=80.0)
    
    if match and is_valid_liveness:
        user_id = match["user_id"]
        confidence = match["score"]
        name = match["metadata"]["name"]
        
        # Log attendance automatically if not logged today
        today_str = datetime.date.today().isoformat()
        att_check = await db.execute(
            select(AttendanceModel).where(AttendanceModel.user_id == user_id, AttendanceModel.date == today_str)
        )
        existing_att = att_check.scalars().first()
        
        if not existing_att:
            new_att = AttendanceModel(
                user_id=user_id,
                user_name=name,
                user_category=match["metadata"]["category"],
                user_avatar=match["metadata"]["avatar"],
                department=match["metadata"]["dept"],
                date=today_str,
                clock_in=datetime.datetime.now().strftime("%H:%M:%S"),
                status="present",
                confidence_score=confidence,
                recognition_image_url=match["metadata"]["avatar"],
                camera_id=frame.camera_id,
                camera_name="Main Gate Scanner",
                location="Main Access Gate",
                approval_status="approved"
            )
            db.add(new_att)
            await db.commit()

        # Broadcast via WebSockets to connected dashboards
        await ws_manager.broadcast({
            "type": "RECOGNITION_EVENT",
            "data": {
                "name": name,
                "confidence": confidence,
                "camera_id": frame.camera_id,
                "time": datetime.datetime.now().strftime("%H:%M:%S")
            }
        })
        
        return FaceRecognitionResult(
            recognized=True,
            user_id=user_id,
            name=name,
            confidence_score=confidence,
            is_liveness_valid=True,
            is_unknown=False
        )
    else:
        # Create unknown face log if low confidence match
        unknown_entry = UnknownFaceModel(
            snapshot_url="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=300&q=80",
            captured_at=datetime.datetime.now().strftime("%Y-%m-%d %H:%M:%S"),
            camera_id=frame.camera_id,
            camera_name="Main Gate Scanner",
            location="Main Entrance",
            confidence_score=45.0,
            status="unassigned",
        )
        db.add(unknown_entry)
        await db.commit()

        return FaceRecognitionResult(
            recognized=False,
            confidence_score=45.0,
            is_liveness_valid=is_valid_liveness,
            is_unknown=True
        )
