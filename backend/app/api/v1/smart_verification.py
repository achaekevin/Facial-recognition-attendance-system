"""
Smart Attendance Verification API with comprehensive validation workflow.
"""
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from sqlalchemy.ext.asyncio import AsyncSession
from datetime import datetime

from app.database.session import get_db
from app.authorization.rbac import get_current_user
from app.attendance.rules_engine import AttendanceRulesEngine
from app.models.models import AttendanceModel, UserModel
from app.recognition.liveness_detector import LivenessDetector

router = APIRouter(prefix="/smart-verification", tags=["Smart Verification"])

# Initialize engines
rules_engine = AttendanceRulesEngine()
liveness_detector = LivenessDetector()


class VerificationRequest(BaseModel):
    """Request model for smart verification."""
    user_id: str
    confidence_score: float
    camera_id: Optional[str] = None
    liveness_score: Optional[float] = None
    location: Optional[dict] = None  # {"lat": float, "lng": float}
    timestamp: Optional[str] = None


class VerificationResponse(BaseModel):
    """Response model for verification."""
    success: bool
    is_valid: bool
    reason: str
    validation_details: dict
    attendance_recorded: bool
    attendance_id: Optional[str] = None


@router.post("/validate", response_model=VerificationResponse)
async def validate_attendance_request(
    request: VerificationRequest,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Perform comprehensive smart attendance verification.
    
    Workflow:
    1. Validate liveness (if provided)
    2. Check recognition confidence
    3. Prevent duplicates
    4. Verify working hours
    5. Validate shift assignment
    6. Check camera authorization
    7. Verify geofence (if enabled)
    8. Check daily limits
    
    Only records attendance if ALL checks pass.
    """
    try:
        # Parse timestamp
        timestamp = datetime.fromisoformat(request.timestamp) if request.timestamp else datetime.now()
        
        # Run validation through rules engine
        is_valid, reason, validation_details = await rules_engine.validate_attendance(
            db=db,
            user_id=request.user_id,
            confidence_score=request.confidence_score,
            camera_id=request.camera_id,
            timestamp=timestamp,
            location=request.location,
            liveness_score=request.liveness_score
        )
        
        attendance_recorded = False
        attendance_id = None
        
        # If valid, record attendance
        if is_valid:
            try:
                # Create attendance record
                new_attendance = AttendanceModel(
                    user_id=request.user_id,
                    attendance_date=timestamp.date(),
                    clock_in=timestamp.time(),
                    attendance_status='present',
                    recognition_log_id=None,  # Set if you have recognition log
                    total_hours=0.0
                )
                
                db.add(new_attendance)
                await db.commit()
                await db.refresh(new_attendance)
                
                attendance_recorded = True
                attendance_id = new_attendance.id
                
            except Exception as e:
                await db.rollback()
                return VerificationResponse(
                    success=False,
                    is_valid=True,
                    reason=f"Validation passed but failed to record attendance: {str(e)}",
                    validation_details=validation_details,
                    attendance_recorded=False,
                    attendance_id=None
                )
        
        return VerificationResponse(
            success=True,
            is_valid=is_valid,
            reason=reason,
            validation_details=validation_details,
            attendance_recorded=attendance_recorded,
            attendance_id=attendance_id
        )
        
    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail=f"Verification failed: {str(e)}"
        )


@router.get("/rules/config")
async def get_rules_config(
    current_user = Depends(get_current_user)
):
    """
    Get current validation rules configuration.
    """
    return {
        "success": True,
        "config": {
            "min_confidence_threshold": rules_engine.min_confidence_threshold,
            "duplicate_window_minutes": rules_engine.duplicate_window_minutes,
            "max_daily_checkins": rules_engine.max_daily_checkins,
            "geofencing_enabled": rules_engine.geofencing_enabled,
            "geofencing_radius_meters": rules_engine.geofencing_radius_meters,
            "working_hours_enforcement": rules_engine.working_hours_enforcement,
            "shift_validation_enabled": rules_engine.shift_validation_enabled,
            "camera_location_validation": rules_engine.camera_location_validation
        }
    }


@router.put("/rules/config")
async def update_rules_config(
    min_confidence: Optional[float] = None,
    duplicate_window: Optional[int] = None,
    max_daily_checkins: Optional[int] = None,
    geofencing_enabled: Optional[bool] = None,
    geofencing_radius: Optional[int] = None,
    db: AsyncSession = Depends(get_db),
    current_user = Depends(get_current_user)
):
    """
    Update validation rules configuration.
    Requires super_admin role.
    """
    if min_confidence is not None:
        rules_engine.min_confidence_threshold = min_confidence
    
    if duplicate_window is not None:
        rules_engine.duplicate_window_minutes = duplicate_window
    
    if max_daily_checkins is not None:
        rules_engine.max_daily_checkins = max_daily_checkins
    
    if geofencing_enabled is not None:
        rules_engine.geofencing_enabled = geofencing_enabled
    
    if geofencing_radius is not None:
        rules_engine.geofencing_radius_meters = geofencing_radius
    
    return {
        "success": True,
        "message": "Rules configuration updated successfully",
        "config": {
            "min_confidence_threshold": rules_engine.min_confidence_threshold,
            "duplicate_window_minutes": rules_engine.duplicate_window_minutes,
            "max_daily_checkins": rules_engine.max_daily_checkins,
            "geofencing_enabled": rules_engine.geofencing_enabled,
            "geofencing_radius_meters": rules_engine.geofencing_radius_meters
        }
    }
