/**
 * Modelo para gerenciar atividades dos itinerários
 */

const db = require('../db');

/**
 * Obtém todas as atividades de um dia específico
 */
const getActivitiesByDay = async (itineraryDayId) => {
  try {
    const result = await db.query(
      'SELECT * FROM activities WHERE itinerary_day_id = $1 ORDER BY period, position',
      [itineraryDayId]
    );
    return result.rows;
  } catch (error) {
    console.error('Erro ao obter atividades por dia:', error);
    throw error;
  }
};

/**
 * Cria uma nova atividade
 */
const createActivity = async (activityData) => {
  const {
    itinerary_day_id,
    name,
    type,
    location,
    address,
    latitude,
    longitude,
    period,
    start_time,
    end_time,
    notes,
    position,
    price,
    rating,
    image_url,
    place_id
  } = activityData;
  
  try {
    // Determinar a próxima posição se não for fornecida
    let activityPosition = position;
    if (activityPosition === undefined) {
      const result = await db.query(
        'SELECT MAX(position) as max_position FROM activities WHERE itinerary_day_id = $1 AND period = $2',
        [itinerary_day_id, period]
      );
      
      const maxPosition = result.rows[0].max_position || 0;
      activityPosition = maxPosition + 1;
    }
    
    const result = await db.query(
      `INSERT INTO activities 
        (itinerary_day_id, name, type, location, address, latitude, longitude, 
         period, start_time, end_time, notes, position, price, rating, image_url, place_id) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16) 
       RETURNING *`,
      [
        itinerary_day_id, name, type, location, address, latitude, longitude,
        period, start_time, end_time, notes, activityPosition, price, rating, image_url, place_id
      ]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    throw error;
  }
};

/**
 * Atualiza uma atividade existente
 */
const updateActivity = async (id, updates) => {
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
      UPDATE activities 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length} 
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Atividade não encontrada');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    throw error;
  }
};

/**
 * Reordena atividades em um dia/período
 */
const reorderActivities = async (itineraryDayId, period, activityOrder) => {
  try {
    return await db.transaction(async (client) => {
      for (let i = 0; i < activityOrder.length; i++) {
        await client.query(
          'UPDATE activities SET position = $1 WHERE id = $2',
          [i, activityOrder[i]]
        );
      }
      
      return { success: true, message: 'Atividades reordenadas com sucesso' };
    });
  } catch (error) {
    console.error('Erro ao reordenar atividades:', error);
    throw error;
  }
};

/**
 * Mover atividade para outro dia/período
 */
const moveActivity = async (activityId, targetDayId, targetPeriod) => {
  try {
    // Determinar a próxima posição no dia/período de destino
    const positionResult = await db.query(
      'SELECT MAX(position) as max_position FROM activities WHERE itinerary_day_id = $1 AND period = $2',
      [targetDayId, targetPeriod]
    );
    
    const newPosition = (positionResult.rows[0].max_position || 0) + 1;
    
    // Atualizar a atividade
    const result = await db.query(
      'UPDATE activities SET itinerary_day_id = $1, period = $2, position = $3 WHERE id = $4 RETURNING *',
      [targetDayId, targetPeriod, newPosition, activityId]
    );
    
    if (result.rows.length === 0) {
      throw new Error('Atividade não encontrada');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao mover atividade:', error);
    throw error;
  }
};

/**
 * Exclui uma atividade
 */
const deleteActivity = async (id) => {
  try {
    const result = await db.query('DELETE FROM activities WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      throw new Error('Atividade não encontrada');
    }
    
    return { success: true, message: 'Atividade excluída com sucesso' };
  } catch (error) {
    console.error('Erro ao excluir atividade:', error);
    throw error;
  }
};

module.exports = {
  getActivitiesByDay,
  createActivity,
  updateActivity,
  reorderActivities,
  moveActivity,
  deleteActivity
};