import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Bell, Check, CheckCheck, Trash2, ShieldAlert, Camera, Clock, CalendarDays } from 'lucide-react';
import { useNotificationStore } from '../store/useNotificationStore';
import { Button } from '../components/ui/Button';
import { Badge } from '../components/ui/Badge';
import { useNavigate } from 'react-router-dom';

interface NotificationDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const NotificationDrawer: React.FC<NotificationDrawerProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const { notifications, markAsRead, markAllAsRead, clearNotification } = useNotificationStore();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 overflow-hidden">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="fixed inset-0 bg-slate-950/60 backdrop-blur-sm"
        />

        <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            className="w-screen max-w-md bg-card border-l border-slate-200 dark:border-slate-800 shadow-2xl flex flex-col"
          >
            {/* Header */}
            <div className="p-4 sm:p-6 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-primary/10 text-primary">
                  <Bell className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-bold text-slate-900 dark:text-white">Notifications Center</h3>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Real-time biometric & system alerts</p>
                </div>
              </div>

              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" onClick={markAllAsRead} title="Mark All as Read" className="h-8 w-8">
                  <CheckCheck className="w-4 h-4 text-slate-500" />
                </Button>
                <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8">
                  <X className="w-4 h-4 text-slate-500" />
                </Button>
              </div>
            </div>

            {/* Notification List */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {notifications.length === 0 ? (
                <div className="text-center py-12 text-slate-400">
                  <Bell className="w-12 h-12 mx-auto mb-2 stroke-1 opacity-40" />
                  <p className="text-sm font-medium">All caught up!</p>
                  <p className="text-xs text-slate-500">No new notifications available.</p>
                </div>
              ) : (
                notifications.map((n) => (
                  <div
                    key={n.id}
                    onClick={() => {
                      markAsRead(n.id);
                      if (n.actionUrl) {
                        navigate(n.actionUrl);
                        onClose();
                      }
                    }}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer relative group ${
                      n.isRead
                        ? 'bg-card border-slate-100 dark:border-slate-800/60 opacity-80'
                        : 'bg-primary/5 dark:bg-primary/10 border-primary/20 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-start gap-3">
                        <div
                          className={`p-2 rounded-xl shrink-0 mt-0.5 ${
                            n.priority === 'high'
                              ? 'bg-rose-500/10 text-rose-500'
                              : n.priority === 'medium'
                              ? 'bg-amber-500/10 text-amber-500'
                              : 'bg-primary/10 text-primary'
                          }`}
                        >
                          {n.category === 'unknown_person' && <ShieldAlert className="w-4 h-4" />}
                          {n.category === 'camera_offline' && <Camera className="w-4 h-4" />}
                          {n.category === 'attendance' && <Clock className="w-4 h-4" />}
                          {n.category === 'leave_request' && <CalendarDays className="w-4 h-4" />}
                        </div>

                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white flex items-center gap-2">
                            {n.title}
                            {!n.isRead && (
                              <span className="w-2 h-2 rounded-full bg-primary inline-block" />
                            )}
                          </p>
                          <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
                            {n.message}
                          </p>
                          <p className="text-[10px] text-slate-400 mt-2 font-mono">{n.timestamp}</p>
                        </div>
                      </div>

                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          clearNotification(n.id);
                        }}
                        className="opacity-0 group-hover:opacity-100 p-1 text-slate-400 hover:text-rose-500 transition-opacity"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/50 dark:bg-slate-900/40 text-center">
              <span className="text-xs text-slate-400 font-mono">
                {notifications.length} Total Alerts Logged
              </span>
            </div>
          </motion.div>
        </div>
      </div>
    </AnimatePresence>
  );
};
