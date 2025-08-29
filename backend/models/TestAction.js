/**
 * Test Action definitions and utilities
 * Contains all available automation actions similar to TestNG
 */

/**
 * Available test action types with their configurations
 */
const TEST_ACTION_TYPES = {
  CLICK: {
    type: 'click',
    name: 'Click Element',
    description: 'Click on a web element',
    category: 'interaction',
    icon: 'cursor-pointer',
    parameters: [
      {
        name: 'locator',
        type: 'string',
        required: true,
        description: 'CSS selector, XPath, or element identifier',
        placeholder: '#button-id, .class-name, //button[@id="submit"]'
      },
      {
        name: 'waitTimeout',
        type: 'number',
        required: false,
        default: 5000,
        description: 'Maximum time to wait for element (ms)',
        min: 100,
        max: 30000
      }
    ]
  },

  TYPE: {
    type: 'type',
    name: 'Type Text',
    description: 'Type text into an input field',
    category: 'interaction',
    icon: 'keyboard',
    parameters: [
      {
        name: 'locator',
        type: 'string',
        required: true,
        description: 'CSS selector, XPath, or element identifier for input field',
        placeholder: '#input-id, input[name="username"]'
      },
      {
        name: 'text',
        type: 'string',
        required: true,
        description: 'Text to type into the field',
        placeholder: 'Enter text here...'
      },
      {
        name: 'clearFirst',
        type: 'boolean',
        required: false,
        default: true,
        description: 'Clear the field before typing'
      },
      {
        name: 'waitTimeout',
        type: 'number',
        required: false,
        default: 5000,
        description: 'Maximum time to wait for element (ms)',
        min: 100,
        max: 30000
      }
    ]
  },

  WAIT: {
    type: 'wait',
    name: 'Wait',
    description: 'Wait for a specified time or condition',
    category: 'timing',
    icon: 'clock',
    parameters: [
      {
        name: 'waitType',
        type: 'select',
        required: true,
        description: 'Type of wait to perform',
        options: [
          { value: 'time', label: 'Wait for Time' },
          { value: 'element', label: 'Wait for Element' },
          { value: 'elementVisible', label: 'Wait for Element Visible' },
          { value: 'elementClickable', label: 'Wait for Element Clickable' }
        ]
      },
      {
        name: 'duration',
        type: 'number',
        required: false,
        description: 'Duration in milliseconds (for time wait)',
        placeholder: '2000',
        min: 100,
        max: 60000
      },
      {
        name: 'locator',
        type: 'string',
        required: false,
        description: 'Element locator (for element waits)',
        placeholder: '#element-id, .class-name'
      },
      {
        name: 'timeout',
        type: 'number',
        required: false,
        default: 10000,
        description: 'Maximum time to wait (ms)',
        min: 100,
        max: 60000
      }
    ]
  },

  NAVIGATE: {
    type: 'navigate',
    name: 'Navigate',
    description: 'Navigate to a URL or perform browser navigation',
    category: 'navigation',
    icon: 'globe',
    parameters: [
      {
        name: 'action',
        type: 'select',
        required: true,
        description: 'Navigation action to perform',
        options: [
          { value: 'goto', label: 'Go to URL' },
          { value: 'back', label: 'Go Back' },
          { value: 'forward', label: 'Go Forward' },
          { value: 'refresh', label: 'Refresh Page' }
        ]
      },
      {
        name: 'url',
        type: 'string',
        required: false,
        description: 'URL to navigate to (for goto action)',
        placeholder: 'https://example.com'
      },
      {
        name: 'waitForLoad',
        type: 'boolean',
        required: false,
        default: true,
        description: 'Wait for page to fully load'
      }
    ]
  },

  ASSERT: {
    type: 'assert',
    name: 'Assert',
    description: 'Verify conditions and validate test results',
    category: 'validation',
    icon: 'check-circle',
    parameters: [
      {
        name: 'assertionType',
        type: 'select',
        required: true,
        description: 'Type of assertion to perform',
        options: [
          { value: 'elementExists', label: 'Element Exists' },
          { value: 'elementVisible', label: 'Element is Visible' },
          { value: 'elementText', label: 'Element Text Equals' },
          { value: 'elementTextContains', label: 'Element Text Contains' },
          { value: 'pageTitle', label: 'Page Title Equals' },
          { value: 'pageUrl', label: 'Page URL Contains' },
          { value: 'elementAttribute', label: 'Element Attribute Equals' }
        ]
      },
      {
        name: 'locator',
        type: 'string',
        required: false,
        description: 'Element locator (for element assertions)',
        placeholder: '#element-id, .class-name'
      },
      {
        name: 'expectedValue',
        type: 'string',
        required: false,
        description: 'Expected value for comparison',
        placeholder: 'Expected text or value'
      },
      {
        name: 'attributeName',
        type: 'string',
        required: false,
        description: 'Attribute name (for attribute assertions)',
        placeholder: 'class, id, href, etc.'
      },
      {
        name: 'caseSensitive',
        type: 'boolean',
        required: false,
        default: true,
        description: 'Case sensitive comparison'
      }
    ]
  },

  SELECT: {
    type: 'select',
    name: 'Select Option',
    description: 'Select an option from a dropdown or select element',
    category: 'interaction',
    icon: 'list',
    parameters: [
      {
        name: 'locator',
        type: 'string',
        required: true,
        description: 'CSS selector for the select element',
        placeholder: 'select[name="country"], #dropdown-id'
      },
      {
        name: 'selectionType',
        type: 'select',
        required: true,
        description: 'How to select the option',
        options: [
          { value: 'value', label: 'By Value' },
          { value: 'text', label: 'By Visible Text' },
          { value: 'index', label: 'By Index' }
        ]
      },
      {
        name: 'value',
        type: 'string',
        required: true,
        description: 'Value, text, or index to select',
        placeholder: 'option-value, Option Text, or 0'
      }
    ]
  },

  HOVER: {
    type: 'hover',
    name: 'Hover',
    description: 'Hover over an element',
    category: 'interaction',
    icon: 'mouse-pointer',
    parameters: [
      {
        name: 'locator',
        type: 'string',
        required: true,
        description: 'CSS selector for the element to hover over',
        placeholder: '#menu-item, .hover-target'
      },
      {
        name: 'waitTimeout',
        type: 'number',
        required: false,
        default: 5000,
        description: 'Maximum time to wait for element (ms)',
        min: 100,
        max: 30000
      }
    ]
  },

  SCROLL: {
    type: 'scroll',
    name: 'Scroll',
    description: 'Scroll the page or an element',
    category: 'navigation',
    icon: 'arrows-expand',
    parameters: [
      {
        name: 'scrollType',
        type: 'select',
        required: true,
        description: 'Type of scroll action',
        options: [
          { value: 'toElement', label: 'Scroll to Element' },
          { value: 'toTop', label: 'Scroll to Top' },
          { value: 'toBottom', label: 'Scroll to Bottom' },
          { value: 'byPixels', label: 'Scroll by Pixels' }
        ]
      },
      {
        name: 'locator',
        type: 'string',
        required: false,
        description: 'Element to scroll to (for toElement)',
        placeholder: '#target-element'
      },
      {
        name: 'x',
        type: 'number',
        required: false,
        description: 'Horizontal scroll amount in pixels',
        default: 0
      },
      {
        name: 'y',
        type: 'number',
        required: false,
        description: 'Vertical scroll amount in pixels',
        default: 0
      }
    ]
  }
};

