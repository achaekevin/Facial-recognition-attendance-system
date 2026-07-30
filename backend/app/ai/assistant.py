"""
AI Assistant for natural language queries
Translates administrator queries into backend operations
"""
import re
from datetime import datetime, timedelta
from typing import Dict, List, Any, Optional
from sqlalchemy.orm import Session
from sqlalchemy import func, and_, or_
from app.models.models import UserModel as User, AttendanceModel as Attendance, CameraModel as Camera, DepartmentModel as Department

class AIAssistant:
    """Natural language query processor for administrators"""
    
    def __init__(self, db: Session):
        self.db = db
        
        # Query patterns and their handlers
        self.patterns = [
            # User registration check
            (r"(is|check|find|lookup|search|did i register)\s+(student|user|employee)?\s*([a-zA-Z0-9\s-]+)", self._handle_user_registration_check),
            (r"registered.*", self._handle_user_registration_check),

            # Leave requests
            (r"leave.*", self._handle_leave_requests),

            # Late arrivals
            (r"who (arrived|came) late (today|yesterday|this week)", self._handle_late_arrivals),
            (r"late arrivals? (today|yesterday|this week)", self._handle_late_arrivals),
            (r"show.*late.*", self._handle_late_arrivals),
            
            # Absences
            (r"who (is|was|are) absent (today|yesterday|this week)", self._handle_absences),
            (r"show.*absent.*", self._handle_absences),
            (r"absentees? (today|yesterday|this week)", self._handle_absences),
            
            # Camera accuracy
            (r"which camera.*(lowest|worst|poor).*(accuracy|recognition|performance)", self._handle_camera_accuracy),
            (r"camera.*(performance|accuracy|issues)", self._handle_camera_accuracy),
            
            # Department statistics
            (r"(best|worst|top|bottom) department", self._handle_department_stats),
            (r"department.*(attendance|performance|statistics)", self._handle_department_stats),
            
            # User information
            (r"show.*user.*(attendance|record|history)", self._handle_user_info),
            (r"employee.*status", self._handle_user_info),
            
            # Recognition failures
            (r"(failed|low|poor) recognition", self._handle_failed_recognition),
            (r"recognition (failures|errors|issues)", self._handle_failed_recognition),
            
            # Attendance trends
            (r"attendance (trend|pattern|statistics)", self._handle_attendance_trends),
            (r"overall attendance", self._handle_attendance_trends),
            
            # Peak times
            (r"(peak|busiest) (time|hour|period)", self._handle_peak_times),
            (r"when.*most.*arrive", self._handle_peak_times),
        ]
    
    def _handle_user_registration_check(self, query: str, time_ref: Dict) -> Dict[str, Any]:
        """Handle queries checking if a student or user is registered"""
        match = re.search(r"(?:is|check|find|lookup|search|did i register)\s+(?:student|user|employee)?\s*([a-zA-Z0-9\s-]+)", query)
        name_query = match.group(1).strip() if match else query.replace("is", "").replace("registered", "").strip()

        if name_query:
            matched_users = self.db.query(User).filter(
                or_(
                    User.name.ilike(f"%{name_query}%"),
                    User.email.ilike(f"%{name_query}%"),
                    User.employee_or_student_id.ilike(f"%{name_query}%")
                )
            ).all()

            if matched_users:
                u = matched_users[0]
                return {
                    "type": "registration_check",
                    "found": True,
                    "user": {
                        "name": u.name,
                        "id": u.employee_or_student_id,
                        "email": u.email,
                        "department": u.department_name,
                        "status": u.status
                    },
                    "summary": f"Yes, Student/User '{u.name}' (ID: {u.employee_or_student_id}) is REGISTERED in the system database as '{u.status}' in {u.department_name}."
                }

        return {
            "type": "registration_check",
            "found": False,
            "summary": f"No student or user matching '{name_query}' is registered in the system database."
        }

    def _handle_leave_requests(self, query: str, time_ref: Dict) -> Dict[str, Any]:
        """Handle queries about leave requests"""
        from app.models.models import LeaveModel
        leaves = self.db.query(LeaveModel).all()
        if not leaves:
            return {
                "type": "leave_requests",
                "count": 0,
                "summary": "There are currently no leave requests recorded in the system database."
            }

        return {
            "type": "leave_requests",
            "count": len(leaves),
            "summary": f"Found {len(leaves)} total leave request(s) in system.",
            "requests": [
                {
                    "applicant": l.user_name,
                    "type": l.leave_type,
                    "dates": f"{l.start_date} to {l.end_date}",
                    "status": l.status
                }
                for l in leaves
            ]
        }

    def process_query(self, query: str) -> Dict[str, Any]:
        """Process natural language query and return results"""
        query_lower = query.lower().strip()
        
        # Extract time reference
        time_ref = self._extract_time_reference(query_lower)
        
        # Match query pattern
        for pattern, handler in self.patterns:
            if re.search(pattern, query_lower):
                try:
                    result = handler(query_lower, time_ref)
                    return {
                        "success": True,
                        "query": query,
                        "result": result,
                        "timestamp": datetime.now().isoformat()
                    }
                except Exception as e:
                    return {
                        "success": False,
                        "query": query,
                        "error": str(e),
                        "timestamp": datetime.now().isoformat()
                    }
        
        # No pattern matched
        return {
            "success": False,
            "query": query,
            "error": "I couldn't understand that query. Try asking about late arrivals, absences, camera performance, or department statistics.",
            "suggestions": [
                "Who arrived late today?",
                "Show employees absent this week",
                "Which camera has the lowest recognition accuracy?",
                "Best performing department",
                "Failed recognitions today"
            ],
            "timestamp": datetime.now().isoformat()
        }
    
    def _extract_time_reference(self, query: str) -> Dict[str, datetime]:
        """Extract time period from query"""
        now = datetime.now()
        
        if "today" in query:
            return {
                "start": now.replace(hour=0, minute=0, second=0, microsecond=0),
                "end": now,
                "label": "today"
            }
        elif "yesterday" in query:
            yesterday = now - timedelta(days=1)
            return {
                "start": yesterday.replace(hour=0, minute=0, second=0, microsecond=0),
                "end": yesterday.replace(hour=23, minute=59, second=59),
                "label": "yesterday"
            }
        elif "this week" in query or "week" in query:
            start_of_week = now - timedelta(days=now.weekday())
            return {
                "start": start_of_week.replace(hour=0, minute=0, second=0, microsecond=0),
                "end": now,
                "label": "this week"
            }
        elif "this month" in query or "month" in query:
            start_of_month = now.replace(day=1, hour=0, minute=0, second=0, microsecond=0)
            return {
                "start": start_of_month,
                "end": now,
                "label": "this month"
            }
        else:
            # Default to today
            return {
                "start": now.replace(hour=0, minute=0, second=0, microsecond=0),
                "end": now,
                "label": "today"
            }
    
    def _handle_late_arrivals(self, query: str, time_ref: Dict) -> Dict[str, Any]:
        """Handle queries about late arrivals"""
        # Query late arrivals (assuming 9:00 AM is the standard time)
        standard_time = time_ref["start"].replace(hour=9, minute=0)
        
        late_records = self.db.query(
            User.id,
            User.name,
            User.email,
            User.department_id,
            Attendance.clock_in,
            Attendance.date
        ).join(Attendance).filter(
            and_(
                Attendance.date >= time_ref["start"].date(),
                Attendance.date <= time_ref["end"].date(),
                Attendance.clock_in > standard_time.time(),
                Attendance.status == "present"
            )
        ).order_by(Attendance.clock_in.desc()).all()
        
        late_employees = [
            {
                "id": record.id,
                "name": record.name,
                "email": record.email,
                "department_id": record.department_id,
                "arrival_time": record.clock_in.strftime("%H:%M:%S") if record.clock_in else "N/A",
                "date": record.date.isoformat(),
                "minutes_late": self._calculate_late_minutes(record.clock_in, standard_time.time())
            }
            for record in late_records
        ]
        
        return {
            "type": "late_arrivals",
            "period": time_ref["label"],
            "count": len(late_employees),
            "employees": late_employees,
            "summary": f"Found {len(late_employees)} employee(s) who arrived late {time_ref['label']}."
        }
    
    def _handle_absences(self, query: str, time_ref: Dict) -> Dict[str, Any]:
        """Handle queries about absences"""
        # Get all active users
        all_users = self.db.query(User).filter(User.is_active == True).all()
        
        # Get users with attendance records
        present_users = self.db.query(User.id).join(Attendance).filter(
            and_(
                Attendance.date >= time_ref["start"].date(),
                Attendance.date <= time_ref["end"].date()
            )
        ).distinct().all()
        
        present_ids = {user.id for user in present_users}
        
        # Find absent users
        absent_employees = [
            {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "department_id": user.department_id,
                "role": user.role,
                "last_seen": self._get_last_attendance(user.id)
            }
            for user in all_users
            if user.id not in present_ids
        ]
        
        return {
            "type": "absences",
            "period": time_ref["label"],
            "count": len(absent_employees),
            "employees": absent_employees,
            "summary": f"Found {len(absent_employees)} employee(s) absent {time_ref['label']}."
        }
    
    def _handle_camera_accuracy(self, query: str, time_ref: Dict) -> Dict[str, Any]:
        """Handle queries about camera accuracy"""
        camera_stats = self.db.query(
            Camera.id,
            Camera.name,
            Camera.location,
            Camera.status,
            func.count(Attendance.id).label("total_recognitions"),
            func.avg(Attendance.confidence_score).label("avg_confidence"),
            func.sum(func.case((Attendance.confidence_score >= 90, 1), else_=0)).label("high_confidence"),
            func.sum(func.case((Attendance.confidence_score < 70, 1), else_=0)).label("low_confidence")
        ).outerjoin(Attendance).filter(
            Attendance.date >= time_ref["start"].date()
        ).group_by(Camera.id).all()
        
        cameras = []
        for stat in camera_stats:
            total = stat.total_recognitions or 0
            accuracy = float(stat.avg_confidence or 0)
            success_rate = (stat.high_confidence / total * 100) if total > 0 else 0
            
            cameras.append({
                "id": stat.id,
                "name": stat.name,
                "location": stat.location,
                "status": stat.status,
                "total_recognitions": total,
                "average_confidence": round(accuracy, 2),
                "success_rate": round(success_rate, 2),
                "failed_recognitions": stat.low_confidence,
                "performance_rating": self._rate_performance(accuracy)
            })
        
        # Sort by accuracy (lowest first)
        cameras.sort(key=lambda x: x["average_confidence"])
        
        return {
            "type": "camera_accuracy",
            "period": time_ref["label"],
            "cameras": cameras,
            "worst_camera": cameras[0] if cameras else None,
            "summary": f"Camera '{cameras[0]['name']}' has the lowest accuracy at {cameras[0]['average_confidence']}% {time_ref['label']}." if cameras else "No camera data available."
        }
    
    def _handle_department_stats(self, query: str, time_ref: Dict) -> Dict[str, Any]:
        """Handle queries about department statistics"""
        dept_stats = self.db.query(
            Department.id,
            Department.name,
            func.count(func.distinct(User.id)).label("total_employees"),
            func.count(Attendance.id).label("total_attendance"),
            func.avg(Attendance.confidence_score).label("avg_confidence")
        ).outerjoin(User).outerjoin(Attendance).filter(
            Attendance.date >= time_ref["start"].date()
        ).group_by(Department.id).all()
        
        departments = []
        for stat in dept_stats:
            total_emp = stat.total_employees or 0
            total_att = stat.total_attendance or 0
            attendance_rate = (total_att / (total_emp * 7) * 100) if total_emp > 0 else 0  # Assuming 7 days
            
            departments.append({
                "id": stat.id,
                "name": stat.name,
                "total_employees": total_emp,
                "total_attendance": total_att,
                "attendance_rate": round(attendance_rate, 2),
                "average_confidence": round(float(stat.avg_confidence or 0), 2)
            })
        
        # Sort by attendance rate
        departments.sort(key=lambda x: x["attendance_rate"], reverse=True)
        
        best_dept = departments[0] if departments else None
        worst_dept = departments[-1] if departments else None
        
        return {
            "type": "department_statistics",
            "period": time_ref["label"],
            "departments": departments,
            "best_department": best_dept,
            "worst_department": worst_dept,
            "summary": f"Department '{best_dept['name']}' has the highest attendance rate at {best_dept['attendance_rate']}% {time_ref['label']}." if best_dept else "No department data available."
        }
    
    def _handle_user_info(self, query: str, time_ref: Dict) -> Dict[str, Any]:
        """Handle queries about user information"""
        # Extract user identifier from query
        user_name_match = re.search(r"user[:\s]+([a-zA-Z\s]+)", query)
        user_name = user_name_match.group(1).strip() if user_name_match else None
        
        if not user_name:
            return {
                "type": "user_info",
                "error": "Please specify a user name in your query.",
                "example": "Show user John Doe attendance record"
            }
        
        # Find user
        user = self.db.query(User).filter(User.name.ilike(f"%{user_name}%")).first()
        
        if not user:
            return {
                "type": "user_info",
                "error": f"User '{user_name}' not found."
            }
        
        # Get attendance records
        attendance_records = self.db.query(Attendance).filter(
            and_(
                Attendance.user_id == user.id,
                Attendance.date >= time_ref["start"].date(),
                Attendance.date <= time_ref["end"].date()
            )
        ).order_by(Attendance.date.desc()).all()
        
        return {
            "type": "user_info",
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "department_id": user.department_id,
                "role": user.role
            },
            "attendance_records": [
                {
                    "date": record.date.isoformat(),
                    "clock_in": record.clock_in.strftime("%H:%M:%S") if record.clock_in else None,
                    "clock_out": record.clock_out.strftime("%H:%M:%S") if record.clock_out else None,
                    "status": record.status,
                    "confidence": round(record.confidence_score, 2) if record.confidence_score else None
                }
                for record in attendance_records
            ],
            "summary": f"Found {len(attendance_records)} attendance record(s) for {user.name} {time_ref['label']}."
        }
    
    def _handle_failed_recognition(self, query: str, time_ref: Dict) -> Dict[str, Any]:
        """Handle queries about failed recognitions"""
        failed_records = self.db.query(
            Attendance.id,
            Attendance.user_id,
            Attendance.date,
            Attendance.clock_in,
            Attendance.confidence_score,
            Attendance.camera_id,
            User.name
        ).join(User).filter(
            and_(
                Attendance.date >= time_ref["start"].date(),
                Attendance.date <= time_ref["end"].date(),
                Attendance.confidence_score < 70
            )
        ).order_by(Attendance.confidence_score.asc()).all()
        
        failures = [
            {
                "id": record.id,
                "user_id": record.user_id,
                "user_name": record.name,
                "date": record.date.isoformat(),
                "time": record.clock_in.strftime("%H:%M:%S") if record.clock_in else "N/A",
                "confidence": round(record.confidence_score, 2) if record.confidence_score else 0,
                "camera_id": record.camera_id
            }
            for record in failed_records
        ]
        
        return {
            "type": "failed_recognitions",
            "period": time_ref["label"],
            "count": len(failures),
            "failures": failures,
            "summary": f"Found {len(failures)} failed recognition(s) (confidence < 70%) {time_ref['label']}."
        }
    
    def _handle_attendance_trends(self, query: str, time_ref: Dict) -> Dict[str, Any]:
        """Handle queries about attendance trends"""
        daily_attendance = self.db.query(
            Attendance.date,
            func.count(Attendance.id).label("count"),
            func.avg(Attendance.confidence_score).label("avg_confidence")
        ).filter(
            Attendance.date >= time_ref["start"].date()
        ).group_by(Attendance.date).order_by(Attendance.date).all()
        
        trend_data = [
            {
                "date": record.date.isoformat(),
                "count": record.count,
                "average_confidence": round(float(record.avg_confidence or 0), 2)
            }
            for record in daily_attendance
        ]
        
        # Calculate trend
        if len(trend_data) >= 2:
            recent_avg = sum(d["count"] for d in trend_data[-3:]) / min(3, len(trend_data))
            overall_avg = sum(d["count"] for d in trend_data) / len(trend_data)
            trend = "increasing" if recent_avg > overall_avg else "decreasing"
        else:
            trend = "stable"
        
        return {
            "type": "attendance_trends",
            "period": time_ref["label"],
            "daily_data": trend_data,
            "trend": trend,
            "average_daily_attendance": round(sum(d["count"] for d in trend_data) / len(trend_data), 2) if trend_data else 0,
            "summary": f"Attendance is {trend} {time_ref['label']} with an average of {round(sum(d['count'] for d in trend_data) / len(trend_data), 2) if trend_data else 0} employees per day."
        }
    
    def _handle_peak_times(self, query: str, time_ref: Dict) -> Dict[str, Any]:
        """Handle queries about peak arrival times"""
        hourly_arrivals = self.db.query(
            func.extract('hour', Attendance.clock_in).label('hour'),
            func.count(Attendance.id).label('count')
        ).filter(
            Attendance.date >= time_ref["start"].date()
        ).group_by('hour').order_by(func.count(Attendance.id).desc()).all()
        
        peak_hours = [
            {
                "hour": f"{int(record.hour):02d}:00",
                "count": record.count
            }
            for record in hourly_arrivals
        ]
        
        peak_hour = peak_hours[0] if peak_hours else None
        
        return {
            "type": "peak_times",
            "period": time_ref["label"],
            "hourly_data": peak_hours,
            "peak_hour": peak_hour,
            "summary": f"Peak arrival time is {peak_hour['hour']} with {peak_hour['count']} arrivals {time_ref['label']}." if peak_hour else "No peak time data available."
        }
    
    def _calculate_late_minutes(self, arrival_time, standard_time) -> int:
        """Calculate how many minutes late"""
        if not arrival_time:
            return 0
        
        arrival_seconds = arrival_time.hour * 3600 + arrival_time.minute * 60 + arrival_time.second
        standard_seconds = standard_time.hour * 3600 + standard_time.minute * 60 + standard_time.second
        
        diff_seconds = arrival_seconds - standard_seconds
        return max(0, diff_seconds // 60)
    
    def _get_last_attendance(self, user_id: str) -> Optional[str]:
        """Get user's last attendance date"""
        last_record = self.db.query(Attendance).filter(
            Attendance.user_id == user_id
        ).order_by(Attendance.date.desc()).first()
        
        return last_record.date.isoformat() if last_record else "Never"
    
    def _rate_performance(self, confidence: float) -> str:
        """Rate camera performance"""
        if confidence >= 90:
            return "Excellent"
        elif confidence >= 80:
            return "Good"
        elif confidence >= 70:
            return "Fair"
        else:
            return "Poor"
