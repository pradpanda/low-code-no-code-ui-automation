# UI Automation Platform Backend

Node.js Express API server with AWS DynamoDB integration for the UI Automation Platform.

## 🏗️ Architecture

```
backend/
├── config/
│   └── aws.js              # AWS SDK configuration and table initialization
├── models/
│   ├── TestSuite.js        # Test Suite data model and methods
│   ├── TestCase.js         # Test Case data model and methods
│   └── TestAction.js       # Test Action definitions and utilities
├── routes/
│   ├── testSuites.js       # Test Suite API endpoints
│   ├── testCases.js        # Test Case API endpoints
│   └── testActions.js      # Test Action API endpoints
├── package.json            # Dependencies and scripts
├── server.js               # Main Express server
└── env.example             # Environment variables template
```

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- AWS Account with DynamoDB access
- Valid AWS credentials

### Installation
```bash
cd backend
npm install
```

### Environment Setup
```bash
cp env.example .env
```

Configure your `.env` file:
```env
# AWS Configuration
AWS_REGION=us-east-1
AWS_ACCESS_KEY_ID=your_access_key_here
AWS_SECRET_ACCESS_KEY=your_secret_key_here

# DynamoDB Tables
DYNAMODB_TEST_SUITES_TABLE=ui-automation-test-suites
DYNAMODB_TEST_CASES_TABLE=ui-automation-test-cases

# Server Configuration
PORT=5000
NODE_ENV=development

# CORS Configuration
FRONTEND_URL=http://localhost:3000
```

### Running the Server
```bash
# Development mode with auto-reload
npm run dev

# Production mode
npm start
```

## 📊 Database Schema

### DynamoDB Tables

#### Test Suites Table
- **Primary Key**: `id` (String)
- **Attributes**:
  - `name` (String) - Test suite name
  - `description` (String) - Optional description
  - `tags` (Array) - List of tags
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp
  - `isActive` (Boolean) - Active status
  - `testCasesCount` (Number) - Count of test cases

#### Test Cases Table
- **Primary Key**: `id` (String)
- **Global Secondary Index**: `TestSuiteIndex` on `testSuiteId`
- **Attributes**:
  - `testSuiteId` (String) - Reference to test suite
  - `name` (String) - Test case name
  - `description` (String) - Optional description
  - `actions` (Array) - List of test actions
  - `tags` (Array) - List of tags
  - `priority` (String) - low, medium, high, critical
  - `status` (String) - active, inactive, archived
  - `expectedResult` (String) - Expected outcome
  - `createdAt` (String) - ISO timestamp
  - `updatedAt` (String) - ISO timestamp
  - `lastExecuted` (String) - Last execution timestamp
  - `executionCount` (Number) - Total executions

## 🛠️ API Endpoints

### Health Check
```
GET /health
```
Returns server status and timestamp.

### Test Suites API

#### Get All Test Suites
```
GET /api/test-suites
Query Parameters:
- isActive (boolean): Filter by active status
- includeCounts (boolean): Include test case counts
```

#### Get Test Suite by ID
```
GET /api/test-suites/:id
Query Parameters:
- includeTestCases (boolean): Include related test cases
```

#### Create Test Suite
```
POST /api/test-suites
Body:
{
  "name": "string (required)",
  "description": "string (optional)",
  "tags": ["string"] (optional)
}
```

#### Update Test Suite
```
PUT /api/test-suites/:id
Body:
{
  "name": "string (optional)",
  "description": "string (optional)",
  "tags": ["string"] (optional),
  "isActive": "boolean (optional)"
}
```

#### Delete Test Suite
```
DELETE /api/test-suites/:id
Query Parameters:
- force (boolean): Delete even if contains test cases
```

#### Get Test Cases for Suite
```
GET /api/test-suites/:id/test-cases
Query Parameters:
- status (string): Filter by status
- priority (string): Filter by priority
```

#### Get Test Suite Statistics
```
GET /api/test-suites/:id/stats
```

