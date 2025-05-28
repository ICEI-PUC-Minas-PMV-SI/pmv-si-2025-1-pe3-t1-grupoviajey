const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());

const API_KEY = process.env.GOOGLE_MAPS_API_KEY || 'YOUR_API_KEY';  // Use environment variable

const fetch = (...args) => import('node-fetch').then(({default: fetch}) => fetch(...args));

// Endpoint para fornecer a API key de forma segura
app.get('/api/config', (req, res) => {
    res.json({ apiKey: API_KEY });
});

app.get('/api/places', async (req, res) => {
  const { lat, lng, type } = req.query;
  if (!lat || !lng || !type) {
    return res.status(400).json({ error: 'lat, lng e type são obrigatórios' });
  }
  const url = `https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=${lat},${lng}&radius=3000&type=${type}&key=${API_KEY}&language=pt-BR`;

  try {
    const response = await fetch(url);
    const data = await response.json();
    if (data.status !== 'OK') {
      console.error('Erro do Google Places:', data);
      return res.status(500).json({ error: 'Erro do Google Places', details: data });
    }
    // Só retorna dados gratuitos
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

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});