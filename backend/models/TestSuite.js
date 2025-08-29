const { v4: uuidv4 } = require('uuid');
const { getDatabase, TABLES, DB_TYPE } = require('../config/database');

/**
 * Test Suite Model
 * Represents a collection of test cases
 * Works with both MySQL and DynamoDB
 */
class TestSuite {
  constructor(data) {
    this.id = data.id || (DB_TYPE === 'mysql' ? null : uuidv4());
    this.name = data.name;
    this.description = data.description || '';
    // Handle tags - could be JSON string from MySQL or array from DynamoDB
    this.tags = Array.isArray(data.tags) ? data.tags : 
                (typeof data.tags === 'string' ? JSON.parse(data.tags || '[]') : []);
    this.createdAt = data.created_at || data.createdAt || new Date().toISOString();
    this.updatedAt = data.updated_at || data.updatedAt || new Date().toISOString();
    this.isActive = data.is_active !== undefined ? data.is_active : (data.isActive !== undefined ? data.isActive : true);
    this.testCasesCount = data.testCasesCount || 0;
  }

  /**
   * Create a new test suite
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
      INSERT INTO ${TABLES.TEST_SUITES} 
      (name, description, tags, is_active, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      this.name,
      this.description,
      JSON.stringify(this.tags),
      this.isActive,
      new Date(this.createdAt).toISOString().slice(0, 19).replace('T', ' '),
      new Date().toISOString().slice(0, 19).replace('T', ' ')
    ];

    try {
      const [result] = await mysql.execute(query, values);
      this.id = result.insertId;
      return this;
    } catch (error) {
      console.error('Error saving test suite to MySQL:', error);
      throw new Error('Failed to save test suite');
    }
  }

  /**
   * Save to DynamoDB
   */
  async _saveDynamoDB(dynamodb) {
    const params = {
      TableName: TABLES.TEST_SUITES,
      Item: {
        id: this.id,
        name: this.name,
        description: this.description,
        tags: this.tags,
        createdAt: this.createdAt,
        updatedAt: new Date().toISOString(),
        isActive: this.isActive,
        testCasesCount: this.testCasesCount
      }
    };

    try {
      await dynamodb.put(params).promise();
      return this;
    } catch (error) {
      console.error('Error saving test suite to DynamoDB:', error);
      throw new Error('Failed to save test suite');
    }
  }

  /**
   * Get test suite by ID
   */
  static async findById(id) {
    const db = getDatabase();
    
    if (db.type === 'mysql') {
      return await TestSuite._findByIdMySQL(id, db.mysql);
    } else if (db.type === 'dynamodb') {
      return await TestSuite._findByIdDynamoDB(id, db.dynamodb);
    }
    
    throw new Error(`Unsupported database type: ${db.type}`);
  }

  /**
   * Find by ID in MySQL
   */
  static async _findByIdMySQL(id, mysql) {
    const query = `SELECT * FROM ${TABLES.TEST_SUITES} WHERE id = ?`;
    
    try {
      const [rows] = await mysql.execute(query, [id]);
      if (rows.length > 0) {
        return new TestSuite(rows[0]);
      }
      return null;
    } catch (error) {
      console.error('Error finding test suite in MySQL:', error);
      throw new Error('Failed to find test suite');
    }
  }

  /**
   * Find by ID in DynamoDB
   */
  static async _findByIdDynamoDB(id, dynamodb) {
    const params = {
      TableName: TABLES.TEST_SUITES,
      Key: { id }
    };

    try {
      const result = await dynamodb.get(params).promise();
      if (result.Item) {
        return new TestSuite(result.Item);
      }
      return null;
    } catch (error) {
      console.error('Error finding test suite in DynamoDB:', error);
      throw new Error('Failed to find test suite');
    }
  }

  /**
   * Get all test suites
   */
  static async findAll(filters = {}) {
    const db = getDatabase();
    
    if (db.type === 'mysql') {
      return await TestSuite._findAllMySQL(filters, db.mysql);
    } else if (db.type === 'dynamodb') {
      return await TestSuite._findAllDynamoDB(filters, db.dynamodb);
    }
    
    throw new Error(`Unsupported database type: ${db.type}`);
  }

  /**
   * Find all in MySQL
   */
  static async _findAllMySQL(filters, mysql) {
    let query = `SELECT * FROM ${TABLES.TEST_SUITES}`;
    const values = [];
    
    if (filters.isActive !== undefined) {
      query += ' WHERE is_active = ?';
      values.push(filters.isActive);
    }
    
    query += ' ORDER BY created_at DESC';

    try {
      const [rows] = await mysql.execute(query, values);
      return rows.map(row => new TestSuite(row));
    } catch (error) {
      console.error('Error finding test suites in MySQL:', error);
      throw new Error('Failed to find test suites');
    }
  }

