import React from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Users, 
  ScanFace, 
  Camera, 
  Clock, 
  Building2, 
  CalendarDays, 
  FileText, 
  ShieldAlert, 
  UserCheck, 
  BarChart3, 
  History, 
  Settings, 
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Lock,
  User as UserIcon,
  Brain,
  Activity,
  MapPin,
  Flame,
  Bell,
  FileEdit,
  TrendingUp,
  Target,
  QrCode,
  ShieldCheck,
  Shield,
  HeartPulse,
  Receipt,
  Cloud,
  Globe,
  Send,
  Navigation
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { UserRole } from '../types';
import { cn } from '../lib/utils';

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  badge?: string;
  allowedRoles?: UserRole[];
}

interface NavSection {
  title: string;
  items: NavItem[];
}

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  onToggleCollapse,
  mobileOpen,
  onMobileClose,
}) => {
  const location = useLocation();
  const { activeRole } = useAuthStore();

  const navSections: NavSection[] = [
    {
      title: 'Core Features',
      items: [
        { label: 'Landing Page', path: '/landing', icon: <Globe className="w-5 h-5 text-cyan-400" /> },
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { 
          label: 'Live Recognition', 
          path: '/live-recognition', 
          icon: <ScanFace className="w-5 h-5" />, 
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
        { 
          label: 'Live Monitoring', 
          path: '/live-monitoring', 
          icon: <Activity className="w-5 h-5" />, 
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
        { 
          label: 'Building Map', 
          path: '/building-map', 
          icon: <MapPin className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
        { 
          label: 'Face Enrollment', 
          path: '/face-enrollment', 
          icon: <Sparkles className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer', 'employee_student'] 
        },
        { 
          label: '360° Face Matrix', 
          path: '/face-enrollment-360', 
          icon: <ScanFace className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer', 'employee_student', 'lecturer_teacher'] 
        },
        { 
          label: 'Mobile GPS Check-In', 
          path: '/mobile-checkin', 
          icon: <Navigation className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer', 'employee_student', 'lecturer_teacher'] 
        },
        { label: 'Attendance', path: '/attendance', icon: <Clock className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Management',
      items: [
        { 
          label: 'User Directory', 
          path: '/users', 
          icon: <Users className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher', 'security_officer'] 
        },
        { 
          label: 'Camera Nodes', 
          path: '/cameras', 
          icon: <Camera className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
        { 
          label: 'Departments', 
          path: '/departments', 
          icon: <Building2 className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { 
          label: 'Schedules & Shifts', 
          path: '/schedules', 
          icon: <CalendarDays className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { label: 'Leave Requests', path: '/leave', icon: <FileText className="w-5 h-5" /> },
        { 
          label: 'Visitors', 
          path: '/visitors', 
          icon: <UserCheck className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'security_officer'] 
        },
        { 
          label: 'Unknown Faces', 
          path: '/unknown-faces', 
          icon: <ShieldAlert className="w-5 h-5" />, 
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
      ],
    },
    {
      title: 'Intelligence & Admin',
      items: [
        { 
          label: 'AI Assistant', 
          path: '/ai-assistant', 
          icon: <Brain className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { 
          label: 'Attendance Heatmaps', 
          path: '/heatmaps', 
          icon: <Flame className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { 
          label: 'Recognition Replay', 
          path: '/replay', 
          icon: <History className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
        { 
          label: 'Attendance Corrections', 
          path: '/attendance-corrections', 
          icon: <FileEdit className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { 
          label: 'Advanced Analytics', 
          path: '/advanced-analytics', 
          icon: <TrendingUp className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { 
          label: 'Recognition Accuracy', 
          path: '/recognition-accuracy', 
          icon: <Target className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
        { 
          label: 'AI Reports', 
          path: '/ai-reports', 
          icon: <TrendingUp className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { 
          label: 'AI Insights', 
          path: '/ai-insights', 
          icon: <Brain className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { 
          label: 'Analytics', 
          path: '/analytics', 
          icon: <BarChart3 className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher', 'security_officer'] 
        },
        { label: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" /> },
        { label: 'Notifications', path: '/notifications', icon: <Bell className="w-5 h-5" /> },
        { label: 'Multi-Channel Gateways', path: '/notification-channels', icon: <Send className="w-5 h-5" /> },
        { label: 'Biometric Privacy Portal', path: '/privacy-portal', icon: <Lock className="w-5 h-5" /> },
      ],
    },
    {
      title: 'Security & System',
      items: [
        { 
          label: 'Security Center', 
          path: '/security-center', 
          icon: <Shield className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'security_officer'] 
        },
        { 
          label: 'QR Backup', 
          path: '/qr-backup', 
          icon: <QrCode className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
        { 
          label: 'Multi-Factor Auth', 
          path: '/multi-factor', 
          icon: <ShieldCheck className="w-5 h-5" />,
          allowedRoles: ['super_admin'] 
        },
        { 
          label: 'System Health', 
          path: '/system-health', 
          icon: <HeartPulse className="w-5 h-5" />,
          allowedRoles: ['super_admin'] 
        },
        { 
          label: 'Audit Trail', 
          path: '/comprehensive-audit', 
          icon: <Receipt className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin'] 
        },
        { 
          label: 'Audit Logs', 
          path: '/audit-logs', 
          icon: <History className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
        { 
          label: 'Integrations', 
          path: '/integrations', 
          icon: <Cloud className="w-5 h-5" />,
          allowedRoles: ['super_admin'] 
        },
        { 
          label: 'System Settings', 
          path: '/settings', 
          icon: <Settings className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin'] 
        },
      ],
    },
  ];

  const filterItemsByRole = (items: NavItem[]) => {
    return items.filter((item) => {
      if (activeRole === 'super_admin') return true;
      if (!item.allowedRoles) return true;
      return item.allowedRoles.includes(activeRole);
    });
  };

  const content = (
    <div className="flex flex-col h-full bg-slate-900 text-slate-300 border-r border-slate-800 select-none">
      {/* Brand Header */}
      <div className="flex items-center justify-between h-16 px-4 border-b border-slate-800">
        <div className="flex items-center gap-3 overflow-hidden">
          <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 via-primary to-emerald-500 text-white font-bold text-lg shadow-lg shadow-primary/20 shrink-0">
            <ScanFace className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-extrabold text-white text-base tracking-tight truncate">
                BioAuth System
              </span>
              <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest truncate">
                Enterprise Vision
              </span>
            </div>
          )}
        </div>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 scrollbar-thin scrollbar-thumb-slate-800">
        {navSections.map((section, idx) => {
          const visibleItems = filterItemsByRole(section.items);
          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <p className="px-3 text-[10px] font-mono font-semibold uppercase tracking-wider text-slate-500 mb-2">
                  {section.title}
                </p>
              )}
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={() => mobileOpen && onMobileClose()}
                    className={cn(
                      'flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all duration-200 group',
                      isActive
                        ? 'bg-gradient-to-r from-primary to-indigo-600 text-white shadow-md shadow-primary/25'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <div className="flex items-center gap-3 truncate">
                      <span className={cn('shrink-0 transition-transform duration-200 group-hover:scale-110', isActive ? 'text-white' : 'text-slate-400 group-hover:text-cyan-400')}>
                        {item.icon}
                      </span>
                      {!collapsed && <span className="truncate">{item.label}</span>}
                    </div>
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* Footer / Collapse Toggle */}
      <div className="p-3 border-t border-slate-800 flex items-center justify-between">
        {!collapsed && (
          <div className="flex items-center gap-2 px-2 py-1 text-slate-400 text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>Node Status: Live</span>
          </div>
        )}
        <button
          onClick={onToggleCollapse}
          className="hidden md:flex items-center justify-center w-8 h-8 rounded-lg bg-slate-800 text-slate-400 hover:text-white hover:bg-slate-700 transition-colors ml-auto"
          title={collapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside
        className={cn(
          'hidden md:block fixed top-0 left-0 bottom-0 z-30 transition-all duration-300 ease-in-out',
          collapsed ? 'w-16' : 'w-64'
        )}
      >
        {content}
      </aside>

      {/* Mobile Drawer Overlay */}
      {mobileOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-slate-950/80 backdrop-blur-sm transition-opacity"
          onClick={onMobileClose}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={cn(
          'md:hidden fixed top-0 left-0 bottom-0 z-50 w-64 transition-transform duration-300 ease-in-out',
          mobileOpen ? 'translate-x-0' : '-translate-x-full'
        )}
      >
        {content}
      </aside>
    </>
  );
};
