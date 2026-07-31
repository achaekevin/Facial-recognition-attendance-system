import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ScanFace, 
  ShieldCheck, 
  UserCheck, 
  GraduationCap, 
  Camera, 
  Shield, 
  User as UserIcon, 
  ArrowRight, 
  Zap, 
  LayoutDashboard, 
  ChevronRight, 
  Sun, 
  Moon,
  LogOut,
  Clock,
  Sparkles
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

  const rolePortals: { 
    role: UserRole; 
    label: string; 
    icon: React.ReactNode; 
    defaultEmail: string; 
    defaultName: string;
    tagline: string;
  }[] = [
    { 
      role: 'employee_student', 
      label: 'Student / Employee', 
      icon: <UserIcon className="w-6 h-6 text-cyan-400" />,
      defaultEmail: 'student@attendance.com', 
      defaultName: 'Alex Rivera',
      tagline: 'Self check-in history, personal profile & leave requests.',
    },
    { 
      role: 'lecturer_teacher', 
      label: 'Lecturer / Teacher', 
      icon: <GraduationCap className="w-6 h-6 text-indigo-400" />,
      defaultEmail: 'lecturer@attendance.com', 
      defaultName: 'Prof. Sarah Jenkins',
      tagline: 'Class rosters, department attendance & absence tracking.',
    },
    { 
      role: 'hr_admin', 
      label: 'HR Administrator', 
      icon: <UserCheck className="w-6 h-6 text-emerald-400" />,
      defaultEmail: 'hradmin@attendance.com', 
      defaultName: 'Amanda Lewis',
      tagline: 'Biometric enrollment, shift schedules & leave approvals.',
    },
    { 
      role: 'security_officer', 
      label: 'Security Officer', 
      icon: <Camera className="w-6 h-6 text-amber-400" />,
      defaultEmail: 'security@attendance.com', 
      defaultName: 'Capt. James Miller',
      tagline: 'Live camera monitoring, watchlist alerts & visitor logs.',
    },
    { 
      role: 'super_admin', 
      label: 'Super Administrator', 
      icon: <Shield className="w-6 h-6 text-rose-400" />,
      defaultEmail: 'superadmin@attendance.com', 
      defaultName: 'Dr. Robert Vance',
      tagline: 'Full system configuration, camera nodes & audit trails.',
    },
  ];

  const handleLaunchRoleDashboard = (roleConfig: typeof rolePortals[0]) => {
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
        avatar: '',
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
      {/* Soft Ambient Background Glow */}
      <div className="absolute top-0 left-0 w-full h-[600px] bg-[radial-gradient(ellipse_70%_70%_at_50%_-10%,rgba(56,189,248,0.12),rgba(0,0,0,0))]" />

      {/* Header Bar */}
      <header className="sticky top-0 z-50 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <ScanFace className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight">BioAuth</span>
            <span className="text-xs text-cyan-400 font-medium ml-1.5 hidden sm:inline">Attendance System</span>
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
              <span className="text-xs font-semibold text-slate-300 hidden sm:inline">
                {user?.name}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                Go to My Dashboard
              </Button>
              <button
                onClick={() => {
                  logout();
                  toast.info('Logged out');
                }}
                className="p-2 rounded-xl text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <Button
              variant="primary"
              size="sm"
              onClick={() => navigate('/login')}
              className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-xs font-bold shadow-md shadow-cyan-500/20"
            >
              Sign In
            </Button>
          )}
        </div>
      </header>

      {/* Main Clean Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-16 text-center space-y-6">
        
        {/* Simple Badge */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 text-xs font-semibold">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Touchless Facial Recognition System</span>
        </div>

        {/* Hero Headline */}
        <h1 className="text-3xl sm:text-5xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto">
          Smart, Secure & Touchless <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 via-primary to-indigo-400">
            Attendance Monitoring
          </span>
        </h1>

        <p className="text-sm sm:text-base text-slate-300 max-w-xl mx-auto leading-relaxed">
          Welcome to BioAuth Enterprise. Select your access role below or sign in to open your attendance dashboard.
        </p>

        {/* Primary CTA */}
        {isAuthenticated ? (
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3 text-sm font-bold bg-gradient-to-r from-cyan-500 via-primary to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-500/20 rounded-xl"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Enter My User Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="pt-2">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login')}
              className="px-8 py-3 text-sm font-bold bg-gradient-to-r from-cyan-500 via-primary to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 shadow-xl shadow-cyan-500/20 rounded-xl"
            >
              <ScanFace className="w-5 h-5 mr-2" />
              Sign In to System Portal
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        )}
      </section>

      {/* Clean & Simple User Role Selection */}
      <section className="relative z-10 max-w-6xl mx-auto px-4 sm:px-6 py-10">
        <div className="text-center mb-8">
          <h2 className="text-xl sm:text-2xl font-bold text-white">Select Access Role to Open Dashboard</h2>
          <p className="text-xs text-slate-400 mt-1">Click any role below to launch its dashboard interface.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {rolePortals.map((item) => {
            const isActive = isAuthenticated && activeRole === item.role;
            return (
              <div
                key={item.role}
                onClick={() => handleLaunchRoleDashboard(item)}
                className={`p-5 rounded-2xl bg-slate-900/80 border backdrop-blur-md cursor-pointer transition-all duration-200 hover:border-cyan-500/50 hover:bg-slate-900 flex flex-col justify-between group ${
                  isActive ? 'ring-2 ring-cyan-400 border-cyan-500' : 'border-slate-800'
                }`}
              >
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="p-2.5 rounded-xl bg-slate-950 border border-slate-800">
                      {item.icon}
                    </div>
                    {isActive && (
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                        Active
                      </span>
                    )}
                  </div>

                  <div>
                    <h3 className="text-base font-bold text-white group-hover:text-cyan-400 transition-colors">
                      {item.label}
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      {item.tagline}
                    </p>
                  </div>
                </div>

                <div className="pt-4 flex items-center text-xs font-semibold text-cyan-400 group-hover:translate-x-1 transition-transform">
                  <span>Open Dashboard</span>
                  <ChevronRight className="w-4 h-4 ml-1" />
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* 3 Core System Features (Simple & Clean) */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 border-t border-slate-800/60 mt-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <Zap className="w-6 h-6 text-cyan-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">Touchless Check-in</h4>
            <p className="text-xs text-slate-400 mt-1">Instant facial verification without physical contact.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <ShieldCheck className="w-6 h-6 text-emerald-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">Anti-Spoofing Liveness</h4>
            <p className="text-xs text-slate-400 mt-1">Advanced 3D security prevents photo/video spoofing.</p>
          </div>

          <div className="p-5 rounded-2xl bg-slate-900/40 border border-slate-800/60">
            <Clock className="w-6 h-6 text-indigo-400 mx-auto mb-2" />
            <h4 className="text-sm font-bold text-white">Automated Reports</h4>
            <p className="text-xs text-slate-400 mt-1">Real-time attendance logs, corrections & export options.</p>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-slate-950 py-6 text-center text-xs text-slate-500">
        <p>© 2026 BioAuth Enterprise. All rights reserved.</p>
      </footer>
    </div>
  );
};
