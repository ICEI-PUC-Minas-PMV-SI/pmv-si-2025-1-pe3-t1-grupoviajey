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

// Rotas de autenticação
router.post('/auth/register', authController.register);
router.post('/auth/login', authController.login);
router.post('/auth/verify', authController.verify);

// Rotas de itinerários
router.get('/itineraries', optionalAuth, itineraryController.getAllItineraries);
router.get('/itineraries/:id', optionalAuth, itineraryController.getItineraryById);
router.get('/itineraries/share/:shareCode', itineraryController.getItineraryByShareCode);
// Usando autenticação obrigatória para criar itinerários
router.post('/itineraries', isAuthenticated, itineraryController.createItinerary);
router.put('/itineraries/:id', isAuthenticated, itineraryController.updateItinerary);
router.delete('/itineraries/:id', isAuthenticated, itineraryController.deleteItinerary);

// Exportar roteador
module.exports = router;