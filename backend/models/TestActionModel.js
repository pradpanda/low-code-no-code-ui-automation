const { v4: uuidv4 } = require('uuid');
const { getDatabase, TABLES } = require('../config/database');

/**
 * Test Action Database Model - MySQL only
 * For DynamoDB, actions are stored as part of TestCase
 */
class TestActionModel {
  constructor(data) {
    this.id = data.id || null; // Will be set by database auto-increment
    this.testCaseId = data.test_case_id || data.testCaseId;
    this.actionType = data.action_type || data.actionType;
    this.name = data.name;
    this.description = data.description || '';
    this.parameters = data.parameters || {};
    this.orderIndex = data.order_index || data.orderIndex || 0;
    this.enabled = data.enabled !== undefined ? data.enabled : true;
    this.createdAt = data.created_at || data.createdAt || new Date().toISOString();
    this.updatedAt = data.updated_at || data.updatedAt || new Date().toISOString();
  }

  async save() {
    const db = getDatabase();
    if (db.type !== 'mysql') {
      throw new Error('TestActionModel is only for MySQL');
    }

    const query = `
      INSERT INTO ${TABLES.TEST_ACTIONS} 
      (test_case_id, action_type, name, description, parameters, order_index, enabled, created_at, updated_at) 
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;
    
    const values = [
      this.testCaseId, this.actionType, this.name, this.description,
      JSON.stringify(this.parameters), this.orderIndex, this.enabled,
      new Date().toISOString().slice(0, 19).replace('T', ' '), // Convert to MySQL datetime format
      new Date().toISOString().slice(0, 19).replace('T', ' ')  // Convert to MySQL datetime format
    ];

    try {
      const [result] = await db.mysql.execute(query, values);
      this.id = result.insertId; // Set the auto-generated ID
      return this;
    } catch (error) {
      console.error('Error saving test action:', error);
      throw new Error('Failed to save test action');
    }
  }

  static async findById(id) {
    const db = getDatabase();
    if (db.type !== 'mysql') {
      throw new Error('TestActionModel is only for MySQL');
    }

    const query = `SELECT * FROM ${TABLES.TEST_ACTIONS} WHERE id = ?`;
    
    try {
      const [rows] = await db.mysql.execute(query, [id]);
      return rows.length > 0 ? new TestActionModel(rows[0]) : null;
    } catch (error) {
      console.error('Error finding test action:', error);
      throw new Error('Failed to find test action');
    }
  }

  static async findByTestCaseId(testCaseId) {
    const db = getDatabase();
    if (db.type !== 'mysql') {
      throw new Error('TestActionModel is only for MySQL');
    }

    const query = `SELECT * FROM ${TABLES.TEST_ACTIONS} WHERE test_case_id = ? ORDER BY order_index ASC`;
    
    try {
      const [rows] = await db.mysql.execute(query, [testCaseId]);
      return rows.map(row => new TestActionModel(row));
    } catch (error) {
      console.error('Error finding test actions:', error);
      throw new Error('Failed to find test actions');
    }
  }

  static async getActionDefinitions() {
    const db = getDatabase();
    if (db.type !== 'mysql') {
      throw new Error('TestActionModel is only for MySQL');
    }

    const query = `SELECT * FROM ${TABLES.ACTION_DEFINITIONS} WHERE is_active = 1 ORDER BY category, name`;
    
    try {
      const [rows] = await db.mysql.execute(query);
      return rows.map(row => ({
        id: row.id,
        actionType: row.action_type,
        name: row.name,
        description: row.description,
        category: row.category,
        icon: row.icon,
        parameterSchema: typeof row.parameter_schema === 'string' ? JSON.parse(row.parameter_schema) : row.parameter_schema,
        isActive: row.is_active
      }));
    } catch (error) {
      console.error('Error getting action definitions:', error);
      throw new Error('Failed to get action definitions');
    }
  }

  async update() {
    const db = getDatabase();
    if (db.type !== 'mysql') {
      throw new Error('TestActionModel is only for MySQL');
    }

    const query = `
      UPDATE ${TABLES.TEST_ACTIONS} 
      SET test_case_id = ?, action_type = ?, name = ?, description = ?, 
          parameters = ?, order_index = ?, enabled = ?, updated_at = ?
      WHERE id = ?
    `;

    const values = [
      this.testCaseId,
      this.actionType,
      this.name,
      this.description,
      JSON.stringify(this.parameters),
      this.orderIndex,
      this.enabled,
      this.updatedAt,
      this.id
    ];

    try {
      console.log('Updating test action with query:', query);
      console.log('Values:', values);
      
      const [result] = await db.mysql.execute(query, values);
      console.log('Update result:', result);
      
      return this;
    } catch (error) {
      console.error('Error updating test action:', error);
      throw new Error('Failed to update test action');
    }
  }

  async delete() {
    const db = getDatabase();
    if (db.type !== 'mysql') {
      throw new Error('TestActionModel is only for MySQL');
    }

    const query = `DELETE FROM ${TABLES.TEST_ACTIONS} WHERE id = ?`;

    try {
      await db.mysql.execute(query, [this.id]);
      return true;
    } catch (error) {
      console.error('Error deleting test action:', error);
      throw new Error('Failed to delete test action');
    }
  }
}

module.exports = TestActionModel;
