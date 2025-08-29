# UI Automation Platform

A comprehensive full-stack application for creating and managing UI test automation workflows with an intuitive drag-and-drop interface.

## 🌟 Features

- **Visual Test Builder**: Drag-and-drop interface for creating test workflows
- **Multi-Database Support**: Switch between local MySQL and AWS DynamoDB
- **Test Suite Management**: Organize tests into logical suites
- **Action Library**: Pre-built actions for common UI interactions
- **Real-time Execution**: Run tests and view results instantly
- **Modern UI**: Built with React, TypeScript, and Material-UI

## 🏗️ Architecture

### Frontend
- **React 18** with TypeScript
- **Material-UI v5** for components
- **React Query** for data fetching
- **@dnd-kit** for drag-and-drop functionality
- **React Router** for navigation

### Backend
- **Node.js** with Express.js
- **Database Abstraction**: Supports both MySQL and DynamoDB
- **Environment-based Configuration**
- **RESTful API** design
- **Joi** validation

### Database
- **Local Development**: MySQL
- **Production**: AWS DynamoDB
- **Automatic Schema Setup**

## 🚀 Quick Start

### Prerequisites
- Node.js 16+
- MySQL (for local development)
- AWS credentials (for DynamoDB deployment)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/pradpanda/low-code-no-code-ui-automation.git
   cd low-code-no-code-ui-automation
   ```

2. **Install dependencies**
   ```bash
   # Root dependencies
   npm install
   
   # Backend dependencies
   cd backend
   npm install
   cd ..
   
   # Frontend dependencies
   cd frontend
   npm install
   cd ..
   ```

3. **Database Setup**
   ```bash
   # Import the database schema
   mysql -u root -p < database/setup.sql
   ```

4. **Environment Configuration**
   ```bash
   # Copy environment template
   cp backend/env.example backend/.env
   
   # Edit backend/.env with your database credentials
   DB_TYPE=mysql
   MYSQL_HOST=localhost
   MYSQL_PORT=3306
   MYSQL_USER=your_username
   MYSQL_PASSWORD=your_password
   MYSQL_DATABASE=ui_automation_platform
   ```

5. **Start the Application**
   ```bash
   # Terminal 1: Start Backend
   cd backend
   npm start
   
   # Terminal 2: Start Frontend
   cd frontend
   npm start
   ```

6. **Access the Application**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📁 Project Structure

```
low-code-no-code-ui-automation/
├── backend/                 # Node.js/Express API
│   ├── config/             # Database and AWS configuration
│   ├── models/             # Data models (MySQL & DynamoDB)
│   ├── routes/             # API endpoints
│   ├── server.js           # Express server
│   └── package.json
├── frontend/               # React application
│   ├── src/
│   │   ├── components/     # Reusable UI components
│   │   ├── pages/          # Page components
│   │   ├── services/       # API services
│   │   └── App.tsx
│   └── package.json
├── database/
│   └── setup.sql           # MySQL schema and initial data
└── README.md
```

## 🎮 Usage

### Creating Test Suites
1. Navigate to "Test Suites" page
2. Click "Create New Test Suite"
3. Fill in name, description, and tags
4. Save to create your test suite

### Building Test Cases
1. Go to a Test Suite and click "Create Test Case"
2. Use the **Action Palette** on the left to see available actions
3. **Drag actions** from the palette to the **Workflow Canvas**
4. Configure action parameters in the details panel
5. Save your test case

### Available Actions
- **Navigation**: Go to URL, refresh page, go back/forward
- **Interactions**: Click, type, select, hover
- **Validations**: Check text, verify elements, assert values
- **Data**: Store/retrieve variables, generate test data
- **Wait**: Wait for elements, time delays, conditions

## 🔧 Configuration

### Database Switching
Change `DB_TYPE` in `backend/.env`:
- `mysql` - Use local MySQL database
- `dynamodb` - Use AWS DynamoDB (requires AWS credentials)

### AWS DynamoDB Setup
```env
DB_TYPE=dynamodb
AWS_ACCESS_KEY_ID=your_access_key
AWS_SECRET_ACCESS_KEY=your_secret_key
AWS_REGION=us-west-2
```

## 🧪 Development

### Backend Development
```bash
cd backend
npm run dev    # Start with nodemon for auto-reload
```

### Frontend Development
```bash
cd frontend
npm start      # Start with hot reload
```

### Database Management
```bash
# Re-run database setup
mysql -u root -p < database/setup.sql

# Check backend health
curl http://localhost:5000/health
```

## 🚀 Deployment

### Frontend (Netlify/Vercel)
```bash
cd frontend
npm run build
# Deploy the 'build' folder
```

### Backend (Heroku/AWS)
- Set environment variables
- Ensure `DB_TYPE=dynamodb` for production
- Configure AWS credentials

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Submit a Pull Request

## 📝 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙋‍♂️ Support

For support and questions:
- Create an issue on GitHub
- Contact: pradpanda@example.com

## 🎯 Roadmap

- [ ] Test execution engine
- [ ] Screenshot capture
- [ ] CI/CD integration
- [ ] Advanced reporting
- [ ] Multi-browser support
- [ ] Cloud test execution

---

**Built with ❤️ by pradpanda**