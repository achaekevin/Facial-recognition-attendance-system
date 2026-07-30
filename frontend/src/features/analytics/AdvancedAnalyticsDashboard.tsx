import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  CircularProgress,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  LinearProgress,
} from '@mui/material';
import {
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  People as PeopleIcon,
  Camera as CameraIcon,
  AccessTime as TimeIcon,
  CalendarToday as CalendarIcon,
} from '@mui/icons-material';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler,
} from 'chart.js';

ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  ArcElement,
  RadialLinearScale,
  Title,
  Tooltip,
  Legend,
  Filler
);

interface AttendanceRate {
  overall: {
    attendance_rate: number;
    punctuality_rate: number;
    expected: number;
    actual: number;
    present: number;
    late: number;
    absent: number;
  };
  daily_trend: Array<{ date: string; count: number; rate: number }>;
}

interface RecognitionAccuracy {
  overall: {
    average_confidence: number;
    success_rate: number;
    total_recognitions: number;
    high_confidence: number;
    medium_confidence: number;
    low_confidence: number;
    failed_recognitions: number;
  };
  distribution: {
    high: number;
    medium: number;
    low: number;
  };
  confidence_trend: Array<{ date: string; avg_confidence: number; count: number }>;
}

interface DepartmentRanking {
  department_id: string;
  department_name: string;
  attendance_count: number;
  active_users: number;
  total_users: number;
  attendance_rate: number;
  punctuality_rate: number;
  avg_confidence: number;
  rank: number;
}

interface CameraPerformance {
  camera_id: string;
  camera_name: string;
  location: string;
  status: string;
  recognition_count: number;
  avg_confidence: number;
  quality_rate: number;
  uptime: number;
  utilization: string;
}

interface ArrivalTime {
  average_arrival: string;
  peak_hour: string;
  breakdown: {
    early: number;
    on_time: number;
    late: number;
    early_percentage: number;
    on_time_percentage: number;
    late_percentage: number;
  };
}

interface PeakAttendance {
  peak_day: {
    date: string;
    count: number;
    day_name: string;
  };
  peak_weekday: {
    day: string;
    total_count: number;
  };
  weekly_pattern: Record<string, number>;
  monthly_comparison: Array<{ month: string; count: number }>;
}

interface LateTrends {
  total_late_arrivals: number;
  daily_trend: Array<{ date: string; count: number }>;
  trend_direction: string;
  repeat_offenders: Array<{ user_id: string; name: string; late_count: number }>;
  average_daily_late: number;
}

