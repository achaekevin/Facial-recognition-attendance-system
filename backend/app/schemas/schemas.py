from typing import List, Optional
from pydantic import BaseModel, EmailStr, ConfigDict

# Token & Auth Schemas
class TokenSchema(BaseModel):
    access_token: str
    token_type: str = "bearer"
    user: dict

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class LockScreenUnlock(BaseModel):
    password: str

class OTPVerifyRequest(BaseModel):
    otp: str

class ResetPasswordRequest(BaseModel):
    password: str

# User Schemas
class UserBase(BaseModel):
    name: str
    email: EmailStr
    phone: Optional[str] = None
    role: str = "employee_student"
    category: str = "student"
    department_id: Optional[str] = None
    department_name: Optional[str] = None
    avatar: Optional[str] = None
    face_image_urls: List[str] = []
    status: str = "active"
    accuracy_score: float = 98.5
    employee_or_student_id: str

class UserCreate(UserBase):
    password: str = "admin123"

class UserResponse(UserBase):
    id: str
    registered_at: str
    model_config = ConfigDict(from_attributes=True)

# Face Enrollment & Recognition Schemas
class FaceEnrollRequest(BaseModel):
    user_id: str
    image_base64_or_url: str
    pose_label: str = "Frontal"

class MultiPoseEnrollmentRequest(BaseModel):
    user_id: str
    front_image: str
    left_image: str
    right_image: str
    smile_image: str

class MultiPoseEnrollmentResponse(BaseModel):
    success: bool
    user_id: str
    composite_accuracy_score: float
    message: str
    enrolled_poses_count: int

class FaceRecognitionFrame(BaseModel):
    camera_id: str
    image_data: str # base64 or URL

class FaceRecognitionResult(BaseModel):
    recognized: bool
    user_id: Optional[str] = None
    name: Optional[str] = None
    confidence_score: float
    is_liveness_valid: bool = True
    is_unknown: bool = False

class MobileGeofenceCheckinRequest(BaseModel):
    user_id: str
    image_data: str
    latitude: float
    longitude: float

class MobileGeofenceCheckinResponse(BaseModel):
    success: bool
    status: str
    distance_meters: float
    message: str
    timestamp: str

# Attendance Schemas
class AttendanceBase(BaseModel):
    user_id: str
    user_name: str
    user_category: str = "student"
    user_avatar: Optional[str] = None
    department: Optional[str] = None
    date: str
    clock_in: str
    clock_out: Optional[str] = None
    status: str = "present"
    confidence_score: float = 99.0
    recognition_image_url: Optional[str] = None
    camera_name: Optional[str] = None
    camera_id: Optional[str] = None
    location: Optional[str] = None
    device_used: str = "Biometric Terminal"
    notes: Optional[str] = None
    approval_status: str = "approved"
    approved_by: Optional[str] = None

class AttendanceCreate(AttendanceBase):
    pass

class AttendanceResponse(AttendanceBase):
    id: str
    model_config = ConfigDict(from_attributes=True)

# Camera Schemas
class CameraBase(BaseModel):
    name: str
    location: str
    department: Optional[str] = None
    stream_url: str
    status: str = "online"
    ip_address: str
    resolution: str = "1080p Full HD"
    fps: int = 30
    bitrate: str = "4.0 Mbps"

class CameraCreate(CameraBase):
    pass

class CameraResponse(CameraBase):
    id: str
    active_recognition_count: int = 0
    total_detections_today: int = 0
    recording_status: str = "recording"
    storage_used_gb: float = 150.0
    bandwidth_mbps: float = 4.0
    group_name: str = "General Zone"
    last_ping_at: str = "Just now"
    model_config = ConfigDict(from_attributes=True)

# Department Schemas
class DepartmentBase(BaseModel):
    name: str
    code: str
    parent_id: Optional[str] = None
    type: str = "school"
    manager_name: str = "Unassigned"
    building_name: Optional[str] = None

class DepartmentCreate(DepartmentBase):
    pass

class DepartmentResponse(DepartmentBase):
    id: str
    total_users: int = 0
    total_cameras: int = 0
    model_config = ConfigDict(from_attributes=True)

# Visitor Schemas
class VisitorBase(BaseModel):
    full_name: str
    email: EmailStr
    phone: Optional[str] = None
    company: Optional[str] = None
    host_user_id: str
    host_name: str
    purpose: str
    expected_arrival: str
    expected_departure: str
    face_image_url: Optional[str] = None

class VisitorCreate(VisitorBase):
    pass

class VisitorResponse(VisitorBase):
    id: str
    badge_number: str
    status: str = "registered"
    actual_check_in: Optional[str] = None
    actual_check_out: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Leave Schemas
class LeaveCreate(BaseModel):
    user_id: str
    user_name: str
    user_avatar: Optional[str] = None
    department: Optional[str] = None
    leave_type: str = "annual"
    start_date: str
    end_date: str
    total_days: int = 1
    reason: str

class LeaveResponse(LeaveCreate):
    id: str
    status: str = "pending"
    applied_on: str
    approved_by: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

# Notification & Audit Schemas
class SystemNotificationResponse(BaseModel):
    id: str
    title: str
    message: str
    category: str
    priority: str
    timestamp: str
    is_read: bool
    action_url: Optional[str] = None
    model_config = ConfigDict(from_attributes=True)

class AuditLogResponse(BaseModel):
    id: str
    timestamp: str
    actor_id: str
    actor_name: str
    actor_role: str
    action: str
    entity_type: str
    entity_id: str
    details: str
    ip_address: str
    status: str
    model_config = ConfigDict(from_attributes=True)
