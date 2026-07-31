from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import Optional
from datetime import datetime, timedelta
try:
    import qrcode
except ImportError:
    qrcode = None
import io
import base64
import secrets
from app.database.session import get_db
from app.models.models import UserModel as User, AttendanceModel as Attendance

router = APIRouter(prefix="/qr-backup", tags=["qr-backup"])

# In-memory storage for QR codes (in production, use Redis with expiry)
qr_codes = {}

class QRGenerateRequest(BaseModel):
    user_id: str
    reason: str
    camera_id: Optional[str] = None

class QRVerifyRequest(BaseModel):
    qr_code: str
    user_id: str
    camera_id: Optional[str] = None

class QRGenerateResponse(BaseModel):
    success: bool
    qr_code: str
    qr_image: str  # Base64 encoded
    expires_at: str
    user_id: str
    reason: str

@router.post("/generate", response_model=QRGenerateResponse)
async def generate_qr_backup(
    request: QRGenerateRequest,
    db: Session = Depends(get_db)
):
    """
    Generate temporary QR code for backup attendance
    Used when facial recognition fails
    """
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Generate unique QR code
        qr_token = secrets.token_urlsafe(32)
        expires_at = datetime.now() + timedelta(minutes=5)  # 5-minute expiry
        
        # Store QR code metadata
        qr_codes[qr_token] = {
            "user_id": request.user_id,
            "reason": request.reason,
            "camera_id": request.camera_id,
            "created_at": datetime.now().isoformat(),
            "expires_at": expires_at.isoformat(),
            "used": False
        }
        
        # Generate QR code image
        qr_data = f"ATTENDANCE_QR:{qr_token}"
        qr = qrcode.QRCode(
            version=1,
            error_correction=qrcode.constants.ERROR_CORRECT_H,
            box_size=10,
            border=4,
        )
        qr.add_data(qr_data)
        qr.make(fit=True)
        
        img = qr.make_image(fill_color="black", back_color="white")
        
        # Convert to base64
        buffer = io.BytesIO()
        img.save(buffer, format="PNG")
        img_base64 = base64.b64encode(buffer.getvalue()).decode()
        
        return {
            "success": True,
            "qr_code": qr_token,
            "qr_image": f"data:image/png;base64,{img_base64}",
            "expires_at": expires_at.isoformat(),
            "user_id": request.user_id,
            "reason": request.reason
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error generating QR code: {str(e)}")

@router.post("/verify")
async def verify_qr_backup(
    request: QRVerifyRequest,
    db: Session = Depends(get_db)
):
    """
    Verify QR code and record attendance
    """
    try:
        # Check if QR code exists
        if request.qr_code not in qr_codes:
            raise HTTPException(status_code=404, detail="Invalid or expired QR code")
        
        qr_data = qr_codes[request.qr_code]
        
        # Check if already used
        if qr_data["used"]:
            raise HTTPException(status_code=400, detail="QR code already used")
        
        # Check expiry
        expires_at = datetime.fromisoformat(qr_data["expires_at"])
        if datetime.now() > expires_at:
            del qr_codes[request.qr_code]
            raise HTTPException(status_code=400, detail="QR code expired")
        
        # Verify user matches
        if qr_data["user_id"] != request.user_id:
            raise HTTPException(status_code=400, detail="User ID mismatch")
        
        # Verify user exists
        user = db.query(User).filter(User.id == request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Check if attendance already recorded today
        today = datetime.now().date()
        existing_attendance = db.query(Attendance).filter(
            Attendance.user_id == request.user_id,
            Attendance.date == today
        ).first()
        
        if existing_attendance:
            raise HTTPException(status_code=400, detail="Attendance already recorded for today")
        
        # Record attendance
        new_attendance = Attendance(
            user_id=request.user_id,
            date=today,
            clock_in=datetime.now().time(),
            status="present",
            confidence_score=100.0,  # Manual verification
            camera_id=request.camera_id or qr_data.get("camera_id"),
            verification_method="qr_backup",
            fallback_reason=qr_data["reason"]
        )
        
        db.add(new_attendance)
        db.commit()
        db.refresh(new_attendance)
        
        # Mark QR code as used
        qr_codes[request.qr_code]["used"] = True
        qr_codes[request.qr_code]["used_at"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "message": "Attendance recorded successfully via QR backup",
            "attendance_id": str(new_attendance.id),
            "user_name": user.name,
            "clock_in": new_attendance.clock_in.strftime("%H:%M:%S"),
            "fallback_reason": qr_data["reason"]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error verifying QR code: {str(e)}")

@router.get("/history")
async def get_qr_backup_history(
    user_id: Optional[str] = None,
    days: int = 7,
    db: Session = Depends(get_db)
):
    """
    Get history of QR backup attendance records
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        query = db.query(
            Attendance.id,
            Attendance.user_id,
            Attendance.date,
            Attendance.clock_in,
            Attendance.camera_id,
            Attendance.fallback_reason,
            User.name,
            User.email
        ).join(User).filter(
            Attendance.verification_method == "qr_backup",
            Attendance.date >= start_date
        )
        
        if user_id:
            query = query.filter(Attendance.user_id == user_id)
        
        records = query.order_by(Attendance.date.desc()).all()
        
        history = [
            {
                "id": str(record.id),
                "user_id": record.user_id,
                "user_name": record.name,
                "email": record.email,
                "date": record.date.isoformat(),
                "clock_in": record.clock_in.strftime("%H:%M:%S") if record.clock_in else None,
                "camera_id": record.camera_id,
                "fallback_reason": record.fallback_reason
            }
            for record in records
        ]
        
        return {
            "success": True,
            "count": len(history),
            "records": history,
            "period_days": days
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching QR backup history: {str(e)}")

@router.get("/statistics")
async def get_qr_backup_statistics(days: int = 30, db: Session = Depends(get_db)):
    """
    Get statistics on QR backup usage
    """
    try:
        start_date = datetime.now().date() - timedelta(days=days)
        
        # Total QR backups
        total_backups = db.query(Attendance).filter(
            Attendance.verification_method == "qr_backup",
            Attendance.date >= start_date
        ).count()
        
        # By reason
        by_reason = db.query(
            Attendance.fallback_reason,
            db.func.count(Attendance.id).label('count')
        ).filter(
            Attendance.verification_method == "qr_backup",
            Attendance.date >= start_date
        ).group_by(Attendance.fallback_reason).all()
        
        # By user (top 5)
        by_user = db.query(
            User.name,
            User.id,
            db.func.count(Attendance.id).label('count')
        ).join(Attendance).filter(
            Attendance.verification_method == "qr_backup",
            Attendance.date >= start_date
        ).group_by(User.id).order_by(db.func.count(Attendance.id).desc()).limit(5).all()
        
        return {
            "success": True,
            "period_days": days,
            "total_qr_backups": total_backups,
            "by_reason": [
                {"reason": r.fallback_reason, "count": r.count}
                for r in by_reason
            ],
            "top_users": [
                {"user_id": u.id, "name": u.name, "count": u.count}
                for u in by_user
            ]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching statistics: {str(e)}")

@router.delete("/cleanup")
async def cleanup_expired_qr_codes():
    """
    Clean up expired QR codes from memory
    """
    try:
        now = datetime.now()
        expired_codes = []
        
        for code, data in list(qr_codes.items()):
            expires_at = datetime.fromisoformat(data["expires_at"])
            if now > expires_at:
                expired_codes.append(code)
                del qr_codes[code]
        
        return {
            "success": True,
            "message": f"Cleaned up {len(expired_codes)} expired QR code(s)",
            "removed_count": len(expired_codes)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error during cleanup: {str(e)}")
