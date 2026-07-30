import React, { useState, useEffect } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Modal } from '../../components/ui/Modal';
import { QrCode, CheckCircle, Clock } from 'lucide-react';
import { toast } from 'sonner';

const QRBackupPage: React.FC = () => {
  const [qrCode, setQrCode] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [showQRDialog, setShowQRDialog] = useState(false);
  const [userId, setUserId] = useState('');
  const [reason, setReason] = useState('');

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/qr-backup/history');
      const data = await response.json();
      setHistory(data.history || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleGenerate = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/qr-backup/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ user_id: userId, reason })
      });
      const data = await response.json();
      setQrCode(data);
      setShowQRDialog(true);
      toast.success('QR code generated (valid for 5 minutes)');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate QR code');
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <QrCode className="w-6 h-6 text-primary" /> QR Code Backup
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Fallback attendance method when facial recognition isn't available
        </p>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Generate QR Code</h3>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              User ID / Employee ID
            </label>
            <input
              type="text"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              placeholder="emp-001"
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Reason for Backup
            </label>
            <select
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            >
              <option value="">Select reason...</option>
              <option value="camera_offline">Camera Offline</option>
              <option value="face_covered">Face Covered (PPE/Mask)</option>
              <option value="recognition_failed">Recognition Failed</option>
              <option value="emergency">Emergency Override</option>
              <option value="other">Other</option>
            </select>
          </div>

          <Button variant="primary" onClick={handleGenerate} disabled={!userId || !reason}>
            Generate QR Code
          </Button>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">QR Backup History</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">User</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Reason</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Timestamp</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
              </tr>
            </thead>
            <tbody>
              {history.map((entry, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 px-4 text-slate-900 dark:text-white">{entry.user_name || entry.user_id}</td>
                  <td className="py-3 px-4">
                    <Badge variant="warning">{entry.reason}</Badge>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {new Date(entry.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <Badge variant={entry.used ? 'success' : 'info'}>
                      {entry.used ? 'Used' : 'Generated'}
                    </Badge>
                  </td>
                </tr>
              ))}
              {history.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-slate-500 dark:text-slate-400">
                    No QR backup history yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal
        isOpen={showQRDialog}
        onClose={() => setShowQRDialog(false)}
        title="QR Code Generated"
        description="Valid for 5 minutes"
      >
        {qrCode && (
          <div className="space-y-4">
            <div className="flex justify-center p-6 bg-white rounded-lg">
              <img src={qrCode.qr_image} alt="QR Code" className="w-64 h-64" />
            </div>
            <div className="flex items-center gap-2 text-sm text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 p-3 rounded-lg">
              <Clock className="w-4 h-4" />
              <span>This QR code expires at {new Date(qrCode.expires_at).toLocaleTimeString()}</span>
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              <p><strong>Code ID:</strong> {qrCode.code_id}</p>
              <p><strong>User:</strong> {qrCode.user_id}</p>
              <p><strong>Reason:</strong> {qrCode.reason}</p>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
};

export default QRBackupPage;
