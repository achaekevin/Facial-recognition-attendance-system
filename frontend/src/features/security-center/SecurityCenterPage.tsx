import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Shield, AlertTriangle, Info, XCircle } from 'lucide-react';

const SecurityCenterPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/security-center/events?severity=${filter === 'all' ? '' : filter}`);
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/security-center/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <Info className="w-4 h-4 text-blue-500" />;
    }
  };

  const getSeverityVariant = (severity: string): any => {
    switch (severity) {
      case 'critical': return 'danger';
      case 'high': return 'warning';
      case 'medium': return 'warning';
      default: return 'info';
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Shield className="w-6 h-6 text-primary" /> Security Center
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Monitor security events and system access
        </p>
      </div>

      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Total Events</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.total_events}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Critical</p>
            <p className="text-2xl font-bold text-red-600 mt-1">{stats.critical_count}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Active Sessions</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{stats.active_sessions}</p>
          </Card>
          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Failed Logins</p>
            <p className="text-2xl font-bold text-orange-600 mt-1">{stats.failed_logins}</p>
          </Card>
        </div>
      )}

      <Card>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900 dark:text-white">Security Events</h3>
          <div className="flex gap-2">
            {['all', 'critical', 'high', 'medium', 'low'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilter(sev)}
                className={`px-3 py-1 text-xs rounded-lg font-medium transition-colors ${
                  filter === sev
                    ? 'bg-primary text-white'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sev.charAt(0).toUpperCase() + sev.slice(1)}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {events.map((event, idx) => (
            <div
              key={idx}
              className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-900"
            >
              {getSeverityIcon(event.severity)}
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant={getSeverityVariant(event.severity)}>
                    {event.severity}
                  </Badge>
                  <Badge variant="info">{event.event_type}</Badge>
                </div>
                <p className="text-sm text-slate-900 dark:text-white">{event.description}</p>
                <div className="flex items-center gap-3 mt-2 text-xs text-slate-500 dark:text-slate-400">
                  <span>{new Date(event.timestamp).toLocaleString()}</span>
                  {event.user && <span>User: {event.user}</span>}
                  {event.ip_address && <span>IP: {event.ip_address}</span>}
                </div>
              </div>
            </div>
          ))}
          {events.length === 0 && (
            <p className="py-8 text-center text-slate-500 dark:text-slate-400">
              No security events found
            </p>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SecurityCenterPage;
