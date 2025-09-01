// Dynamic test runner that executes test cases from the backend
describe('UI Automation Platform - Dynamic Test Runner', () => {
  
  // This test will be dynamically configured based on environment variables
  it('should run test case from backend', () => {
    const testCaseId = Cypress.env('TEST_CASE_ID')
    const testSuiteId = Cypress.env('TEST_SUITE_ID')
    
    if (testCaseId) {
      cy.log(`Running individual test case: ${testCaseId}`)
      cy.runTestCase(testCaseId)
    } else if (testSuiteId) {
      cy.log(`Running test suite: ${testSuiteId}`)
      cy.runTestSuite(testSuiteId)
    } else {
      throw new Error('Either TEST_CASE_ID or TEST_SUITE_ID environment variable must be provided')
    }
  })
  

  
})
