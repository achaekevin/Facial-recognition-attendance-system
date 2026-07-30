import React, { useState, useEffect } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Checkbox, FormControlLabel,
  FormGroup, Chip, List, ListItem, ListItemText, Dialog, DialogTitle, DialogContent,
  DialogActions, TextField, Select, MenuItem, FormControl, InputLabel
} from '@mui/material';
import { Security, Add, Shield } from '@mui/icons-material';

const MultiFactorPage: React.FC = () => {
  const [policies, setPolicies] = useState<any[]>([]);
  const [showDialog, setShowDialog] = useState(false);
  const [newPolicy, setNewPolicy] = useState({
    name: '',
    description: '',
    required_factors: [] as string[],
    applies_to: 'all',
    target_ids: []
  });

  useEffect(() => {
    fetchPolicies();
  }, []);

  const fetchPolicies = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/multi-factor/policies');
      const data = await response.json();
      setPolicies(data.policies || []);
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const handleCreatePolicy = async () => {
    try {
      const response = await fetch('http://localhost:8000/api/v1/multi-factor/policies', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newPolicy)
      });
      if (response.ok) {
        setShowDialog(false);
        fetchPolicies();
        setNewPolicy({
          name: '',
          description: '',
          required_factors: [],
          applies_to: 'all',
          target_ids: []
        });
      }
    } catch (error) {
      console.error('Error:', error);
    }
  };

  const factors = [
    { id: 'face', label: 'Face Recognition', icon: '👤' },
    { id: 'geofence', label: 'Geofence Location', icon: '📍' },
    { id: 'device', label: 'Device Verification', icon: '📱' },
    { id: 'qr', label: 'QR Code', icon: '🔲' },
    { id: 'pin', label: 'PIN Code', icon: '🔢' }
  ];

  const handleFactorToggle = (factorId: string) => {
    setNewPolicy(prev => ({
      ...prev,
      required_factors: prev.required_factors.includes(factorId)
        ? prev.required_factors.filter(f => f !== factorId)
        : [...prev.required_factors, factorId]
    }));
  };

  return (
    <Box sx={{ p: 3 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          <Typography variant="h4" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
            <Shield color="primary" /> Multi-Factor Attendance
          </Typography>
          <Typography variant="body2" color="textSecondary">
            Configure authentication policies with multiple verification factors
          </Typography>
        </Box>
        <Button startIcon={<Add />} variant="contained" onClick={() => setShowDialog(true)}>
          Create Policy
        </Button>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        {factors.map((factor) => (
          <Grid item xs={12} md={2.4} key={factor.id}>
            <Card>
              <CardContent sx={{ textAlign: 'center' }}>
                <Typography variant="h3">{factor.icon}</Typography>
                <Typography variant="h6" sx={{ mt: 1 }}>{factor.label}</Typography>
                <Chip
                  label={`${policies.filter(p => p.required_factors.includes(factor.id)).length} policies`}
                  size="small"
                  sx={{ mt: 1 }}
                />
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>

      <Card>
        <CardContent>
          <Typography variant="h6" gutterBottom>Active Policies</Typography>
          <List>
            {policies.map((policy) => (
              <ListItem
                key={policy.id}
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  mb: 1,
                  bgcolor: policy.is_active ? 'background.paper' : 'action.disabledBackground'
                }}
              >
                <ListItemText
                  primary={
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                      <Security color={policy.is_active ? 'primary' : 'disabled'} />
                      <Typography variant="h6">{policy.name}</Typography>
                      <Chip
                        label={policy.is_active ? 'Active' : 'Inactive'}
                        size="small"
                        color={policy.is_active ? 'success' : 'default'}
                      />
                    </Box>
                  }
                  secondary={
                    <Box sx={{ mt: 1 }}>
                      <Typography variant="body2" color="textSecondary" sx={{ mb: 1 }}>
                        {policy.description}
                      </Typography>
                      <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap' }}>
                        {policy.required_factors.map((factor: string) => (
                          <Chip
                            key={factor}
                            label={factors.find(f => f.id === factor)?.label}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        ))}
                      </Box>
                      <Typography variant="caption" color="textSecondary" sx={{ mt: 1, display: 'block' }}>
                        Applies to: {policy.applies_to}
                      </Typography>
                    </Box>
                  }
                />
              </ListItem>
            ))}
          </List>
        </CardContent>
      </Card>

      <Dialog open={showDialog} onClose={() => setShowDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Create MFA Policy</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, mt: 2 }}>
            <TextField
              label="Policy Name"
              value={newPolicy.name}
              onChange={(e) => setNewPolicy({ ...newPolicy, name: e.target.value })}
              fullWidth
            />
            <TextField
              label="Description"
              value={newPolicy.description}
              onChange={(e) => setNewPolicy({ ...newPolicy, description: e.target.value })}
              multiline
              rows={2}
              fullWidth
            />

            <Typography variant="subtitle1">Required Factors</Typography>
            <FormGroup>
              {factors.map((factor) => (
                <FormControlLabel
                  key={factor.id}
                  control={
                    <Checkbox
                      checked={newPolicy.required_factors.includes(factor.id)}
                      onChange={() => handleFactorToggle(factor.id)}
                    />
                  }
                  label={`${factor.icon} ${factor.label}`}
                />
              ))}
            </FormGroup>

            <FormControl fullWidth>
              <InputLabel>Applies To</InputLabel>
              <Select
                value={newPolicy.applies_to}
                label="Applies To"
                onChange={(e) => setNewPolicy({ ...newPolicy, applies_to: e.target.value })}
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="department">Specific Department</MenuItem>
                <MenuItem value="role">Specific Role</MenuItem>
                <MenuItem value="user">Specific Users</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setShowDialog(false)}>Cancel</Button>
          <Button
            variant="contained"
            onClick={handleCreatePolicy}
            disabled={!newPolicy.name || newPolicy.required_factors.length === 0}
          >
            Create Policy
          </Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default MultiFactorPage;
