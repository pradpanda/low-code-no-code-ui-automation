const express = require('express');
const Joi = require('joi');
const TestCase = require('../models/TestCase');
const TestSuite = require('../models/TestSuite');
const { validateTestAction } = require('../models/TestAction');

const router = express.Router();

// Validation schemas
const testActionSchema = Joi.object({
  id: Joi.alternatives().try(Joi.string(), Joi.number()).optional(),
  type: Joi.string().required(),
  actionType: Joi.string().optional(), // Frontend sometimes sends this instead of type
  name: Joi.string().max(100),
  description: Joi.string().max(200).allow(''),
  parameters: Joi.object().required(),
  enabled: Joi.alternatives().try(Joi.boolean(), Joi.number()).default(true),
  orderIndex: Joi.number().optional(),
  actionDefinition: Joi.object().optional() // Frontend sends this extra data
}).options({ allowUnknown: true }); // Allow extra fields from frontend

const createTestCaseSchema = Joi.object({
  testSuiteId: Joi.alternatives().try(Joi.string(), Joi.number()).required(),
  name: Joi.string().min(1).max(100).required(),
  description: Joi.string().max(500).allow(''),
  actions: Joi.array().items(testActionSchema).default([]),
  tags: Joi.array().items(Joi.string().max(50)).default([]),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical').default('medium'),
  status: Joi.string().valid('active', 'inactive', 'archived').default('active'),
  expectedResult: Joi.string().max(1000).allow('')
});

const updateTestCaseSchema = Joi.object({
  testSuiteId: Joi.alternatives().try(Joi.string(), Joi.number()),
  name: Joi.string().min(1).max(100),
  description: Joi.string().max(500).allow(''), // Allow empty description
  actions: Joi.array().items(testActionSchema),
  tags: Joi.array().items(Joi.string().max(50)),
  priority: Joi.string().valid('low', 'medium', 'high', 'critical'),
  status: Joi.string().valid('active', 'inactive', 'archived'),
  expectedResult: Joi.string().max(1000).allow('') // Also allow empty expectedResult
}).min(1);

/**
 * GET /api/test-cases
 * Get all test cases with optional filtering
 */