### Test Cases API

#### Get All Test Cases
```
GET /api/test-cases
Query Parameters:
- status (string): Filter by status
- priority (string): Filter by priority
- testSuiteId (string): Filter by test suite
```

#### Get Test Case by ID
```
GET /api/test-cases/:id
```

#### Create Test Case
```
POST /api/test-cases
Body:
{
  "testSuiteId": "string (required)",
  "name": "string (required)",
  "description": "string (optional)",
  "actions": [TestAction] (optional),
  "tags": ["string"] (optional),
  "priority": "string (optional, default: medium)",
  "expectedResult": "string (optional)"
}
```

#### Update Test Case
```
PUT /api/test-cases/:id
Body: (all fields optional)
{
  "name": "string",
  "description": "string",
  "actions": [TestAction],
  "tags": ["string"],
  "priority": "string",
  "status": "string",
  "expectedResult": "string"
}
```

#### Delete Test Case
```
DELETE /api/test-cases/:id
```

#### Add Action to Test Case
```
POST /api/test-cases/:id/actions
Body: TestAction object
```

#### Update Test Case Action
```
PUT /api/test-cases/:id/actions/:actionIndex
Body: Partial TestAction object
```

#### Remove Test Case Action
```
DELETE /api/test-cases/:id/actions/:actionIndex
```

#### Execute Test Case
```
POST /api/test-cases/:id/execute
```
Returns execution results with step-by-step details.

#### Duplicate Test Case
```
POST /api/test-cases/:id/duplicate
Body:
{
  "name": "string (optional)",
  "testSuiteId": "string (optional)"
}
```

### Test Actions API

#### Get All Test Actions
```
GET /api/test-actions
Query Parameters:
- category (string): Filter by category
- type (string): Get specific action type
```

#### Get Action Categories
```
GET /api/test-actions/categories
```

#### Get Action by Type
```
GET /api/test-actions/:type
```

#### Validate Test Action
```
POST /api/test-actions/validate
Body: TestAction object
```

#### Create Test Action Instance
```
POST /api/test-actions/create
Body:
{
  "type": "string (required)",
  "parameters": "object (required)",
  "options": "object (optional)"
}
```

#### Get Action Template
```
GET /api/test-actions/templates/:type
```

#### Search Test Actions
```
GET /api/test-actions/search/:query
```

#### Get Action Statistics
```
GET /api/test-actions/stats/overview
```

## 🎯 Test Action Types

### Click Action
```javascript
{
  type: 'click',
  parameters: {
    locator: 'CSS selector or XPath',
    waitTimeout: 5000 // milliseconds
  }
}
```

### Type Action
```javascript
{
  type: 'type',
  parameters: {
    locator: 'Input field selector',
    text: 'Text to type',
    clearFirst: true, // boolean
    waitTimeout: 5000
  }
}
```

### Wait Action
```javascript
{
  type: 'wait',
  parameters: {
    waitType: 'time|element|elementVisible|elementClickable',
    duration: 2000, // for time waits
    locator: 'Element selector', // for element waits
    timeout: 10000
  }
}
```

### Navigate Action
```javascript
{
  type: 'navigate',
  parameters: {
    action: 'goto|back|forward|refresh',
    url: 'https://example.com', // for goto
    waitForLoad: true
  }
}
```

### Assert Action
```javascript
{
  type: 'assert',
  parameters: {
    assertionType: 'elementExists|elementVisible|elementText|pageTitle|pageUrl|elementAttribute',
    locator: 'Element selector',
    expectedValue: 'Expected value',
    attributeName: 'attribute name', // for attribute assertions
    caseSensitive: true
  }
}
```

### Select Action
```javascript
{
  type: 'select',
  parameters: {
    locator: 'Select element selector',
    selectionType: 'value|text|index',
    value: 'Option value, text, or index'
  }
}
```

### Hover Action
```javascript
{
  type: 'hover',
  parameters: {
    locator: 'Element selector',
    waitTimeout: 5000
  }
}
```

