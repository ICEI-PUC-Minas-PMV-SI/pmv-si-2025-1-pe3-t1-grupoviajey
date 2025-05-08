/**
 * Controlador de Dias do Itinerário
 * Gerencia todas as operações relacionadas aos dias dos itinerários
 */

const ItineraryDay = require('../models/itineraryDay');
const Itinerary = require('../models/itinerary');

/**
 * Obtém todos os dias de um itinerário específico
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function getDaysByItineraryId(req, res) {
  try {
    const { itineraryId } = req.params;
    
    // Validar ID do itinerário
    if (!itineraryId || isNaN(parseInt(itineraryId))) {
      return res.status(400).json({ error: 'ID de itinerário inválido' });
    }
    
    // Verificar se o itinerário existe
    const itinerary = await Itinerary.getById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerário não encontrado' });
    }
    
    console.log(`Buscando dias para o itinerário ${itineraryId}`);
    
    // Buscar dias do itinerário
    const days = await ItineraryDay.getDaysByItineraryId(itineraryId);
    console.log(`Encontrados ${days.length} dias para o itinerário ${itineraryId}`);
    
    // Retornar dias
    res.json(days);
  } catch (error) {
    console.error('Erro ao buscar dias do itinerário:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Cria um novo dia para um itinerário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function createDay(req, res) {
  try {
    const { itineraryId } = req.params;
    const { day_number, date, notes } = req.body;
    
    // Validar ID do itinerário
    if (!itineraryId || isNaN(parseInt(itineraryId))) {
      return res.status(400).json({ error: 'ID de itinerário inválido' });
    }
    
    // Validar campos obrigatórios
    if (!day_number || !date) {
      return res.status(400).json({ error: 'Número do dia e data são obrigatórios' });
    }
    
    // Verificar se o itinerário existe
    const itinerary = await Itinerary.getById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerário não encontrado' });
    }
    
    console.log(`Criando dia ${day_number} para o itinerário ${itineraryId} na data ${date}`);
    
    // Criar dia
    const day = await ItineraryDay.createDay(itineraryId, day_number, date, notes);
    
    // Retornar dia criado
    res.status(201).json(day);
  } catch (error) {
    console.error('Erro ao criar dia do itinerário:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Atualiza um dia do itinerário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function updateDay(req, res) {
  try {
    const { itineraryId, id } = req.params;
    const updates = req.body;
    
    // Validar IDs
    if (!itineraryId || isNaN(parseInt(itineraryId)) || !id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'IDs inválidos' });
    }
    
    // Verificar se o itinerário existe
    const itinerary = await Itinerary.getById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerário não encontrado' });
    }
    
    console.log(`Atualizando dia ${id} do itinerário ${itineraryId}`);
    
    // Buscar o dia para verificar pertence ao itinerário indicado
    const existingDay = await ItineraryDay.getDayById(id);
    if (!existingDay || existingDay.itinerary_id !== parseInt(itineraryId)) {
      return res.status(404).json({ error: 'Dia não encontrado neste itinerário' });
    }
    
    // Atualizar dia
    const day = await ItineraryDay.updateDay(id, updates);
    
    // Retornar dia atualizado
    res.json(day);
  } catch (error) {
    console.error('Erro ao atualizar dia do itinerário:', error);
    res.status(500).json({ error: error.message });
  }
}

/**
 * Exclui um dia do itinerário
 * @param {Object} req - Requisição Express
 * @param {Object} res - Resposta Express
 */
async function deleteDay(req, res) {
  try {
    const { itineraryId, id } = req.params;
    
    // Validar IDs
    if (!itineraryId || isNaN(parseInt(itineraryId)) || !id || isNaN(parseInt(id))) {
      return res.status(400).json({ error: 'IDs inválidos' });
    }
    
    // Verificar se o itinerário existe
    const itinerary = await Itinerary.getById(itineraryId);
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerário não encontrado' });
    }
    
    console.log(`Excluindo dia ${id} do itinerário ${itineraryId}`);
    
    // Buscar o dia para verificar se pertence ao itinerário e obter o número
    const existingDay = await ItineraryDay.getDayById(id);
    if (!existingDay || existingDay.itinerary_id !== parseInt(itineraryId)) {
      return res.status(404).json({ error: 'Dia não encontrado neste itinerário' });
    }
    
    // Excluir dia
    await ItineraryDay.deleteDay(id);
    
    // Reordenar os dias após a exclusão
    await ItineraryDay.reorderDaysAfterDeletion(itineraryId, existingDay.day_number);
    
    // Retornar sucesso
    res.json({ message: 'Dia excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir dia do itinerário:', error);
    res.status(500).json({ error: error.message });
  }
}

// Exportar funções do controlador
module.exports = {
  getDaysByItineraryId,
  createDay,
  updateDay,
  deleteDay
};