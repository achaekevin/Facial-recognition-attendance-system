import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ScanFace, Lock, Mail, Eye, EyeOff, ShieldCheck, ArrowRight, Sparkles } from 'lucide-react';
import { useAuthStore } from '../../store/useAuthStore';
import { UserRole, User } from '../../types';
import { Button } from '../../components/ui/Button';

export const LoginPage: React.FC = () => {
  const navigate = useNavigate();
  const { login, switchRole } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [selectedRole, setSelectedRole] = useState<UserRole>('super_admin');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  const quickRoles: { role: UserRole; label: string; defaultEmail: string; defaultName: string }[] = [
    { role: 'super_admin', label: 'Super Admin', defaultEmail: 'superadmin@attendance.com', defaultName: 'System Administrator' },
    { role: 'hr_admin', label: 'HR Admin', defaultEmail: 'hradmin@attendance.com', defaultName: 'HR Manager' },
    { role: 'lecturer_teacher', label: 'Lecturer', defaultEmail: 'lecturer@attendance.com', defaultName: 'Senior Lecturer' },
    { role: 'security_officer', label: 'Security', defaultEmail: 'security@attendance.com', defaultName: 'Security Commander' },
    { role: 'employee_student', label: 'Student / Employee', defaultEmail: 'student@attendance.com', defaultName: 'Registered User' },
  ];

  const handleRoleSelect = (r: { role: UserRole; defaultEmail: string }) => {
    setSelectedRole(r.role);
    setEmail(r.defaultEmail);
    setPassword('password321');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');

    if (!email || !password) {
      setErrorMessage('Please enter email address and password.');
      return;
    }

    setIsLoading(true);

    setTimeout(() => {
      const activeRoleConfig = quickRoles.find((r) => r.role === selectedRole) || quickRoles[0];
      
      const userSession: User = {
        id: `usr-${Date.now()}`,
        name: activeRoleConfig.defaultName,
        email: email,
        phone: '+1 (555) 000-0000',
        role: selectedRole,
        category: selectedRole === 'employee_student' ? 'student' : 'employee',
        departmentId: 'dept-1',
        departmentName: 'School of Engineering & Tech',
        avatar: '',
        faceImageUrls: [],
        status: 'active',
        accuracyScore: 99.0,
        registeredAt: new Date().toISOString().split('T')[0],
        employeeOrStudentId: `ID-${Math.floor(1000 + Math.random() * 9000)}`,
      };

      login(userSession);
      switchRole(selectedRole);
      navigate('/dashboard');
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 relative overflow-hidden font-sans">
      {/* Dynamic Glassmorphism Backdrop Effects */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/20 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md z-10">
        {/* Brand Logo & Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-tr from-primary to-indigo-500 text-white shadow-2xl shadow-primary/40 mb-4 ring-4 ring-primary/20">
            <ScanFace className="w-10 h-10 animate-pulse" />
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white">
            BioAuth <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-indigo-400 to-cyan-400">Enterprise</span>
          </h1>
          <p className="text-sm text-slate-400 mt-2">
            Facial Recognition & Attendance Management System
          </p>
        </div>

        {/* Quick Role Portal Selection */}
        <div className="bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-2xl p-3 mb-6 shadow-xl">
          <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider text-center mb-2 flex items-center justify-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            Select System Access Role
          </p>
          <div className="grid grid-cols-5 gap-1">
            {quickRoles.map((r) => (
              <button
                key={r.role}
                type="button"
                onClick={() => handleRoleSelect(r)}
                className={`py-2 px-1 text-[10px] font-semibold rounded-lg transition-all text-center truncate border ${
                  selectedRole === r.role
                    ? 'bg-primary text-white border-primary shadow-md shadow-primary/25'
                    : 'bg-slate-800/60 text-slate-300 border-slate-700/60 hover:bg-slate-700/60 hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>
        </div>

        {/* Login Form Container */}
        <div className="bg-slate-900/90 backdrop-blur-2xl border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative">
          <form onSubmit={handleSubmit} className="space-y-5">
            {errorMessage && (
              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs font-medium flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 shrink-0 text-rose-400" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-300 mb-2">
                User Email Address
              </label>
              <div className="relative">
                <Mail className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="enter email address..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-4 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
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
                <Lock className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="enter password..."
                  className="w-full bg-slate-950/80 border border-slate-800 rounded-xl py-3 pl-11 pr-11 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent transition-all font-mono"
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
              <label className="flex items-center gap-2.5 cursor-pointer">
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
              className="w-full justify-center py-3.5 text-base font-bold shadow-lg shadow-primary/30"
            >
              Sign In to System Portal
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
          </form>
        </div>

        {/* Security Footer */}
        <div className="mt-8 text-center text-xs text-slate-500 flex items-center justify-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>256-Bit Encrypted Biometric & Token Security</span>
        </div>
      </div>
    </div>
  );
};
