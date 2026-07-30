import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, FormControl, InputLabel, Select,
  MenuItem, Chip, Table, TableBody, TableCell, TableContainer, TableHead, TableRow
} from '@mui/material';
import { Add, Link, CheckCircle, Error, Sync } from '@mui/icons-material';

const IntegrationsPage: React.FC = () => {
  const [integrations, setIntegrations] = useState<any[]>([]);
  const [types, setTypes] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newIntegration, setNewIntegration] = useState({
    name: '',
    type: '',
    config: {}
  });

  useEffect(() => {
    fetchIntegrations();
    fetchTypes();
  }, []);

  const fetchIntegrations = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/integrations/list');
      const data = await response.json();
      setIntegrations(data.integrations || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const fetchTypes = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/integrations/types');
      const data = await response.json();
      setTypes(data.types || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreate = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/integrations/configure', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newIntegration)
      });
      if (response.ok) {
        setShowDialog(false);
        fetchIntegrations();
        setNewIntegration({ name: '', type: '', config: {} });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleTest = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/integrations/${id}/test`, { method: 'POST' });
      alert('Test completed');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleSync = async (id: string) => {
    try {
      await fetch(`http://localhost:8000/api/v1/integrations/${id}/sync`, { method: 'POST' });
      alert('Sync completed');
    } catch (error) {
      console.error('Error:', error);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Link /> API Integrations
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Connect with HR, Payroll, and Communication systems
          </Typography>
        </Box>
        <Button startIcon={<Add />} variant="contained" onClick={() => setShowDialog(true)}>
          Add Integration
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {types.slice(0, 4).map((type) => (
          <Grid item xs={12} md={3} key={type.id}>
            <Card>
              <CardContent>
                <Typography variant="h6">{type.name}</Typography>
                <Typography variant="body2" color="textSecondary" sx={{ mb: 2 }}>
                  {type.description}
                </Typography>
                <Chip
                  label={`${integrations.filter(i => i.type === type.id).length} configured`}
                  size="small"
                  color="primary"
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Configured Integrations</Typography>
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Name</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Last Sync</TableCell>
                  <TableCell>Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {integrations.map((integration) => (
                  <TableRow key={integration.id}>
                    <TableCell>{integration.name}</TableCell>
                    <TableCell>
                      <Chip label={integration.type} size="small" />
                    </TableCell>
                    <TableCell>
                      <Chip
                        icon={integration.is_active ? <CheckCircle /> : <Error />}
                        label={integration.is_active ? 'Active' : 'Inactive'}
                        color={integration.is_active ? 'success' : 'default'}
                        size="small"
                      />
                    </TableCell>
                    <TableCell>
                      {integration.last_sync ? new Date(integration.last_sync).toLocaleString() : 'Never'}
                    </TableCell>
                    <TableCell>
                      <Button size="small" onClick={() => handleTest(integration.id)}>Test</Button>
                      <Button size="small" startIcon={<Sync />} onClick={() => handleSync(integration.id)}>
                        Sync
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Integration</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Integration Name"
              value={newIntegration.name}
              onChange={(e) => setNewIntegration({ ...newIntegration, name: e.target.value })}
              fullWidth
            />
            <FormControl fullWidth>
              <InputLabel>Integration Type</InputLabel>
              <Select
                value={newIntegration.type}
                label="Integration Type"
                onChange={(e) => setNewIntegration({ ...newIntegration, type: e.target.value })}
              >
                {types.map((type) => (
                  <MenuItem key={type.id} value={type.id}>{type.name}</MenuItem>
                ))}
              </Select>
            </FormControl>
            <Typography variant="body2" color="textSecondary">
              Configuration fields will be available after selecting type
            </Typography>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleCreate}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default IntegrationsPage;
