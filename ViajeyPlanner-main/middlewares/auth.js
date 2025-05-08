/**
 * Middleware de Autenticação
 * Verifica se o usuário está autenticado para acessar rotas protegidas
 */

const jwt = require('jsonwebtoken');
const UserModel = require('../models/user');

// Chave secreta para tokens JWT (deve ser a mesma usada no authController)
const JWT_SECRET = process.env.JWT_SECRET || 'viajey_secret_key_2025';

/**
 * Middleware para verificar se o usuário está autenticado
 */
const isAuthenticated = async (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verificar token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Obter usuário atual
      const user = await UserModel.getUserById(decoded.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Adicionar usuário ao objeto da requisição
      req.user = user;
      
      // Continuar para o próximo middleware ou controlador
      next();
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
    }
  } catch (error) {
    console.error('Erro no middleware de autenticação:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Middleware opcional que verifica se o usuário está autenticado,
 * mas permite o acesso mesmo se não estiver
 */
const optionalAuth = async (req, res, next) => {
  try {
    // Obter token do header Authorization
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      // Se não houver token, continue sem usuário
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    
    try {
      // Verificar token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Obter usuário atual
      const user = await UserModel.getUserById(decoded.id);
      
      if (user) {
        // Adicionar usuário ao objeto da requisição
        req.user = user;
      }
    } catch (err) {
      // Se o token for inválido, ignore e continue sem usuário
    }
    
    // Continuar para o próximo middleware ou controlador
    next();
  } catch (error) {
    console.error('Erro no middleware de autenticação opcional:', error);
    next();
  }
};

module.exports = {
  isAuthenticated,
  optionalAuth
};