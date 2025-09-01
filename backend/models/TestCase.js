const { v4: uuidv4 } = require('uuid');
const { getDatabase, TABLES, DB_TYPE } = require('../config/database');

/**
 * Test Case Model
 * Represents a single test case containing multiple test actions
 * Works with both MySQL and DynamoDB
 */
class TestCase {
  constructor(data) {
    this.id = data.id || (DB_TYPE === 'mysql' ? null : uuidv4());
    this.testSuiteId = data.test_suite_id || data.testSuiteId;
    this.name = data.name;
    this.description = data.description || '';
    this.actions = data.actions || []; // Array of test actions (for DynamoDB) or loaded separately (for MySQL)
    // Handle tags - could be JSON string from MySQL or array from DynamoDB
    this.tags = Array.isArray(data.tags) ? data.tags : 
                (typeof data.tags === 'string' ? JSON.parse(data.tags || '[]') : []);
    this.priority = data.priority || 'medium'; // low, medium, high, critical
    this.status = data.status || 'active'; // active, inactive, archived
    this.expectedResult = data.expected_result || data.expectedResult || '';
    this.createdAt = data.created_at || data.createdAt || new Date().toISOString();
    this.updatedAt = data.updated_at || data.updatedAt || new Date().toISOString();
    this.lastExecuted = data.last_executed || data.lastExecuted || null;
    this.executionCount = data.execution_count || data.executionCount || 0;
  }

  /**
   * Create a new test case
   */
  async save() {
    const db = getDatabase();
    
    if (db.type === 'mysql') {
      return await this._saveMySQL(db.mysql);
    } else if (db.type === 'dynamodb') {
      return await this._saveDynamoDB(db.dynamodb);
    }
    
    throw new Error(`Unsupported database type: ${db.type}`);
  }

