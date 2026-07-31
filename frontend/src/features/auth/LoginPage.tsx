import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ScanFace, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  Sparkles,
  Camera,
  Shield,
  UserCheck,
  GraduationCap,
  User as UserIcon,
  CheckCircle2,
  Cpu,
  Fingerprint,
  Radio,
  Zap
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchRole } = useAuthStore();

  const [authMode, setAuthMode] = useState<'biometric' | 'credentials'>('biometric');
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee_student');
  const [email, setEmail] = useState('student@attendance.com');
  const [password, setPassword] = useState('password321');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Biometric Live Face Scan Simulation State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('Position face inside frame for liveness check...');

  const quickRoles: { 
    role: UserRole; 
    label: string; 
    icon: React.ReactNode; 
    defaultEmail: string; 
    defaultName: string;
    description: string;
    portalBadge: string;
  }[] = [
    { 
      role: 'employee_student', 
      label: 'Student / Employee', 
      icon: <UserIcon className="w-4 h-4" />,
      defaultEmail: 'student@attendance.com', 
      defaultName: 'Registered Student',
      description: 'Self Check-in History, Personal Profile & Leave Applications',
      portalBadge: 'Student / Employee Personal Portal'
    },
    { 
      role: 'lecturer_teacher', 
      label: 'Lecturer', 
      icon: <GraduationCap className="w-4 h-4" />,
      defaultEmail: 'lecturer@attendance.com', 
      defaultName: 'Senior Lecturer',
      description: 'Class Rosters, Department Check-ins & Reports',
      portalBadge: 'Faculty & Roster Portal'
    },
    { 
      role: 'hr_admin', 
      label: 'HR Admin', 
      icon: <UserCheck className="w-4 h-4" />,
      defaultEmail: 'hradmin@attendance.com', 
      defaultName: 'HR Manager',
      description: 'Attendance Roster, User Enrollment & Leave Approvals',
      portalBadge: 'HR Administration Portal'
    },
    { 
      role: 'security_officer', 
      label: 'Security', 
      icon: <Camera className="w-4 h-4" />,
      defaultEmail: 'security@attendance.com', 
      defaultName: 'Security Commander',
      description: 'Live Camera Feeds, Watchlist & Unknown Alerts',
      portalBadge: 'Security Operations Center'
    },
    { 
      role: 'super_admin', 
      label: 'Super Admin', 
      icon: <Shield className="w-4 h-4" />,
      defaultEmail: 'superadmin@attendance.com', 
      defaultName: 'System Administrator',
      description: 'Full Enterprise Control, Camera Nodes & Telemetry',
      portalBadge: 'Super Admin Control Center'
    },
  ];

  const currentRoleInfo = quickRoles.find((r) => r.role === selectedRole) || quickRoles[0];

  const handleRoleSelect = (r: typeof quickRoles[0]) => {
    setSelectedRole(r.role);
    setEmail(r.defaultEmail);
    setPassword('password321');
  };

  const handleSimulateFaceScan = () => {
    if (isScanning || isLoading) return;
    setIsScanning(true);
    setScanProgress(0);
    setScanStatusText('Initializing ArcFace 512-d Biometric Liveness Scanner...');

    const interval = setInterval(() => {
      setScanProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        if (prev === 25) setScanStatusText('Extracting 68-point facial mesh embeddings...');
        if (prev === 65) setScanStatusText('Matching identity vector against enterprise roster...');
        if (prev === 85) setScanStatusText('3D Liveness Verified: 99.8% Match Score!');
        return prev + 5;
      });
    }, 60);

    setTimeout(() => {
      executeLoginSession();
    }, 1600);
  };

  const handleSubmitCredentials = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter email address and password.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      executeLoginSession();
    }, 600);
  };

  const executeLoginSession = () => {
    const activeRoleConfig = currentRoleInfo;

    const userSession: User = {
      id: `usr-${Date.now()}`,
      name: activeRoleConfig.defaultName,
      email: email || activeRoleConfig.defaultEmail,
      phone: '+1 (555) 892-3011',
      role: selectedRole,
      category: selectedRole === 'employee_student' ? 'student' : 'employee',
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
    switchRole(selectedRole);
    toast.success(`Welcome back, ${userSession.name}!`);
    navigate('/landing');
    setIsLoading(false);
    setIsScanning(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 sm:p-6 md:p-8 relative overflow-hidden font-sans select-none">
      {/* Ambient Cyber Grid & Glow Backdrop */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(120,119,198,0.15),rgba(255,255,255,0))]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none animate-pulse" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Container Split Grid */}
      <div className="w-full max-w-6xl grid grid-cols-1 lg:grid-cols-12 gap-8 z-10 items-center">
        
        {/* Left Side: Enterprise Feature & System Showcase (Hidden on small mobile) */}
        <div className="lg:col-span-6 space-y-6 hidden lg:block">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 text-xs font-semibold">
            <Radio className="w-3.5 h-3.5 animate-pulse text-cyan-400" />
            <span>AI Perimeter Telemetry System Active</span>
          </div>

          <div className="space-y-3">
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-tight">
              Next-Gen Facial <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-cyan-400 to-indigo-400">
                Biometric Recognition
              </span>
            </h1>
            <p className="text-sm text-slate-300 max-w-lg leading-relaxed">
              Enterprise touchless attendance authentication powered by ArcFace 512-dimensional feature vector extraction and anti-spoofing liveness verification.
            </p>
          </div>

          {/* Feature Chips */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-primary/10 text-primary border border-primary/20">
                <Cpu className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">512-d Embedding</p>
                <p className="text-[11px] text-slate-400">ArcFace Deep Mesh</p>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-900/60 border border-slate-800/80 backdrop-blur-md flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-white">3D Anti-Spoofing</p>
                <p className="text-[11px] text-slate-400">99.8% Liveness Accuracy</p>
              </div>
            </div>
          </div>

          {/* Active Selected Role Preview Info Card */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-slate-900/90 to-indigo-950/40 border border-indigo-500/20 backdrop-blur-xl space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" /> Active Role Target
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                {currentRoleInfo.label}
              </span>
            </div>
            <p className="text-sm font-semibold text-white">{currentRoleInfo.portalBadge}</p>
            <p className="text-xs text-slate-400">{currentRoleInfo.description}</p>
          </div>
        </div>

        {/* Right Side: Interactive Authentication Portal Card */}
        <div className="lg:col-span-6 w-full max-w-md mx-auto">
          <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden ring-1 ring-white/10">
            
            {/* Top Brand Logo */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-primary via-indigo-600 to-cyan-400 text-white shadow-xl shadow-primary/30 mb-3 ring-4 ring-primary/20">
                <ScanFace className="w-8 h-8 animate-pulse" />
              </div>
              <h2 className="text-2xl font-extrabold tracking-tight text-white">
                BioAuth <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary to-cyan-400">Enterprise</span>
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Select your system access role and choose authentication method.
              </p>
            </div>

            {/* Role Quick Selector Badges */}
            <div className="mb-5">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Select Access Role</span>
                <span className="text-primary font-mono text-[10px]">5 Roles Available</span>
              </p>
              <div className="grid grid-cols-5 gap-1.5 bg-slate-950/70 p-1.5 rounded-2xl border border-slate-800/80">
                {quickRoles.map((r) => {
                  const isSelected = selectedRole === r.role;
                  return (
                    <button
                      key={r.role}
                      type="button"
                      onClick={() => handleRoleSelect(r)}
                      title={r.description}
                      className={`flex flex-col items-center justify-center py-2 px-1 rounded-xl transition-all ${
                        isSelected
                          ? 'bg-primary text-white shadow-lg shadow-primary/30 scale-[1.02]'
                          : 'text-slate-400 hover:text-white hover:bg-slate-800/60'
                      }`}
                    >
                      {r.icon}
                      <span className="text-[9px] font-bold mt-1 truncate w-full text-center">
                        {r.label.split(' ')[0]}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Auth Mode Toggle Bar (Biometric Face Scan vs Credentials) */}
            <div className="flex bg-slate-950/90 p-1 rounded-xl border border-slate-800 mb-6">
              <button
                type="button"
                onClick={() => setAuthMode('biometric')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'biometric'
                    ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Fingerprint className="w-4 h-4 text-cyan-300" />
                Face Biometric Scan
              </button>
              <button
                type="button"
                onClick={() => setAuthMode('credentials')}
                className={`flex-1 py-2 text-xs font-bold rounded-lg flex items-center justify-center gap-1.5 transition-all ${
                  authMode === 'credentials'
                    ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                <Lock className="w-4 h-4 text-cyan-300" />
                Password Sign In
              </button>
            </div>

            {/* Mode 1: Biometric Face Scanner Feed Simulation */}
            {authMode === 'biometric' ? (
              <div className="space-y-5">
                <div className="relative aspect-video rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden flex flex-col items-center justify-center p-4 group">
                  {/* Camera Reticle Overlay */}
                  <div className="absolute inset-4 border border-dashed border-cyan-500/40 rounded-xl pointer-events-none flex items-center justify-center">
                    <div className="w-32 h-32 rounded-full border-2 border-cyan-400/60 flex items-center justify-center animate-pulse">
                      <ScanFace className="w-16 h-16 text-cyan-400 opacity-80" />
                    </div>
                  </div>

                  {/* Laser Scanning Line Animation */}
                  {isScanning && (
                    <div 
                      className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce"
                      style={{ top: `${scanProgress}%` }}
                    />
                  )}

                  {/* Floating Biometric Telemetry */}
                  <div className="absolute top-2 left-2 right-2 flex items-center justify-between text-[10px] font-mono text-cyan-300 bg-slate-900/80 px-2.5 py-1 rounded-lg border border-cyan-500/20 backdrop-blur-md">
                    <span>CAM-GATE #01</span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      READY
                    </span>
                  </div>

                  {/* Progress overlay if scanning */}
                  {isScanning && (
                    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm flex flex-col items-center justify-center p-4 text-center z-20">
                      <div className="w-12 h-12 rounded-full border-4 border-cyan-500/20 border-t-cyan-400 animate-spin mb-3" />
                      <p className="text-xs font-bold text-white mb-1">{scanProgress}% Vector Processing</p>
                      <p className="text-[11px] text-cyan-300 font-mono">{scanStatusText}</p>
                    </div>
                  )}
                </div>

                <div className="text-center">
                  <p className="text-xs font-semibold text-slate-300 mb-1">
                    Sign in as <span className="text-cyan-400 font-bold">{currentRoleInfo.defaultName}</span>
                  </p>
                  <p className="text-[11px] text-slate-500">
                    {currentRoleInfo.defaultEmail}
                  </p>
                </div>

                <Button
                  type="button"
                  variant="primary"
                  size="lg"
                  isLoading={isScanning || isLoading}
                  onClick={handleSimulateFaceScan}
                  className="w-full justify-center py-3.5 text-sm font-bold shadow-lg shadow-cyan-500/25 bg-gradient-to-r from-cyan-600 via-primary to-indigo-600 hover:from-cyan-500 hover:to-indigo-500"
                >
                  <ScanFace className="w-5 h-5 mr-2" />
                  Authenticate With Face Scan
                </Button>
              </div>
            ) : (
              /* Mode 2: Password Credentials Form */
              <form onSubmit={handleSubmitCredentials} className="space-y-4">
                {errorMessage && (
                  <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" />
                    <span>{errorMessage}</span>
                  </div>
                )}

                {/* Email Field */}
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                    User Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="enter email address..."
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                      required
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <div className="flex items-center justify-between mb-1.5">
                    <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                      Password
                    </label>
                    <button
                      type="button"
                      onClick={() => navigate('/forgot-password')}
                      className="text-xs text-primary hover:underline font-medium"
                    >
                      Forgot Password?
                    </button>
                  </div>
                  <div className="relative">
                    <Lock className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                    <input
                      type={showPassword ? 'text' : 'password'}
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="enter password..."
                      className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono"
                      required
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                    >
                      {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Remember Me */}
                <div className="flex items-center justify-between pt-1">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={rememberMe}
                      onChange={(e) => setRememberMe(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-primary focus:ring-primary focus:ring-offset-slate-900"
                    />
                    <span className="text-xs text-slate-400 font-medium">Remember credentials</span>
                  </label>
                </div>

                {/* Submit Button */}
                <Button
                  type="submit"
                  variant="primary"
                  size="lg"
                  isLoading={isLoading}
                  className="w-full justify-center py-3 text-sm font-bold shadow-lg shadow-primary/30"
                >
                  Sign In to System Portal
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </form>
            )}

            {/* Footer Security Badge */}
            <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              <span>256-Bit Encrypted Biometric & Token Security</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
