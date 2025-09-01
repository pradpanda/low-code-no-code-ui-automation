const axios = require('axios')
require('dotenv').config()

class ApiClient {
  constructor(baseUrl = null) {
    this.baseUrl = baseUrl || process.env.BACKEND_URL || 'http://localhost:5000'
    this.client = axios.create({
      baseURL: this.baseUrl,
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json'
      }
    })

    // Add response interceptor for error handling
    this.client.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response) {
          const { status, data } = error.response
          console.error(`API Error ${status}:`, data)
          throw new Error(data.error?.message || `HTTP ${status} Error`)
        } else if (error.request) {
          throw new Error('Network error. Please check your connection and backend server.')
        }
        throw error
      }
    )
  }

  async healthCheck() {
    try {
      const response = await this.client.get('/health')
      return response.data
    } catch (error) {
      throw new Error(`Backend health check failed: ${error.message}`)
    }
  }

  async getTestCase(id) {
    try {
      const response = await this.client.get(`/api/test-cases/${id}`)
      return response.data.data
    } catch (error) {
      throw new Error(`Failed to fetch test case ${id}: ${error.message}`)
    }
  }

  async getTestSuite(id) {
    try {
      const response = await this.client.get(`/api/test-suites/${id}`)
      return response.data.data
    } catch (error) {
      throw new Error(`Failed to fetch test suite ${id}: ${error.message}`)
    }
  }

  async getTestSuiteWithCases(id) {
    try {
      const response = await this.client.get(`/api/test-suites/${id}/test-cases`)
      return response.data.data
    } catch (error) {
      throw new Error(`Failed to fetch test suite with cases ${id}: ${error.message}`)
    }
  }

  async updateTestCaseExecution(id, status, results = null) {
    try {
      const updateData = {
        status,
        last_executed: new Date().toISOString()
      }
      
      if (results) {
        updateData.execution_results = results
      }

      const response = await this.client.put(`/api/test-cases/${id}`, updateData)
      return response.data.data
    } catch (error) {
      console.warn(`Failed to update test case execution status: ${error.message}`)
      // Don't throw error for execution updates as they're not critical
      return null
    }
  }

  async listTestCases(filters = {}) {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value)
        }
      })

      const response = await this.client.get(`/api/test-cases?${params}`)
      return response.data.data
    } catch (error) {
      throw new Error(`Failed to list test cases: ${error.message}`)
    }
  }

  async listTestSuites(filters = {}) {
    try {
      const params = new URLSearchParams()
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          params.append(key, value)
        }
      })

      const response = await this.client.get(`/api/test-suites?${params}`)
      return response.data.data
    } catch (error) {
      throw new Error(`Failed to list test suites: ${error.message}`)
    }
  }
}

module.exports = ApiClient
