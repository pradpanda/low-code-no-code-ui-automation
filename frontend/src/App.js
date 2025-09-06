import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Box } from '@mui/material';

// Components
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';

// Pages
import Dashboard from './pages/Dashboard';
import TestSuites from './pages/TestSuites';
import TestCases from './pages/TestCases';
import TestCaseBuilder from './pages/TestCaseBuilder';
import ActionLibrary from './pages/ActionLibrary';
import ExecutionHistory from './pages/ExecutionHistory';

const theme = createTheme({
  palette: {
    primary: {
      main: '#1976d2',
    },
    secondary: {
      main: '#dc004e',
    },
    background: {
      default: '#f5f5f5',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
  },
});

function App() {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);

  const toggleSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex' }}>
          <Navbar onToggleSidebar={toggleSidebar} />
          <Sidebar open={sidebarOpen} />
          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: 0,
              pl: 2,
              marginLeft: 0,
              marginTop: '64px',
              minHeight: 'calc(100vh - 64px)',
              overflow: 'hidden',
              transition: 'margin 0.3s',
            }}
          >
            <Routes>
              <Route path="/" element={<Dashboard />} />
              <Route path="/test-suites" element={<TestSuites />} />
              <Route path="/test-cases" element={<TestCases />} />
              <Route path="/test-case-builder/:id?" element={<TestCaseBuilder />} />
              <Route path="/action-library" element={<ActionLibrary />} />
              <Route path="/execution-history" element={<ExecutionHistory />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
}

export default App;