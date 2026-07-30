import React, { useState } from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Button,
  TextField,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  Alert,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
} from '@mui/material';
import { QrCode2, CheckCircle, History } from '@mui/icons-material';

const QRBackupPage: React.FC = () => {
  const [showGenerateDialog, setShowGenerateDialog] = useState(false);
  const [qrCode, setQrCode] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [generateForm, setGenerateForm] = useState({
    user_id: '',
    reason: '',
    camera_id: ''
  });

  const handleGenerate = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/qr-backup/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(generateForm)
      });
      const data = await response.json();
      setQrCode(data);
      setShowGenerateDialog(true);
    } catch (error) {
      console.error('Error generating QR:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/qr-backup/history?days=7');
      const data = await response.json();
      setHistory(data.records || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  React.useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>QR Code Backup Attendance</Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Backup attendance method when facial recognition fails
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Generate QR Code</Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="User ID"
                  value={generateForm.user_id}
                  onChange={(e) => setGenerateForm({ ...generateForm, user_id: e.target.value })}
                />
                <FormControl fullWidth>
                  <InputLabel>Reason for Fallback</InputLabel>
                  <Select
                    value={generateForm.reason}
                    label="Reason for Fallback"
                    onChange={(e) => setGenerateForm({ ...generateForm, reason: e.target.value })}
                  >
                    <MenuItem value="low_confidence">Low Recognition Confidence</MenuItem>
                    <MenuItem value="camera_failure">Camera Failure</MenuItem>
                    <MenuItem value="poor_lighting">Poor Lighting</MenuItem>
                    <MenuItem value="face_covered">Face Covered</MenuItem>
                    <MenuItem value="other">Other</MenuItem>
                  </Select>
                </FormControl>
                <TextField
                  label="Camera ID (Optional)"
                  value={generateForm.camera_id}
                  onChange={(e) => setGenerateForm({ ...generateForm, camera_id: e.target.value })}
                />
                <Button
                  variant="contained"
                  startIcon={<QrCode2 />}
                  onClick={handleGenerate}
                  disabled={!generateForm.user_id || !generateForm.reason}
                >
                  Generate QR Code
                </Button>
              </Box>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <History /> QR Backup History
              </Typography>
              <TableContainer>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>User</TableCell>
                      <TableCell>Date</TableCell>
                      <TableCell>Time</TableCell>
                      <TableCell>Reason</TableCell>
                      <TableCell>Camera</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {history.map((record) => (
                      <TableRow key={record.id}>
                        <TableCell>{record.user_name}</TableCell>
                        <TableCell>{record.date}</TableCell>
                        <TableCell>{record.clock_in}</TableCell>
                        <TableCell>
                          <Chip label={record.fallback_reason} size="small" color="warning" />
                        </TableCell>
                        <TableCell>{record.camera_id}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Dialog open={showGenerateDialog} onClose={() => setShowGenerateDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>QR Code Generated</DialogTitle>
        <DialogContent>
          {qrCode && (
            <Box sx={{ textAlign: 'center' }}>
              <Alert severity="success" sx={{ mb: 2 }}>
                <CheckCircle /> QR Code valid for 5 minutes
              </Alert>
              <img src={qrCode.qr_image} alt="QR Code" style={{ width: '300px', height: '300px' }} />
              <Typography variant="body2" sx={{ mt: 2 }}>
                User: {qrCode.user_id}
              </Typography>
              <Typography variant="body2">
                Expires: {new Date(qrCode.expires_at).toLocaleTimeString()}
              </Typography>
              <Typography variant="caption" color="textSecondary" sx={{ mt: 2, display: 'block' }}>
                Scan this code to record attendance
              </Typography>
            </Box>
          )}
        </DialogContent>
      </Dialog>
    </Box>
  );
};

export default QRBackupPage;
