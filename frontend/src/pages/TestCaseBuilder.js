import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  Button,
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
  List,
  ListItem,
  ListItemText,
  ListItemIcon,
  ListItemSecondaryAction,
  Divider,
  Chip,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Fab,
  Tooltip,
} from '@mui/material';
import {
  Add as AddIcon,
  DragIndicator as DragIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  PlayArrow as PlayIcon,
  Save as SaveIcon,
  ExpandMore as ExpandMoreIcon,
  Search as SearchIcon,
  Mouse as ClickIcon,
  Keyboard as TypeIcon,
  Navigation as NavigateIcon,
  Schedule as WaitIcon,
  CheckCircle as AssertIcon,
  List as SelectIcon,
  TouchApp as HoverIcon,
  UnfoldMore as ScrollIcon,
  Visibility as ViewIcon,
  GetApp as DownloadIcon,
  Upload as UploadIcon,
  Refresh as RefreshIcon,
  Close as CloseIcon,
  Warning as AlertIcon,
  Info as InfoIcon,
  Error as ErrorIcon,
  CheckBox as CheckboxIcon,
  RadioButtonChecked as RadioIcon,
  ToggleOn as ToggleIcon,
  ContentCopy as CopyIcon,
  ContentPaste as PasteIcon,
  Delete as ClearIcon,
  FilterList as FilterIcon,
  Sort as SortIcon,
  FindInPage as FindIcon,
  Link as LinkIcon,
  OpenInNew as NewTabIcon,
  Fullscreen as MaximizeIcon,
  FullscreenExit as MinimizeIcon,
  Settings as SettingsIcon,
  Code as CodeIcon,
  Functions as FunctionIcon,
  Storage as StorageIcon,
  CloudUpload as CloudIcon,
  Security as SecurityIcon,
  Lock as LockIcon,
  LockOpen as UnlockIcon,
  Person as UserIcon,
  Group as GroupIcon,
  Email as EmailIcon,
  Phone as PhoneIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AccessTime as TimeIcon,
  AttachFile as AttachIcon,
  Image as ImageIcon,
  VideoLibrary as VideoIcon,
  AudioFile as AudioIcon,
  Description as DocumentIcon,
  TableChart as TableIcon,
  BarChart as ChartIcon,
  PieChart as PieChartIcon,
  TrendingUp as TrendingIcon,
  Analytics as AnalyticsIcon,
  Speed as SpeedIcon,
  Memory as MemoryIcon,
  Storage as DatabaseIcon,
  Cloud as CloudStorageIcon,
  NetworkCheck as NetworkIcon,
  Wifi as WifiIcon,
  Bluetooth as BluetoothIcon,
  Usb as UsbIcon,
  Power as PowerIcon,
  BatteryFull as BatteryIcon,
  BrightnessHigh as BrightnessIcon,
  VolumeUp as VolumeIcon,
  Mic as MicIcon,
  CameraAlt as CameraIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  Bookmark as BookmarkIcon,
  Favorite as FavoriteIcon,
  Star as StarIcon,
  ThumbUp as LikeIcon,
  ThumbDown as DislikeIcon,
  Comment as CommentIcon,
  Chat as ChatIcon,
  Forum as ForumIcon,
  Notifications as NotificationIcon,
  NotificationsOff as NotificationOffIcon,
  Help as HelpIcon,
  HelpOutline as HelpOutlineIcon,
  Info as InfoOutlineIcon,
  Warning as WarningIcon,
  Error as ErrorOutlineIcon,
  CheckCircle as SuccessIcon,
  Cancel as CancelIcon,
  Done as DoneIcon,
  Clear as ClearAllIcon,
  Backspace as BackspaceIcon,
  Undo as UndoIcon,
  Redo as RedoIcon,
  ContentCut as CutIcon,
  ContentCopy as CopyAllIcon,
  ContentPaste as PasteAllIcon,
  SelectAll as SelectAllIcon,
  Deselect as DeselectIcon,
  Highlight as HighlightIcon,
  FormatBold as BoldIcon,
  FormatItalic as ItalicIcon,
  FormatUnderlined as UnderlineIcon,
  FormatStrikethrough as StrikethroughIcon,
  FormatColorText as TextColorIcon,
  FormatColorFill as FillColorIcon,
  FormatSize as FontSizeIcon,
  FormatAlignLeft as AlignLeftIcon,
  FormatAlignCenter as AlignCenterIcon,
  FormatAlignRight as AlignRightIcon,
  FormatAlignJustify as AlignJustifyIcon,
  FormatListBulleted as BulletListIcon,
  FormatListNumbered as NumberedListIcon,
  FormatIndentIncrease as IndentIncreaseIcon,
  FormatIndentDecrease as IndentDecreaseIcon,
  FormatLineSpacing as LineSpacingIcon,
  VerticalAlignTop as AlignTopIcon,
  VerticalAlignCenter as AlignMiddleIcon,
  VerticalAlignBottom as AlignBottomIcon,
  HorizontalRule as HorizontalRuleIcon,
  BorderAll as BorderAllIcon,
  BorderClear as BorderClearIcon,
  BorderOuter as BorderOuterIcon,
  BorderInner as BorderInnerIcon,
  BorderTop as BorderTopIcon,
  BorderBottom as BorderBottomIcon,
  BorderLeft as BorderLeftIcon,
  BorderRight as BorderRightIcon,
  BorderStyle as BorderStyleIcon,
  BorderColor as BorderColorIcon,
  Palette as PaletteIcon,
  ColorLens as ColorLensIcon,
  Gradient as GradientIcon,
  Opacity as OpacityIcon,
  BlurOn as BlurIcon,
  FilterVintage as VintageIcon,
  FilterBAndW as BAndWIcon,
  FilterCenterFocus as CenterFocusIcon,
  FilterFrames as FramesIcon,
  FilterHDR as HDRIcon,
  FilterNone as NoneIcon,
  FilterTiltShift as TiltShiftIcon,
  AutoFixHigh as AutoFixIcon,
  AutoFixNormal as AutoFixNormalIcon,
  AutoFixOff as AutoFixOffIcon,
  AutoAwesome as AutoAwesomeIcon,
  AutoAwesomeMotion as AutoAwesomeMotionIcon,
  AutoAwesomeMosaic as AutoAwesomeMosaicIcon,
  AutoStories as AutoStoriesIcon,
  AutoGraph as AutoGraphIcon,
  AutoMode as AutoModeIcon,
  AutoDelete as AutoDeleteIcon,
  AutoRenew as AutoRenewIcon,
} from '@mui/icons-material';
import { apiService } from '../services/api';

