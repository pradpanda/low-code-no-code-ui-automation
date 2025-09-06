-- Complete Selenium Action Definitions for UI Automation Platform
-- This script adds comprehensive Selenium actions with proper parameter schemas

USE ui_automation_platform;

-- Clear existing action definitions to start fresh
DELETE FROM action_definitions;

-- Insert comprehensive Selenium action definitions
INSERT INTO action_definitions (action_type, name, description, category, icon, parameter_schema, is_active) VALUES

-- ===== INTERACTION ACTIONS =====
('click', 'Click Element', 'Click on a web element (button, link, etc.)', 'interaction', 'cursor-pointer', 
'{"parameters": [
  {"name": "locator", "type": "string", "required": true, "description": "CSS selector, XPath, or element identifier", "placeholder": "#button-id, .class-name, //button[@id=\"submit\"]"},
  {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)", "min": 100, "max": 30000},
  {"name": "clickType", "type": "select", "required": false, "default": "single", "description": "Type of click", "options": [{"value": "single", "label": "Single Click"}, {"value": "double", "label": "Double Click"}, {"value": "right", "label": "Right Click"}]},
  {"name": "force", "type": "boolean", "required": false, "default": false, "description": "Force click even if element is not visible"}
]}', true),

('type', 'Type Text', 'Type text into an input field', 'interaction', 'keyboard',
'{"parameters": [
  {"name": "locator", "type": "string", "required": true, "description": "CSS selector, XPath, or element identifier for input field", "placeholder": "#input-id, input[name=\"username\"], //input[@type=\"text\"]"},
  {"name": "text", "type": "string", "required": true, "description": "Text to type into the field", "placeholder": "Enter text here..."},
  {"name": "clearFirst", "type": "boolean", "required": false, "default": true, "description": "Clear the field before typing"},
  {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)", "min": 100, "max": 30000},
  {"name": "pressEnter", "type": "boolean", "required": false, "default": false, "description": "Press Enter key after typing"}
]}', true),

('select', 'Select Option', 'Select an option from a dropdown or select element', 'interaction', 'list',
'{"parameters": [
  {"name": "locator", "type": "string", "required": true, "description": "CSS selector for the select element", "placeholder": "select[name=\"country\"], #dropdown-id"},
  {"name": "selectionType", "type": "select", "required": true, "description": "How to select the option", "options": [{"value": "value", "label": "By Value"}, {"value": "text", "label": "By Visible Text"}, {"value": "index", "label": "By Index"}]},
  {"name": "value", "type": "string", "required": true, "description": "Value, text, or index to select", "placeholder": "option-value, Option Text, or 0"},
  {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)"}
]}', true),

('hover', 'Hover Over Element', 'Move mouse cursor over an element', 'interaction', 'mouse-pointer',
'{"parameters": [
  {"name": "locator", "type": "string", "required": true, "description": "CSS selector for the element to hover over", "placeholder": "#menu-item, .hover-target"},
  {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)"},
  {"name": "duration", "type": "number", "required": false, "default": 1000, "description": "How long to hover (ms)", "min": 100, "max": 10000}
]}', true),

('drag_drop', 'Drag and Drop', 'Drag an element and drop it to another location', 'interaction', 'move',
'{"parameters": [
  {"name": "sourceLocator", "type": "string", "required": true, "description": "Element to drag", "placeholder": "#draggable-item"},
  {"name": "targetLocator", "type": "string", "required": true, "description": "Drop target element", "placeholder": "#drop-zone"},
  {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for elements (ms)"}
]}', true),

('upload_file', 'Upload File', 'Upload a file using file input element', 'interaction', 'upload',
'{"parameters": [
  {"name": "locator", "type": "string", "required": true, "description": "File input element selector", "placeholder": "input[type=\"file\"]"},
  {"name": "filePath", "type": "string", "required": true, "description": "Path to file to upload", "placeholder": "/path/to/file.pdf"},
  {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)"}
]}', true),

