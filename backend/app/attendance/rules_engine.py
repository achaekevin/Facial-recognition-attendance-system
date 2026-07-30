"""
Smart Attendance Verification Rules Engine.
Implements comprehensive validation checks before recording attendance.
"""
from datetime import datetime, time, timedelta
from typing import Dict, List, Optional, Tuple, Any
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, and_, func
import math


class AttendanceRulesEngine:
    """
    Validates attendance based on multiple business rules.
    """
    
    def __init__(self):
        # Default configuration
        self.min_confidence_threshold = 0.85
        self.duplicate_window_minutes = 5  # Prevent duplicate check-ins within 5 minutes
        self.max_daily_checkins = 10  # Maximum check-ins per day
        self.geofencing_enabled = False
        self.geofencing_radius_meters = 100
        self.working_hours_enforcement = True
        self.shift_validation_enabled = True
        self.camera_location_validation = True
        
    async def validate_attendance(
        self,
        db: AsyncSession,
        user_id: str,
        confidence_score: float,
        camera_id: Optional[str],
        timestamp: datetime,
        location: Optional[Dict[str, float]] = None,
        liveness_score: Optional[float] = None
    ) -> Tuple[bool, str, Dict[str, Any]]:
        """
        Comprehensive attendance validation workflow.
        
        Validation Flow:
        1. Face Detection ✓ (already done before this)
        2. Liveness Check
        3. Recognition Confidence
        4. Duplicate Prevention
        5. Working Hours Check
        6. Shift Validation
        7. Camera Location Validation
        8. Geofencing (if enabled)
        
        Args:
            db: Database session
            user_id: User ID
            confidence_score: Face recognition confidence (0-1)
            camera_id: Camera ID where recognition occurred
            timestamp: Recognition timestamp
            location: Optional GPS coordinates {"lat": float, "lng": float}
            liveness_score: Optional liveness detection score (0-1)
            
        Returns:
            Tuple of (is_valid, reason, validation_details)
        """
        validation_results = {
            "checks": {},
            "scores": {
                "confidence": confidence_score,
                "liveness": liveness_score
            },
            "timestamp": timestamp.isoformat(),
            "camera_id": camera_id
        }
        
        # Step 1: Liveness Check
        if liveness_score is not None:
            liveness_valid, liveness_reason = self._check_liveness(liveness_score)
            validation_results["checks"]["liveness"] = {
                "passed": liveness_valid,
                "reason": liveness_reason,
                "score": liveness_score
            }
            if not liveness_valid:
                return False, f"Liveness check failed: {liveness_reason}", validation_results
        
        # Step 2: Recognition Confidence Check
        confidence_valid, confidence_reason = self._check_confidence(confidence_score)
        validation_results["checks"]["confidence"] = {
            "passed": confidence_valid,
            "reason": confidence_reason,
            "score": confidence_score
        }
        if not confidence_valid:
            return False, f"Confidence too low: {confidence_reason}", validation_results
        
        # Step 3: Duplicate Prevention
        duplicate_valid, duplicate_reason = await self._check_duplicate_attendance(
            db, user_id, timestamp
        )
        validation_results["checks"]["duplicate"] = {
            "passed": duplicate_valid,
            "reason": duplicate_reason
        }
        if not duplicate_valid:
            return False, f"Duplicate attendance: {duplicate_reason}", validation_results
        
        # Step 4: Working Hours Check
        if self.working_hours_enforcement:
            hours_valid, hours_reason, shift_info = await self._check_working_hours(
                db, user_id, timestamp
            )
            validation_results["checks"]["working_hours"] = {
                "passed": hours_valid,
                "reason": hours_reason,
                "shift_info": shift_info
            }
            if not hours_valid:
                return False, f"Outside working hours: {hours_reason}", validation_results
        
        # Step 5: Shift Validation
        if self.shift_validation_enabled:
            shift_valid, shift_reason = await self._check_shift_assignment(
                db, user_id, timestamp
            )
            validation_results["checks"]["shift"] = {
                "passed": shift_valid,
                "reason": shift_reason
            }
            if not shift_valid:
                return False, f"Shift validation failed: {shift_reason}", validation_results
        
        # Step 6: Camera Location Validation
        if self.camera_location_validation and camera_id:
            camera_valid, camera_reason = await self._check_camera_assignment(
                db, user_id, camera_id
            )
            validation_results["checks"]["camera"] = {
                "passed": camera_valid,
                "reason": camera_reason,
                "camera_id": camera_id
            }
            if not camera_valid:
                return False, f"Camera validation failed: {camera_reason}", validation_results
        
        # Step 7: Geofencing (if enabled and location provided)
        if self.geofencing_enabled and location:
            geo_valid, geo_reason = await self._check_geofence(
                db, user_id, location
            )
            validation_results["checks"]["geofence"] = {
                "passed": geo_valid,
                "reason": geo_reason,
                "location": location
            }
            if not geo_valid:
                return False, f"Geofencing violation: {geo_reason}", validation_results
        
        # Step 8: Daily Check-in Limit
        limit_valid, limit_reason = await self._check_daily_limit(
            db, user_id, timestamp.date()
        )
        validation_results["checks"]["daily_limit"] = {
            "passed": limit_valid,
            "reason": limit_reason
        }
        if not limit_valid:
            return False, f"Daily limit exceeded: {limit_reason}", validation_results
        
        # All checks passed
        validation_results["overall_status"] = "approved"
        return True, "All validation checks passed", validation_results
    
    def _check_liveness(self, liveness_score: float) -> Tuple[bool, str]:
        """
        Validate liveness detection score.
        """
        min_liveness = 0.5  # 50% minimum liveness confidence
        
        if liveness_score < min_liveness:
            return False, f"Liveness score {liveness_score:.2%} below minimum {min_liveness:.2%}"
        
        return True, f"Liveness score acceptable: {liveness_score:.2%}"
    
    def _check_confidence(self, confidence_score: float) -> Tuple[bool, str]:
        """
        Validate face recognition confidence score.
        """
        if confidence_score < self.min_confidence_threshold:
            return False, f"Recognition confidence {confidence_score:.2%} below threshold {self.min_confidence_threshold:.2%}"
        
        return True, f"Recognition confidence acceptable: {confidence_score:.2%}"
    
    async def _check_duplicate_attendance(
        self,
        db: AsyncSession,
        user_id: str,
        timestamp: datetime
    ) -> Tuple[bool, str]:
        """
        Prevent duplicate attendance within specified time window.
        """
        from app.models.models import AttendanceModel
        
        # Check for recent attendance
        window_start = timestamp - timedelta(minutes=self.duplicate_window_minutes)
        window_end = timestamp + timedelta(minutes=self.duplicate_window_minutes)
        
        result = await db.execute(
            select(AttendanceModel).where(
                and_(
                    AttendanceModel.user_id == user_id,
                    AttendanceModel.attendance_date == timestamp.date(),
                    AttendanceModel.clock_in >= window_start.time(),
                    AttendanceModel.clock_in <= window_end.time()
                )
            )
        )
        
        existing_attendance = result.scalars().first()
        
        if existing_attendance:
            return False, f"Duplicate attendance detected within {self.duplicate_window_minutes} minutes"
        
        return True, "No duplicate attendance found"
    
    async def _check_working_hours(
        self,
        db: AsyncSession,
        user_id: str,
        timestamp: datetime
    ) -> Tuple[bool, str, Optional[Dict[str, Any]]]:
        """
        Validate attendance is within working hours.
        """
        # Default working hours (can be fetched from database)
        default_start = time(8, 0)  # 8:00 AM
        default_end = time(18, 0)   # 6:00 PM
        
        # Get user's shift/schedule from database
        # For now, using default hours
        working_start = default_start
        working_end = default_end
        
        current_time = timestamp.time()
        
        # Check if within working hours
        if working_start <= current_time <= working_end:
            shift_info = {
                "shift_start": working_start.isoformat(),
                "shift_end": working_end.isoformat(),
                "current_time": current_time.isoformat(),
                "status": "on_time" if current_time <= time(9, 0) else "late"
            }
            return True, "Within working hours", shift_info
        
        shift_info = {
            "shift_start": working_start.isoformat(),
            "shift_end": working_end.isoformat(),
            "current_time": current_time.isoformat(),
            "status": "outside_hours"
        }
        
        return False, f"Outside working hours ({working_start.strftime('%H:%M')} - {working_end.strftime('%H:%M')})", shift_info
    
    async def _check_shift_assignment(
        self,
        db: AsyncSession,
        user_id: str,
        timestamp: datetime
    ) -> Tuple[bool, str]:
        """
        Validate user has an assigned shift for the current time.
        """
        # Query user's shift assignment
        # For demonstration, assuming user has valid shift
        # In production, query shifts table
        
        day_of_week = timestamp.strftime('%A')
        
        # Mock shift validation - replace with actual DB query
        has_shift = True  # Query from user_shifts table
        
        if not has_shift:
            return False, f"No shift assigned for {day_of_week}"
        
        return True, f"Valid shift assignment for {day_of_week}"
    
    async def _check_camera_assignment(
        self,
        db: AsyncSession,
        user_id: str,
        camera_id: str
    ) -> Tuple[bool, str]:
        """
        Validate user is authorized to use this camera location.
        """
        from app.models.models import CameraModel, UserModel
        
        # Get camera details
        camera_result = await db.execute(
            select(CameraModel).where(CameraModel.id == camera_id)
        )
        camera = camera_result.scalars().first()
        
        if not camera:
            return False, f"Camera {camera_id} not found"
        
        # Get user details
        user_result = await db.execute(
            select(UserModel).where(UserModel.id == user_id)
        )
        user = user_result.scalars().first()
        
        if not user:
            return False, f"User {user_id} not found"
        
        # Check if camera location matches user's assigned location/department
        # For now, all cameras are valid for all users
        # In production, implement location-based restrictions
        
        camera_location = getattr(camera, 'location', 'Unknown')
        
        return True, f"Camera authorized: {camera_location}"
    
    async def _check_geofence(
        self,
        db: AsyncSession,
        user_id: str,
        location: Dict[str, float]
    ) -> Tuple[bool, str]:
        """
        Validate user is within allowed geographic area.
        """
        # Get organization/office location from database
        # For demonstration, using mock coordinates
        office_location = {
            "lat": 40.7128,  # New York City (example)
            "lng": -74.0060
        }
        
        # Calculate distance using Haversine formula
        distance = self._calculate_distance(
            location["lat"], location["lng"],
            office_location["lat"], office_location["lng"]
        )
        
        if distance > self.geofencing_radius_meters:
            return False, f"Location {distance:.0f}m from office (max: {self.geofencing_radius_meters}m)"
        
        return True, f"Within geofence ({distance:.0f}m from office)"
    
    def _calculate_distance(
        self,
        lat1: float, lng1: float,
        lat2: float, lng2: float
    ) -> float:
        """
        Calculate distance between two coordinates using Haversine formula.
        Returns distance in meters.
        """
        R = 6371000  # Earth's radius in meters
        
        phi1 = math.radians(lat1)
        phi2 = math.radians(lat2)
        delta_phi = math.radians(lat2 - lat1)
        delta_lambda = math.radians(lng2 - lng1)
        
        a = (math.sin(delta_phi / 2) ** 2 +
             math.cos(phi1) * math.cos(phi2) * math.sin(delta_lambda / 2) ** 2)
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        
        distance = R * c
        return distance
    
    async def _check_daily_limit(
        self,
        db: AsyncSession,
        user_id: str,
        date: datetime.date
    ) -> Tuple[bool, str]:
        """
        Prevent excessive check-ins in a single day.
        """
        from app.models.models import AttendanceModel
        
        # Count today's attendance records
        result = await db.execute(
            select(func.count(AttendanceModel.id)).where(
                and_(
                    AttendanceModel.user_id == user_id,
                    AttendanceModel.attendance_date == date
                )
            )
        )
        
        count = result.scalar() or 0
        
        if count >= self.max_daily_checkins:
            return False, f"Daily limit reached ({count}/{self.max_daily_checkins} check-ins)"
        
        return True, f"Within daily limit ({count}/{self.max_daily_checkins} check-ins)"
    
    def get_validation_summary(self, validation_details: Dict[str, Any]) -> str:
        """
        Generate human-readable validation summary.
        """
        checks = validation_details.get("checks", {})
        passed_count = sum(1 for check in checks.values() if check.get("passed"))
        total_count = len(checks)
        
        summary_parts = [
            f"Validation: {passed_count}/{total_count} checks passed",
            f"Confidence: {validation_details['scores']['confidence']:.1%}"
        ]
        
        if validation_details['scores'].get('liveness'):
            summary_parts.append(f"Liveness: {validation_details['scores']['liveness']:.1%}")
        
        failed_checks = [
            name for name, result in checks.items()
            if not result.get("passed")
        ]
        
        if failed_checks:
            summary_parts.append(f"Failed: {', '.join(failed_checks)}")
        
        return " | ".join(summary_parts)
