import React, { useState, useEffect } from 'react';
import { Badge } from '../../components/ui/Badge';
import { Card } from '../../components/ui/Card';
import { Activity, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

const SystemHealthPage: React.FC = () => {
  const [metrics, setMetrics] = useState<any>(null);
  const [components, setComponents] = useState<any[]>([]);

  useEffect(() => {
    fetchMetrics();
    fetchComponents();
    const interval = setInterval(() => {
      fetchMetrics();
      fetchComponents();
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const fetchMetrics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/system-health/metrics');
      const data = await response.json();
      setMetrics(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchComponents = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/system-health/components');
      const data = await response.json();
      setComponents(data.components || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'healthy': return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'degraded': return <AlertTriangle className="w-4 h-4 text-yellow-500" />;
      default: return <XCircle className="w-4 h-4 text-red-500" />;
    }
  };

  const getStatusVariant = (status: string): any => {
    switch (status) {
      case 'healthy': return 'success';
      case 'degraded': return 'warning';
      default: return 'danger';
    }
  };

  const getUsageColor = (value: number) => {
    if (value >= 90) return 'bg-red-500';
    if (value >= 70) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <Activity className="w-6 h-6 text-primary" /> System Health Dashboard
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Real-time system performance monitoring
        </p>
      </div>

      {metrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">CPU Usage</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{metrics.cpu_percent}%</p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getUsageColor(metrics.cpu_percent)}`}
                  style={{ width: `${metrics.cpu_percent}%` }}
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Memory</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{metrics.memory_percent}%</p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getUsageColor(metrics.memory_percent)}`}
                  style={{ width: `${metrics.memory_percent}%` }}
                />
              </div>
            </Card>

            <Card>
              <div className="flex items-center justify-between mb-2">
                <p className="text-xs text-slate-500 dark:text-slate-400 uppercase">Disk</p>
                <p className="text-lg font-bold text-slate-900 dark:text-white">{metrics.disk_percent}%</p>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2">
                <div
                  className={`h-2 rounded-full transition-all ${getUsageColor(metrics.disk_percent)}`}
                  style={{ width: `${metrics.disk_percent}%` }}
                />
              </div>
            </Card>

            <Card>
              <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-2">Network</p>
              <p className="text-sm text-slate-700 dark:text-slate-300">
                <span className="text-green-600 dark:text-green-400">↓ {(metrics.network_io.bytes_recv / 1024 / 1024).toFixed(2)} MB</span>
                {' / '}
                <span className="text-blue-600 dark:text-blue-400">↑ {(metrics.network_io.bytes_sent / 1024 / 1024).toFixed(2)} MB</span>
              </p>
            </Card>
          </div>

          <Card>
            <p className="text-xs text-slate-500 dark:text-slate-400 uppercase mb-2">System Uptime</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">{metrics.uptime}</p>
          </Card>
        </>
      )}

      <Card>
        <h3 className="font-semibold text-slate-900 dark:text-white mb-4">Component Status</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead className="border-b border-slate-200 dark:border-slate-800">
              <tr>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Component</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Status</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Uptime</th>
                <th className="text-left py-3 px-4 font-semibold text-slate-700 dark:text-slate-300">Last Check</th>
              </tr>
            </thead>
            <tbody>
              {components.map((component, idx) => (
                <tr key={idx} className="border-b border-slate-100 dark:border-slate-800">
                  <td className="py-3 px-4 text-slate-900 dark:text-white">{component.name}</td>
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2">
                      {getStatusIcon(component.status)}
                      <Badge variant={getStatusVariant(component.status)}>
                        {component.status}
                      </Badge>
                    </div>
                  </td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">{component.uptime || 'N/A'}</td>
                  <td className="py-3 px-4 text-slate-600 dark:text-slate-400">
                    {new Date(component.last_check).toLocaleString()}
                  </td>
                </tr>
              ))}
              {components.length === 0 && (
                <tr>
                  <td colSpan={4} className="py-8 px-4 text-center text-slate-500 dark:text-slate-400">
                    Loading component status...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
};

export default SystemHealthPage;
