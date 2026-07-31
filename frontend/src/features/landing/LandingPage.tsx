import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ScanFace, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  GraduationCap, 
  Camera, 
  Shield, 
  User as UserIcon, 
  ArrowRight, 
  Zap, 
  Cpu, 
  Activity, 
  MapPin, 
  BarChart3, 
  Lock, 
  LogOut, 
  CheckCircle2, 
  Globe, 
  LayoutDashboard, 
  ChevronRight, 
  Flame, 
  Brain, 
  Sun, 
  Moon,
  Radio,
  Clock,
  Layers,
  FileText
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { UserRole, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, activeRole, login, switchRole, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const quickRoles: { 
    role: UserRole; 
    label: string; 
    icon: React.ReactNode; 
    defaultEmail: string; 
    defaultName: string;
    description: string;
    portalBadge: string;
    features: string[];
    gradient: string;
  }[] = [
    { 
      role: 'employee_student', 
      label: 'Student / Employee', 
      icon: <UserIcon className="w-5 h-5 text-cyan-400" />,
      defaultEmail: 'student@attendance.com', 
      defaultName: 'Alex Rivera',
      description: 'Personal attendance check-ins, self history logs, personal profile, and leave requests.',
      portalBadge: 'End-User Portal',
      features: ['Touchless Face Check-in', 'Personal Attendance History', 'Leave Application Submission', 'QR Backup Pass'],
      gradient: 'from-cyan-500/20 to-blue-500/10 border-cyan-500/30'
    },
    { 
      role: 'lecturer_teacher', 
      label: 'Lecturer / Teacher', 
      icon: <GraduationCap className="w-5 h-5 text-indigo-400" />,
      defaultEmail: 'lecturer@attendance.com', 
      defaultName: 'Prof. Sarah Jenkins',
      description: 'Class rosters, department attendance verification, absent student alerts, and reports.',
      portalBadge: 'Faculty Roster Portal',
      features: ['Class Roster Verification', 'Departmental Attendance', 'AI Student Attendance Insights', 'Attendance Corrections'],
      gradient: 'from-indigo-500/20 to-purple-500/10 border-indigo-500/30'
    },
    { 
      role: 'hr_admin', 
      label: 'HR Administrator', 
      icon: <UserCheck className="w-5 h-5 text-emerald-400" />,
      defaultEmail: 'hradmin@attendance.com', 
      defaultName: 'Amanda Lewis',
      description: 'Employee enrollment, shift management, leave request approvals, and compliance export.',
      portalBadge: 'HR Operations Portal',
      features: ['Biometric Face Enrollment', 'Shift & Schedule Config', 'Leave Approval Workflows', 'CSV & PDF Export Reports'],
      gradient: 'from-emerald-500/20 to-teal-500/10 border-emerald-500/30'
    },
    { 
      role: 'security_officer', 
      label: 'Security Officer', 
      icon: <Camera className="w-5 h-5 text-amber-400" />,
      defaultEmail: 'security@attendance.com', 
      defaultName: 'Capt. James Miller',
      description: 'Real-time RTSP camera surveillance, watchlists, unknown face detections, and visitor logs.',
      portalBadge: 'Security Operations Center',
      features: ['Multi-Camera RTSP Streams', 'Unknown Face Detection Alerts', 'Watchlist Perimeter Security', '3D Liveness Telemetry'],
      gradient: 'from-amber-500/20 to-orange-500/10 border-amber-500/30'
    },
    { 
      role: 'super_admin', 
      label: 'Super Administrator', 
      icon: <Shield className="w-5 h-5 text-rose-400" />,
      defaultEmail: 'superadmin@attendance.com', 
      defaultName: 'Dr. Robert Vance',
      description: 'Full unconstrained system control, AI threshold tuning, camera node configuration, and audit logs.',
      portalBadge: 'Super Admin Control Center',
      features: ['System-Wide Control & Settings', 'AI Threshold Tuning', 'Audit Trail & Telemetry Logs', 'Node Health Monitoring'],
      gradient: 'from-rose-500/20 to-red-500/10 border-rose-500/30'
    },
  ];

  const handleLaunchRoleDashboard = (roleConfig: typeof quickRoles[0]) => {
    if (!isAuthenticated || activeRole !== roleConfig.role) {
      const userSession: User = {
        id: `usr-${Date.now()}`,
        name: roleConfig.defaultName,
        email: roleConfig.defaultEmail,
        phone: '+1 (555) 892-3011',
        role: roleConfig.role,
        category: roleConfig.role === 'employee_student' ? 'student' : 'employee',
        departmentId: 'dept-1',
        departmentName: 'School of Computer Science & AI',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150',
        faceImageUrls: [],
        status: 'active',
        accuracyScore: 99.8,
        registeredAt: new Date().toISOString().split('T')[0],
        employeeOrStudentId: `ID-${Math.floor(1000 + Math.random() * 9000)}`,
      };
      login(userSession);
      switchRole(roleConfig.role);
    }
    toast.success(`Entering ${roleConfig.label} Dashboard`);
    navigate('/dashboard');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Dynamic Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-[800px] bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.15),rgba(255,255,255,0))]" />
      <div className="absolute top-1/4 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute top-1/3 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/30 ring-2 ring-cyan-400/20">
            <ScanFace className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-2">
              BioAuth <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-400">Enterprise</span>
            </span>
            <p className="text-[10px] text-cyan-400 font-mono tracking-wider">AI Biometric Attendance System</p>
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={toggleTheme}
            className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
            title="Toggle Theme"
          >
            {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <div className="hidden sm:block text-right">
                <p className="text-xs font-bold text-white">{user?.name}</p>
                <p className="text-[10px] text-cyan-400 font-mono capitalize">{activeRole.replace('_', ' ')}</p>
              </div>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-md shadow-cyan-500/20 text-xs font-bold"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                Go to My Dashboard
              </Button>
              <button
                onClick={() => {
                  logout();
                  toast.info('Logged out successfully');
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login')}
                className="border-slate-700 text-slate-200 hover:bg-slate-800 text-xs font-semibold"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login')}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                Launch Portal
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Main Hero Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12 pb-16 text-center space-y-8">
        
        {/* Status Pill */}
        <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-full bg-slate-900/90 border border-cyan-500/30 text-cyan-400 text-xs font-semibold backdrop-blur-md shadow-lg shadow-cyan-500/10">
          <Radio className="w-4 h-4 text-cyan-400 animate-pulse" />
          <span>ArcFace 512-d Deep Learning & 3D Anti-Spoofing Liveness Active</span>
        </div>

        {/* Hero Headings */}
        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold tracking-tight text-white leading-tight">
            Touchless AI Biometric <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-primary to-indigo-400">
              Facial Recognition & Attendance
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Enterprise multi-role biometric attendance system powered by high-speed facial embeddings, RTSP live surveillance telemetry, automated roster tracking, and instant role dashboard portals.
          </p>
        </div>

        {/* Primary Interactive Session Banner */}
        {isAuthenticated ? (
          <div className="max-w-xl mx-auto p-6 rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 border border-cyan-500/30 shadow-2xl backdrop-blur-xl text-left space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-cyan-500/10 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-400 font-bold text-lg">
                  {user?.name.charAt(0)}
                </div>
                <div>
                  <span className="text-[11px] font-mono text-cyan-400 uppercase tracking-wider">Active Session</span>
                  <h3 className="text-base font-bold text-white">{user?.name}</h3>
                  <p className="text-xs text-slate-400">{user?.email}</p>
                </div>
              </div>
              <span className="px-3 py-1 rounded-full bg-cyan-500/20 text-cyan-300 text-xs font-mono border border-cyan-500/30 capitalize">
                {activeRole.replace('_', ' ')}
              </span>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="flex-1 justify-center py-3 font-bold bg-gradient-to-r from-cyan-500 via-primary to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-500/25"
              >
                <LayoutDashboard className="w-5 h-5 mr-2" />
                Enter User Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-gradient-to-r from-cyan-500 via-primary to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-500/25 rounded-2xl"
            >
              <ScanFace className="w-5 h-5 mr-2" />
              Log In to User Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => {
                const element = document.getElementById('role-portals');
                element?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold border-slate-700 text-slate-200 hover:bg-slate-800 rounded-2xl"
            >
              <Globe className="w-5 h-5 mr-2 text-cyan-400" />
              Explore Role Portals
            </Button>
          </div>
        )}

        {/* System Performance Stats Banner */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 max-w-5xl mx-auto pt-8">
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-cyan-400 font-mono">99.85%</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Biometric Recognition Accuracy</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-emerald-400 font-mono">&lt; 300 ms</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">ArcFace Vector Matching</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-indigo-400 font-mono">12,480+</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Active Enrolled Users</p>
          </div>
          <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md text-center">
            <p className="text-2xl sm:text-3xl font-extrabold text-rose-400 font-mono">32 Nodes</p>
            <p className="text-xs text-slate-400 mt-1 font-medium">Real-Time RTSP Streams</p>
          </div>
        </div>

      </section>

      {/* Role Portals Section */}
      <section id="role-portals" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold font-mono text-cyan-400 uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            Interactive User Portals
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Select Your Role to Access Dashboard
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            Choose any system access portal below to launch the personalized user dashboard for that role.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {quickRoles.map((roleConfig) => {
            const isCurrentActive = isAuthenticated && activeRole === roleConfig.role;

            return (
              <div
                key={roleConfig.role}
                className={`rounded-3xl p-6 bg-slate-900/90 border backdrop-blur-xl flex flex-col justify-between transition-all duration-300 hover:scale-[1.02] shadow-xl relative overflow-hidden group ${
                  isCurrentActive ? 'ring-2 ring-cyan-400 border-cyan-500/50' : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                {/* Ambient Card Background Gradient */}
                <div className={`absolute top-0 right-0 w-36 h-36 bg-gradient-to-br ${roleConfig.gradient} rounded-full blur-2xl pointer-events-none opacity-60 group-hover:opacity-100 transition-opacity`} />

                <div className="space-y-4 relative z-10">
                  <div className="flex items-center justify-between">
                    <div className="p-3 rounded-2xl bg-slate-950 border border-slate-800">
                      {roleConfig.icon}
                    </div>
                    <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-lg bg-slate-950 text-slate-300 border border-slate-800">
                      {roleConfig.portalBadge}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-lg font-bold text-white flex items-center gap-2">
                      {roleConfig.label}
                      {isCurrentActive && (
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                          Active
                        </span>
                      )}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1.5 leading-relaxed">
                      {roleConfig.description}
                    </p>
                  </div>

                  {/* Feature Bullets */}
                  <div className="space-y-2 pt-2 border-t border-slate-800/80">
                    <p className="text-[11px] font-bold text-slate-300 uppercase tracking-wider">Key Dashboard Capabilities:</p>
                    <ul className="space-y-1.5">
                      {roleConfig.features.map((feat, idx) => (
                        <li key={idx} className="text-xs text-slate-400 flex items-center gap-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                          <span>{feat}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Launch Button */}
                <div className="pt-6 relative z-10">
                  <Button
                    variant="primary"
                    size="md"
                    onClick={() => handleLaunchRoleDashboard(roleConfig)}
                    className="w-full justify-center text-xs font-bold py-2.5 bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-md shadow-cyan-500/20 rounded-xl"
                  >
                    <LayoutDashboard className="w-4 h-4 mr-2" />
                    {isCurrentActive ? 'Enter Active Dashboard' : `Log In & Open ${roleConfig.label} Dashboard`}
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* System Architecture Features Section */}
      <section className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800/80">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold font-mono text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            System Architecture
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Enterprise Biometric Features
          </h2>
          <p className="text-sm text-slate-400 max-w-xl mx-auto">
            High-performance deep learning pipeline designed for institution-wide attendance verification.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">512-d ArcFace Embeddings</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Extracts high-precision 512-dimensional facial feature vectors for fast cosine similarity matching across massive databases.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">3D Anti-Spoofing Liveness</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Prevents photo/video attacks using real-time texture depth analysis, micro-expression tracking, and liveness scoring filters.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-slate-900/60 border border-slate-800 backdrop-blur-md space-y-3">
            <div className="p-3 w-fit rounded-2xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Activity className="w-6 h-6" />
            </div>
            <h3 className="text-base font-bold text-white">RTSP Live Stream Telemetry</h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Connects to institutional camera networks, rendering live bounding boxes, identity tags, and attendance event notifications.
            </p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-8 px-4 sm:px-8 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ScanFace className="w-4 h-4 text-cyan-400" />
            <span className="font-bold text-white">BioAuth Enterprise</span>
            <span>- Touchless AI Attendance System</span>
          </div>
          <p>© 2026 BioAuth Biometrics Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
