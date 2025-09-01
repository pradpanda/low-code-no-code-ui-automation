# UI Automation Test Runner

A Cypress-based test runner that integrates with the UI Automation Platform backend to execute test cases and test suites dynamically.

## Features

- 🚀 **Dynamic Test Execution**: Fetch and execute test cases from the backend API
- 🎯 **Action Support**: Execute all action types (navigate, click, type, select, hover, wait, scroll, assert)
- 🌐 **Multi-Browser Support**: Run tests on Chrome, Firefox, Edge
- 📊 **Comprehensive Reporting**: Built-in Cypress reporting with videos and screenshots
- 🔧 **CLI Interface**: Easy command-line interface for test execution
- 🔄 **CI/CD Ready**: Designed for continuous integration pipelines

## Installation

```bash
npm install
```

## Configuration

1. Copy the environment configuration:
```bash
cp env.example .env
```

2. Update the `.env` file with your configuration:
```env
BACKEND_URL=http://localhost:5000
BASE_URL=http://localhost:3000
```

## Usage

### Running Individual Test Cases

```bash
# Run a specific test case
npm run run-test-case -- --test-case=123

# Run with specific browser
npm run run-test-case -- --test-case=123 --browser=firefox

# Run in headed mode (visible browser)
npm run run-test-case -- --test-case=123 --headed

# Run against different environment
npm run run-test-case -- --test-case=123 --base-url=https://staging.example.com
```

### Running Test Suites

```bash
# Run all test cases in a test suite
npm run run-test-suite -- --test-suite=456

# Run test suite with custom configuration
npm run run-test-suite -- --test-suite=456 --browser=chrome --headed
```

### Direct Cypress Commands

```bash
# Open Cypress Test Runner (interactive mode)
npm run cypress:open

# Run all tests headlessly
npm run cypress:run

# Run tests in headed mode
npm run test:headed

# Run tests in specific browser
npm run test:chrome
npm run test:firefox
```

## CLI Options

| Option | Description | Default |
|--------|-------------|---------|
| `--test-case=<id>` | Run a specific test case by ID | - |
| `--test-suite=<id>` | Run all test cases in a test suite | - |
| `--browser=<name>` | Browser to use (chrome, firefox, edge) | chrome |
| `--headed` | Run tests in headed mode | false |
| `--base-url=<url>` | Base URL for the application | http://localhost:3000 |
| `--backend-url=<url>` | Backend API URL | http://localhost:5000 |

## Supported Actions

The test runner supports all action types from the UI Automation Platform:

### Navigation Actions
- **navigate**: Navigate to URLs with optional wait for load

### Interaction Actions
- **click**: Click on elements using CSS selectors or XPath
- **type**: Type text into input fields with optional clear
- **select**: Select options from dropdown menus
- **hover**: Hover over elements

### Timing Actions
- **wait**: Wait for specified duration

### Scroll Actions
- **scroll**: Scroll to elements or directions (top, bottom, center)

### Validation Actions
- **assert**: Perform various assertions:
  - `visible` / `hidden`: Element visibility
  - `exist` / `not-exist`: Element existence
  - `contain`: Element contains text
  - `have-text`: Element has exact text
  - `have-value`: Input has specific value
  - `have-attr`: Element has attribute

## Action Parameters

Each action type supports specific parameters:

```javascript
// Navigate action
{
  "type": "navigate",
  "parameters": {
    "url": "https://example.com",
    "waitForLoad": true
  }
}

// Click action
{
  "type": "click",
  "parameters": {
    "locator": "#submit-button",
    "waitTimeout": 5000
  }
}

// Type action
{
  "type": "type",
  "parameters": {
    "locator": "#username",
    "text": "testuser",
    "clear": true,
    "waitTimeout": 5000
  }
}

// Assert action
{
  "type": "assert",
  "parameters": {
    "locator": ".success-message",
    "assertion": "visible",
    "waitTimeout": 5000
  }
}
```

## Example Test Case Structure

The test runner expects test cases from the backend in this format:

```json
{
  "id": "123",
  "name": "Login Test",
  "description": "Test user login functionality",
  "actions": [
    {
      "id": "1",
      "type": "navigate",
      "name": "Go to login page",
      "parameters": {
        "url": "https://example.com/login"
      },
      "enabled": true
    },
    {
      "id": "2",
      "type": "type",
      "name": "Enter username",
      "parameters": {
        "locator": "#username",
        "text": "testuser"
      },
      "enabled": true
    },
    {
      "id": "3",
      "type": "click",
      "name": "Click login button",
      "parameters": {
        "locator": "#login-btn"
      },
      "enabled": true
    }
  ]
}
```

## Integration with Backend

The test runner integrates with your backend API endpoints:

- `GET /api/test-cases/:id` - Fetch individual test case
- `GET /api/test-suites/:id` - Fetch test suite
- `GET /api/test-suites/:id/test-cases` - Fetch test suite with all test cases
- `PUT /api/test-cases/:id` - Update test case execution status (optional)

## Reporting

Cypress automatically generates:
- **Videos** of test execution (in `cypress/videos/`)
- **Screenshots** on failures (in `cypress/screenshots/`)
- **HTML reports** with detailed test results
- **Console logs** with step-by-step execution details

## Troubleshooting

### Backend Connection Issues
```bash
# Test backend connectivity
curl http://localhost:5000/health
```

### Test Case Not Found
- Verify the test case ID exists in your backend
- Check that the backend is running and accessible
- Ensure the test case has actions defined

### Action Execution Failures
- Verify element locators are correct
- Check that the application is loaded before actions execute
- Review Cypress videos and screenshots for visual debugging

## Development

### Adding New Action Types

1. Add the action executor in `cypress/support/commands.js`:
```javascript
Cypress.Commands.add('executeNewAction', (action) => {
  const { param1, param2 } = action.parameters
  // Implementation here
})
```

2. Add the case in the main `executeAction` command:
```javascript
case 'new-action':
  cy.executeNewAction(action)
  break
```

### Custom Assertions

Add custom assertion types in the `executeAssertAction` command.

## CI/CD Integration

Example GitHub Actions workflow:

```yaml
name: UI Tests
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      
      - name: Install dependencies
        run: npm install
        working-directory: ./test-runner
      
      - name: Run test case
        run: npm run run-test-case -- --test-case=123
        working-directory: ./test-runner
        env:
          BACKEND_URL: ${{ secrets.BACKEND_URL }}
          BASE_URL: ${{ secrets.BASE_URL }}
```
