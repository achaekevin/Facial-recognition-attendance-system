from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from sqlalchemy import func
from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List
from app.database.session import get_db
from app.models.models import User, Attendance
from app.websocket.manager import ws_manager

router = APIRouter(prefix="/attendance-corrections", tags=["attendance-corrections"])

# Mock database for correction requests (in production, create proper database tables)
correction_requests = []
correction_history = []

class CorrectionRequest(BaseModel):
    attendance_id: str
    requested_by: str
    reason: str
    correction_type: str  # clock_in, clock_out, status, date
    original_value: str
    new_value: str
    supporting_documents: Optional[List[str]] = []

class CorrectionReview(BaseModel):
    request_id: str
    reviewer_id: str
    reviewer_role: str  # supervisor, hr_admin
    status: str  # approved, rejected
    comments: str

@router.post("/request")
async def create_correction_request(request: CorrectionRequest, db: Session = Depends(get_db)):
    """
    Step 1: Employee/User creates correction request
    """
    try:
        # Verify attendance record exists
        attendance = db.query(Attendance).filter(Attendance.id == request.attendance_id).first()
        if not attendance:
            raise HTTPException(status_code=404, detail="Attendance record not found")
        
        user = db.query(User).filter(User.id == request.requested_by).first()
        if not user:
            raise HTTPException(status_code=404, detail="User not found")
        
        # Create correction request
        correction_req = {
            "id": f"CR-{len(correction_requests) + 1:05d}",
            "attendance_id": request.attendance_id,
            "requested_by": request.requested_by,
            "requester_name": user.name,
            "reason": request.reason,
            "correction_type": request.correction_type,
            "original_value": request.original_value,
            "new_value": request.new_value,
            "supporting_documents": request.supporting_documents,
            "status": "pending_supervisor",
            "supervisor_review": None,
            "hr_review": None,
            "created_at": datetime.now().isoformat(),
            "updated_at": datetime.now().isoformat()
        }
        
        correction_requests.append(correction_req)
        
        # Notify supervisor
        await ws_manager.broadcast({
            "type": "notification",
            "data": {
                "notification_type": "attendance_correction",
                "title": "New Correction Request",
                "message": f"{user.name} requested attendance correction",
                "priority": "normal"
            }
        })
        
        return {
            "status": "success",
            "message": "Correction request submitted successfully",
            "request": correction_req
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error creating correction request: {str(e)}")


@router.get("/requests")
async def get_correction_requests(
    status: Optional[str] = None,
    user_id: Optional[str] = None
):
    """
    Get correction requests with optional filters
    """
    try:
        filtered_requests = correction_requests.copy()
        
        if status:
            filtered_requests = [r for r in filtered_requests if r["status"] == status]
        
        if user_id:
            filtered_requests = [r for r in filtered_requests if r["requested_by"] == user_id]
        
        return {
            "requests": filtered_requests,
            "count": len(filtered_requests)
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching requests: {str(e)}")


@router.get("/requests/{request_id}")
async def get_correction_request(request_id: str):
    """
    Get specific correction request with full history
    """
    try:
        request = next((r for r in correction_requests if r["id"] == request_id), None)
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        # Get approval history
        history = [h for h in correction_history if h["request_id"] == request_id]
        
        return {
            "request": request,
            "history": history
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching request: {str(e)}")


@router.post("/review/supervisor")
async def supervisor_review(review: CorrectionReview, db: Session = Depends(get_db)):
    """
    Step 2: Supervisor reviews correction request
    """
    try:
        request = next((r for r in correction_requests if r["id"] == review.request_id), None)
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        if request["status"] != "pending_supervisor":
            raise HTTPException(status_code=400, detail="Request is not pending supervisor review")
        
        reviewer = db.query(User).filter(User.id == review.reviewer_id).first()
        
        # Update request with supervisor review
        request["supervisor_review"] = {
            "reviewer_id": review.reviewer_id,
            "reviewer_name": reviewer.name if reviewer else "Unknown",
            "status": review.status,
            "comments": review.comments,
            "reviewed_at": datetime.now().isoformat()
        }
        
        # Update overall status
        if review.status == "rejected":
            request["status"] = "rejected_by_supervisor"
        else:
            request["status"] = "pending_hr"
        
        request["updated_at"] = datetime.now().isoformat()
        
        # Add to history
        correction_history.append({
            "request_id": review.request_id,
            "step": "supervisor_review",
            "reviewer_id": review.reviewer_id,
            "reviewer_name": reviewer.name if reviewer else "Unknown",
            "status": review.status,
            "comments": review.comments,
            "timestamp": datetime.now().isoformat()
        })
        
        # Notify requester and HR
        await ws_manager.broadcast({
            "type": "notification",
            "data": {
                "notification_type": "attendance_correction",
                "title": f"Correction Request {review.status.title()}",
                "message": f"Supervisor has {review.status} your correction request",
                "priority": "normal"
            }
        })
        
        return {
            "status": "success",
            "message": f"Supervisor review completed: {review.status}",
            "request": request
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing supervisor review: {str(e)}")


@router.post("/review/hr")
async def hr_review(review: CorrectionReview, db: Session = Depends(get_db)):
    """
    Step 3: HR Admin final approval
    """
    try:
        request = next((r for r in correction_requests if r["id"] == review.request_id), None)
        if not request:
            raise HTTPException(status_code=404, detail="Request not found")
        
        if request["status"] != "pending_hr":
            raise HTTPException(status_code=400, detail="Request is not pending HR review")
        
        reviewer = db.query(User).filter(User.id == review.reviewer_id).first()
        
        # Update request with HR review
        request["hr_review"] = {
            "reviewer_id": review.reviewer_id,
            "reviewer_name": reviewer.name if reviewer else "Unknown",
            "status": review.status,
            "comments": review.comments,
            "reviewed_at": datetime.now().isoformat()
        }
        
        # Update overall status
        if review.status == "rejected":
            request["status"] = "rejected_by_hr"
        else:
            request["status"] = "approved"
            
            # Step 4: Apply the correction to attendance record
            attendance = db.query(Attendance).filter(
                Attendance.id == request["attendance_id"]
            ).first()
            
            if attendance:
                # Store original value in audit log
                correction_history.append({
                    "request_id": review.request_id,
                    "step": "attendance_update",
                    "field": request["correction_type"],
                    "original_value": request["original_value"],
                    "new_value": request["new_value"],
                    "updated_by": review.reviewer_id,
                    "timestamp": datetime.now().isoformat()
                })
                
                # Apply correction based on type
                if request["correction_type"] == "clock_in":
                    attendance.clock_in = datetime.fromisoformat(request["new_value"]).time()
                elif request["correction_type"] == "clock_out":
                    attendance.clock_out = datetime.fromisoformat(request["new_value"]).time()
                elif request["correction_type"] == "status":
                    attendance.status = request["new_value"]
                
                db.commit()
        
        request["updated_at"] = datetime.now().isoformat()
        
        # Add to history
        correction_history.append({
            "request_id": review.request_id,
            "step": "hr_review",
            "reviewer_id": review.reviewer_id,
            "reviewer_name": reviewer.name if reviewer else "Unknown",
            "status": review.status,
            "comments": review.comments,
            "timestamp": datetime.now().isoformat()
        })
        
        # Notify requester
        await ws_manager.broadcast({
            "type": "notification",
            "data": {
                "notification_type": "attendance_correction",
                "title": f"Correction Request {review.status.title()}",
                "message": f"HR has {review.status} your correction request",
                "priority": "high"
            }
        })
        
        return {
            "status": "success",
            "message": f"HR review completed: {review.status}",
            "request": request
        }
        
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error processing HR review: {str(e)}")


@router.get("/statistics")
async def get_correction_statistics():
    """
    Get correction request statistics
    """
    try:
        total = len(correction_requests)
        pending = len([r for r in correction_requests if "pending" in r["status"]])
        approved = len([r for r in correction_requests if r["status"] == "approved"])
        rejected = len([r for r in correction_requests if "rejected" in r["status"]])
        
        by_type = {}
        for request in correction_requests:
            type_ = request["correction_type"]
            by_type[type_] = by_type.get(type_, 0) + 1
        
        return {
            "total_requests": total,
            "pending": pending,
            "approved": approved,
            "rejected": rejected,
            "approval_rate": round((approved / total * 100), 2) if total > 0 else 0,
            "by_type": by_type
        }
        
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Error fetching statistics: {str(e)}")