const AdvancedAnalyticsDashboard: React.FC = () => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [attendanceRate, setAttendanceRate] = useState<AttendanceRate | null>(null);
  const [recognitionAccuracy, setRecognitionAccuracy] = useState<RecognitionAccuracy | null>(null);
  const [departmentRankings, setDepartmentRankings] = useState<DepartmentRanking[]>([]);
  const [cameraPerformance, setCameraPerformance] = useState<CameraPerformance[]>([]);
  const [arrivalTime, setArrivalTime] = useState<ArrivalTime | null>(null);
  const [peakAttendance, setPeakAttendance] = useState<PeakAttendance | null>(null);
  const [lateTrends, setLateTrends] = useState<LateTrends | null>(null);

  useEffect(() => {
    fetchAllAnalytics();
  }, [days]);

  const fetchAllAnalytics = async () => {
    setLoading(true);
    try {
      const [
        attendanceRes,
        recognitionRes,
        departmentsRes,
        camerasRes,
        arrivalRes,
        peakRes,
        lateRes,
      ] = await Promise.all([
        fetch(`http://localhost:8000/api/v1/advanced-analytics/attendance-rate?days=${days}`),
        fetch(`http://localhost:8000/api/v1/advanced-analytics/recognition-accuracy?days=${days}`),
        fetch(`http://localhost:8000/api/v1/advanced-analytics/department-rankings?days=${days}`),
        fetch(`http://localhost:8000/api/v1/advanced-analytics/camera-performance?days=${days}`),
        fetch(`http://localhost:8000/api/v1/advanced-analytics/average-arrival-time?days=${days}`),
        fetch(`http://localhost:8000/api/v1/advanced-analytics/peak-attendance?days=${days}`),
        fetch(`http://localhost:8000/api/v1/advanced-analytics/late-trends?days=${days}`),
      ]);

      setAttendanceRate(await attendanceRes.json());
      setRecognitionAccuracy(await recognitionRes.json());
      const deptData = await departmentsRes.json();
      setDepartmentRankings(deptData.rankings || []);
      const camData = await camerasRes.json();
      setCameraPerformance(camData.cameras || []);
      setArrivalTime(await arrivalRes.json());
      setPeakAttendance(await peakRes.json());
      setLateTrends(await lateRes.json());
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderOverviewCards = () => (
    <Grid container spacing={3}>
      {attendanceRate && (
        <>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <PeopleIcon color="primary" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Attendance Rate
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {attendanceRate.overall.attendance_rate.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={attendanceRate.overall.attendance_rate}
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TimeIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Punctuality Rate
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {attendanceRate.overall.punctuality_rate.toFixed(1)}%
                </Typography>
                <LinearProgress
                  variant="determinate"
                  value={attendanceRate.overall.punctuality_rate}
                  color="success"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
      {recognitionAccuracy && (
        <>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <CameraIcon color="info" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Recognition Accuracy
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {recognitionAccuracy.overall.average_confidence.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                  {recognitionAccuracy.overall.total_recognitions} recognitions
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <TrendingUpIcon color="success" sx={{ mr: 1 }} />
                  <Typography variant="body2" color="textSecondary">
                    Success Rate
                  </Typography>
                </Box>
                <Typography variant="h4">
                  {recognitionAccuracy.overall.success_rate.toFixed(1)}%
                </Typography>
                <Typography variant="body2" color="error" sx={{ mt: 1 }}>
                  {recognitionAccuracy.overall.failed_recognitions} failed
                </Typography>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );

  const renderAttendanceTrend = () => {
    if (!attendanceRate) return null;

    const chartData = {
      labels: attendanceRate.daily_trend.map((d) => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Attendance Count',
          data: attendanceRate.daily_trend.map((d) => d.count),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Attendance Rate (%)',
          data: attendanceRate.daily_trend.map((d) => d.rate),
          borderColor: 'rgb(153, 102, 255)',
          backgroundColor: 'rgba(153, 102, 255, 0.1)',
          fill: true,
          tension: 0.4,
          yAxisID: 'y1',
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      interaction: {
        mode: 'index' as const,
        intersect: false,
      },
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Daily Attendance Trend',
        },
      },
      scales: {
        y: {
          type: 'linear' as const,
          display: true,
          position: 'left' as const,
        },
        y1: {
          type: 'linear' as const,
          display: true,
          position: 'right' as const,
          grid: {
            drawOnChartArea: false,
          },
        },
      },
    };

    return (
      <Card>
        <CardContent>
          <Box sx={{ height: 300 }}>
            <Line data={chartData} options={options} />
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderConfidenceDistribution = () => {
    if (!recognitionAccuracy) return null;

    const chartData = {
      labels: ['High (≥90%)', 'Medium (70-90%)', 'Low (<70%)'],
      datasets: [
        {
          data: [
            recognitionAccuracy.distribution.high,
            recognitionAccuracy.distribution.medium,
            recognitionAccuracy.distribution.low,
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(255, 206, 86, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ],
          borderColor: [
            'rgba(75, 192, 192, 1)',
            'rgba(255, 206, 86, 1)',
            'rgba(255, 99, 132, 1)',
          ],
          borderWidth: 1,
        },
      ],
    };

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Confidence Score Distribution
          </Typography>
          <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={chartData} />
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderDepartmentRankings = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Department Rankings
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Rank</TableCell>
                <TableCell>Department</TableCell>
                <TableCell align="right">Attendance Rate</TableCell>
                <TableCell align="right">Punctuality</TableCell>
                <TableCell align="right">Avg Confidence</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {departmentRankings.slice(0, 5).map((dept) => (
                <TableRow key={dept.department_id}>
                  <TableCell>
                    <Chip
                      label={dept.rank}
                      size="small"
                      color={dept.rank === 1 ? 'success' : dept.rank === 2 ? 'primary' : 'default'}
                    />
                  </TableCell>
                  <TableCell>{dept.department_name}</TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end' }}>
                      {dept.attendance_rate.toFixed(1)}%
                      <LinearProgress
                        variant="determinate"
                        value={dept.attendance_rate}
                        sx={{ ml: 1, width: 50 }}
                      />
                    </Box>
                  </TableCell>
                  <TableCell align="right">{dept.punctuality_rate.toFixed(1)}%</TableCell>
                  <TableCell align="right">{dept.avg_confidence.toFixed(1)}%</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderCameraPerformance = () => {
    if (cameraPerformance.length === 0) return null;

    const chartData = {
      labels: cameraPerformance.map((c) => c.camera_name),
      datasets: [
        {
          label: 'Recognition Count',
          data: cameraPerformance.map((c) => c.recognition_count),
          backgroundColor: 'rgba(54, 162, 235, 0.8)',
        },
      ],
    };

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Camera Performance
          </Typography>
          <Box sx={{ height: 250 }}>
            <Bar data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </Box>
          <TableContainer sx={{ mt: 2 }}>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>Camera</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell align="right">Avg Confidence</TableCell>
                  <TableCell align="right">Quality Rate</TableCell>
                  <TableCell align="right">Uptime</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {cameraPerformance.slice(0, 5).map((camera) => (
                  <TableRow key={camera.camera_id}>
                    <TableCell>{camera.camera_name}</TableCell>
                    <TableCell>
                      <Chip
                        label={camera.status}
                        size="small"
                        color={camera.status === 'online' ? 'success' : 'error'}
                      />
                    </TableCell>
                    <TableCell align="right">{camera.avg_confidence.toFixed(1)}%</TableCell>
                    <TableCell align="right">{camera.quality_rate.toFixed(1)}%</TableCell>
                    <TableCell align="right">{camera.uptime.toFixed(1)}%</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const renderArrivalTimeBreakdown = () => {
    if (!arrivalTime) return null;

    const chartData = {
      labels: ['Early', 'On Time', 'Late'],
      datasets: [
        {
          data: [
            arrivalTime.breakdown.early_percentage,
            arrivalTime.breakdown.on_time_percentage,
            arrivalTime.breakdown.late_percentage,
          ],
          backgroundColor: [
            'rgba(75, 192, 192, 0.8)',
            'rgba(54, 162, 235, 0.8)',
            'rgba(255, 99, 132, 0.8)',
          ],
        },
      ],
    };

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Arrival Time Analysis
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ height: 200 }}>
                <Doughnut data={chartData} />
              </Box>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
                <Typography variant="body2" color="textSecondary">
                  Average Arrival Time
                </Typography>
                <Typography variant="h5" sx={{ mb: 2 }}>
                  {arrivalTime.average_arrival}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Peak Hour
                </Typography>
                <Typography variant="h5">
                  {arrivalTime.peak_hour}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  const renderLateTrends = () => {
    if (!lateTrends) return null;

    const chartData = {
      labels: lateTrends.daily_trend.map((d) => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Late Arrivals',
          data: lateTrends.daily_trend.map((d) => d.count),
          borderColor: 'rgb(255, 99, 132)',
          backgroundColor: 'rgba(255, 99, 132, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Late Arrival Trends</Typography>
            <Chip
              label={lateTrends.trend_direction}
              color={
                lateTrends.trend_direction === 'increasing'
                  ? 'error'
                  : lateTrends.trend_direction === 'decreasing'
                  ? 'success'
                  : 'default'
              }
              icon={
                lateTrends.trend_direction === 'increasing' ? (
                  <TrendingUpIcon />
                ) : lateTrends.trend_direction === 'decreasing' ? (
                  <TrendingDownIcon />
                ) : undefined
              }
            />
          </Box>
          <Box sx={{ height: 200, mb: 2 }}>
            <Line
              data={chartData}
              options={{ responsive: true, maintainAspectRatio: false }}
            />
          </Box>
          <Typography variant="body2" color="textSecondary" gutterBottom>
            Top Repeat Offenders
          </Typography>
          <TableContainer>
            <Table size="small">
              <TableBody>
                {lateTrends.repeat_offenders.slice(0, 5).map((offender, index) => (
                  <TableRow key={offender.user_id}>
                    <TableCell>{index + 1}</TableCell>
                    <TableCell>{offender.name}</TableCell>
                    <TableCell align="right">
                      <Chip label={`${offender.late_count} times`} size="small" color="error" />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>
    );
  };

  const renderPeakAttendance = () => {
    if (!peakAttendance) return null;

    const weeklyData = {
      labels: Object.keys(peakAttendance.weekly_pattern),
      datasets: [
        {
          label: 'Weekly Attendance',
          data: Object.values(peakAttendance.weekly_pattern),
          backgroundColor: 'rgba(153, 102, 255, 0.8)',
        },
      ],
    };

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Peak Attendance Patterns
          </Typography>
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'primary.light', color: 'white' }}>
                <Typography variant="body2">Peak Day</Typography>
                <Typography variant="h6">
                  {peakAttendance.peak_day.day_name} - {peakAttendance.peak_day.count} attendees
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12} sm={6}>
              <Paper sx={{ p: 2, bgcolor: 'success.light', color: 'white' }}>
                <Typography variant="body2">Peak Weekday</Typography>
                <Typography variant="h6">
                  {peakAttendance.peak_weekday.day} - {peakAttendance.peak_weekday.total_count} total
                </Typography>
              </Paper>
            </Grid>
          </Grid>
          <Box sx={{ height: 200 }}>
            <Bar data={weeklyData} options={{ responsive: true, maintainAspectRatio: false }} />
          </Box>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Advanced Analytics Dashboard</Typography>
        <FormControl sx={{ minWidth: 150 }}>
          <InputLabel>Period</InputLabel>
          <Select value={days} label="Period" onChange={(e) => setDays(Number(e.target.value))}>
            <MenuItem value={7}>Last 7 days</MenuItem>
            <MenuItem value={14}>Last 14 days</MenuItem>
            <MenuItem value={30}>Last 30 days</MenuItem>
            <MenuItem value={90}>Last 90 days</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <Grid container spacing={3}>
          {/* Overview Cards */}
          <Grid item xs={12}>
            {renderOverviewCards()}
          </Grid>

          {/* Attendance Trend */}
          <Grid item xs={12}>
            {renderAttendanceTrend()}
          </Grid>

          {/* Confidence Distribution & Arrival Time */}
          <Grid item xs={12} md={6}>
            {renderConfidenceDistribution()}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderArrivalTimeBreakdown()}
          </Grid>

          {/* Department Rankings */}
          <Grid item xs={12} lg={6}>
            {renderDepartmentRankings()}
          </Grid>

          {/* Late Trends */}
          <Grid item xs={12} lg={6}>
            {renderLateTrends()}
          </Grid>

          {/* Camera Performance */}
          <Grid item xs={12} lg={6}>
            {renderCameraPerformance()}
          </Grid>

          {/* Peak Attendance */}
          <Grid item xs={12} lg={6}>
            {renderPeakAttendance()}
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default AdvancedAnalyticsDashboard;
