import datetime
import uuid
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Date, Time, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

# 1. Authentication & Authorization
class Role(Base):
    __tablename__ = "roles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

class Permission(Base):
    __tablename__ = "permissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    permission_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    module: Mapped[str] = mapped_column(String(100), nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

class RolePermission(Base):
    __tablename__ = "role_permissions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    role_id: Mapped[str] = mapped_column(ForeignKey("roles.id", ondelete="CASCADE"), nullable=False)
    permission_id: Mapped[str] = mapped_column(ForeignKey("permissions.id", ondelete="CASCADE"), nullable=False)

class Organization(Base):
    __tablename__ = "organizations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class Department(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[Optional[str]] = mapped_column(ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class User(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    employee_number_student_number: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    username: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[str] = mapped_column(String(100), nullable=False)
    last_name: Mapped[str] = mapped_column(String(100), nullable=False)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    date_of_birth: Mapped[Optional[datetime.date]] = mapped_column(Date, nullable=True)
    profile_photo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="active")
    organization_id: Mapped[Optional[str]] = mapped_column(ForeignKey("organizations.id", ondelete="SET NULL"), nullable=True)
    department_id: Mapped[Optional[str]] = mapped_column(ForeignKey("departments.id", ondelete="SET NULL"), nullable=True)
    role_id: Mapped[Optional[str]] = mapped_column(ForeignKey("roles.id", ondelete="SET NULL"), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    updated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    deleted_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

class RefreshToken(Base):
    __tablename__ = "refresh_tokens"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    token: Mapped[str] = mapped_column(Text, nullable=False)
    expires_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    revoked: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class PasswordReset(Base):
    __tablename__ = "password_resets"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    otp: Mapped[str] = mapped_column(String(10), nullable=False)
    expires_at: Mapped[datetime.datetime] = mapped_column(DateTime, nullable=False)
    verified: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class LoginHistory(Base):
    __tablename__ = "login_history"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    browser: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    operating_system: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    login_time: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    logout_time: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="success")

# 2. Organization Structure
class Branch(Base):
    __tablename__ = "branches"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class Building(Base):
    __tablename__ = "buildings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    branch_id: Mapped[Optional[str]] = mapped_column(ForeignKey("branches.id", ondelete="CASCADE"), nullable=True)
    building_name: Mapped[str] = mapped_column(String(255), nullable=False)

class Room(Base):
    __tablename__ = "rooms"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    building_id: Mapped[str] = mapped_column(ForeignKey("buildings.id", ondelete="CASCADE"), nullable=False)
    room_number: Mapped[str] = mapped_column(String(100), nullable=False)

# 3. User Details
class UserProfile(Base):
    __tablename__ = "user_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    national_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    emergency_contact: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    address: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    blood_group: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)
    profile_completion: Mapped[float] = mapped_column(Float, default=100.0)

class Designation(Base):
    __tablename__ = "designations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

class UserDesignation(Base):
    __tablename__ = "user_designations"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    designation_id: Mapped[str] = mapped_column(ForeignKey("designations.id", ondelete="CASCADE"), nullable=False)

# 4. Facial Recognition
class FaceProfile(Base):
    __tablename__ = "face_profiles"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), unique=True, nullable=False)
    embedding_version: Mapped[str] = mapped_column(String(50), default="v1-ArcFace-512d")
    total_embeddings: Mapped[int] = mapped_column(Integer, default=0)
    enrollment_status: Mapped[str] = mapped_column(String(50), default="completed")
    average_confidence: Mapped[float] = mapped_column(Float, default=98.5)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class FaceEmbedding(Base):
    __tablename__ = "face_embeddings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    face_profile_id: Mapped[str] = mapped_column(ForeignKey("face_profiles.id", ondelete="CASCADE"), nullable=False)
    embedding_data: Mapped[str] = mapped_column(Text, nullable=False)
    quality_score: Mapped[float] = mapped_column(Float, default=95.0)
    pose_score: Mapped[float] = mapped_column(Float, default=98.0)
    lighting_score: Mapped[float] = mapped_column(Float, default=96.0)
    blur_score: Mapped[float] = mapped_column(Float, default=97.0)
    image_path: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class EnrollmentSession(Base):
    __tablename__ = "enrollment_sessions"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    captured_images: Mapped[int] = mapped_column(Integer, default=0)
    successful_images: Mapped[int] = mapped_column(Integer, default=0)
    enrollment_status: Mapped[str] = mapped_column(String(50), default="in_progress")
    started_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    completed_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

class Camera(Base):
    __tablename__ = "cameras"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    camera_name: Mapped[str] = mapped_column(String(255), nullable=False)
    camera_type: Mapped[str] = mapped_column(String(50), default="RTSP")
    rtsp_url: Mapped[str] = mapped_column(Text, nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="online")

