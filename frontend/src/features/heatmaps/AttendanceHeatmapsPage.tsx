import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardTitle, CardContent } from '../../components/ui/Card';
import { Badge } from '../../components/ui/Badge';
import { Button } from '../../components/ui/Button';
import { 
  TrendingUp, Clock, MapPin, Users, Calendar, 
  Building2, Flame, BarChart3, Filter
} from 'lucide-react';
import { toast } from 'sonner';

interface HourlyData {
  hour: string;
  value: number;
  intensity: number;
}

interface EntranceData {
  camera_id: string;
  camera_name: string;
  location: string;
  count: number;
  intensity: number;
  percentage: number;
}

interface DayData {
  day: string;
  day_number: number;
  value: number;
  intensity: number;
}

interface DepartmentData {
  department_id: string;
  department_name: string;
  attendance_count: number;
  active_users: number;
  avg_confidence: number;
  intensity: number;
  engagement_rate: number;
}

export const AttendanceHeatmapsPage: React.FC = () => {
  const [peakHours, setPeakHours] = useState<HourlyData[]>([]);
  const [entrances, setEntrances] = useState<EntranceData[]>([]);
  const [weeklyData, setWeeklyData] = useState<DayData[]>([]);
  const [departments, setDepartments] = useState<DepartmentData[]>([]);
  const [selectedPeriod, setSelectedPeriod] = useState<number>(7);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchHeatmapData();
  }, [selectedPeriod]);

  const fetchHeatmapData = async () => {
    setLoading(true);
    try {
      // Fetch all heatmap data
      const [peakResponse, entrancesResponse, weeklyResponse, deptResponse] = await Promise.all([
        fetch(`/api/v1/heatmaps/peak-arrival-times?days=${selectedPeriod}`),
        fetch(`/api/v1/heatmaps/busiest-entrances?days=${selectedPeriod}`),
        fetch(`/api/v1/heatmaps/attendance-by-day?weeks=${Math.ceil(selectedPeriod / 7)}`),
        fetch(`/api/v1/heatmaps/department-activity?days=${selectedPeriod}`)
      ]);

      const [peakData, entrancesData, weeklyData, deptData] = await Promise.all([
        peakResponse.json(),
        entrancesResponse.json(),
        weeklyResponse.json(),
        deptResponse.json()
      ]);

      setPeakHours(peakData.heatmap || []);
      setEntrances(entrancesData.entrances || []);
      setWeeklyData(weeklyData.heatmap || []);
      setDepartments(deptData.departments || []);
    } catch (error) {
      console.error('Error fetching heatmap data:', error);
      toast.error('Failed to load heatmap data');
    } finally {
      setLoading(false);
    }
  };

  const getHeatColor = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-red-600';
    if (intensity >= 0.6) return 'bg-orange-500';
    if (intensity >= 0.4) return 'bg-yellow-500';
    if (intensity >= 0.2) return 'bg-green-500';
    return 'bg-blue-400';
  };

  const getHeatColorLight = (intensity: number) => {
    if (intensity >= 0.8) return 'bg-red-100 border-red-300 text-red-900';
    if (intensity >= 0.6) return 'bg-orange-100 border-orange-300 text-orange-900';
    if (intensity >= 0.4) return 'bg-yellow-100 border-yellow-300 text-yellow-900';
    if (intensity >= 0.2) return 'bg-green-100 border-green-300 text-green-900';
    return 'bg-blue-100 border-blue-300 text-blue-900';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            <Flame className="w-6 h-6 text-orange-500" />
            Attendance Heatmaps
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Visual analytics of attendance patterns, peak times, and activity trends
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-slate-500" />
          <span className="text-sm text-slate-700 dark:text-slate-300">Period:</span>
          <select
            value={selectedPeriod}
            onChange={(e) => setSelectedPeriod(Number(e.target.value))}
            className="px-3 py-1.5 text-sm bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-lg"
          >
            <option value={7}>Last 7 Days</option>
            <option value={14}>Last 14 Days</option>
            <option value={30}>Last 30 Days</option>
            <option value={90}>Last 90 Days</option>
          </select>
        </div>
      </div>

      {/* Peak Arrival Times Heatmap */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-primary" />
            Peak Arrival Times
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-12 md:grid-cols-24 gap-1">
            {peakHours.map((hour) => (
              <div
                key={hour.hour}
                className="group relative"
                title={`${hour.hour}: ${hour.value} arrivals`}
              >
                <div
                  className={`aspect-square rounded ${getHeatColor(hour.intensity)} transition-transform hover:scale-110 cursor-pointer`}
                >
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-[8px] font-bold text-white opacity-0 group-hover:opacity-100">
                      {hour.value}
                    </span>
                  </div>
                </div>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                  <div className="bg-slate-900 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                    {hour.hour}
                    <br />
                    {hour.value} arrivals
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Hour Labels */}
          <div className="grid grid-cols-12 md:grid-cols-24 gap-1 mt-2">
            {peakHours.filter((_, i) => i % 2 === 0).map((hour) => (
              <div key={`label-${hour.hour}`} className="col-span-2 text-center">
                <span className="text-[10px] text-slate-500">{hour.hour}</span>
              </div>
            ))}
          </div>

          {/* Legend */}
          <div className="flex items-center justify-center gap-4 mt-6 text-xs">
            <span className="text-slate-600 dark:text-slate-400">Low</span>
            <div className="flex gap-1">
              {[0.1, 0.3, 0.5, 0.7, 0.9].map((intensity) => (
                <div
                  key={intensity}
                  className={`w-6 h-6 rounded ${getHeatColor(intensity)}`}
                />
              ))}
            </div>
            <span className="text-slate-600 dark:text-slate-400">High</span>
          </div>
        </CardContent>
      </Card>

      {/* Busiest Entrances */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5 text-primary" />
            Busiest Entrances
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {entrances.map((entrance, idx) => (
              <div key={entrance.camera_id} className="space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Badge variant="secondary" className="text-xs">
                      #{idx + 1}
                    </Badge>
                    <div>
                      <p className="font-semibold text-slate-900 dark:text-white">
                        {entrance.camera_name}
                      </p>
                      <p className="text-xs text-slate-500">{entrance.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{entrance.count}</p>
                    <p className="text-xs text-slate-500">{entrance.percentage.toFixed(1)}%</p>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-800 rounded-full h-2 overflow-hidden">
                  <div
                    className={`h-full ${getHeatColor(entrance.intensity)} transition-all duration-500`}
                    style={{ width: `${entrance.intensity * 100}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Pattern */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Weekly Attendance Pattern
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-7 gap-3">
            {weeklyData.map((day) => (
              <div key={day.day} className="text-center">
                <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 mb-2">
                  {day.day}
                </p>
                <div
                  className={`aspect-square rounded-xl border-2 flex flex-col items-center justify-center cursor-pointer transition-transform hover:scale-105 ${getHeatColorLight(day.intensity)}`}
                  title={`${day.value} attendances`}
                >
                  <p className="text-2xl font-bold">{day.value}</p>
                  <p className="text-xs opacity-70">attendances</p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Department Activity */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Building2 className="w-5 h-5 text-primary" />
            Department Activity Heatmap
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {departments.map((dept) => (
              <div
                key={dept.department_id}
                className={`p-4 rounded-xl border-2 transition-transform hover:scale-105 cursor-pointer ${getHeatColorLight(dept.intensity)}`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1 min-w-0">
                    <h3 className="font-bold text-lg truncate">{dept.department_name}</h3>
                    <p className="text-xs opacity-70">Activity Level</p>
                  </div>
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${getHeatColor(dept.intensity)}`}>
                    <Users className="w-6 h-6 text-white" />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <p className="text-xs opacity-70">Total Attendance</p>
                    <p className="text-xl font-bold">{dept.attendance_count}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Active Users</p>
                    <p className="text-xl font-bold">{dept.active_users}</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Avg Confidence</p>
                    <p className="text-lg font-bold">{dept.avg_confidence}%</p>
                  </div>
                  <div>
                    <p className="text-xs opacity-70">Engagement</p>
                    <p className="text-lg font-bold">{dept.engagement_rate}%</p>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {departments.length === 0 && !loading && (
            <div className="text-center py-12">
              <Building2 className="w-16 h-16 text-slate-300 mx-auto mb-3" />
              <p className="text-slate-500">No department data available</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Insights Summary */}
      <Card glass>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-primary" />
            Key Insights
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="p-4 bg-gradient-to-br from-blue-50 to-blue-100 dark:from-blue-900/20 dark:to-blue-800/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Clock className="w-5 h-5 text-blue-600" />
                <p className="text-sm font-semibold text-blue-900 dark:text-blue-300">Peak Hour</p>
              </div>
              <p className="text-3xl font-bold text-blue-600">
                {peakHours.length > 0 
                  ? peakHours.reduce((max, h) => h.value > max.value ? h : max, peakHours[0]).hour
                  : '--:--'
                }
              </p>
              <p className="text-xs text-blue-700 dark:text-blue-400 mt-1">
                Busiest arrival time
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-green-50 to-green-100 dark:from-green-900/20 dark:to-green-800/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <MapPin className="w-5 h-5 text-green-600" />
                <p className="text-sm font-semibold text-green-900 dark:text-green-300">Top Entrance</p>
              </div>
              <p className="text-xl font-bold text-green-600 truncate">
                {entrances.length > 0 ? entrances[0].camera_name : 'N/A'}
              </p>
              <p className="text-xs text-green-700 dark:text-green-400 mt-1">
                {entrances.length > 0 ? `${entrances[0].count} entries` : 'No data'}
              </p>
            </div>

            <div className="p-4 bg-gradient-to-br from-purple-50 to-purple-100 dark:from-purple-900/20 dark:to-purple-800/20 rounded-xl">
              <div className="flex items-center gap-2 mb-2">
                <Building2 className="w-5 h-5 text-purple-600" />
                <p className="text-sm font-semibold text-purple-900 dark:text-purple-300">Most Active</p>
              </div>
              <p className="text-xl font-bold text-purple-600 truncate">
                {departments.length > 0 ? departments[0].department_name : 'N/A'}
              </p>
              <p className="text-xs text-purple-700 dark:text-purple-400 mt-1">
                {departments.length > 0 ? `${departments[0].attendance_count} records` : 'No data'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      {loading && (
        <div className="fixed inset-0 bg-black/20 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-xl shadow-2xl">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-3" />
            <p className="text-sm text-slate-600 dark:text-slate-400">Loading heatmaps...</p>
          </div>
        </div>
      )}
    </div>
  );
};
