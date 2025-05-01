// Main server file - Simplified static version
const express = require('express');
const path = require('path');

// Create Express app
const app = express();
const PORT = process.env.PORT || 5000;

// Static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Route for the home page
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'desktop.html'));
});

// Route for the explorar page
app.get('/explorar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'explorar.html'));
});

// Route for the detail page
app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

// Route for the itinerary page
app.get('/itinerary', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'itinerary.html'));
});

// Fallback to home page for all other routes
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'desktop.html'));
});

// Start the server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Viajey static server is running on port ${PORT}`);
});