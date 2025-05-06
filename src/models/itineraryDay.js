/**
 * Modelo para gerenciar dias do itinerário
 */

const db = require('../db');

/**
 * Obtém todos os dias de um itinerário
 */
const getDaysByItineraryId = async (itineraryId) => {
  try {
    const result = await db.query(
      'SELECT * FROM itinerary_days WHERE itinerary_id = $1 ORDER BY day_number',
      [itineraryId]
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao obter dias do itinerário:', error);
    throw error;
  }
};

/**
 * Cria um novo dia no itinerário
 */
const createDay = async (dayData) => {
  const { itinerary_id, day_number, date, title, notes } = dayData;
  
  try {
    // Verificar qual tabela existe
    let tableToUse = 'itinerary_days';
    
    const result = await db.query(
      `INSERT INTO ${tableToUse} 
        (itinerary_id, day_number, date) 
       VALUES ($1, $2, $3) 
       RETURNING *`,
      [itinerary_id, day_number, date]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar dia do itinerário:', error);
    throw error;
  }
};

/**
 * Atualiza um dia do itinerário
 */
const updateDay = async (id, updates) => {
  try {
    // Construir query dinamicamente baseada nos campos atualizados
    const fields = Object.keys(updates);
    const values = Object.values(updates);
    
    if (fields.length === 0) {
      throw new Error('Nenhum campo fornecido para atualização');
    }
    
    // Criar a parte SET da query
    const setClause = fields
      .map((field, index) => `${field} = $${index + 1}`)
      .join(', ');
    
    // Adicionar id como último parâmetro
    values.push(id);
    
    const query = `
      UPDATE itinerary_days 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length} 
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Dia não encontrado');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao atualizar dia:', error);
    throw error;
  }
};

/**
 * Obtém um dia específico pelo ID
 */
const getDayById = async (id) => {
  try {
    const result = await db.query('SELECT * FROM itinerary_days WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao obter dia por ID:', error);
    throw error;
  }
};

/**
 * Exclui um dia do itinerário
 */
const deleteDay = async (id) => {
  try {
    const result = await db.query('DELETE FROM itinerary_days WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Dia não encontrado');
    }
    
    return { success: true, message: 'Dia excluído com sucesso' };
  } catch (error) {
    console.error('Erro ao excluir dia:', error);
    throw error;
  }
};

/**
 * Reordena os dias de um itinerário após a exclusão de um dia
 */
const reorderDaysAfterDeletion = async (itineraryId, deletedDayNumber) => {
  try {
    return await db.transaction(async (client) => {
      // Atualizar os números dos dias após o dia excluído
      await client.query(
        'UPDATE itinerary_days SET day_number = day_number - 1 WHERE itinerary_id = $1 AND day_number > $2',
        [itineraryId, deletedDayNumber]
      );
      
      return { success: true, message: 'Dias reordenados com sucesso' };
    });
  } catch (error) {
    console.error('Erro ao reordenar dias após exclusão:', error);
    throw error;
  }
};

module.exports = {
  getDaysByItineraryId,
  createDay,
  updateDay,
  getDayById,
  deleteDay,
  reorderDaysAfterDeletion
};