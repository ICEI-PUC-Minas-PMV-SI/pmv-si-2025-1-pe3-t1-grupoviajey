const express = require('express');
const router = express.Router();

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!UNSPLASH_ACCESS_KEY) {
  console.error('UNSPLASH_ACCESS_KEY não está definida nas variáveis de ambiente');
  // Não faz o processo parar, mas avisa
}

// Endpoint para buscar imagens do Unsplash de forma segura
router.get('/unsplash/search', async (req, res) => {
  const { destination } = req.query;
  if (!destination) {
    return res.status(400).json({ error: 'Destino obrigatório' });
  }
  try {
    const url = `https://api.unsplash.com/search/photos?query=${encodeURIComponent(destination)}&orientation=landscape&per_page=10`;
    const response = await fetch(url, {
      headers: { Authorization: `Client-ID ${UNSPLASH_ACCESS_KEY}` }
    });
    if (!response.ok) {
      return res.status(response.status).json({ error: 'Erro ao buscar imagem do Unsplash' });
    }
    const text = await response.text();
    console.log('Resposta bruta do Unsplash:', text);
    try {
      const data = JSON.parse(text);
      res.json(data);
    } catch (e) {
      res.status(500).json({ error: 'Resposta inesperada do Unsplash', details: text });
    }
  } catch (err) {
    console.error('Erro no proxy Unsplash:', err);
    res.status(500).json({ error: 'Erro ao buscar imagem do Unsplash', details: err.message });
  }
});

module.exports = router; 