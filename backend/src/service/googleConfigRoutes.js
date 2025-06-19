require('dotenv').config();
const express = require('express');
const router = express.Router();

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;

if (!API_KEY) {
  console.error('GOOGLE_MAPS_API_KEY não está definida nas variáveis de ambiente');
  process.exit(1);
}

router.get('/config', (req, res) => {
  res.json({ apiKey: API_KEY });
});

module.exports = router; 