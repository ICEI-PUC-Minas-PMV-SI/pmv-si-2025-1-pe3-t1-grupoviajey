require('dotenv').config();
console.log('API KEY:', process.env.GOOGLE_MAPS_API_KEY);
const express = require('express');
const cors = require('cors');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');
const app = express();

app.use(cors());

const API_KEY = process.env.GOOGLE_MAPS_API_KEY;
if (!API_KEY) {
  console.error('GOOGLE_MAPS_API_KEY não está definida nas variáveis de ambiente');
  process.exit(1);
}

const UNSPLASH_ACCESS_KEY = process.env.UNSPLASH_ACCESS_KEY;
if (!UNSPLASH_ACCESS_KEY) {
  console.error('UNSPLASH_ACCESS_KEY não está definida nas variáveis de ambiente');
  // Não faz o processo parar, mas avisa
}

const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

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

// Endpoint para buscar imagens do Unsplash de forma segura
app.get('/api/unsplash/search', async (req, res) => {
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

// Ative o livereload
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, '../frontend/public'));

// Middleware para injetar o script do livereload
app.use(connectLivereload());

// Servir arquivos estáticos do frontend
app.use(express.static(path.join(__dirname, '../frontend/public')));

const PORT = 3001;
app.listen(PORT, () => {
  console.log(`Proxy rodando em http://localhost:${PORT}`);
});

console.log('Testando autoreload');