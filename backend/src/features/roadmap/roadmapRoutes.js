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
router.get('/trips/:tripId/roadmap', roadmapController.getRoadmapWithStats);
router.put('/trips/:tripId/roadmap', roadmapController.updateRoadmap);
router.delete('/trips/:tripId/roadmap', roadmapController.deleteRoadmap);

// ===== TRIP DAYS =====
router.post('/trips/:tripId/tripDays', validate(roadmapDaySchema), roadmapController.createRoadmapDay);
router.get('/trips/:tripId/tripDays', roadmapController.getRoadmapDays);
router.get('/trips/:tripId/tripDays/:dayId', roadmapController.getRoadmapDay);

// ===== PLACES IN DAYS =====
router.post('/trips/:tripId/tripDays/:dayId/tripPlaces', validate(placeSchema), roadmapController.addPlaceToDay);
router.delete('/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId', roadmapController.removePlaceFromDay);

// ===== UNASSIGNED PLACES =====
router.post('/trips/:tripId/unassignedPlaces', validate(placeSchema), roadmapController.addUnassignedPlace);
router.get('/trips/:tripId/unassignedPlaces', roadmapController.getUnassignedPlaces);
router.delete('/trips/:tripId/unassignedPlaces/:placeId', roadmapController.removeUnassignedPlace);
router.post('/trips/:tripId/unassignedPlaces/:placeId/move-to-day/:dayId', roadmapController.moveUnassignedPlaceToDay);

// ===== TRIP BUDGET =====
router.post('/trips/:tripId/tripBudget', validate(roadmapBudgetSchema), roadmapController.createRoadmapBudget);
router.get('/trips/:tripId/tripBudget', roadmapController.getRoadmapBudgetWithStats);
router.put('/trips/:tripId/tripBudget', validate(roadmapBudgetSchema), roadmapController.updateRoadmapBudget);

// ===== TRIP CHECKLIST =====
router.post('/trips/:tripId/tripChecklist', validate(checklistSchema), roadmapController.createRoadmapChecklist);
router.get('/trips/:tripId/tripChecklist', roadmapController.getRoadmapChecklists);
router.get('/trips/:tripId/tripChecklist/:checklistId', roadmapController.getRoadmapChecklist);
router.put('/trips/:tripId/tripChecklist/:checklistId', validate(checklistSchema), roadmapController.updateRoadmapChecklist);
router.delete('/trips/:tripId/tripChecklist/:checklistId', roadmapController.deleteRoadmapChecklist);
router.put('/trips/:tripId/tripChecklist/:checklistId/checklistItems', roadmapController.updateChecklistItem);
router.post('/trips/:tripId/tripChecklist/:checklistId/checklistItems', roadmapController.addChecklistItem);
router.delete('/trips/:tripId/tripChecklist/:checklistId/checklistItems', roadmapController.removeChecklistItem);
router.get('/trips/:tripId/tripChecklist/stats', roadmapController.getChecklistStats);

module.exports = router; 