/**
 * Modelo para gerenciar itinerários
 */

const db = require('../db');

/**
 * Obtém todos os itinerários
 * Opcionalmente filtra por usuário
 */
const getAllItineraries = async (userId = null) => {
  try {
    let query = 'SELECT * FROM itineraries';
    let params = [];
    
    if (userId) {
      query += ' WHERE user_id = $1';
      params.push(userId);
    }
    
    query += ' ORDER BY created_at DESC';
    const result = await db.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Erro ao obter itinerários:', error);
    throw error;
  }
};

/**
 * Cria um novo itinerário
 */
const createItinerary = async (itineraryData) => {
  const { 
    user_id, 
    title, 
    destination, 
    start_date, 
    end_date, 
    preferences, 
    price_range,
    cover_image,
    is_public
  } = itineraryData;
  
  // Gerar código de compartilhamento único
  const shareCode = generateShareCode();
  
  try {
    const result = await db.query(
      `INSERT INTO itineraries 
        (user_id, title, destination, start_date, end_date, preferences, price_range, cover_image, is_public, share_code) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) 
       RETURNING *`,
      [user_id, title, destination, start_date, end_date, preferences, price_range, cover_image, is_public, shareCode]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar itinerário:', error);
    throw error;
  }
};

/**
 * Atualiza um itinerário existente
 */
const updateItinerary = async (id, updates) => {
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
      UPDATE itineraries 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length} 
      RETURNING *
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Itinerário não encontrado');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao atualizar itinerário:', error);
    throw error;
  }
};

/**
 * Obtém um itinerário por ID
 */
const getItineraryById = async (id) => {
  try {
    const result = await db.query('SELECT * FROM itineraries WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao obter itinerário por ID:', error);
    throw error;
  }
};

/**
 * Obtém um itinerário pelo código de compartilhamento
 */
const getItineraryByShareCode = async (shareCode) => {
  try {
    const result = await db.query('SELECT * FROM itineraries WHERE share_code = $1', [shareCode]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao obter itinerário por código de compartilhamento:', error);
    throw error;
  }
};

/**
 * Exclui um itinerário por ID
 */
const deleteItinerary = async (id) => {
  try {
    // Usar transação para garantir que tudo seja excluído corretamente
    return await db.transaction(async (client) => {
      // Verificar se o itinerário existe
      const checkResult = await client.query('SELECT id FROM itineraries WHERE id = $1', [id]);
      
      if (checkResult.rows.length === 0) {
        throw new Error('Itinerário não encontrado');
      }
      
      // As tabelas relacionadas serão excluídas automaticamente devido às restrições ON DELETE CASCADE
      // Mas podemos ser explícitos para maior segurança
      
      // Excluir o itinerário
      await client.query('DELETE FROM itineraries WHERE id = $1', [id]);
      
      return { success: true, message: 'Itinerário excluído com sucesso' };
    });
  } catch (error) {
    console.error('Erro ao excluir itinerário:', error);
    throw error;
  }
};

/**
 * Gerar código aleatório para compartilhamento
 */
const generateShareCode = () => {
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  const length = 10;
  let code = '';
  
  for (let i = 0; i < length; i++) {
    code += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  
  return code;
};

module.exports = {
  getAllItineraries,
  createItinerary,
  updateItinerary,
  getItineraryById,
  getItineraryByShareCode,
  deleteItinerary
};