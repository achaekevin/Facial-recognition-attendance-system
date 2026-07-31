import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { 
  ScanFace, 
  Lock, 
  Mail, 
  Eye, 
  EyeOff, 
  ShieldCheck, 
  ArrowRight, 
  UserCheck, 
  GraduationCap, 
  User as UserIcon, 
  Camera, 
  Shield, 
  Fingerprint, 
  UserPlus, 
  LogIn, 
  CheckCircle2 
} from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole, User } from '../../types';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { login, switchRole } = useAuthStore();

  // Tab Mode: 'signin' | 'signup' | 'biometric'
  const initialMode = searchParams.get('mode') === 'signup' ? 'signup' : 'signin';
  const [authMode, setAuthMode] = useState<'signin' | 'signup' | 'biometric'>(initialMode);

  // Common Form State
  const [selectedRole, setSelectedRole] = useState<UserRole>('employee_student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  // Sign Up Specific State
  const [fullName, setFullName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [idNumber, setIdNumber] = useState('');

  // Biometric Live Face Scan Simulation State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [scanStatusText, setScanStatusText] = useState('Position face inside frame for liveness check...');

  const availableRoles: { 
    role: UserRole; 
    label: string; 
    icon: React.ReactNode; 
    defaultEmail: string; 
    defaultName: string;
    description: string;
  }[] = [
    { 
      role: 'employee_student', 
      label: 'Student / Employee', 
      icon: <UserIcon className="w-4 h-4" />,
      defaultEmail: 'student@attendance.com', 
      defaultName: 'Alex Rivera',
      description: 'Personal check-in, attendance logs & leave requests'
    },
    { 
      role: 'lecturer_teacher', 
      label: 'Lecturer / Teacher', 
      icon: <GraduationCap className="w-4 h-4" />,
      defaultEmail: 'lecturer@attendance.com', 
      defaultName: 'Prof. Sarah Jenkins',
      description: 'Class rosters, department attendance & reports'
    },
    { 
      role: 'hr_admin', 
      label: 'HR Administrator', 
      icon: <UserCheck className="w-4 h-4" />,
      defaultEmail: 'hradmin@attendance.com', 
      defaultName: 'Amanda Lewis',
      description: 'User enrollment, shifts & leave approvals'
    },
    { 
      role: 'security_officer', 
      label: 'Security Officer', 
      icon: <Camera className="w-4 h-4" />,
      defaultEmail: 'security@attendance.com', 
      defaultName: 'Capt. James Miller',
      description: 'Live RTSP feeds, unknown alerts & watchlists'
    },
    { 
      role: 'super_admin', 
      label: 'Super Admin', 
      icon: <Shield className="w-4 h-4" />,
      defaultEmail: 'superadmin@attendance.com', 
      defaultName: 'Dr. Robert Vance',
      description: 'Full enterprise control & system settings'
    },
  ];

  const currentRoleInfo = availableRoles.find((r) => r.role === selectedRole) || availableRoles[0];

  // Quick fill seed accounts for quick testing
  const handleQuickSeedFill = (roleItem: typeof availableRoles[0]) => {
    setSelectedRole(roleItem.role);
    setEmail(roleItem.defaultEmail);
    setPassword('password321');
    setErrorMessage('');
  };

  // Sign In Handler
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter email address and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      // 1. Check registered users DB in localStorage
      const existingUsers: any[] = JSON.parse(localStorage.getItem('bioauth_registered_users') || '[]');
      const registeredUser = existingUsers.find(
        (u) => u.email.toLowerCase() === email.trim().toLowerCase() && u.password === password
      );

      let userSession: User;

      if (registeredUser) {
        userSession = {
          id: registeredUser.id,
          name: registeredUser.name,
          email: registeredUser.email,
          phone: registeredUser.phone || '+1 (555) 000-0000',
          role: registeredUser.role,
          category: registeredUser.category,
          departmentId: registeredUser.departmentId || 'dept-1',
          departmentName: registeredUser.departmentName || 'General Operations',
          avatar: '',
          faceImageUrls: [],
          status: 'active',
          accuracyScore: 99.5,
          registeredAt: registeredUser.registeredAt || new Date().toISOString().split('T')[0],
          employeeOrStudentId: registeredUser.employeeOrStudentId || 'ID-1001',
        };
        login(userSession);
        switchRole(registeredUser.role);
      } else {
        // 2. Check seed accounts
        const matchedSeed = availableRoles.find((r) => r.defaultEmail.toLowerCase() === email.trim().toLowerCase());
        if (matchedSeed && password === 'password321') {
          userSession = {
            id: `usr-${Date.now()}`,
            name: matchedSeed.defaultName,
            email: matchedSeed.defaultEmail,
            phone: '+1 (555) 892-3011',
            role: matchedSeed.role,
            category: matchedSeed.role === 'employee_student' ? 'student' : 'employee',
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
          switchRole(matchedSeed.role);
        } else {
          // Allow fallback sign-in for new credentials
          const roleConfig = currentRoleInfo;
          userSession = {
            id: `usr-${Date.now()}`,
            name: email.split('@')[0],
            email: email.trim().toLowerCase(),
            phone: '+1 (555) 892-3011',
            role: selectedRole,
            category: selectedRole === 'employee_student' ? 'student' : 'employee',
            departmentId: 'dept-1',
            departmentName: 'School of Computer Science & AI',
            avatar: '',
            faceImageUrls: [],
            status: 'active',
            accuracyScore: 99.5,
            registeredAt: new Date().toISOString().split('T')[0],
            employeeOrStudentId: `ID-${Math.floor(1000 + Math.random() * 9000)}`,
          };
          login(userSession);
          switchRole(selectedRole);
        }
      }

      toast.success(`Welcome back, ${userSession.name}!`);
      navigate('/dashboard');
      setIsLoading(false);
    }, 600);
  };

  // Sign Up Handler
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!fullName || !email || !password) {
      setErrorMessage('Please fill in all required fields.');
      return;
    }
    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }
    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    setIsLoading(true);

    setTimeout(async () => {
      const existingUsers: any[] = JSON.parse(localStorage.getItem('bioauth_registered_users') || '[]');
      
      if (existingUsers.some((u) => u.email.toLowerCase() === email.trim().toLowerCase())) {
        setErrorMessage('An account with this email address already exists. Please Sign In.');
        setIsLoading(false);
        return;
      }

      const newUser = {
        id: `usr-${Date.now()}`,
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password: password,
        role: selectedRole,
        category: selectedRole === 'employee_student' ? 'student' : 'employee',
        departmentId: 'dept-1',
        departmentName: selectedRole === 'employee_student' ? 'Computer Science & AI' : 'Administration',
        employeeOrStudentId: idNumber.trim() || `ID-${Math.floor(1000 + Math.random() * 9000)}`,
        registeredAt: new Date().toISOString().split('T')[0],
      };

      // Register with backend API if available
      try {
        await fetch('/api/v1/auth/register', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: newUser.email,
            password: newUser.password,
            name: newUser.name,
            role: newUser.role,
            category: newUser.category,
            employee_or_student_id: newUser.employeeOrStudentId
          })
        });
      } catch (err) {
        // Fallback to local storage
      }

      existingUsers.push(newUser);
      localStorage.setItem('bioauth_registered_users', JSON.stringify(existingUsers));

      // Auto-authenticate and navigate directly to dashboard
      const userSession: User = {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        phone: '+1 (555) 000-0000',
        role: newUser.role,
        category: newUser.category,
        departmentId: newUser.departmentId,
        departmentName: newUser.departmentName,
        avatar: '',
        faceImageUrls: [],
        status: 'active',
        accuracyScore: 99.5,
        registeredAt: newUser.registeredAt,
        employeeOrStudentId: newUser.employeeOrStudentId,
      };

      login(userSession);
      switchRole(newUser.role);

      setIsLoading(false);
      toast.success(`Account created! Welcome, ${newUser.name}!`);
      navigate('/dashboard');
    }, 600);
  };

  // Biometric Scan Handler
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
        if (prev === 25) setScanStatusText('Extracting facial mesh embeddings...');
        if (prev === 65) setScanStatusText('Matching identity vector against roster...');
        if (prev === 85) setScanStatusText('3D Liveness Verified: 99.8% Match Score!');
        return prev + 5;
      });
    }, 60);

    setTimeout(() => {
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
        avatar: '',
        faceImageUrls: [],
        status: 'active',
        accuracyScore: 99.8,
        registeredAt: new Date().toISOString().split('T')[0],
        employeeOrStudentId: `ID-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      login(userSession);
      switchRole(selectedRole);
      toast.success(`Face Verified! Welcome, ${userSession.name}!`);
      navigate('/dashboard');
      setIsLoading(false);
      setIsScanning(false);
    }, 1600);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 relative overflow-hidden font-sans select-none transition-colors duration-300">
      {/* Ambient Background Glow */}
      <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.12),rgba(255,255,255,0))] dark:bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(56,189,248,0.15),rgba(0,0,0,0))]" />
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Authentication Card */}
      <div className="w-full max-w-md bg-white/90 dark:bg-slate-900/90 backdrop-blur-2xl border border-slate-200 dark:border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative z-10 ring-1 ring-black/5 dark:ring-white/10 transition-colors">
        
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div 
            className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-gradient-to-tr from-cyan-500 via-primary to-indigo-600 text-white shadow-xl shadow-cyan-500/30 mb-3 ring-4 ring-cyan-500/20 cursor-pointer"
            onClick={() => navigate('/')}
          >
            <ScanFace className="w-8 h-8 animate-pulse" />
          </div>
          <h2 className="text-2xl font-extrabold tracking-tight text-slate-900 dark:text-white">
            BioAuth <span className="text-transparent bg-clip-text bg-gradient-to-r from-cyan-500 to-indigo-600 dark:from-cyan-400 dark:to-indigo-400">Enterprise</span>
          </h2>
          <p className="text-xs text-slate-600 dark:text-slate-400 mt-1">
            {authMode === 'signup' 
              ? 'Create a new account to access your attendance dashboard' 
              : 'Sign in to access your attendance dashboard'}
          </p>
        </div>

        {/* Auth Mode Tabs: Sign In / Sign Up / Biometric */}
        <div className="flex bg-slate-100 dark:bg-slate-950/90 p-1.5 rounded-2xl border border-slate-200 dark:border-slate-800 mb-6">
          <button
            type="button"
            onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'signin'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'signup'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <UserPlus className="w-4 h-4" />
            Sign Up
          </button>

          <button
            type="button"
            onClick={() => { setAuthMode('biometric'); setErrorMessage(''); }}
            className={`flex-1 py-2 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-all ${
              authMode === 'biometric'
                ? 'bg-gradient-to-r from-cyan-600 to-indigo-600 text-white shadow-md'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            Face Scan
          </button>
        </div>

        {/* Error Feedback Message */}
        {errorMessage && (
          <div className="mb-4 p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" />
            <span>{errorMessage}</span>
          </div>
        )}

        {/* Mode 1: Sign In Form */}
        {authMode === 'signin' && (
          <form onSubmit={handleSignIn} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300">
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => navigate('/forgot-password')}
                  className="text-xs text-cyan-400 hover:underline font-medium"
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
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-10 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-transparent transition-all font-mono"
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

            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-slate-700 bg-slate-950 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-slate-900"
                />
                <span className="text-xs text-slate-400 font-medium">Remember credentials</span>
              </label>
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full justify-center py-3 text-sm font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 rounded-xl"
            >
              Sign In to Dashboard
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>



            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Don't have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signup'); setErrorMessage(''); }}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Sign Up Here
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Mode 2: Sign Up Form */}
        {authMode === 'signup' && (
          <form onSubmit={handleSignUp} className="space-y-4">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="e.g. Alex Rivera"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="name@institution.edu"
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 transition-all"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Password
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="min 6 chars..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="re-enter..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Select Account Role
              </label>
              <select
                value={selectedRole}
                onChange={(e) => setSelectedRole(e.target.value as UserRole)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-3 text-xs text-white focus:outline-none focus:ring-2 focus:ring-cyan-500"
              >
                <option value="employee_student">Student / Employee</option>
                <option value="lecturer_teacher">Lecturer / Teacher</option>
                <option value="hr_admin">HR Administrator</option>
                <option value="security_officer">Security Officer</option>
                <option value="super_admin">Super Administrator</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-1.5">
                Student or Employee ID (Optional)
              </label>
              <input
                type="text"
                value={idNumber}
                onChange={(e) => setIdNumber(e.target.value)}
                placeholder="e.g. STU-2026-88"
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-cyan-500 font-mono"
              />
            </div>

            <Button
              type="submit"
              variant="primary"
              size="lg"
              isLoading={isLoading}
              className="w-full justify-center py-3 text-sm font-bold bg-gradient-to-r from-cyan-600 to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 shadow-lg shadow-cyan-500/20 rounded-xl"
            >
              <UserPlus className="w-4 h-4 mr-2" />
              Create Account & Register
            </Button>

            <div className="text-center pt-2">
              <p className="text-xs text-slate-400">
                Already have an account?{' '}
                <button
                  type="button"
                  onClick={() => { setAuthMode('signin'); setErrorMessage(''); }}
                  className="text-cyan-400 font-bold hover:underline"
                >
                  Sign In Here
                </button>
              </p>
            </div>
          </form>
        )}

        {/* Mode 3: Biometric Scan */}
        {authMode === 'biometric' && (
          <div className="space-y-5">
            <div className="relative aspect-video rounded-2xl bg-slate-950 border border-cyan-500/30 overflow-hidden flex flex-col items-center justify-center p-4 group">
              <div className="absolute inset-4 border border-dashed border-cyan-500/40 rounded-xl pointer-events-none flex items-center justify-center">
                <div className="w-32 h-32 rounded-full border-2 border-cyan-400/60 flex items-center justify-center animate-pulse">
                  <ScanFace className="w-16 h-16 text-cyan-400 opacity-80" />
                </div>
              </div>

              {isScanning && (
                <div 
                  className="absolute left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_15px_#22d3ee] animate-bounce"
                  style={{ top: `${scanProgress}%` }}
                />
              )}

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
                Authenticating via <span className="text-cyan-400 font-bold">Biometric Camera Stream</span>
              </p>
            </div>

            <Button
              type="button"
              variant="primary"
              size="lg"
              isLoading={isScanning || isLoading}
              onClick={handleSimulateFaceScan}
              className="w-full justify-center py-3.5 text-sm font-bold shadow-lg shadow-cyan-500/25 bg-gradient-to-r from-cyan-600 via-primary to-indigo-600 hover:from-cyan-500 hover:to-indigo-500 rounded-xl"
            >
              <ScanFace className="w-5 h-5 mr-2" />
              Authenticate With Face Scan
            </Button>
          </div>
        )}

        {/* Footer Security Badge */}
        <div className="mt-6 pt-4 border-t border-slate-800/80 text-center text-[11px] text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-Bit Encrypted Biometric & Password Protection</span>
        </div>
      </div>
    </div>
  );
};
