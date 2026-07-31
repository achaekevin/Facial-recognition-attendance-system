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
  Inbox,
  Navigation,
  Lock,
  Radio,
  Eye,
  Shield,
  Activity,
  Award
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
  { day: 'Mon', present: 12, late: 2, absent: 1 },
  { day: 'Tue', present: 14, late: 1, absent: 0 },
  { day: 'Wed', present: 15, late: 0, absent: 0 },
  { day: 'Thu', present: 13, late: 2, absent: 0 },
  { day: 'Fri', present: 14, late: 1, absent: 0 },
  { day: 'Sat', present: 8, late: 0, absent: 0 },
  { day: 'Sun', present: 5, late: 0, absent: 0 },
];

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const { activeRole, user } = useAuthStore();
  const { users, attendance, cameras, unknownFaces, visitors, addLeave, leaveRequests } = useBiometricStore();

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
    const userName = activeUser?.name || 'Registered User';
    const userAvatar = activeUser?.avatar || '';
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

  const userList = users || [];
  const attendanceList = attendance || [];
  const cameraList = cameras || [];
  const unknownList = unknownFaces || [];
  const visitorList = visitors || [];
  const leaveList = leaveRequests || [];

  const totalUsers = userList.length;
  const presentCount = attendanceList.filter((a) => a.status === 'present').length;
  const lateCount = attendanceList.filter((a) => a.status === 'late').length;
  const absentCount = Math.max(0, totalUsers - presentCount - lateCount);
  const unknownCount = unknownList.filter((u) => u.status === 'unassigned').length;
  const activeCams = cameraList.filter((c) => c.status === 'online').length;
  const offlineCams = cameraList.filter((c) => c.status === 'offline').length;
  const pendingLeaves = leaveList.filter((l) => l.status === 'pending').length;

  const attendanceRate = totalUsers > 0 ? ((presentCount + lateCount) / totalUsers * 100).toFixed(1) + '%' : '98.5%';

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
                Super Admin Executive Console
              </Badge>
              <span className="text-xs text-slate-400 font-mono">System Integrity 100%</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Enterprise Biometric Control Center</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Welcome back, {user?.name || 'Super Admin'}. Executive overview of biometric recognition matrix, node infrastructure, and audit ledgers.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="primary" onClick={() => navigate('/face-enrollment-360')} leftIcon={<Sparkles className="w-4 h-4" />}>
              360° Matrix Wizard
            </Button>
            <Button variant="glass" onClick={() => navigate('/live-recognition')} leftIcon={<ScanFace className="w-4 h-4 text-emerald-400" />}>
              Live Scanner
            </Button>
            <Button variant="outline" onClick={() => navigate('/audit-logs')} leftIcon={<ShieldCheck className="w-4 h-4" />}>
              SHA-256 Ledger
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Registered Users" value={totalUsers || 15} subtitle="Enrolled Biometric Profiles" change="+15 Active" changeType="positive" icon={<Users className="w-6 h-6" />} iconBgColor="bg-indigo-500/10 text-indigo-500" />
          <StatsCard title="Turnout Rate Today" value={attendanceRate} subtitle={`${presentCount} On Time • ${lateCount} Late`} change="+2.4%" changeType="positive" icon={<UserCheck className="w-6 h-6" />} iconBgColor="bg-emerald-500/10 text-emerald-500" />
          <StatsCard title="Biometric Precision" value="99.8%" subtitle="ArcFace 512-d Liveness Matrix" change="Optimal" changeType="positive" icon={<ScanFace className="w-6 h-6" />} iconBgColor="bg-sky-500/10 text-sky-500" />
          <StatsCard title="Camera Nodes Status" value={`${activeCams || 12} Active`} subtitle={`${offlineCams} Offline Warning`} change="Online" changeType="positive" icon={<Camera className="w-6 h-6" />} iconBgColor="bg-amber-500/10 text-amber-500" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card glass className="lg:col-span-2 overflow-hidden flex flex-col justify-between">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <div>
                <CardTitle className="flex items-center gap-2"><Camera className="w-5 h-5 text-indigo-500" /> Executive Surveillance Feed</CardTitle>
                <CardDescription>Main Gate Entrance Alpha (Node cam-01)</CardDescription>
              </div>
              <Button variant="outline" size="sm" onClick={() => navigate('/cameras')}>Manage Cameras</Button>
            </CardHeader>
            <CardContent className="p-4 pt-0 flex-1">{cameras.length > 0 && <LiveRecognitionCanvas camera={cameras[0]} />}</CardContent>
          </Card>

          <Card glass className="flex flex-col justify-between">
            <CardHeader>
              <CardTitle className="flex items-center gap-2"><Activity className="w-5 h-5 text-cyan-500" /> System Control Shortcuts</CardTitle>
              <CardDescription>Enterprise Administration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              <button onClick={() => navigate('/face-enrollment-360')} className="w-full p-3 rounded-2xl bg-indigo-500/10 hover:bg-indigo-500/20 border border-indigo-500/20 text-left transition-all flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-indigo-400">360° Multi-Angle Face Wizard</p>
                  <p className="text-[11px] text-slate-400">Enroll 4-angle vector matrix</p>
                </div>
                <Sparkles className="w-4 h-4 text-indigo-400" />
              </button>

              <button onClick={() => navigate('/security-center')} className="w-full p-3 rounded-2xl bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/20 text-left transition-all flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-rose-400">Deepfake Security Center</p>
                  <p className="text-[11px] text-slate-400">Presentation attack flags</p>
                </div>
                <Shield className="w-4 h-4 text-rose-400" />
              </button>

              <button onClick={() => navigate('/integrations')} className="w-full p-3 rounded-2xl bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/20 text-left transition-all flex items-center justify-between">
                <div>
                  <p className="font-bold text-xs text-emerald-400">HRMS & LMS Connectors</p>
                  <p className="text-[11px] text-slate-400">Canvas, Workday, Moodle</p>
                </div>
                <Building2 className="w-4 h-4 text-emerald-400" />
              </button>
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
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-blue-950 via-indigo-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-blue-500/20">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="primary" pulse className="bg-blue-500/20 text-blue-300 border-blue-500/30">
                HR & Operations Center
              </Badge>
              <span className="text-xs text-slate-300 font-mono">Staff & Roster Management</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Human Resources Portal</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Hello, {user?.name || 'HR Manager'}. Manage employee onboardings, leave approval queues, and roster analytics.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="primary" onClick={() => navigate('/users')} leftIcon={<UserPlus className="w-4 h-4" />}>
              User Directory
            </Button>
            <Button variant="glass" onClick={() => navigate('/leave')} leftIcon={<FileCheck className="w-4 h-4 text-emerald-400" />}>
              Approve Leave ({pendingLeaves})
            </Button>
            <Button variant="outline" onClick={() => navigate('/notification-channels')} leftIcon={<Send className="w-4 h-4" />}>
              Notification Gateways
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Total Employees & Students" value={totalUsers || 15} subtitle="Registered Profiles" change="+15 Active" changeType="positive" icon={<Users className="w-6 h-6" />} iconBgColor="bg-blue-500/10 text-blue-500" />
          <StatsCard title="Present Today" value={presentCount || 12} subtitle={`${lateCount} Arrived Late`} change={attendanceRate} changeType="positive" icon={<UserCheck className="w-6 h-6" />} iconBgColor="bg-emerald-500/10 text-emerald-500" />
          <StatsCard title="Pending Leave Requests" value={pendingLeaves} subtitle="Awaiting HR Review" change={pendingLeaves > 0 ? 'Review Needed' : 'Up to Date'} changeType={pendingLeaves > 0 ? 'warning' : 'positive'} icon={<FileText className="w-6 h-6" />} iconBgColor="bg-amber-500/10 text-amber-500" />
          <StatsCard title="Unexplained Absences" value={absentCount} subtitle="Requires Attendance Audit" change="0 Flagged" changeType="positive" icon={<UserX className="w-6 h-6" />} iconBgColor="bg-rose-500/10 text-rose-500" />
        </div>

        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><TrendingUp className="w-5 h-5 text-emerald-500" /> Weekly Departmental Turnout</CardTitle>
            <CardDescription>Present vs late employee distribution across weekdays</CardDescription>
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
  // 3. LECTURER / TEACHER DASHBOARD
  // ---------------------------------------------------------------------------
  if (activeRole === 'lecturer_teacher') {
    return (
      <div className="space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-gradient-to-r from-emerald-950 via-teal-900 to-slate-900 text-white p-6 rounded-3xl shadow-xl border border-emerald-500/30">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <Badge variant="success" pulse className="bg-emerald-500/20 text-emerald-300 border-emerald-500/30">
                Faculty & Academic Portal
              </Badge>
              <span className="text-xs text-emerald-200 font-mono">Dept: Computer Science & AI</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Class Roster & Attendance Dashboard</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Welcome, Professor {user?.name || 'Lecturer'}. Verify student classroom check-ins, view lecture heatmaps, and export course rosters.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="primary" onClick={() => navigate('/mobile-checkin')} leftIcon={<Navigation className="w-4 h-4" />}>
              Mobile Check-In Mode
            </Button>

          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Assigned Course Students" value={totalUsers || 24} subtitle="CS-401 & AI-302 Roster" change="+24 Enrolled" changeType="positive" icon={<Users className="w-6 h-6" />} iconBgColor="bg-emerald-500/10 text-emerald-500" />
          <StatsCard title="In Class Today" value={presentCount || 22} subtitle={`${lateCount} Arrived Late`} change="91.6%" changeType="positive" icon={<CheckCircle2 className="w-6 h-6" />} iconBgColor="bg-sky-500/10 text-sky-500" />
          <StatsCard title="Pending Corrections" value="0" subtitle="Student Attendance Disputes" change="Clear" changeType="positive" icon={<FileText className="w-6 h-6" />} iconBgColor="bg-amber-500/10 text-amber-500" />
          <StatsCard title="Avg Arrival Time" value="08:44 AM" subtitle="Class Start: 09:00 AM" change="On Time" changeType="positive" icon={<Clock className="w-6 h-6" />} iconBgColor="bg-indigo-500/10 text-indigo-500" />
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
                Security Operations Center (SOC)
              </Badge>
              <span className="text-xs text-rose-200 font-mono">Perimeter Active</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Perimeter Access & Threat Radar</h1>
            <p className="text-sm text-slate-300 mt-1 max-w-xl">
              Officer {user?.name || 'Security Marshal'}. Real-time presentation attack detection (PAD), camera gate monitoring, and visitor pass logs.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Button variant="destructive" onClick={() => navigate('/security-center')} leftIcon={<Shield className="w-4 h-4" />}>
              Deepfake Threat Radar
            </Button>

            <Button variant="glass" onClick={() => navigate('/visitors')} leftIcon={<UserCheck className="w-4 h-4 text-emerald-400" />}>
              Issue Visitor Pass
            </Button>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatsCard title="Surveillance Camera Nodes" value={`${activeCams || 12} Online`} subtitle={`${offlineCams} Offline Alert`} change="Online" changeType="positive" icon={<Camera className="w-6 h-6" />} iconBgColor="bg-rose-500/10 text-rose-500" />
          <StatsCard title="Unknown Face Alerts" value={unknownCount} subtitle="Requires Review" change={unknownCount > 0 ? 'Review Needed' : 'Clear'} changeType={unknownCount > 0 ? 'negative' : 'positive'} icon={<ShieldAlert className="w-6 h-6" />} iconBgColor="bg-amber-500/10 text-amber-500" />
          <StatsCard title="Active Visitor Badges" value={visitorList.length || 3} subtitle="On-Campus Visitors" change="3 Active" changeType="neutral" icon={<UserCheck className="w-6 h-6" />} iconBgColor="bg-emerald-500/10 text-emerald-500" />
          <StatsCard title="Spoof Interceptions" value="8 Blocked" subtitle="2D / Video Playback Attacks" change="Protected" changeType="positive" icon={<ShieldCheck className="w-6 h-6" />} iconBgColor="bg-indigo-500/10 text-indigo-500" />
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
              Personal Self-Service Portal
            </Badge>
            <span className="text-xs text-sky-200 font-mono">ID: {user?.employeeOrStudentId || 'STU-9904'}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">Welcome back, {user?.name || 'Student / Employee'}!</h1>
          <p className="text-sm text-slate-300 mt-1 max-w-xl">
            Track your daily attendance record, perform mobile GPS check-ins, manage biometric privacy rights, and submit leave applications.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <Button variant="primary" onClick={() => navigate('/mobile-checkin')} leftIcon={<Navigation className="w-4 h-4" />}>
            Mobile GPS Check-In
          </Button>

          <Button variant="glass" onClick={() => navigate('/face-enrollment-360')} leftIcon={<Sparkles className="w-4 h-4 text-cyan-400" />}>
            360° Face Matrix
          </Button>

          <Button variant="outline" onClick={() => setIsApplyLeaveModalOpen(true)} leftIcon={<Send className="w-4 h-4" />}>
            Apply for Leave
          </Button>
        </div>
      </div>

      {/* Personal Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatsCard title="My Attendance Rate" value="98.5%" subtitle="This Semester / Month" change="Optimal" changeType="positive" icon={<Award className="w-6 h-6" />} iconBgColor="bg-sky-500/10 text-sky-500" />
        <StatsCard title="Today's Status" value="PRESENT" subtitle="Clock-In: 08:14 AM" change="On Time" changeType="positive" icon={<CheckCircle2 className="w-6 h-6" />} iconBgColor="bg-emerald-500/10 text-emerald-500" />
        <StatsCard title="360° Biometric Matrix" value="ENROLLED" subtitle="4 Angles (512-d ArcFace)" change="99.8% Score" changeType="positive" icon={<ScanFace className="w-6 h-6" />} iconBgColor="bg-cyan-500/10 text-cyan-500" />
        <StatsCard title="Privacy Rights" value="GDPR Active" subtitle="Biometric Data Protected" change="Self Service" changeType="positive" icon={<Lock className="w-6 h-6" />} iconBgColor="bg-indigo-500/10 text-indigo-500" />
      </div>

      {/* Quick Action Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
        <div 
          onClick={() => navigate('/mobile-checkin')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-cyan-500/40 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="p-3 rounded-2xl bg-cyan-500/10 text-cyan-500 w-fit">
            <Navigation className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Mobile GPS Check-In</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Check in touchlessly from your phone within campus radius.</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/face-enrollment-360')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-indigo-500/40 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="p-3 rounded-2xl bg-indigo-500/10 text-indigo-500 w-fit">
            <Sparkles className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">360° Multi-Angle Face Scanning</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Scan 4 facial poses to maximize recognition accuracy.</p>
          </div>
        </div>

        <div 
          onClick={() => navigate('/privacy-portal')}
          className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm hover:border-emerald-500/40 hover:shadow-md transition-all cursor-pointer space-y-3"
        >
          <div className="p-3 rounded-2xl bg-emerald-500/10 text-emerald-500 w-fit">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h3 className="font-bold text-base text-slate-900 dark:text-white">Biometric Privacy Portal</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Export your data or manage biometric embedding retention.</p>
          </div>
        </div>
      </div>

      {/* Leave Application Modal */}
      <Modal isOpen={isApplyLeaveModalOpen} onClose={() => setIsApplyLeaveModalOpen(false)} title="Submit Leave Request">
        <form onSubmit={handleApplyLeave} className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase mb-1">Leave Type</label>
            <select value={leaveType} onChange={(e) => setLeaveType(e.target.value as LeaveType)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs">
              <option value="annual">Annual Leave</option>
              <option value="sick">Sick Leave</option>
              <option value="casual">Casual Leave</option>
              <option value="maternity_paternity">Parental Leave</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold uppercase mb-1">Start Date</label>
              <input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs" />
            </div>
            <div>
              <label className="block text-xs font-bold uppercase mb-1">End Date</label>
              <input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs" />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold uppercase mb-1">Reason</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} placeholder="Please provide reason..." className="w-full p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950 text-xs" />
          </div>

          <Button type="submit" variant="primary" className="w-full justify-center py-2.5">
            Submit Leave Request
          </Button>
        </form>
      </Modal>
    </div>
  );
};
