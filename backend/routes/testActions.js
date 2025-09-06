const express = require('express');
const { 
  getAllTestActions, 
  getTestActionByType, 
  getTestActionsByCategory, 
  getCategories,
  validateTestAction,
  createTestAction 
} = require('../models/TestAction');
const TestActionModel = require('../models/TestActionModel');
const { getDatabase } = require('../config/database');

const router = express.Router();

/**
 * GET /api/test-actions
 * Get all available test actions with their configurations
 */
router.get('/', async (req, res, next) => {
  try {
    const { category, type } = req.query;

    let actions;

    if (type) {
      // Get specific action by type
      const action = getTestActionByType(type);
      if (!action) {
        return res.status(404).json({
          success: false,
          error: {
            message: `Test action type '${type}' not found`,
            status: 404
          }
        });
      }
      actions = [action];
    } else if (category) {
      // Get actions by category
      actions = getTestActionsByCategory(category);
      if (actions.length === 0) {
        return res.status(404).json({
          success: false,
          error: {
            message: `No test actions found for category '${category}'`,
            status: 404
          }
        });
      }
    } else {
      // Get all actions
      actions = getAllTestActions();
    }

    res.json({
      success: true,
      data: actions,
      count: actions.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/test-actions/definitions
 * Get action definitions from database (MySQL only)
 */
router.get('/definitions', async (req, res, next) => {
  try {
    const db = getDatabase();
    if (db.type !== 'mysql') {
      // For non-MySQL, return static definitions
      const actions = getAllTestActions();
      return res.json({
        success: true,
        data: actions,
        count: actions.length,
        source: 'static'
      });
    }

    const definitions = await TestActionModel.getActionDefinitions();
    
    res.json({
      success: true,
      data: definitions,
      count: definitions.length,
      source: 'database'
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/test-actions/categories
 * Get all available test action categories
 */
router.get('/categories', async (req, res, next) => {
  try {
    const categories = getCategories();

    res.json({
      success: true,
      data: categories,
      count: categories.length
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/test-actions/:type
 * Get a specific test action by type
 */
router.get('/:type', async (req, res, next) => {
  try {
    const { type } = req.params;

    const action = getTestActionByType(type);
    if (!action) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Test action type '${type}' not found`,
          status: 404
        }
      });
    }

    res.json({
      success: true,
      data: action
    });
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/test-actions/validate
 * Validate a test action configuration
 */
router.post('/validate', async (req, res, next) => {
  try {
    const action = req.body;

    if (!action || !action.type) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Action type is required',
          status: 400
        }
      });
    }

    const validation = validateTestAction(action);

    if (validation.isValid) {
      res.json({
        success: true,
        data: {
          isValid: true,
          message: 'Test action is valid'
        }
      });
    } else {
      res.status(400).json({
        success: false,
        data: {
          isValid: false,
          errors: validation.errors
        },
        error: {
          message: 'Test action validation failed',
          details: validation.errors,
          status: 400
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * POST /api/test-actions/create
 * Create a new test action instance with validation
 */
router.post('/create', async (req, res, next) => {
  try {
    const { type, parameters, options } = req.body;

    if (!type) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Action type is required',
          status: 400
        }
      });
    }

    try {
      const action = createTestAction(type, parameters, options);
      
      res.status(201).json({
        success: true,
        data: action,
        message: 'Test action created successfully'
      });
    } catch (createError) {
      res.status(400).json({
        success: false,
        error: {
          message: createError.message,
          status: 400
        }
      });
    }
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/test-actions/templates/:type
 * Get a template for a specific test action type
 */
router.get('/templates/:type', async (req, res, next) => {
  try {
    const { type } = req.params;

    const actionDefinition = getTestActionByType(type);
    if (!actionDefinition) {
      return res.status(404).json({
        success: false,
        error: {
          message: `Test action type '${type}' not found`,
          status: 404
        }
      });
    }

    // Create a template with default values
    const template = {
      type: actionDefinition.type,
      name: actionDefinition.name,
      description: actionDefinition.description,
      parameters: {}
    };

    // Add default parameters
    actionDefinition.parameters.forEach(param => {
      if (param.default !== undefined) {
        template.parameters[param.name] = param.default;
      } else if (param.type === 'boolean') {
        template.parameters[param.name] = false;
      } else if (param.type === 'number') {
        template.parameters[param.name] = param.min || 0;
      } else if (param.type === 'select' && param.options && param.options.length > 0) {
        template.parameters[param.name] = param.options[0].value;
      } else {
        template.parameters[param.name] = '';
      }
    });

    res.json({
      success: true,
      data: template
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/test-actions/search
 * Search for test actions by name or description
 */
router.get('/search/:query', async (req, res, next) => {
  try {
    const { query } = req.params;
    const searchTerm = query.toLowerCase();

    if (!searchTerm || searchTerm.length < 2) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Search query must be at least 2 characters long',
          status: 400
        }
      });
    }

    const allActions = getAllTestActions();
    const matchingActions = allActions.filter(action => 
      action.name.toLowerCase().includes(searchTerm) ||
      action.description.toLowerCase().includes(searchTerm) ||
      action.type.toLowerCase().includes(searchTerm) ||
      action.category.toLowerCase().includes(searchTerm)
    );

    res.json({
      success: true,
      data: matchingActions,
      count: matchingActions.length,
      query: searchTerm
    });
  } catch (error) {
    next(error);
  }
});

/**
 * GET /api/test-actions/stats
 * Get statistics about available test actions
 */
router.get('/stats/overview', async (req, res, next) => {
  try {
    const allActions = getAllTestActions();
    const categories = getCategories();

    const stats = {
      totalActions: allActions.length,
      categoriesCount: categories.length,
      categories: categories.map(category => ({
        name: category.name,
        label: category.label,
        actionCount: category.actions.length
      })),
      parameterStats: {
        totalParameters: allActions.reduce((sum, action) => sum + action.parameters.length, 0),
        averageParameters: (allActions.reduce((sum, action) => sum + action.parameters.length, 0) / allActions.length).toFixed(1),
        requiredParametersTotal: allActions.reduce((sum, action) => 
          sum + action.parameters.filter(param => param.required).length, 0
        )
      },
      parameterTypes: {}
    };

    // Count parameter types
    allActions.forEach(action => {
      action.parameters.forEach(param => {
        if (!stats.parameterTypes[param.type]) {
          stats.parameterTypes[param.type] = 0;
        }
        stats.parameterTypes[param.type]++;
      });
    });

    res.json({
      success: true,
      data: stats
    });
  } catch (error) {
    next(error);
  }
});

/**
 * PUT /api/test-actions/:id
 * Update an existing test action instance
 */
router.put('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;
    const actionData = req.body;

    console.log(`[PUT /api/test-actions/${id}] Updating action:`, actionData);

    // Validate required fields
    if (!actionData.type) {
      return res.status(400).json({
        success: false,
        error: {
          message: 'Action type is required',
          status: 400
        }
      });
    }

    // Create a new TestActionModel instance with the updated data
    const updatedAction = new TestActionModel({
      id: parseInt(id),
      testCaseId: actionData.testCaseId,
      actionType: actionData.type || actionData.actionType, // Use type or actionType
      name: actionData.name,
      description: actionData.description,
      parameters: actionData.parameters,
      orderIndex: actionData.orderIndex,
      enabled: actionData.enabled,
      updatedAt: new Date().toISOString().slice(0, 19).replace('T', ' ')
    });

    // Update the action in the database
    await updatedAction.update();

    res.json({
      success: true,
      data: updatedAction,
      message: 'Test action updated successfully'
    });
  } catch (error) {
    console.error('Error updating test action:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to update test action',
        details: error.message,
        status: 500
      }
    });
  }
});

/**
 * DELETE /api/test-actions/:id
 * Delete a test action instance
 */
router.delete('/:id', async (req, res, next) => {
  try {
    const { id } = req.params;

    console.log(`[DELETE /api/test-actions/${id}] Deleting action`);

    // Create a TestActionModel instance to delete
    const actionToDelete = new TestActionModel({ id: parseInt(id) });

    // Delete the action from the database
    await actionToDelete.delete();

    res.json({
      success: true,
      message: 'Test action deleted successfully'
    });
  } catch (error) {
    console.error('Error deleting test action:', error);
    res.status(500).json({
      success: false,
      error: {
        message: 'Failed to delete test action',
        details: error.message,
        status: 500
      }
    });
  }
});

module.exports = router;