### Scroll Action
```javascript
{
  type: 'scroll',
  parameters: {
    scrollType: 'toElement|toTop|toBottom|byPixels',
    locator: 'Target element', // for toElement
    x: 0, // horizontal pixels
    y: 100 // vertical pixels
  }
}
```

## 🔧 Development

### Adding New Action Types

1. **Define in TestAction.js**:
```javascript
NEW_ACTION_TYPE: {
  type: 'newActionType',
  name: 'New Action Type',
  description: 'Description of the action',
  category: 'interaction', // interaction, timing, navigation, validation
  icon: 'icon-name',
  parameters: [
    {
      name: 'parameterName',
      type: 'string', // string, number, boolean, select
      required: true,
      description: 'Parameter description',
      placeholder: 'Example value',
      default: 'default value', // optional
      min: 0, // for numbers
      max: 100, // for numbers
      options: [ // for select type
        { value: 'option1', label: 'Option 1' },
        { value: 'option2', label: 'Option 2' }
      ]
    }
  ]
}
```

2. **The action will automatically**:
   - Appear in the API endpoints
   - Be available in the frontend Action Library
   - Include validation based on parameter definitions

### Error Handling

The API uses consistent error response format:
```json
{
  "success": false,
  "error": {
    "message": "Error message",
    "status": 400,
    "details": ["Additional error details"]
  }
}
```

### Validation

- **Input Validation**: Using Joi schemas for request validation
- **Action Validation**: Built-in validation for test action parameters
- **Database Validation**: AWS SDK handles DynamoDB constraints

### Logging

- **Request Logging**: Morgan middleware for HTTP request logging
- **Error Logging**: Console error logging with timestamps
- **AWS Operations**: Logged AWS DynamoDB operations

## 🚨 Error Codes

| Status | Description |
|--------|-------------|
| 200 | Success |
| 201 | Created |
| 400 | Bad Request (validation errors) |
| 404 | Not Found |
| 500 | Internal Server Error |

## 🔐 Security

### CORS Configuration
- Configured for frontend URL
- Credentials support enabled
- Preflight handling

### Input Sanitization
- Joi validation schemas
- Parameter type checking
- SQL injection prevention (NoSQL)

### AWS Security
- IAM role-based access
- Encrypted data at rest (DynamoDB)
- VPC support ready

## 📈 Performance

### Database Optimization
- Primary key design for efficient queries
- Global Secondary Index for test suite queries
- Batch operations where applicable

### Caching
- No caching implemented (can be added with Redis)
- Static asset compression enabled

### Rate Limiting
- No rate limiting implemented (can be added)
- Connection pooling handled by AWS SDK

## 🧪 Testing

### Running Tests
```bash
npm test
```

### Test Structure
```
tests/
├── models/
├── routes/
└── integration/
```

### Test Environment
Set `NODE_ENV=test` for test database isolation.

## 📦 Deployment

### Environment Variables
Ensure all production environment variables are set:
- AWS credentials and region
- Production DynamoDB table names
- CORS frontend URL
- Port configuration

### AWS Deployment Options
1. **EC2**: Traditional server deployment
2. **Elastic Beanstalk**: Platform-as-a-Service
3. **Lambda**: Serverless with API Gateway
4. **ECS**: Containerized deployment

### Health Monitoring
- Health check endpoint: `/health`
- AWS CloudWatch integration ready
- Custom metrics can be added

## 🤝 Contributing

1. Follow existing code structure
2. Add tests for new features
3. Update API documentation
4. Validate with existing test suite
5. Follow Node.js best practices

## 📚 References

- [Express.js Documentation](https://expressjs.com/)
- [AWS DynamoDB JavaScript SDK](https://docs.aws.amazon.com/AWSJavaScriptSDK/latest/AWS/DynamoDB.html)
- [Joi Validation](https://joi.dev/)
- [Node.js Best Practices](https://github.com/goldbergyoni/nodebestpractices)
