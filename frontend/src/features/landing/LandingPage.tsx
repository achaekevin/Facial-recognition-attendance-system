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
      description: 'Instant facial recognition authentication allowing touchless check-ins for students and staff.',
      borderColor: 'border-cyan-500/30 hover:border-cyan-500/60'
    },
    {
      icon: <ShieldCheck className="w-6 h-6 text-emerald-500 dark:text-emerald-400" />,
      title: '3D Anti-Spoofing Liveness',
      description: 'Advanced anti-spoofing filters that reject photo, video, and mask presentation attacks.',
      borderColor: 'border-emerald-500/30 hover:border-emerald-500/60'
    },
    {
      icon: <Camera className="w-6 h-6 text-blue-500 dark:text-blue-400" />,
      title: 'Real-Time Camera Telemetry',
      description: 'Seamless integration with campus IP camera nodes for continuous perimeter attendance feeds.',
      borderColor: 'border-blue-500/30 hover:border-blue-500/60'
    },
    {
      icon: <BarChart3 className="w-6 h-6 text-amber-500 dark:text-amber-400" />,
      title: 'Automated Rosters & Reports',
      description: 'Calculates shift hours, late arrivals, and overtime with instant CSV and PDF compliance exports.',
      borderColor: 'border-amber-500/30 hover:border-amber-500/60'
    },
    {
      icon: <Lock className="w-6 h-6 text-rose-500 dark:text-rose-400" />,
      title: 'Role-Based Access Control',
      description: 'Tailored permissions for Students, Lecturers, HR Administrators, Security, and Super Admins.',
      borderColor: 'border-rose-500/30 hover:border-rose-500/60'
    },
    {
      icon: <QrCode className="w-6 h-6 text-purple-500 dark:text-purple-400" />,
      title: 'Offline & QR Pass Backup',
      description: 'Local offline telemetry synchronization and QR pass verification ensuring uninterrupted uptime.',
      borderColor: 'border-purple-500/30 hover:border-purple-500/60'
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
      {/* Ambient Background Blur */}
      <div className="absolute top-0 left-0 w-full h-[700px] bg-[radial-gradient(ellipse_80%_80%_at_50%_-15%,rgba(14,165,233,0.08),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-15%,rgba(14,165,233,0.12),rgba(0,0,0,0))]" />
      <div className="absolute top-1/3 -left-40 w-96 h-96 bg-cyan-500/5 dark:bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-2/3 -right-40 w-96 h-96 bg-cyan-400/5 dark:bg-cyan-400/10 rounded-full blur-3xl pointer-events-none" />

      {/* Top Header Navigation */}
      <header className="sticky top-0 z-50 bg-white/80 dark:bg-slate-950/90 backdrop-blur-xl border-b border-slate-200 dark:border-slate-800 px-4 sm:px-8 py-4 flex items-center justify-between transition-colors">
        <div className="flex items-center space-x-3 cursor-pointer" onClick={() => navigate('/')}>
          <div className="w-10 h-10 rounded-2xl bg-cyan-500 dark:bg-cyan-600 flex items-center justify-center text-white shadow-lg shadow-cyan-500/20">
            <ScanFace className="w-6 h-6" />
          </div>
          <div>
            <span className="font-extrabold text-lg text-slate-900 dark:text-white tracking-tight flex items-center gap-1.5">
              BioAuth <span className="text-slate-900 dark:text-white">Enterprise</span>
            </span>
            <p className="text-xs text-slate-900 dark:text-white font-mono tracking-wider">AI Biometric System</p>
          </div>
        </div>

        {/* Center Navigation Links */}
        <nav className="hidden md:flex items-center space-x-8 text-sm font-semibold text-slate-900 dark:text-white">
          <button onClick={() => scrollToSection('features')} className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            System Features
          </button>
          <button onClick={() => scrollToSection('workflow')} className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
            How It Works
          </button>
          <button onClick={() => scrollToSection('security')} className="hover:text-slate-700 dark:hover:text-slate-300 transition-colors">
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
            className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors flex items-center gap-2 text-sm font-semibold"
            title="Toggle Light / Dark Mode"
          >
            {theme === 'dark' ? (
              <>
                <Sun className="w-4 h-4" />
                <span className="hidden sm:inline">Light Mode</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4" />
                <span className="hidden sm:inline">Dark Mode</span>
              </>
            )}
          </button>

          {isAuthenticated ? (
            <div className="flex items-center space-x-3">
              <span className="text-sm font-semibold text-slate-900 dark:text-white hidden sm:inline">
                {user?.name}
              </span>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/dashboard')}
                className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white text-sm font-bold shadow-md shadow-cyan-500/20"
              >
                <LayoutDashboard className="w-4 h-4 mr-1.5" />
                Go to My Dashboard
              </Button>
              <button
                onClick={() => {
                  logout();
                  toast.info('Logged out successfully');
                }}
                className="p-2 rounded-xl text-slate-900 dark:text-white hover:text-slate-700 dark:hover:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
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
                className="border-slate-300 dark:border-slate-700 text-slate-900 dark:text-white hover:bg-slate-100 dark:hover:bg-slate-800 text-sm font-semibold"
              >
                Sign In
              </Button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login?mode=signup')}
                className="bg-cyan-600 hover:bg-cyan-700 dark:bg-cyan-600 dark:hover:bg-cyan-700 text-white text-sm font-bold shadow-md shadow-cyan-500/20"
              >
                <UserPlus className="w-3.5 h-3.5 mr-1.5" />
                Sign Up
              </Button>
            </div>
          )}
        </div>
      </header>

      {/* Hero Section with Video Background */}
      <section className="relative z-10 min-h-screen flex items-center justify-center overflow-hidden">
        
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
        {/* Video Background */}
        <div className="absolute inset-0 w-full h-full">
          {/* Video Background with Fallback */}
          <video
            className="w-full h-full object-cover"
            autoPlay
            loop
            muted
            playsInline
            poster="/api/placeholder/1920/1080"
            onError={(e) => {
              // Fallback to gradient if video fails
              e.currentTarget.style.display = 'none';
              const fallback = e.currentTarget.nextElementSibling;
              if (fallback) fallback.style.display = 'block';
            }}
          >
            <source src="/videos/african-students-facial-recognition.mp4" type="video/mp4" />
            <source src="/videos/african-students-facial-recognition.webm" type="video/webm" />
          </video>
          
          {/* Fallback Background (shown if video fails to load) */}
          <div 
            className="absolute inset-0 w-full h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-black dark:via-slate-900 dark:to-black"
            style={{ display: 'none' }}
          >
            {/* Animated background elements to simulate activity */}
            <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-cyan-500/10 rounded-full animate-pulse"></div>
            <div className="absolute bottom-1/3 right-1/4 w-24 h-24 bg-blue-500/10 rounded-full animate-ping"></div>
            <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-green-500/5 rounded-full animate-pulse" style={{ animationDelay: '1s' }}></div>
          </div>
          
          {/* Video Overlay for Text Readability */}
          <div className="absolute inset-0 bg-gradient-to-r from-slate-900/80 via-slate-900/60 to-slate-900/80 dark:from-black/90 dark:via-black/70 dark:to-black/90"></div>
          
          {/* Additional overlay for better text contrast */}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-slate-900/40"></div>
        </div>

        {/* Content Container */}
        <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 py-20 grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          
          {/* Left Content */}
          <div className="space-y-8 text-center lg:text-left">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/10 dark:bg-white/5 backdrop-blur-md border border-white/20 dark:border-white/10 text-white text-sm font-semibold shadow-lg">
              <Sparkles className="w-4 h-4 text-cyan-300" />
              <span>Next-Generation Touchless Attendance Authentication</span>
            </div>

            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold text-white tracking-tight leading-tight font-['Inter'] drop-shadow-2xl">
                Biometric Facial Recognition <br />
                <span className="text-cyan-300 drop-shadow-lg">
                  Attendance & Operations
                </span>
              </h1>
              <p className="text-lg sm:text-xl text-white/90 max-w-2xl mx-auto lg:mx-0 leading-relaxed drop-shadow-lg">
                Enterprise touchless attendance platform for institutions, universities, and corporations. Powered by 512-d facial embeddings, 3D anti-spoofing liveness checks, and real-time camera telemetries.
              </p>
            </div>

            {/* Action Buttons */}
            {isAuthenticated ? (
              <div className="pt-4 flex justify-center lg:justify-start">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/dashboard')}
                  className="px-8 py-3.5 text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-2xl shadow-cyan-500/30 rounded-2xl backdrop-blur-sm border border-cyan-400/30"
                >
                  <LayoutDashboard className="w-5 h-5 mr-2" />
                  Go to My Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </div>
            ) : (
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
                <Button
                  variant="primary"
                  size="lg"
                  onClick={() => navigate('/login?mode=signin')}
                  className="w-full sm:w-auto px-8 py-3.5 text-sm font-bold bg-cyan-600 hover:bg-cyan-500 text-white shadow-2xl shadow-cyan-500/30 rounded-2xl backdrop-blur-sm border border-cyan-400/30"
                >
                  <ScanFace className="w-5 h-5 mr-2" />
                  Sign In to Dashboard
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  onClick={() => navigate('/login?mode=signup')}
                  className="w-full sm:w-auto px-8 py-3.5 text-base font-bold border-white/30 text-white hover:bg-white/10 hover:border-white/50 rounded-2xl backdrop-blur-sm shadow-xl"
                >
                  <UserPlus className="w-5 h-5 mr-2" />
                  Sign Up for Access
                </Button>
              </div>
            )}

            {/* Key Features Overlay */}
            <div className="pt-8 grid grid-cols-2 sm:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
                <div className="text-2xl font-bold text-cyan-300">99.7%</div>
                <div className="text-xs text-white/80">Recognition Accuracy</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
                <div className="text-2xl font-bold text-green-300">&lt;2s</div>
                <div className="text-xs text-white/80">Average Response</div>
              </div>
              <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 border border-white/20 shadow-xl">
                <div className="text-2xl font-bold text-blue-300">24/7</div>
                <div className="text-xs text-white/80">System Uptime</div>
              </div>
            </div>
          </div>

          {/* Right Side - Floating Info Cards */}
          <div className="relative flex justify-center lg:justify-end">
            <div className="space-y-6">
              
              {/* University Info Card */}
              <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl animate-float">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-full flex items-center justify-center">
                    <ScanFace className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-semibold">University of Lagos</h3>
                    <p className="text-white/70 text-sm">Computer Science Dept.</p>
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Students Enrolled:</span>
                    <span className="text-white font-semibold">2,847</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-white/80">Present Today:</span>
                    <span className="text-green-300 font-semibold">94.2%</span>
                  </div>
                  <div className="w-full bg-white/20 rounded-full h-2 mt-3">
                    <div className="bg-gradient-to-r from-green-400 to-cyan-400 h-2 rounded-full" style={{ width: '94.2%' }}></div>
                  </div>
                </div>
              </div>

              {/* Live Recognition Status */}
              <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl animate-float" style={{ animationDelay: '1s' }}>
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></div>
                  <span className="text-white font-semibold text-sm">Live Recognition Status</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Adaora Okafor</p>
                      <p className="text-white/60 text-xs">Verified - 08:45 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle2 className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Kwame Asante</p>
                      <p className="text-white/60 text-xs">Verified - 08:47 AM</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center animate-pulse">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                    <div>
                      <p className="text-white text-sm font-medium">Processing...</p>
                      <p className="text-white/60 text-xs">Face detection in progress</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Security Status */}
              <div className="bg-white/15 backdrop-blur-xl rounded-3xl p-6 border border-white/20 shadow-2xl animate-float" style={{ animationDelay: '2s' }}>
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="w-5 h-5 text-cyan-300" />
                  <span className="text-white font-semibold text-sm">Security Status</span>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <div className="text-lg font-bold text-green-300">0</div>
                    <div className="text-xs text-white/60">Failed Attempts</div>
                  </div>
                  <div className="text-center">
                    <div className="text-lg font-bold text-cyan-300">A+</div>
                    <div className="text-xs text-white/60">Security Grade</div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Scroll Indicator */}
        <div className="absolute bottom-8 left-1/2 transform -translate-x-1/2 z-20">
          <div className="animate-bounce">
            <button 
              onClick={() => scrollToSection('features')}
              className="w-6 h-10 border-2 border-white/30 rounded-full flex justify-center"
            >
              <div className="w-1 h-3 bg-white/60 rounded-full mt-2 animate-pulse"></div>
            </button>
          </div>
        </div>
      </section>

      {/* Overview & Key System Features */}
      <section id="features" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center space-y-3 mb-12">
          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            System Overview
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            Comprehensive Biometric Capabilities
          </h2>
          <p className="text-base text-slate-900 dark:text-white max-w-xl mx-auto">
            Everything you need for seamless, automated attendance monitoring across your institution.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {coreFeatures.map((feat, idx) => (
            <div
              key={idx}
              className={`p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 ${feat.borderColor} shadow-sm dark:shadow-none transition-all duration-200 space-y-3`}
            >
              <div className="p-3 w-fit rounded-2xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
                {feat.icon}
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{feat.title}</h3>
              <p className="text-sm text-slate-900 dark:text-white leading-relaxed">{feat.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* How It Works (Workflow Steps) */}
      <section id="workflow" className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 border-t border-slate-200 dark:border-slate-800/80">
        <div className="text-center space-y-3 mb-12">
          <span className="text-sm font-bold font-mono text-slate-900 dark:text-white uppercase tracking-widest px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 border border-slate-300 dark:border-slate-700">
            Simple 3-Step Process
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold text-slate-900 dark:text-white">
            How BioAuth Works
          </h2>
          <p className="text-base text-slate-900 dark:text-white max-w-xl mx-auto">
            From enrollment to attendance verification in seconds.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {workflowSteps.map((item, idx) => (
            <div key={idx} className="p-6 rounded-3xl bg-white dark:bg-slate-900 border-2 border-cyan-500/30 hover:border-cyan-500/60 shadow-sm dark:shadow-none relative space-y-3 transition-all duration-200">
              <span className="text-3xl font-extrabold font-mono text-slate-400 dark:text-slate-600">
                {item.step}
              </span>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">{item.title}</h3>
              <p className="text-sm text-slate-900 dark:text-white leading-relaxed">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Security & Compliance Banner */}
      <section id="security" className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 py-12 my-8 rounded-3xl bg-white dark:bg-slate-900 border-2 border-emerald-500/30 text-center space-y-4 shadow-sm">
        <div className="inline-flex items-center gap-2 text-slate-900 dark:text-white text-sm font-bold uppercase tracking-wider">
          <ShieldCheck className="w-4 h-4" />
          Enterprise Security & Privacy Standard
        </div>
        <h3 className="text-2xl font-bold text-slate-900 dark:text-white">Encrypted Biometric Protection</h3>
        <p className="text-base text-slate-900 dark:text-white max-w-2xl mx-auto leading-relaxed">
          Biometric face embeddings are transformed into encrypted 512-dimensional vector hashes. No raw face photos are stored in recognition databases, ensuring maximum privacy compliance.
        </p>
      </section>

      {/* Clean Footer */}
      <footer className="mt-auto border-t border-slate-200 dark:border-slate-900 bg-white dark:bg-black py-8 px-4 sm:px-8 text-center text-sm text-slate-900 dark:text-white transition-colors">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <ScanFace className="w-4 h-4" />
            <span className="font-bold text-slate-900 dark:text-white">BioAuth Enterprise</span>
            <span>- Biometric Attendance Platform</span>
          </div>
          <p>© 2026 BioAuth Inc. All rights reserved.</p>
        </div>
      </footer>
    </div>
  );
};
