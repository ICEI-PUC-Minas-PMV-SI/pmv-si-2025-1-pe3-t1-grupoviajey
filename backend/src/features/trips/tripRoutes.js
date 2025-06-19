const express = require('express');
const router = express.Router();
const tripController = require('./tripController');
const { authenticateUser, requireAnyUser } = require('../../middlewares/auth');
const { validate, tripSchema } = require('../../middlewares/validation');

// Todas as rotas requerem autenticação
router.use(authenticateUser);
router.use(requireAnyUser);

// Rotas para trips
router.post('/', validate(tripSchema), tripController.createTrip);
router.get('/', tripController.getUserTrips);
router.get('/:tripId', tripController.getTrip);
router.put('/:tripId', validate(tripSchema), tripController.updateTrip);
router.delete('/:tripId', tripController.deleteTrip);
router.get('/:tripId/days', tripController.getTripDays);

// Rotas para gerenciar colaboradores
router.post('/:tripId/collaborators', tripController.addCollaborator);
router.delete('/:tripId/collaborators/:collaboratorId', tripController.removeCollaborator);

module.exports = router; 