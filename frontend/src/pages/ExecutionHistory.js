import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Chip,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  TextField,
  Grid,
  Card,
  CardContent,
} from '@mui/material';
import {
  Visibility as ViewIcon,
  ExpandMore as ExpandMoreIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Schedule as PendingIcon,
  PlayArrow as RunningIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const ExecutionHistory = () => {
  const [executions, setExecutions] = useState([]);
  const [selectedExecution, setSelectedExecution] = useState(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [loading, setLoading] = useState(true);

  // Mock data for now since we don't have execution history API yet
  const mockExecutions = [
    {
      id: 1,
      testCaseId: 1,
      testCaseName: 'Valid Login Test',
      status: 'completed',
      exitCode: 0,
      duration: 2340,
      browser: 'chrome',
      headed: false,
      executedAt: '2025-09-04T09:30:00Z',
      results: {
        passed: 6,
        failed: 0,
        total: 6,
      },
      stepResults: [
        { step: 1, action: 'Navigate to Login Page', status: 'passed', duration: 500 },
        { step: 2, action: 'Enter Username', status: 'passed', duration: 200 },
        { step: 3, action: 'Enter Password', status: 'passed', duration: 150 },
        { step: 4, action: 'Click Login Button', status: 'passed', duration: 300 },
        { step: 5, action: 'Wait for Dashboard', status: 'passed', duration: 1000 },
        { step: 6, action: 'Verify Login Success', status: 'passed', duration: 190 },
      ],
    },
    {
      id: 2,
      testCaseId: 2,
      testCaseName: 'Invalid Login Test',
      status: 'failed',
      exitCode: 1,
      duration: 1800,
      browser: 'chrome',
      headed: false,
      executedAt: '2025-09-04T08:15:00Z',
      results: {
        passed: 3,
        failed: 1,
        total: 4,
      },
      stepResults: [
        { step: 1, action: 'Navigate to Login Page', status: 'passed', duration: 520 },
        { step: 2, action: 'Enter Invalid Username', status: 'passed', duration: 180 },
        { step: 3, action: 'Enter Invalid Password', status: 'passed', duration: 160 },
        { step: 4, action: 'Verify Error Message', status: 'failed', duration: 940, error: 'Element not found: .error-message' },
      ],
    },
    {
      id: 3,
      testCaseId: 3,
      testCaseName: 'Navigation Test',
      status: 'running',
      duration: null,
      browser: 'chrome',
      headed: true,
      executedAt: '2025-09-04T10:00:00Z',
      results: null,
    },
  ];

  useEffect(() => {
    fetchExecutionHistory();
  }, []);

  const fetchExecutionHistory = async () => {
    try {
      setLoading(true);
      // For now, use mock data
      // const response = await apiService.getExecutionHistory();
      // setExecutions(response.data || []);
      setExecutions(mockExecutions);
    } catch (error) {
      console.error('Error fetching execution history:', error);
      setExecutions(mockExecutions); // Fallback to mock data
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'completed':
        return <SuccessIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      case 'running':
        return <RunningIcon color="info" />;
      default:
        return <PendingIcon color="warning" />;
    }
  };

  const getStatusChip = (status) => {
    const colors = {
      completed: 'success',
      failed: 'error',
      running: 'info',
      pending: 'warning',
    };

    return (
      <Chip
        icon={getStatusIcon(status)}
        label={status.toUpperCase()}
        color={colors[status] || 'default'}
        size="small"
      />
    );
  };

  const formatDuration = (milliseconds) => {
    if (!milliseconds) return 'N/A';
    const seconds = (milliseconds / 1000).toFixed(1);
    return `${seconds}s`;
  };

  const formatDateTime = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  const handleViewDetails = (execution) => {
    setSelectedExecution(execution);
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setSelectedExecution(null);
  };

  const getStepStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <SuccessIcon color="success" fontSize="small" />;
      case 'failed':
        return <ErrorIcon color="error" fontSize="small" />;
      default:
        return <PendingIcon color="warning" fontSize="small" />;
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Execution History
        </Typography>
        <IconButton onClick={fetchExecutionHistory} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {/* Summary Cards */}
      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Total Executions
              </Typography>
              <Typography variant="h4">
                {executions.length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Successful
              </Typography>
              <Typography variant="h4" color="success.main">
                {executions.filter(e => e.status === 'completed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Failed
              </Typography>
              <Typography variant="h4" color="error.main">
                {executions.filter(e => e.status === 'failed').length}
              </Typography>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} sm={3}>
          <Card>
            <CardContent>
              <Typography color="textSecondary" gutterBottom>
                Success Rate
              </Typography>
              <Typography variant="h4" color="info.main">
                {executions.length > 0 
                  ? Math.round((executions.filter(e => e.status === 'completed').length / executions.length) * 100)
                  : 0
                }%
              </Typography>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      {/* Execution Table */}
      <TableContainer component={Paper}>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell>Test Case</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Duration</TableCell>
              <TableCell>Browser</TableCell>
              <TableCell>Executed</TableCell>
              <TableCell>Results</TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {executions.map((execution) => (
              <TableRow key={execution.id}>
                <TableCell>
                  <Typography variant="subtitle2">
                    {execution.testCaseName}
                  </Typography>
                </TableCell>
                <TableCell>
                  {getStatusChip(execution.status)}
                </TableCell>
                <TableCell>
                  {formatDuration(execution.duration)}
                </TableCell>
                <TableCell>
                  <Chip 
                    label={execution.browser} 
                    size="small" 
                    variant="outlined" 
                  />
                  {execution.headed && (
                    <Chip 
                      label="Headed" 
                      size="small" 
                      variant="outlined" 
                      sx={{ ml: 1 }} 
                    />
                  )}
                </TableCell>
                <TableCell>
                  <Typography variant="body2">
                    {formatDateTime(execution.executedAt)}
                  </Typography>
                </TableCell>
                <TableCell>
                  {execution.results ? (
                    <Typography variant="body2">
                      {execution.results.passed}✓ / {execution.results.failed}✗ / {execution.results.total}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      In Progress
                    </Typography>
                  )}
                </TableCell>
                <TableCell align="right">
                  <IconButton onClick={() => handleViewDetails(execution)}>
                    <ViewIcon />
                  </IconButton>
                </TableCell>
              </TableRow>
            ))}
            {executions.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="h6" color="text.secondary">
                    No execution history found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Run some test cases to see execution history here
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>

      {/* Execution Details Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          Execution Details - {selectedExecution?.testCaseName}
        </DialogTitle>
        <DialogContent>
          {selectedExecution && (
            <Box>
              <Grid container spacing={2} sx={{ mb: 3 }}>
                <Grid item xs={6}>
                  <TextField
                    label="Status"
                    value={selectedExecution.status}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Duration"
                    value={formatDuration(selectedExecution.duration)}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Browser"
                    value={selectedExecution.browser}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
                <Grid item xs={6}>
                  <TextField
                    label="Executed At"
                    value={formatDateTime(selectedExecution.executedAt)}
                    fullWidth
                    InputProps={{ readOnly: true }}
                  />
                </Grid>
              </Grid>

              {selectedExecution.stepResults && (
                <Accordion defaultExpanded>
                  <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                    <Typography variant="h6">Step Results</Typography>
                  </AccordionSummary>
                  <AccordionDetails>
                    <Table size="small">
                      <TableHead>
                        <TableRow>
                          <TableCell>Step</TableCell>
                          <TableCell>Action</TableCell>
                          <TableCell>Status</TableCell>
                          <TableCell>Duration</TableCell>
                          <TableCell>Error</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {selectedExecution.stepResults.map((step) => (
                          <TableRow key={step.step}>
                            <TableCell>{step.step}</TableCell>
                            <TableCell>{step.action}</TableCell>
                            <TableCell>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                {getStepStatusIcon(step.status)}
                                <Typography variant="body2" sx={{ ml: 1 }}>
                                  {step.status}
                                </Typography>
                              </Box>
                            </TableCell>
                            <TableCell>{formatDuration(step.duration)}</TableCell>
                            <TableCell>
                              {step.error && (
                                <Typography variant="body2" color="error">
                                  {step.error}
                                </Typography>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </AccordionDetails>
                </Accordion>
              )}
            </Box>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Close</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
};

export default ExecutionHistory;

