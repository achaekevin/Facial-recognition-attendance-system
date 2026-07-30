import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Grid, Chip, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Alert, Tabs, Tab, CircularProgress
} from '@mui/material';
import { Security, Warning, Error, Info } from '@mui/icons-material';

const SecurityCenterPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [dashboard, setDashboard] = useState<any>(null);
  const [events, setEvents] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchDashboard();
    fetchEvents();
  }, []);

  const fetchDashboard = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/security-center/dashboard?days=7');
      const data = await response.json();
      setDashboard(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchEvents = async () => {
    setLoading(true);
    try {
      const response = await fetch('http://localhost:8000/api/v1/security-center/events?days=7');
      const data = await response.json();
      setEvents(data.events || []);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const getSeverityColor = (severity: string) => {
    const colors: any = { low: 'info', medium: 'warning', high: 'error', critical: 'error' };
    return colors[severity] || 'default';
  };

  const getSeverityIcon = (severity: string) => {
    if (severity === 'critical' || severity === 'high') return <Error />;
    if (severity === 'medium') return <Warning />;
    return <Info />;
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <Security color="error" /> Security Center
      </Typography>

      {dashboard && (
        <Grid container spacing={3} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography color="textSecondary">Total Events</Typography>
              <Typography variant="h4">{dashboard.total_events}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography color="textSecondary">Unresolved</Typography>
              <Typography variant="h4" color="error">{dashboard.unresolved_events}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography color="textSecondary">Critical</Typography>
              <Typography variant="h4" color="error">{dashboard.by_severity?.critical || 0}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography color="textSecondary">Active Sessions</Typography>
              <Typography variant="h4">{dashboard.active_sessions}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Security Events" />
          <Tab label="Critical Alerts" />
        </Tabs>
        <CardContent>
          {loading ? (
            <Box sx={{ textAlign: 'center', p: 4 }}><CircularProgress /></Box>
          ) : (
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Severity</TableCell>
                    <TableCell>Event Type</TableCell>
                    <TableCell>Description</TableCell>
                    <TableCell>Time</TableCell>
                    <TableCell>Status</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {events.slice(0, 20).map((event) => (
                    <TableRow key={event.id}>
                      <TableCell>
                        <Chip
                          icon={getSeverityIcon(event.severity)}
                          label={event.severity}
                          color={getSeverityColor(event.severity)}
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{event.event_type}</TableCell>
                      <TableCell>{event.description}</TableCell>
                      <TableCell>{new Date(event.timestamp).toLocaleString()}</TableCell>
                      <TableCell>
                        <Chip
                          label={event.resolved ? 'Resolved' : 'Active'}
                          color={event.resolved ? 'success' : 'warning'}
                          size="small"
                        />
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          )}
        </CardContent>
      </Card>
    </Box>
  );
};

export default SecurityCenterPage;
