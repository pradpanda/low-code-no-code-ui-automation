import React, { useState, useEffect } from 'react';
import {
  Box,
  Typography,
  Grid,
  Card,
  CardContent,
  Chip,
  TextField,
  InputAdornment,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  List,
  ListItem,
  ListItemText,
  Divider,
} from '@mui/material';
import {
  Search as SearchIcon,
  ExpandMore as ExpandMoreIcon,
  Mouse as ClickIcon,
  Keyboard as TypeIcon,
  Navigation as NavigateIcon,
  Schedule as WaitIcon,
  CheckCircle as AssertIcon,
  List as SelectIcon,
  TouchApp as HoverIcon,
  UnfoldMore as ScrollIcon,
  Code as CodeIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const ActionLibrary = () => {
  const [actionDefinitions, setActionDefinitions] = useState([]);
  const [filteredActions, setFilteredActions] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [loading, setLoading] = useState(true);

  const actionIcons = {
    click: <ClickIcon />,
    type: <TypeIcon />,
    navigate: <NavigateIcon />,
    wait: <WaitIcon />,
    assert: <AssertIcon />,
    select: <SelectIcon />,
    hover: <HoverIcon />,
    scroll: <ScrollIcon />,
    default: <CodeIcon />,
  };

  const categoryColors = {
    interaction: 'primary',
    navigation: 'secondary',
    validation: 'success',
    timing: 'warning',
    default: 'default',
  };

  useEffect(() => {
    fetchActionDefinitions();
  }, []);

  useEffect(() => {
    filterActions();
  }, [actionDefinitions, searchTerm, selectedCategory]);

  const fetchActionDefinitions = async () => {
    try {
      setLoading(true);
      const response = await apiService.getActionDefinitions();
      setActionDefinitions(response.data || []);
    } catch (error) {
      console.error('Error fetching action definitions:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterActions = () => {
    let filtered = actionDefinitions;

    if (searchTerm) {
      filtered = filtered.filter(action =>
        action.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
        action.actionType.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (selectedCategory) {
      filtered = filtered.filter(action => action.category === selectedCategory);
    }

    setFilteredActions(filtered);
  };

  const getUniqueCategories = () => {
    const categories = [...new Set(actionDefinitions.map(action => action.category))];
    return categories.sort();
  };

  const renderParameterSchema = (parameterSchema) => {
    if (!parameterSchema || !parameterSchema.parameters) {
      return <Typography variant="body2" color="text.secondary">No parameters</Typography>;
    }

    return (
      <List dense>
        {parameterSchema.parameters.map((param, index) => (
          <React.Fragment key={index}>
            <ListItem>
              <ListItemText
                primary={
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Typography variant="subtitle2">{param.name}</Typography>
                    <Chip 
                      label={param.type} 
                      size="small" 
                      variant="outlined" 
                    />
                    {param.required && (
                      <Chip 
                        label="Required" 
                        size="small" 
                        color="error" 
                        variant="outlined" 
                      />
                    )}
                  </Box>
                }
                secondary={
                  <Box>
                    <Typography variant="body2" color="text.secondary">
                      {param.description}
                    </Typography>
                    {param.placeholder && (
                      <Typography variant="caption" color="text.secondary">
                        Example: {param.placeholder}
                      </Typography>
                    )}
                    {param.default && (
                      <Typography variant="caption" color="text.secondary">
                        Default: {param.default}
                      </Typography>
                    )}
                    {param.options && (
                      <Typography variant="caption" color="text.secondary">
                        Options: {param.options.map(opt => opt.label).join(', ')}
                      </Typography>
                    )}
                  </Box>
                }
              />
            </ListItem>
            {index < parameterSchema.parameters.length - 1 && <Divider />}
          </React.Fragment>
        ))}
      </List>
    );
  };

  const ActionCard = ({ action }) => (
    <Card sx={{ height: '100%' }}>
      <CardContent>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box sx={{ mr: 2, color: 'primary.main' }}>
            {actionIcons[action.actionType] || actionIcons.default}
          </Box>
          <Box sx={{ flexGrow: 1 }}>
            <Typography variant="h6" component="h3">
              {action.name}
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, mt: 1 }}>
              <Chip 
                label={action.actionType} 
                size="small" 
                variant="outlined" 
              />
              <Chip 
                label={action.category} 
                size="small" 
                color={categoryColors[action.category] || categoryColors.default}
              />
            </Box>
          </Box>
        </Box>

        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          {action.description}
        </Typography>

        <Accordion>
          <AccordionSummary expandIcon={<ExpandMoreIcon />}>
            <Typography variant="subtitle2">Parameters</Typography>
          </AccordionSummary>
          <AccordionDetails>
            {renderParameterSchema(action.parameterSchema)}
          </AccordionDetails>
        </Accordion>

        <Box sx={{ mt: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Chip 
            label={action.isActive ? 'Active' : 'Inactive'} 
            color={action.isActive ? 'success' : 'default'}
            size="small"
          />
          <Typography variant="caption" color="text.secondary">
            ID: {action.actionType}
          </Typography>
        </Box>
      </CardContent>
    </Card>
  );

  return (
    <Box>
      <Typography variant="h4" component="h1" gutterBottom>
        Action Library
      </Typography>
      
      <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
        Browse and explore all available actions for building your test cases.
      </Typography>

      {/* Filters */}
      <Box sx={{ mb: 3 }}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={6}>
            <TextField
              fullWidth
              label="Search actions"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
            />
          </Grid>
          <Grid item xs={12} md={3}>
            <FormControl fullWidth>
              <InputLabel>Category</InputLabel>
              <Select
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                label="Category"
              >
                <MenuItem value="">All Categories</MenuItem>
                {getUniqueCategories().map((category) => (
                  <MenuItem key={category} value={category}>
                    {category.charAt(0).toUpperCase() + category.slice(1)}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={3}>
            <Typography variant="body2" color="text.secondary" sx={{ pt: 2 }}>
              {filteredActions.length} of {actionDefinitions.length} actions
            </Typography>
          </Grid>
        </Grid>
      </Box>

      {/* Action Cards */}
      {loading ? (
        <Typography>Loading...</Typography>
      ) : (
        <Grid container spacing={3}>
          {filteredActions.map((action) => (
            <Grid item xs={12} sm={6} md={4} key={action.id}>
              <ActionCard action={action} />
            </Grid>
          ))}
          {filteredActions.length === 0 && (
            <Grid item xs={12}>
              <Card>
                <CardContent sx={{ textAlign: 'center', py: 4 }}>
                  <CodeIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                  <Typography variant="h6" color="text.secondary">
                    No actions found
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try adjusting your search criteria
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          )}
        </Grid>
      )}
    </Box>
  );
};

export default ActionLibrary;
