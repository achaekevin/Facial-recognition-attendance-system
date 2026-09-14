import React, { useState } from 'react';
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
  CheckCircle2, 
  GraduationCap, 
  Briefcase, 
  ShieldAlert, 
  Check, 
  Eye, 
  RefreshCw, 
  ChevronDown, 
  ChevronUp, 
  Cpu, 
  Database, 
  FileText, 
  Radio 
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

  // Interactive Simulator State
  const [activeSimTab, setActiveSimTab] = useState<'scan' | 'liveness' | 'ledger'>('scan');
  const [isSimulating, setIsSimulating] = useState(false);

  // Role Tab State
  const [activeRoleTab, setActiveRoleTab] = useState<'students' | 'lecturers' | 'hr' | 'security'>('students');

  // FAQ Accordion State
  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const toggleFaq = (idx: number) => {
    setOpenFaq(openFaq === idx ? null : idx);
  };

  const runSimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setIsSimulating(false);
      toast.success('Simulation complete: Biometric identity verified & attendance logged!', { duration: 3000 });
    }, 1200);
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    el?.scrollIntoView({ behavior: 'smooth' });
  };

  // 6 Core Features Preserved & Enhanced with Semantic Accents
  const coreFeatures = [
    {
      icon: <Zap className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      accentBg: 'bg-emerald-500/10 border-emerald-500/30',
      badge: 'Touchless AI',
      badgeColor: 'text-emerald-700 dark:text-emerald-400',
      title: 'Touchless Biometric Check-In',
      description: 'Instant facial recognition authentication allowing touchless check-ins for students and staff within 200ms.'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-teal-600 dark:text-teal-400" />,
      accentBg: 'bg-teal-500/10 border-teal-500/30',
      badge: 'ISO 30107-3',
      badgeColor: 'text-teal-700 dark:text-teal-400',
      title: '3D Anti-Spoofing Liveness',
      description: 'Dual active & passive anti-spoofing filters that reject photo prints, 4K screen replays, and 3D silicone mask attacks.'
    },
    {
      icon: <Camera className="w-6 h-6 text-cyan-600 dark:text-cyan-400" />,
      accentBg: 'bg-cyan-500/10 border-cyan-500/30',
      badge: 'RTSP / WebRTC',
      badgeColor: 'text-cyan-700 dark:text-cyan-400',
      title: 'Real-Time Camera Telemetry',
      description: 'Seamless integration with campus IP camera nodes for continuous perimeter attendance feeds and latency monitoring.'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-amber-600 dark:text-amber-400" />,
      accentBg: 'bg-amber-500/10 border-amber-500/30',
      badge: 'Automated Rosters',
      badgeColor: 'text-amber-700 dark:text-amber-400',
      title: 'Automated Rosters & Reports',
      description: 'Calculates shift hours, late arrivals, and overtime with instant CSV and PDF compliance exports.'
    },
    {
      icon: <Lock className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />,
      accentBg: 'bg-emerald-500/10 border-emerald-500/30',
      badge: '5 Access Tiers',
      badgeColor: 'text-emerald-700 dark:text-emerald-400',
      title: 'Role-Based Access Control',
      description: 'Tailored permissions for Students, Lecturers, HR Administrators, Campus Security, and Super Admins.'
    },
    {
      icon: <QrCode className="w-6 h-6 text-rose-600 dark:text-rose-400" />,
      accentBg: 'bg-rose-500/10 border-rose-500/30',
      badge: 'Zero-Downtime Backup',
      badgeColor: 'text-rose-700 dark:text-rose-400',
      title: 'Offline & QR Pass Backup',
      description: 'Local offline telemetry synchronization and encrypted QR pass verification ensuring uninterrupted uptime.'
    }
  ];

  // 3-Step Workflow Preserved with Rich Biometric Micro-Visuals
  const workflowSteps = [
    {
      step: '01',
      title: 'Face Enrollment',
      description: 'Securely extract and register 512-d facial biometric embeddings.',
      badge: '512-D Neural Vector',
      icon: <Fingerprint className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      microVisual: (
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              Vector Extraction
            </span>
            <span className="text-slate-500 dark:text-slate-400 text-[10px]">Float32 Tensor</span>
          </div>
          <div className="p-2 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800/90 text-[11px] text-slate-700 dark:text-slate-300 font-mono overflow-hidden text-ellipsis whitespace-nowrap">
            [+0.184, -0.921, +0.407, +0.038, -0.512 ... +507]
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
            <span>Encrypted Hash</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold font-mono">SHA-256 Verified</span>
          </div>
        </div>
      )
    },
    {
      step: '02',
      title: 'Live Camera Verification',
      description: 'Stand in front of any camera terminal for instant liveness detection.',
      badge: '3D Anti-Spoof Liveness',
      icon: <Camera className="w-4 h-4 text-teal-600 dark:text-teal-400" />,
      microVisual: (
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-teal-600 dark:text-teal-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-teal-500 dark:bg-teal-400 animate-pulse" />
              Terminal Scan
            </span>
            <span className="text-teal-700 dark:text-teal-400 text-[10px] font-semibold">&lt; 0.24s Latency</span>
          </div>
          <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900/90 border border-teal-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-teal-500/10 border border-teal-500/30 flex items-center justify-center">
                <ScanFace className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-[10px] font-sans">
                <div className="font-semibold text-slate-800 dark:text-slate-200">Face Match: 99.8%</div>
                <div className="text-slate-500 dark:text-slate-400">3D Depth &amp; Blink Passed</div>
              </div>
            </div>
            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-teal-500/15 text-teal-700 dark:text-teal-300 border border-teal-500/30 font-bold">
              PASS
            </span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
            <span>Presentation Attack Check</span>
            <span className="text-teal-700 dark:text-teal-400 font-semibold">Zero Spoof</span>
          </div>
        </div>
      )
    },
    {
      step: '03',
      title: 'Automated Attendance Log',
      description: 'Check-in is recorded in real time to your personal dashboard and reports.',
      badge: 'Instant Ledger Sync',
      icon: <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />,
      microVisual: (
        <div className="mt-4 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/80 border border-slate-200 dark:border-slate-800/80 font-mono text-xs text-slate-700 dark:text-slate-300 space-y-2">
          <div className="flex items-center justify-between text-[11px]">
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-semibold">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400" />
              Audit Recorded
            </span>
            <span className="text-emerald-700 dark:text-emerald-400 text-[10px] font-semibold">Real-Time Sync</span>
          </div>
          <div className="p-2.5 rounded-lg bg-emerald-50 dark:bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 rounded-lg bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-[10px] font-sans">
                <div className="font-semibold text-emerald-900 dark:text-emerald-200">Attendance Logged</div>
                <div className="text-slate-600 dark:text-slate-400">Status: Present • On Time</div>
              </div>
            </div>
            <span className="text-[10px] font-mono text-slate-600 dark:text-slate-300">08:30 AM</span>
          </div>
          <div className="flex items-center justify-between text-[10px] text-slate-500 dark:text-slate-400 pt-0.5">
            <span>Export Pipeline</span>
            <span className="text-emerald-700 dark:text-emerald-400 font-semibold">CSV / PDF / API</span>
          </div>
        </div>
      )
    }
  ];

  // Role Showcase Data
  const roleCapabilities = {
    students: {
      title: 'Students & Employees',
      badge: 'Touchless Daily Pass',
      icon: <GraduationCap className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />,
      desc: 'Seamless, frictionless entrance through campus turnstiles and lecture halls without badges or plastic ID cards.',
      features: [
        'Instant touchless check-in under 0.24 seconds at any camera node',
        'Personal mobile attendance stats, percentage tracking & streak metrics',
        'Dynamic offline QR Pass backup for low-connectivity zones',
        'Transparent attendance correction request submissions with audit proof'
      ]
    },
    lecturers: {
      title: 'Lecturers & Supervisors',
      badge: 'Classroom Automation',
      icon: <Briefcase className="w-5 h-5 text-teal-600 dark:text-teal-400" />,
      desc: 'Eliminate 15 minutes of manual roll call every lecture with automated face scanning as students walk through the door.',
      features: [
        'Live lecture hall presence rosters updating in real-time',
        'Instant alerts for chronic absenteeism and drop-off risks',
        'One-click dispute review and attendance validation workflow',
        'Direct roster CSV export formatted for institutional gradebooks'
      ]
    },
    hr: {
      title: 'HR & Institutional Admins',
      badge: 'Enterprise Compliance',
      icon: <BarChart3 className="w-5 h-5 text-amber-600 dark:text-amber-400" />,
      desc: 'Automated shift recording, overtime computation, and multi-department attendance compliance dashboards.',
      features: [
        'Automated shift tracking with late-entry & early-exit time logging',
        'Multi-department attendance heatmaps & peak congestion analytics',
        'Compliant audit trails with tamper-evident cryptographic timestamps',
        'Automated monthly payroll-ready PDF and CSV export generation'
      ]
    },
    security: {
      title: 'Campus Security & Officers',
      badge: 'Perimeter Telemetry',
      icon: <ShieldAlert className="w-5 h-5 text-rose-600 dark:text-rose-400" />,
      desc: 'Continuous camera node health monitoring, unknown face alerts, and perimeter watchlist notifications.',
      features: [
        'Real-time multi-angle camera feeds across all terminal stations',
        'Instant security alerts for unrecognized faces at restricted perimeters',
        'Historical verification replay with timestamped video frames',
        'Emergency lockdown and access terminal override controls'
      ]
    }
  };

  // FAQ Items
  const faqList = [
    {
      q: 'Are actual student or staff face photos stored in the database?',
      a: 'No. BioAuth uses privacy-preserving biometric architecture. When a face is registered, an AI model converts facial geometry into an encrypted 512-dimensional vector embedding. The original photo is discarded, making it mathematically impossible to reconstruct the raw face photo from stored biometric data.'
    },
    {
      q: 'How does the system prevent spoofing with photos or phone screens?',
      a: 'Our terminal algorithms employ multi-spectrum 3D liveness detection compliant with ISO/IEC 30107-3. The system analyzes micro-texture reflections, blink kinematics, and depth disparity to instantaneously reject printed photos, video replays, tablet screens, and silicone masks.'
    },
    {
      q: 'What happens if a campus camera terminal loses its internet connection?',
      a: 'Terminals feature local edge caching. When disconnected, the local node continues verifying faces against cached encrypted templates and issues signed QR passes. Once connectivity is restored, all offline attendance records sync automatically without data loss.'
    },
    {
      q: 'Can students or employees dispute an accidental absence?',
      a: 'Yes. The system includes a dedicated Attendance Correction Workflow. Users can submit dispute requests with optional notes. Lecturers and HR supervisors receive notifications and can approve or deny requests with an immutable audit log.'
    },
    {
      q: 'Can BioAuth integrate with our existing RTSP or IP cameras?',
      a: 'Yes. BioAuth supports standard RTSP, WebRTC, and ONVIF video streams from major camera vendors, allowing institutions to leverage existing security infrastructure without purchasing proprietary biometric hardware.'
    }
  ];

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0f172a] text-slate-900 dark:text-white flex flex-col font-sans select-none relative overflow-x-hidden transition-colors duration-300">
      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/90 dark:bg-[#0f172a]/90 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-3.5 flex items-center justify-between transition-colors duration-200">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-emerald-500/40 flex items-center justify-center text-slate-900 dark:text-white shadow-lg shadow-emerald-950/20">
            <ScanFace className="w-6 h-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              BioAuth Enterprise
            </span>
            <p className="text-[11px] text-emerald-600 dark:text-emerald-400 font-mono tracking-wider flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              AI Biometric System
            </p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden lg:flex items-center space-x-7 text-sm font-semibold text-slate-600 dark:text-slate-300">
          <button onClick={() => scrollToSection('features')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Features
          </button>
          <button onClick={() => scrollToSection('workflow')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            How It Works
          </button>
          <button onClick={() => scrollToSection('simulator')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors flex items-center gap-1">
            <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400 animate-pulse" />
            Live Simulator
          </button>
          <button onClick={() => scrollToSection('roles')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            User Roles
          </button>
          <button onClick={() => scrollToSection('security')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            Security &amp; Privacy
          </button>
          <button onClick={() => scrollToSection('faq')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">
            FAQ
          </button>
        </nav>

        {/* Right Action Controls */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => {
              toggleTheme();
              toast.info(`Switched to ${theme === 'dark' ? 'Light' : 'Dark'} Mode`, { duration: 1000 });
            }}
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors flex items-center gap-2 text-sm font-semibold shadow-xs"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="hidden sm:inline text-xs">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-emerald-600" />
                <span className="hidden sm:inline text-xs">Dark Mode</span>
              </>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-slate-700 dark:text-slate-200 hidden sm:inline">
                {user?.name}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="bg-emerald-600 hover:bg-emerald-500 border-0 text-white text-sm font-bold shadow-md shadow-emerald-950/40"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5 text-white" />
                Go to My Dashboard
              </Button>
              <button
                onClick={() => {
                  logout();
                  toast.info('Logged out successfully');
                }}
                className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 text-sm font-semibold"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login?mode=signup')}
                className="bg-emerald-600 hover:bg-emerald-500 border-0 text-white text-sm font-bold shadow-md shadow-emerald-950/40"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5 text-white" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Biometric Campus Background Image PRESERVED 100% */}
      <section className="relative z-10 min-h-screen flex items-center overflow-hidden">
        {/* Campus Background Image with Biometric Terminal & Student Face HUD - PRESERVED */}
        <BiometricCampusBackground />

        {/* Left Content Area */}
        <div className="relative z-20 max-w-3xl px-4 sm:px-8 lg:px-16 py-20 text-center lg:text-left space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-emerald-500/40 text-xs sm:text-sm font-semibold shadow-md shadow-emerald-950/20 transition-colors duration-200">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span className="text-emerald-700 dark:text-emerald-300 font-mono">Live Terminal Nodes Active</span>
            <span className="text-slate-400 dark:text-slate-500">•</span>
            <span className="text-slate-700 dark:text-slate-300 font-sans">99.8% Liveness Precision</span>
          </div>

          <div className="space-y-4">
            <h1 className="text-3xl sm:text-5xl lg:text-6xl font-extrabold text-slate-900 dark:text-white tracking-tight leading-tight transition-colors duration-200">
              Biometric Facial Recognition <br />
              <span className="text-emerald-600 dark:text-emerald-400">Attendance &amp; Operations</span>
            </h1>
            <p className="text-base sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl leading-relaxed transition-colors duration-200">
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
                className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 border-0 text-white shadow-lg shadow-emerald-950/50 rounded-2xl"
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
                  className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-emerald-600 hover:bg-emerald-500 border-0 text-white shadow-lg shadow-emerald-950/50 rounded-2xl"
                >
                  <ScanFace className="w-5 h-5 mr-2 text-white" />
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2 text-white" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login?mode=signup')}
                  className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold border-slate-300 dark:border-slate-700 bg-white/90 dark:bg-slate-900/90 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-2xl shadow-md transition-colors duration-200"
                >
                  <UserPlus className="w-5 h-5 mr-2 text-emerald-600 dark:text-emerald-400" />
                  Sign Up for Access
                </Button>
              </>
            )}
          </div>

          {/* Key Metrics Row with elevated visual status */}
          <div className="pt-4 grid grid-cols-1 sm:grid-cols-3 gap-4 max-w-xl">
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">99.7%</span>
                <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  +0.4%
                </span>
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Recognition Accuracy</div>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">&lt; 0.24s</span>
                <Zap className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Average Response</div>
            </div>
            <div className="bg-white/90 dark:bg-slate-900/90 backdrop-blur-md rounded-2xl p-4 border border-slate-200 dark:border-slate-800 shadow-sm transition-colors duration-200">
              <div className="flex items-center justify-between">
                <span className="text-2xl font-bold text-slate-900 dark:text-white">24/7</span>
                <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">System Uptime (99.98%)</div>
            </div>
          </div>
        </div>
      </section>

      {/* Live Campus Telemetry Marquee Ticker */}
      <div className="relative z-10 border-y border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-slate-950/90 py-3 overflow-hidden transition-colors duration-200">
        <div className="flex items-center space-x-8 text-xs font-mono text-slate-600 dark:text-slate-400 whitespace-nowrap px-4 animate-none overflow-x-auto scrollbar-none justify-start sm:justify-center">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
            <span className="text-slate-900 dark:text-slate-200 font-semibold">Active Nodes:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">24 Campus Terminals Online</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
            <span className="text-slate-900 dark:text-slate-200 font-semibold">Tensor Inference:</span>
            <span className="text-teal-600 dark:text-teal-400 font-bold">0.18s / Frame</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span className="text-slate-900 dark:text-slate-200 font-semibold">3D Anti-Spoofing:</span>
            <span className="text-emerald-600 dark:text-emerald-400 font-bold">Active (Zero Spoofs)</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <Database className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400" />
            <span className="text-slate-900 dark:text-slate-200 font-semibold">Vector Encryption:</span>
            <span className="text-amber-600 dark:text-amber-400 font-bold">AES-256 GCM</span>
          </div>
          <span className="text-slate-300 dark:text-slate-700">|</span>
          <div className="flex items-center gap-2">
            <Radio className="w-3.5 h-3.5 text-cyan-600 dark:text-cyan-400" />
            <span className="text-slate-900 dark:text-slate-200 font-semibold">Telemetry Sync:</span>
            <span className="text-cyan-600 dark:text-cyan-400 font-bold">100% Real-Time</span>
          </div>
        </div>
      </div>

      {/* Interactive Biometric Terminal Simulator */}
      <section id="simulator" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="text-center space-y-3 mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Interactive Biometric Sandbox
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-200">
            Experience the Terminal Engine
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto transition-colors duration-200">
            Test and inspect how the BioAuth edge engine executes real-time liveness, 512-d feature extraction, and attendance ledger logging.
          </p>
        </div>

        <div className="max-w-4xl mx-auto rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl p-6 sm:p-8 backdrop-blur-xl transition-colors duration-200">
          {/* Simulator Mode Tabs */}
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-800 pb-5">
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveSimTab('scan')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeSimTab === 'scan'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                }`}
              >
                <ScanFace className="w-4 h-4" />
                1. 3D Face Scan
              </button>
              <button
                onClick={() => setActiveSimTab('liveness')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeSimTab === 'liveness'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                }`}
              >
                <ShieldCheck className="w-4 h-4" />
                2. Anti-Spoof Liveness
              </button>
              <button
                onClick={() => setActiveSimTab('ledger')}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 ${
                  activeSimTab === 'ledger'
                    ? 'bg-emerald-600 text-white shadow-md shadow-emerald-950/40'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-750'
                }`}
              >
                <CheckCircle2 className="w-4 h-4" />
                3. Ledger Sync
              </button>
            </div>

            <Button
              variant="outline"
              size="sm"
              onClick={runSimulation}
              disabled={isSimulating}
              className="border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 text-xs font-mono font-bold"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'Processing Frame...' : 'Run Live Sim'}
            </Button>
          </div>

          {/* Simulator Content Display */}
          <div className="mt-6">
            {activeSimTab === 'scan' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="relative rounded-2xl bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 flex flex-col items-center justify-center min-h-[240px] text-center overflow-hidden transition-colors duration-200">
                  <div className="relative w-36 h-36 rounded-2xl border-2 border-emerald-500/60 flex items-center justify-center shadow-[0_0_25px_rgba(16,185,129,0.2)]">
                    <ScanFace className="w-20 h-20 text-emerald-600 dark:text-emerald-400" />
                    <div className="absolute top-2 left-2 w-3 h-3 border-t-2 border-l-2 border-emerald-500" />
                    <div className="absolute top-2 right-2 w-3 h-3 border-t-2 border-r-2 border-emerald-500" />
                    <div className="absolute bottom-2 left-2 w-3 h-3 border-b-2 border-l-2 border-emerald-500" />
                    <div className="absolute bottom-2 right-2 w-3 h-3 border-b-2 border-r-2 border-emerald-500" />
                    <div className="absolute inset-x-0 h-0.5 bg-emerald-500 dark:bg-emerald-400 shadow-[0_0_10px_#10b981] animate-scan-beam" />
                  </div>
                  <div className="mt-4 text-xs font-mono text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
                    LANDMARK ALIGNMENT: 68 POINTS LOCKED
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">512-Dimensional Tensor Extraction</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      Facial geometries are mapped onto a normalized hypersphere. The resulting mathematical vector is compared against verified biometric registries in milliseconds.
                    </p>
                  </div>

                  <div className="space-y-2 text-xs font-mono">
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Confidence Match Score:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">99.85% (Optimal)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Embedding Format:</span>
                      <span className="text-slate-800 dark:text-slate-200 font-semibold">512 x Float32 (Encrypted)</span>
                    </div>
                    <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex justify-between">
                      <span className="text-slate-500 dark:text-slate-400">Processing Time:</span>
                      <span className="text-teal-700 dark:text-teal-400 font-bold">182ms (Edge CPU / NPU)</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSimTab === 'liveness' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 p-6 space-y-3 font-mono text-xs transition-colors duration-200">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
                    <span className="text-slate-800 dark:text-slate-300 font-bold">ISO 30107-3 Liveness Test</span>
                    <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30 font-bold">
                      DEFENSE ACTIVE
                    </span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Screen Photo Presentation:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">REJECTED (0.01%)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Video Replay Deepfake:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">REJECTED (0.02%)</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Infrared Depth Disparity:</span>
                    <span className="text-teal-700 dark:text-teal-400 font-bold">HUMAN DEPTH CONFIRMED</span>
                  </div>
                  <div className="p-2.5 rounded-lg bg-slate-100 dark:bg-slate-900 flex items-center justify-between">
                    <span className="text-slate-700 dark:text-slate-300">Micro-Blink Kinematics:</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">PASSED (Natural)</span>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">3D Anti-Spoofing &amp; Presentation Attack Defense</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      BioAuth algorithms analyze reflectance gradients, pulse-wave micromovements, and depth cues to guarantee that only live, physically present individuals can authenticate.
                    </p>
                  </div>
                  <div className="p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center gap-3">
                    <ShieldCheck className="w-8 h-8 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <div className="text-xs text-slate-700 dark:text-slate-200">
                      <div className="font-bold text-emerald-800 dark:text-emerald-300">Zero Proxy Attendance Guarantee</div>
                      Students cannot check in for peers using printed photographs, tablet screens, or video recordings.
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSimTab === 'ledger' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                <div className="rounded-2xl bg-slate-50 dark:bg-slate-950 border border-emerald-500/40 p-6 space-y-3 font-mono text-xs shadow-md transition-colors duration-200">
                  <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 pb-2">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-bold text-slate-900 dark:text-white">ATTENDANCE TICKET #8492</span>
                    </div>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">LOGGED</span>
                  </div>
                  <div className="space-y-1.5 text-slate-700 dark:text-slate-300">
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Student ID:</span>
                      <span className="text-slate-900 dark:text-white font-semibold">STU-2026-4821</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Department:</span>
                      <span className="text-slate-900 dark:text-white">Mechanical Engineering</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Terminal Node:</span>
                      <span className="text-teal-700 dark:text-teal-400 font-semibold">CAM-04 (Terminal A Concourse)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Verification Time:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">08:30:14 AM (On Time)</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 dark:text-slate-500">Geofence Check:</span>
                      <span className="text-emerald-700 dark:text-emerald-400 font-bold">Valid (Campus Perimeter)</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1">
                    <h3 className="text-xl font-bold text-slate-900 dark:text-white">Instant Ledger Synchronization</h3>
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      As soon as identity is confirmed, attendance is committed to the central database, student records update instantly, and course rosters reflect accurate attendance percentages in real time.
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-mono">
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>WebSockets Emitted</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Audit Hash Signed</span>
                    </div>
                    <span>•</span>
                    <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400">
                      <Check className="w-3.5 h-3.5" />
                      <span>Roster Updated</span>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* Overview & Key System Features PRESERVED with Semantic Accents */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="text-center space-y-3 mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            System Overview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-200">
            Comprehensive Biometric Capabilities
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto transition-colors duration-200">
            Everything you need for seamless, automated attendance monitoring across your institution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat, idx) => (
            <div
              key={idx}
              className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 shadow-sm hover:shadow-md transition-all duration-300 space-y-4 hover:-translate-y-1.5 group"
            >
              <div className="flex items-center justify-between">
                <div className={`p-3.5 w-fit rounded-2xl ${feat.accentBg} border transition-transform group-hover:scale-105`}>
                  {feat.icon}
                </div>
                <span className={`text-[11px] font-mono font-semibold px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 border border-slate-200 dark:border-slate-700/80 ${feat.badgeColor}`}>
                  {feat.badge}
                </span>
              </div>
              <div className="space-y-1.5">
                <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                  {feat.title}
                </h3>
                <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
                  {feat.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works (Workflow Steps) PRESERVED with Interconnected Timeline */}
      <section id="workflow" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="text-center space-y-3 mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-200">
            How BioAuth Works
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto transition-colors duration-200">
            From enrollment to attendance verification in seconds.
          </p>
        </div>

        {/* Timeline Container with desktop connecting line */}
        <div className="relative">
          {/* Interconnected glowing timeline track on desktop */}
          <div className="hidden md:block absolute top-6 left-[16%] right-[16%] h-[2px] bg-slate-200 dark:bg-slate-800 z-0">
            <div className="h-full w-full bg-gradient-to-r from-emerald-500/20 via-emerald-400/60 to-emerald-500/20" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative z-10">
            {workflowSteps.map((item, idx) => (
              <div
                key={idx}
                className="group p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 backdrop-blur-xl border border-slate-200 dark:border-slate-800/90 hover:border-emerald-500/50 shadow-sm hover:shadow-md hover:-translate-y-1.5 transition-all duration-300 relative space-y-4"
              >
                {/* Step Header with Number Pill and Badge */}
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-900 border-2 border-emerald-500/40 group-hover:border-emerald-400 group-hover:shadow-[0_0_15px_rgba(16,185,129,0.3)] flex items-center justify-center font-mono font-extrabold text-lg text-emerald-700 dark:text-emerald-400 transition-all duration-200">
                    {item.step}
                  </div>
                  <span className="text-[11px] font-mono px-2.5 py-1 rounded-full bg-slate-100 dark:bg-slate-800/90 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700/80 flex items-center gap-1.5 shadow-sm">
                    {item.icon}
                    <span>{item.badge}</span>
                  </span>
                </div>

                {/* Content */}
                <div className="space-y-1.5">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white group-hover:text-emerald-600 dark:group-hover:text-emerald-300 transition-colors">
                    {item.title}
                  </h3>
                  <p className="text-sm text-slate-600 dark:text-slate-300 leading-relaxed">
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

      {/* Institutional Role Ecosystem (RBAC Capabilities) */}
      <section id="roles" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="text-center space-y-3 mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            Tailored User Roles
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-200">
            Designed for Every Campus Stakeholder
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto transition-colors duration-200">
            From lecture halls to HR offices, each tier receives purpose-built tools and telemetry dashboards.
          </p>
        </div>

        {/* Role Selector Tabs */}
        <div className="flex flex-wrap items-center justify-center gap-3 mb-8">
          {(['students', 'lecturers', 'hr', 'security'] as const).map((roleKey) => {
            const role = roleCapabilities[roleKey];
            const isActive = activeRoleTab === roleKey;
            return (
              <button
                key={roleKey}
                onClick={() => setActiveRoleTab(roleKey)}
                className={`px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-semibold transition-all flex items-center gap-2 border ${
                  isActive
                    ? 'bg-emerald-600 text-white border-emerald-500 shadow-lg shadow-emerald-950/30'
                    : 'bg-white dark:bg-slate-900/90 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                {role.icon}
                <span>{role.title}</span>
              </button>
            );
          })}
        </div>

        {/* Active Role Content Card */}
        <div className="max-w-4xl mx-auto rounded-3xl bg-white/95 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 p-8 shadow-xl backdrop-blur-xl transition-colors duration-200">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-200 dark:border-slate-800 pb-6 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-700 dark:text-emerald-400 border border-emerald-500/30">
                  {roleCapabilities[activeRoleTab].badge}
                </span>
              </div>
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">
                {roleCapabilities[activeRoleTab].title}
              </h3>
              <p className="text-sm text-slate-600 dark:text-slate-300 mt-1 max-w-xl">
                {roleCapabilities[activeRoleTab].desc}
              </p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate(isAuthenticated ? '/dashboard' : '/login?mode=signin')}
              className="border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 text-slate-800 dark:text-white text-xs font-bold whitespace-nowrap self-start md:self-center"
            >
              Access Role Portal
              <ArrowRight className="w-3.5 h-3.5 ml-1.5 text-emerald-600 dark:text-emerald-400" />
            </Button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {roleCapabilities[activeRoleTab].features.map((feat, i) => (
              <div key={i} className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-950/70 border border-slate-200 dark:border-slate-800/80 flex items-start gap-3 transition-colors duration-200">
                <div className="w-6 h-6 rounded-lg bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center flex-shrink-0 mt-0.5">
                  <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                </div>
                <span className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 font-medium leading-relaxed">
                  {feat}
                </span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Security & Compliance Section (Upgraded & Expanded) */}
      <section id="security" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="text-center space-y-3 mb-14">
          <span className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
            Enterprise Security &amp; Privacy Standard
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-200">
            Encrypted Biometric Protection
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed transition-colors duration-200">
            Biometric face embeddings are transformed into encrypted 512-dimensional vector hashes. No raw face photos are stored in recognition databases, ensuring maximum privacy compliance.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-emerald-500/40 transition-all space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-600 dark:text-emerald-400">
              <Lock className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Zero Raw Photo Storage</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Camera frames are computed into ephemeral tensors and purged from RAM. Only irreversible mathematical embeddings remain.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-teal-500/40 transition-all space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400">
              <Database className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">AES-256 Vector Encryption</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every embedding vector is encrypted both at rest and in transit via TLS 1.3 cryptographic tunnels.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-cyan-500/40 transition-all space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-cyan-500/10 border border-cyan-500/30 flex items-center justify-center text-cyan-600 dark:text-cyan-400">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">ISO 30107-3 Liveness</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Certified presentation attack detection algorithms reject 2D photos, 4K video loops, and realistic silicone masks.
            </p>
          </div>

          <div className="p-6 rounded-3xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 hover:border-amber-500/40 transition-all space-y-3 shadow-sm">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-600 dark:text-amber-400">
              <FileText className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-slate-900 dark:text-white text-base">Tamper-Evident Audit Trail</h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Every check-in, dispute approval, and manual correction is immutably logged with timestamp, user ID, and terminal IP.
            </p>
          </div>
        </div>
      </section>

      {/* Frequently Asked Questions (Accordion) */}
      <section id="faq" className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-20 border-t border-slate-200 dark:border-slate-800 transition-colors duration-200">
        <div className="text-center space-y-3 mb-12">
          <span className="inline-flex items-center gap-2 text-xs font-bold font-mono text-emerald-700 dark:text-emerald-400 uppercase tracking-widest px-3.5 py-1.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
            Institutional FAQ
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight transition-colors duration-200">
            Frequently Asked Questions
          </h2>
          <p className="text-base text-slate-600 dark:text-slate-300 max-w-xl mx-auto transition-colors duration-200">
            Clear answers about biometric privacy, spoof prevention, offline architecture, and dispute handling.
          </p>
        </div>

        <div className="space-y-4">
          {faqList.map((item, idx) => {
            const isOpen = openFaq === idx;
            return (
              <div
                key={idx}
                className="rounded-2xl bg-white/90 dark:bg-slate-900/80 border border-slate-200 dark:border-slate-800 overflow-hidden shadow-sm transition-all duration-200"
              >
                <button
                  onClick={() => toggleFaq(idx)}
                  className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 hover:bg-slate-50 dark:hover:bg-slate-800/50 transition-colors"
                >
                  <span className="font-bold text-slate-900 dark:text-white text-sm sm:text-base">
                    {item.q}
                  </span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-slate-400 flex-shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-6 pb-5 pt-1 text-xs sm:text-sm text-slate-600 dark:text-slate-300 leading-relaxed border-t border-slate-200 dark:border-slate-800/60 bg-slate-50 dark:bg-slate-950/40">
                    {item.a}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Clean & Elevated Institutional Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-800 bg-slate-100 dark:bg-[#0f172a] py-12 px-4 sm:px-8 text-sm text-slate-600 dark:text-slate-400 transition-colors duration-200">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-10">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center space-x-2 text-slate-900 dark:text-white">
              <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 border border-emerald-500/40 flex items-center justify-center">
                <ScanFace className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              </div>
              <span className="font-extrabold text-base text-slate-900 dark:text-white">BioAuth Enterprise</span>
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-400 max-w-sm leading-relaxed">
              Enterprise touchless biometric attendance and perimeter telemetry infrastructure for African and global institutions. Zero raw images, sub-second edge AI, and verified anti-spoofing.
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-800 dark:text-emerald-300 text-[11px] font-mono">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse" />
              All 24 Biometric Terminals Operational
            </div>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">Platform Navigation</div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400">
              <li><button onClick={() => scrollToSection('features')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">System Overview</button></li>
              <li><button onClick={() => scrollToSection('workflow')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">3-Step Enrollment</button></li>
              <li><button onClick={() => scrollToSection('simulator')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Interactive Sandbox</button></li>
              <li><button onClick={() => scrollToSection('roles')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Stakeholder Roles</button></li>
              <li><button onClick={() => scrollToSection('security')} className="hover:text-emerald-600 dark:hover:text-emerald-400 transition-colors">Security Architecture</button></li>
            </ul>
          </div>

          <div className="space-y-2">
            <div className="font-bold text-slate-900 dark:text-white text-xs uppercase tracking-wider font-mono">Compliance &amp; Trust</div>
            <ul className="space-y-1.5 text-xs text-slate-600 dark:text-slate-400 font-mono">
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>ISO/IEC 30107-3 Liveness</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>AES-256 Bit Encryption</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>Zero Raw Image Storage</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>GDPR &amp; Institutional Privacy</span>
              </li>
            </ul>
          </div>
        </div>

        <div className="max-w-7xl mx-auto pt-6 border-t border-slate-200 dark:border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs">
          <p>© 2026 BioAuth Enterprise Inc. All rights reserved.</p>
          <div className="flex items-center space-x-6 text-slate-600 dark:text-slate-400">
            <button onClick={() => scrollToSection('security')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Privacy Statement</button>
            <button onClick={() => scrollToSection('security')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Security Policy</button>
            <button onClick={() => scrollToSection('faq')} className="hover:text-slate-900 dark:hover:text-white transition-colors">Support FAQ</button>
          </div>
        </div>
      </footer>
    </div>
  );
};
