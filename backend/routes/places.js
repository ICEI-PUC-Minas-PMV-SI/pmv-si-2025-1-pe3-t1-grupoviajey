// routes/places.js
const express = require('express');
const router = express.Router();

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

router.get('/places', async (req, res) => {
  const { lat, lng, type } = req.query;
  if (!lat || !lng || !type) {
    return res.status(400).json({ error: 'lat, lng e type são obrigatórios' });
  }
  const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&type=${type}&key=${API_KEY}&language=pt-BR`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== 'OK') {
      console.error('Erro do Google Places:', data);
      return res.status(500).json({ error: 'Erro do Google Places', details: data });
    }
    const results = (data.results || []).map(place => ({
      name: place.name,
      rating: place.rating,
      types: place.types,
      address: place.vicinity,
      location: place.geometry && place.geometry.location
    }));
    res.json({ results });
  } catch (err) {
    console.error('Erro no proxy:', err);
    res.status(500).json({ error: 'Erro ao buscar dados do Google Places', details: err.message });
  }
});

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
