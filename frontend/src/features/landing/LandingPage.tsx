import React from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ScanFace, 
  ShieldCheck, 
  Camera, 
  ArrowRight, 
  Zap, 
  LayoutDashboard, 
  Sun, 
  Moon,
  LogOut,
  Sparkles,
  BarChart3,
  QrCode,
  Lock,
  UserPlus
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { useThemeStore } from '../../store/useThemeStore';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';
import { BiometricCampusBackground } from './components/BiometricCampusBackground';

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
      icon: <Zap className="w-6 h-6 text-white" />,
      title: 'Touchless Biometric Check-In',
      description: 'Instant facial recognition authentication allowing touchless check-ins for students and staff.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-white" />,
      title: '3D Anti-Spoofing Liveness',
      description: 'Advanced anti-spoofing filters that reject photo, video, and mask presentation attacks.'
    },
    {
      icon: <Camera className="w-6 h-6 text-white" />,
      title: 'Real-Time Camera Telemetry',
      description: 'Seamless integration with campus IP camera nodes for continuous perimeter attendance feeds.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-white" />,
      title: 'Automated Rosters & Reports',
      description: 'Calculates shift hours, late arrivals, and overtime with instant CSV and PDF compliance exports.'
    },
    {
      icon: <Lock className="w-6 h-6 text-white" />,
      title: 'Role-Based Access Control',
      description: 'Tailored permissions for Students, Lecturers, HR Administrators, Security, and Super Admins.'
    },
    {
      icon: <QrCode className="w-6 h-6 text-white" />,
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
    <div className="min-h-screen bg-[#0f172a] text-white flex flex-col font-sans select-none relative overflow-x-hidden">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-[#0f172a] border-b border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-slate-800 border border-slate-700 flex items-center justify-center text-white shadow-lg">
            <ScanFace className="w-6 h-6 text-white" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-white tracking-tight flex items-center gap-1.5">
              BioAuth Enterprise
            </span>
            <p className="text-xs text-white font-mono tracking-wider">AI Biometric System</p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-white">
          <button onClick={() => scrollToSection('features')} className="text-white hover:underline transition-colors">
            System Features
          </button>
          <button onClick={() => scrollToSection('workflow')} className="text-white hover:underline transition-colors">
            How It Works
          </button>
          <button onClick={() => scrollToSection('security')} className="text-white hover:underline transition-colors">
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
            className="p-2.5 rounded-xl border border-slate-700 bg-slate-800 text-white hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-semibold"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-white" />
                <span className="hidden sm:inline text-white">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-white" />
                <span className="hidden sm:inline text-white">Dark Mode</span>
              </>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-white hidden sm:inline">
                {user?.name}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-bold shadow-md"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5 text-white" />
                Go to My Dashboard
              </Button>
              <button
                onClick={() => {
                  logout();
                  toast.info('Logged out successfully');
                }}
                className="p-2 rounded-xl text-white hover:bg-slate-800 transition-colors"
                title="Log Out"
              >
                <LogOut className="w-4 h-4 text-white" />
              </button>
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => navigate('/login?mode=signin')}
                className="border-slate-700 bg-slate-800 text-white hover:bg-slate-700 text-sm font-semibold"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login?mode=signup')}
                className="bg-slate-800 hover:bg-slate-700 border border-slate-700 text-white text-sm font-bold shadow-md"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5 text-white" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Biometric Campus Background Image */}
      <section className="relative z-10 min-h-screen flex items-center overflow-hidden">
        {/* Campus Background Image with Biometric Terminal */}
        <BiometricCampusBackground />

        {/* Left Content Area */}
        <div className="relative z-20 max-w-3xl px-4 sm:px-8 lg:px-16 py-20 text-center lg:text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-800/90 border border-slate-700 text-white text-xs sm:text-sm font-semibold shadow-md">
            <Sparkles className="w-4 h-4 text-white" />
            <span>Next-Generation Touchless Attendance</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight">
              Biometric Facial Recognition <br />
              Attendance & Operations
            </h1>
            <p className="text-base sm:text-lg text-white max-w-2xl leading-relaxed">
              Enterprise touchless attendance platform for institutions, universities, and corporations. Powered by 512-d facial embeddings, 3D anti-spoofing liveness checks, and real-time camera telemetries.
            </p>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            {isAuthenticated ? (
              <Button
                variant="primary"
                size="lg"
                onClick={() => navigate('/dashboard')}
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white shadow-lg rounded-2xl"
              >
                <LayoutDashboard className="w-5 h-5 mr-2 text-white" />
                Go to My Dashboard
                <ArrowRight className="w-4 h-4 ml-2 text-white" />
              </Button>
            ) : (
              <>
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/login?mode=signin')}
                  className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-slate-800 hover:bg-slate-700 border border-slate-600 text-white shadow-lg rounded-2xl"
                >
                  <ScanFace className="w-5 h-5 mr-2 text-white" />
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 text-white" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login?mode=signup')}
                  className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold border-slate-700 bg-slate-800/90 hover:bg-slate-700 text-white rounded-2xl shadow-md"
                >
                  <UserPlus className="w-5 h-5 mr-2 text-white" />
                  Sign Up for Access
                </Button>
              </>
            )}
          </div>

          {/* Key Metrics Row */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
            <div className="bg-slate-800/95 rounded-2xl p-4 border border-slate-700 shadow-md">
              <div className="text-2xl font-bold text-white">99.7%</div>
              <div className="text-xs text-white">Recognition Accuracy</div>
            </div>
            <div className="bg-slate-800/95 rounded-2xl p-4 border border-slate-700 shadow-md">
              <div className="text-2xl font-bold text-white">&lt;2s</div>
              <div className="text-xs text-white">Average Response</div>
            </div>
            <div className="bg-slate-800/95 rounded-2xl p-4 border border-slate-700 shadow-md">
              <div className="text-2xl font-bold text-white">24/7</div>
              <div className="text-xs text-white">System Uptime</div>
            </div>
          </div>
        </div>
      </section>

      {/* Overview & Key System Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800">
        <div className="text-center space-y-3 mb-12">
          <span className="text-sm font-bold font-mono text-white uppercase tracking-widest px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            System Overview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            Comprehensive Biometric Capabilities
          </h2>
          <p className="text-base text-white max-w-xl mx-auto">
            Everything you need for seamless, automated attendance monitoring across your institution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-slate-800 border border-slate-700 hover:border-slate-600 shadow-md transition-all duration-200 space-y-3"
            >
              <div className="p-3 w-fit rounded-2xl bg-slate-700 border border-slate-600 text-white">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-white">{feat.title}</h3>
              <p className="text-sm text-white leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works (Workflow Steps) */}
      <section id="workflow" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-800">
        <div className="text-center space-y-3 mb-12">
          <span className="text-sm font-bold font-mono text-white uppercase tracking-widest px-3 py-1 rounded-full bg-slate-800 border border-slate-700">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white">
            How BioAuth Works
          </h2>
          <p className="text-base text-white max-w-xl mx-auto">
            From enrollment to attendance verification in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {workflowSteps.map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-slate-800 border border-slate-700 hover:border-slate-600 shadow-md relative space-y-3 transition-all duration-200">
              <span className="text-3xl font-extrabold font-mono text-white">
                {item.step}
              </span>
              <h3 className="text-lg font-bold text-white">{item.title}</h3>
              <p className="text-sm text-white leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security & Compliance Banner */}
      <section id="security" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 my-8 rounded-3xl bg-slate-800 border border-slate-700 text-center space-y-4 shadow-md">
        <div className="inline-flex items-center gap-2 text-white text-sm font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4 text-white" />
          Enterprise Security & Privacy Standard
        </div>
        <h3 className="text-2xl font-bold text-white">Encrypted Biometric Protection</h3>
        <p className="text-base text-white max-w-2xl mx-auto leading-relaxed">
          Biometric face embeddings are transformed into encrypted 512-dimensional vector hashes. No raw face photos are stored in recognition databases, ensuring maximum privacy compliance.
        </p>
      </section>

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-800 bg-[#0f172a] py-8 px-4 sm:px-8 text-center text-sm text-white">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2 text-white">
            <ScanFace className="w-4 h-4 text-white" />
            <span className="font-bold text-white">BioAuth Enterprise</span>
            <span className="text-white">- Biometric Attendance Platform</span>
          </div>
          <p className="text-white">© 2026 BioAuth Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
