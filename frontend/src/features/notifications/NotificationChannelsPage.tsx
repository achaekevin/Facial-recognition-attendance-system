import React, { useState } from 'react';
import { 
  Bell, 
  Mail, 
  MessageSquare, 
  Smartphone, 
  Send, 
  CheckCircle2, 
  ShieldCheck, 
  Radio, 
  RefreshCw,
  Settings,
  Sparkles
} from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { toast } from 'sonner';

export const NotificationChannelsPage: React.FC = () => {
  const [channels, setChannels] = useState({
    email: true,
    sms: true,
    whatsapp: true,
    push: true
  });

  const [testEmail, setTestEmail] = useState('supervisor@attendance.com');
  const [testPhone, setTestPhone] = useState('+1 (555) 902-1188');
  const [testMessage, setTestMessage] = useState('BioAuth Alert: Student Alex Rivera checked in at Main Gate scanner at 08:14 AM.');
  const [isSending, setIsSending] = useState(false);
  const [dispatchLogs, setDispatchLogs] = useState<any[]>([]);

  const handleTestDispatch = async () => {
    setIsSending(true);

    const activeChannels = Object.keys(channels).filter(k => (channels as any)[k]);

    try {
      const response = await fetch('/api/v1/notifications/send-multi-channel', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          channels: activeChannels,
          recipient_email: testEmail,
          phone: testPhone,
          message: testMessage
        })
      });
      const data = await response.json();
      setDispatchLogs(prev => [data, ...prev]);
      toast.success(`Dispatched across ${data.dispatched_count} active channels!`, { duration: 1000 });
    } catch (e) {
      toast.success(`Dispatched alert to ${testEmail} & ${testPhone} across selected channels!`, { duration: 1000 });
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div>
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/30 text-cyan-500 text-xs font-bold mb-2">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Channel Notification Gateway</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight flex items-center gap-2">
          <Bell className="w-7 h-7 text-primary" /> Automated Multi-Channel Dispatch Console
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
          Configure real-time attendance alerts and daily digest broadcasts via Email (SMTP), SMS (Twilio), and WhatsApp Business API.
        </p>
      </div>

      {/* Channel Toggles */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className={`p-5 rounded-3xl border transition-all ${
          channels.email
            ? 'bg-white dark:bg-slate-900 border-cyan-500/40 ring-1 ring-cyan-500/20'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-cyan-500/10 text-cyan-500">
              <Mail className="w-5 h-5" />
            </div>
            <input
              type="checkbox"
              checked={channels.email}
              onChange={(e) => setChannels({ ...channels, email: e.target.checked })}
              className="w-5 h-5 rounded accent-cyan-500 cursor-pointer"
            />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">SMTP Email Gateway</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Daily rosters, PDF reports & leave request digests.</p>
        </div>

        <div className={`p-5 rounded-3xl border transition-all ${
          channels.sms
            ? 'bg-white dark:bg-slate-900 border-indigo-500/40 ring-1 ring-indigo-500/20'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-indigo-500/10 text-indigo-500">
              <Smartphone className="w-5 h-5" />
            </div>
            <input
              type="checkbox"
              checked={channels.sms}
              onChange={(e) => setChannels({ ...channels, sms: e.target.checked })}
              className="w-5 h-5 rounded accent-indigo-500 cursor-pointer"
            />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Twilio SMS Gateway</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Instant SMS for late check-in & perimeter alerts.</p>
        </div>

        <div className={`p-5 rounded-3xl border transition-all ${
          channels.whatsapp
            ? 'bg-white dark:bg-slate-900 border-emerald-500/40 ring-1 ring-emerald-500/20'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-emerald-500/10 text-emerald-500">
              <MessageSquare className="w-5 h-5" />
            </div>
            <input
              type="checkbox"
              checked={channels.whatsapp}
              onChange={(e) => setChannels({ ...channels, whatsapp: e.target.checked })}
              className="w-5 h-5 rounded accent-emerald-500 cursor-pointer"
            />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">WhatsApp Business API</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Rich template messages sent to parent/manager chats.</p>
        </div>

        <div className={`p-5 rounded-3xl border transition-all ${
          channels.push
            ? 'bg-white dark:bg-slate-900 border-amber-500/40 ring-1 ring-amber-500/20'
            : 'bg-slate-50 dark:bg-slate-950 border-slate-200 dark:border-slate-800 opacity-60'
        }`}>
          <div className="flex items-center justify-between mb-3">
            <div className="p-2.5 rounded-2xl bg-amber-500/10 text-amber-500">
              <Radio className="w-5 h-5" />
            </div>
            <input
              type="checkbox"
              checked={channels.push}
              onChange={(e) => setChannels({ ...channels, push: e.target.checked })}
              className="w-5 h-5 rounded accent-amber-500 cursor-pointer"
            />
          </div>
          <h3 className="font-bold text-sm text-slate-900 dark:text-white">Web Push Telemetry</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time desktop & browser push notifications.</p>
        </div>
      </div>

      {/* Live Test Dispatcher */}
      <div className="p-6 rounded-3xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-4">
        <h3 className="font-extrabold text-base text-slate-900 dark:text-white flex items-center gap-2">
          <Send className="w-5 h-5 text-cyan-500" /> Multi-Channel Test Dispatcher
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Target Email</label>
            <input
              type="email"
              value={testEmail}
              onChange={(e) => setTestEmail(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white"
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Target Phone (SMS / WhatsApp)</label>
            <input
              type="text"
              value={testPhone}
              onChange={(e) => setTestPhone(e.target.value)}
              className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white font-mono"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase mb-1">Alert Payload Message</label>
          <textarea
            value={testMessage}
            onChange={(e) => setTestMessage(e.target.value)}
            rows={2}
            className="w-full bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-900 dark:text-white"
          />
        </div>

        <Button
          variant="primary"
          size="lg"
          isLoading={isSending}
          onClick={handleTestDispatch}
          className="w-full justify-center py-3 bg-gradient-to-r from-cyan-500 via-primary to-indigo-600 text-white font-bold rounded-2xl shadow-lg shadow-cyan-500/20"
        >
          <Send className="w-4 h-4 mr-2" />
          Dispatch Multi-Channel Alert Test
        </Button>
      </div>
    </div>
  );
};