-- ===== NAVIGATION ACTIONS =====
('navigate', 'Navigate', 'Navigate to a URL or perform browser navigation', 'navigation', 'globe',
'{"parameters": [
  {"name": "action", "type": "select", "required": true, "description": "Navigation action to perform", "options": [{"value": "goto", "label": "Go to URL"}, {"value": "back", "label": "Go Back"}, {"value": "forward", "label": "Go Forward"}, {"value": "refresh", "label": "Refresh Page"}]},
  {"name": "url", "type": "string", "required": false, "description": "URL to navigate to (for goto action)", "placeholder": "https://example.com"},
  {"name": "waitForLoad", "type": "boolean", "required": false, "default": true, "description": "Wait for page to fully load"}
]}', true),

('scroll', 'Scroll', 'Scroll the page or an element', 'navigation', 'arrows-expand',
'{"parameters": [
  {"name": "scrollType", "type": "select", "required": true, "description": "Type of scroll action", "options": [{"value": "toElement", "label": "Scroll to Element"}, {"value": "toTop", "label": "Scroll to Top"}, {"value": "toBottom", "label": "Scroll to Bottom"}, {"value": "byPixels", "label": "Scroll by Pixels"}]},
  {"name": "locator", "type": "string", "required": false, "description": "Element to scroll to (for toElement)", "placeholder": "#target-element"},
  {"name": "x", "type": "number", "required": false, "description": "Horizontal scroll amount in pixels", "default": 0},
  {"name": "y", "type": "number", "required": false, "description": "Vertical scroll amount in pixels", "default": 0}
]}', true),

('resize_window', 'Resize Window', 'Resize the browser window', 'navigation', 'fullscreen',
'{"parameters": [
  {"name": "width", "type": "number", "required": true, "description": "Window width in pixels", "placeholder": "1920", "min": 300, "max": 3840},
  {"name": "height", "type": "number", "required": true, "description": "Window height in pixels", "placeholder": "1080", "min": 200, "max": 2160}
]}', true),

('maximize_window', 'Maximize Window', 'Maximize the browser window', 'navigation', 'fullscreen',
'{"parameters": []}', true),

-- ===== TIMING ACTIONS =====
('wait', 'Wait', 'Wait for a specified time or condition', 'timing', 'clock',
'{"parameters": [
  {"name": "waitType", "type": "select", "required": true, "description": "Type of wait to perform", "options": [{"value": "time", "label": "Wait for Time"}, {"value": "element", "label": "Wait for Element"}, {"value": "elementVisible", "label": "Wait for Element Visible"}, {"value": "elementClickable", "label": "Wait for Element Clickable"}, {"value": "elementNotVisible", "label": "Wait for Element Not Visible"}, {"value": "textPresent", "label": "Wait for Text Present"}]},
  {"name": "duration", "type": "number", "required": false, "description": "Duration in milliseconds (for time wait)", "placeholder": "2000", "min": 100, "max": 60000},
  {"name": "locator", "type": "string", "required": false, "description": "Element locator (for element waits)", "placeholder": "#element-id, .class-name"},
  {"name": "text", "type": "string", "required": false, "description": "Text to wait for (for text waits)", "placeholder": "Loading complete"},
  {"name": "timeout", "type": "number", "required": false, "default": 10000, "description": "Maximum time to wait (ms)", "min": 100, "max": 60000}
]}', true),

