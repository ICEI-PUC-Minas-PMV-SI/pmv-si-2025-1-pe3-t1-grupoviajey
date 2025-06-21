const express = require('express');
const router = express.Router();
const roadmapController = require('./roadmapController');
const { authenticateUser, requireAnyUser } = require('../../middlewares/auth');
const { 
  validate, 
  placeSchema, 
  roadmapBudgetSchema, 
  checklistSchema 
} = require('../../middlewares/validation');

// Todas as rotas requerem autenticação
router.use(authenticateUser);
router.use(requireAnyUser);

// ===== ROADMAP =====
router.get('/trips/:tripId/roadmap', roadmapController.getRoadmapWithStats);

// ===== PLACES IN DAYS =====
router.post('/trips/:tripId/tripDays/:dayId/tripPlaces', validate(placeSchema), roadmapController.addPlaceToDay);
router.get('/trips/:tripId/tripDays/:dayId/tripPlaces', roadmapController.getPlacesInDay);
router.delete('/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId', roadmapController.removePlaceFromDay);

// ===== TRIP PLACE EXPENSES =====
router.post('/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId/tripPlaceExpenses', roadmapController.addPlaceExpense);
router.get('/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId/tripPlaceExpenses', roadmapController.getPlaceExpenses);
router.put('/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId/tripPlaceExpenses/:expenseId', roadmapController.updatePlaceExpense);
router.delete('/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId/tripPlaceExpenses/:expenseId', roadmapController.deletePlaceExpense);

// ===== TRIP PLACE NOTES =====
router.post('/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId/tripPlaceNotes', roadmapController.addPlaceNote);
router.get('/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId/tripPlaceNotes', roadmapController.getPlaceNotes);
router.put('/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId/tripPlaceNotes/:noteId', roadmapController.updatePlaceNote);
router.delete('/trips/:tripId/tripDays/:dayId/tripPlaces/:placeId/tripPlaceNotes/:noteId', roadmapController.deletePlaceNote);

// ===== TRIP BUDGET =====
router.get('/trips/:tripId/tripBudget', roadmapController.getRoadmapBudgetWithStats);
router.post('/trips/:tripId/tripBudget', validate(roadmapBudgetSchema), roadmapController.createRoadmapBudget);
router.put('/trips/:tripId/tripBudget/:budgetId', validate(roadmapBudgetSchema), roadmapController.updateRoadmapBudget);

// ===== TRIP CHECKLIST =====
router.post('/trips/:tripId/tripChecklist', validate(checklistSchema), roadmapController.createRoadmapChecklist);
router.get('/trips/:tripId/tripChecklist', roadmapController.getRoadmapChecklists);
router.put('/trips/:tripId/tripChecklist/:checklistId', validate(checklistSchema), roadmapController.updateRoadmapChecklist);
router.delete('/trips/:tripId/tripChecklist/:checklistId', roadmapController.deleteRoadmapChecklist);

// ===== CHECKLIST ITEMS =====
router.post('/trips/:tripId/tripChecklist/:checklistId/checklistItems', roadmapController.addChecklistItem);
router.put('/trips/:tripId/tripChecklist/:checklistId/checklistItems/:itemId', roadmapController.updateChecklistItem);
router.delete('/trips/:tripId/tripChecklist/:checklistId/checklistItems/:itemId', roadmapController.removeChecklistItem);

// ===== UNASSIGNED PLACES =====
router.post('/trips/:tripId/unassignedPlaces', validate(placeSchema), roadmapController.addUnassignedPlace);
router.get('/trips/:tripId/unassignedPlaces', roadmapController.getUnassignedPlaces);
router.delete('/trips/:tripId/unassignedPlaces/:placeId', roadmapController.removeUnassignedPlace);

module.exports = router; 