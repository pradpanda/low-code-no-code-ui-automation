const express = require('express');
const Joi = require('joi');
const TestSuite = require('../models/TestSuite');
const TestCase = require('../models/TestCase');

const router = express.Router();

// Validation schemas
const createTestSuiteSchema = Joi.object({
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow(''),
  tags: Joi.array().items(Joi.string().max(50)).default([]),
  isActive: Joi.boolean().default(true)
});

const updateTestSuiteSchema = Joi.object({
  name: Joi.string().min(1).max(100),
  description: Joi.string().max(500),
  tags: Joi.array().items(Joi.string().max(50)),
  isActive: Joi.boolean()
}).min(1);

/**
 * GET /api/test-suites
 * Get all test suites with optional filtering
 */
router.get('/', async (req, res, next) => {
  try {
    const { isActive, includeCounts } = req.query;
    
    const filters = {};
    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    const testSuites = await TestSuite.findAll(filters);

    // Optionally include test case counts
    if (includeCounts === 'true') {
      for (const suite of testSuites) {
        const testCases = await TestCase.findByTestSuiteId(suite.id);
        suite.testCasesCount = testCases.length;
      }
    }

    res.json({
      success: true,
      data: testSuites,
      count: testSuites.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/test-suites/:id
 * Get a specific test suite by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { includeTestCases } = req.query;

    const testSuite = await TestSuite.findById(id);
    if (!testSuite) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test suite not found',
          status: 404
        }
      });
    }

    const result = { testSuite };

    // Optionally include test cases
    if (includeTestCases === 'true') {
      const testCases = await TestCase.findByTestSuiteId(id);
      result.testCases = testCases;
      result.testSuite.testCasesCount = testCases.length;
    }

    res.json({
      success: true,
      data: result
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/test-suites
 * Create a new test suite
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = createTestSuiteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(detail => detail.message),
          status: 400
        }
      });
    }

    // Create new test suite
    const testSuite = new TestSuite(value);
    await testSuite.save();

    res.status(201).json({
      success: true,
      data: testSuite,
      message: 'Test suite created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/test-suites/:id
 * Update a test suite
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate request body
    const { error, value } = updateTestSuiteSchema.validate(req.body);
    if (error) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Validation error',
          details: error.details.map(detail => detail.message),
          status: 400
        }
      });
    }

    // Find and update test suite
    const testSuite = await TestSuite.findById(id);
    if (!testSuite) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test suite not found',
          status: 404
        }
      });
    }

    const updatedTestSuite = await testSuite.update(value);

    res.json({
      success: true,
      data: updatedTestSuite,
      message: 'Test suite updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/test-suites/:id
 * Delete a test suite
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { force } = req.query;

    // Find test suite
    const testSuite = await TestSuite.findById(id);
    if (!testSuite) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test suite not found',
          status: 404
        }
      });
    }

    // Check if test suite has test cases
    const testCases = await TestCase.findByTestSuiteId(id);
    if (testCases.length > 0 && force !== 'true') {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Cannot delete test suite with existing test cases. Use force=true to delete anyway.',
          status: 400,
          testCasesCount: testCases.length
        }
      });
    }

    // Delete all test cases if force is true
    if (force === 'true') {
      for (const testCase of testCases) {
        await testCase.delete();
      }
    }

    // Delete test suite
    await testSuite.delete();

    res.json({
      success: true,
      message: 'Test suite deleted successfully',
      deletedTestCases: force === 'true' ? testCases.length : 0
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/test-suites/:id/test-cases
 * Get all test cases for a specific test suite
 */
router.get('/:id/test-cases', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, priority } = req.query;

    // Verify test suite exists
    const testSuite = await TestSuite.findById(id);
    if (!testSuite) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test suite not found',
          status: 404
        }
      });
    }

    // Get test cases with optional filtering
    let testCases = await TestCase.findByTestSuiteId(id);

    // Apply filters
    if (status) {
      testCases = testCases.filter(tc => tc.status === status);
    }
    if (priority) {
      testCases = testCases.filter(tc => tc.priority === priority);
    }

    res.json({
      success: true,
      data: {
        testSuite: {
          id: testSuite.id,
          name: testSuite.name
        },
        testCases,
        count: testCases.length
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/test-suites/:id/stats
 * Get statistics for a test suite
 */
router.get('/:id/stats', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Verify test suite exists
    const testSuite = await TestSuite.findById(id);
    if (!testSuite) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test suite not found',
          status: 404
        }
      });
    }

    // Get all test cases
    const testCases = await TestCase.findByTestSuiteId(id);

    // Calculate statistics
    const stats = {
      totalTestCases: testCases.length,
      statusBreakdown: {
        active: testCases.filter(tc => tc.status === 'active').length,
        inactive: testCases.filter(tc => tc.status === 'inactive').length,
        archived: testCases.filter(tc => tc.status === 'archived').length
      },
      priorityBreakdown: {
        critical: testCases.filter(tc => tc.priority === 'critical').length,
        high: testCases.filter(tc => tc.priority === 'high').length,
        medium: testCases.filter(tc => tc.priority === 'medium').length,
        low: testCases.filter(tc => tc.priority === 'low').length
      },
      executionStats: {
        totalExecutions: testCases.reduce((sum, tc) => sum + tc.executionCount, 0),
        averageExecutions: testCases.length > 0 ? 
          (testCases.reduce((sum, tc) => sum + tc.executionCount, 0) / testCases.length).toFixed(2) : 0,
        lastExecuted: testCases
          .filter(tc => tc.lastExecuted)
          .sort((a, b) => new Date(b.lastExecuted) - new Date(a.lastExecuted))[0]?.lastExecuted || null
      }
    };

    res.json({
      success: true,
      data: {
        testSuite: {
          id: testSuite.id,
          name: testSuite.name
        },
        stats
      }
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
