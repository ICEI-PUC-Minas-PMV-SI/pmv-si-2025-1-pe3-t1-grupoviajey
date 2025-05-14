/**
 * Modelo para gerenciar usuários
 */

const db = require('../db');
const crypto = require('crypto');

/**
 * Busca um usuário pelo ID
 */
const getUserById = async (id) => {
  try {
    const result = await db.query('SELECT id, username, email, profile_pic, created_at FROM users WHERE id = $1', [id]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar usuário por ID:', error);
    throw error;
  }
};

/**
 * Busca um usuário pelo email
 */
const getUserByEmail = async (email) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar usuário por email:', error);
    throw error;
  }
};

/**
 * Busca um usuário pelo nome de usuário
 */
const getUserByUsername = async (username) => {
  try {
    const result = await db.query('SELECT * FROM users WHERE username = $1', [username]);
    
    if (result.rows.length === 0) {
      return null;
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao buscar usuário por nome de usuário:', error);
    throw error;
  }
};

/**
 * Cria um novo usuário
 */
const createUser = async (userData) => {
  const { username, email, password, profile_pic = null } = userData;
  
  try {
    // Verificar se o email já está em uso
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      throw new Error('Email já está em uso');
    }
    
    // Verificar se o nome de usuário já está em uso
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      throw new Error('Nome de usuário já está em uso');
    }
    
    // Hash da senha
    const hashedPassword = hashPassword(password);
    
    const result = await db.query(
      'INSERT INTO users (username, email, password_hash, profile_pic) VALUES ($1, $2, $3, $4) RETURNING id, username, email, profile_pic, created_at',
      [username, email, hashedPassword, profile_pic]
    );
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    throw error;
  }
};

/**
 * Atualiza um usuário existente
 */
const updateUser = async (id, updates) => {
  try {
    // Se a senha estiver sendo atualizada, faz o hash e ajusta o nome do campo
    if (updates.password) {
      updates.password_hash = hashPassword(updates.password);
      delete updates.password;
    }
    
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
      UPDATE users 
      SET ${setClause}, updated_at = CURRENT_TIMESTAMP 
      WHERE id = $${values.length} 
      RETURNING id, username, email, profile_pic, created_at, updated_at
    `;
    
    const result = await db.query(query, values);
    
    if (result.rows.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    return result.rows[0];
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    throw error;
  }
};

/**
 * Verifica as credenciais do usuário para login
 */
const verifyCredentials = async (email, password) => {
  try {
    // Buscar usuário pelo email
    const user = await getUserByEmail(email);
    
    if (!user) {
      return null;
    }
    
    // Verificar senha
    const hashedPassword = hashPassword(password);
    
    if (user.password_hash !== hashedPassword) {
      return null;
    }
    
    // Retornar dados do usuário (sem a senha)
    const { password_hash: _, ...userData } = user;
    return userData;
  } catch (error) {
    console.error('Erro ao verificar credenciais:', error);
    throw error;
  }
};

/**
 * Função para criar hash da senha
 */
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
};

module.exports = {
  getUserById,
  getUserByEmail,
  getUserByUsername,
  createUser,
  updateUser,
  verifyCredentials
};