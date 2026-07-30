import React from 'react';
import { BarChart3, TrendingUp, ScanFace, Clock, Camera } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { StatsCard } from '../../components/data-display/StatsCard';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  LineChart, 
  Line 
} from 'recharts';

const hourlyArrivalData = [
  { time: '07:00', count: 42 },
  { time: '08:00', count: 184 },
  { time: '09:00', count: 290 },
  { time: '10:00', count: 110 },
  { time: '11:00', count: 45 },
  { time: '12:00', count: 88 },
  { time: '13:00', count: 125 },
  { time: '14:00', count: 60 },
];

const accuracyTrendData = [
  { month: 'Jan', score: 98.4 },
  { month: 'Feb', score: 98.8 },
  { month: 'Mar', score: 99.1 },
  { month: 'Apr', score: 99.3 },
  { month: 'May', score: 99.4 },
];

export const AnalyticsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          <BarChart3 className="w-6 h-6 text-primary" /> Biometric Analytics & Intelligence
        </h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
          Deep telemetry metrics, peak hour arrival heatmaps, and facial match accuracy performance trends.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatsCard title="Peak Check-in Hour" value="09:00 AM" subtitle="290 scans/hour" icon={<Clock className="w-6 h-6" />} />
        <StatsCard title="Avg Match Accuracy" value="99.4%" subtitle="+0.6% YTD" icon={<ScanFace className="w-6 h-6" />} />
        <StatsCard title="Camera Uptime" value="98.2%" subtitle="Node network reliability" icon={<Camera className="w-6 h-6" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card glass>
          <CardHeader>
            <CardTitle>Hourly Peak Arrival Heatmap</CardTitle>
            <CardDescription>Volume of face scans processed per hour</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={hourlyArrivalData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="time" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-emerald-500" /> Match Accuracy Curve
            </CardTitle>
            <CardDescription>Monthly model vector confidence progression</CardDescription>
          </CardHeader>
          <CardContent className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={accuracyTrendData}>
                <CartesianGrid strokeDasharray="3 3" opacity={0.1} />
                <XAxis dataKey="month" />
                <YAxis domain={[95, 100]} />
                <Tooltip />
                <Line type="monotone" dataKey="score" stroke="#10b981" strokeWidth={3} dot={{ r: 5 }} />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
