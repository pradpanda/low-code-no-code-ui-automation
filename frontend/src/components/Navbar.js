import React from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Box,
  Button,
  Chip,
} from '@mui/material';
import {
  Menu as MenuIcon,
  PlayArrow as PlayIcon,
  Stop as StopIcon,
  Notifications as NotificationsIcon,
} from '@mui/icons-material';

const Navbar = ({ onToggleSidebar }) => {
  const [isRunning, setIsRunning] = React.useState(false);

  const handleRunTests = () => {
    setIsRunning(!isRunning);
    // TODO: Implement test execution logic
  };

  return (
    <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
      <Toolbar>
        <IconButton
          edge="start"
          color="inherit"
          aria-label="menu"
          onClick={onToggleSidebar}
          sx={{ mr: 2 }}
        >
          <MenuIcon />
        </IconButton>

        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          UI Automation Platform
        </Typography>

        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Chip
            label={isRunning ? 'Tests Running' : 'Ready'}
            color={isRunning ? 'secondary' : 'default'}
            variant={isRunning ? 'filled' : 'outlined'}
            size="small"
          />

          <Button
            variant="contained"
            color={isRunning ? 'error' : 'success'}
            startIcon={isRunning ? <StopIcon /> : <PlayIcon />}
            onClick={handleRunTests}
            size="small"
          >
            {isRunning ? 'Stop' : 'Run Tests'}
          </Button>

          <IconButton color="inherit">
            <NotificationsIcon />
          </IconButton>
        </Box>
      </Toolbar>
    </AppBar>
  );
};

export default Navbar;

