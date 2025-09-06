import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  FolderOpen as FolderIcon,
  Assignment as TestCaseIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const TestSuites = () => {
  const navigate = useNavigate();
  const [testSuites, setTestSuites] = useState([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [editingSuite, setEditingSuite] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    tags: '',
    isActive: true,
  });

  useEffect(() => {
    fetchTestSuites();
  }, []);

  const fetchTestSuites = async () => {
    try {
      setLoading(true);
      const response = await apiService.getTestSuites();
      setTestSuites(response.data || []);
    } catch (error) {
      console.error('Error fetching test suites:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenDialog = (suite = null) => {
    if (suite) {
      setEditingSuite(suite);
      setFormData({
        name: suite.name,
        description: suite.description,
        tags: Array.isArray(suite.tags) ? suite.tags.join(', ') : '',
        isActive: suite.isActive,
      });
    } else {
      setEditingSuite(null);
      setFormData({
        name: '',
        description: '',
        tags: '',
        isActive: true,
      });
    }
    setOpenDialog(true);
  };

  const handleCloseDialog = () => {
    setOpenDialog(false);
    setEditingSuite(null);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async () => {
    try {
      const dataToSubmit = {
        ...formData,
        tags: formData.tags.split(',').map(tag => tag.trim()).filter(tag => tag),
      };

      if (editingSuite) {
        await apiService.updateTestSuite(editingSuite.id, dataToSubmit);
      } else {
        await apiService.createTestSuite(dataToSubmit);
      }

      fetchTestSuites();
      handleCloseDialog();
    } catch (error) {
      console.error('Error saving test suite:', error);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this test suite?')) {
      try {
        await apiService.deleteTestSuite(id);
        fetchTestSuites();
      } catch (error) {
        console.error('Error deleting test suite:', error);
      }
    }
  };

  const handleExecute = async (id) => {
    try {
      await apiService.executeTestSuite(id);
      console.log('Test suite execution started');
    } catch (error) {
      console.error('Error executing test suite:', error);
    }
  };

  const handleSuiteClick = (suite) => {
    // Navigate to test cases page filtered by this test suite
    navigate(`/test-cases?suiteId=${suite.id}&suiteName=${encodeURIComponent(suite.name)}`);
  };

  const TestSuiteCard = ({ suite }) => (
    <Card sx={{ 
      minHeight: 280,
      maxHeight: 350,
      display: 'flex', 
      flexDirection: 'column',
      minWidth: 300,
      maxWidth: 350,
      borderRadius: 2,
      boxShadow: 2,
      cursor: 'pointer',
      overflow: 'visible',
      '&:hover': {
        boxShadow: 4,
        transform: 'translateY(-2px)',
        transition: 'all 0.3s ease-in-out',
      }
    }}
    onClick={() => handleSuiteClick(suite)}>
      <CardContent sx={{ flexGrow: 1, p: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 1.5 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', flex: 1 }}>
            <FolderIcon color="primary" sx={{ mr: 1, fontSize: 24 }} />
            <Typography variant="h6" component="h2" sx={{ 
              fontWeight: 600,
              fontSize: '1.1rem',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              whiteSpace: 'nowrap',
              maxWidth: '200px'
            }}>
              {suite.name}
            </Typography>
          </Box>
          <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.8rem' }}>
            Click to view →
          </Typography>
        </Box>
        
        <Typography variant="body2" color="text.secondary" sx={{ 
          mb: 2,
          minHeight: '40px',
          maxHeight: '60px',
          overflow: 'hidden',
          display: '-webkit-box',
          WebkitLineClamp: 3,
          WebkitBoxOrient: 'vertical',
          lineHeight: 1.4,
        }}>
          {suite.description}
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <TestCaseIcon fontSize="small" sx={{ mr: 1, color: 'primary.main' }} />
          <Typography variant="body2" color="primary.main" fontWeight={500}>
            {suite.testCasesCount || 0} test cases
          </Typography>
        </Box>

        {suite.tags && suite.tags.length > 0 && (
          <Box sx={{ 
            display: 'flex', 
            flexWrap: 'wrap', 
            gap: 0.5, 
            mb: 2,
            minHeight: '32px',
            maxHeight: '64px',
            overflow: 'hidden'
          }}>
            {suite.tags.slice(0, 4).map((tag, index) => (
              <Chip 
                key={index} 
                label={tag} 
                size="small" 
                variant="outlined"
                color="primary" 
              />
            ))}
            {suite.tags.length > 4 && (
              <Chip 
                label={`+${suite.tags.length - 4}`} 
                size="small" 
                variant="outlined"
                color="default"
              />
            )}
          </Box>
        )}

        <Box sx={{ mt: 'auto' }}>
          <Chip
            label={suite.isActive ? 'Active' : 'Inactive'}
            color={suite.isActive ? 'success' : 'default'}
            size="small"
            variant={suite.isActive ? 'filled' : 'outlined'}
          />
        </Box>
      </CardContent>

      <CardActions sx={{ 
        p: 1, 
        justifyContent: 'space-between', 
        borderTop: '1px solid', 
        borderColor: 'divider',
        flexShrink: 0,
        mt: 'auto'
      }}
        onClick={(e) => e.stopPropagation()}>
        <Tooltip title="Run Test Suite">
          <IconButton 
            color="success" 
            onClick={(e) => {
              e.stopPropagation();
              handleExecute(suite.id);
            }}
            disabled={!suite.isActive}
            size="small"
          >
            <PlayIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Edit Test Suite">
          <IconButton 
            color="primary" 
            onClick={(e) => {
              e.stopPropagation();
              handleOpenDialog(suite);
            }} 
            size="small"
          >
            <EditIcon />
          </IconButton>
        </Tooltip>
        
        <Tooltip title="Delete Test Suite">
          <IconButton 
            color="error" 
            onClick={(e) => {
              e.stopPropagation();
              handleDelete(suite.id);
            }} 
            size="small"
          >
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </CardActions>
    </Card>
  );

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h4" component="h1">
          Test Suites
        </Typography>
        <Button
          variant="contained"
          startIcon={<AddIcon />}
          onClick={() => handleOpenDialog()}
        >
          Create Test Suite
        </Button>
      </Box>

      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3} sx={{ alignItems: 'stretch' }}>
          {testSuites.map((suite) => (
            <Grid item xs={12} sm={6} lg={4} xl={3} key={suite.id} sx={{ display: 'flex' }}>
              <TestSuiteCard suite={suite} />
            </Grid>
          ))}
          {testSuites.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <FolderIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No test suites found
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                    Create your first test suite to get started
                  </Typography>
                  <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpenDialog()}
                  >
                    Create Test Suite
                  </Button>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingSuite ? 'Edit Test Suite' : 'Create New Test Suite'}
        </DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            name="name"
            label="Test Suite Name"
            fullWidth
            variant="outlined"
            value={formData.name}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="description"
            label="Description"
            fullWidth
            multiline
            rows={3}
            variant="outlined"
            value={formData.description}
            onChange={handleInputChange}
            sx={{ mb: 2 }}
          />
          <TextField
            margin="dense"
            name="tags"
            label="Tags (comma-separated)"
            fullWidth
            variant="outlined"
            value={formData.tags}
            onChange={handleInputChange}
            helperText="e.g., smoke, regression, api"
            sx={{ mb: 2 }}
          />
          <FormControl fullWidth>
            <InputLabel>Status</InputLabel>
            <Select
              name="isActive"
              value={formData.isActive}
              onChange={handleInputChange}
              label="Status"
            >
              <MenuItem value={true}>Active</MenuItem>
              <MenuItem value={false}>Inactive</MenuItem>
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseDialog}>Cancel</Button>
          <Button onClick={handleSubmit} variant="contained">
            {editingSuite ? 'Update' : 'Create'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      <Fab
        color="primary"
        aria-label="add"
        sx={{ position: 'fixed', bottom: 16, right: 16 }}
        onClick={() => handleOpenDialog()}
      >
        <AddIcon />
      </Fab>
    </Box>
  );
};

export default TestSuites;
