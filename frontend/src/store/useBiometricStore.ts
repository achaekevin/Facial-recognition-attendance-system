import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { 
  User, 
  AttendanceRecord, 
  CameraNode, 
  DepartmentNode, 
  UnknownFaceRecord, 
  VisitorRecord, 
  LeaveRequest, 
  AuditLogEntry, 
  SystemSettings 
} from '../types';
import { 
  initialUsers, 
  initialAttendance, 
  initialCameras, 
  initialDepartments, 
  initialUnknownFaces, 
  initialVisitors, 
  initialLeaves, 
  initialAuditLogs, 
  initialSettings 
} from '../services/mockData';

interface BiometricState {
  users: User[];
  attendance: AttendanceRecord[];
  cameras: CameraNode[];
  departments: DepartmentNode[];
  unknownFaces: UnknownFaceRecord[];
  visitors: VisitorRecord[];
  leaves: LeaveRequest[];
  auditLogs: AuditLogEntry[];
  settings: SystemSettings;

  // Actions
  addUser: (user: Omit<User, 'id' | 'registeredAt'>) => void;
  updateUser: (id: string, updated: Partial<User>) => void;
  deleteUser: (id: string) => void;
  toggleUserStatus: (id: string) => void;

  addAttendance: (rec: Omit<AttendanceRecord, 'id'>) => void;
  updateAttendance: (id: string, updated: Partial<AttendanceRecord>) => void;
  deleteAttendance: (id: string) => void;

  addCamera: (cam: Omit<CameraNode, 'id'>) => void;
  updateCamera: (id: string, updated: Partial<CameraNode>) => void;
  deleteCamera: (id: string) => void;

  addDepartment: (dept: Omit<DepartmentNode, 'id'>) => void;
  
  resolveUnknownFace: (id: string, status: UnknownFaceRecord['status'], userId?: string) => void;
  deleteUnknownFace: (id: string) => void;
  
  addVisitor: (vis: Omit<VisitorRecord, 'id' | 'badgeNumber'>) => void;
  checkoutVisitor: (id: string) => void;
  deleteVisitor: (id: string) => void;

  addLeave: (leave: Omit<LeaveRequest, 'id' | 'appliedOn' | 'status'>) => void;
  updateLeaveStatus: (id: string, status: 'approved' | 'rejected', approver: string) => void;

  updateSettings: (settings: Partial<SystemSettings>) => void;
  addAuditLog: (action: string, entityType: string, entityId: string, details: string, actorName: string, actorRole: any) => void;
}

export const useBiometricStore = create<BiometricState>()(
  persist(
    (set) => ({
      users: initialUsers,
      attendance: initialAttendance,
      cameras: initialCameras,
      departments: initialDepartments,
      unknownFaces: initialUnknownFaces,
      visitors: initialVisitors,
      leaves: initialLeaves,
      auditLogs: initialAuditLogs,
      settings: initialSettings,

      addUser: (user) => {
        const newUser: User = {
          ...user,
          id: `usr-${Date.now()}`,
          registeredAt: new Date().toISOString().split('T')[0],
        };
        set((state) => ({ users: [newUser, ...state.users] }));
      },

      updateUser: (id, updated) => {
        set((state) => ({
          users: state.users.map((u) => (u.id === id ? { ...u, ...updated } : u)),
        }));
      },

      deleteUser: (id) => {
        set((state) => ({
          users: state.users.filter((u) => u.id !== id),
        }));
      },

      toggleUserStatus: (id) => {
        set((state) => ({
          users: state.users.map((u) =>
            u.id === id
              ? { ...u, status: u.status === 'active' ? 'suspended' : 'active' }
              : u
          ),
        }));
      },

      addAttendance: (rec) => {
        const newAtt: AttendanceRecord = {
          ...rec,
          id: `att-${Date.now()}`,
        };
        set((state) => ({ attendance: [newAtt, ...state.attendance] }));
      },

      updateAttendance: (id, updated) => {
        set((state) => ({
          attendance: state.attendance.map((a) => (a.id === id ? { ...a, ...updated } : a)),
        }));
      },

      deleteAttendance: (id) => {
        set((state) => ({
          attendance: state.attendance.filter((a) => a.id !== id),
        }));
      },

      addCamera: (cam) => {
        const newCam: CameraNode = {
          ...cam,
          id: `cam-${Date.now()}`,
        };
        set((state) => ({ cameras: [...state.cameras, newCam] }));
      },

      updateCamera: (id, updated) => {
        set((state) => ({
          cameras: state.cameras.map((c) => (c.id === id ? { ...c, ...updated } : c)),
        }));
      },

      deleteCamera: (id) => {
        set((state) => ({
          cameras: state.cameras.filter((c) => c.id !== id),
        }));
      },

      addDepartment: (dept) => {
        const newDept: DepartmentNode = {
          ...dept,
          id: `dept-${Date.now()}`,
        };
        set((state) => ({ departments: [...state.departments, newDept] }));
      },

      resolveUnknownFace: (id, status, userId) => {
        set((state) => ({
          unknownFaces: state.unknownFaces.map((f) =>
            f.id === id ? { ...f, status, assignedUserId: userId } : f
          ),
        }));
      },

      deleteUnknownFace: (id) => {
        set((state) => ({
          unknownFaces: state.unknownFaces.filter((f) => f.id !== id),
        }));
      },

      addVisitor: (vis) => {
        const newVis: VisitorRecord = {
          ...vis,
          id: `vis-${Date.now()}`,
          badgeNumber: `VIS-${Math.floor(1000 + Math.random() * 9000)}`,
          status: 'checked_in',
          actualCheckIn: new Date().toLocaleString(),
        };
        set((state) => ({ visitors: [newVis, ...state.visitors] }));
      },

      checkoutVisitor: (id) => {
        set((state) => ({
          visitors: state.visitors.map((v) =>
            v.id === id
              ? { ...v, status: 'checked_out', actualCheckOut: new Date().toLocaleString() }
              : v
          ),
        }));
      },

      deleteVisitor: (id) => {
        set((state) => ({
          visitors: state.visitors.filter((v) => v.id !== id),
        }));
      },

      addLeave: (leave) => {
        const newLeave: LeaveRequest = {
          ...leave,
          id: `lev-${Date.now()}`,
          appliedOn: new Date().toISOString().split('T')[0],
          status: 'pending',
        };
        set((state) => ({ leaves: [newLeave, ...state.leaves] }));
      },

      updateLeaveStatus: (id, status, approver) => {
        set((state) => ({
          leaves: state.leaves.map((l) =>
            l.id === id ? { ...l, status, approvedBy: approver } : l
          ),
        }));
      },

      updateSettings: (newSettings) => {
        set((state) => ({
          settings: { ...state.settings, ...newSettings },
        }));
      },

      addAuditLog: (action, entityType, entityId, details, actorName, actorRole) => {
        const log: AuditLogEntry = {
          id: `aud-${Date.now()}`,
          timestamp: new Date().toLocaleString(),
          actorId: 'usr-101',
          actorName,
          actorRole,
          action,
          entityType,
          entityId,
          details,
          ipAddress: '192.168.1.50',
          status: 'success',
        };
        set((state) => ({ auditLogs: [log, ...state.auditLogs] }));
      },
    }),
    {
      name: 'biometric-system-storage',
    }
  )
);
