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
  Globe
} from 'lucide-react';
import { useAuthStore } from '../store/useAuthStore';
import { UserRole } from '../types';
import { cn } from '../lib/utils';
import { Badge } from '../components/ui/Badge';

interface SidebarProps {
  collapsed: boolean;
  onToggleCollapse: () => void;
}

interface NavItem {
  label: string;
  path: string;
  icon: React.ReactNode;
  allowedRoles?: UserRole[];
  badge?: string;
}

interface NavGroup {
  title: string;
  items: NavItem[];
}

export const Sidebar: React.FC<SidebarProps> = ({ collapsed, onToggleCollapse }) => {
  const location = useLocation();
  const { user, activeRole, lockScreen } = useAuthStore();

  const navGroups: NavGroup[] = [
    {
      title: 'Main Operations',
      items: [
        { label: 'Landing Page', path: '/landing', icon: <Globe className="w-5 h-5 text-cyan-400" /> },
        { label: 'Dashboard', path: '/dashboard', icon: <LayoutDashboard className="w-5 h-5" /> },
        { 
          label: 'Live Recognition', 
          path: '/live-recognition', 
          icon: <ScanFace className="w-5 h-5" />, 
          badge: 'LIVE',
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
        { 
          label: 'Live Monitoring', 
          path: '/live-monitoring', 
          icon: <Activity className="w-5 h-5" />, 
          badge: 'REAL-TIME',
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
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
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
          badge: 'ALERT',
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
          badge: 'AI',
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
          badge: 'NEW',
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { 
          label: 'Advanced Analytics', 
          path: '/advanced-analytics', 
          icon: <TrendingUp className="w-5 h-5" />,
          badge: 'NEW',
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { 
          label: 'Recognition Accuracy', 
          path: '/recognition-accuracy', 
          icon: <Target className="w-5 h-5" />,
          badge: 'NEW',
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
        { 
          label: 'AI Reports', 
          path: '/ai-reports', 
          icon: <TrendingUp className="w-5 h-5" />,
          badge: 'NEW',
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { 
          label: 'AI Insights', 
          path: '/ai-insights', 
          icon: <Brain className="w-5 h-5" />,
          badge: 'AI',
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher'] 
        },
        { 
          label: 'Analytics', 
          path: '/analytics', 
          icon: <BarChart3 className="w-5 h-5" />,
          allowedRoles: ['super_admin', 'hr_admin', 'lecturer_teacher', 'security_officer'] 
        },
        { label: 'Reports', path: '/reports', icon: <FileText className="w-5 h-5" /> },
        { label: 'Notifications', path: '/notifications', icon: <Bell className="w-5 h-5" /> }
      ],
    },
    {
      title: 'Security & System',
      items: [
        { 
          label: 'Security Center', 
          path: '/security-center', 
          icon: <Shield className="w-5 h-5" />,
          badge: 'NEW',
          allowedRoles: ['super_admin', 'security_officer'] 
        },
        { 
          label: 'QR Backup', 
          path: '/qr-backup', 
          icon: <QrCode className="w-5 h-5" />,
          badge: 'NEW',
          allowedRoles: ['super_admin', 'hr_admin', 'security_officer'] 
        },
        { 
          label: 'Multi-Factor Auth', 
          path: '/multi-factor', 
          icon: <ShieldCheck className="w-5 h-5" />,
          badge: 'NEW',
          allowedRoles: ['super_admin'] 
        },
        { 
          label: 'System Health', 
          path: '/system-health', 
          icon: <HeartPulse className="w-5 h-5" />,
          badge: 'NEW',
          allowedRoles: ['super_admin'] 
        },
        { 
          label: 'Audit Trail', 
          path: '/comprehensive-audit', 
          icon: <Receipt className="w-5 h-5" />,
          badge: 'NEW',
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
          badge: 'NEW',
          allowedRoles: ['super_admin'] 
        },
        { 
          label: 'System Settings', 
          path: '/settings', 
          icon: <Settings className="w-5 h-5" />,
          allowedRoles: ['super_admin']
        },
      ],
    },
  ];

  return (
    <aside
      className={cn(
        'bg-slate-900 text-slate-100 flex flex-col transition-all duration-300 relative border-r border-slate-800 z-20',
        collapsed ? 'w-20' : 'w-64'
      )}
    >
      {/* Brand Header */}
      <div className="h-16 flex items-center justify-between px-4 border-b border-slate-800">
        <div className="flex items-center space-x-3 overflow-hidden">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white shrink-0 shadow-lg shadow-blue-500/30">
            <ScanFace className="w-6 h-6" />
          </div>
          {!collapsed && (
            <div className="flex flex-col truncate">
              <span className="font-bold text-base leading-tight tracking-wide text-white">BioAuth Pro</span>
              <span className="text-[10px] text-blue-400 font-medium tracking-wider uppercase">Facial AI System</span>
            </div>
          )}
        </div>
        <button
          onClick={onToggleCollapse}
          className="text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
        >
          {collapsed ? <ChevronRight className="w-5 h-5" /> : <ChevronLeft className="w-5 h-5" />}
        </button>
      </div>

      {/* Navigation Links */}
      <div className="flex-1 overflow-y-auto py-4 px-3 space-y-6 custom-scrollbar">
        {navGroups.map((group, idx) => {
          const visibleItems = group.items.filter((item) => {
            if (activeRole === 'super_admin') return true;
            if (!item.allowedRoles) return true;
            return item.allowedRoles.includes(activeRole);
          });

          if (visibleItems.length === 0) return null;

          return (
            <div key={idx} className="space-y-1">
              {!collapsed && (
                <div className="px-3 text-[11px] font-semibold text-slate-500 uppercase tracking-wider mb-2">
                  {group.title}
                </div>
              )}
              {visibleItems.map((item) => {
                const isActive = location.pathname === item.path;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    className={cn(
                      'flex items-center space-x-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all group relative',
                      isActive
                        ? 'bg-blue-600/10 text-blue-400 font-semibold border-l-4 border-blue-500 rounded-l-none'
                        : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/60'
                    )}
                    title={collapsed ? item.label : undefined}
                  >
                    <span className={cn('transition-colors', isActive ? 'text-blue-400' : 'text-slate-400 group-hover:text-slate-200')}>
                      {item.icon}
                    </span>
                    {!collapsed && <span className="truncate">{item.label}</span>}
                    {!collapsed && item.badge && (
                      <Badge
                        variant={
                          item.badge === 'LIVE' ? 'success' : 
                          item.badge === 'AI' ? 'primary' : 
                          'danger'
                        }
                        pulse={item.badge === 'LIVE'}
                        className="ml-auto text-[10px] px-1.5 py-0"
                      >
                        {item.badge}
                      </Badge>
                    )}
                  </NavLink>
                );
              })}
            </div>
          );
        })}
      </div>

      {/* User Footer Profile & Lock */}
      <div className="p-3 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/30">
        {!collapsed && user ? (
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2.5 overflow-hidden">
              {user.avatar ? (
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-9 h-9 rounded-full object-cover border border-slate-200 dark:border-slate-700 shrink-0"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-primary/10 text-primary flex items-center justify-center border border-primary/30 font-bold text-xs shrink-0">
                  <UserIcon className="w-4.5 h-4.5" />
                </div>
              )}
              <div className="truncate">
                <p className="text-xs font-semibold text-slate-900 dark:text-white truncate">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">
                  {activeRole.replace('_', ' ')}
                </p>
              </div>
            </div>

            <button
              onClick={lockScreen}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-200/60 dark:hover:bg-slate-800 transition-colors"
              title="Lock Screen"
            >
              <Lock className="w-4 h-4" />
            </button>
          </div>
        ) : (
          <div className="flex justify-center">
            <button
              onClick={lockScreen}
              className="p-2 rounded-xl text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800"
              title="Lock Screen"
            >
              <Lock className="w-5 h-5" />
            </button>
          </div>
        )}
      </div>
    </aside>
  );
};
