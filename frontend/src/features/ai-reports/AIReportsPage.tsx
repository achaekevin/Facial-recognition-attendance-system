import React, { useState } from 'react';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { FileText, TrendingUp, TrendingDown, Sparkles, Download } from 'lucide-react';
import { toast } from 'sonner';

const AIReportsPage: React.FC = () => {
  const [loading, setLoading] = useState(false);
  const [report, setReport] = useState<any>(null);
  const [reportType, setReportType] = useState('monthly');
  const [targetId, setTargetId] = useState('');

  const reportTypes = [
    { value: 'monthly', label: 'Monthly Overview', description: 'Complete monthly attendance analysis' },
    { value: 'weekly', label: 'Weekly Summary', description: 'Last 7 days attendance recap' },
    { value: 'department', label: 'Department Report', description: 'Department-specific analysis' },
    { value: 'performance', label: 'Performance Analysis', description: 'Employee performance insights' }
  ];

  const handleGenerateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/ai-reports/generate/${reportType}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ target_id: targetId || null })
      });
      const data = await response.json();
      setReport(data);
      toast.success('Report generated successfully');
    } catch (error) {
      console.error('Error:', error);
      toast.error('Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <FileText className="w-6 h-6 text-primary" /> Automated Reports
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Generate narrative reports with contextual insights
        </p>
      </div>

      <Card>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Generate Report</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {reportTypes.map((type) => (
            <button
              key={type.value}
              onClick={() => setReportType(type.value)}
              className={`text-left p-4 rounded-lg border-2 transition-colors ${
                reportType === type.value
                  ? 'border-primary bg-primary/5'
                  : 'border-slate-200 dark:border-slate-800 hover:border-primary/50'
              }`}
            >
              <h4 className="font-semibold text-slate-900 dark:text-white">{type.label}</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{type.description}</p>
            </button>
          ))}
        </div>

        {(reportType === 'department' || reportType === 'performance') && (
          <div className="mb-4">
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              {reportType === 'department' ? 'Department ID' : 'Employee ID'} (Optional)
            </label>
            <input
              type="text"
              value={targetId}
              onChange={(e) => setTargetId(e.target.value)}
              placeholder={reportType === 'department' ? 'dept-001' : 'emp-001'}
              className="w-full px-3.5 py-2 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl"
            />
          </div>
        )}

        <Button
          variant="primary"
          onClick={handleGenerateReport}
          disabled={loading}
          leftIcon={<Sparkles className="w-4 h-4" />}
        >
          {loading ? 'Generating...' : 'Generate Report'}
        </Button>
      </Card>

      {report && (
        <Card>
          <div className="flex items-center justify-between mb-4">
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">{report.title}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">Generated {new Date(report.generated_at).toLocaleString()}</p>
            </div>
            <Button size="sm" variant="outline" leftIcon={<Download className="w-3.5 h-3.5" />}>
              Export
            </Button>
          </div>

          <div className="prose dark:prose-invert max-w-none">
            <p className="text-slate-700 dark:text-slate-300 text-sm leading-relaxed whitespace-pre-wrap">
              {report.narrative}
            </p>
          </div>

          {report.insights && report.insights.length > 0 && (
            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-semibold text-slate-900 dark:text-white">Key Insights</h4>
              <div className="flex flex-wrap gap-2">
                {report.insights.map((insight: string, idx: number) => (
                  <Badge key={idx} variant="info">{insight}</Badge>
                ))}
              </div>
            </div>
          )}

          {report.metrics && (
            <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-3">
              {Object.entries(report.metrics).map(([key, value]: [string, any]) => (
                <div key={key} className="p-3 rounded-lg bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
                  <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">{key.replace(/_/g, ' ')}</p>
                  <p className="text-lg font-bold text-slate-900 dark:text-white mt-1">{value}</p>
                </div>
              ))}
            </div>
          )}
        </Card>
      )}
    </div>
  );
};

export default AIReportsPage;
