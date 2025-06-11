require('dotenv').config();
console.log('API KEY:', process.env.GOOGLE_MAPS_API_KEY);
const express = require('express');
const cors = require('cors');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const app = express();

app.use(cors());

// Importar rotas separadas
const configRoutes = require('./routes/config');
const placesRoutes = require('./routes/places');

app.use('/api', configRoutes);
app.use('/api', placesRoutes);

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
