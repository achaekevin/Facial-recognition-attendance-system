import React, { useState } from 'react';
import { 
  Users, 
  UserCheck, 
  Clock, 
  ShieldAlert, 
  ScanFace, 
  Camera, 
  TrendingUp, 
  Sparkles,
  FileText,
  Building2,
  CheckCircle2,
  FileCheck,
  UserPlus,
  ShieldCheck,
  Calendar,
  Send,
  UserX,
  FileSpreadsheet,
  Inbox
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer
} from 'recharts';
import { StatsCard } from '../../components/data-display/StatsCard';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Modal } from '../../components/ui/Modal';
import { useBiometricStore } from '../../store/useBiometricStore';
import { useAuthStore } from '../../store/useAuthStore';
import { LiveRecognitionCanvas } from '../../components/webcam/LiveRecognitionCanvas';
import { useNavigate } from 'react-router-dom';
import { LeaveType } from '../../types';
import { toast } from 'sonner';

const emptyTrendData = [
  { day: 'Mon', present: 0, late: 0, absent: 0 },
  { day: 'Tue', present: 0, late: 0, absent: 0 },
  { day: 'Wed', present: 0, late: 0, absent: 0 },
  { day: 'Thu', present: 0, late: 0, absent: 0 },
  { day: 'Fri', present: 0, late: 0, absent: 0 },
  { day: 'Sat', present: 0, late: 0, absent: 0 },
  { day: 'Sun', present: 0, late: 0, absent: 0 },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeRole, user } = useAuthStore();
  const { users, attendance, cameras, unknownFaces, visitors, addLeave } = useBiometricStore();

  const [isApplyLeaveModalOpen, setIsApplyLeaveModalOpen] = useState(false);
  const [leaveType, setLeaveType] = useState<LeaveType>('annual');
  const [startDate, setStartDate] = useState('2026-08-01');
  const [endDate, setEndDate] = useState('2026-08-03');
  const [reason, setReason] = useState('');

  const handleApplyLeave = (e: React.FormEvent) => {
    e.preventDefault();

    if (!reason.trim()) {
      toast.error('Please state a reason for your leave request.');
      return;
    }

    const activeUser = user || (users.length > 0 ? users[0] : null);

    const userId = activeUser?.id || `usr-${Date.now()}`;
    const userName = activeUser?.name || 'Registered Student';
    const userAvatar = activeUser?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150';
    const department = activeUser?.departmentName || (activeUser as any)?.department || 'Computer Science Dept';

    let totalDays = 1;
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      const diffTime = end.getTime() - start.getTime();
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
      totalDays = diffDays > 0 ? diffDays : 1;
    }

    addLeave({
      userId,
      userName,
      userAvatar,
      department,
      leaveType,
      startDate,
      endDate,
      totalDays,
      reason: reason.trim(),
    });

    toast.success(`Leave application submitted for approval! (${totalDays} day${totalDays > 1 ? 's' : ''})`);
    setReason('');
    setIsApplyLeaveModalOpen(false);
  };

  const totalUsers = users.length;
  const presentCount = attendance.filter((a) => a.status === 'present').length;
  const lateCount = attendance.filter((a) => a.status === 'late').length;
  const absentCount = Math.max(0, totalUsers - presentCount - lateCount);
  const unknownCount = unknownFaces.filter((u) => u.status === 'unassigned').length;
  const activeCams = cameras.filter((c) => c.status === 'online').length;
  const offlineCams = cameras.filter((c) => c.status === 'offline').length;

  const attendanceRate = totalUsers > 0 ? ((presentCount + lateCount) / totalUsers * 100).toFixed(1) + '%' : '0%';

  // ---------------------------------------------------------------------------
  // 1. SUPER ADMIN DASHBOARD
  // ---------------------------------------------------------------------------
  if (activeRole === 'super_admin') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-indigo-500/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" pulse className="bg-indigo-500/20 text-indigo-300 border-indigo-500/30">
                Super Admin Console
              </Badge>
              <span className="text-xs text-slate-400 font-mono">System Clean & Ready</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Enterprise Biometric Control Center</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Welcome back, {user?.name || 'Administrator'}. Ready for real production user face enrollments and live telemetry.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => navigate('/face-enrollment')} leftIcon={<Sparkles className="w-4 h-4" />}>
              Enroll New Face
            </Button>
            <Button variant="glass" onClick={() => navigate('/live-recognition')} leftIcon={<ScanFace className="w-4 h-4 text-emerald-400" />}>
              Live Scanner
            </Button>
            <Button variant="outline" onClick={() => navigate('/settings')} leftIcon={<Building2 className="w-4 h-4" />}>
              System Settings
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Registered Users" value={totalUsers} subtitle="Enrolled Biometric Profiles" change={totalUsers > 0 ? `+${totalUsers}` : '0 Enrolled'} changeType={totalUsers > 0 ? 'positive' : 'neutral'} icon={<Users className="w-6 h-6" />} iconBgColor="bg-indigo-500/10 text-indigo-500" />
          <StatsCard title="Today's Attendance Rate" value={`${presentCount + lateCount} / ${totalUsers}`} subtitle={`${presentCount} On Time • ${lateCount} Late`} change={attendanceRate} changeType={presentCount > 0 ? 'positive' : 'neutral'} icon={<UserCheck className="w-6 h-6" />} iconBgColor="bg-emerald-500/10 text-emerald-500" />
          <StatsCard title="Biometric Precision" value="100%" subtitle="ArcFace 512-d Liveness Filter" change="Optimal" changeType="positive" icon={<ScanFace className="w-6 h-6" />} iconBgColor="bg-sky-500/10 text-sky-500" />
          <StatsCard title="Camera Nodes Status" value={`${activeCams} Active`} subtitle={`${offlineCams} Offline`} change={offlineCams > 0 ? `${offlineCams} Alert` : 'Online'} changeType={offlineCams > 0 ? 'negative' : 'positive'} icon={<Camera className="w-6 h-6" />} iconBgColor="bg-amber-500/10 text-amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card glass className="lg:col-span-2 overflow-hidden flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-primary" /> Active Perimeter Telemetry</CardTitle>
                <CardDescription>Main Gate Entrance Alpha (Node cam-01)</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/cameras')}>Manage Cameras</Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1">{cameras.length > 0 && <LiveRecognitionCanvas camera={cameras[0]} />}</CardContent>
          </Card>

          <Card glass className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle>System Status</CardTitle>
              <CardDescription>Live database state</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center p-6 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                <Inbox className="w-6 h-6" />
              </div>
              <div>
                <h4 className="font-semibold text-slate-900 dark:text-white text-sm">System Database Clean</h4>
                <p className="text-xs text-slate-500 mt-1">No dummy data loaded. Click below to enroll your first employee or student.</p>
              </div>
              <Button size="sm" variant="primary" onClick={() => navigate('/face-enrollment')}>
                Enroll First User
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 2. HR ADMIN DASHBOARD
  // ---------------------------------------------------------------------------
  if (activeRole === 'hr_admin') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" pulse className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                HR Administration Portal
              </Badge>
              <span className="text-xs text-slate-300 font-mono">Clean Roster State</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Attendance & Employee Records</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Hello, {user?.name || 'HR Manager'}. Manage user onboarding, face enrollments, shift schedules, and leave approvals.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => navigate('/face-enrollment')} leftIcon={<UserPlus className="w-4 h-4" />}>
              Enroll New Employee
            </Button>
            <Button variant="glass" onClick={() => navigate('/leave')} leftIcon={<FileCheck className="w-4 h-4 text-emerald-400" />}>
              Review Leave
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Employees & Students" value={totalUsers} subtitle="Enrolled Biometric Profiles" change={totalUsers > 0 ? `+${totalUsers}` : '0 Enrolled'} changeType={totalUsers > 0 ? 'positive' : 'neutral'} icon={<Users className="w-6 h-6" />} iconBgColor="bg-blue-500/10 text-blue-500" />
          <StatsCard title="Present Today" value={presentCount} subtitle={`${lateCount} Arrived Late`} change={attendanceRate} changeType={presentCount > 0 ? 'positive' : 'neutral'} icon={<UserCheck className="w-6 h-6" />} iconBgColor="bg-emerald-500/10 text-emerald-500" />
          <StatsCard title="Pending Leave Requests" value="0" subtitle="Awaiting HR Approval" change="Up to Date" changeType="positive" icon={<FileText className="w-6 h-6" />} iconBgColor="bg-amber-500/10 text-amber-500" />
          <StatsCard title="Unexplained Absences" value={absentCount} subtitle="Requires Attendance Audit" change="0" changeType="neutral" icon={<UserX className="w-6 h-6" />} iconBgColor="bg-rose-500/10 text-rose-500" />
        </div>

        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" /> Weekly Turnout Trends</CardTitle>
            <CardDescription>Present vs late employee distribution</CardDescription>
          </CardHeader>
          <CardContent className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={emptyTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="day" />
                <YAxis />
                <Tooltip />
                <Area type="monotone" dataKey="present" stroke="#10b981" fill="#10b981" fillOpacity={0.2} />
                <Area type="monotone" dataKey="late" stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.2} />
              </AreaChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 3. LECTURER / DEPARTMENT MANAGER DASHBOARD
  // ---------------------------------------------------------------------------
  if (activeRole === 'lecturer_teacher') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success" pulse className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                Departmental Oversight
              </Badge>
              <span className="text-xs text-emerald-200 font-mono">Unit: Computer Science & AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Faculty & Student Roster Portal</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Welcome, {user?.name || 'Lecturer'}. Monitor assigned student check-ins and approve departmental requests.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="primary" onClick={() => navigate('/reports')} leftIcon={<FileSpreadsheet className="w-4 h-4" />}>
              Export Roster
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Assigned Department Students" value={totalUsers} subtitle="CS & AI Roster" change="0 Students" changeType="neutral" icon={<Users className="w-6 h-6" />} iconBgColor="bg-emerald-500/10 text-emerald-500" />
          <StatsCard title="Present in Class Today" value={presentCount} subtitle={`${lateCount} Late`} change={attendanceRate} changeType="neutral" icon={<CheckCircle2 className="w-6 h-6" />} iconBgColor="bg-sky-500/10 text-sky-500" />
          <StatsCard title="Correction Requests" value="0" subtitle="Pending Instructor Review" change="Clear" changeType="positive" icon={<FileText className="w-6 h-6" />} iconBgColor="bg-amber-500/10 text-amber-500" />
          <StatsCard title="Average Class Arrival" value="--:-- PM" subtitle="On-time threshold: 09:00 AM" change="Ready" changeType="neutral" icon={<Clock className="w-6 h-6" />} iconBgColor="bg-indigo-500/10 text-indigo-500" />
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 4. SECURITY OFFICER DASHBOARD
  // ---------------------------------------------------------------------------
  if (activeRole === 'security_officer') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-950 via-rose-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-rose-500/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="danger" pulse className="bg-rose-500/20 text-rose-300 border-rose-500/30">
                Security Control Room
              </Badge>
              <span className="text-xs text-rose-200 font-mono">Perimeter Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Perimeter Access & Surveillance</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Officer {user?.name || 'Security Marshal'}, active surveillance monitoring across all camera gates, unknown face alerts, and visitor logging.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <Button variant="destructive" onClick={() => navigate('/unknown-faces')} leftIcon={<ShieldAlert className="w-4 h-4" />}>
              Unknown Incident Queue ({unknownCount})
            </Button>
            <Button variant="glass" onClick={() => navigate('/visitors')} leftIcon={<UserCheck className="w-4 h-4 text-emerald-400" />}>
              Issue Visitor Pass
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Active Surveillance Nodes" value={`${activeCams} Online`} subtitle={`${offlineCams} Node Warning`} change={offlineCams > 0 ? `${offlineCams} Offline Alert` : 'Optimal'} changeType={offlineCams > 0 ? 'negative' : 'positive'} icon={<Camera className="w-6 h-6" />} iconBgColor="bg-rose-500/10 text-rose-500" />
          <StatsCard title="Unknown Face Alerts" value={unknownCount} subtitle="Requires Identity Review" change={unknownCount > 0 ? 'Action Needed' : 'Clear'} changeType={unknownCount > 0 ? 'negative' : 'positive'} icon={<ShieldAlert className="w-6 h-6" />} iconBgColor="bg-amber-500/10 text-amber-500" />
          <StatsCard title="Checked-In Visitors" value={visitors.length} subtitle="Active Campus Visitor Badges" change="0 Visitors" changeType="neutral" icon={<UserCheck className="w-6 h-6" />} iconBgColor="bg-emerald-500/10 text-emerald-500" />
          <StatsCard title="Watchlist Alerts" value="0 Active" subtitle="Blacklisted Perimeter Scan" change="Secure" changeType="positive" icon={<ShieldCheck className="w-6 h-6" />} iconBgColor="bg-indigo-500/10 text-indigo-500" />
        </div>
      </div>
    );
  }

  // ---------------------------------------------------------------------------
  // 5. EMPLOYEE / STUDENT PERSONAL DASHBOARD
  // ---------------------------------------------------------------------------
  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-sky-500/20">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="primary" pulse className="bg-sky-500/20 text-sky-300 border-sky-500/30">
              Personal Attendance Portal
            </Badge>
            <span className="text-xs text-sky-200 font-mono">ID: {user?.employeeOrStudentId || 'UNREGISTERED'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome, {user?.name || 'User'}!</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Track your daily biometric clock-in times, attendance history calendar, and leave request submissions.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button variant="primary" onClick={() => setIsApplyLeaveModalOpen(true)} leftIcon={<Send className="w-4 h-4" />}>
            Apply for Leave
          </Button>
          <Button variant="glass" onClick={() => navigate('/leave')} leftIcon={<FileCheck className="w-4 h-4 text-sky-400" />}>
            View Leave Requests
          </Button>
          <Button variant="glass" onClick={() => navigate('/attendance')} leftIcon={<Clock className="w-4 h-4 text-emerald-400" />}>
            My Attendance Calendar
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="Today's Status" value="Not Checked In" subtitle="Main Gate Turnstile" change="Pending" changeType="neutral" icon={<CheckCircle2 className="w-6 h-6" />} iconBgColor="bg-emerald-500/10 text-emerald-500" />
        <StatsCard title="Monthly Attendance Rate" value="0%" subtitle="0 Days Logged" change="Pending" changeType="neutral" icon={<TrendingUp className="w-6 h-6" />} iconBgColor="bg-indigo-500/10 text-indigo-500" />
        <StatsCard title="Hours Logged This Month" value="0.0 hrs" subtitle="Avg 0 hrs / day" change="Pending" changeType="neutral" icon={<Clock className="w-6 h-6" />} iconBgColor="bg-sky-500/10 text-sky-500" />
        <StatsCard title="Remaining Leave Balance" value="14 Days" subtitle="Paid Medical & Annual Leave" change="Available" changeType="positive" icon={<Calendar className="w-6 h-6" />} iconBgColor="bg-amber-500/10 text-amber-500" />
      </div>

      <Modal
        isOpen={isApplyLeaveModalOpen}
        onClose={() => setIsApplyLeaveModalOpen(false)}
        title="Submit Leave Application"
        description="Select dates and type for administrative approval."
      >
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Leave Category
            </label>
            <select
              value={leaveType}
              onChange={(e) => setLeaveType(e.target.value as any)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all text-slate-900 dark:text-white"
            >
              <option value="annual">Annual Paid Leave</option>
              <option value="medical">Medical / Sick Leave</option>
              <option value="emergency">Emergency Family Leave</option>
              <option value="unpaid">Unpaid Personal Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                Start Date
              </label>
              <input
                type="date"
                required
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all text-slate-900 dark:text-white"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
                End Date
              </label>
              <input
                type="date"
                required
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all text-slate-900 dark:text-white"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Reason Justification
            </label>
            <textarea
              rows={3}
              required
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="State reason for absence..."
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl focus:ring-2 focus:ring-primary/40 outline-none transition-all text-slate-900 dark:text-white"
            />
          </div>

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={() => setIsApplyLeaveModalOpen(false)}>
              Cancel
            </Button>
            <Button type="submit" variant="primary">
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
};