router.get('/', async (req, res, next) => {
  try {
    const { status, priority, testSuiteId } = req.query;
    
    let testCases;
    
    if (testSuiteId) {
      testCases = await TestCase.findByTestSuiteId(testSuiteId);
    } else {
      const filters = {};
      if (status) filters.status = status;
      if (priority) filters.priority = priority;
      
      testCases = await TestCase.findAll(filters);
    }

    res.json({
      success: true,
      data: testCases,
      count: testCases.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/test-cases/:id
 * Get a specific test case by ID
 */
router.get('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    const testCase = await TestCase.findById(id);
    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test case not found',
          status: 404
        }
      });
    }

    // Get associated test suite info
    const testSuite = await TestSuite.findById(testCase.testSuiteId);

    res.json({
      success: true,
      data: {
        testCase,
        testSuite: testSuite ? {
          id: testSuite.id,
          name: testSuite.name
        } : null
      }
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/test-cases/debug
 * Debug endpoint to test actions data
 */
router.post('/debug', async (req, res) => {
  console.log('=== DEBUG ENDPOINT ===');
  console.log('Request body:', JSON.stringify(req.body, null, 2));
  console.log('Actions count:', req.body.actions?.length || 0);
  
  res.json({
    success: true,
    received: {
      actionsCount: req.body.actions?.length || 0,
      actions: req.body.actions || []
    }
  });
});

/**
 * POST /api/test-cases
 * Create a new test case
 */
router.post('/', async (req, res, next) => {
  try {
    // Validate request body
    const { error, value } = createTestCaseSchema.validate(req.body);
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

    // Verify test suite exists
    const testSuite = await TestSuite.findById(value.testSuiteId);
    if (!testSuite) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test suite not found',
          status: 404
        }
      });
    }

    // Validate test actions
    const actionValidationErrors = [];
    value.actions.forEach((action, index) => {
      const validation = validateTestAction(action);
      if (!validation.isValid) {
        actionValidationErrors.push(`Action ${index + 1}: ${validation.errors.join(', ')}`);
      }
    });

    if (actionValidationErrors.length > 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Test action validation errors',
          details: actionValidationErrors,
          status: 400
        }
      });
    }

    // Create new test case
    const testCase = new TestCase(value);
    await testCase.save();

    // Update test suite's test case count
    const testCases = await TestCase.findByTestSuiteId(value.testSuiteId);
    await testSuite.updateTestCasesCount(testCases.length);

    res.status(201).json({
      success: true,
      data: testCase,
      message: 'Test case created successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/test-cases/:id
 * Update a test case
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Normalize action data from frontend
    if (req.body.actions) {
      req.body.actions = req.body.actions.map(action => {
        const normalizedAction = { ...action };
        
        // Map actionType to type if needed
        if (action.actionType && !action.type) {
          normalizedAction.type = action.actionType;
        }
        
        // Ensure enabled is boolean
        if (typeof normalizedAction.enabled === 'number') {
          normalizedAction.enabled = normalizedAction.enabled === 1;
        }
        
        // Remove extra frontend fields that we don't need in the database
        delete normalizedAction.actionDefinition;
        delete normalizedAction.orderIndex;
        
        return normalizedAction;
      });
    }

    // Validate request body
    const { error, value } = updateTestCaseSchema.validate(req.body);
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

    console.log(`[PUT /api/test-cases/${id}] Raw request body:`, JSON.stringify(req.body, null, 2));
    console.log(`[PUT /api/test-cases/${id}] Validated data:`, value);
    console.log(`[PUT /api/test-cases/${id}] Actions in request:`, value.actions?.length || 0, 'actions');
    if (value.actions && value.actions.length > 0) {
      console.log(`[PUT /api/test-cases/${id}] First action:`, JSON.stringify(value.actions[0], null, 2));
    }

    // Find test case
    const testCase = await TestCase.findById(id);
    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test case not found',
          status: 404
        }
      });
    }

    // Validate test actions if provided
    if (value.actions) {
      const actionValidationErrors = [];
      value.actions.forEach((action, index) => {
        const validation = validateTestAction(action);
        if (!validation.isValid) {
          actionValidationErrors.push(`Action ${index + 1}: ${validation.errors.join(', ')}`);
        }
      });

      if (actionValidationErrors.length > 0) {
        return res.status(400).json({
          success: false,
          error: {
            message: 'Test action validation errors',
            details: actionValidationErrors,
            status: 400
          }
        });
      }
    }

    // Update test case
    const updatedTestCase = await testCase.update(value);

    res.json({
      success: true,
      data: updatedTestCase,
      message: 'Test case updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/test-cases/:id
 * Delete a test case
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find test case
    const testCase = await TestCase.findById(id);
    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test case not found',
          status: 404
        }
      });
    }

    const testSuiteId = testCase.testSuiteId;

    // Delete test case
    await testCase.delete();

    // Update test suite's test case count
    const testSuite = await TestSuite.findById(testSuiteId);
    if (testSuite) {
      const remainingTestCases = await TestCase.findByTestSuiteId(testSuiteId);
      await testSuite.updateTestCasesCount(remainingTestCases.length);
    }

    res.json({
      success: true,
      message: 'Test case deleted successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/test-cases/:id/actions
 * Add an action to a test case
 */
router.post('/:id/actions', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Validate action
    const { error, value } = testActionSchema.validate(req.body);
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

    // Validate test action
    const validation = validateTestAction(value);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Test action validation error',
          details: validation.errors,
          status: 400
        }
      });
    }

    // Find test case
    const testCase = await TestCase.findById(id);
    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test case not found',
          status: 404
        }
      });
    }

    // Add action
    const updatedTestCase = await testCase.addAction(value);

    res.status(201).json({
      success: true,
      data: updatedTestCase,
      message: 'Action added successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/test-cases/:id/actions/:actionIndex
 * Update an action in a test case
 */
router.put('/:id/actions/:actionIndex', async (req, res, next) => {
  try {
    const { id, actionIndex } = req.params;
    const index = parseInt(actionIndex);

    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid action index',
          status: 400
        }
      });
    }

    // Find test case
    const testCase = await TestCase.findById(id);
    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test case not found',
          status: 404
        }
      });
    }

    // Check if action index exists
    if (index >= testCase.actions.length) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Action not found',
          status: 404
        }
      });
    }

    // Merge with existing action and validate
    const existingAction = testCase.actions[index];
    const updatedAction = { ...existingAction, ...req.body };

    const validation = validateTestAction(updatedAction);
    if (!validation.isValid) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Test action validation error',
          details: validation.errors,
          status: 400
        }
      });
    }

    // Update action
    const updatedTestCase = await testCase.updateAction(index, updatedAction);

    res.json({
      success: true,
      data: updatedTestCase,
      message: 'Action updated successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * DELETE /api/test-cases/:id/actions/:actionIndex
 * Remove an action from a test case
 */
router.delete('/:id/actions/:actionIndex', async (req, res, next) => {
  try {
    const { id, actionIndex } = req.params;
    const index = parseInt(actionIndex);

    if (isNaN(index) || index < 0) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Invalid action index',
          status: 400
        }
      });
    }

    // Find test case
    const testCase = await TestCase.findById(id);
    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test case not found',
          status: 404
        }
      });
    }

    // Check if action index exists
    if (index >= testCase.actions.length) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Action not found',
          status: 404
        }
      });
    }

    // Remove action
    const updatedTestCase = await testCase.removeAction(index);

    res.json({
      success: true,
      data: updatedTestCase,
      message: 'Action removed successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/test-cases/:id/execute
 * Execute a test case (simulation)
 */
router.post('/:id/execute', async (req, res, next) => {
  try {
    const { id } = req.params;

    // Find test case
    const testCase = await TestCase.findById(id);
    if (!testCase) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test case not found',
          status: 404
        }
      });
    }

    // Simulate execution (in a real implementation, this would run the actual automation)
    const executionResult = {
      testCaseId: id,
      status: 'completed',
      startTime: new Date().toISOString(),
      endTime: new Date(Date.now() + Math.random() * 10000).toISOString(),
      duration: Math.floor(Math.random() * 10000),
      steps: testCase.actions.map((action, index) => ({
        stepNumber: index + 1,
        action: action.type,
        status: Math.random() > 0.1 ? 'passed' : 'failed', // 90% success rate
        duration: Math.floor(Math.random() * 1000),
        screenshot: `screenshot_${index + 1}.png`,
        details: `Executed ${action.type} action`
      })),
      summary: {
        total: testCase.actions.length,
        passed: testCase.actions.filter(() => Math.random() > 0.1).length,
        failed: testCase.actions.filter(() => Math.random() <= 0.1).length
      }
    };

    // Record execution
    await testCase.recordExecution();

    res.json({
      success: true,
      data: executionResult,
      message: 'Test case executed successfully'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/test-cases/:id/duplicate
 * Duplicate a test case
 */
router.post('/:id/duplicate', async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, testSuiteId } = req.body;

    // Find original test case
    const originalTestCase = await TestCase.findById(id);
    if (!originalTestCase) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Test case not found',
          status: 404
        }
      });
    }

    // Verify target test suite exists
    const targetTestSuiteId = testSuiteId || originalTestCase.testSuiteId;
    const testSuite = await TestSuite.findById(targetTestSuiteId);
    if (!testSuite) {
      return res.status(404).json({
        success: false,
        error: {
          message: 'Target test suite not found',
          status: 404
        }
      });
    }

    // Create duplicate
    const duplicateData = {
      testSuiteId: targetTestSuiteId,
      name: name || `${originalTestCase.name} (Copy)`,
      description: originalTestCase.description,
      actions: originalTestCase.actions,
      tags: [...originalTestCase.tags],
      priority: originalTestCase.priority,
      expectedResult: originalTestCase.expectedResult
    };

    const duplicateTestCase = new TestCase(duplicateData);
    await duplicateTestCase.save();

    // Update test suite's test case count
    const testCases = await TestCase.findByTestSuiteId(targetTestSuiteId);
    await testSuite.updateTestCasesCount(testCases.length);

    res.status(201).json({
      success: true,
      data: duplicateTestCase,
      message: 'Test case duplicated successfully'
    });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
