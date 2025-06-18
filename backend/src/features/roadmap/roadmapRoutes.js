const express = require('express');
const router = express.Router();
const roadmapController = require('./roadmapController');
const { authenticateUser, requireAnyUser } = require('../../middlewares/auth');
const { 
  validate, 
  roadmapDaySchema, 
  placeSchema, 
  roadmapBudgetSchema, 
  checklistSchema 
} = require('../../middlewares/validation');

// Todas as rotas requerem autenticação
router.use(authenticateUser);
router.use(requireAnyUser);

// ===== ROADMAP =====
router.post('/trips/:tripId/roadmap', roadmapController.createRoadmap);
router.get('/trips/:tripId/roadmap/:roadmapId', roadmapController.getRoadmapWithStats);
router.put('/trips/:tripId/roadmap/:roadmapId', roadmapController.updateRoadmap);
router.delete('/trips/:tripId/roadmap/:roadmapId', roadmapController.deleteRoadmap);

// ===== ROADMAP DAYS =====
router.post('/trips/:tripId/roadmap/:roadmapId/days', validate(roadmapDaySchema), roadmapController.createRoadmapDay);
router.get('/trips/:tripId/roadmap/:roadmapId/days', roadmapController.getRoadmapDays);
router.get('/trips/:tripId/roadmap/:roadmapId/days/:dayId', roadmapController.getRoadmapDay);
router.put('/trips/:tripId/roadmap/:roadmapId/days/:dayId', validate(roadmapDaySchema), roadmapController.updateRoadmapDay);
router.delete('/trips/:tripId/roadmap/:roadmapId/days/:dayId', roadmapController.deleteRoadmapDay);

// ===== PLACES IN DAYS =====
router.post('/trips/:tripId/roadmap/:roadmapId/days/:dayId/places', validate(placeSchema), roadmapController.addPlaceToDay);
router.put('/trips/:tripId/roadmap/:roadmapId/days/:dayId/places/:placeId', validate(placeSchema), roadmapController.updatePlaceInDay);
router.delete('/trips/:tripId/roadmap/:roadmapId/days/:dayId/places/:placeId', roadmapController.removePlaceFromDay);

// ===== UNASSIGNED PLACES =====
router.post('/trips/:tripId/roadmap/:roadmapId/unassigned-places', validate(placeSchema), roadmapController.addUnassignedPlace);
router.get('/trips/:tripId/roadmap/:roadmapId/unassigned-places', roadmapController.getUnassignedPlaces);
router.put('/trips/:tripId/roadmap/:roadmapId/unassigned-places/:placeId', validate(placeSchema), roadmapController.updateUnassignedPlace);
router.delete('/trips/:tripId/roadmap/:roadmapId/unassigned-places/:placeId', roadmapController.removeUnassignedPlace);
router.post('/trips/:tripId/roadmap/:roadmapId/unassigned-places/:placeId/move-to-day/:dayId', roadmapController.moveUnassignedPlaceToDay);

// ===== ROADMAP BUDGET =====
router.post('/trips/:tripId/roadmap/:roadmapId/budget', validate(roadmapBudgetSchema), roadmapController.createRoadmapBudget);
router.get('/trips/:tripId/roadmap/:roadmapId/budget', roadmapController.getRoadmapBudgetWithStats);
router.put('/trips/:tripId/roadmap/:roadmapId/budget', validate(roadmapBudgetSchema), roadmapController.updateRoadmapBudget);

// ===== ROADMAP CHECKLIST =====
router.post('/trips/:tripId/roadmap/:roadmapId/checklists', validate(checklistSchema), roadmapController.createRoadmapChecklist);
router.get('/trips/:tripId/roadmap/:roadmapId/checklists', roadmapController.getRoadmapChecklists);
router.get('/trips/:tripId/roadmap/:roadmapId/checklists/:checklistId', roadmapController.getRoadmapChecklist);
router.put('/trips/:tripId/roadmap/:roadmapId/checklists/:checklistId', validate(checklistSchema), roadmapController.updateRoadmapChecklist);
router.delete('/trips/:tripId/roadmap/:roadmapId/checklists/:checklistId', roadmapController.deleteRoadmapChecklist);
router.put('/trips/:tripId/roadmap/:roadmapId/checklists/:checklistId/items', roadmapController.updateChecklistItem);
router.post('/trips/:tripId/roadmap/:roadmapId/checklists/:checklistId/items', roadmapController.addChecklistItem);
router.delete('/trips/:tripId/roadmap/:roadmapId/checklists/:checklistId/items', roadmapController.removeChecklistItem);
router.get('/trips/:tripId/roadmap/:roadmapId/checklists/stats', roadmapController.getChecklistStats);

module.exports = router; 