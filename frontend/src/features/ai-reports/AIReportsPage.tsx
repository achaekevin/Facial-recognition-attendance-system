import React, { useState } from 'react';
import {
  Box, Card, CardContent, Typography, Button, Grid, Paper, Chip,
  FormControl, InputLabel, Select, MenuItem, CircularProgress
} from '@mui/material';
import { Assessment, TrendingUp, TrendingDown, AutoAwesome } from '@mui/icons-material';

const AIReportsPage: React.FC = () => {
  const [reportType, setReportType] = useState('monthly');
  const [report, setReport] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const generateReport = async () => {
    setLoading(true);
    try {
      const response = await fetch(`http://localhost:8000/api/v1/ai-reports/generate?report_type=${reportType}`);
      const data = await response.json();
      setReport(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
        <AutoAwesome color="primary" /> AI-Powered Reports
      </Typography>
      <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
        Natural language summaries with intelligent insights
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Typography variant="h6" gutterBottom>Generate Report</Typography>
              <FormControl fullWidth sx={{ mb: 2 }}>
                <InputLabel>Report Type</InputLabel>
                <Select value={reportType} label="Report Type" onChange={(e) => setReportType(e.target.value)}>
                  <MenuItem value="monthly">Monthly Summary</MenuItem>
                  <MenuItem value="weekly">Weekly Summary</MenuItem>
                  <MenuItem value="department">Department Comparison</MenuItem>
                  <MenuItem value="performance">System Performance</MenuItem>
                </Select>
              </FormControl>
              <Button
                fullWidth
                variant="contained"
                startIcon={<Assessment />}
                onClick={generateReport}
                disabled={loading}
              >
                {loading ? 'Generating...' : 'Generate AI Report'}
              </Button>
            </CardContent>
          </Card>
        </Grid>

        <Grid item xs={12} md={8}>
          {loading ? (
            <Card><CardContent sx={{ textAlign: 'center', p: 4 }}>
              <CircularProgress />
              <Typography sx={{ mt: 2 }}>Analyzing data and generating insights...</Typography>
            </CardContent></Card>
          ) : report ? (
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                  <Typography variant="h5">
                    {report.report_type.replace('_', ' ').toUpperCase()} Report
                  </Typography>
                  <Chip label={`Generated ${new Date(report.generated_at).toLocaleString()}`} size="small" />
                </Box>

                <Paper sx={{ p: 3, bgcolor: 'primary.light', color: 'white', mb: 3 }}>
                  <Typography variant="h6" gutterBottom>AI Summary</Typography>
                  <Typography variant="body1">{report.narrative}</Typography>
                </Paper>

                {report.insights && (
                  <Box sx={{ mb: 3 }}>
                    <Typography variant="h6" gutterBottom>Key Insights</Typography>
                    {report.insights.map((insight: string, idx: number) => (
                      <Chip
                        key={idx}
                        label={insight}
                        sx={{ mr: 1, mb: 1 }}
                        icon={insight.includes('increased') ? <TrendingUp /> : <TrendingDown />}
                        color={insight.includes('increased') ? 'success' : 'warning'}
                      />
                    ))}
                  </Box>
                )}

                {report.metrics && (
                  <Box>
                    <Typography variant="h6" gutterBottom>Detailed Metrics</Typography>
                    <Grid container spacing={2}>
                      {Object.entries(report.metrics).map(([key, value]: [string, any]) => (
                        <Grid item xs={6} md={4} key={key}>
                          <Paper sx={{ p: 2 }}>
                            <Typography variant="body2" color="textSecondary">
                              {key.replace(/_/g, ' ').toUpperCase()}
                            </Typography>
                            <Typography variant="h6">
                              {typeof value === 'number' ? value.toFixed(2) : value}
                            </Typography>
                          </Paper>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                )}

                {report.departments && (
                  <Box sx={{ mt: 3 }}>
                    <Typography variant="h6" gutterBottom>Department Performance</Typography>
                    {report.departments.slice(0, 5).map((dept: any) => (
                      <Paper key={dept.name} sx={{ p: 2, mb: 1 }}>
                        <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                          <Typography>{dept.name}</Typography>
                          <Chip label={`${dept.rate.toFixed(1)} rate`} size="small" color="primary" />
                        </Box>
                      </Paper>
                    ))}
                  </Box>
                )}
              </CardContent>
            </Card>
          ) : (
            <Card><CardContent sx={{ textAlign: 'center', p: 4, color: 'text.secondary' }}>
              <Assessment sx={{ fontSize: 64, mb: 2 }} />
              <Typography>Select a report type and click Generate to view AI-powered insights</Typography>
            </CardContent></Card>
          )}
        </Grid>
      </Grid>
    </Box>
  );
};

export default AIReportsPage;
