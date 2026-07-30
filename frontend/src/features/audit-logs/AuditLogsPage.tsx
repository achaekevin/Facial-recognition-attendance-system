import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Table, TableBody, TableCell,
  TableContainer, TableHead, TableRow, Chip, TextField, Grid,
  FormControl, InputLabel, Select, MenuItem, Button, Pagination
} from '@mui/material';
import { History, Download, FilterList } from '@mui/icons-material';

const AuditLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<any[]>([]);
  const [filters, setFilters] = useState({
    user_id: '',
    entity_type: '',
    action: '',
    days: 7
  });
  const [page, setPage] = useState(1);
  const [stats, setStats] = useState<any>(null);

  useEffect(() => {
    fetchLogs();
    fetchStats();
  }, [filters, page]);

  const fetchLogs = async () => {
    try {
      const params = new URLSearchParams();
      if (filters.user_id) params.append('user_id', filters.user_id);
      if (filters.entity_type) params.append('entity_type', filters.entity_type);
      if (filters.action) params.append('action', filters.action);
      params.append('days', filters.days.toString());
      params.append('limit', '50');

      const response = await fetch(`http://localhost:8000/api/v1/audit-trail/logs?${params}`);
      const data = await response.json();
      setLogs(data.logs || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchStats = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/audit-trail/statistics?days=${filters.days}`);
      const data = await response.json();
      setStats(data);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleExport = async () => {
    try {
      const response = await fetch(`http://localhost:8000/api/v1/audit-trail/export?format=json&days=${filters.days}`);
      const data = await response.json();
      const blob = new Blob([JSON.stringify(data.data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `audit-logs-${new Date().toISOString()}.json`;
      a.click();
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <History /> Audit Trail
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Comprehensive action logging with IP tracking
          </Typography>
        </Box>
        <Button startIcon={<Download />} onClick={handleExport} variant="outlined">
          Export Logs
        </Button>
      </Box>

      {stats && (
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography color="textSecondary">Total Actions</Typography>
              <Typography variant="h4">{stats.total_actions}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography color="textSecondary">Unique Users</Typography>
              <Typography variant="h4">{stats.top_users?.length || 0}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography color="textSecondary">Entity Types</Typography>
              <Typography variant="h4">{Object.keys(stats.by_entity_type || {}).length}</Typography>
            </CardContent></Card>
          </Grid>
          <Grid item xs={6} md={3}>
            <Card><CardContent>
              <Typography color="textSecondary">Action Types</Typography>
              <Typography variant="h4">{Object.keys(stats.by_action || {}).length}</Typography>
            </CardContent></Card>
          </Grid>
        </Grid>
      )}

      <Card sx={{ mb: 3 }}>
        <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 2 }}>
            <FilterList />
            <Typography variant="h6">Filters</Typography>
          </Box>
          <Grid container spacing={2}>
            <Grid item xs={12} md={3}>
              <TextField
                fullWidth
                label="User ID"
                value={filters.user_id}
                onChange={(e) => setFilters({ ...filters, user_id: e.target.value })}
              />
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Entity Type</InputLabel>
                <Select
                  value={filters.entity_type}
                  label="Entity Type"
                  onChange={(e) => setFilters({ ...filters, entity_type: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="face">Face</MenuItem>
                  <MenuItem value="attendance">Attendance</MenuItem>
                  <MenuItem value="user">User</MenuItem>
                  <MenuItem value="camera">Camera</MenuItem>
                  <MenuItem value="setting">Setting</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Action</InputLabel>
                <Select
                  value={filters.action}
                  label="Action"
                  onChange={(e) => setFilters({ ...filters, action: e.target.value })}
                >
                  <MenuItem value="">All</MenuItem>
                  <MenuItem value="create">Create</MenuItem>
                  <MenuItem value="update">Update</MenuItem>
                  <MenuItem value="delete">Delete</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} md={3}>
              <FormControl fullWidth>
                <InputLabel>Time Period</InputLabel>
                <Select
                  value={filters.days}
                  label="Time Period"
                  onChange={(e) => setFilters({ ...filters, days: Number(e.target.value) })}
                >
                  <MenuItem value={1}>Last 24 hours</MenuItem>
                  <MenuItem value={7}>Last 7 days</MenuItem>
                  <MenuItem value={30}>Last 30 days</MenuItem>
                  <MenuItem value={90}>Last 90 days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
        </CardContent>
      </Card>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Audit Logs</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Timestamp</TableCell>
                  <TableCell>User</TableCell>
                  <TableCell>Action</TableCell>
                  <TableCell>Entity</TableCell>
                  <TableCell>IP Address</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {logs.map((log) => (
                  <TableRow key={log.id}>
                    <TableCell>{new Date(log.timestamp).toLocaleString()}</TableCell>
                    <TableCell>{log.user_id}</TableCell>
                    <TableCell>
                      <Chip label={log.action} size="small" color="primary" />
                    </TableCell>
                    <TableCell>
                      {log.entity_type}
                      {log.entity_id && ` (${log.entity_id})`}
                    </TableCell>
                    <TableCell>{log.ip_address}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 2 }}>
            <Pagination count={Math.ceil(logs.length / 50)} page={page} onChange={(_, p) => setPage(p)} />
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default AuditLogsPage;