const TestCaseBuilder = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const [testCase, setTestCase] = useState(null);
  const [testSuites, setTestSuites] = useState([]);
  const [actions, setActions] = useState([]);
  const [actionDefinitions, setActionDefinitions] = useState([]);
  const [openActionDialog, setOpenActionDialog] = useState(false);
  const [editingAction, setEditingAction] = useState(null);
  const [selectedActionType, setSelectedActionType] = useState('');
  const [actionFormData, setActionFormData] = useState({});
  const [testCaseFormData, setTestCaseFormData] = useState({
    name: '',
    description: '',
    testSuiteId: '',
    priority: 'medium',
    expectedResult: '',
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredActions, setFilteredActions] = useState([]);

  const actionIcons = {
    // Basic Interactions
    click: <ClickIcon />,
    doubleClick: <ClickIcon />,
    rightClick: <ClickIcon />,
    type: <TypeIcon />,
    clear: <ClearIcon />,
    hover: <HoverIcon />,
    drag: <DragIcon />,
    drop: <DragIcon />,
    
    // Navigation
    navigate: <NavigateIcon />,
    goBack: <NavigateIcon />,
    goForward: <NavigateIcon />,
    refresh: <RefreshIcon />,
    
    // Selection & Input
    select: <SelectIcon />,
    selectByText: <SelectIcon />,
    selectByValue: <SelectIcon />,
    selectByIndex: <SelectIcon />,
    checkbox: <CheckboxIcon />,
    radio: <RadioIcon />,
    toggle: <ToggleIcon />,
    
    // Validation & Assertions
    assert: <AssertIcon />,
    assertText: <AssertIcon />,
    assertElement: <AssertIcon />,
    assertVisible: <ViewIcon />,
    assertHidden: <ViewIcon />,
    assertEnabled: <AssertIcon />,
    assertDisabled: <AssertIcon />,
    assertSelected: <AssertIcon />,
    assertNotSelected: <AssertIcon />,
    assertValue: <AssertIcon />,
    assertAttribute: <AssertIcon />,
    assertTitle: <AssertIcon />,
    assertUrl: <AssertIcon />,
    assertCount: <AssertIcon />,
    
    // Timing & Waits
    wait: <WaitIcon />,
    waitForElement: <WaitIcon />,
    waitForText: <WaitIcon />,
    waitForVisible: <WaitIcon />,
    waitForHidden: <WaitIcon />,
    waitForEnabled: <WaitIcon />,
    waitForDisabled: <WaitIcon />,
    waitForClickable: <WaitIcon />,
    waitForUrl: <WaitIcon />,
    waitForTitle: <WaitIcon />,
    sleep: <WaitIcon />,
    
    // Scrolling & Viewport
    scroll: <ScrollIcon />,
    scrollToElement: <ScrollIcon />,
    scrollToTop: <ScrollIcon />,
    scrollToBottom: <ScrollIcon />,
    scrollIntoView: <ScrollIcon />,
    
    // Window & Browser
    maximize: <MaximizeIcon />,
    minimize: <MinimizeIcon />,
    resize: <MaximizeIcon />,
    close: <CloseIcon />,
    switchWindow: <NewTabIcon />,
    switchTab: <NewTabIcon />,
    newTab: <NewTabIcon />,
    closeTab: <CloseIcon />,
    
    // Alerts & Dialogs
    acceptAlert: <AlertIcon />,
    dismissAlert: <AlertIcon />,
    getAlertText: <AlertIcon />,
    setAlertText: <AlertIcon />,
    
    // File Operations
    upload: <UploadIcon />,
    download: <DownloadIcon />,
    attachFile: <AttachIcon />,
    
    // Data & Variables
    setVariable: <CodeIcon />,
    getVariable: <CodeIcon />,
    clearVariable: <ClearIcon />,
    incrementVariable: <CodeIcon />,
    decrementVariable: <CodeIcon />,
    
    // Database & API
    executeQuery: <DatabaseIcon />,
    apiCall: <NetworkIcon />,
    getResponse: <NetworkIcon />,
    setHeader: <NetworkIcon />,
    
    // Screenshots & Recording
    screenshot: <CameraIcon />,
    startRecording: <VideoIcon />,
    stopRecording: <VideoIcon />,
    
    // Utility Actions
    executeScript: <CodeIcon />,
    evaluateScript: <CodeIcon />,
    switchFrame: <NewTabIcon />,
    switchToDefaultContent: <NewTabIcon />,
    getText: <TypeIcon />,
    getAttribute: <TypeIcon />,
    getCssValue: <TypeIcon />,
    getLocation: <LocationIcon />,
    getSize: <TypeIcon />,
    isDisplayed: <ViewIcon />,
    isEnabled: <AssertIcon />,
    isSelected: <AssertIcon />,
    
    // Mobile Actions
    swipe: <HoverIcon />,
    pinch: <HoverIcon />,
    tap: <HoverIcon />,
    longPress: <HoverIcon />,
    rotate: <HoverIcon />,
    
    // Default fallback
    default: <PlayIcon />
  };

  useEffect(() => {
    fetchActionDefinitions();
    fetchTestSuites();
    
    // Check if we're coming from a specific test suite
    const suiteId = searchParams.get('suiteId');
    if (suiteId && !id) {
      setTestCaseFormData(prev => ({
        ...prev,
        testSuiteId: suiteId,
      }));
    }
    
    if (id) {
      fetchTestCase(id);
      // fetchTestActions(id); // Removed - actions are now fetched with test case data
    }
  }, [id, searchParams]);

  // Filter actions based on search query
  useEffect(() => {
    if (!searchQuery.trim()) {
      setFilteredActions(actionDefinitions);
    } else {
      const filtered = actionDefinitions.filter(action => 
        action.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.actionType.toLowerCase().includes(searchQuery.toLowerCase()) ||
        action.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredActions(filtered);
    }
  }, [actionDefinitions, searchQuery]);

  const fetchActionDefinitions = async () => {
    try {
      const response = await apiService.getActionDefinitions();
      setActionDefinitions(response.data || []);
    } catch (error) {
      console.error('Error fetching action definitions:', error);
    }
  };

  const fetchTestSuites = async () => {
    try {
      const response = await apiService.getTestSuites();
      setTestSuites(response.data || []);
    } catch (error) {
      console.error('Error fetching test suites:', error);
    }
  };

  const fetchTestCase = async (testCaseId) => {
    try {
      const response = await apiService.getTestCase(testCaseId);
      const testCaseData = response.data.testCase;
      setTestCase(testCaseData);
      // Set actions from the test case data instead of making a separate API call
      setActions(testCaseData.actions || []);
      setTestCaseFormData({
        name: testCaseData.name,
        description: testCaseData.description,
        testSuiteId: testCaseData.testSuiteId,
        priority: testCaseData.priority,
        expectedResult: testCaseData.expectedResult,
      });
    } catch (error) {
      console.error('Error fetching test case:', error);
    }
  };

  // fetchTestActions function removed - actions are now fetched with test case data

  const handleSaveTestCase = async () => {
    try {
      if (id) {
        // Update existing test case
        await apiService.updateTestCase(id, testCaseFormData);
        
        // Get current actions from backend to compare with local state
        const currentTestCase = await apiService.getTestCase(id);
        const currentActions = currentTestCase.data.testCase.actions || [];
        
        // Find actions to create, update, or delete
        const actionsToCreate = actions.filter(action => action.id.toString().startsWith('temp_'));
        const actionsToUpdate = actions.filter(action => 
          !action.id.toString().startsWith('temp_') && 
          currentActions.some(current => current.id === action.id)
        );
        const actionsToDelete = currentActions.filter(current => 
          !actions.some(action => action.id === current.id)
        );
        
        console.log('Actions to create:', actionsToCreate.length);
        console.log('Actions to update:', actionsToUpdate.length);
        console.log('Actions to delete:', actionsToDelete.length);
        
        // Create new actions
        for (const action of actionsToCreate) {
          const actionData = { ...action };
          delete actionData.id; // Remove temporary ID
          await apiService.createTestAction(id, actionData);
        }
        
        // Update existing actions
        for (const action of actionsToUpdate) {
          const actionData = {
            ...action,
            testCaseId: id // Ensure testCaseId is included
          };
          await apiService.updateTestAction(action.id, actionData);
        }
        
        // Delete removed actions
        for (const action of actionsToDelete) {
          await apiService.deleteTestAction(action.id);
        }
        
        // Refresh the test case data to get updated actions
        await fetchTestCase(id);
        
        console.log('✅ Test case and all actions saved successfully');
      } else {
        // Create new test case
        const response = await apiService.createTestCase(testCaseFormData);
        const newTestCaseId = response.data.id;
        
        // Save any local actions to the backend
        if (actions.length > 0) {
          for (const action of actions) {
            if (action.id.toString().startsWith('temp_')) {
              // This is a temporary action, save it to backend
              const actionData = {
                ...action,
                testCaseId: newTestCaseId,
              };
              delete actionData.id; // Remove temporary ID
              await apiService.createTestAction(newTestCaseId, actionData);
            }
          }
        }
        
        navigate(`/test-case-builder/${newTestCaseId}`);
      }
    } catch (error) {
      console.error('Error saving test case:', error);
      alert('Failed to save test case. Please try again.');
    }
  };

  const handleOpenActionDialog = (action = null) => {
    if (action) {
      setEditingAction(action);
      // Use action.type or action.actionType (both are supported)
      setSelectedActionType(action.type || action.actionType);
      setActionFormData({
        name: action.name,
        description: action.description,
        parameters: action.parameters || {},
      });
      console.log('Editing action:', action);
      console.log('Selected action type:', action.type || action.actionType);
      console.log('Action parameters:', action.parameters);
    } else {
      setEditingAction(null);
      setSelectedActionType('');
      setActionFormData({
        name: '',
        description: '',
        parameters: {},
      });
    }
    setOpenActionDialog(true);
  };

  const handleCloseActionDialog = () => {
    setOpenActionDialog(false);
    setEditingAction(null);
    setSelectedActionType('');
    setActionFormData({});
  };

  const handleActionTypeChange = (actionType) => {
    setSelectedActionType(actionType);
    const actionDef = actionDefinitions.find(def => def.actionType === actionType);
    if (actionDef) {
      const defaultParams = {};
      if (actionDef.parameterSchema && actionDef.parameterSchema.parameters) {
        actionDef.parameterSchema.parameters.forEach(param => {
          // Set appropriate defaults for specific parameters
          if (param.name === 'action' && actionType === 'navigate') {
            defaultParams[param.name] = 'goto'; // Default to 'goto' for navigate action
          } else if (param.type === 'select' && param.options && param.options.length > 0) {
            defaultParams[param.name] = param.options[0].value; // Use first option as default
          } else {
          defaultParams[param.name] = param.default || '';
          }
        });
      }
      // Special handling for navigate action - always add the action parameter
      if (actionType === 'navigate' && !defaultParams.action) {
        defaultParams.action = 'goto';
        console.log('Added missing action parameter for navigate action in form:', defaultParams.action);
      }

      setActionFormData(prev => ({
        ...prev,
        name: actionDef.name,
        parameters: defaultParams,
      }));
    }
  };

  const handleParameterChange = (paramName, value) => {
    setActionFormData(prev => ({
      ...prev,
      parameters: {
        ...prev.parameters,
        [paramName]: value,
      },
    }));
  };

  const handleSaveAction = () => {
    try {
      const actionData = {
        testCaseId: id,
        type: selectedActionType,
        actionType: selectedActionType, // Keep both for compatibility
        name: actionFormData.name,
        description: actionFormData.description,
        parameters: actionFormData.parameters,
        orderIndex: editingAction ? editingAction.orderIndex : actions.length + 1,
        enabled: true,
      };
      
      console.log('Updating local action data:', actionData); // Debug log

      // Always update local state - no API calls here
      if (editingAction) {
        // Update existing action in local state
        setActions(prev => prev.map(action => 
          action.id === editingAction.id ? { ...actionData, id: editingAction.id } : action
        ));
        console.log(`✅ Updated ${actionData.name} in local state`);
      } else {
        // Add new action to local state
        const newAction = {
          ...actionData,
          id: `temp_${Date.now()}`, // Temporary ID
        };
        setActions(prev => [...prev, newAction]);
        console.log(`✅ Added ${actionData.name} to local state`);
      }
      
      handleCloseActionDialog();
    } catch (error) {
      console.error('Error updating action:', error);
      alert('Failed to update action. Please try again.');
    }
  };

  const handleDeleteAction = (actionId) => {
    if (window.confirm('Are you sure you want to delete this action?')) {
      try {
        // Always delete from local state - no API calls here
        setActions(prev => prev.filter(action => action.id !== actionId));
        console.log(`✅ Deleted action ${actionId} from local state`);
      } catch (error) {
        console.error('Error deleting action:', error);
        alert('Failed to delete action. Please try again.');
      }
    }
  };

  const handleAddActionDirectly = async (actionDef) => {
    console.log('handleAddActionDirectly called with actionDef:', actionDef);
    console.log('Action type:', actionDef?.actionType);
    console.log('Action name:', actionDef?.name);
    console.log('Parameter schema:', actionDef?.parameterSchema);

    try {
      // Create default parameters based on action definition
      const defaultParams = {};
      if (actionDef.parameterSchema?.parameters) {
        console.log('Processing parameters for action:', actionDef.actionType);
        actionDef.parameterSchema.parameters.forEach(param => {
          console.log('Processing parameter:', param.name, 'required:', param.required, 'type:', param.type);
          if (param.default !== undefined) {
            defaultParams[param.name] = param.default;
            console.log('Set default value for', param.name, ':', param.default);
          } else if (param.required) {
            // Set some sensible defaults for required fields
            if (param.name === 'action' && actionDef.actionType === 'navigate') {
              defaultParams[param.name] = 'goto'; // Default to 'goto' for navigate action
              console.log('Set action parameter to "goto" for navigate action');
            } else if (param.type === 'select' && param.options && param.options.length > 0) {
              defaultParams[param.name] = param.options[0].value; // Use first option as default
              console.log('Set select parameter', param.name, 'to first option:', param.options[0].value);
            } else {
            switch (param.type) {
              case 'string':
                if (param.name.toLowerCase().includes('locator')) {
                  defaultParams[param.name] = '#element-id';
                } else if (param.name.toLowerCase().includes('text')) {
                  defaultParams[param.name] = 'Sample text';
                } else if (param.name.toLowerCase().includes('url')) {
                  defaultParams[param.name] = 'https://example.com';
                } else {
                  defaultParams[param.name] = param.placeholder || 'value';
                }
                break;
              case 'number':
                defaultParams[param.name] = param.min || 1000;
                break;
              case 'boolean':
                defaultParams[param.name] = false;
                break;
              default:
                defaultParams[param.name] = '';
              }
            }
          }
        });
      }

      // Special handling for navigate action - always add the action parameter
      if (actionDef.actionType === 'navigate' && !defaultParams.action) {
        defaultParams.action = 'goto';
        console.log('Added missing action parameter for navigate action:', defaultParams.action);
      }

      console.log('Final defaultParams object:', defaultParams); // Debug log
      const newAction = {
        type: actionDef.actionType,
        actionType: actionDef.actionType, // Keep both for compatibility
        parameters: defaultParams,
        description: `${actionDef.name} action`,
        name: actionDef.name,
        orderIndex: actions.length + 1,
        enabled: true,
        testCaseId: id
      };
      
      console.log('Final defaultParams:', defaultParams); // Debug log
      console.log('Sending new action data:', newAction); // Debug log

      if (id) {
        // Test case exists - save to backend
        await apiService.createTestAction(id, newAction);
        await fetchTestCase(id); // Refresh test case data (includes actions)
      } else {
        // Test case doesn't exist yet - store locally
        const localAction = {
          ...newAction,
          id: `temp_${Date.now()}`, // Temporary ID
        };
        setActions(prev => [...prev, localAction]);
      }
      
      // Show success feedback
      console.log(`✅ Added ${actionDef.name} to test sequence`);
      
    } catch (error) {
      console.error('Error adding action directly:', error);
      alert('Failed to add action. Please try again.');
    }
  };

  const renderParameterForm = () => {
    console.log('renderParameterForm called with selectedActionType:', selectedActionType);
    console.log('Available actionDefinitions:', actionDefinitions.length);
    
    const actionDef = actionDefinitions.find(def => def.actionType === selectedActionType);
    console.log('Found actionDef:', actionDef);
    
    // If no action definition found, show a generic parameter editor
    if (!actionDef || !actionDef.parameterSchema?.parameters) {
      console.log('No actionDef or parameters found - showing generic parameter editor');
      
      // Get existing parameters from the action being edited
      const existingParams = actionFormData.parameters || {};
      const paramKeys = Object.keys(existingParams);
      
      if (paramKeys.length === 0) {
        return (
          <Typography color="text.secondary">
            No parameters defined for this action type.
          </Typography>
        );
      }
      
      // Render generic parameter fields based on existing parameters
      return (
        <Box>
          {paramKeys.map((paramName) => {
            const value = existingParams[paramName];
            const isSelect = typeof value === 'string' && (
              paramName.toLowerCase().includes('action') || 
              paramName.toLowerCase().includes('type') ||
              paramName.toLowerCase().includes('method')
            );
            
            if (isSelect) {
              // Render as select for action-type parameters
              let options = [];
              if (paramName === 'action') {
                options = [
                  { value: 'goto', label: 'Go to URL' },
                  { value: 'back', label: 'Go Back' },
                  { value: 'forward', label: 'Go Forward' },
                  { value: 'refresh', label: 'Refresh Page' }
                ];
              } else if (paramName === 'method') {
                options = [
                  { value: 'GET', label: 'GET' },
                  { value: 'POST', label: 'POST' },
                  { value: 'PUT', label: 'PUT' },
                  { value: 'DELETE', label: 'DELETE' }
                ];
              } else {
                options = [{ value: value, label: value }];
              }
              
              return (
                <FormControl fullWidth key={paramName} sx={{ mb: 2 }}>
                  <InputLabel>{paramName.charAt(0).toUpperCase() + paramName.slice(1)}</InputLabel>
                  <Select
                    value={value}
                    onChange={(e) => handleParameterChange(paramName, e.target.value)}
                    label={paramName.charAt(0).toUpperCase() + paramName.slice(1)}
                  >
                    {options.map((option) => (
                      <MenuItem key={option.value} value={option.value}>
                        {option.label}
                      </MenuItem>
                    ))}
                  </Select>
                </FormControl>
              );
            } else {
              // Render as text field for other parameters
              return (
                <TextField
                  key={paramName}
                  fullWidth
                  label={paramName.charAt(0).toUpperCase() + paramName.slice(1)}
                  value={value}
                  onChange={(e) => handleParameterChange(paramName, e.target.value)}
                  placeholder={`Enter ${paramName}`}
                  sx={{ mb: 2 }}
                />
              );
            }
          })}
        </Box>
      );
    }

    return actionDef.parameterSchema.parameters.map((param) => {
      const value = actionFormData.parameters?.[param.name] || '';

      if (param.type === 'select') {
        return (
          <FormControl fullWidth key={param.name} sx={{ mb: 2 }}>
            <InputLabel>{param.name}</InputLabel>
            <Select
              value={value}
              onChange={(e) => handleParameterChange(param.name, e.target.value)}
              label={param.name}
            >
              {param.options?.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        );
      }

      return (
        <TextField
          key={param.name}
          fullWidth
          label={param.name}
          value={value}
          onChange={(e) => handleParameterChange(param.name, e.target.value)}
          placeholder={param.placeholder}
          helperText={param.description}
          type={param.type === 'number' ? 'number' : 'text'}
          required={param.required}
          sx={{ mb: 2 }}
        />
      );
    });
  };

  const ActionCard = ({ action, index }) => {
    // Extract key parameters to display
    const getActionDetails = (action) => {
      const params = action.parameters || {};
      const details = [];
      
      switch (action.actionType) {
        case 'navigate':
          if (params.url) details.push(`URL: ${params.url}`);
          break;
        case 'click':
        case 'doubleClick':
        case 'rightClick':
          if (params.locator) details.push(`Element: ${params.locator}`);
          break;
        case 'type':
          if (params.locator) details.push(`Element: ${params.locator}`);
          if (params.text) details.push(`Text: "${params.text}"`);
          break;
        case 'select':
        case 'selectByText':
        case 'selectByValue':
        case 'selectByIndex':
          if (params.locator) details.push(`Element: ${params.locator}`);
          if (params.value) details.push(`Value: ${params.value}`);
          if (params.text) details.push(`Text: ${params.text}`);
          if (params.index) details.push(`Index: ${params.index}`);
          break;
        case 'assert':
        case 'assertText':
        case 'assertElement':
        case 'assertVisible':
        case 'assertHidden':
        case 'assertEnabled':
        case 'assertDisabled':
        case 'assertSelected':
        case 'assertNotSelected':
        case 'assertValue':
        case 'assertAttribute':
          if (params.locator) details.push(`Element: ${params.locator}`);
          if (params.expectedValue) details.push(`Expected: ${params.expectedValue}`);
          if (params.attribute) details.push(`Attribute: ${params.attribute}`);
          break;
        case 'wait':
        case 'waitForElement':
        case 'waitForText':
        case 'waitForVisible':
        case 'waitForHidden':
        case 'waitForEnabled':
        case 'waitForDisabled':
        case 'waitForClickable':
          if (params.locator) details.push(`Element: ${params.locator}`);
          if (params.timeout) details.push(`Timeout: ${params.timeout}ms`);
          break;
        case 'scroll':
        case 'scrollToElement':
        case 'scrollToTop':
        case 'scrollToBottom':
        case 'scrollIntoView':
          if (params.locator) details.push(`Element: ${params.locator}`);
          if (params.direction) details.push(`Direction: ${params.direction}`);
          break;
        case 'hover':
          if (params.locator) details.push(`Element: ${params.locator}`);
          break;
        case 'upload':
        case 'attachFile':
          if (params.filePath) details.push(`File: ${params.filePath}`);
          break;
        case 'screenshot':
          if (params.fileName) details.push(`File: ${params.fileName}`);
          break;
        case 'executeScript':
        case 'evaluateScript':
          if (params.script) details.push(`Script: ${params.script.substring(0, 50)}${params.script.length > 50 ? '...' : ''}`);
          break;
        case 'setVariable':
        case 'getVariable':
          if (params.variableName) details.push(`Variable: ${params.variableName}`);
          if (params.value) details.push(`Value: ${params.value}`);
          break;
        case 'apiCall':
          if (params.url) details.push(`URL: ${params.url}`);
          if (params.method) details.push(`Method: ${params.method}`);
          break;
        default:
          // For any other action types, show available parameters
          Object.keys(params).forEach(key => {
            if (params[key] && params[key].toString().length > 0) {
              details.push(`${key}: ${params[key]}`);
            }
          });
      }
      
      return details.slice(0, 3); // Show max 3 details to avoid clutter
    };

    const actionDetails = getActionDetails(action);

    return (
      <Card sx={{ 
        mb: 1,
        transition: 'all 0.2s ease-in-out',
        '&:hover': {
          transform: 'translateY(-1px)',
          boxShadow: 2,
        }
      }}>
      <CardContent>
          <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 2 }}>
            <DragIcon sx={{ color: 'text.secondary', cursor: 'grab', mt: 0.5 }} />
            <Box sx={{ 
              color: 'primary.main',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 40,
              height: 40,
              borderRadius: 1,
              backgroundColor: 'primary.50',
              flexShrink: 0,
              mt: 0.5
            }}>
              {actionIcons[action.actionType] || actionIcons.default}
          </Box>
            <Box sx={{ flexGrow: 1, minWidth: 0 }}>
              <Typography variant="subtitle1" sx={{ mb: 0.5, fontSize: '0.9rem', fontWeight: 600 }}>
                {action.name}
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ mb: 1, fontSize: '0.8rem' }}>
              {action.description}
            </Typography>
              
              {/* Action Details */}
              {actionDetails.length > 0 && (
                <Box sx={{ mb: 1 }}>
                  {actionDetails.map((detail, idx) => (
                    <Typography 
                      key={idx}
                      variant="caption" 
                      sx={{ 
                        display: 'block',
                        color: 'text.primary',
                        backgroundColor: 'grey.100',
                        px: 1,
                        py: 0.5,
                        borderRadius: 0.5,
                        mb: 0.5,
                        fontFamily: 'monospace',
                        fontSize: '0.7rem',
                        wordBreak: 'break-all'
                      }}
                    >
                      {detail}
                    </Typography>
                  ))}
                </Box>
              )}
              
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                <Chip 
                  label={action.actionType} 
                  size="small" 
                  color="primary"
                  variant="outlined"
                  sx={{ fontSize: '0.7rem', height: 20 }}
                />
              {!action.enabled && (
                  <Chip label="Disabled" size="small" color="error" sx={{ fontSize: '0.7rem', height: 20 }} />
              )}
            </Box>
          </Box>
            <Box sx={{ display: 'flex', gap: 0.5, flexDirection: 'column' }}>
              <IconButton 
                onClick={() => handleOpenActionDialog(action)}
                size="small"
                sx={{ 
                  color: 'primary.main',
                  '&:hover': {
                    backgroundColor: 'primary.50',
                  }
                }}
              >
              <EditIcon />
            </IconButton>
              <IconButton 
                onClick={() => handleDeleteAction(action.id)}
                size="small"
                sx={{ 
                  color: 'error.main',
                  '&:hover': {
                    backgroundColor: 'error.50',
                  }
                }}
              >
              <DeleteIcon />
            </IconButton>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
  };

  return (
    <Box sx={{ width: '100%', mx: 0, px: 0, py: 1 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, px: 2 }}>
        <Typography variant="h4" component="h1">
          {id ? 'Edit Test Case' : 'Create Test Case'}
        </Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<SaveIcon />}
            onClick={handleSaveTestCase}
            sx={{ mr: 1 }}
          >
            Save Test Case
          </Button>
          {id && (
            <Button
              variant="contained"
              startIcon={<PlayIcon />}
              color="success"
            >
              Run Test
            </Button>
          )}
        </Box>
      </Box>

      {/* Compact Test Case Details at Top */}
      <Paper sx={{ p: 2, mb: 2, mx: 0, mr: 4, width: '100%' }}>
        <Typography variant="h6" gutterBottom sx={{ mb: 2 }}>
          Test Case Details
        </Typography>
        
        <Grid container spacing={2}>
          <Grid item xs={12} md={2.5}>
            <TextField
              fullWidth
              label="Test Case Name"
              value={testCaseFormData.name}
              onChange={(e) => setTestCaseFormData(prev => ({ ...prev, name: e.target.value }))}
              size="small"
              required
            />
          </Grid>
          
          <Grid item xs={12} md={1.5}>
            <FormControl fullWidth size="small" required>
              <InputLabel>Test Suite</InputLabel>
              <Select
                value={testCaseFormData.testSuiteId}
                onChange={(e) => setTestCaseFormData(prev => ({ ...prev, testSuiteId: e.target.value }))}
                label="Test Suite"
              >
                {testSuites.map((suite) => (
                  <MenuItem key={suite.id} value={suite.id}>
                    {suite.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={1.5}>
            <FormControl fullWidth size="small">
              <InputLabel>Priority</InputLabel>
              <Select
                value={testCaseFormData.priority}
                onChange={(e) => setTestCaseFormData(prev => ({ ...prev, priority: e.target.value }))}
                label="Priority"
              >
                <MenuItem value="low">Low</MenuItem>
                <MenuItem value="medium">Medium</MenuItem>
                <MenuItem value="high">High</MenuItem>
                <MenuItem value="critical">Critical</MenuItem>
              </Select>
            </FormControl>
          </Grid>
          
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="Description"
              value={testCaseFormData.description}
              onChange={(e) => setTestCaseFormData(prev => ({ ...prev, description: e.target.value }))}
              size="small"
              placeholder="Brief description"
            />
          </Grid>
          
          <Grid item xs={12} md={2.5}>
            <TextField
              fullWidth
              label="Expected Result"
              value={testCaseFormData.expectedResult}
              onChange={(e) => setTestCaseFormData(prev => ({ ...prev, expectedResult: e.target.value }))}
              size="small"
              placeholder="Expected outcome"
            />
          </Grid>
        </Grid>
      </Paper>

      <Box sx={{ display: 'flex', gap: 3, width: '100%', mx: 0, px: 0 }}>
        {/* Test Actions Library - Left Panel */}
        <Box sx={{ width: '380px', flexShrink: 0 }}>
          <Paper sx={{ p: 2, height: 'calc(100vh - 300px)', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>
            {/* Header with Search */}
            <Box sx={{ mb: 2 }}>
              <Typography variant="h6" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                📚 Action Library
                <Chip 
                  label={filteredActions.length} 
                  size="small" 
                  color="primary" 
                  variant="outlined"
                />
            </Typography>
            
              {/* Search Bar */}
              <TextField
                fullWidth
                size="small"
                placeholder="Search actions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                InputProps={{
                  startAdornment: <SearchIcon sx={{ color: 'text.secondary', mr: 1 }} />,
                  endAdornment: searchQuery && (
                    <IconButton
                      size="small"
                      onClick={() => setSearchQuery('')}
                      sx={{ color: 'text.secondary' }}
                    >
                      <CloseIcon fontSize="small" />
                    </IconButton>
                  ),
                }}
                sx={{ 
                  '& .MuiOutlinedInput-root': {
                    borderRadius: 2,
                    backgroundColor: 'grey.50',
                    '&:hover': {
                      backgroundColor: 'grey.100',
                    },
                    '&.Mui-focused': {
                      backgroundColor: 'white',
                    },
                  }
                }}
              />
            </Box>
            
            {/* Actions List */}
            <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
            {actionDefinitions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography color="text.secondary">
                  Loading actions...
                </Typography>
              </Box>
              ) : filteredActions.length === 0 ? (
                <Box sx={{ textAlign: 'center', py: 4 }}>
                  <SearchIcon sx={{ fontSize: 48, color: 'text.secondary', mb: 2 }} />
                  <Typography color="text.secondary" variant="body2">
                    No actions found for "{searchQuery}"
                  </Typography>
                  <Button 
                    size="small" 
                    onClick={() => setSearchQuery('')}
                    sx={{ mt: 1 }}
                  >
                    Clear search
                  </Button>
                </Box>
            ) : (
              <Box>
                  {searchQuery ? (
                    // Show filtered results in a flat list when searching
                    <Box>
                      {filteredActions.map((actionDef) => (
                        <Card 
                          key={actionDef.id} 
                          sx={{ 
                            mb: 1, 
                            cursor: 'pointer',
                            transition: 'all 0.2s ease-in-out',
                            '&:hover': {
                              transform: 'translateY(-1px)',
                              boxShadow: 2,
                              backgroundColor: 'primary.50',
                            }
                          }} 
                          onClick={() => handleAddActionDirectly(actionDef)}
                        >
                          <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                              <Box sx={{ 
                                color: 'primary.main',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                width: 32,
                                height: 32,
                                borderRadius: 1,
                                backgroundColor: 'primary.50',
                                flexShrink: 0
                              }}>
                                {actionIcons[actionDef.actionType] || actionIcons.default}
                              </Box>
                              <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                <Typography variant="body2" fontWeight="medium" noWrap>
                                  {actionDef.name}
                                </Typography>
                                <Typography variant="caption" color="text.secondary" noWrap>
                                  {actionDef.description}
                                </Typography>
                                <Chip 
                                  label={actionDef.category} 
                                  size="small" 
                                  variant="outlined"
                                  sx={{ mt: 0.5, fontSize: '0.7rem', height: 16 }}
                                />
                              </Box>
                              <IconButton 
                                size="small" 
                                sx={{ 
                                  color: 'primary.main',
                                  backgroundColor: 'primary.50',
                                  '&:hover': {
                                    backgroundColor: 'primary.100',
                                  }
                                }}
                              >
                                <AddIcon fontSize="small" />
                              </IconButton>
                            </Box>
                          </CardContent>
                        </Card>
                      ))}
                    </Box>
                  ) : (
                    // Show categorized view when not searching
                    ['navigation', 'interaction', 'validation', 'timing', 'alert', 'data', 'utility', 'window'].map((category) => {
                      const categoryActions = filteredActions.filter(action => action.category === category);
                  if (categoryActions.length === 0) return null;
                  
                  const categoryEmojis = {
                    navigation: '🧭',
                    interaction: '👆',
                    validation: '✅',
                    timing: '⏰',
                    alert: '⚠️',
                    data: '📊',
                    utility: '🔧',
                    window: '🪟'
                  };
                  
                  const categoryNames = {
                    navigation: 'Navigation',
                    interaction: 'Interactions',
                    validation: 'Validation',
                    timing: 'Timing',
                    alert: 'Alerts',
                    data: 'Data',
                    utility: 'Utility',
                    window: 'Window'
                  };
                  
                  return (
                        <Accordion key={category} defaultExpanded sx={{ mb: 1, boxShadow: 'none', '&:before': { display: 'none' } }}>
                          <AccordionSummary 
                            expandIcon={<ExpandMoreIcon />}
                            sx={{ 
                              backgroundColor: 'grey.50',
                              borderRadius: 1,
                              minHeight: 40,
                              '&.Mui-expanded': {
                                minHeight: 40,
                              },
                              '& .MuiAccordionSummary-content': {
                                margin: '8px 0',
                                '&.Mui-expanded': {
                                  margin: '8px 0',
                                }
                              }
                            }}
                          >
                            <Typography variant="subtitle2" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                              {categoryEmojis[category]} {categoryNames[category]}
                              <Chip 
                                label={categoryActions.length} 
                                size="small" 
                                color="primary" 
                                variant="outlined"
                                sx={{ fontSize: '0.7rem', height: 20 }}
                              />
                        </Typography>
                      </AccordionSummary>
                          <AccordionDetails sx={{ p: 1 }}>
                        {categoryActions.map((actionDef) => (
                              <Card 
                                key={actionDef.id} 
                                sx={{ 
                                  mb: 1, 
                                  cursor: 'pointer',
                                  transition: 'all 0.2s ease-in-out',
                                  '&:hover': {
                                    transform: 'translateY(-1px)',
                                    boxShadow: 2,
                                    backgroundColor: 'primary.50',
                                  }
                                }} 
                                onClick={() => handleAddActionDirectly(actionDef)}
                              >
                                <CardContent sx={{ py: 1.5, '&:last-child': { pb: 1.5 } }}>
                                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1.5 }}>
                                    <Box sx={{ 
                                      color: 'primary.main',
                                      display: 'flex',
                                      alignItems: 'center',
                                      justifyContent: 'center',
                                      width: 28,
                                      height: 28,
                                      borderRadius: 1,
                                      backgroundColor: 'primary.50',
                                      flexShrink: 0
                                    }}>
                                      {actionIcons[actionDef.actionType] || actionIcons.default}
                                    </Box>
                                    <Box sx={{ flexGrow: 1, minWidth: 0 }}>
                                      <Typography variant="body2" fontWeight="medium" noWrap>
                                    {actionDef.name}
                                  </Typography>
                                      <Typography variant="caption" color="text.secondary" noWrap>
                                    {actionDef.description}
                                  </Typography>
                                </Box>
                                    <IconButton 
                                      size="small" 
                                      sx={{ 
                                        color: 'primary.main',
                                        backgroundColor: 'primary.50',
                                        '&:hover': {
                                          backgroundColor: 'primary.100',
                                        }
                                      }}
                                    >
                                      <AddIcon fontSize="small" />
                                </IconButton>
                              </Box>
                            </CardContent>
                          </Card>
                        ))}
                      </AccordionDetails>
                    </Accordion>
                  );
                    })
                  )}
              </Box>
            )}
            </Box>
          </Paper>
        </Box>

        {/* Main Actions Panel - Right Panel */}
        <Box sx={{ width: 'calc(100% - 380px - 24px)', mr: 4 }}>
          <Paper sx={{ p: 2, height: 'calc(100vh - 300px)', overflow: 'auto', width: '100%' }}>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
              <Typography variant="h6">
                🎯 Test Actions Sequence ({actions.length})
              </Typography>
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => handleOpenActionDialog()}
                size="small"
              >
                Add Action
              </Button>
            </Box>

            {actions.length === 0 ? (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <PlayIcon sx={{ fontSize: 64, color: 'text.secondary', mb: 2 }} />
                <Typography variant="h6" color="text.secondary">
                  No actions defined
                </Typography>
                <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
                  Add your first action to build your test case
                </Typography>
                <Button
                  variant="contained"
                  startIcon={<AddIcon />}
                  onClick={() => handleOpenActionDialog()}
                >
                  Add Action
                </Button>
              </Box>
            ) : (
              <Box>
                {actions.map((action, index) => (
                  <ActionCard key={action.id} action={action} index={index} />
                ))}
              </Box>
            )}
          </Paper>
        </Box>
      </Box>

      {/* Add/Edit Action Dialog */}
      <Dialog open={openActionDialog} onClose={handleCloseActionDialog} maxWidth="md" fullWidth>
        <DialogTitle>
          {editingAction ? 'Edit Action' : 'Add New Action'}
        </DialogTitle>
        <DialogContent>
          <FormControl fullWidth sx={{ mb: 2 }}>
            <InputLabel>Action Type</InputLabel>
            <Select
              value={selectedActionType}
              onChange={(e) => handleActionTypeChange(e.target.value)}
              label="Action Type"
            >
              {actionDefinitions.map((actionDef) => (
                <MenuItem key={actionDef.id} value={actionDef.actionType}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    {actionIcons[actionDef.actionType] || <PlayIcon />}
                    <Box sx={{ ml: 1 }}>
                      <Typography>{actionDef.name}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {actionDef.description}
                      </Typography>
                    </Box>
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <TextField
            fullWidth
            label="Action Name"
            value={actionFormData.name || ''}
            onChange={(e) => setActionFormData(prev => ({ ...prev, name: e.target.value }))}
            sx={{ mb: 2 }}
          />

          <TextField
            fullWidth
            label="Description"
            value={actionFormData.description || ''}
            onChange={(e) => setActionFormData(prev => ({ ...prev, description: e.target.value }))}
            sx={{ mb: 2 }}
          />

          {selectedActionType && (
            <Accordion defaultExpanded>
              <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                <Typography>Action Parameters</Typography>
              </AccordionSummary>
              <AccordionDetails>
                {renderParameterForm()}
              </AccordionDetails>
            </Accordion>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseActionDialog}>Cancel</Button>
          <Button 
            onClick={handleSaveAction} 
            variant="contained"
            disabled={!selectedActionType || !actionFormData.name}
          >
            {editingAction ? 'Update' : 'Add'} Action
          </Button>
        </DialogActions>
      </Dialog>

      {/* Floating Action Button */}
      {id && (
        <Fab
          color="primary"
          aria-label="add action"
          sx={{ position: 'fixed', bottom: 16, right: 16 }}
          onClick={() => handleOpenActionDialog()}
        >
          <AddIcon />
        </Fab>
      )}
    </Box>
  );
};

export default TestCaseBuilder;
