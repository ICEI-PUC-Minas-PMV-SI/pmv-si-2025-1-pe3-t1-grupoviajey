/**
 * Rotas da API do Viajey
 */

const express = require('express');
const router = express.Router();

// Importar controladores
const authController = require('../controllers/authController');
const itineraryController = require('../controllers/itineraryController');
const activityController = require('../controllers/activityController');

// Importar middlewares - utilizando os nomes das funções do novo middleware
const { requerAutenticacao: isAuthenticated, usuarioOpcional: optionalAuth } = require('../middlewares/auth');

// Rota de diagnóstico para testar autenticação
router.get('/auth/check', isAuthenticated, (req, res) => {
  // Esta rota só irá responder se a autenticação for bem-sucedida
  console.log('[AuthCheck] Autenticação bem-sucedida para usuário:', req.usuario.username);
  res.json({ 
    message: 'Autenticação válida', 
    user: { 
      id: req.usuario.id,
      username: req.usuario.username,
      email: req.usuario.email
    } 
  });
});

// Rotas de autenticação (comentadas para usar novas implementações em routes/auth.js)
// router.post('/auth/register', authController.register);
// router.post('/auth/login', authController.login);
// router.post('/auth/verify', authController.verify);

// Rotas de itinerários
router.get('/itineraries', isAuthenticated, itineraryController.getAllItineraries); // Alterado para autenticação obrigatória
router.get('/itineraries/:id', optionalAuth, itineraryController.getItineraryById);
router.get('/itineraries/share/:shareCode', itineraryController.getItineraryByShareCode);
// Usando autenticação obrigatória para criar itinerários
router.post('/itineraries', isAuthenticated, itineraryController.createItinerary);
router.put('/itineraries/:id', isAuthenticated, itineraryController.updateItinerary);
router.delete('/itineraries/:id', isAuthenticated, itineraryController.deleteItinerary);

// Rotas de dias do itinerário
const itineraryDayController = require('../controllers/itineraryDayController');
router.get('/itineraries/:itineraryId/days', optionalAuth, itineraryDayController.getDaysByItineraryId);
router.post('/itineraries/:itineraryId/days', isAuthenticated, itineraryDayController.createDay);
router.put('/itineraries/:itineraryId/days/:id', isAuthenticated, itineraryDayController.updateDay);
router.delete('/itineraries/:itineraryId/days/:id', isAuthenticated, itineraryDayController.deleteDay);

// Rotas de atividades
router.post('/activities', isAuthenticated, activityController.createActivity);
router.get('/itineraries/:itineraryId/days/:dayId/activities', optionalAuth, activityController.getActivitiesByDay);
router.post('/itineraries/:itineraryId/days/:dayNumber/activities', isAuthenticated, activityController.createActivity);
router.put('/activities/:id', isAuthenticated, activityController.updateActivity);
router.delete('/activities/:id', isAuthenticated, activityController.deleteActivity);
router.post('/activities/:id/move', isAuthenticated, activityController.moveActivity);
router.post('/activities/reorder', isAuthenticated, activityController.reorderActivities);

// Exportar roteador
module.exports = router;