import datetime
import uuid
from typing import List, Optional
from sqlalchemy import String, Integer, Float, Boolean, DateTime, Text, JSON, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.database.session import Base

def generate_uuid() -> str:
    return str(uuid.uuid4())

class UserModel(Base):
    __tablename__ = "users"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    employee_or_student_id: Mapped[str] = mapped_column("employee_number_student_number", String(100), unique=True, nullable=False, default=generate_uuid)
    username: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    email: Mapped[str] = mapped_column(String(255), unique=True, nullable=False, index=True)
    password_hash: Mapped[str] = mapped_column(String(255), nullable=False)
    first_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    last_name: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    role_id: Mapped[str] = mapped_column(String(50), default="employee_student")
    category: Mapped[str] = mapped_column(String(50), default="student")
    department_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    department_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    avatar: Mapped[Optional[str]] = mapped_column("profile_photo", Text, nullable=True)
    face_image_urls: Mapped[list] = mapped_column(JSON, default=list)
    status: Mapped[str] = mapped_column(String(50), default="active")
    accuracy_score: Mapped[float] = mapped_column(Float, default=98.5)
    registered_at: Mapped[str] = mapped_column(String(50), default=lambda: datetime.date.today().isoformat())
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    @property
    def name(self) -> str:
        if self.first_name and self.last_name:
            return f"{self.first_name} {self.last_name}"
        return self.first_name or self.last_name or self.username or self.email

    @name.setter
    def name(self, val: str):
        if val:
            parts = val.split(" ", 1)
            self.first_name = parts[0]
            self.last_name = parts[1] if len(parts) > 1 else ""

    @property
    def hashed_password(self) -> str:
        return self.password_hash

    @hashed_password.setter
    def hashed_password(self, val: str):
        self.password_hash = val

    @property
    def role(self) -> str:
        return self.role_id

    @role.setter
    def role(self, val: str):
        self.role_id = val

    embeddings = relationship("FaceEmbeddingModel", back_populates="user", cascade="all, delete-orphan")

class FaceEmbeddingModel(Base):
    __tablename__ = "face_embeddings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    embedding_vector: Mapped[list] = mapped_column(JSON, nullable=False) # 512 float floats
    image_url: Mapped[str] = mapped_column(Text, nullable=False)
    pose_label: Mapped[str] = mapped_column(String(50), default="Frontal")
    quality_score: Mapped[float] = mapped_column(Float, default=95.0)
    liveness_score: Mapped[float] = mapped_column(Float, default=99.0)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

    user = relationship("UserModel", back_populates="embeddings")

class AttendanceModel(Base):
    __tablename__ = "attendance"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False, index=True)
    user_name: Mapped[str] = mapped_column(String(255), nullable=False)
    user_category: Mapped[str] = mapped_column(String(50), default="student")
    user_avatar: Mapped[str] = mapped_column(Text, nullable=True)
    department: Mapped[str] = mapped_column(String(255), nullable=True)
    date: Mapped[str] = mapped_column(String(50), nullable=False, index=True)
    clock_in: Mapped[str] = mapped_column(String(50), nullable=False)
    clock_out: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="present")
    confidence_score: Mapped[float] = mapped_column(Float, default=99.0)
    recognition_image_url: Mapped[str] = mapped_column(Text, nullable=True)
    camera_name: Mapped[str] = mapped_column(String(255), nullable=True)
    camera_id: Mapped[str] = mapped_column(String(36), nullable=True)
    location: Mapped[str] = mapped_column(String(255), nullable=True)
    device_used: Mapped[str] = mapped_column(String(255), default="Biometric Terminal Alpha")
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    approval_status: Mapped[str] = mapped_column(String(50), default="approved")
    approved_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class CameraModel(Base):
    __tablename__ = "cameras"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    department: Mapped[str] = mapped_column(String(255), nullable=True)
    stream_url: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="online")
    ip_address: Mapped[str] = mapped_column(String(50), nullable=False)
    resolution: Mapped[str] = mapped_column(String(50), default="1080p Full HD")
    fps: Mapped[int] = mapped_column(Integer, default=30)
    bitrate: Mapped[str] = mapped_column(String(50), default="4.0 Mbps")
    active_recognition_count: Mapped[int] = mapped_column(Integer, default=0)
    total_detections_today: Mapped[int] = mapped_column(Integer, default=0)
    recording_status: Mapped[str] = mapped_column(String(50), default="recording")
    storage_used_gb: Mapped[float] = mapped_column(Float, default=150.0)
    bandwidth_mbps: Mapped[float] = mapped_column(Float, default=4.0)
    group_name: Mapped[str] = mapped_column(String(100), default="General Zone")
    last_ping_at: Mapped[str] = mapped_column(String(50), default="Just now")
    created_at: Mapped[datetime.datetime] = mapped_column(DateTime, default=datetime.datetime.utcnow)

class DepartmentModel(Base):
    __tablename__ = "departments"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    name: Mapped[str] = mapped_column(String(255), nullable=False)
    code: Mapped[str] = mapped_column(String(50), nullable=False, unique=True)
    parent_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    type: Mapped[str] = mapped_column(String(50), default="school")
    manager_name: Mapped[str] = mapped_column(String(255), default="Unassigned")
    total_users: Mapped[int] = mapped_column(Integer, default=0)
    total_cameras: Mapped[int] = mapped_column(Integer, default=0)
    building_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