-- ===== VALIDATION ACTIONS =====
('assert', 'Assert', 'Verify conditions and validate test results', 'validation', 'check-circle',
'{"parameters": [
  {"name": "assertionType", "type": "select", "required": true, "description": "Type of assertion to perform", "options": [
    {"value": "elementExists", "label": "Element Exists"}, 
    {"value": "elementVisible", "label": "Element is Visible"}, 
    {"value": "elementNotVisible", "label": "Element is Not Visible"},
    {"value": "elementText", "label": "Element Text Equals"}, 
    {"value": "elementTextContains", "label": "Element Text Contains"}, 
    {"value": "pageTitle", "label": "Page Title Equals"}, 
    {"value": "pageUrl", "label": "Page URL Contains"}, 
    {"value": "elementAttribute", "label": "Element Attribute Equals"},
    {"value": "elementCount", "label": "Element Count Equals"}
  ]},
  {"name": "locator", "type": "string", "required": false, "description": "Element locator (for element assertions)", "placeholder": "#element-id, .class-name"},
  {"name": "expectedValue", "type": "string", "required": false, "description": "Expected value for comparison", "placeholder": "Expected text or value"},
  {"name": "attributeName", "type": "string", "required": false, "description": "Attribute name (for attribute assertions)", "placeholder": "class, id, href, etc."},
  {"name": "caseSensitive", "type": "boolean", "required": false, "default": true, "description": "Case sensitive comparison"},
  {"name": "timeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for condition (ms)"}
]}', true),

('verify', 'Verify', 'Soft verification that continues test execution even if failed', 'validation', 'check',
'{"parameters": [
  {"name": "verificationType", "type": "select", "required": true, "description": "Type of verification to perform", "options": [
    {"value": "elementExists", "label": "Element Exists"}, 
    {"value": "elementVisible", "label": "Element is Visible"}, 
    {"value": "elementText", "label": "Element Text Equals"}, 
    {"value": "elementTextContains", "label": "Element Text Contains"}, 
    {"value": "pageTitle", "label": "Page Title Equals"}, 
    {"value": "pageUrl", "label": "Page URL Contains"}
  ]},
  {"name": "locator", "type": "string", "required": false, "description": "Element locator", "placeholder": "#element-id, .class-name"},
  {"name": "expectedValue", "type": "string", "required": false, "description": "Expected value", "placeholder": "Expected text or value"},
  {"name": "timeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait (ms)"}
]}', true),

-- ===== FORM ACTIONS =====
('check', 'Check Checkbox', 'Check or uncheck a checkbox', 'interaction', 'check-box',
'{"parameters": [
  {"name": "locator", "type": "string", "required": true, "description": "Checkbox element selector", "placeholder": "input[type=\"checkbox\"]"},
  {"name": "action", "type": "select", "required": false, "default": "check", "description": "Action to perform", "options": [{"value": "check", "label": "Check"}, {"value": "uncheck", "label": "Uncheck"}, {"value": "toggle", "label": "Toggle"}]},
  {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)"}
]}', true),

('radio', 'Select Radio Button', 'Select a radio button', 'interaction', 'radio-button',
'{"parameters": [
  {"name": "locator", "type": "string", "required": true, "description": "Radio button element selector", "placeholder": "input[type=\"radio\"][value=\"option1\"]"},
  {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)"}
]}', true),

('clear', 'Clear Field', 'Clear the content of an input field', 'interaction', 'clear',
'{"parameters": [
  {"name": "locator", "type": "string", "required": true, "description": "Input field selector", "placeholder": "#input-field, input[name=\"username\"]"},
  {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)"}
]}', true),

-- ===== KEYBOARD ACTIONS =====
('key_press', 'Press Key', 'Press keyboard keys (Enter, Tab, Escape, etc.)', 'interaction', 'keyboard',
'{"parameters": [
  {"name": "key", "type": "select", "required": true, "description": "Key to press", "options": [
    {"value": "Enter", "label": "Enter"}, 
    {"value": "Tab", "label": "Tab"}, 
    {"value": "Escape", "label": "Escape"}, 
    {"value": "Space", "label": "Space"}, 
    {"value": "ArrowUp", "label": "Arrow Up"}, 
    {"value": "ArrowDown", "label": "Arrow Down"}, 
    {"value": "ArrowLeft", "label": "Arrow Left"}, 
    {"value": "ArrowRight", "label": "Arrow Right"},
    {"value": "F1", "label": "F1"}, 
    {"value": "F5", "label": "F5"}, 
    {"value": "Delete", "label": "Delete"}, 
    {"value": "Backspace", "label": "Backspace"}
  ]},
  {"name": "locator", "type": "string", "required": false, "description": "Element to focus before key press (optional)", "placeholder": "#input-field"},
  {"name": "modifier", "type": "select", "required": false, "description": "Modifier key", "options": [{"value": "", "label": "None"}, {"value": "ctrl", "label": "Ctrl"}, {"value": "shift", "label": "Shift"}, {"value": "alt", "label": "Alt"}]}
]}', true),

