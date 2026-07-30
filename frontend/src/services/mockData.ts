import { 
  User, 
  AttendanceRecord, 
  CameraNode, 
  DepartmentNode, 
  UnknownFaceRecord, 
  VisitorRecord, 
  LeaveRequest, 
  SystemNotification, 
  AuditLogEntry, 
  SystemSettings 
} from '../types';

export const initialDepartments: DepartmentNode[] = [
  { id: 'dept-1', name: 'School of Engineering & Tech', code: 'SET', type: 'faculty', managerName: 'Unassigned Manager', totalUsers: 0, totalCameras: 1, buildingName: 'Main Campus' },
  { id: 'dept-2', name: 'Computer Science & AI Dept', code: 'CSAI', parentId: 'dept-1', type: 'school', managerName: 'Unassigned Manager', totalUsers: 0, totalCameras: 1, buildingName: 'Main Campus' },
  { id: 'dept-3', name: 'Human Resources Administration', code: 'HRD', type: 'branch', managerName: 'Unassigned Manager', totalUsers: 0, totalCameras: 1, buildingName: 'Admin Building' },
  { id: 'dept-4', name: 'Campus Security & Operations', code: 'SEC', type: 'building', managerName: 'Unassigned Manager', totalUsers: 0, totalCameras: 1, buildingName: 'Security Ops Center' },
];

export const initialCameras: CameraNode[] = [
  { id: 'cam-01', name: 'Main Gate Entrance Alpha', location: 'Main Gate Gatehouse', department: 'Campus Security & Operations', streamUrl: 'https://images.unsplash.com/photo-1557804506-669a67965ba0?auto=format&fit=crop&w=800&q=80', status: 'online', ipAddress: '192.168.1.101', resolution: '4K UHD (60fps)', fps: 60, bitrate: '8.4 Mbps', activeRecognitionCount: 0, totalDetectionsToday: 0, recordingStatus: 'recording', storageUsedGB: 0, bandwidthMbps: 8.4, groupName: 'Perimeter Access', lastPingAt: 'Just now' },
];

// Cleaned: 0 fake users, 0 fake logs, 0 fake stats
export const initialUsers: User[] = [];
export const initialAttendance: AttendanceRecord[] = [];
export const initialUnknownFaces: UnknownFaceRecord[] = [];
export const initialVisitors: VisitorRecord[] = [];
export const initialLeaves: LeaveRequest[] = [];
export const initialNotifications: SystemNotification[] = [];
export const initialAuditLogs: AuditLogEntry[] = [];

export const initialSettings: SystemSettings = {
  orgName: 'National Institute of Biometric Technology',
  orgCode: 'NIBT-GLOBAL',
  timezone: 'UTC+03:00 (Riyadh / Istanbul)',
  dateFormat: 'YYYY-MM-DD',
  recognitionThreshold: 85,
  qualityThreshold: 75,
  enableLivenessDetection: true,
  enableUnknownAlerts: true,
  autoApproveAttendance: true,
  smtpHost: 'smtp.biometric-attend.org',
  smtpPort: 587,
  smsGatewayUrl: 'https://api.twilio.com/2010-04-01/Accounts/ACxxx/Messages',
  pushEnabled: true,
  apiKeys: [],
  backupSchedule: 'daily',
  lastBackupAt: 'Clean Initialization',
};
