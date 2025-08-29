const mysql = require('mysql2/promise');
const AWS = require('aws-sdk');

// Database configuration based on environment
const DB_TYPE = process.env.DB_TYPE || 'local'; // 'local' or 'aws'

let dbConnection = null;
let dynamodb = null;
let TABLES = {
  TEST_SUITES: 'test_suites',
  TEST_CASES: 'test_cases',
  TEST_ACTIONS: 'test_actions',
  ACTION_DEFINITIONS: 'action_definitions',
  EXECUTION_HISTORY: 'execution_history'
};

/**
 * Initialize database connection based on configuration
 */
async function initializeDatabase() {
  console.log(`🔧 Initializing database connection (Type: ${DB_TYPE})`);
  
  if (DB_TYPE === 'local') {
    await initializeMySQL();
  } else if (DB_TYPE === 'aws') {
    await initializeDynamoDB();
  } else {
    throw new Error(`Unsupported database type: ${DB_TYPE}`);
  }
}

/**
 * Initialize MySQL connection for local development
 */
async function initializeMySQL() {
  try {
    const config = {
      host: process.env.MYSQL_HOST || 'localhost',
      port: process.env.MYSQL_PORT || 3306,
      user: process.env.MYSQL_USER || 'root',
      password: process.env.MYSQL_PASSWORD || '',
      database: process.env.MYSQL_DATABASE || 'ui_automation_platform',
      waitForConnections: true,
      connectionLimit: 10,
      queueLimit: 0,
      acquireTimeout: 60000,
      timeout: 60000,
      reconnect: true
    };

    // Create connection pool
    dbConnection = mysql.createPool(config);
    
    // Test connection
    const connection = await dbConnection.getConnection();
    console.log('✅ MySQL database connected successfully');
    connection.release();

  } catch (error) {
    console.error('❌ MySQL connection failed:', error);
    throw error;
  }
}

/**
 * Initialize DynamoDB for AWS deployment
 */
async function initializeDynamoDB() {
  try {
    // Configure AWS SDK
    AWS.config.update({
      region: process.env.AWS_REGION || 'us-east-1',
      accessKeyId: process.env.AWS_ACCESS_KEY_ID,
      secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
    });

    // Create DynamoDB client
    dynamodb = new AWS.DynamoDB.DocumentClient();
    
    // Set table names for DynamoDB
    TABLES = {
      TEST_SUITES: process.env.DYNAMODB_TEST_SUITES_TABLE || 'ui-automation-test-suites',
      TEST_CASES: process.env.DYNAMODB_TEST_CASES_TABLE || 'ui-automation-test-cases'
    };

    console.log('✅ DynamoDB configured successfully');
    
    // Initialize tables if needed
    await initializeDynamoDBTables();
    
  } catch (error) {
    console.error('❌ DynamoDB initialization failed:', error);
    throw error;
  }
}

/**
 * Initialize DynamoDB tables if they don't exist
 */
async function initializeDynamoDBTables() {
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

/**
 * Get database connection/client
 */
function getDatabase() {
  if (DB_TYPE === 'local') {
    return { mysql: dbConnection, type: 'mysql' };
  } else if (DB_TYPE === 'aws') {
    return { dynamodb, type: 'dynamodb' };
  }
  throw new Error(`Database not initialized or unsupported type: ${DB_TYPE}`);
}

/**
 * Close database connections
 */
async function closeDatabase() {
  if (DB_TYPE === 'local' && dbConnection) {
    await dbConnection.end();
    console.log('🔌 MySQL connection closed');
  }
  // DynamoDB doesn't need explicit closing
}

/**
 * Health check for database connection
 */
async function healthCheck() {
  try {
    if (DB_TYPE === 'local') {
      const connection = await dbConnection.getConnection();
      await connection.ping();
      connection.release();
      return { status: 'healthy', type: 'mysql' };
    } else if (DB_TYPE === 'aws') {
      // Simple DynamoDB health check
      await dynamodb.listTables().promise();
      return { status: 'healthy', type: 'dynamodb' };
    }
  } catch (error) {
    return { status: 'unhealthy', error: error.message, type: DB_TYPE };
  }
}

module.exports = {
  initializeDatabase,
  getDatabase,
  closeDatabase,
  healthCheck,
  TABLES,
  DB_TYPE
};
