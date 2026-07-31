import React, { useState, useEffect } from 'react';
import {
  Box,
  Badge,
  IconButton,
  Drawer,
  Typography,
  Card,
  CardContent,
  Button,
  List,
  ListItem,
  ListItemText,
  Chip,
  Alert,
  Divider,
  CircularProgress,
  Tooltip,
} from '@mui/material';
import {
  CloudOff as OfflineIcon,
  Cloud as OnlineIcon,
  Sync as SyncIcon,
  Queue as QueueIcon,
  CheckCircle as CheckIcon,
  Error as ErrorIcon,
  History as HistoryIcon,
} from '@mui/icons-material';

interface QueueStatus {
  is_online: boolean;
  queue_size: number;
  pending: number;
  syncing: number;
  failed: number;
  last_sync: any;
}

interface QueuedRecord {
  id: string;
  data: any;
  queued_at: string;
  sync_status: string;
  retry_count: number;
}

interface SyncHistory {
  queue_id: string;
  synced_at: string;
  status: string;
}

const OfflineModeIndicator: React.FC = () => {
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [status, setStatus] = useState<QueueStatus | null>(null);
  const [queuedRecords, setQueuedRecords] = useState<QueuedRecord[]>([]);
  const [syncHistory, setSyncHistory] = useState<SyncHistory[]>([]);
  const [syncing, setSyncing] = useState(false);
  const [activeTab, setActiveTab] = useState<'queue' | 'history'>('queue');

  useEffect(() => {
    fetchStatus();
    const interval = setInterval(fetchStatus, 5000); // Poll every 5 seconds
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (drawerOpen) {
      fetchQueue();
      fetchHistory();
    }
  }, [drawerOpen]);

  const fetchStatus = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/offline-sync/status');
      const data = await response.json();
      setStatus(data);
    } catch (error) {
      console.error('Error fetching offline status:', error);
    }
  };

  const fetchQueue = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/offline-sync/queue');
      const data = await response.json();
      setQueuedRecords(data.queue || []);
    } catch (error) {
      console.error('Error fetching queue:', error);
    }
  };

  const fetchHistory = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/offline-sync/history');
      const data = await response.json();
      setSyncHistory(data.history || []);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleSync = async () => {
    setSyncing(true);
    try {
      // Sync local IndexedDB offline queue
      const { offlineStorage } = await import('../../services/offlineStorage');
      await offlineStorage.syncPendingQueue();

      const response = await fetch('http://localhost:8000/api/v1/offline-sync/sync', {
        method: 'POST',
      });
      const result = await response.json();
      
      // Refresh data
      await fetchStatus();
      await fetchQueue();
      await fetchHistory();
    } catch (error) {
      console.error('Error syncing:', error);
    } finally {
      setSyncing(false);
    }
  };

  const getStatusColor = () => {
    if (!status) return 'default';
    if (!status.is_online) return 'error';
    if (status.queue_size > 0) return 'warning';
    return 'success';
  };

  const getStatusIcon = () => {
    if (!status) return <OnlineIcon />;
    return status.is_online ? <OnlineIcon /> : <OfflineIcon />;
  };

  const renderQueue = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">Queued Records ({queuedRecords.length})</Typography>
        <Button
          variant="contained"
          startIcon={syncing ? <CircularProgress size={16} /> : <SyncIcon />}
          onClick={handleSync}
          disabled={syncing || !status?.is_online || queuedRecords.length === 0}
        >
          Sync Now
        </Button>
      </Box>

      {status && !status.is_online && (
        <Alert severity="warning" sx={{ mb: 2 }}>
          System is offline. Records will be synced automatically when connection is restored.
        </Alert>
      )}

      {status && status.failed > 0 && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {status.failed} record(s) failed to sync. Check logs for details.
        </Alert>
      )}

      {queuedRecords.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <CheckIcon sx={{ fontSize: 48, color: 'success.main', mb: 2 }} />
            <Typography variant="h6">All Synced!</Typography>
            <Typography variant="body2" color="textSecondary">
              No pending records in the queue
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
          {queuedRecords.map((record) => (
            <Card key={record.id} sx={{ mb: 2 }}>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                  <Typography variant="subtitle2">{record.id}</Typography>
                  <Chip
                    label={record.sync_status}
                    size="small"
                    color={
                      record.sync_status === 'pending'
                        ? 'warning'
                        : record.sync_status === 'syncing'
                        ? 'info'
                        : record.sync_status === 'failed'
                        ? 'error'
                        : 'default'
                    }
                  />
                </Box>
                <Typography variant="body2" color="textSecondary">
                  User: {record.data.user_id}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Date: {record.data.date}
                </Typography>
                <Typography variant="body2" color="textSecondary">
                  Queued: {new Date(record.queued_at).toLocaleString()}
                </Typography>
                {record.retry_count > 0 && (
                  <Typography variant="body2" color="error">
                    Retry Count: {record.retry_count}/3
                  </Typography>
                )}
              </CardContent>
            </Card>
          ))}
        </List>
      )}
    </Box>
  );

  const renderHistory = () => (
    <Box>
      <Typography variant="h6" sx={{ mb: 2 }}>
        Sync History ({syncHistory.length})
      </Typography>

      {syncHistory.length === 0 ? (
        <Card>
          <CardContent sx={{ textAlign: 'center', py: 4 }}>
            <HistoryIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
            <Typography variant="h6">No History</Typography>
            <Typography variant="body2" color="textSecondary">
              Sync history will appear here
            </Typography>
          </CardContent>
        </Card>
      ) : (
        <List>
          {syncHistory.map((item, index) => (
            <React.Fragment key={index}>
              <ListItem>
                <ListItemText
                  primary={item.queue_id}
                  secondary={`Synced at ${new Date(item.synced_at).toLocaleString()}`}
                />
                <Chip
                  label={item.status}
                  size="small"
                  color={item.status === 'success' ? 'success' : 'error'}
                  icon={item.status === 'success' ? <CheckIcon /> : <ErrorIcon />}
                />
              </ListItem>
              {index < syncHistory.length - 1 && <Divider />}
            </React.Fragment>
          ))}
        </List>
      )}
    </Box>
  );

  return (
    <>
      <Tooltip title={status?.is_online ? 'Online' : 'Offline'}>
        <IconButton onClick={() => setDrawerOpen(true)} color="inherit">
          <Badge badgeContent={status?.queue_size || 0} color={getStatusColor()}>
            {getStatusIcon()}
          </Badge>
        </IconButton>
      </Tooltip>

      <Drawer anchor="right" open={drawerOpen} onClose={() => setDrawerOpen(false)}>
        <Box sx={{ width: 400, p: 3 }}>
          {/* Header */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="h5" gutterBottom>
              Offline Mode
            </Typography>
            {status && (
              <Card sx={{ bgcolor: status.is_online ? 'success.light' : 'error.light' }}>
                <CardContent>
                  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <Box>
                      <Typography variant="h6" color="white">
                        {status.is_online ? 'Online' : 'Offline'}
                      </Typography>
                      <Typography variant="body2" color="white">
                        {status.queue_size} record(s) in queue
                      </Typography>
                    </Box>
                    {status.is_online ? (
                      <OnlineIcon sx={{ fontSize: 48, color: 'white' }} />
                    ) : (
                      <OfflineIcon sx={{ fontSize: 48, color: 'white' }} />
                    )}
                  </Box>
                </CardContent>
              </Card>
            )}
          </Box>

          {/* Status Cards */}
          {status && (
            <Box sx={{ display: 'flex', gap: 1, mb: 3 }}>
              <Card sx={{ flex: 1 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Pending
                  </Typography>
                  <Typography variant="h5" color="warning.main">
                    {status.pending}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Syncing
                  </Typography>
                  <Typography variant="h5" color="info.main">
                    {status.syncing}
                  </Typography>
                </CardContent>
              </Card>
              <Card sx={{ flex: 1 }}>
                <CardContent sx={{ textAlign: 'center' }}>
                  <Typography variant="body2" color="textSecondary">
                    Failed
                  </Typography>
                  <Typography variant="h5" color="error.main">
                    {status.failed}
                  </Typography>
                </CardContent>
              </Card>
            </Box>
          )}

          {/* Tabs */}
          <Box sx={{ display: 'flex', gap: 1, mb: 2 }}>
            <Button
              variant={activeTab === 'queue' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('queue')}
              startIcon={<QueueIcon />}
              fullWidth
            >
              Queue
            </Button>
            <Button
              variant={activeTab === 'history' ? 'contained' : 'outlined'}
              onClick={() => setActiveTab('history')}
              startIcon={<HistoryIcon />}
              fullWidth
            >
              History
            </Button>
          </Box>

          <Divider sx={{ mb: 2 }} />

          {/* Content */}
          {activeTab === 'queue' ? renderQueue() : renderHistory()}

          {/* Last Sync Info */}
          {status?.last_sync && (
            <Box sx={{ mt: 3, p: 2, bgcolor: 'grey.100', borderRadius: 1 }}>
              <Typography variant="body2" color="textSecondary">
                Last sync: {new Date(status.last_sync.timestamp).toLocaleString()}
              </Typography>
              <Typography variant="body2" color="textSecondary">
                Synced: {status.last_sync.synced} | Failed: {status.last_sync.failed}
              </Typography>
            </Box>
          )}
        </Box>
      </Drawer>
    </>
  );
};

export default OfflineModeIndicator;
