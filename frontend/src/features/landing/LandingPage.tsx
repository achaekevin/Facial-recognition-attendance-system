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
  UserPlus,
  Fingerprint,
  CheckCircle2
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
      description: 'Securely extract and register 512-d facial biometric embeddings.',
      badge: '512-D Neural Vector',
      icon: <Fingerprint className="w-4 h-4 text-emerald-400" />,
      microVisual: (
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Vector Extraction
            </span>
            <span className="text-slate-400 text-[10px]">Float32 Tensor</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-900/90 border border-slate-800/90 text-[11px] text-slate-300 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
            [+0.184, -0.921, +0.407, +0.038, -0.512 ... +507]
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>Encrypted Hash</span>
            <span className="text-emerald-400 font-semibold font-mono">SHA-256 Verified</span>
          </div>
        </div>
      )
    },
    {
      step: '02',
      title: 'Live Camera Verification',
      description: 'Stand in front of any camera terminal for instant liveness detection.',
      badge: '3D Anti-Spoof Liveness',
      icon: <Camera className="w-4 h-4 text-teal-400" />,
      microVisual: (
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-teal-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-400 animate-pulse" />
              Terminal Scan
            </span>
            <span className="text-teal-400 text-[10px] font-semibold">&lt; 0.24s Latency</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-900/90 border border-teal-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                <ScanFace className="w-4 h-4 text-teal-400" />
              </div>
              <div className="text-[10px] font-sans">
                <div className="font-semibold text-slate-200">Face Match: 99.8%</div>
                <div className="text-slate-400">3D Depth &amp; Blink Passed</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-300 border border-teal-500/30 font-bold">
              PASS
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>Presentation Attack Check</span>
            <span className="text-teal-400 font-semibold">Zero Spoof</span>
          </div>
        </div>
      )
    },
    {
      step: '03',
      title: 'Automated Attendance Log',
      description: 'Check-in is recorded in real time to your personal dashboard and reports.',
      badge: 'Instant Ledger Sync',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-400" />,
      microVisual: (
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-950/80 border border-slate-800/80 font-mono text-xs text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              Audit Recorded
            </span>
            <span className="text-emerald-400 text-[10px] font-semibold">Real-Time Sync</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <div className="text-[10px] font-sans">
                <div className="font-semibold text-emerald-200">Attendance Logged</div>
                <div className="text-slate-400">Status: Present • On Time</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-300">08:30 AM</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-400 pt-0.5">
            <span>Export Pipeline</span>
            <span className="text-emerald-400 font-semibold">CSV / PDF / API</span>
          </div>
        </div>
      )
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
      <section id="workflow" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-800">
        <div className="text-center space-y-3 mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-400 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">
            How BioAuth Works
          </h2>
          <p className="text-base text-slate-300 max-w-xl mx-auto">
            From enrollment to attendance verification in seconds.
          </p>
        </div>

        {/* Timeline Container with desktop connecting line */}
        <div className="relative">
          {/* Interconnected glowing timeline track on desktop (strictly emerald/teal, NO blue/purple) */}
          <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-[2px] bg-slate-800 z-0">
            <div className="h-full w-full bg-gradient-to-r from-emerald-500/20 via-emerald-400/60 to-emerald-500/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {workflowSteps.map((item, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-3xl bg-slate-900/80 backdrop-blur-xl border border-slate-800/90 hover:border-emerald-500/50 hover:shadow-[0_12px_36px_rgba(16,185,129,0.12)] hover:-translate-y-1.5 transition-all duration-300 relative space-y-4"
              >
                {/* Step Header with Number Pill and Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-900 border-2 border-emerald-500/40 group-hover:border-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center font-mono font-extrabold text-lg text-emerald-400 transition-all duration-200">
                    {item.step}
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-800/90 text-slate-300 border border-slate-700/80 flex items-center gap-1.5 shadow-sm">
                    {item.icon}
                    <span>{item.badge}</span>
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-white group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed">
                    {item.description}
                  </p>
                </div>

                {/* Biometric Micro-Visual Widget */}
                {item.microVisual}
              </div>
            ))}
          </div>
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
