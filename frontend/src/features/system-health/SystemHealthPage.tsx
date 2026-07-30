import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, LinearProgress, Chip, Table,
  TableBody, TableCell, TableContainer, TableHead, TableRow, Alert
} from '@mui/material';
import { Speed, Memory, Storage, CheckCircle, Warning } from '@mui/icons-material';
import { Line } from 'react-chartjs-2';

const SystemHealthPage: React.FC = () => {
  const [health, setHealth] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  const fetchHealth = async () => {
    try {
      const [healthRes, historyRes] = await Promise.all([
        fetch('http://localhost:8000/api/v1/system-health/dashboard'),
        fetch('http://localhost:8000/api/v1/system-health/metrics/history?limit=20')
      ]);
      setHealth(await healthRes.json());
      const historyData = await historyRes.json();
      setHistory(historyData.metrics || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'success';
    if (score >= 60) return 'warning';
    return 'error';
  };

  const chartData = {
    labels: history.map(m => new Date(m.timestamp).toLocaleTimeString()),
    datasets: [
      {
        label: 'CPU %',
        data: history.map(m => m.cpu_percent),
        borderColor: 'rgb(255, 99, 132)',
        backgroundColor: 'rgba(255, 99, 132, 0.1)',
      },
      {
        label: 'Memory %',
        data: history.map(m => m.memory_percent),
        borderColor: 'rgb(54, 162, 235)',
        backgroundColor: 'rgba(54, 162, 235, 0.1)',
      }
    ]
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>System Health Dashboard</Typography>

      {health && (
        <>
          <Alert severity={health.status === 'healthy' ? 'success' : 'warning'} sx={{ mb: 3 }}>
            System Status: <strong>{health.status.toUpperCase()}</strong> - Health Score: {health.overall_health}/100
          </Alert>

          <Grid container spacing={3} sx={{ mb: 3 }}>
            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Speed color="primary" />
                    <Typography variant="h6">CPU</Typography>
                  </Box>
                  <Typography variant="h4">{health.cpu.percent}%</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={health.cpu.percent}
                    color={health.cpu.percent > 80 ? 'error' : 'primary'}
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {health.cpu.count} cores @ {health.cpu.frequency_mhz} MHz
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Memory color="info" />
                    <Typography variant="h6">Memory</Typography>
                  </Box>
                  <Typography variant="h4">{health.memory.percent}%</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={health.memory.percent}
                    color={health.memory.percent > 80 ? 'error' : 'info'}
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {health.memory.used_gb} GB / {health.memory.total_gb} GB used
                  </Typography>
                </CardContent>
              </Card>
            </Grid>

            <Grid item xs={12} md={4}>
              <Card>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
                    <Storage color="success" />
                    <Typography variant="h6">Disk</Typography>
                  </Box>
                  <Typography variant="h4">{health.disk.percent}%</Typography>
                  <LinearProgress
                    variant="determinate"
                    value={health.disk.percent}
                    color={health.disk.percent > 85 ? 'error' : 'success'}
                    sx={{ mt: 1 }}
                  />
                  <Typography variant="body2" color="textSecondary" sx={{ mt: 1 }}>
                    {health.disk.used_gb} GB / {health.disk.total_gb} GB used
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          </Grid>

          <Card sx={{ mb: 3 }}>
            <CardContent>
              <Typography variant="h6" gutterBottom>Resource Trends (Last 20 Minutes)</Typography>
              <Box sx={{ height: 300 }}>
                <Line data={chartData} options={{ responsive: true, maintainAspectRatio: false }} />
              </Box>
            </CardContent>
          </Card>

          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Services Status</Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Service</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Metrics</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {Object.entries(health.services).map(([name, service]: [string, any]) => (
                      <TableRow key={name}>
                        <TableCell>{name}</TableCell>
                        <TableCell>
                          <Chip
                            icon={service.status === 'healthy' ? <CheckCircle /> : <Warning />}
                            label={service.status}
                            color={service.status === 'healthy' ? 'success' : 'error'}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>
                          {service.response_time && `${service.response_time}ms response`}
                          {service.queue_length && ` | ${service.queue_length} in queue`}
                          {service.uptime && ` | ${service.uptime} uptime`}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </>
      )}
    </Box>
  );
};

export default SystemHealthPage;
