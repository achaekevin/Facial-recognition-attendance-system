import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ScanFace, 
  ShieldCheck, 
  UserCheck, 
  Camera, 
  Shield, 
  ArrowRight, 
  Zap, 
  LayoutDashboard, 
  Sun, 
  Moon,
  LogOut,
  Clock,
  Sparkles,
  BarChart3,
  QrCode,
  CheckCircle2,
  Lock,
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user, logout } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  const coreFeatures = [
    {
      icon: <Zap className="w-6 h-6 text-cyan-500 dark:text-cyan-400" />,
      title: 'Touchless Biometric Check-In',
      description: 'Instant facial recognition authentication allowing touchless check-ins for students and staff.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
      title: '3D Anti-Spoofing Liveness',
      description: 'Advanced anti-spoofing filters that reject photo, video, and mask presentation attacks.'
    },
    {
      icon: <Camera className="w-6 h-6 text-indigo-500 dark:text-indigo-400" />,
      title: 'Real-Time Camera Telemetry',
      description: 'Seamless integration with campus IP camera nodes for continuous perimeter attendance feeds.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
      title: 'Automated Rosters & Reports',
      description: 'Calculates shift hours, late arrivals, and overtime with instant CSV and PDF compliance exports.'
    },
    {
      icon: <Lock className="w-6 h-6 text-rose-500 dark:text-rose-400" />,
      title: 'Role-Based Access Control',
      description: 'Tailored permissions for Students, Lecturers, HR Administrators, Security, and Super Admins.'
    },
    {
      icon: <QrCode className="w-6 h-6 text-purple-500 dark:text-purple-400" />,
      title: 'Offline & QR Pass Backup',
      description: 'Local offline telemetry synchronization and QR pass verification ensuring uninterrupted uptime.'
    }
  ];

  const workflowSteps = [
    {
      step: '01',
      title: 'Face Enrollment',
      description: 'Securely extract and register 512-d facial biometric embeddings.'
    },
    {
      step: '02',
      title: 'Live Camera Verification',
      description: 'Stand in front of any camera terminal for instant liveness detection.'
    },
    {
      step: '03',
      title: 'Automated Attendance Log',
      description: 'Check-in is recorded in real time to your personal dashboard and reports.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex flex-col font-sans select-none relative overflow-x-hidden transition-colors duration-300">
      {/* Ambient Background Gradient Blur */}
      <div className="absolute top-0 left-0 w-full h-[700px] bg-[radial-gradient(ellipse_80%_80%_at_50%_-15%,rgba(56,189,248,0.15),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-15%,rgba(56,189,248,0.15),rgba(0,0,0,0))]" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-900/80 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800/80 px-4 sm:px-8 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-cyan-500 via-primary to-indigo-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20 ring-2 ring-cyan-400/20">
            <ScanFace className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              BioAuth <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400">Enterprise</span>
            </span>
            <p className="text-[10px] text-cyan-600 dark:text-cyan-400 font-mono tracking-wider">AI Biometric System</p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-xs font-semibold text-slate-600 dark:text-slate-300">
          <button onClick={() => scrollToSection('features')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
            System Features
          </button>
          <button onClick={() => scrollToSection('workflow')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
            How It Works
          </button>
          <button onClick={() => scrollToSection('security')} className="hover:text-slate-900 dark:hover:text-white transition-colors">
            Security & Compliance
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              toggleTheme();
              toast.info(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, { duration: 1000 });
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-xs font-semibold"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-indigo-600" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <span className="text-xs font-semibold text-slate-700 dark:text-slate-300 hidden sm:inline">
                {user?.name}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                Go to My Dashboard
              </Button>
              <button
                onClick={() => {
                  logout();
                  toast.info('Logged out successfully');
                }}
                className="p-2 rounded-xl text-slate-500 dark:text-slate-400 hover:text-rose-500 dark:hover:text-rose-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                onClick={() => navigate('/login?mode=signin')}
                className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 text-xs font-semibold"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login?mode=signup')}
                className="bg-gradient-to-r from-cyan-500 to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white text-xs font-bold shadow-md shadow-cyan-500/20"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-20 text-center space-y-8">
        
        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-600 dark:text-cyan-400 text-xs font-semibold backdrop-blur-md shadow-sm">
          <Sparkles className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
          <span>Next-Generation Touchless Attendance Authentication</span>
        </div>

        <div className="space-y-4 max-w-4xl mx-auto">
          <h1 className="text-4xl sm:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight">
            Biometric Facial Recognition <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 via-primary to-indigo-600 dark:from-cyan-400 dark:via-primary dark:to-indigo-400">
              Attendance & Operations
            </span>
          </h1>
          <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Enterprise touchless attendance platform for institutions, universities, and corporations. Powered by 512-d facial embeddings, 3D anti-spoofing liveness checks, and real-time camera telemetries.
          </p>
        </div>

        {/* Action Buttons: Sign In / Sign Up */}
        {isAuthenticated ? (
          <div className="pt-4 flex justify-center">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/dashboard')}
              className="px-8 py-3.5 text-sm font-bold bg-gradient-to-r from-cyan-500 via-primary to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/25 rounded-2xl"
            >
              <LayoutDashboard className="w-5 h-5 mr-2" />
              Go to My Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </div>
        ) : (
          <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              variant="primary"
              size="lg"
              onClick={() => navigate('/login?mode=signin')}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-gradient-to-r from-cyan-500 via-primary to-indigo-600 hover:from-cyan-400 hover:to-indigo-500 text-white shadow-xl shadow-cyan-500/25 rounded-2xl"
            >
              <ScanFace className="w-5 h-5 mr-2" />
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
            <Button
              variant="outline"
              size="lg"
              onClick={() => navigate('/login?mode=signup')}
              className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold border-slate-300 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800/80 rounded-2xl"
            >
              <UserPlus className="w-5 h-5 mr-2 text-cyan-600 dark:text-cyan-400" />
              Sign Up for Access
            </Button>
          </div>
        )}
      </section>

      {/* Overview & Key System Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold font-mono text-cyan-600 dark:text-cyan-400 uppercase tracking-widest px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20">
            System Overview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Comprehensive Biometric Capabilities
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            Everything you need for seamless, automated attendance monitoring across your institution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white dark:bg-slate-900/70 border border-slate-200 dark:border-slate-800/80 shadow-sm dark:shadow-none hover:border-cyan-500/40 dark:hover:border-slate-700 transition-all duration-200 space-y-3"
            >
              <div className="p-3 w-fit rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800">
                {feat.icon}
              </div>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{feat.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works (Workflow Steps) */}
      <section id="workflow" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center space-y-3 mb-12">
          <span className="text-xs font-bold font-mono text-indigo-600 dark:text-indigo-400 uppercase tracking-widest px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/20">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How BioAuth Works
          </h2>
          <p className="text-sm text-slate-600 dark:text-slate-400 max-w-xl mx-auto">
            From enrollment to attendance verification in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {workflowSteps.map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-white dark:bg-slate-900/60 border border-slate-200 dark:border-slate-800 shadow-sm dark:shadow-none relative space-y-3">
              <span className="text-3xl font-extrabold font-mono text-cyan-600/40 dark:text-cyan-400/40">
                {item.step}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security & Compliance Banner */}
      <section id="security" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 my-8 rounded-3xl bg-gradient-to-r from-slate-100 via-indigo-50 to-slate-100 dark:from-slate-900 dark:via-indigo-950/40 dark:to-slate-900 border border-slate-200 dark:border-slate-800 text-center space-y-4">
        <div className="inline-flex items-center gap-2 text-emerald-600 dark:text-emerald-400 text-xs font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          Enterprise Security & Privacy Standard
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Encrypted Biometric Protection</h3>
        <p className="text-xs sm:text-sm text-slate-600 dark:text-slate-400 max-w-2xl mx-auto leading-relaxed">
          Biometric face embeddings are transformed into encrypted 512-dimensional vector hashes. No raw face photos are stored in recognition databases, ensuring maximum privacy compliance.
        </p>
      </section>

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 py-8 px-4 sm:px-8 text-center text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ScanFace className="w-4 h-4 text-cyan-500 dark:text-cyan-400" />
            <span className="font-bold text-slate-900 dark:text-white">BioAuth Enterprise</span>
            <span>- Biometric Attendance Platform</span>
          </div>
          <p>© 2026 BioAuth Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
