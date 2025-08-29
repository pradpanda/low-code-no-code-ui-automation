-- UI Automation Platform Database Setup
-- Create database and tables for the automation platform

-- Create the database
CREATE DATABASE IF NOT EXISTS ui_automation_platform;
USE ui_automation_platform;

-- Create TEST_SUITES table
CREATE TABLE IF NOT EXISTS test_suites (
    id INT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    tags JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_name (name),
    INDEX idx_is_active (is_active),
    INDEX idx_created_at (created_at)
);

-- Create TEST_CASES table
CREATE TABLE IF NOT EXISTS test_cases (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_suite_id INT NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    priority ENUM('low', 'medium', 'high', 'critical') DEFAULT 'medium',
    status ENUM('active', 'inactive', 'archived') DEFAULT 'active',
    expected_result TEXT,
    tags JSON,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    last_executed TIMESTAMP NULL,
    execution_count INT DEFAULT 0,
    FOREIGN KEY (test_suite_id) REFERENCES test_suites(id) ON DELETE CASCADE,
    INDEX idx_test_suite_id (test_suite_id),
    INDEX idx_name (name),
    INDEX idx_priority (priority),
    INDEX idx_status (status),
    INDEX idx_created_at (created_at),
    INDEX idx_last_executed (last_executed)
);

-- Create ACTION_DEFINITIONS table (master list of available actions)
CREATE TABLE IF NOT EXISTS action_definitions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    action_type VARCHAR(100) NOT NULL UNIQUE,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    category VARCHAR(100) NOT NULL,
    icon VARCHAR(100),
    parameter_schema JSON,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    INDEX idx_action_type (action_type),
    INDEX idx_category (category),
    INDEX idx_is_active (is_active)
);

-- Create TEST_ACTIONS table
CREATE TABLE IF NOT EXISTS test_actions (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_case_id INT NOT NULL,
    action_type VARCHAR(100) NOT NULL,
    name VARCHAR(255) NOT NULL,
    description TEXT,
    parameters JSON,
    order_index INT NOT NULL,
    enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
    FOREIGN KEY (action_type) REFERENCES action_definitions(action_type) ON UPDATE CASCADE,
    INDEX idx_test_case_id (test_case_id),
    INDEX idx_action_type (action_type),
    INDEX idx_order (test_case_id, order_index),
    INDEX idx_enabled (enabled)
);

-- Create EXECUTION_HISTORY table
CREATE TABLE IF NOT EXISTS execution_history (
    id INT AUTO_INCREMENT PRIMARY KEY,
    test_case_id INT NOT NULL,
    status ENUM('pending', 'running', 'completed', 'failed') DEFAULT 'pending',
    started_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    completed_at TIMESTAMP NULL,
    duration_ms INT,
    results JSON,
    error_message TEXT,
    step_results JSON,
    FOREIGN KEY (test_case_id) REFERENCES test_cases(id) ON DELETE CASCADE,
    INDEX idx_test_case_id (test_case_id),
    INDEX idx_status (status),
    INDEX idx_started_at (started_at),
    INDEX idx_completed_at (completed_at)
);

-- Insert default action definitions (ignore duplicates)
INSERT IGNORE INTO action_definitions (action_type, name, description, category, icon, parameter_schema, is_active) VALUES
('click', 'Click Element', 'Click on a web element', 'interaction', 'cursor-pointer', 
 '{"parameters": [{"name": "locator", "type": "string", "required": true, "description": "CSS selector, XPath, or element identifier", "placeholder": "#button-id, .class-name"}, {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)", "min": 100, "max": 30000}]}', true),

('type', 'Type Text', 'Type text into an input field', 'interaction', 'keyboard',
 '{"parameters": [{"name": "locator", "type": "string", "required": true, "description": "CSS selector, XPath, or element identifier for input field", "placeholder": "#input-id, input[name=username]"}, {"name": "text", "type": "string", "required": true, "description": "Text to type into the field", "placeholder": "Enter text here..."}, {"name": "clearFirst", "type": "boolean", "required": false, "default": true, "description": "Clear the field before typing"}, {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)", "min": 100, "max": 30000}]}', true),

