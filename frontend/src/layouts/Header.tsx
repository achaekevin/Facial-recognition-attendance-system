import React, { useState, useRef, useEffect } from 'react';
import { 
  Search, 
  Bell, 
  Sun, 
  Moon, 
  ShieldCheck, 
  ChevronDown, 
  Check, 
  User as UserIcon, 
  Lock, 
  LogOut,
  Menu,
  Globe
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { useThemeStore } from '../store/useThemeStore';
import { useNotificationStore } from '../store/useNotificationStore';
import OfflineModeIndicator from '../features/offline/OfflineModeIndicator';
import { UserRole } from '../types';
import { toast } from 'sonner';
import { Button } from '../components/ui/Button';
import { useNavigate } from 'react-router-dom';

interface HeaderProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onToggleSidebar: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenSearch,
  onOpenNotifications,
  onToggleSidebar,
}) => {
  const navigate = useNavigate();
  const { user, activeRole, switchRole, logout, lockScreen } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const { notifications } = useNotificationStore();

  const [roleMenuOpen, setRoleMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);

  const roleMenuRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown menus automatically when clicking outside or clicking anywhere in the dashboard
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent | TouchEvent) => {
      if (roleMenuRef.current && !roleMenuRef.current.contains(event.target as Node)) {
        setRoleMenuOpen(false);
      }
      if (userMenuRef.current && !userMenuRef.current.contains(event.target as Node)) {
        setUserMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('touchstart', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('touchstart', handleClickOutside);
    };
  }, []);

  const unreadCount = notifications.filter((n) => !n.isRead).length;

  const roles: Array<{ id: UserRole; label: string; desc: string }> = [
    { id: 'super_admin', label: 'Super Admin', desc: 'Full System Access & Config' },
    { id: 'hr_admin', label: 'HR / Administrator', desc: 'Attendance, Reports, Users' },
    { id: 'lecturer_teacher', label: 'Lecturer / Teacher', desc: 'Class Rosters, Student Rosters' },
    { id: 'security_officer', label: 'Security Officer', desc: 'Live Feeds, Unknown Alerts' },
    { id: 'employee_student', label: 'Employee / Student', desc: 'Self Attendance, Profile & Leave' },
  ];

  return (
    <header className="sticky top-0 z-30 h-16 bg-card/80 backdrop-blur-md border-b border-slate-200/80 dark:border-slate-800/80 px-4 sm:px-6 flex items-center justify-between shadow-xs">
      {/* Left: Mobile Toggle, Landing Page Link & Global Search */}
      <div className="flex items-center gap-3">
        <button
          onClick={onToggleSidebar}
          className="md:hidden p-2 rounded-xl text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <Menu className="w-5 h-5" />
        </button>

        <button
          onClick={() => navigate('/landing')}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-cyan-500/30 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 text-xs font-bold transition-all"
          title="Return to System Landing Page"
        >
          <Globe className="w-4 h-4" />
          <span className="hidden sm:inline">Landing Page</span>
        </button>

        {/* Global Search Bar */}
        <button
          onClick={onOpenSearch}
          className="flex items-center gap-3 px-3.5 py-1.5 bg-slate-100 dark:bg-slate-800/70 hover:bg-slate-200/60 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700/60 rounded-xl text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-all w-48 sm:w-72"
        >
          <Search className="w-4 h-4 text-slate-400" />
          <span className="text-xs font-medium text-slate-500 dark:text-slate-400 truncate">
            Search system (Ctrl+K)...
          </span>
          <kbd className="hidden sm:inline-block ml-auto text-[10px] font-mono bg-white dark:bg-slate-900 border border-slate-300 dark:border-slate-700 px-1.5 py-0.5 rounded text-slate-500">
            ⌘K
          </kbd>
        </button>
      </div>

      {/* Right Controls */}
      <div className="flex items-center gap-2 sm:gap-3">
        {/* Active Role Switcher Dropdown */}
        <div className="relative" ref={roleMenuRef}>
          <button
            onClick={() => {
              setRoleMenuOpen((prev) => !prev);
              setUserMenuOpen(false);
            }}
            className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-primary/20 bg-primary/5 hover:bg-primary/10 text-primary transition-colors text-xs font-semibold"
          >
            <ShieldCheck className="w-4 h-4" />
            <span className="hidden sm:inline">{roles.find((r) => r.id === activeRole)?.label}</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>

          {roleMenuOpen && (
            <div className="absolute right-0 mt-2 w-64 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800 text-[11px] font-bold uppercase tracking-wider text-slate-400">
                Switch Interactive Role View
              </div>
              <div className="py-1 space-y-1">
                {roles.map((r) => (
                  <button
                    key={r.id}
                    onClick={() => {
                      switchRole(r.id);
                      setRoleMenuOpen(false);
                    }}
                    className="w-full flex items-start gap-2.5 p-2 rounded-xl text-left hover:bg-slate-100 dark:hover:bg-slate-800/80 transition-colors"
                  >
                    <div className="mt-0.5">
                      {activeRole === r.id ? (
                        <Check className="w-4 h-4 text-primary" />
                      ) : (
                        <div className="w-4 h-4 rounded-full border border-slate-300 dark:border-slate-700" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-slate-900 dark:text-white">{r.label}</p>
                      <p className="text-[10px] text-slate-500 dark:text-slate-400">{r.desc}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Dark/Light Mode Toggle */}
        <Button
          variant="ghost"
          size="icon"
          onClick={toggleTheme}
          className="rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white"
        >
          {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
        </Button>

        {/* Notifications Bell Button */}
        <button
          onClick={onOpenNotifications}
          className="relative p-2 rounded-full text-slate-500 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          <Bell className="w-5 h-5" />
          {unreadCount > 0 && (
            <span className="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white">
              {unreadCount}
            </span>
          )}
        </button>

        {/* Offline Mode Indicator */}
        <OfflineModeIndicator />

        {/* User Profile Menu */}
        <div className="relative" ref={userMenuRef}>
          <button
            onClick={() => {
              setUserMenuOpen((prev) => !prev);
              setRoleMenuOpen(false);
            }}
            className="flex items-center gap-2 p-1 rounded-full hover:ring-2 hover:ring-primary/40 transition-all"
          >
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover border border-slate-200 dark:border-slate-700"
              />
            ) : (
              <div className="w-8 h-8 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/30 font-bold text-xs">
                <UserIcon className="w-4 h-4" />
              </div>
            )}
          </button>

          {userMenuOpen && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-card border border-slate-200 dark:border-slate-800 shadow-2xl p-2 z-50 animate-in fade-in slide-in-from-top-2">
              <div className="px-3 py-2 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{user?.email}</p>
              </div>
              <div className="py-1 space-y-0.5">
                <button
                  onClick={() => {
                    navigate('/profile');
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <UserIcon className="w-4 h-4" /> My Biometric Profile
                </button>
                <button
                  onClick={() => {
                    lockScreen();
                    setUserMenuOpen(false);
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  <Lock className="w-4 h-4" /> Lock Screen
                </button>
                <button
                  onClick={() => {
                    logout();
                    setUserMenuOpen(false);
                    toast.info('Logged out successfully', { duration: 1000 });
                    navigate('/landing');
                  }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-xs font-medium text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 rounded-xl transition-colors"
                >
                  <LogOut className="w-4 h-4" /> Log Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
