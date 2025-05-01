// Simple Express server
const express = require('express');
const path = require('path');

// Create app
const app = express();
const PORT = process.env.PORT || 5000;

// Serve static files
app.use(express.static('public'));
app.use('/static', express.static('static'));

// Main routes
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'desktop.html'));
});

app.get('/explorar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'explorar.html'));
});

app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

app.get('/itinerary', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'itinerary.html'));
});

// Start server
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server running on port ${PORT}`);
});