class RecognitionLog(Base):
    __tablename__ = "recognition_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    camera_id: Mapped[Optional[str]] = mapped_column(ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True)
    confidence_score: Mapped[float] = mapped_column(Float, nullable=False)
    recognition_result: Mapped[str] = mapped_column(String(50), default="verified")
    recognition_image: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    processing_time: Mapped[float] = mapped_column(Float, default=0.045)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class UnknownFace(Base):
    __tablename__ = "unknown_faces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    camera_id: Mapped[Optional[str]] = mapped_column(ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True)
    snapshot: Mapped[str] = mapped_column(Text, nullable=False)
    confidence: Mapped[float] = mapped_column(Float, default=45.0)
    reviewed: Mapped[bool] = mapped_column(Boolean, default=False)
    assigned_user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    detected_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class Watchlist(Base):
    __tablename__ = "watchlist"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    reason: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

# 5. Liveness Detection
class LivenessCheck(Base):
    __tablename__ = "liveness_checks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    recognition_log_id: Mapped[str] = mapped_column(ForeignKey("recognition_logs.id", ondelete="CASCADE"), nullable=False)
    blink_detected: Mapped[bool] = mapped_column(Boolean, default=True)
    head_rotation: Mapped[bool] = mapped_column(Boolean, default=True)
    spoof_detected: Mapped[bool] = mapped_column(Boolean, default=False)
    liveness_score: Mapped[float] = mapped_column(Float, default=99.0)
    status: Mapped[str] = mapped_column(String(50), default="passed")

# 6. Attendance
class Attendance(Base):
    __tablename__ = "attendance"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    attendance_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    clock_in: Mapped[datetime.time] = mapped_column(Time, nullable=False)
    clock_out: Mapped[Optional[datetime.time]] = mapped_column(Time, nullable=True)
    total_hours: Mapped[float] = mapped_column(Float, default=0.0)
    attendance_status: Mapped[str] = mapped_column(String(50), default="present")
    recognition_log_id: Mapped[Optional[str]] = mapped_column(ForeignKey("recognition_logs.id", ondelete="SET NULL"), nullable=True)

class AttendanceBreak(Base):
    __tablename__ = "attendance_breaks"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    attendance_id: Mapped[str] = mapped_column(ForeignKey("attendance.id", ondelete="CASCADE"), nullable=False)
    break_start: Mapped[datetime.time] = mapped_column(Time, nullable=False)
    break_end: Mapped[Optional[datetime.time]] = mapped_column(Time, nullable=True)
    duration: Mapped[float] = mapped_column(Float, default=0.0)

class AttendanceCorrection(Base):
    __tablename__ = "attendance_corrections"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    attendance_id: Mapped[str] = mapped_column(ForeignKey("attendance.id", ondelete="CASCADE"), nullable=False)
    requested_by: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    approved_by: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")

class AttendanceRule(Base):
    __tablename__ = "attendance_rules"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    grace_period: Mapped[int] = mapped_column(Integer, default=15)
    late_after: Mapped[datetime.time] = mapped_column(Time, default=datetime.time(9, 15))
    minimum_hours: Mapped[float] = mapped_column(Float, default=8.0)
    overtime_after: Mapped[datetime.time] = mapped_column(Time, default=datetime.time(17, 0))

class AttendanceEvent(Base):
    __tablename__ = "attendance_events"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    attendance_id: Mapped[str] = mapped_column(ForeignKey("attendance.id", ondelete="CASCADE"), nullable=False)
    event: Mapped[str] = mapped_column(String(100), nullable=False)
    event_time: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    camera_id: Mapped[Optional[str]] = mapped_column(ForeignKey("cameras.id", ondelete="SET NULL"), nullable=True)

# 7. Leave Management
class LeaveType(Base):
    __tablename__ = "leave_types"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    leave_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

class LeaveRequest(Base):
    __tablename__ = "leave_requests"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    leave_type_id: Mapped[str] = mapped_column(ForeignKey("leave_types.id", ondelete="CASCADE"), nullable=False)
    start_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    end_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")

# 8. Scheduling
class Shift(Base):
    __tablename__ = "shifts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    shift_name: Mapped[str] = mapped_column(String(100), nullable=False)
    start_time: Mapped[datetime.time] = mapped_column(Time, nullable=False)
    end_time: Mapped[datetime.time] = mapped_column(Time, nullable=False)

class UserShift(Base):
    __tablename__ = "user_shifts"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    shift_id: Mapped[str] = mapped_column(ForeignKey("shifts.id", ondelete="CASCADE"), nullable=False)

