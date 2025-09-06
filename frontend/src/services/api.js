import axios from 'axios';

// Create axios instance with base configuration
const api = axios.create({
  baseURL: process.env.REACT_APP_API_URL || 'http://localhost:5000/api',
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor
api.interceptors.request.use(
  (config) => {
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`);
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor
api.interceptors.response.use(
  (response) => {
    return response.data;
  },
  (error) => {
    console.error('API Error:', error);
    if (error.response?.status === 401) {
      // Handle unauthorized access
      console.error('Unauthorized access');
    }
    return Promise.reject(error);
  }
);

export const apiService = {
  // Health check
  healthCheck: () => api.get('/health'),

  // Test Suites
  getTestSuites: () => api.get('/test-suites'),
  getTestSuite: (id) => api.get(`/test-suites/${id}`),
  createTestSuite: (data) => api.post('/test-suites', data),
  updateTestSuite: (id, data) => api.put(`/test-suites/${id}`, data),
  deleteTestSuite: (id) => api.delete(`/test-suites/${id}`),

  // Test Cases
  getTestCases: (suiteId = null) => {
    const url = suiteId ? `/test-cases?suiteId=${suiteId}` : '/test-cases';
    return api.get(url);
  },
  getTestCase: (id) => api.get(`/test-cases/${id}`),
  createTestCase: (data) => api.post('/test-cases', data),
  updateTestCase: (id, data) => api.put(`/test-cases/${id}`, data),
  deleteTestCase: (id) => api.delete(`/test-cases/${id}`),

  // Test Actions
  // getTestActions: (testCaseId) => api.get(`/test-actions?testCaseId=${testCaseId}`), // Removed - actions are fetched with test case data
  createTestAction: (testCaseId, data) => api.post(`/test-cases/${testCaseId}/actions`, data),
  updateTestAction: (id, data) => api.put(`/test-actions/${id}`, data),
  deleteTestAction: (id) => api.delete(`/test-actions/${id}`),
  reorderTestActions: (testCaseId, actions) => 
    api.put(`/test-actions/reorder`, { testCaseId, actions }),

  // Action Definitions
  getActionDefinitions: () => api.get('/test-actions/definitions'),
  getActionDefinition: (id) => api.get(`/test-actions/definitions/${id}`),

  // Test Execution
  executeTestCase: (testCaseId, options = {}) => 
    api.post(`/execute/${testCaseId}`, options),
  executeTestSuite: (testSuiteId, options = {}) => 
    api.post(`/execute/suite/${testSuiteId}`, options),
  getExecutionStatus: (executionId) => api.get(`/execution/${executionId}`),
  stopExecution: (executionId) => api.post(`/execution/${executionId}/stop`),

  // Execution History
  getExecutionHistory: (limit = 50) => api.get(`/execution-history?limit=${limit}`),
  getExecutionDetails: (executionId) => api.get(`/execution-history/${executionId}`),
};

export default api;
