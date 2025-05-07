/**
 * Rotas da API do Viajey
 */

const express = require('express');
const router = express.Router();

// Importar controladores
const authController = require('../controllers/authController');
const itineraryController = require('../controllers/itineraryController');

// Importar middlewares
const { isAuthenticated, optionalAuth } = require('../middlewares/auth');

// Rota de diagnóstico para testar autenticação
router.get('/auth/check', isAuthenticated, (req, res) => {
  // Esta rota só irá responder se a autenticação for bem-sucedida
  console.log('[AuthCheck] Autenticação bem-sucedida para usuário:', req.user.username);
  res.json({ 
    message: 'Autenticação válida', 
    user: { 
      id: req.user.id,
      username: req.user.username,
      email: req.user.email
    } 
  });
});

// Rotas de autenticação
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/verify', authController.verify);

// Rotas de itinerários
router.get('/itineraries', isAuthenticated, itineraryController.getAllItineraries); // Alterado para autenticação obrigatória
router.get('/itineraries/:id', optionalAuth, itineraryController.getItineraryById);
router.get('/itineraries/share/:shareCode', itineraryController.getItineraryByShareCode);
// Usando autenticação obrigatória para criar itinerários
router.post('/itineraries', isAuthenticated, itineraryController.createItinerary);
router.put('/itineraries/:id', isAuthenticated, itineraryController.updateItinerary);
router.delete('/itineraries/:id', isAuthenticated, itineraryController.deleteItinerary);

// Exportar roteador
module.exports = router;