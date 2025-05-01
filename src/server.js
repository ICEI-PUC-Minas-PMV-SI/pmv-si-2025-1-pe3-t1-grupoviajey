// Main server file
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const path = require('path');
const { sequelize } = require('./models');

// Routes
const userRoutes = require('./routes/users');
const itineraryRoutes = require('./routes/itineraries');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// API routes
app.use('/api/users', userRoutes);
app.use('/api/itineraries', itineraryRoutes);

// Serve the main HTML file for all routes (for client-side routing)
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Database connection and server start
async function startServer() {
  try {
    // Database connection
    await sequelize.authenticate();
    console.log('Database connection established successfully.');
    
    // Sync models with database (create tables if they don't exist)
    await sequelize.sync();
    console.log('Database models synchronized.');
    
    // Start the server
    app.listen(PORT, '0.0.0.0', () => {
      console.log(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error('Unable to start the server:', error);
  }
}

// Start the server
startServer();