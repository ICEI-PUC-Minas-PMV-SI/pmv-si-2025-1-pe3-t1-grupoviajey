/**
 * Controlador de Itinerários
 * Gerencia todas as operações relacionadas a itinerários
 */

const ItineraryModel = require('../models/itinerary');
const ItineraryDayModel = require('../models/itineraryDay');
const ActivityModel = require('../models/activity');

/**
 * Obtém todos os itinerários
 * Filtro opcional por usuário
 */
const getAllItineraries = async (req, res) => {
  try {
    const userId = req.query.userId;
    const itineraries = await ItineraryModel.getAllItineraries(userId);
    res.json(itineraries);
  } catch (error) {
    console.error('Erro ao obter itinerários:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtém um itinerário por ID
 * Inclui dias e atividades relacionadas
 */
const getItineraryById = async (req, res) => {
  try {
    const itineraryId = req.params.id;
    
    // Obter dados básicos do itinerário
    const itinerary = await ItineraryModel.getItineraryById(itineraryId);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerário não encontrado' });
    }
    
    // Obter dias do itinerário
    const days = await ItineraryDayModel.getDaysByItineraryId(itineraryId);
    
    // Para cada dia, obter as atividades
    const daysWithActivities = await Promise.all(days.map(async (day) => {
      const activities = await ActivityModel.getActivitiesByDay(day.id);
      return { ...day, activities };
    }));
    
    // Montar objeto completo do itinerário
    const completeItinerary = {
      ...itinerary,
      days: daysWithActivities
    };
    
    res.json(completeItinerary);
  } catch (error) {
    console.error('Erro ao obter itinerário por ID:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Obtém um itinerário pelo código de compartilhamento
 */
const getItineraryByShareCode = async (req, res) => {
  try {
    const shareCode = req.params.shareCode;
    
    // Obter dados básicos do itinerário
    const itinerary = await ItineraryModel.getItineraryByShareCode(shareCode);
    
    if (!itinerary) {
      return res.status(404).json({ error: 'Itinerário não encontrado' });
    }
    
    // Obter dias do itinerário
    const days = await ItineraryDayModel.getDaysByItineraryId(itinerary.id);
    
    // Para cada dia, obter as atividades
    const daysWithActivities = await Promise.all(days.map(async (day) => {
      const activities = await ActivityModel.getActivitiesByDay(day.id);
      return { ...day, activities };
    }));
    
    // Montar objeto completo do itinerário
    const completeItinerary = {
      ...itinerary,
      days: daysWithActivities
    };
    
    res.json(completeItinerary);
  } catch (error) {
    console.error('Erro ao obter itinerário por código de compartilhamento:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Cria um novo itinerário
 */
const createItinerary = async (req, res) => {
  try {
    // Obter dados do corpo da requisição
    const itineraryData = req.body;
    
    // Validar dados obrigatórios
    if (!itineraryData.title || !itineraryData.destination || !itineraryData.start_date || !itineraryData.end_date) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    
    // Adicionar user_id do usuário autenticado ou usar user_id padrão para desenvolvimento
    if (req.user) {
      itineraryData.user_id = req.user.id;
    } else if (!itineraryData.user_id) {
      // Para desenvolvimento, usar user_id = 1 se não houver usuário autenticado nem user_id no corpo
      itineraryData.user_id = 1;
    }
    
    // Garantir que valores opcionais não causem erros
    itineraryData.preferences = itineraryData.preferences || null;
    itineraryData.price_range = itineraryData.price_range || 'moderado';
    itineraryData.cover_image = itineraryData.cover_image || null;
    itineraryData.is_public = itineraryData.is_public || false;
    
    // Criar itinerário
    const newItinerary = await ItineraryModel.createItinerary(itineraryData);
    
    // Calcular número de dias com base nas datas
    const startDate = new Date(itineraryData.start_date);
    const endDate = new Date(itineraryData.end_date);
    const diffTime = Math.abs(endDate - startDate);
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // +1 para incluir o último dia
    
    // Criar dias do itinerário
    const days = [];
    for (let i = 0; i < diffDays; i++) {
      const currentDate = new Date(startDate);
      currentDate.setDate(startDate.getDate() + i);
      
      const dayData = {
        itinerary_id: newItinerary.id,
        day_number: i + 1,
        date: currentDate.toISOString().split('T')[0], // Formato YYYY-MM-DD
        title: `Dia ${i + 1}`
      };
      
      const newDay = await ItineraryDayModel.createDay(dayData);
      days.push(newDay);
    }
    
    res.status(201).json({ ...newItinerary, days });
  } catch (error) {
    console.error('Erro ao criar itinerário:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Atualiza um itinerário existente
 */
const updateItinerary = async (req, res) => {
  try {
    const itineraryId = req.params.id;
    const updates = req.body;
    
    // Verificar se o itinerário existe
    const existingItinerary = await ItineraryModel.getItineraryById(itineraryId);
    
    if (!existingItinerary) {
      return res.status(404).json({ error: 'Itinerário não encontrado' });
    }
    
    // Atualizar o itinerário
    const updatedItinerary = await ItineraryModel.updateItinerary(itineraryId, updates);
    
    res.json(updatedItinerary);
  } catch (error) {
    console.error('Erro ao atualizar itinerário:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Exclui um itinerário
 */
const deleteItinerary = async (req, res) => {
  try {
    const itineraryId = req.params.id;
    
    // Verificar se o itinerário existe
    const existingItinerary = await ItineraryModel.getItineraryById(itineraryId);
    
    if (!existingItinerary) {
      return res.status(404).json({ error: 'Itinerário não encontrado' });
    }
    
    // Excluir o itinerário (as tabelas relacionadas serão excluídas automaticamente devido às restrições ON DELETE CASCADE)
    await ItineraryModel.deleteItinerary(itineraryId);
    
    res.json({ success: true, message: 'Itinerário excluído com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir itinerário:', error);
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllItineraries,
  getItineraryById,
  getItineraryByShareCode,
  createItinerary,
  updateItinerary,
  deleteItinerary
};