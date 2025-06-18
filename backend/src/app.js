const express = require('express');
const path = require('path');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const rateLimit = require('express-rate-limit');
const app = express();
require('dotenv').config();

// Importar rotas
const tripRoutes = require('./features/trips/tripRoutes');
const roadmapRoutes = require('./features/roadmap/roadmapRoutes');
const favoritesRoutes = require('./features/favorites/favoritesRoutes');
const reviewsRoutes = require('./features/reviews/reviewsRoutes');
const sitePostsRoutes = require('./features/sitePosts/sitePostsRoutes');

// Servir arquivos estáticos do frontend
const publicPath = path.resolve(__dirname, '../../frontend/public');
app.use(express.static(publicPath));
console.log('Servindo arquivos estáticos de:', publicPath);

// Configurações de segurança
app.use(helmet());

// Configuração do CORS
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true
}));

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutos
  max: 100, // limite de 100 requests por IP
  message: {
    success: false,
    message: 'Muitas requisições. Tente novamente em alguns minutos.'
  }
});
app.use(limiter);

// Logging
if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
} else {
  app.use(morgan('combined'));
}

// Middleware para parsing de JSON
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Middleware de health check
app.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Viajey Backend está funcionando!',
    timestamp: new Date().toISOString(),
    environment: process.env.NODE_ENV || 'development'
  });
});

// Rotas da API
app.use('/api/trips', tripRoutes);
app.use('/api/roadmap', roadmapRoutes);
app.use('/api/favorites', favoritesRoutes);
app.use('/api/reviews', reviewsRoutes);
app.use('/api/posts', sitePostsRoutes);

// Middleware para rotas não encontradas
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: 'Rota não encontrada'
  });
});

// Middleware de tratamento de erros
app.use((error, req, res, next) => {
  console.error('Erro na aplicação:', error);

  // Se for um erro de validação do Joi
  if (error.isJoi) {
    return res.status(400).json({
      success: false,
      message: 'Dados inválidos',
      errors: error.details.map(detail => detail.message)
    });
  }

  // Se for um erro do Firebase
  if (error.code && error.code.startsWith('auth/')) {
    return res.status(401).json({
      success: false,
      message: 'Erro de autenticação: ' + error.message
    });
  }

  // Erro genérico
  res.status(500).json({
    success: false,
    message: process.env.NODE_ENV === 'development' 
      ? error.message 
      : 'Erro interno do servidor'
  });
});

module.exports = app; 