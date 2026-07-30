import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { MainLayout } from '../layouts/MainLayout';
import { LoginPage } from '../features/auth/LoginPage';
import { ForgotPasswordPage } from '../features/auth/ForgotPasswordPage';
import { OTPVerificationPage } from '../features/auth/OTPVerificationPage';
import { ResetPasswordPage } from '../features/auth/ResetPasswordPage';
import { DashboardPage } from '../features/dashboard/DashboardPage';
import { FaceEnrollmentPage } from '../features/face-enrollment/FaceEnrollmentPage';
import { LiveRecognitionPage } from '../features/live-recognition/LiveRecognitionPage';
import { AttendancePage } from '../features/attendance/AttendancePage';
import { UserListPage } from '../features/users/UserListPage';
import { UserProfilePage } from '../features/users/UserProfilePage';
import { CameraPage } from '../features/cameras/CameraPage';
import { DepartmentPage } from '../features/departments/DepartmentPage';
import { SchedulePage } from '../features/schedules/SchedulePage';
import { LeavePage } from '../features/leave/LeavePage';
import { VisitorPage } from '../features/visitors/VisitorPage';
import { UnknownFacesPage } from '../features/unknown-faces/UnknownFacesPage';
import { AnalyticsPage } from '../features/analytics/AnalyticsPage';
import { ReportsPage } from '../features/reports/ReportsPage';
import { AuditLogsPage } from '../features/audit-logs/AuditLogsPage';
import { SettingsPage } from '../features/settings/SettingsPage';
import { ProfilePage } from '../features/profile/ProfilePage';
import { useAuthStore } from '../store/useAuthStore';
import { UserRole } from '../types';

const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuthStore();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

const RoleGuard: React.FC<{ allowedRoles: UserRole[]; children: React.ReactNode }> = ({ allowedRoles, children }) => {
  const { activeRole } = useAuthStore();
  if (activeRole === 'super_admin') return <>{children}</>;
  if (!allowedRoles.includes(activeRole)) {
    return <Navigate to="/dashboard" replace />;
  }
  return <>{children}</>;
};

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Auth Routes */}
      <Route path="/login" element={<LoginPage />} />
      <Route path="/forgot-password" element={<ForgotPasswordPage />} />
      <Route path="/otp-verify" element={<OTPVerificationPage />} />
      <Route path="/reset-password" element={<ResetPasswordPage />} />

      {/* Protected App Routes inside MainLayout */}
      <Route
        path="/"
        element={
          <ProtectedRoute>
            <MainLayout />
          </ProtectedRoute>
        }
      >
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        
        <Route
          path="face-enrollment"
          element={
            <RoleGuard allowedRoles={['super_admin', 'hr_admin', 'security_officer']}>
              <FaceEnrollmentPage />
            </RoleGuard>
          }
        />
        
        <Route
          path="live-recognition"
          element={
            <RoleGuard allowedRoles={['super_admin', 'hr_admin', 'security_officer']}>
              <LiveRecognitionPage />
            </RoleGuard>
          }
        />
        
        <Route path="attendance" element={<AttendancePage />} />
        
        <Route
          path="users"
          element={
            <RoleGuard allowedRoles={['super_admin', 'hr_admin', 'lecturer_teacher', 'security_officer']}>
              <UserListPage />
            </RoleGuard>
          }
        />
        <Route path="users/:id" element={<UserProfilePage />} />
        
        <Route
          path="cameras"
          element={
            <RoleGuard allowedRoles={['super_admin', 'hr_admin', 'security_officer']}>
              <CameraPage />
            </RoleGuard>
          }
        />
        
        <Route
          path="departments"
          element={
            <RoleGuard allowedRoles={['super_admin', 'hr_admin', 'lecturer_teacher']}>
              <DepartmentPage />
            </RoleGuard>
          }
        />
        
        <Route
          path="schedules"
          element={
            <RoleGuard allowedRoles={['super_admin', 'hr_admin', 'lecturer_teacher']}>
              <SchedulePage />
            </RoleGuard>
          }
        />
        
        <Route path="leave" element={<LeavePage />} />
        
        <Route
          path="visitors"
          element={
            <RoleGuard allowedRoles={['super_admin', 'security_officer']}>
              <VisitorPage />
            </RoleGuard>
          }
        />
        
        <Route
          path="unknown-faces"
          element={
            <RoleGuard allowedRoles={['super_admin', 'hr_admin', 'security_officer']}>
              <UnknownFacesPage />
            </RoleGuard>
          }
        />
        
        <Route
          path="analytics"
          element={
            <RoleGuard allowedRoles={['super_admin', 'hr_admin', 'lecturer_teacher', 'security_officer']}>
              <AnalyticsPage />
            </RoleGuard>
          }
        />
        
        <Route path="reports" element={<ReportsPage />} />
        
        <Route
          path="audit-logs"
          element={
            <RoleGuard allowedRoles={['super_admin', 'hr_admin', 'security_officer']}>
              <AuditLogsPage />
            </RoleGuard>
          }
        />
        
        <Route
          path="settings"
          element={
            <RoleGuard allowedRoles={['super_admin']}>
              <SettingsPage />
            </RoleGuard>
          }
        />
        
        <Route path="profile" element={<ProfilePage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
};
