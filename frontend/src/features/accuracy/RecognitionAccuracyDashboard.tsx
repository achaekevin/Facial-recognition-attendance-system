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
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  LinearProgress,
} from '@mui/material';
import {
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Speed as SpeedIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  Warning as WarningIcon,
  Report as ReportIcon,
} from '@mui/icons-material';
import { Line, Bar, Doughnut, Radar } from 'react-chartjs-2';

interface DashboardData {
  overview: {
    average_confidence: number;
    success_rate: number;
    total_recognitions: number;
    failed_recognitions: number;
    false_positives: number;
    false_negatives: number;
  };
  confidence_distribution: {
    high: { count: number; percentage: number };
    medium: { count: number; percentage: number };
    low: { count: number; percentage: number };
  };
  performance: {
    avg_processing_time: number;
    min_processing_time: number;
    max_processing_time: number;
    recognitions_per_hour: number;
  };
  daily_trend: Array<{
    date: string;
    total: number;
    avg_confidence: number;
    success_rate: number;
    failed: number;
  }>;
}

interface FailedRecognition {
  id: string;
  user_id: string;
  user_name: string;
  date: string;
  time: string;
  confidence_score: number;
  camera_id: string;
  image_url: string;
  reason: string;
}

interface AccuracyTrend {
  week: string;
  total_recognitions: number;
  avg_confidence: number;
  success_rate: number;
  failure_rate: number;
}

