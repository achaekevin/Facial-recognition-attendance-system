import React, { useState, useEffect } from 'react';
import { Brain, TrendingUp, TrendingDown, AlertTriangle, Users, Calendar, Target, Sparkles, CheckCircle, XCircle, Clock } from 'lucide-react';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { toast } from 'sonner';

interface OverallMetrics {
  total_records: number;
  overall_attendance_rate: number;
  late_rate: number;
  absent_rate: number;
  critical_risk_users: number;
  high_risk_users: number;
  total_users_tracked: number;
  health_status: string;
}

interface DepartmentTrend {
  department: string;
  total_records: number;
  attendance_rate: number;
  late_rate: number;
  absent_rate: number;
  performance: string;
}

interface AtRiskUser {
  user_id: string;
  user_name: string;
  department: string;
  risk_level: string;
  attendance_rate: number;
  absent_days: number;
  late_days: number;
  trend: string;
  prediction: string;
}

interface LateArrival {
  user_id: string;
  user_name: string;
  department: string;
  late_count: number;
  total_days: number;
  late_rate: number;
  risk_level: string;
}

interface WeeklyForecast {
  [day: string]: {
    expected_rate: number;
    confidence: string;
    sample_size: number;
  };
}

export const AIInsightsPage: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [overallMetrics, setOverallMetrics] = useState<OverallMetrics | null>(null);
  const [departmentTrends, setDepartmentTrends] = useState<DepartmentTrend[]>([]);
  const [atRiskUsers, setAtRiskUsers] = useState<AtRiskUser[]>([]);
  const [lateArrivals, setLateArrivals] = useState<LateArrival[]>([]);
  const [weeklyForecast, setWeeklyForecast] = useState<WeeklyForecast | null>(null);
  const [selectedView, setSelectedView] = useState<'overview' | 'at-risk' | 'late' | 'forecast'>('overview');

  useEffect(() => {
    loadAIInsights();
  }, []);

  const loadAIInsights = async () => {
    setLoading(true);
    try {
      // Mock data for now - replace with actual API calls
      // In production: const response = await fetch('/api/v1/ai-insights/overview');
      
      setTimeout(() => {
        setOverallMetrics({
          total_records: 1250,
          overall_attendance_rate: 87.5,
          late_rate: 8.2,
          absent_rate: 4.3,
          critical_risk_users: 3,
          high_risk_users: 8,
          total_users_tracked: 145,
          health_status: 'good'
        });

        setDepartmentTrends([
          { department: 'Engineering', total_records: 450, attendance_rate: 92.3, late_rate: 5.1, absent_rate: 2.6, performance: 'excellent' },
          { department: 'Sales', total_records: 320, attendance_rate: 85.4, late_rate: 9.2, absent_rate: 5.4, performance: 'good' },
          { department: 'HR', total_records: 180, attendance_rate: 88.9, late_rate: 7.8, absent_rate: 3.3, performance: 'good' },
          { department: 'Finance', total_records: 200, attendance_rate: 79.5, late_rate: 12.5, absent_rate: 8.0, performance: 'needs_improvement' },
          { department: 'Operations', total_records: 100, attendance_rate: 91.0, late_rate: 6.0, absent_rate: 3.0, performance: 'excellent' }
        ]);

        setAtRiskUsers([
          { user_id: '1', user_name: 'John Doe', department: 'Finance', risk_level: 'critical', attendance_rate: 65.5, absent_days: 10, late_days: 5, trend: 'declining', prediction: 'likely_absent' },
          { user_id: '2', user_name: 'Jane Smith', department: 'Sales', risk_level: 'high', attendance_rate: 78.2, absent_days: 6, late_days: 4, trend: 'stable', prediction: 'at_risk' },
          { user_id: '3', user_name: 'Mike Johnson', department: 'Engineering', risk_level: 'high', attendance_rate: 81.0, absent_days: 5, late_days: 3, trend: 'declining', prediction: 'at_risk' }
        ]);

        setLateArrivals([
          { user_id: '4', user_name: 'Sarah Williams', department: 'Sales', late_count: 12, total_days: 30, late_rate: 40.0, risk_level: 'high' },
          { user_id: '5', user_name: 'Robert Brown', department: 'Operations', late_count: 8, total_days: 28, late_rate: 28.6, risk_level: 'medium' },
          { user_id: '6', user_name: 'Emily Davis', department: 'HR', late_count: 7, total_days: 30, late_rate: 23.3, risk_level: 'medium' }
        ]);

        setWeeklyForecast({
          Monday: { expected_rate: 89.5, confidence: 'high', sample_size: 12 },
          Tuesday: { expected_rate: 91.2, confidence: 'high', sample_size: 12 },
          Wednesday: { expected_rate: 88.7, confidence: 'high', sample_size: 12 },
          Thursday: { expected_rate: 87.3, confidence: 'high', sample_size: 12 },
          Friday: { expected_rate: 83.5, confidence: 'medium', sample_size: 11 },
          Saturday: { expected_rate: 75.0, confidence: 'low', sample_size: 4 },
          Sunday: { expected_rate: 70.0, confidence: 'low', sample_size: 2 }
        });

        setLoading(false);
        toast.success('AI insights loaded successfully');
      }, 1000);
    } catch (error) {
      console.error('Error loading AI insights:', error);
      toast.error('Failed to load AI insights');
      setLoading(false);
    }
  };

  const getHealthStatusColor = (status: string) => {
    switch (status) {
      case 'excellent': return 'text-green-600 bg-green-50 dark:bg-green-900/20';
      case 'good': return 'text-blue-600 bg-blue-50 dark:bg-blue-900/20';
      case 'needs_attention': return 'text-yellow-600 bg-yellow-50 dark:bg-yellow-900/20';
      case 'critical': return 'text-red-600 bg-red-50 dark:bg-red-900/20';
      default: return 'text-slate-600 bg-slate-50 dark:bg-slate-900/20';
    }
  };

  const getRiskBadgeVariant = (risk: string): 'success' | 'warning' | 'error' | 'secondary' => {
    switch (risk) {
      case 'critical': return 'error';
      case 'high': return 'warning';
      case 'medium': return 'secondary';
      default: return 'success';
    }
  };

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'improving': return <TrendingUp className="w-4 h-4 text-green-600" />;
      case 'declining': return <TrendingDown className="w-4 h-4 text-red-600" />;
      default: return <Target className="w-4 h-4 text-blue-600" />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="text-center">
          <Sparkles className="w-12 h-12 text-primary animate-pulse mx-auto mb-4" />
          <p className="text-slate-600 dark:text-slate-400">Loading AI insights...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Brain className="w-6 h-6 text-primary" /> AI Attendance Insights
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Predictive analytics, risk assessment, and intelligent recommendations powered by AI
          </p>
        </div>
        <Button variant="primary" onClick={loadAIInsights} leftIcon={<Sparkles className="w-4 h-4" />}>
          Refresh Insights
        </Button>
      </div>

      {/* View Selector */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        <Button
          variant={selectedView === 'overview' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('overview')}
        >
          Overview
        </Button>
        <Button
          variant={selectedView === 'at-risk' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('at-risk')}
          leftIcon={<AlertTriangle className="w-4 h-4" />}
        >
          At-Risk Users ({atRiskUsers.length})
        </Button>
        <Button
          variant={selectedView === 'late' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('late')}
          leftIcon={<Clock className="w-4 h-4" />}
        >
          Late Arrivals ({lateArrivals.length})
        </Button>
        <Button
          variant={selectedView === 'forecast' ? 'primary' : 'outline'}
          size="sm"
          onClick={() => setSelectedView('forecast')}
          leftIcon={<Calendar className="w-4 h-4" />}
        >
          Weekly Forecast
        </Button>
      </div>

      {/* Overview Metrics */}
      {selectedView === 'overview' && overallMetrics && (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <Card glass className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Overall Attendance</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {overallMetrics.overall_attendance_rate}%
                  </p>
                </div>
                <div className={`p-3 rounded-xl ${getHealthStatusColor(overallMetrics.health_status)}`}>
                  <CheckCircle className="w-6 h-6" />
                </div>
              </div>
              <div className="mt-3">
                <Badge variant="success" className="text-xs">{overallMetrics.health_status.toUpperCase()}</Badge>
              </div>
            </Card>

            <Card glass className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Critical Risk</p>
                  <p className="text-2xl font-bold text-red-600 dark:text-red-400 mt-1">
                    {overallMetrics.critical_risk_users}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-red-50 dark:bg-red-900/20 text-red-600">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                Requires immediate intervention
              </p>
            </Card>

            <Card glass className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">High Risk</p>
                  <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400 mt-1">
                    {overallMetrics.high_risk_users}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-yellow-50 dark:bg-yellow-900/20 text-yellow-600">
                  <TrendingDown className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                Early intervention recommended
              </p>
            </Card>

            <Card glass className="p-4">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">Users Tracked</p>
                  <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">
                    {overallMetrics.total_users_tracked}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-900/20 text-blue-600">
                  <Users className="w-6 h-6" />
                </div>
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-3">
                Total records: {overallMetrics.total_records}
              </p>
            </Card>
          </div>

          {/* Department Trends */}
          <Card glass>
            <CardHeader>
              <CardTitle>Department Performance Analysis</CardTitle>
              <CardDescription>Automated trend analysis by department</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {departmentTrends.map((dept, idx) => (
                  <div key={idx} className="flex items-center justify-between p-3 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{dept.department}</p>
                        <Badge variant={
                          dept.performance === 'excellent' ? 'success' :
                          dept.performance === 'good' ? 'primary' :
                          dept.performance === 'needs_improvement' ? 'warning' : 'error'
                        } className="text-xs">
                          {dept.performance.replace('_', ' ').toUpperCase()}
                        </Badge>
                      </div>
                      <div className="flex gap-4 mt-2 text-xs text-slate-500 dark:text-slate-400">
                        <span>Attendance: <strong className="text-slate-900 dark:text-white">{dept.attendance_rate}%</strong></span>
                        <span>Late: <strong className="text-yellow-600">{dept.late_rate}%</strong></span>
                        <span>Absent: <strong className="text-red-600">{dept.absent_rate}%</strong></span>
                      </div>
                    </div>
                    <div className="ml-4">
                      <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full ${
                            dept.attendance_rate > 90 ? 'bg-green-500' :
                            dept.attendance_rate > 80 ? 'bg-blue-500' :
                            dept.attendance_rate > 70 ? 'bg-yellow-500' : 'bg-red-500'
                          }`}
                          style={{ width: `${dept.attendance_rate}%` }}
                        />
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* At-Risk Users View */}
      {selectedView === 'at-risk' && (
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600" />
              Users At Risk of Chronic Absenteeism
            </CardTitle>
            <CardDescription>Automated risk identification for users requiring intervention</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {atRiskUsers.map((user, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{user.user_name}</p>
                        <Badge variant={getRiskBadgeVariant(user.risk_level)} className="text-xs">
                          {user.risk_level.toUpperCase()} RISK
                        </Badge>
                        {getTrendIcon(user.trend)}
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user.department}</p>
                      <div className="flex gap-4 mt-3 text-xs">
                        <span className="text-slate-600 dark:text-slate-400">
                          Attendance: <strong className={user.attendance_rate < 70 ? 'text-red-600' : 'text-slate-900 dark:text-white'}>{user.attendance_rate}%</strong>
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          Absent: <strong className="text-red-600">{user.absent_days} days</strong>
                        </span>
                        <span className="text-slate-600 dark:text-slate-400">
                          Late: <strong className="text-yellow-600">{user.late_days} days</strong>
                        </span>
                      </div>
                    </div>
                    <Button variant="outline" size="sm">
                      View Details
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Late Arrivals View */}
      {selectedView === 'late' && (
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              Chronic Late Arrivals
            </CardTitle>
            <CardDescription>Users with frequent punctuality issues</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {lateArrivals.map((user, idx) => (
                <div key={idx} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3">
                        <p className="font-semibold text-slate-900 dark:text-white">{user.user_name}</p>
                        <Badge variant={getRiskBadgeVariant(user.risk_level)} className="text-xs">
                          {user.late_rate}% LATE RATE
                        </Badge>
                      </div>
                      <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{user.department}</p>
                      <p className="text-xs text-slate-600 dark:text-slate-400 mt-2">
                        <strong>{user.late_count}</strong> late arrivals out of <strong>{user.total_days}</strong> days tracked
                      </p>
                    </div>
                    <Button variant="outline" size="sm">
                      View Pattern
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weekly Forecast View */}
      {selectedView === 'forecast' && weeklyForecast && (
        <Card glass>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-primary" />
              Weekly Attendance Forecast
            </CardTitle>
            <CardDescription>Predictive attendance rates for the upcoming week</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(weeklyForecast).map(([day, forecast]) => (
                <div key={day} className="p-4 bg-slate-50 dark:bg-slate-900/40 rounded-lg">
                  <p className="text-sm font-semibold text-slate-900 dark:text-white">{day}</p>
                  <p className="text-2xl font-bold text-primary mt-2">{forecast.expected_rate}%</p>
                  <div className="flex items-center gap-2 mt-2">
                    <Badge
                      variant={
                        forecast.confidence === 'high' ? 'success' :
                        forecast.confidence === 'medium' ? 'warning' : 'secondary'
                      }
                      className="text-xs"
                    >
                      {forecast.confidence} confidence
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-2">
                    Based on {forecast.sample_size} weeks of data
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};