('wait', 'Wait', 'Wait for a specified time or condition', 'timing', 'clock',
 '{"parameters": [{"name": "waitType", "type": "select", "required": true, "description": "Type of wait to perform", "options": [{"value": "time", "label": "Wait for Time"}, {"value": "element", "label": "Wait for Element"}, {"value": "elementVisible", "label": "Wait for Element Visible"}, {"value": "elementClickable", "label": "Wait for Element Clickable"}]}, {"name": "duration", "type": "number", "required": false, "description": "Duration in milliseconds (for time wait)", "placeholder": "2000", "min": 100, "max": 60000}, {"name": "locator", "type": "string", "required": false, "description": "Element locator (for element waits)", "placeholder": "#element-id, .class-name"}, {"name": "timeout", "type": "number", "required": false, "default": 10000, "description": "Maximum time to wait (ms)", "min": 100, "max": 60000}]}', true),

('navigate', 'Navigate', 'Navigate to a URL or perform browser navigation', 'navigation', 'globe',
 '{"parameters": [{"name": "action", "type": "select", "required": true, "description": "Navigation action to perform", "options": [{"value": "goto", "label": "Go to URL"}, {"value": "back", "label": "Go Back"}, {"value": "forward", "label": "Go Forward"}, {"value": "refresh", "label": "Refresh Page"}]}, {"name": "url", "type": "string", "required": false, "description": "URL to navigate to (for goto action)", "placeholder": "https://example.com"}, {"name": "waitForLoad", "type": "boolean", "required": false, "default": true, "description": "Wait for page to fully load"}]}', true),

('assert', 'Assert', 'Verify conditions and validate test results', 'validation', 'check-circle',
 '{"parameters": [{"name": "assertionType", "type": "select", "required": true, "description": "Type of assertion to perform", "options": [{"value": "elementExists", "label": "Element Exists"}, {"value": "elementVisible", "label": "Element is Visible"}, {"value": "elementText", "label": "Element Text Equals"}, {"value": "elementTextContains", "label": "Element Text Contains"}, {"value": "pageTitle", "label": "Page Title Equals"}, {"value": "pageUrl", "label": "Page URL Contains"}, {"value": "elementAttribute", "label": "Element Attribute Equals"}]}, {"name": "locator", "type": "string", "required": false, "description": "Element locator (for element assertions)", "placeholder": "#element-id, .class-name"}, {"name": "expectedValue", "type": "string", "required": false, "description": "Expected value for comparison", "placeholder": "Expected text or value"}, {"name": "attributeName", "type": "string", "required": false, "description": "Attribute name (for attribute assertions)", "placeholder": "class, id, href, etc."}, {"name": "caseSensitive", "type": "boolean", "required": false, "default": true, "description": "Case sensitive comparison"}]}', true),

('select', 'Select Option', 'Select an option from a dropdown or select element', 'interaction', 'list',
 '{"parameters": [{"name": "locator", "type": "string", "required": true, "description": "CSS selector for the select element", "placeholder": "select[name=country], #dropdown-id"}, {"name": "selectionType", "type": "select", "required": true, "description": "How to select the option", "options": [{"value": "value", "label": "By Value"}, {"value": "text", "label": "By Visible Text"}, {"value": "index", "label": "By Index"}]}, {"name": "value", "type": "string", "required": true, "description": "Value, text, or index to select", "placeholder": "option-value, Option Text, or 0"}]}', true),

('hover', 'Hover', 'Hover over an element', 'interaction', 'mouse-pointer',
 '{"parameters": [{"name": "locator", "type": "string", "required": true, "description": "CSS selector for the element to hover over", "placeholder": "#menu-item, .hover-target"}, {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)", "min": 100, "max": 30000}]}', true),

('scroll', 'Scroll', 'Scroll the page or an element', 'navigation', 'arrows-expand',
 '{"parameters": [{"name": "scrollType", "type": "select", "required": true, "description": "Type of scroll action", "options": [{"value": "toElement", "label": "Scroll to Element"}, {"value": "toTop", "label": "Scroll to Top"}, {"value": "toBottom", "label": "Scroll to Bottom"}, {"value": "byPixels", "label": "Scroll by Pixels"}]}, {"name": "locator", "type": "string", "required": false, "description": "Element to scroll to (for toElement)", "placeholder": "#target-element"}, {"name": "x", "type": "number", "required": false, "description": "Horizontal scroll amount in pixels", "default": 0}, {"name": "y", "type": "number", "required": false, "description": "Vertical scroll amount in pixels", "default": 0}]}', true);