  /**
   * Find all in DynamoDB
   */
  static async _findAllDynamoDB(filters, dynamodb) {
    const params = {
      TableName: TABLES.TEST_SUITES
    };

    // Add filter expression if filters are provided
    if (filters.isActive !== undefined) {
      params.FilterExpression = 'isActive = :isActive';
      params.ExpressionAttributeValues = {
        ':isActive': filters.isActive
      };
    }

    try {
      const result = await dynamodb.scan(params).promise();
      return result.Items.map(item => new TestSuite(item));
    } catch (error) {
      console.error('Error finding test suites in DynamoDB:', error);
      throw new Error('Failed to find test suites');
    }
  }

  /**
   * Update test suite
   */
  async update(updateData) {
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
    const allowedUpdates = ['name', 'description', 'tags', 'isActive'];
    const updateFields = [];
    const values = [];

    // Build update query
    Object.keys(updateData).forEach(key => {
      if (allowedUpdates.includes(key)) {
        if (key === 'isActive') {
          updateFields.push('is_active = ?');
          values.push(updateData[key]);
        } else if (key === 'tags') {
          updateFields.push('tags = ?');
          values.push(JSON.stringify(updateData[key]));
        } else {
          updateFields.push(`${key} = ?`);
          values.push(updateData[key]);
        }
      }
    });

    if (updateFields.length === 0) {
      throw new Error('No valid fields to update');
    }

    // Always update the updatedAt timestamp
    updateFields.push('updated_at = ?');
    values.push(new Date().toISOString().slice(0, 19).replace('T', ' '));
    values.push(this.id);

    const query = `UPDATE ${TABLES.TEST_SUITES} SET ${updateFields.join(', ')} WHERE id = ?`;

    try {
      await mysql.execute(query, values);
      
      // Fetch updated record
      const updated = await TestSuite.findById(this.id);
      return updated;
    } catch (error) {
      console.error('Error updating test suite in MySQL:', error);
      throw new Error('Failed to update test suite');
    }
  }

  /**
   * Update in DynamoDB
   */
  async _updateDynamoDB(updateData, dynamodb) {
    const allowedUpdates = ['name', 'description', 'tags', 'isActive'];
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
      TableName: TABLES.TEST_SUITES,
      Key: { id: this.id },
      UpdateExpression: `SET ${updateExpression.join(', ')}`,
      ExpressionAttributeNames: expressionAttributeNames,
      ExpressionAttributeValues: expressionAttributeValues,
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await dynamodb.update(params).promise();
      return new TestSuite(result.Attributes);
    } catch (error) {
      console.error('Error updating test suite in DynamoDB:', error);
      throw new Error('Failed to update test suite');
    }
  }

  /**
   * Delete test suite
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
    const query = `DELETE FROM ${TABLES.TEST_SUITES} WHERE id = ?`;

    try {
      await mysql.execute(query, [this.id]);
      return true;
    } catch (error) {
      console.error('Error deleting test suite from MySQL:', error);
      throw new Error('Failed to delete test suite');
    }
  }

  /**
   * Delete from DynamoDB
   */
  async _deleteDynamoDB(dynamodb) {
    const params = {
      TableName: TABLES.TEST_SUITES,
      Key: { id: this.id }
    };

    try {
      await dynamodb.delete(params).promise();
      return true;
    } catch (error) {
      console.error('Error deleting test suite from DynamoDB:', error);
      throw new Error('Failed to delete test suite');
    }
  }

  /**
   * Update test cases count
   */
  async updateTestCasesCount(count) {
    const db = getDatabase();
    
    if (db.type === 'mysql') {
      return await this._updateTestCasesCountMySQL(count, db.mysql);
    } else if (db.type === 'dynamodb') {
      return await this._updateTestCasesCountDynamoDB(count, db.dynamodb);
    }
    
    throw new Error(`Unsupported database type: ${db.type}`);
  }

  /**
   * Update test cases count in MySQL
   */
  async _updateTestCasesCountMySQL(count, mysql) {
    // For MySQL, we'll calculate this dynamically from the test_cases table
    // This is just a placeholder method for compatibility
    this.testCasesCount = count;
    return this;
  }

  /**
   * Update test cases count in DynamoDB
   */
  async _updateTestCasesCountDynamoDB(count, dynamodb) {
    const params = {
      TableName: TABLES.TEST_SUITES,
      Key: { id: this.id },
      UpdateExpression: 'SET testCasesCount = :count, updatedAt = :updatedAt',
      ExpressionAttributeValues: {
        ':count': count,
        ':updatedAt': new Date().toISOString()
      },
      ReturnValues: 'ALL_NEW'
    };

    try {
      const result = await dynamodb.update(params).promise();
      return new TestSuite(result.Attributes);
    } catch (error) {
      console.error('Error updating test cases count in DynamoDB:', error);
      throw new Error('Failed to update test cases count');
    }
  }
}

module.exports = TestSuite;