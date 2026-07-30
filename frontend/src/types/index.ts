export type UserRole = 
  | 'super_admin' 
  | 'hr_admin' 
  | 'lecturer_teacher' 
  | 'security_officer' 
  | 'employee_student';

export type UserCategory = 
  | 'student' 
  | 'employee' 
  | 'lecturer' 
  | 'visitor' 
  | 'contractor';

export type UserStatus = 'active' | 'suspended' | 'pending_enrollment';

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: UserRole;
  category: UserCategory;
  departmentId: string;
  departmentName: string;
  avatar: string;
  faceImageUrls: string[];
  status: UserStatus;
  accuracyScore: number; // e.g. 98.6
  registeredAt: string;
  employeeOrStudentId: string;
  nationalId?: string;
  position?: string;
  notes?: string;
}

export type AttendanceStatus = 
  | 'present' 
  | 'absent' 
  | 'late' 
  | 'early_leave' 
  | 'overtime' 
  | 'missed';

export type ApprovalStatus = 'approved' | 'pending' | 'rejected';

export interface AttendanceRecord {
  id: string;
  userId: string;
  userName: string;
  userCategory: UserCategory;
  userAvatar: string;
  department: string;
  date: string; // YYYY-MM-DD
  clockIn: string; // HH:mm:ss
  clockOut?: string; // HH:mm:ss
  status: AttendanceStatus;
  confidenceScore: number; // 0-100
  recognitionImageUrl: string;
  cameraName: string;
  cameraId: string;
  location: string;
  gps?: { lat: number; lng: number };
  deviceUsed: string;
  workingHours?: number; // e.g. 7.5
  breakTime?: number; // e.g. 0.5
  notes?: string;
  approvalStatus: ApprovalStatus;
  approvedBy?: string;
}

export type CameraStatus = 'online' | 'offline' | 'warning';
export type RecordingStatus = 'recording' | 'idle' | 'error';

export interface CameraNode {
  id: string;
  name: string;
  location: string;
  department: string;
  streamUrl: string;
  status: CameraStatus;
  ipAddress: string;
  resolution: string; // e.g. "1080p (60fps)"
  fps: number;
  bitrate: string; // e.g. "4.2 Mbps"
  activeRecognitionCount: number;
  totalDetectionsToday: number;
  recordingStatus: RecordingStatus;
  storageUsedGB: number;
  bandwidthMbps: number;
  groupName: string;
  lastPingAt: string;
}

export type DepartmentType = 'faculty' | 'school' | 'branch' | 'building' | 'room' | 'class' | 'lab';

export interface DepartmentNode {
  id: string;
  name: string;
  code: string;
  parentId?: string;
  type: DepartmentType;
  managerName: string;
  totalUsers: number;
  totalCameras: number;
  buildingName?: string;
}

export type UnknownFaceStatus = 'unassigned' | 'assigned' | 'rejected' | 'blacklisted' | 'watchlist';

export interface FaceCandidateMatch {
  userId: string;
  name: string;
  avatar: string;
  score: number; // 0 - 100
  department: string;
}

export interface UnknownFaceRecord {
  id: string;
  snapshotUrl: string;
  capturedAt: string;
  cameraId: string;
  cameraName: string;
  location: string;
  confidenceScore: number;
  status: UnknownFaceStatus;
  candidates: FaceCandidateMatch[];
  assignedUserId?: string;
  assignedUserName?: string;
  notes?: string;
}

export type VisitorStatus = 'registered' | 'checked_in' | 'checked_out' | 'expired';

export interface VisitorRecord {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  company: string;
  hostUserId: string;
  hostName: string;
  purpose: string;
  expectedArrival: string;
  expectedDeparture: string;
  actualCheckIn?: string;
  actualCheckOut?: string;
  faceImageUrl?: string;
  badgeNumber: string;
  status: VisitorStatus;
}

export type LeaveType = 'annual' | 'medical' | 'emergency' | 'unpaid';

export interface LeaveRequest {
  id: string;
  userId: string;
  userName: string;
  userAvatar: string;
  department: string;
  leaveType: LeaveType;
  startDate: string;
  endDate: string;
  totalDays: number;
  reason: string;
  attachmentUrl?: string;
  status: ApprovalStatus;
  appliedOn: string;
  approvedBy?: string;
}

export interface ShiftSchedule {
  id: string;
  name: string;
  startTime: string; // "09:00"
  endTime: string; // "17:00"
  gracePeriodMinutes: number;
  lateThresholdMinutes: number;
  overtimeAllowed: boolean;
  activeDays: number[]; // 1-7
  departmentIds: string[];
}

export type NotificationCategory = 
  | 'attendance' 
  | 'unknown_person' 
  | 'camera_offline' 
  | 'low_accuracy' 
  | 'leave_request' 
  | 'security';

export interface SystemNotification {
  id: string;
  title: string;
  message: string;
  category: NotificationCategory;
  priority: 'high' | 'medium' | 'low';
  timestamp: string;
  isRead: boolean;
  actionUrl?: string;
  metadata?: Record<string, unknown>;
}

export interface AuditLogEntry {
  id: string;
  timestamp: string;
  actorId: string;
  actorName: string;
  actorRole: UserRole;
  action: string;
  entityType: string;
  entityId: string;
  details: string;
  ipAddress: string;
  status: 'success' | 'failure' | 'warning';
}

export interface SystemSettings {
  orgName: string;
  orgCode: string;
  timezone: string;
  dateFormat: string;
  recognitionThreshold: number; // e.g. 85 (percent)
  qualityThreshold: number; // e.g. 75
  enableLivenessDetection: boolean;
  enableUnknownAlerts: boolean;
  autoApproveAttendance: boolean;
  smtpHost: string;
  smtpPort: number;
  smsGatewayUrl: string;
  pushEnabled: boolean;
  apiKeys: Array<{ id: string; name: string; key: string; createdAt: string; lastUsed: string }>;
  backupSchedule: 'daily' | 'weekly' | 'manual';
  lastBackupAt: string;
}
