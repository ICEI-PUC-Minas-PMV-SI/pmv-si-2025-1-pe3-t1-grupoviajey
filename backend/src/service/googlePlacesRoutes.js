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

module.exports = router; 