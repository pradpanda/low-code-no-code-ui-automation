#!/usr/bin/env node

const { spawn } = require('child_process')
const path = require('path')
require('dotenv').config()

// Parse command line arguments
const args = process.argv.slice(2)
const testCaseId = args.find(arg => arg.startsWith('--test-case='))?.split('=')[1]
const testSuiteId = args.find(arg => arg.startsWith('--test-suite='))?.split('=')[1]
const browser = args.find(arg => arg.startsWith('--browser='))?.split('=')[1] || 'chrome'
const headed = args.includes('--headed')
const baseUrl = args.find(arg => arg.startsWith('--base-url='))?.split('=')[1] || 'http://localhost:3000'
const backendUrl = args.find(arg => arg.startsWith('--backend-url='))?.split('=')[1] || 'http://localhost:5000'

function showUsage() {
  console.log(`
UI Automation Test Runner CLI

Usage:
  npm run run-test-case -- --test-case=<id> [options]
  npm run run-test-suite -- --test-suite=<id> [options]

Options:
  --test-case=<id>     Run a specific test case by ID
  --test-suite=<id>    Run all test cases in a test suite by ID
  --browser=<name>     Browser to use (chrome, firefox, edge) [default: chrome]
  --headed             Run tests in headed mode (visible browser)
  --base-url=<url>     Base URL for the application [default: http://localhost:3000]
  --backend-url=<url>  Backend API URL [default: http://localhost:5000]

Examples:
  npm run run-test-case -- --test-case=123 --headed
  npm run run-test-suite -- --test-suite=456 --browser=firefox
  npm run run-test-case -- --test-case=789 --base-url=https://staging.example.com
`)
}

function runCypress() {
  if (!testCaseId && !testSuiteId) {
    console.error('Error: Either --test-case or --test-suite must be provided')
    showUsage()
    process.exit(1)
  }

  console.log('🚀 Starting UI Automation Test Runner...')
  console.log(`📋 ${testCaseId ? `Test Case ID: ${testCaseId}` : `Test Suite ID: ${testSuiteId}`}`)
  console.log(`🌐 Base URL: ${baseUrl}`)
  console.log(`🔗 Backend URL: ${backendUrl}`)
  console.log(`🌍 Browser: ${browser}`)
  console.log(`👁️  Headed: ${headed ? 'Yes' : 'No'}`)
  console.log('')

  // Build Cypress command
  const cypressArgs = [
    'run',
    '--browser', browser,
    '--env', `BACKEND_URL=${backendUrl}`,
    '--config', `baseUrl=${baseUrl}`
  ]

  // Add environment variables for test identification
  if (testCaseId) {
    cypressArgs.push('--env', `TEST_CASE_ID=${testCaseId}`)
  }
  if (testSuiteId) {
    cypressArgs.push('--env', `TEST_SUITE_ID=${testSuiteId}`)
  }

  // Add headed mode if requested
  if (headed) {
    cypressArgs.push('--headed')
  }

  // Spawn Cypress process
  const cypress = spawn('npx', ['cypress', ...cypressArgs], {
    stdio: 'inherit',
    cwd: process.cwd()
  })

  cypress.on('close', (code) => {
    if (code === 0) {
      console.log('\n✅ Test execution completed successfully!')
    } else {
      console.log(`\n❌ Test execution failed with exit code ${code}`)
    }
    process.exit(code)
  })

  cypress.on('error', (error) => {
    console.error('❌ Failed to start Cypress:', error.message)
    process.exit(1)
  })
}

// Handle help flag
if (args.includes('--help') || args.includes('-h')) {
  showUsage()
  process.exit(0)
}

// Run the tests
runCypress()
