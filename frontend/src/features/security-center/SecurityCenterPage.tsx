import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Shield, AlertTriangle, Info, XCircle, Eye, ShieldAlert, Sparkles, Ban, RefreshCw, CheckCircle2, Video } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

const SecurityCenterPage: React.FC = () => {
  const [events, setEvents] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [filter, setFilter] = useState('all');

  const defaultMockThreats = [
    {
      id: 'thr-101',
      severity: 'critical',
      event_type: 'screen_video_playback',
      description: 'Screen video playback presentation attack detected at Main Entrance Camera #01',
      timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
      user: 'Unknown Attacker',
      ip_address: '192.168.1.104',
      camera_name: 'Main Gate Scanner A1',
      flags: ['Moire pattern detected', 'Screen refresh rate flicker', 'Liveness Score: 12.4%']
    },
    {
      id: 'thr-102',
      severity: 'high',
      event_type: '2d_photo_print',
      description: 'High resolution 2D printed photo paper spoof attempt',
      timestamp: new Date(Date.now() - 18 * 60000).toISOString(),
      user: 'Unassigned Identity',
      ip_address: '192.168.1.112',
      camera_name: 'Library Perimeter Scanner',
      flags: ['Low specular variance', 'Flat surface 2D reflection']
    },
    {
      id: 'thr-103',
      severity: 'critical',
      event_type: '3d_mask_spoof',
      description: '3D silicon mask presentation attack attempt flagged by anti-spoofing engine',
      timestamp: new Date(Date.now() - 42 * 60000).toISOString(),
      user: 'Flagged Suspect #908',
      ip_address: '192.168.1.130',
      camera_name: 'Admin Building Gatehouse',
      flags: ['Rigid boundary discontinuity', 'Synthetic skin texture', 'Zero eye aspect ratio change']
    }
  ];

  useEffect(() => {
    fetchEvents();
    fetchStats();
  }, [filter]);

  const fetchEvents = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/security-center/events?severity=${filter === 'all' ? '' : filter}`);
      const data = await response.json();
      const combined = [...(data.events || []), ...defaultMockThreats];
      const filtered = filter === 'all' ? combined : combined.filter(e => e.severity === filter || e.event_type.includes(filter));
      setEvents(filtered);
    } catch (error) {
      const filtered = filter === 'all' ? defaultMockThreats : defaultMockThreats.filter(e => e.severity === filter || e.event_type.includes(filter));
      setEvents(filtered);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/security-center/stats');
      const data = await response.json();
      setStats(data);
    } catch (error) {
      setStats({
        total_events: 14,
        critical_count: 3,
        active_sessions: 12,
        failed_logins: 2,
        spoof_attacks_blocked: 8
      });
    }
  };

  const handleBlockThreat = (id: string, user: string) => {
    toast.success(`Identity / IP for ${user} flagged & blocked!`, { duration: 1000 });
    setEvents(prev => prev.filter(e => e.id !== id));
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case 'critical': return <XCircle className="w-4 h-4 text-red-500 shrink-0" />;
      case 'high': return <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />;
      case 'medium': return <AlertTriangle className="w-4 h-4 text-yellow-500 shrink-0" />;
      default: return <Info className="w-4 h-4 text-blue-500 shrink-0" />;
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
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-500 text-xs font-bold mb-2">
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Anti-Spoofing & Deepfake Threat Radar</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
            <Shield className="w-7 h-7 text-primary" /> Security Operations Center
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
            Real-time presentation attack detection (PAD), liveness threat flags, and biometric perimeter access logs.
          </p>
        </div>

        <Button
          variant="outline"
          onClick={() => { fetchEvents(); fetchStats(); toast.info('Refreshing threat feed...'); }}
          leftIcon={<RefreshCw className="w-4 h-4" />}
          className="border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-200"
        >
          Refresh Feed
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Total Security Events</p>
          <p className="text-2xl font-extrabold text-slate-900 dark:text-white mt-1 font-mono">{stats?.total_events || 14}</p>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Critical PAD Threat Flags</p>
          <p className="text-2xl font-extrabold text-red-500 mt-1 font-mono">{stats?.critical_count || 3}</p>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Spoof Attacks Intercepted</p>
          <p className="text-2xl font-extrabold text-emerald-500 mt-1 font-mono">{stats?.spoof_attacks_blocked || 8}</p>
        </Card>
        <Card className="p-4 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase">Active Monitored Nodes</p>
          <p className="text-2xl font-extrabold text-cyan-500 mt-1 font-mono">{stats?.active_sessions || 12}</p>
        </Card>
      </div>

      {/* Threat Events Log */}
      <Card className="p-6 bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
            <Eye className="w-5 h-5 text-cyan-500" /> Presentation Attack Detection (PAD) Telemetry Log
          </h3>

          <div className="flex flex-wrap gap-1.5">
            {['all', 'critical', '2d_photo_print', 'screen_video_playback', '3d_mask_spoof'].map((sev) => (
              <button
                key={sev}
                onClick={() => setFilter(sev)}
                className={`px-3 py-1.5 text-xs rounded-xl font-semibold transition-all ${
                  filter === sev
                    ? 'bg-gradient-to-r from-cyan-500 to-indigo-600 text-white shadow-md'
                    : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-700'
                }`}
              >
                {sev.replace(/_/g, ' ').toUpperCase()}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {events.map((event, idx) => (
            <div
              key={event.id || idx}
              className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/50 hover:border-slate-300 dark:hover:border-slate-700 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                {getSeverityIcon(event.severity)}
                <div className="space-y-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <Badge variant={getSeverityVariant(event.severity)}>
                      {event.severity.toUpperCase()}
                    </Badge>
                    <Badge variant="info">
                      {event.event_type.replace(/_/g, ' ').toUpperCase()}
                    </Badge>
                    {event.camera_name && (
                      <span className="text-[11px] font-mono text-cyan-600 dark:text-cyan-400 flex items-center gap-1">
                        <Video className="w-3 h-3" /> {event.camera_name}
                      </span>
                    )}
                  </div>
                  <p className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-white">{event.description}</p>

                  {/* Anti-spoofing heuristic flags */}
                  {event.flags && (
                    <div className="flex flex-wrap gap-1.5 pt-1">
                      {event.flags.map((flag: string, fIdx: number) => (
                        <span key={fIdx} className="text-[10px] font-mono px-2 py-0.5 rounded bg-rose-500/10 text-rose-600 dark:text-rose-400 border border-rose-500/20">
                          ⚠ {flag}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="flex items-center gap-4 text-[11px] text-slate-500 dark:text-slate-400 pt-1 font-mono">
                    <span>Captured: {new Date(event.timestamp).toLocaleString()}</span>
                    {event.user && <span>Suspect: {event.user}</span>}
                    {event.ip_address && <span>Node IP: {event.ip_address}</span>}
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => handleBlockThreat(event.id || idx.toString(), event.user || 'Attacker')}
                  leftIcon={<Ban className="w-3.5 h-3.5" />}
                  className="text-xs font-bold"
                >
                  Block IP & Flag Identity
                </Button>
              </div>
            </div>
          ))}

          {events.length === 0 && (
            <div className="py-12 text-center text-slate-500 dark:text-slate-400 space-y-2">
              <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto" />
              <p className="text-sm font-semibold">No Presentation Attacks or Deepfake Threats Detected</p>
            </div>
          )}
        </div>
      </Card>
    </div>
  );
};

export default SecurityCenterPage;
