import React, { useState } from 'react';
import { FileText, Download, Printer, Filter, Calendar } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { useBiometricStore } from '../../store/useBiometricStore';
import { exportToCSV } from '../../lib/utils';
import { toast } from 'sonner';

export const ReportsPage: React.FC = () => {
  const { attendance } = useBiometricStore();
  const [reportType, setReportType] = useState('daily');

  const handleExportCSV = () => {
    exportToCSV(`biometric_${reportType}_report`, attendance);
    toast.success(`Exported ${reportType} attendance report to CSV!`);
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <FileText className="w-6 h-6 text-primary" /> Executive Report Generator
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Generate printable PDF, Excel, and CSV compliance reports.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button variant="outline" onClick={handlePrint} leftIcon={<Printer className="w-4 h-4" />}>
            Print Report
          </Button>
          <Button variant="primary" onClick={handleExportCSV} leftIcon={<Download className="w-4 h-4" />}>
            Export CSV
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {[
          { id: 'daily', title: 'Daily Attendance Audit', desc: 'Detailed hourly check-in logs' },
          { id: 'late', title: 'Late Arrivals & Penalties', desc: 'Grace period threshold violations' },
          { id: 'unknown', title: 'Unknown Face Incidents', desc: 'Security alerts and unassigned scans' },
          { id: 'camera', title: 'Camera Performance & Uptime', desc: 'RTSP bandwidth and node storage' },
        ].map((rep) => (
          <Card
            key={rep.id}
            glass
            onClick={() => setReportType(rep.id)}
            className={`p-4 cursor-pointer transition-all border ${
              reportType === rep.id
                ? 'border-primary ring-2 ring-primary/20 shadow-md'
                : 'hover:border-slate-300 dark:hover:border-slate-700'
            }`}
          >
            <h4 className="font-bold text-sm text-slate-900 dark:text-white">{rep.title}</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{rep.desc}</p>
          </Card>
        ))}
      </div>

      <Card glass className="p-6">
        <CardHeader className="px-0 pt-0">
          <CardTitle>Report Preview: {reportType.toUpperCase()} Summary</CardTitle>
          <CardDescription>Generated on {new Date().toLocaleDateString()}</CardDescription>
        </CardHeader>
        <CardContent className="px-0 overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead className="bg-slate-100 dark:bg-slate-900/60 font-semibold border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="p-3">Record ID</th>
                <th className="p-3">Member Name</th>
                <th className="p-3">Department</th>
                <th className="p-3">Clock In</th>
                <th className="p-3">Confidence</th>
                <th className="p-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {attendance.map((rec) => (
                <tr key={rec.id}>
                  <td className="p-3 font-mono">{rec.id}</td>
                  <td className="p-3 font-bold">{rec.userName}</td>
                  <td className="p-3">{rec.department}</td>
                  <td className="p-3 font-mono">{rec.clockIn}</td>
                  <td className="p-3 font-mono">{rec.confidenceScore}%</td>
                  <td className="p-3 uppercase font-semibold">{rec.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>
    </div>
  );
};
