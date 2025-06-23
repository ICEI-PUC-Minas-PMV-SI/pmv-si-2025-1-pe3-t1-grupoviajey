const roadmapService = require('./roadmapService');
const roadmapDayService = require('./roadmapDayService');
const unassignedPlacesService = require('./unassignedPlacesService');
const roadmapBudgetService = require('./roadmapBudgetService');
const roadmapChecklistService = require('./roadmapChecklistService');

class RoadmapController {
  // ===== ROADMAP =====
  
  /**
   * Buscar roadmap com estatísticas
   */
  async getRoadmapWithStats(req, res) {
    try {
      const { uid } = req.user;
      const { tripId } = req.params;
      
      const roadmap = await roadmapService.getRoadmapWithBudgetStats(uid, tripId);
      
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

  // ===== PLACES IN DAYS =====

  /**
   * Adicionar local a um dia
   */
  async addPlaceToDay(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, dayId } = req.params;
      const placeData = req.body;

      const place = await roadmapDayService.addPlaceToDay(uid, tripId, dayId, placeData);
      
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
   * Buscar locais de um dia
   */
  async getPlacesInDay(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, dayId } = req.params;
      
      const places = await roadmapDayService.getPlacesInDay(uid, tripId, dayId);
      
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
   * Remover local de um dia
   */
  async removePlaceFromDay(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, dayId, placeId } = req.params;
      
      const result = await roadmapDayService.removePlaceFromDay(uid, tripId, dayId, placeId);
      
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

  // ===== TRIP PLACE EXPENSES =====

  /**
   * Adicionar despesa a um local
   */
  async addPlaceExpense(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, dayId, placeId } = req.params;
      const expenseData = req.body;

      console.log(`[EXPENSE] Adicionando despesa para tripId: ${tripId}, dayId: ${dayId}, placeId: ${placeId}`);
      console.log(`[EXPENSE] Dados recebidos:`, expenseData);

      const expense = await roadmapDayService.addPlaceExpense(uid, tripId, dayId, placeId, expenseData);
      
      res.status(201).json({
        success: true,
        data: expense
      });
    } catch (error) {
      console.error(`[EXPENSE] Erro ao adicionar despesa:`, error);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar despesas de um local
   */
  async getPlaceExpenses(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, dayId, placeId } = req.params;
      
      const expenses = await roadmapDayService.getPlaceExpenses(uid, tripId, dayId, placeId);
      
      res.status(200).json({
        success: true,
        data: expenses
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar despesa de um local
   */
  async updatePlaceExpense(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, dayId, placeId, expenseId } = req.params;
      const updateData = req.body;
      
      const expense = await roadmapDayService.updatePlaceExpense(uid, tripId, dayId, placeId, expenseId, updateData);
      
      res.status(200).json({
        success: true,
        data: expense
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar despesa de um local
   */
  async deletePlaceExpense(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, dayId, placeId, expenseId } = req.params;
      
      const result = await roadmapDayService.deletePlaceExpense(uid, tripId, dayId, placeId, expenseId);
      
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

  // ===== TRIP PLACE NOTES =====

  /**
   * Adicionar nota a um local
   */
  async addPlaceNote(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, dayId, placeId } = req.params;
      const noteData = req.body;

      const note = await roadmapDayService.addPlaceNote(uid, tripId, dayId, placeId, noteData);
      
      res.status(201).json({
        success: true,
        data: note
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Buscar notas de um local
   */
  async getPlaceNotes(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, dayId, placeId } = req.params;
      
      const notes = await roadmapDayService.getPlaceNotes(uid, tripId, dayId, placeId);
      
      res.status(200).json({
        success: true,
        data: notes
      });
    } catch (error) {
      res.status(500).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Atualizar nota de um local
   */
  async updatePlaceNote(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, dayId, placeId, noteId } = req.params;
      const updateData = req.body;
      
      const note = await roadmapDayService.updatePlaceNote(uid, tripId, dayId, placeId, noteId, updateData);
      
      res.status(200).json({
        success: true,
        data: note
      });
    } catch (error) {
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Deletar nota de um local
   */
  async deletePlaceNote(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, dayId, placeId, noteId } = req.params;
      
      const result = await roadmapDayService.deletePlaceNote(uid, tripId, dayId, placeId, noteId);
      
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

  // ===== ROADMAP BUDGET =====

  /**
   * Buscar orçamento com estatísticas
   */
  async getRoadmapBudgetWithStats(req, res) {
    try {
      const { uid } = req.user;
      const { tripId } = req.params;
      
      console.log(`[ROADMAP BUDGET] Buscando orçamento para tripId: ${tripId}, userId: ${uid}`);
      
      const budget = await roadmapBudgetService.getRoadmapBudgetWithStats(uid, tripId);
      
      console.log(`[ROADMAP BUDGET] Orçamento encontrado:`, budget ? 'Sim' : 'Não');
      
      res.status(200).json({
        success: true,
        data: budget
      });
    } catch (error) {
      console.error(`[ROADMAP BUDGET] Erro ao buscar orçamento:`, error.message);
      res.status(404).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Criar orçamento
   */
  async createRoadmapBudget(req, res) {
    try {
      const { uid } = req.user;
      const { tripId } = req.params;
      const budgetData = req.body;

      console.log(`[ROADMAP BUDGET] Criando orçamento para tripId: ${tripId}, userId: ${uid}`);
      console.log(`[ROADMAP BUDGET] Dados recebidos:`, budgetData);

      // Validar se totalBudget é um número positivo
      if (!budgetData.totalBudget || typeof budgetData.totalBudget !== 'number' || budgetData.totalBudget <= 0) {
        throw new Error('O valor do orçamento deve ser um número positivo');
      }

      const budget = await roadmapBudgetService.createRoadmapBudget(uid, tripId, budgetData);
      
      console.log(`[ROADMAP BUDGET] Orçamento criado com sucesso, ID: ${budget.id}`);
      
      res.status(201).json({
        success: true,
        data: budget
      });
    } catch (error) {
      console.error(`[ROADMAP BUDGET] Erro ao criar orçamento:`, error.message);
      res.status(400).json({
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
      const { tripId, budgetId } = req.params;
      const updateData = req.body;
      
      console.log(`[ROADMAP BUDGET] Atualizando orçamento para tripId: ${tripId}, budgetId: ${budgetId}, userId: ${uid}`);
      console.log(`[ROADMAP BUDGET] Dados de atualização:`, updateData);

      // Validar se totalBudget é um número positivo
      if (updateData.totalBudget !== undefined) {
        if (typeof updateData.totalBudget !== 'number' || updateData.totalBudget <= 0) {
          throw new Error('O valor do orçamento deve ser um número positivo');
        }
      }
      
      const budget = await roadmapBudgetService.updateRoadmapBudgetById(uid, tripId, budgetId, updateData);
      
      console.log(`[ROADMAP BUDGET] Orçamento atualizado com sucesso`);
      
      res.status(200).json({
        success: true,
        data: budget
      });
    } catch (error) {
      console.error(`[ROADMAP BUDGET] Erro ao atualizar orçamento:`, error.message);
      res.status(400).json({
        success: false,
        message: error.message
      });
    }
  }

  /**
   * Criar ou atualizar orçamento (upsert)
   */
  async upsertRoadmapBudget(req, res) {
    try {
      const { uid } = req.user;
      const { tripId } = req.params;
      const budgetData = req.body;
      
      console.log(`[ROADMAP BUDGET] Upsert orçamento para tripId: ${tripId}, userId: ${uid}`);
      console.log(`[ROADMAP BUDGET] Dados recebidos:`, budgetData);

      // Validar se totalBudget é um número positivo
      if (!budgetData.totalBudget || typeof budgetData.totalBudget !== 'number' || budgetData.totalBudget <= 0) {
        throw new Error('O valor do orçamento deve ser um número positivo');
      }

      const budget = await roadmapBudgetService.upsertRoadmapBudget(uid, tripId, budgetData);
      
      console.log(`[ROADMAP BUDGET] Orçamento upsert com sucesso, ID: ${budget.id}`);
      
      res.status(200).json({
        success: true,
        data: budget
      });
    } catch (error) {
      console.error(`[ROADMAP BUDGET] Erro ao fazer upsert do orçamento:`, error.message);
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
      const { tripId } = req.params;
      const checklistData = req.body;

      console.log('[Checklist] Criando checklist:', { uid, tripId, checklistData });

      const checklist = await roadmapChecklistService.createRoadmapChecklist(uid, tripId, checklistData);
      
      console.log('[Checklist] Checklist criado com sucesso:', checklist.id);
      
      res.status(201).json({
        success: true,
        data: checklist
      });
    } catch (error) {
      console.error('[Checklist] Erro ao criar checklist:', error.message);
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
      const { tripId } = req.params;
      
      const checklists = await roadmapChecklistService.getRoadmapChecklists(uid, tripId);
      
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
   * Atualizar checklist
   */
  async updateRoadmapChecklist(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, checklistId } = req.params;
      const updateData = req.body;
      
      const checklist = await roadmapChecklistService.updateRoadmapChecklist(uid, tripId, checklistId, updateData);
      
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
      const { tripId, checklistId } = req.params;
      
      const result = await roadmapChecklistService.deleteRoadmapChecklist(uid, tripId, checklistId);
      
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
      const { tripId, checklistId } = req.params;
      const itemData = req.body;
      
      const item = await roadmapChecklistService.addChecklistItem(uid, tripId, checklistId, itemData);
      
      res.status(201).json({
        success: true,
        data: item
      });
    } catch (error) {
      res.status(400).json({
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
      const { tripId, checklistId, itemId } = req.params;
      const updateData = req.body;
      
      const item = await roadmapChecklistService.updateChecklistItem(uid, tripId, checklistId, { itemId, ...updateData });
      
      res.status(200).json({
        success: true,
        data: item
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
      const { tripId, checklistId, itemId } = req.params;
      
      const result = await roadmapChecklistService.removeChecklistItem(uid, tripId, checklistId, { itemId });
      
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
      const { tripId } = req.params;
      const placeData = req.body;

      const place = await unassignedPlacesService.addUnassignedPlace(uid, tripId, placeData);
      
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
      const { tripId } = req.params;
      
      const places = await unassignedPlacesService.getUnassignedPlaces(uid, tripId);
      
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
   * Remover local não atribuído
   */
  async removeUnassignedPlace(req, res) {
    try {
      const { uid } = req.user;
      const { tripId, placeId } = req.params;
      
      const result = await unassignedPlacesService.removeUnassignedPlace(uid, tripId, placeId);
      
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
}

module.exports = new RoadmapController(); 