// Main server file for Viajey App
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { Sequelize } = require('sequelize');
require('dotenv').config();

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Configure Database
const sequelize = new Sequelize(
  process.env.DATABASE_URL || 'postgres://viajey:viajey@viajey_viajey:5432/viajey?sslmode=disable', 
  {
    dialect: 'postgres',
    dialectOptions: {
      ssl: process.env.NODE_ENV === 'production' ? { require: true, rejectUnauthorized: false } : false
    },
    logging: false
  }
);

// Import models
const models = require('./models');

// Initialize API routes
const userRoutes = require('./routes/users');
const itineraryRoutes = require('./routes/itineraries');
const checklistRoutes = require('./routes/checklists');
const expenseRoutes = require('./routes/expenses');
const shareRoutes = require('./routes/shares');

// API routes
app.use('/api/users', userRoutes);
app.use('/api/itineraries', itineraryRoutes);
app.use('/api/checklists', checklistRoutes);
app.use('/api/expenses', expenseRoutes);
app.use('/api/shares', shareRoutes);

// Serve the main HTML page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Sync database and start server
async function startServer() {
  try {
    // Test database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync all models with database
    await sequelize.sync({ alter: true });
    console.log('Database synchronized successfully.');
    
    // Start server
    app.listen(PORT, () => {
      console.log(`Server running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to connect to the database or start server:', error);
  }
}

// Start the server
startServer();

module.exports = app; // Export for testing