class Holiday(Base):
    __tablename__ = "holidays"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    holiday_name: Mapped[str] = mapped_column(String(255), nullable=False)
    holiday_date: Mapped[datetime.date] = mapped_column(Date, nullable=False)

# 9. Camera Management
class CameraGroup(Base):
    __tablename__ = "camera_groups"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    group_name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)

class CameraGroupMember(Base):
    __tablename__ = "camera_group_members"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    group_id: Mapped[str] = mapped_column(ForeignKey("camera_groups.id", ondelete="CASCADE"), nullable=False)
    camera_id: Mapped[str] = mapped_column(ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False)

class CameraHealth(Base):
    __tablename__ = "camera_health"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    camera_id: Mapped[str] = mapped_column(ForeignKey("cameras.id", ondelete="CASCADE"), nullable=False)
    cpu_usage: Mapped[float] = mapped_column(Float, default=15.4)
    storage_usage: Mapped[float] = mapped_column(Float, default=45.0)
    online_status: Mapped[bool] = mapped_column(Boolean, default=True)
    checked_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

# 10. Visitor Management
class Visitor(Base):
    __tablename__ = "visitors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    organization: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    photo: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class VisitorVisit(Base):
    __tablename__ = "visitor_visits"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    visitor_id: Mapped[str] = mapped_column(ForeignKey("visitors.id", ondelete="CASCADE"), nullable=False)
    host_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    check_in: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
    check_out: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    purpose: Mapped[str] = mapped_column(Text, nullable=False)

# 11. Reports & Notifications
class GeneratedReport(Base):
    __tablename__ = "generated_reports"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    report_name: Mapped[str] = mapped_column(String(255), nullable=False)
    report_type: Mapped[str] = mapped_column(String(100), nullable=False)
    generated_by: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class NotificationTemplate(Base):
    __tablename__ = "notification_templates"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    subject: Mapped[str] = mapped_column(String(255), nullable=False)
    body: Mapped[str] = mapped_column(Text, nullable=False)

class Notification(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    notification_type: Mapped[str] = mapped_column(String(50), default="system")
    read_status: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

# 12. Audit & Logs
class AuditLog(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    module: Mapped[str] = mapped_column(String(100), nullable=False)
    ip_address: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class SystemLog(Base):
    __tablename__ = "system_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    level: Mapped[str] = mapped_column(String(50), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    module: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

# 13. Settings
class SystemSetting(Base):
    __tablename__ = "system_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    key: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    value: Mapped[str] = mapped_column(Text, nullable=False)

class OrganizationSetting(Base):
    __tablename__ = "organization_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    organization_id: Mapped[str] = mapped_column(ForeignKey("organizations.id", ondelete="CASCADE"), nullable=False)
    timezone: Mapped[str] = mapped_column(String(50), default="UTC+03:00")
    attendance_policy: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

# 14. Dashboard Analytics
class DashboardStatistic(Base):
    __tablename__ = "dashboard_statistics"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    attendance_today: Mapped[int] = mapped_column(Integer, default=0)
    recognition_accuracy: Mapped[float] = mapped_column(Float, default=99.4)
    unknown_faces: Mapped[int] = mapped_column(Integer, default=0)
    late_arrivals: Mapped[int] = mapped_column(Integer, default=0)
    generated_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

# 15. File Management
class FileModel(Base):
    __tablename__ = "files"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    uploaded_by: Mapped[Optional[str]] = mapped_column(ForeignKey("users.id", ondelete="SET NULL"), nullable=True)
    file_name: Mapped[str] = mapped_column(String(255), nullable=False)
    file_path: Mapped[str] = mapped_column(Text, nullable=False)
    file_type: Mapped[str] = mapped_column(String(100), nullable=False)
    size: Mapped[int] = mapped_column(Integer, default=0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

# 16. Background Jobs
class ScheduledJob(Base):
    __tablename__ = "scheduled_jobs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    job_name: Mapped[str] = mapped_column(String(100), nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="idle")
    started_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)
    finished_at: Mapped[Optional[datetime.datetime]] = mapped_column(DateTime, nullable=True)

# 17. API Management
class APIKey(Base):
    __tablename__ = "api_keys"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    key_name: Mapped[str] = mapped_column(String(100), nullable=False)
    api_key: Mapped[str] = mapped_column(String(255), unique=True, nullable=False)
    active: Mapped[bool] = mapped_column(Boolean, default=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class APILog(Base):
    __tablename__ = "api_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    endpoint: Mapped[str] = mapped_column(String(255), nullable=False)
    method: Mapped[str] = mapped_column(String(10), nullable=False)
    response_code: Mapped[int] = mapped_column(Integer, nullable=False)
    response_time: Mapped[float] = mapped_column(Float, nullable=False)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)