-- Clear existing sample data (optional - comment out if you want to keep existing data)
-- DELETE FROM test_actions WHERE test_case_id IN (SELECT id FROM test_cases WHERE name IN ('Valid Login Test', 'Invalid Login Test', 'Main Navigation Test', 'Contact Form Test'));
-- DELETE FROM test_cases WHERE name IN ('Valid Login Test', 'Invalid Login Test', 'Main Navigation Test', 'Contact Form Test');
-- DELETE FROM test_suites WHERE name IN ('Login Tests', 'Navigation Tests', 'Form Tests');

-- Insert sample data for testing (ignore duplicates)
INSERT IGNORE INTO test_suites (name, description, tags, is_active) VALUES
('Login Tests', 'Test cases for user authentication functionality', '["authentication", "login", "security"]', true),
('Navigation Tests', 'Test cases for website navigation and routing', '["navigation", "routing", "ui"]', true),
('Form Tests', 'Test cases for form validation and submission', '["forms", "validation", "input"]', true);

-- Get the test suite IDs for sample data
SET @login_suite_id = (SELECT id FROM test_suites WHERE name = 'Login Tests' LIMIT 1);
SET @nav_suite_id = (SELECT id FROM test_suites WHERE name = 'Navigation Tests' LIMIT 1);
SET @form_suite_id = (SELECT id FROM test_suites WHERE name = 'Form Tests' LIMIT 1);

-- Insert sample test cases (ignore duplicates)
INSERT IGNORE INTO test_cases (test_suite_id, name, description, priority, status, expected_result, tags) VALUES
(@login_suite_id, 'Valid Login Test', 'Test login with valid credentials', 'high', 'active', 'User should be successfully logged in and redirected to dashboard', '["positive", "smoke"]'),
(@login_suite_id, 'Invalid Login Test', 'Test login with invalid credentials', 'medium', 'active', 'User should see error message and remain on login page', '["negative", "validation"]'),
(@nav_suite_id, 'Main Navigation Test', 'Test all main navigation links', 'medium', 'active', 'All navigation links should work and load correct pages', '["smoke", "navigation"]'),
(@form_suite_id, 'Contact Form Test', 'Test contact form submission', 'low', 'active', 'Form should submit successfully and show confirmation message', '["forms", "positive"]');

-- Get the test case ID for sample actions
SET @login_test_id = (SELECT id FROM test_cases WHERE name = 'Valid Login Test' AND test_suite_id = @login_suite_id LIMIT 1);

-- Insert sample test actions for the first test case (Valid Login Test) (ignore duplicates)
INSERT IGNORE INTO test_actions (test_case_id, action_type, name, description, parameters, order_index, enabled) VALUES
(@login_test_id, 'navigate', 'Navigate to Login Page', 'Open the login page', '{"action": "goto", "url": "https://example.com/login", "waitForLoad": true}', 1, true),
(@login_test_id, 'type', 'Enter Username', 'Type username into username field', '{"locator": "#username", "text": "testuser@example.com", "clearFirst": true, "waitTimeout": 5000}', 2, true),
(@login_test_id, 'type', 'Enter Password', 'Type password into password field', '{"locator": "#password", "text": "password123", "clearFirst": true, "waitTimeout": 5000}', 3, true),
(@login_test_id, 'click', 'Click Login Button', 'Click the login submit button', '{"locator": "#login-button", "waitTimeout": 5000}', 4, true),
(@login_test_id, 'wait', 'Wait for Dashboard', 'Wait for dashboard page to load', '{"waitType": "element", "locator": "#dashboard", "timeout": 10000}', 5, true),
(@login_test_id, 'assert', 'Verify Login Success', 'Verify user is logged in', '{"assertionType": "pageUrl", "expectedValue": "/dashboard", "caseSensitive": false}', 6, true);

-- Show created tables
SHOW TABLES;

-- Show sample data
SELECT 'TEST SUITES:' as '';
SELECT id, name, description, is_active, created_at FROM test_suites;

SELECT 'TEST CASES:' as '';
SELECT id, test_suite_id, name, priority, status, created_at FROM test_cases;

SELECT 'ACTION DEFINITIONS:' as '';
SELECT id, action_type, name, category, is_active FROM action_definitions;

SELECT 'TEST ACTIONS:' as '';
SELECT id, test_case_id, action_type, name, order_index, enabled FROM test_actions WHERE test_case_id = 1;

SELECT 'Database setup completed successfully!' as 'STATUS';