-- ===== WINDOW/TAB ACTIONS =====
('switch_tab', 'Switch Tab', 'Switch to a different browser tab', 'navigation', 'tab',
'{"parameters": [
  {"name": "switchType", "type": "select", "required": true, "description": "How to switch tabs", "options": [{"value": "index", "label": "By Index"}, {"value": "title", "label": "By Title"}, {"value": "url", "label": "By URL"}]},
  {"name": "value", "type": "string", "required": true, "description": "Tab index (0,1,2...), title, or URL pattern", "placeholder": "0, Page Title, or example.com"}
]}', true),

('close_tab', 'Close Tab', 'Close the current browser tab', 'navigation', 'close',
'{"parameters": []}', true),

('new_tab', 'Open New Tab', 'Open a new browser tab', 'navigation', 'add',
'{"parameters": [
  {"name": "url", "type": "string", "required": false, "description": "URL to open in new tab (optional)", "placeholder": "https://example.com"}
]}', true),

-- ===== ADVANCED ACTIONS =====
('execute_js', 'Execute JavaScript', 'Execute custom JavaScript code', 'advanced', 'code',
'{"parameters": [
  {"name": "script", "type": "textarea", "required": true, "description": "JavaScript code to execute", "placeholder": "document.getElementById(\"myElement\").style.display = \"none\";"},
  {"name": "returnValue", "type": "boolean", "required": false, "default": false, "description": "Return value from script execution"}
]}', true),

('take_screenshot', 'Take Screenshot', 'Capture a screenshot of the current page', 'utility', 'camera',
'{"parameters": [
  {"name": "filename", "type": "string", "required": false, "description": "Screenshot filename (optional)", "placeholder": "screenshot.png"},
  {"name": "element", "type": "string", "required": false, "description": "Element to screenshot (optional - full page if empty)", "placeholder": "#specific-element"},
  {"name": "path", "type": "string", "required": false, "description": "Save path (optional)", "placeholder": "./screenshots/"}
]}', true),

('get_text', 'Get Element Text', 'Extract text content from an element', 'utility', 'text',
'{"parameters": [
  {"name": "locator", "type": "string", "required": true, "description": "Element selector", "placeholder": "#text-element, .content"},
  {"name": "variableName", "type": "string", "required": true, "description": "Variable name to store the text", "placeholder": "extractedText"},
  {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)"}
]}', true),

('get_attribute', 'Get Element Attribute', 'Extract attribute value from an element', 'utility', 'info',
'{"parameters": [
  {"name": "locator", "type": "string", "required": true, "description": "Element selector", "placeholder": "#my-element"},
  {"name": "attributeName", "type": "string", "required": true, "description": "Attribute name to get", "placeholder": "href, class, id, data-value"},
  {"name": "variableName", "type": "string", "required": true, "description": "Variable name to store the value", "placeholder": "attributeValue"},
  {"name": "waitTimeout", "type": "number", "required": false, "default": 5000, "description": "Maximum time to wait for element (ms)"}
]}', true);

-- Show count of inserted actions
SELECT COUNT(*) as 'Total Actions Added' FROM action_definitions;

-- Show all action categories
SELECT category, COUNT(*) as 'Actions Count' 
FROM action_definitions 
GROUP BY category 
ORDER BY category;

-- Show all actions by category
SELECT category, action_type, name 
FROM action_definitions 
ORDER BY category, name;

