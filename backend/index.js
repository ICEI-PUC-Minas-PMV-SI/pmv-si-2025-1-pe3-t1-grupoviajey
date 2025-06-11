require('dotenv').config();
const express = require('express');
const cors = require('cors');
const path = require('path');
const livereload = require('livereload');
const connectLivereload = require('connect-livereload');

const configRoutes = require('./routes/config');
const placesRoutes = require('./routes/places');

const app = express();

app.use(cors());
app.use(express.json());

// Livereload setup (se quiser)
const liveReloadServer = livereload.createServer();
liveReloadServer.watch(path.join(__dirname, '../frontend/public'));
app.use(connectLivereload());

// Rotas
app.use('/api/config', configRoutes);
app.use('/api/places', placesRoutes);

// Servir frontend estático
app.use(express.static(path.join(__dirname, '../frontend/public')));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
  console.log(`Servidor rodando em http://localhost:${PORT}`);
});
