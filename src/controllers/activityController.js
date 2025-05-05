/**
 * Controlador de Atividades
 * Gerencia todas as operações relacionadas a atividades dos itinerários
 */

const db = require('../shared/db');
const Activity = require('../models/activity');

/**
 * Cria uma nova atividade
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function createActivity(req, res) {
  try {
    const { 
      itinerary_day_id, name, type, location, period, 
      start_time, end_time, notes, position 
    } = req.body;
    
    // Validar campos obrigatórios
    if (!itinerary_day_id || !name || !type || !period) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios: itinerary_day_id, name, type, period' 
      });
    }
    
    // Criar atividade usando o modelo
    const activity = await Activity.create({
      itinerary_day_id,
      name,
      type,
      location,
      period,
      start_time,
      end_time,
      notes,
      position: position || 0
    });
    
    // Retornar atividade criada
    res.status(201).json(activity);
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Atualiza uma atividade existente
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function updateActivity(req, res) {
  try {
    const { id } = req.params;
    const { 
      name, type, location, period, 
      start_time, end_time, notes, position 
    } = req.body;
    
    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID de atividade inválido' });
    }
    
    // Atualizar atividade
    const activity = await Activity.update(id, {
      name,
      type,
      location,
      period,
      start_time,
      end_time,
      notes,
      position
    });
    
    // Verificar se atividade existe
    if (!activity) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    
    // Retornar atividade atualizada
    res.json(activity);
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Move uma atividade entre dias/períodos
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function moveActivity(req, res) {
  try {
    const { id } = req.params;
    const { 
      itinerary_day_id, period, position 
    } = req.body;
    
    // Validar parâmetros
    if (!id || !itinerary_day_id || !period) {
      return res.status(400).json({ 
        error: 'ID de atividade, day_id e período são obrigatórios' 
      });
    }
    
    // Mover atividade
    const activity = await Activity.move(id, itinerary_day_id, period, position);
    
    // Verificar se atividade existe
    if (!activity) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    
    // Retornar atividade movida
    res.json(activity);
  } catch (error) {
    console.error('Erro ao mover atividade:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Reordena atividades em um dia/período
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function reorderActivities(req, res) {
  try {
    const { itinerary_day_id, period } = req.params;
    const { activities } = req.body;
    
    // Validar parâmetros
    if (!itinerary_day_id || !period || !Array.isArray(activities)) {
      return res.status(400).json({ 
        error: 'ID do dia, período e lista de atividades são obrigatórios' 
      });
    }
    
    // Reordenar atividades
    const result = await Activity.reorder(itinerary_day_id, period, activities);
    
    // Retornar resultado
    res.json(result);
  } catch (error) {
    console.error('Erro ao reordenar atividades:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Exclui uma atividade
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function deleteActivity(req, res) {
  try {
    const { id } = req.params;
    
    // Validar ID
    if (!id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'ID de atividade inválido' });
    }
    
    // Excluir atividade
    const success = await Activity.delete(id);
    
    // Verificar se atividade existia
    if (!success) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    
    // Retornar sucesso
    res.json({ message: 'Atividade excluída com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir atividade:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Obtém todas as atividades de um dia
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function getActivitiesByDay(req, res) {
  try {
    const { day_id } = req.params;
    
    // Validar ID do dia
    if (!day_id || isNaN(parseInt(day_id))) {
      return res.status(400).json({ error: 'ID de dia inválido' });
    }
    
    // Buscar atividades
    const activities = await Activity.getByDay(day_id);
    
    // Retornar atividades
    res.json(activities);
  } catch (error) {
    console.error('Erro ao buscar atividades:', error);
    res.status(500).json({ error: error.message });
  }
}

// Exportar funções do controlador
module.exports = {
  createActivity,
  updateActivity,
  moveActivity,
  reorderActivities,
  deleteActivity,
  getActivitiesByDay
};