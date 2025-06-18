const roadmapService = require('./roadmapService');
const roadmapDayService = require('./roadmapDayService');
const unassignedPlacesService = require('./unassignedPlacesService');
const roadmapBudgetService = require('./roadmapBudgetService');
const roadmapChecklistService = require('./roadmapChecklistService');

class RoadmapController {
  // ===== ROADMAP =====
  
  /**
   * Criar roadmap
   */
  async createRoadmap(req, res) {
    try {
      const { uid } = req.user;
      const { tripId } = req.params;
      const roadmapData = req.body;

      const roadmap = await roadmapService.createRoadmap(uid, tripId, roadmapData);
      
      res.status(201).json({
        success: true,
        data: roadmap
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar roadmap com estatísticas
   */
  async getRoadmapWithStats(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      
      const roadmap = await roadmapService.getRoadmapWithBudgetStats(uid, tripId, roadmapId);
      
      res.status(200).json({
        success: true,
        data: roadmap
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar roadmap
   */
  async updateRoadmap(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      const updateData = req.body;
      
      const roadmap = await roadmapService.updateRoadmap(uid, tripId, roadmapId, updateData);
      
      res.status(200).json({
        success: true,
        data: roadmap
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar roadmap
   */
  async deleteRoadmap(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      
      const result = await roadmapService.deleteRoadmap(uid, tripId, roadmapId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== ROADMAP DAYS =====

  /**
   * Criar dia no roadmap
   */
  async createRoadmapDay(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      const dayData = req.body;

      const day = await roadmapDayService.createRoadmapDay(uid, tripId, roadmapId, dayData);
      
      res.status(201).json({
        success: true,
        data: day
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar todos os dias do roadmap
   */
  async getRoadmapDays(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      
      const days = await roadmapDayService.getRoadmapDays(uid, tripId, roadmapId);
      
      res.status(200).json({
        success: true,
        data: days
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar dia específico
   */
  async getRoadmapDay(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, dayId } = req.params;
      
      const day = await roadmapDayService.getRoadmapDay(uid, tripId, roadmapId, dayId);
      
      res.status(200).json({
        success: true,
        data: day
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar dia do roadmap
   */
  async updateRoadmapDay(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, dayId } = req.params;
      const updateData = req.body;
      
      const day = await roadmapDayService.updateRoadmapDay(uid, tripId, roadmapId, dayId, updateData);
      
      res.status(200).json({
        success: true,
        data: day
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar dia do roadmap
   */
  async deleteRoadmapDay(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, dayId } = req.params;
      
      const result = await roadmapDayService.deleteRoadmapDay(uid, tripId, roadmapId, dayId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== PLACES IN DAYS =====

  /**
   * Adicionar local a um dia
   */
  async addPlaceToDay(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, dayId } = req.params;
      const placeData = req.body;

      const place = await roadmapDayService.addPlaceToDay(uid, tripId, roadmapId, dayId, placeData);
      
      res.status(201).json({
        success: true,
        data: place
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar local de um dia
   */
  async updatePlaceInDay(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, dayId, placeId } = req.params;
      const updateData = req.body;
      
      const place = await roadmapDayService.updatePlaceInDay(uid, tripId, roadmapId, dayId, placeId, updateData);
      
      res.status(200).json({
        success: true,
        data: place
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Remover local de um dia
   */
  async removePlaceFromDay(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, dayId, placeId } = req.params;
      
      const result = await roadmapDayService.removePlaceFromDay(uid, tripId, roadmapId, dayId, placeId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== UNASSIGNED PLACES =====

  /**
   * Adicionar local não atribuído
   */
  async addUnassignedPlace(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      const placeData = req.body;

      const place = await unassignedPlacesService.addUnassignedPlace(uid, tripId, roadmapId, placeData);
      
      res.status(201).json({
        success: true,
        data: place
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar locais não atribuídos
   */
  async getUnassignedPlaces(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      
      const places = await unassignedPlacesService.getUnassignedPlaces(uid, tripId, roadmapId);
      
      res.status(200).json({
        success: true,
        data: places
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Mover local não atribuído para um dia
   */
  async moveUnassignedPlaceToDay(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, placeId, dayId } = req.params;
      const additionalData = req.body;
      
      const result = await unassignedPlacesService.moveToDay(uid, tripId, roadmapId, placeId, dayId, additionalData);
      
      res.status(200).json({
        success: true,
        message: result.message,
        data: result.place
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== ROADMAP BUDGET =====

  /**
   * Criar orçamento
   */
  async createRoadmapBudget(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      const budgetData = req.body;

      const budget = await roadmapBudgetService.createRoadmapBudget(uid, tripId, roadmapId, budgetData);
      
      res.status(201).json({
        success: true,
        data: budget
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar orçamento com estatísticas
   */
  async getRoadmapBudgetWithStats(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      
      const budget = await roadmapBudgetService.getRoadmapBudgetWithStats(uid, tripId, roadmapId);
      
      res.status(200).json({
        success: true,
        data: budget
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar orçamento
   */
  async updateRoadmapBudget(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      const updateData = req.body;
      
      const budget = await roadmapBudgetService.updateRoadmapBudget(uid, tripId, roadmapId, updateData);
      
      res.status(200).json({
        success: true,
        data: budget
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  // ===== ROADMAP CHECKLIST =====

  /**
   * Criar checklist
   */
  async createRoadmapChecklist(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      const checklistData = req.body;

      const checklist = await roadmapChecklistService.createRoadmapChecklist(uid, tripId, roadmapId, checklistData);
      
      res.status(201).json({
        success: true,
        data: checklist
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar todos os checklists
   */
  async getRoadmapChecklists(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      
      const checklists = await roadmapChecklistService.getRoadmapChecklists(uid, tripId, roadmapId);
      
      res.status(200).json({
        success: true,
        data: checklists
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar item do checklist
   */
  async updateChecklistItem(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, checklistId } = req.params;
      const { itemIndex, completed } = req.body;
      
      const checklist = await roadmapChecklistService.updateChecklistItem(uid, tripId, roadmapId, checklistId, itemIndex, completed);
      
      res.status(200).json({
        success: true,
        data: checklist
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar estatísticas dos checklists
   */
  async getChecklistStats(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId } = req.params;
      
      const stats = await roadmapChecklistService.getChecklistStats(uid, tripId, roadmapId);
      
      res.status(200).json({
        success: true,
        data: stats
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar local não atribuído
   */
  async updateUnassignedPlace(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, placeId } = req.params;
      const updateData = req.body;
      
      const place = await unassignedPlacesService.updateUnassignedPlace(uid, tripId, roadmapId, placeId, updateData);
      
      res.status(200).json({
        success: true,
        data: place
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Remover local não atribuído
   */
  async removeUnassignedPlace(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, placeId } = req.params;
      
      const result = await unassignedPlacesService.removeUnassignedPlace(uid, tripId, roadmapId, placeId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar checklist específico
   */
  async getRoadmapChecklist(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, checklistId } = req.params;
      
      const checklist = await roadmapChecklistService.getRoadmapChecklist(uid, tripId, roadmapId, checklistId);
      
      res.status(200).json({
        success: true,
        data: checklist
      });
    } catch (error) {
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar checklist
   */
  async updateRoadmapChecklist(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, checklistId } = req.params;
      const updateData = req.body;
      
      const checklist = await roadmapChecklistService.updateRoadmapChecklist(uid, tripId, roadmapId, checklistId, updateData);
      
      res.status(200).json({
        success: true,
        data: checklist
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar checklist
   */
  async deleteRoadmapChecklist(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, checklistId } = req.params;
      
      const result = await roadmapChecklistService.deleteRoadmapChecklist(uid, tripId, roadmapId, checklistId);
      
      res.status(200).json({
        success: true,
        message: result.message
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Adicionar item ao checklist
   */
  async addChecklistItem(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, checklistId } = req.params;
      const itemData = req.body;
      
      const checklist = await roadmapChecklistService.addChecklistItem(uid, tripId, roadmapId, checklistId, itemData);
      
      res.status(200).json({
        success: true,
        data: checklist
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Remover item do checklist
   */
  async removeChecklistItem(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, roadmapId, checklistId } = req.params;
      const { itemIndex } = req.body;
      
      const checklist = await roadmapChecklistService.removeChecklistItem(uid, tripId, roadmapId, checklistId, itemIndex);
      
      res.status(200).json({
        success: true,
        data: checklist
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }
}

module.exports = new RoadmapController(); 