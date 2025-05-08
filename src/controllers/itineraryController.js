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
    console.log('[GetAllItineraries] Requisição recebida');
    console.log('[GetAllItineraries] Usuário autenticado:', req.user ? `${req.user.username} (ID: ${req.user.id})` : 'Nenhum');
    console.log('[GetAllItineraries] Query params:', req.query);
    
    // Se tiver usuário autenticado, usar seu ID (já que agora a rota é autenticada)
    const userId = req.user ? req.user.id : null;
    
    console.log('[GetAllItineraries] Buscando itinerários para o usuário ID:', userId);
    const itineraries = await ItineraryModel.getAllItineraries(userId);
    console.log(`[GetAllItineraries] Encontrados ${itineraries.length} itinerários`);
    
    res.json(itineraries);
  } catch (error) {
    console.error('[GetAllItineraries] Erro:', error);
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
    console.log('[CreateItinerary] === INÍCIO DA CRIAÇÃO DE ITINERÁRIO ===');
    console.log('[CreateItinerary] Usuário autenticado:', req.user ? `${req.user.username} (ID: ${req.user.id})` : 'Nenhum');
    console.log('[CreateItinerary] Headers:', JSON.stringify(req.headers, null, 2));
    console.log('[CreateItinerary] Corpo da requisição:', JSON.stringify(req.body, null, 2));
    
    // Obter dados do corpo da requisição
    const itineraryData = req.body;
    
    // Validar dados obrigatórios
    if (!itineraryData.title || !itineraryData.destination || !itineraryData.start_date || !itineraryData.end_date) {
      console.log('[CreateItinerary] Erro: campos obrigatórios ausentes', itineraryData);
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    
    // Verificar se o usuário está autenticado (middleware isAuthenticated deve garantir que sim)
    if (!req.user) {
      console.log('[CreateItinerary] Erro: usuário não autenticado');
      return res.status(401).json({ error: 'Usuário não autenticado. Por favor, faça login novamente.' });
    }
    
    // Adicionar user_id do usuário autenticado
    itineraryData.user_id = req.user.id;
    console.log('[CreateItinerary] Usando ID do usuário autenticado:', itineraryData.user_id, '(', req.user.username, ')');
    
    // Garantir que valores opcionais não causem erros
    itineraryData.price_range = itineraryData.price_range || 'moderado';
    
    // Processar campo options para garantir formato correto
    const optionsData = itineraryData.options || [];
    
    // Converter para o formato adequado para o banco de dados
    if (typeof optionsData === 'string') {
      try {
        // Verificar se já é JSON válido
        JSON.parse(optionsData);
        itineraryData.options = optionsData;
      } catch (e) {
        // Não é JSON válido, converter para JSON
        itineraryData.options = JSON.stringify(optionsData);
      }
    } else {
      // Se for array ou objeto, converter para string JSON
      itineraryData.options = JSON.stringify(optionsData);
    }
    
    // Remover campos que não existem na tabela 'itineraries'
    delete itineraryData.cover_image;
    delete itineraryData.is_public;
    
    console.log('[CreateItinerary] Dados do itinerário após processamento:', JSON.stringify(itineraryData, null, 2));
    
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
        date: currentDate.toISOString().split('T')[0] // Formato YYYY-MM-DD
        // Removido campo 'title' que não existe na tabela 'itinerary_days'
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
    
    // Processar campo options para garantir formato correto
    if (updates.options) {
      const optionsData = updates.options || [];
      
      // Converter para o formato adequado para o banco de dados
      if (typeof optionsData === 'string') {
        try {
          // Verificar se já é JSON válido
          JSON.parse(optionsData);
          updates.options = optionsData;
        } catch (e) {
          // Não é JSON válido, converter para JSON
          updates.options = JSON.stringify(optionsData);
        }
      } else {
        // Se for array ou objeto, converter para string JSON
        updates.options = JSON.stringify(optionsData);
      }
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