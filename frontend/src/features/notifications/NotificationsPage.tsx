import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  Bell, BellOff, Mail, MessageSquare, Smartphone, 
  CheckCircle2, AlertTriangle, Clock, Camera, 
  UserX, Settings, BarChart3, Check, X
} from 'lucide-react';
import { toast } from 'sonner';

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  recipient_id: string;
  channels: string[];
  status: string;
  priority: string;
  created_at: string;
  read: boolean;
}

interface NotificationPreferences {
  late_arrival_enabled: boolean;
  late_arrival_threshold: number;
  absence_enabled: boolean;
  absence_check_time: string;
  unknown_person_enabled: boolean;
  camera_offline_enabled: boolean;
  email_enabled: boolean;
  sms_enabled: boolean;
  in_app_enabled: boolean;
}

export const NotificationsPage: React.FC = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [preferences, setPreferences] = useState<NotificationPreferences>({
    late_arrival_enabled: true,
    late_arrival_threshold: 30,
    absence_enabled: true,
    absence_check_time: '10:00',
    unknown_person_enabled: true,
    camera_offline_enabled: true,
    email_enabled: true,
    sms_enabled: false,
    in_app_enabled: true
  });
  const [statistics, setStatistics] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'inbox' | 'preferences' | 'statistics'>('inbox');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchPreferences();
    fetchStatistics();
  }, []);

  const fetchNotifications = async () => {
    try {
      const response = await fetch('/api/v1/notifications/history?limit=50');
      const data = await response.json();
      setNotifications(data.notifications || []);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const fetchPreferences = async () => {
    try {
      const response = await fetch('/api/v1/notifications/preferences');
      const data = await response.json();
      
      // Map backend rules to preferences format
      if (data.rules) {
        setPreferences({
          late_arrival_enabled: data.rules.late_arrival?.enabled || false,
          late_arrival_threshold: data.rules.late_arrival?.threshold_minutes || 30,
          absence_enabled: data.rules.absence?.enabled || false,
          absence_check_time: data.rules.absence?.check_time || '10:00',
          unknown_person_enabled: data.rules.unknown_person?.enabled || false,
          camera_offline_enabled: data.rules.camera_offline?.enabled || false,
          email_enabled: true,
          sms_enabled: false,
          in_app_enabled: true
        });
      }
    } catch (error) {
      console.error('Error fetching preferences:', error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('/api/v1/notifications/statistics?days=7');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const updatePreferences = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/v1/notifications/preferences', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(preferences)
      });
      
      if (response.ok) {
        toast.success('Notification preferences updated successfully');
      }
    } catch (error) {
      toast.error('Failed to update preferences');
      console.error('Error updating preferences:', error);
    } finally {
      setLoading(false);
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await fetch(`/api/v1/notifications/mark-read/${notificationId}`, {
        method: 'POST'
      });
      
      setNotifications(prev =>
        prev.map(n => n.id === notificationId ? { ...n, read: true } : n)
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await fetch('/api/v1/notifications/mark-all-read', {
        method: 'POST'
      });
      
      setNotifications(prev => prev.map(n => ({ ...n, read: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'late_arrival': return Clock;
      case 'absence': return UserX;
      case 'unknown_person': return AlertTriangle;
      case 'camera_offline': return Camera;
      case 'attendance_correction': return CheckCircle2;
      case 'leave_approval': return CheckCircle2;
      default: return Bell;
    }
  };

  const getNotificationColor = (type: string) => {
    switch (type) {
      case 'late_arrival': return 'text-yellow-500 bg-yellow-100 dark:bg-yellow-900/20';
      case 'absence': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      case 'unknown_person': return 'text-orange-500 bg-orange-100 dark:bg-orange-900/20';
      case 'camera_offline': return 'text-red-500 bg-red-100 dark:bg-red-900/20';
      default: return 'text-blue-500 bg-blue-100 dark:bg-blue-900/20';
    }
  };

  const unreadCount = notifications.filter(n => !n.read).length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Bell className="w-6 h-6 text-primary" />
            Smart Notifications
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Automated alerts for late arrivals, absences, and system events
          </p>
        </div>

        {unreadCount > 0 && (
          <Button variant="outline" size="sm" onClick={markAllAsRead}>
            <Check className="w-4 h-4 mr-2" />
            Mark All Read ({unreadCount})
          </Button>
        )}
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => setActiveTab('inbox')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'inbox'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Bell className="w-4 h-4 inline mr-2" />
          Inbox {unreadCount > 0 && `(${unreadCount})`}
        </button>
        <button
          onClick={() => setActiveTab('preferences')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'preferences'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <Settings className="w-4 h-4 inline mr-2" />
          Preferences
        </button>
        <button
          onClick={() => setActiveTab('statistics')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'statistics'
              ? 'text-primary border-b-2 border-primary'
              : 'text-slate-600 dark:text-slate-400'
          }`}
        >
          <BarChart3 className="w-4 h-4 inline mr-2" />
          Statistics
        </button>
      </div>

      {/* Inbox Tab */}
      {activeTab === 'inbox' && (
        <div className="space-y-3">
          {notifications.map((notification) => {
            const Icon = getNotificationIcon(notification.type);
            const colorClass = getNotificationColor(notification.type);
            
            return (
              <Card
                key={notification.id}
                glass
                className={`transition-all ${
                  notification.read ? 'opacity-60' : 'border-l-4 border-l-primary'
                }`}
              >
                <CardContent className="p-4">
                  <div className="flex items-start gap-4">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${colorClass}`}>
                      <Icon className="w-5 h-5" />
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex-1">
                          <p className="font-semibold text-slate-900 dark:text-white">
                            {notification.title}
                          </p>
                          <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                            {notification.message}
                          </p>
                        </div>
                        
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => markAsRead(notification.id)}
                            className="flex-shrink-0"
                          >
                            <Check className="w-4 h-4" />
                          </Button>
                        )}
                      </div>

                      <div className="flex items-center gap-3 mt-3">
                        <span className="text-xs text-slate-500">
                          {new Date(notification.created_at).toLocaleString()}
                        </span>
                        
                        <div className="flex gap-1">
                          {notification.channels.includes('email') && (
                            <Badge variant="secondary" className="text-xs">
                              <Mail className="w-3 h-3 mr-1" />
                              Email
                            </Badge>
                          )}
                          {notification.channels.includes('sms') && (
                            <Badge variant="secondary" className="text-xs">
                              <Smartphone className="w-3 h-3 mr-1" />
                              SMS
                            </Badge>
                          )}
                          {notification.channels.includes('in_app') && (
                            <Badge variant="secondary" className="text-xs">
                              <MessageSquare className="w-3 h-3 mr-1" />
                              In-App
                            </Badge>
                          )}
                        </div>

                        {notification.priority === 'high' && (
                          <Badge variant="error" className="text-xs">High Priority</Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}

          {notifications.length === 0 && (
            <Card glass className="p-12 text-center">
              <Bell className="w-16 h-16 text-slate-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Notifications
              </h3>
              <p className="text-sm text-slate-500">
                You're all caught up! No new notifications.
              </p>
            </Card>
          )}
        </div>
      )}

      {/* Preferences Tab */}
      {activeTab === 'preferences' && (
        <div className="space-y-6">
          <Card glass>
            <CardHeader>
              <CardTitle>Notification Types</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Late Arrival */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Clock className="w-4 h-4 text-yellow-500" />
                    <p className="font-semibold text-slate-900 dark:text-white">Late Arrival Alerts</p>
                  </div>
                  <p className="text-sm text-slate-500">Get notified when users arrive late</p>
                  {preferences.late_arrival_enabled && (
                    <div className="mt-2">
                      <label className="text-xs text-slate-600 dark:text-slate-400">Threshold (minutes)</label>
                      <input
                        type="number"
                        value={preferences.late_arrival_threshold}
                        onChange={(e) => setPreferences(prev => ({ ...prev, late_arrival_threshold: Number(e.target.value) }))}
                        className="w-24 px-2 py-1 text-sm border border-slate-300 dark:border-slate-700 rounded ml-2"
                      />
                    </div>
                  )}
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.late_arrival_enabled}
                    onChange={(e) => setPreferences(prev => ({ ...prev, late_arrival_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Absence */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <UserX className="w-4 h-4 text-red-500" />
                    <p className="font-semibold text-slate-900 dark:text-white">Absence Notifications</p>
                  </div>
                  <p className="text-sm text-slate-500">Alert for unrecorded attendance</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.absence_enabled}
                    onChange={(e) => setPreferences(prev => ({ ...prev, absence_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Unknown Person */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-orange-500" />
                    <p className="font-semibold text-slate-900 dark:text-white">Unknown Person Alerts</p>
                  </div>
                  <p className="text-sm text-slate-500">Security alerts for unrecognized faces</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.unknown_person_enabled}
                    onChange={(e) => setPreferences(prev => ({ ...prev, unknown_person_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              {/* Camera Offline */}
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Camera className="w-4 h-4 text-red-500" />
                    <p className="font-semibold text-slate-900 dark:text-white">Camera Status Alerts</p>
                  </div>
                  <p className="text-sm text-slate-500">Notify when cameras go offline</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.camera_offline_enabled}
                    onChange={(e) => setPreferences(prev => ({ ...prev, camera_offline_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle>Delivery Channels</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Mail className="w-5 h-5 text-blue-500" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">Email Notifications</p>
                    <p className="text-sm text-slate-500">Receive notifications via email</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.email_enabled}
                    onChange={(e) => setPreferences(prev => ({ ...prev, email_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <Smartphone className="w-5 h-5 text-green-500" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">SMS Notifications</p>
                    <p className="text-sm text-slate-500">Receive urgent alerts via SMS</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.sms_enabled}
                    onChange={(e) => setPreferences(prev => ({ ...prev, sms_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>

              <div className="flex items-center justify-between p-4 bg-slate-50 dark:bg-slate-900/50 rounded-xl">
                <div className="flex items-center gap-3">
                  <MessageSquare className="w-5 h-5 text-purple-500" />
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">In-App Notifications</p>
                    <p className="text-sm text-slate-500">Real-time alerts in the application</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={preferences.in_app_enabled}
                    onChange={(e) => setPreferences(prev => ({ ...prev, in_app_enabled: e.target.checked }))}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary"></div>
                </label>
              </div>
            </CardContent>
          </Card>

          <div className="flex justify-end">
            <Button
              variant="primary"
              onClick={updatePreferences}
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Save Preferences'}
            </Button>
          </div>
        </div>
      )}

      {/* Statistics Tab */}
      {activeTab === 'statistics' && statistics && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card glass>
            <CardHeader>
              <CardTitle>Notifications by Type</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(statistics.by_type || {}).map(([type, count]: [string, any]) => (
                  <div key={type} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">
                      {type.replace(/_/g, ' ')}
                    </span>
                    <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle>Delivery by Channel</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(statistics.by_channel || {}).map(([channel, count]: [string, any]) => (
                  <div key={channel} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {channel === 'email' && <Mail className="w-4 h-4 text-blue-500" />}
                      {channel === 'sms' && <Smartphone className="w-4 h-4 text-green-500" />}
                      {channel === 'in_app' && <MessageSquare className="w-4 h-4 text-purple-500" />}
                      <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">{channel}</span>
                    </div>
                    <span className="font-bold text-slate-900 dark:text-white">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle>Delivery Success Rate</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(statistics.delivery_rate || {}).map(([channel, rate]: [string, any]) => (
                  <div key={channel}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-slate-600 dark:text-slate-400 capitalize">{channel}</span>
                      <span className="font-bold text-primary">{rate}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                      <div
                        className="bg-primary h-2 rounded-full transition-all"
                        style={{ width: `${rate}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card glass>
            <CardHeader>
              <CardTitle>Total Sent (Last 7 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-center">
                <p className="text-5xl font-bold text-primary">{statistics.total_sent}</p>
                <p className="text-sm text-slate-500 mt-2">Notifications delivered</p>
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
