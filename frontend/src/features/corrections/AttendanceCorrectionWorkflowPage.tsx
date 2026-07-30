import React, { useState, useEffect } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Tabs,
  Tab,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Grid,
  Alert,
  CircularProgress,
  IconButton,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  CheckCircle as ApproveIcon,
  Cancel as RejectIcon,
  Visibility as ViewIcon,
  History as HistoryIcon,
} from '@mui/icons-material';
import { Line } from 'react-chartjs-2';

interface CorrectionRequest {
  id: string;
  user_id: string;
  user_name: string;
  date: string;
  correction_type: string;
  original_value: string;
  new_value: string;
  reason: string;
  status: string;
  requested_by: string;
  requested_at: string;
  supervisor_status?: string;
  supervisor_comments?: string;
  hr_status?: string;
  hr_comments?: string;
}

interface Statistics {
  total_requests: number;
  pending: number;
  approved: number;
  rejected: number;
  by_type: Record<string, number>;
}

const AttendanceCorrectionWorkflowPage: React.FC = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [requests, setRequests] = useState<CorrectionRequest[]>([]);
  const [statistics, setStatistics] = useState<Statistics | null>(null);
  const [loading, setLoading] = useState(false);
  const [showRequestDialog, setShowRequestDialog] = useState(false);
  const [showReviewDialog, setShowReviewDialog] = useState(false);
  const [selectedRequest, setSelectedRequest] = useState<CorrectionRequest | null>(null);
  const [filterStatus, setFilterStatus] = useState('all');

  // New request form state
  const [newRequest, setNewRequest] = useState({
    user_id: '',
    date: '',
    correction_type: 'clock_in',
    original_value: '',
    new_value: '',
    reason: '',
    requested_by: 'current_user', // In production, get from auth
  });

  // Review form state
  const [reviewData, setReviewData] = useState({
    action: 'approve',
    comments: '',
  });

  useEffect(() => {
    fetchRequests();
    fetchStatistics();
  }, [filterStatus]);

  const fetchRequests = async () => {
    setLoading(true);
    try {
      const params = filterStatus !== 'all' ? `?status=${filterStatus}` : '';
      const response = await fetch(`http://localhost:8000/api/v1/attendance-corrections/requests${params}`);
      const data = await response.json();
      setRequests(data.requests || []);
    } catch (error) {
      console.error('Error fetching requests:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/attendance-corrections/statistics');
      const data = await response.json();
      setStatistics(data);
    } catch (error) {
      console.error('Error fetching statistics:', error);
    }
  };

  const handleSubmitRequest = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/attendance-corrections/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newRequest),
      });

      if (response.ok) {
        setShowRequestDialog(false);
        fetchRequests();
        fetchStatistics();
        // Reset form
        setNewRequest({
          user_id: '',
          date: '',
          correction_type: 'clock_in',
          original_value: '',
          new_value: '',
          reason: '',
          requested_by: 'current_user',
        });
      }
    } catch (error) {
      console.error('Error submitting request:', error);
    }
  };

  const handleReview = async (reviewType: 'supervisor' | 'hr') => {
    if (!selectedRequest) return;

    try {
      const response = await fetch(
        `http://localhost:8000/api/v1/attendance-corrections/review/${reviewType}`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            request_id: selectedRequest.id,
            action: reviewData.action,
            reviewer_id: 'current_user', // In production, get from auth
            comments: reviewData.comments,
          }),
        }
      );

      if (response.ok) {
        setShowReviewDialog(false);
        fetchRequests();
        fetchStatistics();
        setReviewData({ action: 'approve', comments: '' });
      }
    } catch (error) {
      console.error('Error submitting review:', error);
    }
  };

  const getStatusColor = (status: string) => {
    const colors: Record<string, 'default' | 'warning' | 'success' | 'error'> = {
      pending: 'warning',
      supervisor_approved: 'info' as 'default',
      hr_approved: 'success',
      applied: 'success',
      rejected: 'error',
    };
    return colors[status] || 'default';
  };

  const renderRequestsTab = () => (
    <Box>
      <Box sx={{ mb: 3, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Status</InputLabel>
          <Select
            value={filterStatus}
            label="Filter by Status"
            onChange={(e) => setFilterStatus(e.target.value)}
          >
            <MenuItem value="all">All Requests</MenuItem>
            <MenuItem value="pending">Pending</MenuItem>
            <MenuItem value="supervisor_approved">Supervisor Approved</MenuItem>
            <MenuItem value="hr_approved">HR Approved</MenuItem>
            <MenuItem value="applied">Applied</MenuItem>
            <MenuItem value="rejected">Rejected</MenuItem>
          </Select>
        </FormControl>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => setShowRequestDialog(true)}
        >
          New Correction Request
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Request ID</TableCell>
                <TableCell>Employee</TableCell>
                <TableCell>Date</TableCell>
                <TableCell>Type</TableCell>
                <TableCell>Original</TableCell>
                <TableCell>New Value</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Requested</TableCell>
                <TableCell>Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {requests.map((request) => (
                <TableRow key={request.id}>
                  <TableCell>{request.id}</TableCell>
                  <TableCell>{request.user_name}</TableCell>
                  <TableCell>{request.date}</TableCell>
                  <TableCell>
                    <Chip label={request.correction_type} size="small" />
                  </TableCell>
                  <TableCell>{request.original_value}</TableCell>
                  <TableCell>{request.new_value}</TableCell>
                  <TableCell>
                    <Chip
                      label={request.status}
                      color={getStatusColor(request.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    {new Date(request.requested_at).toLocaleDateString()}
                  </TableCell>
                  <TableCell>
                    <Tooltip title="View Details">
                      <IconButton
                        size="small"
                        onClick={() => {
                          setSelectedRequest(request);
                          setShowReviewDialog(true);
                        }}
                      >
                        <ViewIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );

  const renderStatisticsTab = () => (
    <Grid container spacing={3}>
      {statistics && (
        <>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Total Requests
                </Typography>
                <Typography variant="h4">{statistics.total_requests}</Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Pending
                </Typography>
                <Typography variant="h4" color="warning.main">
                  {statistics.pending}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Approved
                </Typography>
                <Typography variant="h4" color="success.main">
                  {statistics.approved}
                </Typography>
              </CardContent>
            </Card>
          </Grid>
          <Grid item xs={12} md={3}>
            <Card>
              <CardContent>
                <Typography color="textSecondary" gutterBottom>
                  Rejected
                </Typography>
                <Typography variant="h4" color="error.main">
                  {statistics.rejected}
                </Typography>
              </CardContent>
            </Card>
          </Grid>

          <Grid item xs={12}>
            <Card>
              <CardContent>
                <Typography variant="h6" gutterBottom>
                  Requests by Type
                </Typography>
                <Grid container spacing={2}>
                  {Object.entries(statistics.by_type).map(([type, count]) => (
                    <Grid item xs={12} sm={6} md={3} key={type}>
                      <Paper sx={{ p: 2 }}>
                        <Typography variant="body2" color="textSecondary">
                          {type.replace('_', ' ').toUpperCase()}
                        </Typography>
                        <Typography variant="h5">{count}</Typography>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </CardContent>
            </Card>
          </Grid>
        </>
      )}
    </Grid>
  );

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>
        Attendance Correction Workflow
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Request → Supervisor Review → HR Approval → Applied
      </Typography>

      <Card>
        <Tabs value={activeTab} onChange={(_, v) => setActiveTab(v)}>
          <Tab label="Requests" />
          <Tab label="Statistics" />
        </Tabs>

        <CardContent>
          {activeTab === 0 && renderRequestsTab()}
          {activeTab === 1 && renderStatisticsTab()}
        </CardContent>
      </Card>

      {/* New Request Dialog */}
      <Dialog open={showRequestDialog} onClose={() => setShowRequestDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>New Correction Request</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="User ID"
              value={newRequest.user_id}
              onChange={(e) => setNewRequest({ ...newRequest, user_id: e.target.value })}
              fullWidth
            />
            <TextField
              label="Date"
              type="date"
              value={newRequest.date}
              onChange={(e) => setNewRequest({ ...newRequest, date: e.target.value })}
              InputLabelProps={{ shrink: true }}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Correction Type</InputLabel>
              <Select
                value={newRequest.correction_type}
                label="Correction Type"
                onChange={(e) => setNewRequest({ ...newRequest, correction_type: e.target.value })}
              >
                <MenuItem value="clock_in">Clock In</MenuItem>
                <MenuItem value="clock_out">Clock Out</MenuItem>
                <MenuItem value="status">Status</MenuItem>
                <MenuItem value="date">Date</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Original Value"
              value={newRequest.original_value}
              onChange={(e) => setNewRequest({ ...newRequest, original_value: e.target.value })}
              fullWidth
            />
            <TextField
              label="New Value"
              value={newRequest.new_value}
              onChange={(e) => setNewRequest({ ...newRequest, new_value: e.target.value })}
              fullWidth
            />
            <TextField
              label="Reason"
              value={newRequest.reason}
              onChange={(e) => setNewRequest({ ...newRequest, reason: e.target.value })}
              multiline
              rows={3}
              fullWidth
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowRequestDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleSubmitRequest}>
            Submit Request
          </Button>
        </DialogActions>
      </Dialog>

      {/* Review Dialog */}
      <Dialog open={showReviewDialog} onClose={() => setShowReviewDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Review Correction Request</DialogTitle>
        <DialogContent>
          {selectedRequest && (
            <Box sx={{ mt: 2 }}>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Request ID
                  </Typography>
                  <Typography variant="body1">{selectedRequest.id}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Employee
                  </Typography>
                  <Typography variant="body1">{selectedRequest.user_name}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Date
                  </Typography>
                  <Typography variant="body1">{selectedRequest.date}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Type
                  </Typography>
                  <Typography variant="body1">{selectedRequest.correction_type}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    Original Value
                  </Typography>
                  <Typography variant="body1">{selectedRequest.original_value}</Typography>
                </Grid>
                <Grid item xs={6}>
                  <Typography variant="body2" color="textSecondary">
                    New Value
                  </Typography>
                  <Typography variant="body1">{selectedRequest.new_value}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Reason
                  </Typography>
                  <Typography variant="body1">{selectedRequest.reason}</Typography>
                </Grid>
                <Grid item xs={12}>
                  <Typography variant="body2" color="textSecondary">
                    Status
                  </Typography>
                  <Chip label={selectedRequest.status} color={getStatusColor(selectedRequest.status)} />
                </Grid>
              </Grid>

              {selectedRequest.status === 'pending' && (
                <Box sx={{ mt: 3 }}>
                  <FormControl fullWidth sx={{ mb: 2 }}>
                    <InputLabel>Action</InputLabel>
                    <Select
                      value={reviewData.action}
                      label="Action"
                      onChange={(e) => setReviewData({ ...reviewData, action: e.target.value })}
                    >
                      <MenuItem value="approve">Approve</MenuItem>
                      <MenuItem value="reject">Reject</MenuItem>
                    </Select>
                  </FormControl>
                  <TextField
                    label="Comments"
                    value={reviewData.comments}
                    onChange={(e) => setReviewData({ ...reviewData, comments: e.target.value })}
                    multiline
                    rows={3}
                    fullWidth
                  />
                </Box>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowReviewDialog(false)}>Close</Button>
          {selectedRequest?.status === 'pending' && (
            <Button
              variant="contained"
              startIcon={reviewData.action === 'approve' ? <ApproveIcon /> : <RejectIcon />}
              color={reviewData.action === 'approve' ? 'success' : 'error'}
              onClick={() => handleReview('supervisor')}
            >
              {reviewData.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          )}
          {selectedRequest?.status === 'supervisor_approved' && (
            <Button
              variant="contained"
              startIcon={reviewData.action === 'approve' ? <ApproveIcon /> : <RejectIcon />}
              color={reviewData.action === 'approve' ? 'success' : 'error'}
              onClick={() => handleReview('hr')}
            >
              HR {reviewData.action === 'approve' ? 'Approve' : 'Reject'}
            </Button>
          )}
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default AttendanceCorrectionWorkflowPage;
