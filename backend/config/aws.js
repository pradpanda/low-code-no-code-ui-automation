const AWS = require('aws-sdk');

// Configure AWS SDK
AWS.config.update({
  region: process.env.AWS_REGION || 'us-east-1',
  accessKeyId: process.env.AWS_ACCESS_KEY_ID,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

// Create DynamoDB client
const dynamodb = new AWS.DynamoDB.DocumentClient();

// Table names
const TABLES = {
  TEST_SUITES: process.env.DYNAMODB_TEST_SUITES_TABLE || 'ui-automation-test-suites',
  TEST_CASES: process.env.DYNAMODB_TEST_CASES_TABLE || 'ui-automation-test-cases'
};

/**
 * Initialize DynamoDB tables if they don't exist
 */
async function initializeTables() {
  const dynamodbAdmin = new AWS.DynamoDB();
  
  try {
    // Test Suites table schema
    const testSuitesTableParams = {
      TableName: TABLES.TEST_SUITES,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST'
    };

    // Test Cases table schema
    const testCasesTableParams = {
      TableName: TABLES.TEST_CASES,
      KeySchema: [
        { AttributeName: 'id', KeyType: 'HASH' }
      ],
      AttributeDefinitions: [
        { AttributeName: 'id', AttributeType: 'S' },
        { AttributeName: 'testSuiteId', AttributeType: 'S' }
      ],
      BillingMode: 'PAY_PER_REQUEST',
      GlobalSecondaryIndexes: [
        {
          IndexName: 'TestSuiteIndex',
          KeySchema: [
            { AttributeName: 'testSuiteId', KeyType: 'HASH' }
          ],
          Projection: { ProjectionType: 'ALL' }
        }
      ]
    };

    // Create tables if they don't exist
    const tables = [testSuitesTableParams, testCasesTableParams];
    
    for (const tableParams of tables) {
      try {
        await dynamodbAdmin.describeTable({ TableName: tableParams.TableName }).promise();
        console.log(`✅ Table ${tableParams.TableName} already exists`);
      } catch (error) {
        if (error.code === 'ResourceNotFoundException') {
          console.log(`📦 Creating table ${tableParams.TableName}...`);
          await dynamodbAdmin.createTable(tableParams).promise();
          console.log(`✅ Table ${tableParams.TableName} created successfully`);
        } else {
          console.error(`❌ Error checking table ${tableParams.TableName}:`, error);
        }
      }
    }
  } catch (error) {
    console.error('❌ Error initializing DynamoDB tables:', error);
  }
}

module.exports = {
  dynamodb,
  TABLES,
  initializeTables
};
