/**
 * Modelo para gerenciar atividades dos itinerários
 */

const db = require('../shared/db');

/**
 * Obtém todas as atividades de um dia específico
 * @param {number} dayId - ID do dia do itinerário
 * @returns {Promise<Array>} Lista de atividades
 */
async function getByDay(dayId) {
  try {
    const result = await db.query(
      `SELECT * FROM activities 
       WHERE itinerary_day_id = $1
       ORDER BY period, position`,
      [dayId]
    );
    
    return result.rows;
  } catch (error) {
    console.error('Erro ao buscar atividades do dia:', error);
    throw error;
  }
}

/**
 * Obtém uma atividade pelo ID
 * @param {number} id - ID da atividade
 * @returns {Promise<Object>} Atividade encontrada ou null
 */
async function getById(id) {
  try {
    const result = await db.query(
      'SELECT * FROM activities WHERE id = $1',
      [id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Erro ao buscar atividade:', error);
    throw error;
  }
}

/**
 * Cria uma nova atividade
 * @param {Object} activityData - Dados da atividade
 * @returns {Promise<Object>} Atividade criada
 */
async function create(activityData) {
  try {
    // Verificar se precisamos ajustar a posição para ser a última do período
    if (activityData.position === undefined) {
      const result = await db.query(
        `SELECT COALESCE(MAX(position), -1) + 1 as next_position 
         FROM activities 
         WHERE itinerary_day_id = $1 AND period = $2`,
        [activityData.itinerary_day_id, activityData.period]
      );
      
      activityData.position = result.rows[0].next_position;
    }
    
    // Construir query dinâmica para inserção
    const keys = Object.keys(activityData);
    const values = keys.map(key => activityData[key]);
    const placeholders = keys.map((_, index) => `$${index + 1}`);
    
    const result = await db.query(
      `INSERT INTO activities (${keys.join(', ')})
       VALUES (${placeholders.join(', ')})
       RETURNING *`,
      values
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar atividade:', error);
    throw error;
  }
}

/**
 * Atualiza uma atividade existente
 * @param {number} id - ID da atividade
 * @param {Object} activityData - Dados atualizados da atividade
 * @returns {Promise<Object>} Atividade atualizada ou null
 */
async function update(id, activityData) {
  try {
    // Remover campos nulos ou undefined
    Object.keys(activityData).forEach(key => {
      if (activityData[key] === null || activityData[key] === undefined) {
        delete activityData[key];
      }
    });
    
    // Se não houver campos para atualizar, retorna atividade atual
    if (Object.keys(activityData).length === 0) {
      return getById(id);
    }
    
    // Construir query dinâmica para atualização
    const keys = Object.keys(activityData);
    const values = keys.map(key => activityData[key]);
    const placeholders = keys.map((key, index) => `${key} = $${index + 1}`);
    
    // Adicionar updated_at
    placeholders.push(`updated_at = CURRENT_TIMESTAMP`);
    
    const result = await db.query(
      `UPDATE activities
       SET ${placeholders.join(', ')}
       WHERE id = $${values.length + 1}
       RETURNING *`,
      [...values, id]
    );
    
    return result.rows.length > 0 ? result.rows[0] : null;
  } catch (error) {
    console.error('Erro ao atualizar atividade:', error);
    throw error;
  }
}

/**
 * Reordena atividades em um dia/período
 * @param {number} dayId - ID do dia do itinerário
 * @param {string} period - Período (manhã, tarde, noite)
 * @param {Array<number>} activityIds - IDs das atividades na nova ordem
 * @returns {Promise<Array>} Lista atualizada de atividades
 */
async function reorder(dayId, period, activityIds) {
  try {
    // Executar a reordenação em uma transação
    return await db.transaction(async client => {
      // Para cada ID de atividade, atualizar sua posição
      for (let i = 0; i < activityIds.length; i++) {
        await client.query(
          `UPDATE activities
           SET position = $1, updated_at = CURRENT_TIMESTAMP
           WHERE id = $2 AND itinerary_day_id = $3 AND period = $4`,
          [i, activityIds[i], dayId, period]
        );
      }
      
      // Buscar atividades atualizadas
      const result = await client.query(
        `SELECT * FROM activities
         WHERE itinerary_day_id = $1 AND period = $2
         ORDER BY position`,
        [dayId, period]
      );
      
      return result.rows;
    });
  } catch (error) {
    console.error('Erro ao reordenar atividades:', error);
    throw error;
  }
}

/**
 * Mover atividade para outro dia/período
 * @param {number} id - ID da atividade
 * @param {number} newDayId - ID do novo dia
 * @param {string} newPeriod - Novo período
 * @param {number} newPosition - Nova posição (opcional)
 * @returns {Promise<Object>} Atividade movida
 */
async function move(id, newDayId, newPeriod, newPosition) {
  try {
    // Executar a movimentação em uma transação
    return await db.transaction(async client => {
      // Se a posição não foi especificada, calcular a última posição + 1
      if (newPosition === undefined) {
        const posResult = await client.query(
          `SELECT COALESCE(MAX(position), -1) + 1 as next_position
           FROM activities
           WHERE itinerary_day_id = $1 AND period = $2`,
          [newDayId, newPeriod]
        );
        
        newPosition = posResult.rows[0].next_position;
      }
      
      // Atualizar atividade para o novo dia/período/posição
      const result = await client.query(
        `UPDATE activities
         SET itinerary_day_id = $1, period = $2, position = $3, updated_at = CURRENT_TIMESTAMP
         WHERE id = $4
         RETURNING *`,
        [newDayId, newPeriod, newPosition, id]
      );
      
      // Reordenar as atividades no destino
      await client.query(
        `UPDATE activities
         SET position = position + 1, updated_at = CURRENT_TIMESTAMP
         WHERE itinerary_day_id = $1 AND period = $2 AND id != $3 AND position >= $4`,
        [newDayId, newPeriod, id, newPosition]
      );
      
      return result.rows.length > 0 ? result.rows[0] : null;
    });
  } catch (error) {
    console.error('Erro ao mover atividade:', error);
    throw error;
  }
}

/**
 * Exclui uma atividade
 * @param {number} id - ID da atividade
 * @returns {Promise<boolean>} True se sucesso, false se não encontrada
 */
async function deleteActivity(id) {
  try {
    const result = await db.query(
      'DELETE FROM activities WHERE id = $1 RETURNING id',
      [id]
    );
    
    return result.rows.length > 0;
  } catch (error) {
    console.error('Erro ao excluir atividade:', error);
    throw error;
  }
}

// Exportar funções do modelo
module.exports = {
  getByDay,
  getById,
  create,
  update,
  reorder,
  move,
  delete: deleteActivity // Alias para evitar conflito com palavra reservada
};