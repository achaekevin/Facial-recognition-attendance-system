from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel
from typing import List, Optional
from datetime import datetime
import hashlib
import secrets
from app.database.session import get_db
from app.models.models import UserModel as User, AttendanceModel as Attendance

router = APIRouter(prefix="/multi-factor", tags=["multi-factor"])

# In-memory storage for MFA policies and sessions
mfa_policies = {}
mfa_sessions = {}

class MFAPolicy(BaseModel):
    id: Optional[str] = None
    name: str
    description: str
    required_factors: List[str]  # ["face", "geofence", "device", "qr", "pin"]
    applies_to: str  # "all", "department", "role", "user"
    target_ids: Optional[List[str]] = None
    is_active: bool = True

class MFAVerification(BaseModel):
    user_id: str
    factor_type: str  # "face", "geofence", "device", "qr", "pin"
    factor_data: dict
    session_id: Optional[str] = None

class MFASession(BaseModel):
    user_id: str
    required_factors: List[str]
    camera_id: Optional[str] = None

@router.post("/policies")
async def create_mfa_policy(policy: MFAPolicy):
    """
    Create a new MFA policy
    """
    try:
        # Generate policy ID
        policy_id = f"MFA-{len(mfa_policies) + 1:04d}"
        policy.id = policy_id
        
        # Validate required factors
        valid_factors = ["face", "geofence", "device", "qr", "pin"]
        for factor in policy.required_factors:
            if factor not in valid_factors:
                raise HTTPException(
                    status_code=400,
                    detail=f"Invalid factor '{factor}'. Must be one of: {', '.join(valid_factors)}"
                )
        
        # Store policy
        mfa_policies[policy_id] = {
            "id": policy_id,
            "name": policy.name,
            "description": policy.description,
            "required_factors": policy.required_factors,
            "applies_to": policy.applies_to,
            "target_ids": policy.target_ids or [],
            "is_active": policy.is_active,
            "created_at": datetime.now().isoformat()
        }
        
        return {
            "success": True,
            "message": "MFA policy created successfully",
            "policy": mfa_policies[policy_id]
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating policy: {str(e)}")

@router.get("/policies")
async def list_mfa_policies():
    """
    Get all MFA policies
    """
    return {
        "success": True,
        "count": len(mfa_policies),
        "policies": list(mfa_policies.values())
    }

@router.get("/policies/{policy_id}")
async def get_mfa_policy(policy_id: str):
    """
    Get specific MFA policy
    """
    if policy_id not in mfa_policies:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    return {
        "success": True,
        "policy": mfa_policies[policy_id]
    }

@router.put("/policies/{policy_id}")
async def update_mfa_policy(policy_id: str, policy: MFAPolicy):
    """
    Update MFA policy
    """
    if policy_id not in mfa_policies:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    try:
        mfa_policies[policy_id].update({
            "name": policy.name,
            "description": policy.description,
            "required_factors": policy.required_factors,
            "applies_to": policy.applies_to,
            "target_ids": policy.target_ids or [],
            "is_active": policy.is_active,
            "updated_at": datetime.now().isoformat()
        })
        
        return {
            "success": True,
            "message": "Policy updated successfully",
            "policy": mfa_policies[policy_id]
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error updating policy: {str(e)}")

@router.delete("/policies/{policy_id}")
async def delete_mfa_policy(policy_id: str):
    """
    Delete MFA policy
    """
    if policy_id not in mfa_policies:
        raise HTTPException(status_code=404, detail="Policy not found")
    
    del mfa_policies[policy_id]
    
    return {
        "success": True,
        "message": "Policy deleted successfully"
    }

@router.post("/session/start")
async def start_mfa_session(
    session_request: MFASession,
    db: Session = Depends(get_db)
):
    """
    Start MFA session for user
    Determines which factors are required based on policies
    """
    try:
        # Verify user exists
        user = db.query(User).filter(User.id == session_request.user_id).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Find applicable policies
        required_factors = set()
        applicable_policies = []
        
        for policy in mfa_policies.values():
            if not policy["is_active"]:
                continue
            
            # Check if policy applies to user
            applies = False
            if policy["applies_to"] == "all":
                applies = True
            elif policy["applies_to"] == "user" and session_request.user_id in policy["target_ids"]:
                applies = True
            elif policy["applies_to"] == "role" and user.role in policy["target_ids"]:
                applies = True
            elif policy["applies_to"] == "department" and user.department_id in policy["target_ids"]:
                applies = True
            
            if applies:
                required_factors.update(policy["required_factors"])
                applicable_policies.append(policy["id"])
        
        # If no policies apply, default to face only
        if not required_factors:
            required_factors = {"face"}
        
        # Create session
        session_id = secrets.token_urlsafe(32)
        mfa_sessions[session_id] = {
            "session_id": session_id,
            "user_id": session_request.user_id,
            "required_factors": list(required_factors),
            "verified_factors": [],
            "applicable_policies": applicable_policies,
            "camera_id": session_request.camera_id,
            "created_at": datetime.now().isoformat(),
            "expires_at": (datetime.now() + datetime.timedelta(minutes=10)).isoformat(),
            "status": "pending"
        }
        
        return {
            "success": True,
            "session_id": session_id,
            "required_factors": list(required_factors),
            "message": f"MFA session started. Please verify {len(required_factors)} factor(s)."
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error starting MFA session: {str(e)}")

@router.post("/verify")
async def verify_mfa_factor(
    verification: MFAVerification,
    db: Session = Depends(get_db)
):
    """
    Verify a single MFA factor
    """
    try:
        # Check session
        if not verification.session_id or verification.session_id not in mfa_sessions:
            raise HTTPException(status_code=404, detail="Invalid or expired session")
        
        session = mfa_sessions[verification.session_id]
        
        # Check if session expired
        expires_at = datetime.fromisoformat(session["expires_at"])
        if datetime.now() > expires_at:
            del mfa_sessions[verification.session_id]
            raise HTTPException(status_code=400, detail="Session expired")
        
        # Verify user matches
        if session["user_id"] != verification.user_id:
            raise HTTPException(status_code=400, detail="User ID mismatch")
        
        # Check if factor is required
        if verification.factor_type not in session["required_factors"]:
            raise HTTPException(status_code=400, detail=f"Factor '{verification.factor_type}' not required")
        
        # Check if already verified
        if verification.factor_type in session["verified_factors"]:
            raise HTTPException(status_code=400, detail=f"Factor '{verification.factor_type}' already verified")
        
        # Verify the factor
        verified = False
        verification_details = {}
        
        if verification.factor_type == "face":
            # Face recognition already done
            confidence = verification.factor_data.get("confidence", 0)
            verified = confidence >= 70
            verification_details = {"confidence": confidence}
            
        elif verification.factor_type == "geofence":
            # Check if within allowed coordinates
            user_lat = verification.factor_data.get("latitude")
            user_lon = verification.factor_data.get("longitude")
            allowed_radius = verification.factor_data.get("radius", 100)  # meters
            
            # Mock geofence verification (in production, calculate actual distance)
            verified = user_lat is not None and user_lon is not None
            verification_details = {
                "latitude": user_lat,
                "longitude": user_lon,
                "within_radius": verified
            }
            
        elif verification.factor_type == "device":
            # Verify device ID
            device_id = verification.factor_data.get("device_id")
            # Mock device verification (in production, check against registered devices)
            verified = device_id is not None and len(device_id) > 0
            verification_details = {"device_id": device_id, "trusted": verified}
            
        elif verification.factor_type == "qr":
            # Verify QR code
            qr_code = verification.factor_data.get("qr_code")
            verified = qr_code is not None and len(qr_code) > 0
            verification_details = {"qr_verified": verified}
            
        elif verification.factor_type == "pin":
            # Verify PIN
            pin = verification.factor_data.get("pin")
            # Mock PIN verification (in production, check against stored hash)
            verified = pin is not None and len(pin) >= 4
            verification_details = {"pin_matched": verified}
        
        if not verified:
            return {
                "success": False,
                "message": f"Factor '{verification.factor_type}' verification failed",
                "session_id": verification.session_id,
                "details": verification_details
            }
        
        # Mark factor as verified
        session["verified_factors"].append(verification.factor_type)
        
        # Check if all factors verified
        all_verified = set(session["verified_factors"]) == set(session["required_factors"])
        
        if all_verified:
            session["status"] = "completed"
            session["completed_at"] = datetime.now().isoformat()
        
        return {
            "success": True,
            "message": f"Factor '{verification.factor_type}' verified successfully",
            "session_id": verification.session_id,
            "verified_factors": session["verified_factors"],
            "remaining_factors": [f for f in session["required_factors"] if f not in session["verified_factors"]],
            "all_factors_verified": all_verified,
            "details": verification_details
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error verifying factor: {str(e)}")

@router.post("/session/{session_id}/complete")
async def complete_mfa_session(
    session_id: str,
    db: Session = Depends(get_db)
):
    """
    Complete MFA session and record attendance
    """
    try:
        # Check session
        if session_id not in mfa_sessions:
            raise HTTPException(status_code=404, detail="Session not found")
        
        session = mfa_sessions[session_id]
        
        # Check if all factors verified
        if set(session["verified_factors"]) != set(session["required_factors"]):
            remaining = [f for f in session["required_factors"] if f not in session["verified_factors"]]
            raise HTTPException(
                status_code=400,
                detail=f"Not all factors verified. Remaining: {', '.join(remaining)}"
            )
        
        # Record attendance
        user = db.query(User).filter(User.id == session["user_id"]).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        today = datetime.now().date()
        existing_attendance = db.query(Attendance).filter(
            Attendance.user_id == session["user_id"],
            Attendance.date == today
        ).first()
        
        if existing_attendance:
            raise HTTPException(status_code=400, detail="Attendance already recorded")
        
        new_attendance = Attendance(
            user_id=session["user_id"],
            date=today,
            clock_in=datetime.now().time(),
            status="present",
            confidence_score=100.0,
            camera_id=session.get("camera_id"),
            verification_method="multi_factor",
            mfa_factors=",".join(session["verified_factors"])
        )
        
        db.add(new_attendance)
        db.commit()
        db.refresh(new_attendance)
        
        # Clean up session
        del mfa_sessions[session_id]
        
        return {
            "success": True,
            "message": "Attendance recorded successfully via MFA",
            "attendance_id": str(new_attendance.id),
            "user_name": user.name,
            "verified_factors": session["verified_factors"],
            "clock_in": new_attendance.clock_in.strftime("%H:%M:%S")
        }
        
    except HTTPException:
        raise
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Error completing session: {str(e)}")

@router.get("/session/{session_id}/status")
async def get_session_status(session_id: str):
    """
    Get MFA session status
    """
    if session_id not in mfa_sessions:
        raise HTTPException(status_code=404, detail="Session not found")
    
    session = mfa_sessions[session_id]
    
    return {
        "success": True,
        "session": {
            "session_id": session_id,
            "user_id": session["user_id"],
            "required_factors": session["required_factors"],
            "verified_factors": session["verified_factors"],
            "remaining_factors": [f for f in session["required_factors"] if f not in session["verified_factors"]],
            "status": session["status"],
            "created_at": session["created_at"],
            "expires_at": session["expires_at"]
        }
    }

@router.get("/statistics")
async def get_mfa_statistics(days: int = 30, db: Session = Depends(get_db)):
    """
    Get MFA usage statistics
    """
    try:
        start_date = datetime.now().date() - datetime.timedelta(days=days)
        
        # Total MFA authentications
        total_mfa = db.query(Attendance).filter(
            Attendance.verification_method == "multi_factor",
            Attendance.date >= start_date
        ).count()
        
        return {
            "success": True,
            "period_days": days,
            "total_mfa_authentications": total_mfa,
            "active_policies": len([p for p in mfa_policies.values() if p["is_active"]]),
            "active_sessions": len(mfa_sessions)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching statistics: {str(e)}")