class UnknownFaceModel(Base):
    __tablename__ = "unknown_faces"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    snapshot_url: Mapped[str] = mapped_column(Text, nullable=False)
    captured_at: Mapped[str] = mapped_column(String(100), nullable=False)
    camera_id: Mapped[str] = mapped_column(String(36), nullable=False)
    camera_name: Mapped[str] = mapped_column(String(255), nullable=False)
    location: Mapped[str] = mapped_column(String(255), nullable=False)
    confidence_score: Mapped[float] = mapped_column(Float, default=45.0)
    status: Mapped[str] = mapped_column(String(50), default="unassigned")
    candidates_json: Mapped[list] = mapped_column(JSON, default=list)
    assigned_user_id: Mapped[Optional[str]] = mapped_column(String(36), nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

class VisitorModel(Base):
    __tablename__ = "visitors"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    full_name: Mapped[str] = mapped_column(String(255), nullable=False)
    email: Mapped[str] = mapped_column(String(255), nullable=False)
    phone: Mapped[str] = mapped_column(String(50), nullable=True)
    company: Mapped[str] = mapped_column(String(255), nullable=True)
    host_user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    host_name: Mapped[str] = mapped_column(String(255), nullable=False)
    purpose: Mapped[str] = mapped_column(Text, nullable=False)
    expected_arrival: Mapped[str] = mapped_column(String(100), nullable=False)
    expected_departure: Mapped[str] = mapped_column(String(100), nullable=False)
    actual_check_in: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    actual_check_out: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    face_image_url: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    badge_number: Mapped[str] = mapped_column(String(50), unique=True, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="registered")

class LeaveModel(Base):
    __tablename__ = "leaves"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    user_id: Mapped[str] = mapped_column(String(36), nullable=False)
    user_name: Mapped[str] = mapped_column(String(255), nullable=False)
    user_avatar: Mapped[str] = mapped_column(Text, nullable=True)
    department: Mapped[str] = mapped_column(String(255), nullable=True)
    leave_type: Mapped[str] = mapped_column(String(50), default="annual")
    start_date: Mapped[str] = mapped_column(String(50), nullable=False)
    end_date: Mapped[str] = mapped_column(String(50), nullable=False)
    total_days: Mapped[int] = mapped_column(Integer, default=1)
    reason: Mapped[str] = mapped_column(Text, nullable=False)
    status: Mapped[str] = mapped_column(String(50), default="pending")
    applied_on: Mapped[str] = mapped_column(String(50), default=lambda: datetime.date.today().isoformat())
    approved_by: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

class AuditLogModel(Base):
    __tablename__ = "audit_logs"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    timestamp: Mapped[str] = mapped_column(String(100), nullable=False)
    actor_id: Mapped[str] = mapped_column(String(36), nullable=False)
    actor_name: Mapped[str] = mapped_column(String(255), nullable=False)
    actor_role: Mapped[str] = mapped_column(String(50), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_type: Mapped[str] = mapped_column(String(100), nullable=False)
    entity_id: Mapped[str] = mapped_column(String(100), nullable=False)
    details: Mapped[str] = mapped_column(Text, nullable=False)
    ip_address: Mapped[str] = mapped_column(String(50), default="127.0.0.1")
    status: Mapped[str] = mapped_column(String(50), default="success")

class NotificationModel(Base):
    __tablename__ = "notifications"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default=generate_uuid)
    title: Mapped[str] = mapped_column(String(255), nullable=False)
    message: Mapped[str] = mapped_column(Text, nullable=False)
    category: Mapped[str] = mapped_column(String(50), default="attendance")
    priority: Mapped[str] = mapped_column(String(50), default="medium")
    timestamp: Mapped[str] = mapped_column(String(50), default="Just now")
    is_read: Mapped[bool] = mapped_column(Boolean, default=False)
    action_url: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

class SystemSettingModel(Base):
    __tablename__ = "system_settings"

    id: Mapped[str] = mapped_column(String(36), primary_key=True, default="default")
    org_name: Mapped[str] = mapped_column(String(255), default="National Institute of Biometrics")
    org_code: Mapped[str] = mapped_column(String(50), default="NIB-01")
    timezone: Mapped[str] = mapped_column(String(50), default="UTC+03:00")
    date_format: Mapped[str] = mapped_column(String(50), default="YYYY-MM-DD")
    recognition_threshold: Mapped[float] = mapped_column(Float, default=85.0)
    quality_threshold: Mapped[float] = mapped_column(Float, default=75.0)
    enable_liveness_detection: Mapped[bool] = mapped_column(Boolean, default=True)
    enable_unknown_alerts: Mapped[bool] = mapped_column(Boolean, default=True)
    auto_approve_attendance: Mapped[bool] = mapped_column(Boolean, default=True)
    smtp_host: Mapped[str] = mapped_column(String(255), default="smtp.biometric.org")
    smtp_port: Mapped[int] = mapped_column(Integer, default=587)
    push_enabled: Mapped[bool] = mapped_column(Boolean, default=True)
