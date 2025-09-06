import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import {
  Grid,
  Card,
  CardContent,
  Typography,
  Box,
  LinearProgress,
  Chip,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material';
import {
  FolderOpen as SuiteIcon,
  Assignment as CaseIcon,
  PlayArrow as RunIcon,
  CheckCircle as SuccessIcon,
  Error as ErrorIcon,
  Refresh as RefreshIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const Dashboard = () => {
  const location = useLocation();
  const [stats, setStats] = useState({
    testSuites: 0,
    testCases: 0,
    totalActions: 0,
    lastExecution: null,
  });
  const [recentTests, setRecentTests] = useState([]);
  const [loading, setLoading] = useState(true);

  console.log('Dashboard component rendered, pathname:', location.pathname);

  useEffect(() => {
    console.log('Dashboard useEffect triggered, pathname:', location.pathname);
    // Only fetch data when we're actually on the dashboard route
    if (location.pathname === '/') {
      console.log('Dashboard: Fetching data because we are on dashboard route');
      fetchDashboardData();
    } else {
      console.log('Dashboard: NOT fetching data because we are NOT on dashboard route');
    }
  }, [location.pathname]);

  // Early return to prevent rendering when not on dashboard route
  if (location.pathname !== '/') {
    console.log('Dashboard: Not rendering because we are not on dashboard route, pathname:', location.pathname);
    return null;
  }

  const fetchDashboardData = async () => {
    console.log('Dashboard: fetchDashboardData called - making API calls');
    try {
      setLoading(true);
      const [suitesResponse, casesResponse] = await Promise.all([
        apiService.getTestSuites(),
        apiService.getTestCases(),
      ]);

      const suites = suitesResponse.data || [];
      const cases = casesResponse.data || [];

      setStats({
        testSuites: suites.length,
        testCases: cases.length,
        totalActions: cases.reduce((sum, testCase) => sum + (testCase.actionCount || 0), 0),
        lastExecution: new Date().toISOString(),
      });

      // Set some mock recent test data
      setRecentTests([
        { id: 1, name: 'Valid Login Test', status: 'passed', duration: '2.3s', timestamp: '2 hours ago' },
        { id: 2, name: 'Navigation Test', status: 'failed', duration: '1.8s', timestamp: '4 hours ago' },
        { id: 3, name: 'Form Validation', status: 'passed', duration: '3.1s', timestamp: '6 hours ago' },
      ]);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const StatCard = ({ title, value, icon, color = 'primary' }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Box>
            <Typography color="textSecondary" gutterBottom variant="h6">
              {title}
            </Typography>
            <Typography variant="h3" component="div">
              {loading ? '-' : value}
            </Typography>
          </Box>
          <Box sx={{ color: `${color}.main` }}>
            {icon}
          </Box>
        </Box>
      </CardContent>
    </Card>
  );

  const getStatusIcon = (status) => {
    switch (status) {
      case 'passed':
        return <SuccessIcon color="success" />;
      case 'failed':
        return <ErrorIcon color="error" />;
      default:
        return <RunIcon color="action" />;
    }
  };

  const getStatusChip = (status) => (
    <Chip
      label={status.toUpperCase()}
      color={status === 'passed' ? 'success' : status === 'failed' ? 'error' : 'default'}
      size="small"
    />
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Dashboard
        </Typography>
        <IconButton onClick={fetchDashboardData} disabled={loading}>
          <RefreshIcon />
        </IconButton>
      </Box>

      {loading && <LinearProgress sx={{ mb: 2 }} />}

      <Grid container spacing={3}>
        {/* Statistics Cards */}
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Test Suites"
            value={stats.testSuites}
            icon={<SuiteIcon fontSize="large" />}
            color="primary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Test Cases"
            value={stats.testCases}
            icon={<CaseIcon fontSize="large" />}
            color="secondary"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Total Actions"
            value={stats.totalActions}
            icon={<RunIcon fontSize="large" />}
            color="info"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="Success Rate"
            value="87%"
            icon={<SuccessIcon fontSize="large" />}
            color="success"
          />
        </Grid>

        {/* Recent Test Executions */}
        <Grid item xs={12}>
          <Card>
            <CardContent>
              <Typography variant="h6" component="h2" gutterBottom>
                Recent Test Executions
              </Typography>
              <TableContainer component={Paper} elevation={0}>
                <Table>
                  <TableHead>
                    <TableRow>
                      <TableCell>Test Name</TableCell>
                      <TableCell>Status</TableCell>
                      <TableCell>Duration</TableCell>
                      <TableCell>Executed</TableCell>
                      <TableCell>Actions</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {recentTests.map((test) => (
                      <TableRow key={test.id}>
                        <TableCell>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            {getStatusIcon(test.status)}
                            <Typography sx={{ ml: 1 }}>{test.name}</Typography>
                          </Box>
                        </TableCell>
                        <TableCell>{getStatusChip(test.status)}</TableCell>
                        <TableCell>{test.duration}</TableCell>
                        <TableCell>{test.timestamp}</TableCell>
                        <TableCell>
                          <IconButton size="small">
                            <RunIcon />
                          </IconButton>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
            </CardContent>
          </Card>
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;

