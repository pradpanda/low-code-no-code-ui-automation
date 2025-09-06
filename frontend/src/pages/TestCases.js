import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Button,
  Card,
  CardContent,
  CardActions,
  Grid,
  Chip,
  IconButton,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  Tooltip,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Assignment as TestCaseIcon,
  FolderOpen as SuiteIcon,
  ArrowBack as BackIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const TestCases = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [testCases, setTestCases] = useState([]);
  const [testSuites, setTestSuites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedSuite, setSelectedSuite] = useState('');
  const [selectedSuiteName, setSelectedSuiteName] = useState('');
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    console.log('TestCases: First useEffect triggered, searchParams:', searchParams.toString());
    // Check URL parameters for suite filtering
    const suiteId = searchParams.get('suiteId');
    const suiteName = searchParams.get('suiteName');
    
    if (suiteId) {
      console.log('TestCases: Setting selectedSuite to:', suiteId);
      setSelectedSuite(suiteId);
      setSelectedSuiteName(decodeURIComponent(suiteName || ''));
    } else {
      console.log('TestCases: No suiteId in URL, clearing selectedSuite');
      setSelectedSuite('');
      setSelectedSuiteName('');
    }
    
    fetchTestSuites();
    // Mark as initialized after setting up the suite selection
    setIsInitialized(true);
    // Don't call fetchTestCases here - let the second useEffect handle it
  }, [searchParams]);

  useEffect(() => {
    console.log('TestCases: Second useEffect triggered, selectedSuite:', selectedSuite, 'isInitialized:', isInitialized);
    // Only fetch test cases after the component has been initialized
    // This prevents the race condition where useEffect runs before selectedSuite is properly set
    if (isInitialized) {
      fetchTestCases();
    }
  }, [selectedSuite, isInitialized]);

  const fetchTestSuites = async () => {
    try {
      const response = await apiService.getTestSuites();
      setTestSuites(response.data || []);
    } catch (error) {
      console.error('Error fetching test suites:', error);
    }
  };

  const fetchTestCases = async () => {
    console.log('TestCases: fetchTestCases called with selectedSuite:', selectedSuite);
    try {
      setLoading(true);
      const response = await apiService.getTestCases(selectedSuite || null);
      console.log('TestCases: API response received:', response.data?.length, 'test cases');
      setTestCases(response.data || []);
    } catch (error) {
      console.error('Error fetching test cases:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this test case?')) {
      try {
        await apiService.deleteTestCase(id);
        fetchTestCases();
      } catch (error) {
        console.error('Error deleting test case:', error);
      }
    }
  };

  const handleExecute = async (id) => {
    try {
      await apiService.executeTestCase(id);
      console.log('Test case execution started');
    } catch (error) {
      console.error('Error executing test case:', error);
    }
  };

  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'critical':
        return 'error';
      case 'high':
        return 'warning';
      case 'medium':
        return 'info';
      default:
        return 'default';
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'active':
        return 'success';
      case 'inactive':
        return 'default';
      default:
        return 'warning';
    }
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Box>
          {selectedSuiteName && (
            <Button
              startIcon={<BackIcon />}
              onClick={() => navigate('/test-suites')}
              sx={{ mb: 1 }}
              size="small"
            >
              Back to Test Suites
            </Button>
          )}
          <Typography variant="h4" component="h1">
            Test Cases
          </Typography>
          {selectedSuiteName && (
            <Typography variant="h6" color="primary" sx={{ mt: 1 }}>
              📁 {selectedSuiteName}
            </Typography>
          )}
        </Box>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => {
            const url = selectedSuite 
              ? `/test-case-builder?suiteId=${selectedSuite}` 
              : '/test-case-builder';
            navigate(url);
          }}
        >
          {selectedSuiteName ? `Add Test Case to ${selectedSuiteName}` : 'Create Test Case'}
        </Button>
      </Box>

      <Box sx={{ mb: 3 }}>
        <FormControl sx={{ minWidth: 200 }}>
          <InputLabel>Filter by Test Suite</InputLabel>
          <Select
            value={selectedSuite}
            onChange={(e) => setSelectedSuite(e.target.value)}
            label="Filter by Test Suite"
          >
            <MenuItem value="">All Test Suites</MenuItem>
            {testSuites.map((suite) => (
              <MenuItem key={suite.id} value={suite.id}>
                {suite.name}
              </MenuItem>
            ))}
          </Select>
        </FormControl>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Test Case</TableCell>
                <TableCell>Test Suite</TableCell>
                <TableCell>Priority</TableCell>
                <TableCell>Status</TableCell>
                <TableCell>Actions</TableCell>
                <TableCell>Last Run</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {testCases.map((testCase) => (
                <TableRow key={testCase.id}>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <TestCaseIcon sx={{ mr: 1, color: 'primary.main' }} />
                      <Box>
                        <Typography variant="subtitle2">
                          {testCase.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {testCase.description}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <SuiteIcon sx={{ mr: 1, fontSize: 16 }} />
                      <Typography variant="body2">
                        {testSuites.find(s => s.id === testCase.testSuiteId)?.name || 'Unknown'}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={testCase.priority?.toUpperCase()}
                      color={getPriorityColor(testCase.priority)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Chip
                      label={testCase.status?.toUpperCase()}
                      color={getStatusColor(testCase.status)}
                      size="small"
                    />
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2">
                      {testCase.actionCount || 0} actions
                    </Typography>
                  </TableCell>
                  <TableCell>
                    <Typography variant="body2" color="text.secondary">
                      {testCase.lastExecuted 
                        ? new Date(testCase.lastExecuted).toLocaleDateString()
                        : 'Never'
                      }
                    </Typography>
                  </TableCell>
                  <TableCell align="right">
                    <Tooltip title="Run Test Case">
                      <IconButton 
                        color="success" 
                        onClick={() => handleExecute(testCase.id)}
                        disabled={testCase.status !== 'active'}
                      >
                        <PlayIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Edit Test Case">
                      <IconButton 
                        color="primary" 
                        onClick={() => navigate(`/test-case-builder/${testCase.id}`)}
                      >
                        <EditIcon />
                      </IconButton>
                    </Tooltip>
                    
                    <Tooltip title="Delete Test Case">
                      <IconButton 
                        color="error" 
                        onClick={() => handleDelete(testCase.id)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                </TableRow>
              ))}
              {testCases.length === 0 && (
                <TableRow>
                  <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                    <TestCaseIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 1 }} />
                    <Typography variant="h6" color="text.secondary">
                      No test cases found
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                      {selectedSuite 
                        ? 'No test cases in this test suite. Create your first test case.'
                        : 'Create your first test case to get started.'
                      }
                    </Typography>
                    <Button
                      variant="contained"
                      startIcon={<AddIcon />}
                      onClick={() => navigate('/test-case-builder')}
                    >
                      Create Test Case
                    </Button>
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}
    </Box>
  );
};

export default TestCases;