  /**
   * Save to MySQL
   */
  async _saveMySQL(mysql) {
    const query = `
      INSERT INTO ${TABLES.TEST_CASES} 
      (test_suite_id, name, description, priority, status, expected_result, tags, created_at, updated_at, last_executed, execution_count) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      this.testSuiteId,
      this.name,
      this.description,
      this.priority,
      this.status,
      this.expectedResult,
      JSON.stringify(this.tags),
      new Date(this.createdAt).toISOString().slice(0, 19).replace('T', ' '),
      new Date().toISOString().slice(0, 19).replace('T', ' '),
      this.lastExecuted ? new Date(this.lastExecuted).toISOString().slice(0, 19).replace('T', ' ') : null,
      this.executionCount
    ];

    try {
      const [result] = await mysql.execute(query, values);
      this.id = result.insertId;
      return this;
    } catch (error) {
      console.error('Error saving test case to MySQL:', error);
      throw new Error('Failed to save test case');
    }
  }

  /**
   * Save to DynamoDB
   */
  async _saveDynamoDB(dynamodb) {
    const params = {
      TableName: TABLES.TEST_CASES,
      Item: {
        id: this.id,
        testSuiteId: this.testSuiteId,
        name: this.name,
        description: this.description,
        actions: this.actions,
        tags: this.tags,
        priority: this.priority,
        status: this.status,
        expectedResult: this.expectedResult,
        createdAt: this.createdAt,
        updatedAt: new Date().toISOString(),
        lastExecuted: this.lastExecuted,
        executionCount: this.executionCount
      }
    };

    try {
      await dynamodb.put(params).promise();
      return this;
    } catch (error) {
      console.error('Error saving test case to DynamoDB:', error);
      throw new Error('Failed to save test case');
    }
  }

  /**
   * Get test case by ID
   */
  static async findById(id) {
    const db = getDatabase();
    
    if (db.type === 'mysql') {
      return await TestCase._findByIdMySQL(id, db.mysql);
    } else if (db.type === 'dynamodb') {
      return await TestCase._findByIdDynamoDB(id, db.dynamodb);
    }
    
    throw new Error(`Unsupported database type: ${db.type}`);
  }

  /**
   * Find by ID in MySQL
   */
  static async _findByIdMySQL(id, mysql) {
    const query = `SELECT * FROM ${TABLES.TEST_CASES} WHERE id = ?`;
    
    try {
      const [rows] = await mysql.execute(query, [id]);
      if (rows.length > 0) {
        const testCase = new TestCase(rows[0]);
        // Load actions separately for MySQL
        await testCase._loadActions(mysql);
        return testCase;
      }
      return null;
    } catch (error) {
      console.error('Error finding test case in MySQL:', error);
      throw new Error('Failed to find test case');
    }
  }

  /**
   * Find by ID in DynamoDB
   */
  static async _findByIdDynamoDB(id, dynamodb) {
    const params = {
      TableName: TABLES.TEST_CASES,
      Key: { id }
    };

    try {
      const result = await dynamodb.get(params).promise();
      if (result.Item) {
        return new TestCase(result.Item);
      }
      return null;
    } catch (error) {
      console.error('Error finding test case in DynamoDB:', error);
      throw new Error('Failed to find test case');
    }
  }

  /**
   * Load actions for MySQL (from test_actions table)
   */
  async _loadActions(mysql) {
    const query = `
      SELECT ta.*, ad.name as action_name, ad.category, ad.icon, ad.parameter_schema
      FROM ${TABLES.TEST_ACTIONS} ta
      LEFT JOIN ${TABLES.ACTION_DEFINITIONS} ad ON ta.action_type = ad.action_type
      WHERE ta.test_case_id = ? AND ta.enabled = 1
      ORDER BY ta.order_index ASC
    `;
    
    try {
      const [rows] = await mysql.execute(query, [this.id]);
      this.actions = rows.map(row => ({
        id: row.id,
        type: row.action_type,  // Fixed: use 'type' instead of 'actionType'
        name: row.name,
        description: row.description,
        parameters: typeof row.parameters === 'string' ? JSON.parse(row.parameters) : row.parameters,
        orderIndex: row.order_index,
        enabled: row.enabled,
        actionDefinition: {
          name: row.action_name,
          category: row.category,
          icon: row.icon,
          parameterSchema: typeof row.parameter_schema === 'string' ? JSON.parse(row.parameter_schema) : row.parameter_schema
        }
      }));
    } catch (error) {
      console.error('Error loading actions for test case:', error);
      this.actions = [];
    }
  }

  /**
   * Update actions for MySQL (in test_actions table)
   */
  async _updateActions(actions, mysql) {
    // Debug: Write to file to prove this method is called
    const fs = require('fs');
    fs.writeFileSync('/tmp/actions-debug.txt', `_updateActions called with ${actions.length} actions for test case ${this.id}\n`, { flag: 'a' });
    
    try {
      // First, delete all existing actions for this test case
      const deleteQuery = `DELETE FROM ${TABLES.TEST_ACTIONS} WHERE test_case_id = ?`;
      await mysql.execute(deleteQuery, [this.id]);

      // Insert new actions
      if (actions && actions.length > 0) {
        const insertQuery = `
          INSERT INTO ${TABLES.TEST_ACTIONS} 
          (test_case_id, action_type, name, description, parameters, order_index, enabled) 
          VALUES (?, ?, ?, ?, ?, ?, ?)
        `;

        for (let i = 0; i < actions.length; i++) {
          const action = actions[i];
          const values = [
            this.id,
            action.type,
            action.name || '',
            action.description || '',
            JSON.stringify(action.parameters || {}),
            i + 1, // order_index starts from 1
            action.enabled !== false ? 1 : 0 // Default to enabled
          ];
          await mysql.execute(insertQuery, values);
        }
      }

      console.log(`Updated ${actions.length} actions for test case ${this.id}`);
    } catch (error) {
      console.error('Error updating actions for test case:', error);
      throw new Error('Failed to update test case actions');
    }
  }

  /**
   * Get test cases by test suite ID
   */
  static async findByTestSuiteId(testSuiteId) {
    const db = getDatabase();
    
    if (db.type === 'mysql') {
      return await TestCase._findByTestSuiteIdMySQL(testSuiteId, db.mysql);
    } else if (db.type === 'dynamodb') {
      return await TestCase._findByTestSuiteIdDynamoDB(testSuiteId, db.dynamodb);
    }
    
    throw new Error(`Unsupported database type: ${db.type}`);
  }

  /**
   * Find by test suite ID in MySQL
   */
  static async _findByTestSuiteIdMySQL(testSuiteId, mysql) {
    const query = `SELECT * FROM ${TABLES.TEST_CASES} WHERE test_suite_id = ? ORDER BY created_at DESC`;
    
    try {
      const [rows] = await mysql.execute(query, [testSuiteId]);
      const testCases = [];
      
      for (const row of rows) {
        const testCase = new TestCase(row);
        await testCase._loadActions(mysql);
        testCases.push(testCase);
      }
      
      return testCases;
    } catch (error) {
      console.error('Error finding test cases by suite ID in MySQL:', error);
      throw new Error('Failed to find test cases');
    }
  }

  /**
   * Find by test suite ID in DynamoDB
   */
  static async _findByTestSuiteIdDynamoDB(testSuiteId, dynamodb) {
    const params = {
      TableName: TABLES.TEST_CASES,
      IndexName: 'TestSuiteIndex',
      KeyConditionExpression: 'testSuiteId = :testSuiteId',
      ExpressionAttributeValues: {
        ':testSuiteId': testSuiteId
      }
    };

    try {
      const result = await dynamodb.query(params).promise();
      return result.Items.map(item => new TestCase(item));
    } catch (error) {
      console.error('Error finding test cases by suite ID in DynamoDB:', error);
      throw new Error('Failed to find test cases');
    }
  }

  /**
   * Get all test cases
   */
  static async findAll(filters = {}) {
    const db = getDatabase();
    
    if (db.type === 'mysql') {
      return await TestCase._findAllMySQL(filters, db.mysql);
    } else if (db.type === 'dynamodb') {
      return await TestCase._findAllDynamoDB(filters, db.dynamodb);
    }
    
    throw new Error(`Unsupported database type: ${db.type}`);
  }

  /**
   * Find all in MySQL
   */
  static async _findAllMySQL(filters, mysql) {
    let query = `SELECT * FROM ${TABLES.TEST_CASES}`;
    const values = [];
    const conditions = [];

    if (filters.status) {
      conditions.push('status = ?');
      values.push(filters.status);
    }

    if (filters.priority) {
      conditions.push('priority = ?');
      values.push(filters.priority);
    }

    if (conditions.length > 0) {
      query += ' WHERE ' + conditions.join(' AND ');
    }

    query += ' ORDER BY created_at DESC';

    try {
      const [rows] = await mysql.execute(query, values);
      const testCases = [];
      
      for (const row of rows) {
        const testCase = new TestCase(row);
        await testCase._loadActions(mysql);
        testCases.push(testCase);
      }
      
      return testCases;
    } catch (error) {
      console.error('Error finding test cases in MySQL:', error);
      throw new Error('Failed to find test cases');
    }
  }

  /**
   * Find all in DynamoDB
   */
  static async _findAllDynamoDB(filters, dynamodb) {
    const params = {
      TableName: TABLES.TEST_CASES
    };

    // Add filter expressions
    const filterExpressions = [];
    const expressionAttributeValues = {};

    if (filters.status) {
      filterExpressions.push('status = :status');
      expressionAttributeValues[':status'] = filters.status;
    }

    if (filters.priority) {
      filterExpressions.push('priority = :priority');
      expressionAttributeValues[':priority'] = filters.priority;
    }

    if (filterExpressions.length > 0) {
      params.FilterExpression = filterExpressions.join(' AND ');
      params.ExpressionAttributeValues = expressionAttributeValues;
    }

    try {
      const result = await dynamodb.scan(params).promise();
      return result.Items.map(item => new TestCase(item));
    } catch (error) {
      console.error('Error finding test cases in DynamoDB:', error);
      throw new Error('Failed to find test cases');
    }
  }

  /**
   * Update test case
   */
  async update(updateData) {
    console.log(`[TestCase.update] Called with data:`, updateData);
    console.log(`[TestCase.update] Actions count:`, updateData.actions?.length || 0);
    
    const db = getDatabase();
    
    if (db.type === 'mysql') {
      return await this._updateMySQL(updateData, db.mysql);
    } else if (db.type === 'dynamodb') {
      return await this._updateDynamoDB(updateData, db.dynamodb);
    }
    
    throw new Error(`Unsupported database type: ${db.type}`);
  }

  /**
   * Update in MySQL
   */
  async _updateMySQL(updateData, mysql) {
    // Debug: Write updateData to file
    const fs = require('fs');
    fs.writeFileSync('/tmp/mysql-debug.txt', `_updateMySQL called with: ${JSON.stringify(updateData, null, 2)}\n`, { flag: 'a' });
    
    const allowedUpdates = ['name', 'description', 'actions', 'priority', 'status', 'expectedResult', 'tags', 'lastExecuted', 'executionCount'];
    const updateFields = [];
    const values = [];

    // Build update query
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'expectedResult') {
          updateFields.push('expected_result = ?');
          values.push(updateData[key]);
        } else if (key === 'lastExecuted') {
          updateFields.push('last_executed = ?');
          // Convert ISO datetime to MySQL format if it's a string
          const lastExecuted = updateData[key];
          if (typeof lastExecuted === 'string' && lastExecuted.includes('T')) {
            values.push(lastExecuted.slice(0, 19).replace('T', ' '));
          } else {
            values.push(lastExecuted);
          }
        } else if (key === 'executionCount') {
          updateFields.push('execution_count = ?');
          values.push(updateData[key]);
        } else if (key === 'tags') {
          updateFields.push('tags = ?');
          values.push(JSON.stringify(updateData[key]));
        } else if (key === 'actions') {
          // Actions are handled separately in test_actions table
          // Don't add to updateFields - will be processed later
        } else {
          updateFields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });

    if (updateFields.length === 0 && !updateData.actions) {
      throw new Error('No valid fields to update');
    }

    // Only execute the main table update if there are fields to update
    if (updateFields.length > 0) {
      // Always update the updatedAt timestamp
      updateFields.push('updated_at = ?');
      values.push(new Date().toISOString().slice(0, 19).replace('T', ' '));
      values.push(this.id);

      const query = `UPDATE ${TABLES.TEST_CASES} SET ${updateFields.join(', ')} WHERE id = ?`;
      await mysql.execute(query, values);
    }
    
    try {
      // Handle actions update if provided
      if (updateData.actions) {
        console.log(`Updating actions for test case ${this.id}:`, updateData.actions);
        await this._updateActions(updateData.actions, mysql);
      } else {
        console.log(`No actions provided in updateData for test case ${this.id}`);
      }
      
      // Fetch updated record
      const updated = await TestCase.findById(this.id);
      return updated;
    } catch (error) {
      console.error('Error updating test case in MySQL:', error);
      throw new Error('Failed to update test case');
    }
  }

  /**
   * Update in DynamoDB
   */
  async _updateDynamoDB(updateData, dynamodb) {
    const allowedUpdates = [
      'name', 'description', 'actions', 'tags', 'priority', 
      'status', 'expectedResult', 'lastExecuted', 'executionCount'
    ];
    const updateExpression = [];
    const expressionAttributeValues = {};
    const expressionAttributeNames = {};

    // Build update expression
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updateExpression.push(`#${key} = :${key}`);
        expressionAttributeNames[`#${key}`] = key;
        expressionAttributeValues[`:${key}`] = updateData[key];
      }
    });

    if (updateExpression.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Always update the updatedAt timestamp
    updateExpression.push('#updatedAt = :updatedAt');
    expressionAttributeNames['#updatedAt'] = 'updatedAt';
    expressionAttributeValues[':updatedAt'] = new Date().toISOString();

    const params = {
      TableName: TABLES.TEST_CASES,
      Key: { id: this.id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await dynamodb.update(params).promise();
      return new TestCase(result.Attributes);
    } catch (error) {
      console.error('Error updating test case in DynamoDB:', error);
      throw new Error('Failed to update test case');
    }
  }

  /**
   * Delete test case
   */
  async delete() {
    const db = getDatabase();
    
    if (db.type === 'mysql') {
      return await this._deleteMySQL(db.mysql);
    } else if (db.type === 'dynamodb') {
      return await this._deleteDynamoDB(db.dynamodb);
    }
    
    throw new Error(`Unsupported database type: ${db.type}`);
  }

  /**
   * Delete from MySQL
   */
  async _deleteMySQL(mysql) {
    // MySQL will handle cascade delete of test_actions due to foreign key constraint
    const query = `DELETE FROM ${TABLES.TEST_CASES} WHERE id = ?`;

    try {
      await mysql.execute(query, [this.id]);
      return true;
    } catch (error) {
      console.error('Error deleting test case from MySQL:', error);
      throw new Error('Failed to delete test case');
    }
  }

  /**
   * Delete from DynamoDB
   */
  async _deleteDynamoDB(dynamodb) {
    const params = {
      TableName: TABLES.TEST_CASES,
      Key: { id: this.id }
    };

    try {
      await dynamodb.delete(params).promise();
      return true;
    } catch (error) {
      console.error('Error deleting test case from DynamoDB:', error);
      throw new Error('Failed to delete test case');
    }
  }

  /**
   * Record execution
   */
  async recordExecution() {
    return this.update({
      lastExecuted: new Date().toISOString(),
      executionCount: this.executionCount + 1
    });
  }
}

module.exports = TestCase;