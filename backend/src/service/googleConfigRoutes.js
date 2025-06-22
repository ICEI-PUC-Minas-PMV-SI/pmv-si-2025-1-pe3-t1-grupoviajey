// Apenas retorna a variável de ambiente VITE_GOOGLE_MAPS_KEY (ou similar)
const express = require('express');
const router = express.Router();

router.get('/', (req, res) => {
  const key = process.env.GOOGLE_MAPS_API_KEY;
  if (!key) {
    return res.status(500).json({ message: 'API key não configurada.' });
  }
  res.json({ apiKey: key });
});

module.exports = router;