/**
 * Get all available test actions
 */
function getAllTestActions() {
  return Object.values(TEST_ACTION_TYPES);
}

/**
 * Get test action by type
 */
function getTestActionByType(type) {
  return TEST_ACTION_TYPES[type.toUpperCase()];
}

/**
 * Get test actions by category
 */
function getTestActionsByCategory(category) {
  return Object.values(TEST_ACTION_TYPES).filter(action => action.category === category);
}

/**
 * Get all categories
 */
function getCategories() {
  const categories = [...new Set(Object.values(TEST_ACTION_TYPES).map(action => action.category))];
  return categories.map(category => ({
    name: category,
    label: category.charAt(0).toUpperCase() + category.slice(1),
    actions: getTestActionsByCategory(category)
  }));
}

/**
 * Validate test action parameters
 */
function validateTestAction(action) {
  const actionDefinition = getTestActionByType(action.type);
  if (!actionDefinition) {
    throw new Error(`Invalid action type: ${action.type}`);
  }

  const errors = [];
  
  // Check required parameters
  actionDefinition.parameters.forEach(param => {
    if (param.required && (action.parameters[param.name] === undefined || action.parameters[param.name] === '')) {
      errors.push(`Parameter '${param.name}' is required for action '${action.type}'`);
    }

    // Validate parameter types and constraints
    const value = action.parameters[param.name];
    if (value !== undefined && value !== '') {
      switch (param.type) {
        case 'number':
          if (isNaN(value)) {
            errors.push(`Parameter '${param.name}' must be a number`);
          } else {
            const numValue = Number(value);
            if (param.min !== undefined && numValue < param.min) {
              errors.push(`Parameter '${param.name}' must be at least ${param.min}`);
            }
            if (param.max !== undefined && numValue > param.max) {
              errors.push(`Parameter '${param.name}' must be at most ${param.max}`);
            }
          }
          break;
        case 'select':
          if (param.options && !param.options.some(option => option.value === value)) {
            errors.push(`Parameter '${param.name}' must be one of: ${param.options.map(o => o.value).join(', ')}`);
          }
          break;
      }
    }
  });

  return {
    isValid: errors.length === 0,
    errors
  };
}

/**
 * Create a new test action instance
 */
function createTestAction(type, parameters = {}, options = {}) {
  const actionDefinition = getTestActionByType(type);
  if (!actionDefinition) {
    throw new Error(`Invalid action type: ${type}`);
  }

  // Apply default parameters
  const finalParameters = {};
  actionDefinition.parameters.forEach(param => {
    if (parameters[param.name] !== undefined) {
      finalParameters[param.name] = parameters[param.name];
    } else if (param.default !== undefined) {
      finalParameters[param.name] = param.default;
    }
  });

  const action = {
    id: options.id || require('uuid').v4(),
    type: type.toLowerCase(),
    name: options.name || actionDefinition.name,
    description: options.description || actionDefinition.description,
    parameters: finalParameters,
    createdAt: new Date().toISOString(),
    enabled: options.enabled !== undefined ? options.enabled : true
  };

  // Validate the action
  const validation = validateTestAction(action);
  if (!validation.isValid) {
    throw new Error(`Invalid test action: ${validation.errors.join(', ')}`);
  }

  return action;
}

module.exports = {
  TEST_ACTION_TYPES,
  getAllTestActions,
  getTestActionByType,
  getTestActionsByCategory,
  getCategories,
  validateTestAction,
  createTestAction
};
