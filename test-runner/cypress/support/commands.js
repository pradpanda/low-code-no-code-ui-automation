// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

const axios = require('axios')

// Custom command to fetch test case from backend
Cypress.Commands.add('fetchTestCase', (testCaseId) => {
  const backendUrl = Cypress.env('BACKEND_URL') || 'http://localhost:5000'
  
  return cy.request({
    method: 'GET',
    url: `${backendUrl}/api/test-cases/${testCaseId}`,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Failed to fetch test case ${testCaseId}: ${response.body.error?.message || 'Unknown error'}`)
    }
    // The API returns { success: true, data: { testCase: {...}, testSuite: {...} } }
    return response.body.data.testCase
  })
})

// Custom command to fetch test suite from backend
Cypress.Commands.add('fetchTestSuite', (testSuiteId) => {
  const backendUrl = Cypress.env('BACKEND_URL') || 'http://localhost:5000'
  
  return cy.request({
    method: 'GET',
    url: `${backendUrl}/api/test-suites/${testSuiteId}`,
    failOnStatusCode: false
  }).then((response) => {
    if (response.status !== 200) {
      throw new Error(`Failed to fetch test suite ${testSuiteId}: ${response.body.error?.message || 'Unknown error'}`)
    }
    return response.body.data
  })
})

// Custom command to execute a single action
Cypress.Commands.add('executeAction', (action) => {
  cy.log(`Executing action: ${action.type} - ${action.name}`)
  
  if (!action.enabled) {
    cy.log(`Skipping disabled action: ${action.name}`)
    return
  }

  switch (action.type) {
    case 'navigate':
      cy.executeNavigateAction(action)
      break
    case 'click':
      cy.executeClickAction(action)
      break
    case 'type':
      cy.executeTypeAction(action)
      break
    case 'select':
      cy.executeSelectAction(action)
      break
    case 'hover':
      cy.executeHoverAction(action)
      break
    case 'wait':
      cy.executeWaitAction(action)
      break
    case 'scroll':
      cy.executeScrollAction(action)
      break
    case 'assert':
      cy.executeAssertAction(action)
      break
    default:
      throw new Error(`Unknown action type: ${action.type}`)
  }
})

// Navigate action executor
Cypress.Commands.add('executeNavigateAction', (action) => {
  const { url, waitForLoad } = action.parameters
  
  if (!url) {
    throw new Error('Navigate action requires a URL parameter')
  }
  
  cy.visit(url)
  
  if (waitForLoad !== false) {
    cy.wait(1000) // Wait for page to load
  }
})

// Click action executor
Cypress.Commands.add('executeClickAction', (action) => {
  const { locator, waitTimeout = 5000 } = action.parameters
  
  if (!locator) {
    throw new Error('Click action requires a locator parameter')
  }
  
  // Check if locator is XPath (starts with // or /)
  if (locator.startsWith('//') || locator.startsWith('/')) {
    cy.xpath(locator, { timeout: waitTimeout }).first().click()
  } else {
    cy.get(locator, { timeout: waitTimeout }).first().click()
  }
})

// Type action executor
Cypress.Commands.add('executeTypeAction', (action) => {
  const { locator, text, waitTimeout = 5000, clear = true } = action.parameters
  
  if (!locator) {
    throw new Error('Type action requires a locator parameter')
  }
  
  if (!text) {
    throw new Error('Type action requires a text parameter')
  }
  
  let element;
  if (locator.startsWith('//') || locator.startsWith('/')) {
    element = cy.xpath(locator, { timeout: waitTimeout })
  } else {
    element = cy.get(locator, { timeout: waitTimeout })
  }
  
  if (clear) {
    element.clear()
  }
  
  element.type(text)
})

// Select action executor
Cypress.Commands.add('executeSelectAction', (action) => {
  const { locator, value, waitTimeout = 5000 } = action.parameters
  
  if (!locator) {
    throw new Error('Select action requires a locator parameter')
  }
  
  if (!value) {
    throw new Error('Select action requires a value parameter')
  }
  
  if (locator.startsWith('//') || locator.startsWith('/')) {
    cy.xpath(locator, { timeout: waitTimeout }).select(value)
  } else {
    cy.get(locator, { timeout: waitTimeout }).select(value)
  }
})

// Hover action executor
Cypress.Commands.add('executeHoverAction', (action) => {
  const { locator, waitTimeout = 5000 } = action.parameters
  
  if (!locator) {
    throw new Error('Hover action requires a locator parameter')
  }
  
  if (locator.startsWith('//') || locator.startsWith('/')) {
    cy.xpath(locator, { timeout: waitTimeout }).trigger('mouseover')
  } else {
    cy.get(locator, { timeout: waitTimeout }).trigger('mouseover')
  }
})

// Wait action executor
Cypress.Commands.add('executeWaitAction', (action) => {
  const { duration = 1000 } = action.parameters
  
  cy.wait(duration)
})

// Scroll action executor
Cypress.Commands.add('executeScrollAction', (action) => {
  const { locator, direction = 'top', waitTimeout = 5000 } = action.parameters
  
  if (locator) {
    if (locator.startsWith('//') || locator.startsWith('/')) {
      cy.xpath(locator, { timeout: waitTimeout }).scrollIntoView()
    } else {
      cy.get(locator, { timeout: waitTimeout }).scrollIntoView()
    }
  } else {
    switch (direction) {
      case 'top':
        cy.scrollTo('top')
        break
      case 'bottom':
        cy.scrollTo('bottom')
        break
      case 'center':
        cy.scrollTo('center')
        break
      default:
        cy.scrollTo(direction)
    }
  }
})

// Assert action executor
Cypress.Commands.add('executeAssertAction', (action) => {
  const { locator, assertion, value, waitTimeout = 5000 } = action.parameters
  
  if (!locator) {
    throw new Error('Assert action requires a locator parameter')
  }
  
  if (!assertion) {
    throw new Error('Assert action requires an assertion parameter')
  }
  
  let element;
  if (locator.startsWith('//') || locator.startsWith('/')) {
    element = cy.xpath(locator, { timeout: waitTimeout })
  } else {
    element = cy.get(locator, { timeout: waitTimeout })
  }
  
  switch (assertion) {
    case 'visible':
      element.should('be.visible')
      break
    case 'hidden':
      element.should('not.be.visible')
      break
    case 'exist':
      element.should('exist')
      break
    case 'not-exist':
      element.should('not.exist')
      break
    case 'contain':
      if (!value) throw new Error('Assert contain requires a value parameter')
      element.should('contain', value)
      break
    case 'have-text':
      if (!value) throw new Error('Assert have-text requires a value parameter')
      element.should('have.text', value)
      break
    case 'have-value':
      if (!value) throw new Error('Assert have-value requires a value parameter')
      element.should('have.value', value)
      break
    case 'have-attr':
      if (!value) throw new Error('Assert have-attr requires a value parameter')
      const [attr, attrValue] = value.split('=')
      if (attrValue) {
        element.should('have.attr', attr, attrValue)
      } else {
        element.should('have.attr', attr)
      }
      break
    default:
      throw new Error(`Unknown assertion type: ${assertion}`)
  }
})

// Custom command to run a complete test case
Cypress.Commands.add('runTestCase', (testCaseId) => {
  cy.fetchTestCase(testCaseId).then((testCase) => {
    cy.log(`Running test case: ${testCase.name}`)
    cy.log(`Description: ${testCase.description}`)
    cy.log(`Actions count: ${testCase.actions?.length || 0}`)
    
    if (!testCase.actions || testCase.actions.length === 0) {
      cy.log('No actions to execute')
      return
    }
    
    // Execute each action in sequence
    testCase.actions.forEach((action, index) => {
      cy.log(`Step ${index + 1}: ${action.name}`)
      cy.executeAction(action)
    })
    
    cy.log(`Test case completed: ${testCase.name}`)
  })
})

// Custom command to run a complete test suite
Cypress.Commands.add('runTestSuite', (testSuiteId) => {
  cy.fetchTestSuite(testSuiteId).then((testSuite) => {
    cy.log(`Running test suite: ${testSuite.name}`)
    cy.log(`Description: ${testSuite.description}`)
    
    if (!testSuite.testCases || testSuite.testCases.length === 0) {
      cy.log('No test cases to execute')
      return
    }
    
    // Execute each test case in sequence
    testSuite.testCases.forEach((testCase) => {
      cy.log(`Running test case: ${testCase.name}`)
      cy.runTestCase(testCase.id)
    })
    
    cy.log(`Test suite completed: ${testSuite.name}`)
  })
})