const RecognitionAccuracyDashboard: React.FC = () => {
  const [days, setDays] = useState(30);
  const [loading, setLoading] = useState(false);
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [failedRecognitions, setFailedRecognitions] = useState<FailedRecognition[]>([]);
  const [accuracyTrends, setAccuracyTrends] = useState<AccuracyTrend[]>([]);
  const [trendDirection, setTrendDirection] = useState<string>('');
  
  // Report dialogs
  const [showFalsePositiveDialog, setShowFalsePositiveDialog] = useState(false);
  const [showFalseNegativeDialog, setShowFalseNegativeDialog] = useState(false);
  const [reportSuccess, setReportSuccess] = useState(false);

  // Report forms
  const [falsePositiveForm, setFalsePositiveForm] = useState({
    attendance_id: '',
    reported_by: 'current_user',
    actual_person: '',
    notes: '',
  });

  const [falseNegativeForm, setFalseNegativeForm] = useState({
    user_id: '',
    date: '',
    reported_by: 'current_user',
    notes: '',
  });

  useEffect(() => {
    fetchAllData();
  }, [days]);

  const fetchAllData = async () => {
    setLoading(true);
    try {
      const [dashboardRes, failedRes, trendsRes] = await Promise.all([
        fetch(`http://localhost:8000/api/v1/recognition-accuracy/dashboard?days=${days}`),
        fetch(`http://localhost:8000/api/v1/recognition-accuracy/failed-recognitions?days=${days}&limit=10`),
        fetch(`http://localhost:8000/api/v1/recognition-accuracy/accuracy-trends?days=90`),
      ]);

      setDashboardData(await dashboardRes.json());
      const failedData = await failedRes.json();
      setFailedRecognitions(failedData.failed_recognitions || []);
      const trendsData = await trendsRes.json();
      setAccuracyTrends(trendsData.trends || []);
      setTrendDirection(trendsData.trend_direction || '');
    } catch (error) {
      console.error('Error fetching accuracy data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleReportFalsePositive = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/recognition-accuracy/report-false-positive', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(falsePositiveForm),
      });

      if (response.ok) {
        setShowFalsePositiveDialog(false);
        setReportSuccess(true);
        setTimeout(() => setReportSuccess(false), 3000);
        setFalsePositiveForm({
          attendance_id: '',
          reported_by: 'current_user',
          actual_person: '',
          notes: '',
        });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error reporting false positive:', error);
    }
  };

  const handleReportFalseNegative = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/recognition-accuracy/report-false-negative', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(falseNegativeForm),
      });

      if (response.ok) {
        setShowFalseNegativeDialog(false);
        setReportSuccess(true);
        setTimeout(() => setReportSuccess(false), 3000);
        setFalseNegativeForm({
          user_id: '',
          date: '',
          reported_by: 'current_user',
          notes: '',
        });
        fetchAllData();
      }
    } catch (error) {
      console.error('Error reporting false negative:', error);
    }
  };

  const renderOverviewCards = () => {
    if (!dashboardData) return null;

    return (
      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SuccessIcon color="success" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Avg Confidence
                </Typography>
              </Box>
              <Typography variant="h4">
                {dashboardData.overview.average_confidence.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={dashboardData.overview.average_confidence}
                color="success"
                sx={{ mt: 1 }}
              />
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {dashboardData.overview.total_recognitions} total
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <TrendingUpIcon color="primary" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Success Rate
                </Typography>
              </Box>
              <Typography variant="h4">
                {dashboardData.overview.success_rate.toFixed(1)}%
              </Typography>
              <LinearProgress
                variant="determinate"
                value={dashboardData.overview.success_rate}
                sx={{ mt: 1 }}
              />
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Failed Recognitions
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {dashboardData.overview.failed_recognitions}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Low confidence (<70%)
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <SpeedIcon color="info" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  Avg Processing Time
                </Typography>
              </Box>
              <Typography variant="h4">
                {dashboardData.performance.avg_processing_time.toFixed(2)}s
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                {dashboardData.performance.recognitions_per_hour.toFixed(0)}/hour
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <WarningIcon color="warning" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  False Positives
                </Typography>
              </Box>
              <Typography variant="h4" color="warning.main">
                {dashboardData.overview.false_positives}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Wrong person identified
              </Typography>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} sm={6} md={3}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                <ErrorIcon color="error" sx={{ mr: 1 }} />
                <Typography variant="body2" color="textSecondary">
                  False Negatives
                </Typography>
              </Box>
              <Typography variant="h4" color="error.main">
                {dashboardData.overview.false_negatives}
              </Typography>
              <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                Person not recognized
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    );
  };

  const renderConfidenceTrend = () => {
    if (!dashboardData) return null;

    const chartData = {
      labels: dashboardData.daily_trend.map((d) => new Date(d.date).toLocaleDateString()),
      datasets: [
        {
          label: 'Average Confidence',
          data: dashboardData.daily_trend.map((d) => d.avg_confidence),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.1)',
          fill: true,
          tension: 0.4,
        },
        {
          label: 'Success Rate',
          data: dashboardData.daily_trend.map((d) => d.success_rate),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.1)',
          fill: true,
          tension: 0.4,
        },
      ],
    };

    const options = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          position: 'top' as const,
        },
        title: {
          display: true,
          text: 'Daily Confidence & Success Rate Trend',
        },
      },
      scales: {
        y: {
          beginAtZero: true,
          max: 100,
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
    if (!dashboardData) return null;

    const chartData = {
      labels: ['High (≥90%)', 'Medium (70-90%)', 'Low (<70%)'],
      datasets: [
        {
          data: [
            dashboardData.confidence_distribution.high.percentage,
            dashboardData.confidence_distribution.medium.percentage,
            dashboardData.confidence_distribution.low.percentage,
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
          borderWidth: 2,
        },
      ],
    };

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Confidence Distribution
          </Typography>
          <Box sx={{ height: 250, display: 'flex', justifyContent: 'center' }}>
            <Doughnut data={chartData} />
          </Box>
          <Box sx={{ mt: 2 }}>
            <Grid container spacing={2}>
              <Grid item xs={4}>
                <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'rgba(75, 192, 192, 0.1)' }}>
                  <Typography variant="h6">
                    {dashboardData.confidence_distribution.high.count}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    High
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'rgba(255, 206, 86, 0.1)' }}>
                  <Typography variant="h6">
                    {dashboardData.confidence_distribution.medium.count}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Medium
                  </Typography>
                </Paper>
              </Grid>
              <Grid item xs={4}>
                <Paper sx={{ p: 1, textAlign: 'center', bgcolor: 'rgba(255, 99, 132, 0.1)' }}>
                  <Typography variant="h6">
                    {dashboardData.confidence_distribution.low.count}
                  </Typography>
                  <Typography variant="body2" color="textSecondary">
                    Low
                  </Typography>
                </Paper>
              </Grid>
            </Grid>
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderAccuracyTrends = () => {
    if (accuracyTrends.length === 0) return null;

    const chartData = {
      labels: accuracyTrends.map((t) => t.week),
      datasets: [
        {
          label: 'Avg Confidence',
          data: accuracyTrends.map((t) => t.avg_confidence),
          borderColor: 'rgb(75, 192, 192)',
          backgroundColor: 'rgba(75, 192, 192, 0.2)',
          tension: 0.4,
        },
        {
          label: 'Success Rate',
          data: accuracyTrends.map((t) => t.success_rate),
          borderColor: 'rgb(54, 162, 235)',
          backgroundColor: 'rgba(54, 162, 235, 0.2)',
          tension: 0.4,
        },
      ],
    };

    const getTrendIcon = () => {
      if (trendDirection === 'improving') return <TrendingUpIcon color="success" />;
      if (trendDirection === 'declining') return <TrendingDownIcon color="error" />;
      return null;
    };

    const getTrendColor = () => {
      if (trendDirection === 'improving') return 'success';
      if (trendDirection === 'declining') return 'error';
      return 'default';
    };

    return (
      <Card>
        <CardContent>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
            <Typography variant="h6">Weekly Accuracy Trends</Typography>
            <Chip
              label={trendDirection.replace('_', ' ')}
              color={getTrendColor() as any}
              icon={getTrendIcon()}
            />
          </Box>
          <Box sx={{ height: 250 }}>
            <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
          </Box>
        </CardContent>
      </Card>
    );
  };

  const renderFailedRecognitions = () => (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Recent Failed Recognitions
        </Typography>
        <TableContainer>
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>Employee</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Time</TableCell>
                <TableCell>Confidence</TableCell>
                <TableCell>Camera</TableCell>
                <TableCell>Reason</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {failedRecognitions.map((failure) => (
                <TableRow key={failure.id}>
                  <TableCell>{failure.user_name}</TableCell>
                  <TableCell>{failure.date}</TableCell>
                  <TableCell>{failure.time || 'N/A'}</TableCell>
                  <TableCell>
                    <Chip
                      label={`${failure.confidence_score.toFixed(1)}%`}
                      size="small"
                      color="error"
                    />
                  </TableCell>
                  <TableCell>{failure.camera_id}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="error">
                      {failure.reason}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </CardContent>
    </Card>
  );

  const renderPerformanceMetrics = () => {
    if (!dashboardData) return null;

    return (
      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>
            Processing Performance
          </Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Average
                </Typography>
                <Typography variant="h5">
                  {dashboardData.performance.avg_processing_time.toFixed(3)}s
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper sx={{ p: 2 }}>
                <Typography variant="body2" color="textSecondary">
                  Min / Max
                </Typography>
                <Typography variant="h5">
                  {dashboardData.performance.min_processing_time.toFixed(3)}s /{' '}
                  {dashboardData.performance.max_processing_time.toFixed(3)}s
                </Typography>
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper sx={{ p: 2, bgcolor: 'primary.light' }}>
                <Typography variant="body2" color="white">
                  Throughput
                </Typography>
                <Typography variant="h5" color="white">
                  {dashboardData.performance.recognitions_per_hour.toFixed(2)} recognitions/hour
                </Typography>
              </Paper>
            </Grid>
          </Grid>
        </CardContent>
      </Card>
    );
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4">Face Recognition Accuracy Dashboard</Typography>
        <Box sx={{ display: 'flex', gap: 2 }}>
          <FormControl sx={{ minWidth: 150 }}>
            <InputLabel>Period</InputLabel>
            <Select value={days} label="Period" onChange={(e) => setDays(Number(e.target.value))}>
              <MenuItem value={7}>Last 7 days</MenuItem>
              <MenuItem value={14}>Last 14 days</MenuItem>
              <MenuItem value={30}>Last 30 days</MenuItem>
              <MenuItem value={90}>Last 90 days</MenuItem>
            </Select>
          </FormControl>
          <Button
            variant="outlined"
            startIcon={<ReportIcon />}
            onClick={() => setShowFalsePositiveDialog(true)}
          >
            Report False Positive
          </Button>
          <Button
            variant="outlined"
            startIcon={<ReportIcon />}
            onClick={() => setShowFalseNegativeDialog(true)}
          >
            Report False Negative
          </Button>
        </Box>
      </Box>

      {reportSuccess && (
        <Alert severity="success" sx={{ mb: 2 }}>
          Report submitted successfully!
        </Alert>
      )}

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

          {/* Confidence Trend */}
          <Grid item xs={12}>
            {renderConfidenceTrend()}
          </Grid>

          {/* Distribution & Performance */}
          <Grid item xs={12} md={6}>
            {renderConfidenceDistribution()}
          </Grid>
          <Grid item xs={12} md={6}>
            {renderPerformanceMetrics()}
          </Grid>

          {/* Accuracy Trends */}
          <Grid item xs={12}>
            {renderAccuracyTrends()}
          </Grid>

          {/* Failed Recognitions */}
          <Grid item xs={12}>
            {renderFailedRecognitions()}
          </Grid>
        </Grid>
      )}

      {/* False Positive Dialog */}
      <Dialog
        open={showFalsePositiveDialog}
        onClose={() => setShowFalsePositiveDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report False Positive</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Attendance ID"
              value={falsePositiveForm.attendance_id}
              onChange={(e) =>
                setFalsePositiveForm({ ...falsePositiveForm, attendance_id: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Actual Person"
              value={falsePositiveForm.actual_person}
              onChange={(e) =>
                setFalsePositiveForm({ ...falsePositiveForm, actual_person: e.target.value })
              }
              fullWidth
            />
            <TextField
              label="Notes"
              value={falsePositiveForm.notes}
              onChange={(e) => setFalsePositiveForm({ ...falsePositiveForm, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFalsePositiveDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleReportFalsePositive}>
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>

      {/* False Negative Dialog */}
      <Dialog
        open={showFalseNegativeDialog}
        onClose={() => setShowFalseNegativeDialog(false)}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>Report False Negative</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="User ID"
              value={falseNegativeForm.user_id}
              onChange={(e) => setFalseNegativeForm({ ...falseNegativeForm, user_id: e.target.value })}
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={falseNegativeForm.date}
              onChange={(e) => setFalseNegativeForm({ ...falseNegativeForm, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <TextField
              label="Notes"
              value={falseNegativeForm.notes}
              onChange={(e) => setFalseNegativeForm({ ...falseNegativeForm, notes: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowFalseNegativeDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleReportFalseNegative}>
            Submit Report
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default RecognitionAccuracyDashboard;
