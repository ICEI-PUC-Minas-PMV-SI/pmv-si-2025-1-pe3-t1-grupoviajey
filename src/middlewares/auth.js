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
    console.log('Auth header:', authHeader ? 'Presente' : 'Ausente');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('Header Authorization inválido ou ausente:', authHeader);
      return res.status(401).json({ error: 'Token de autenticação não fornecido' });
    }
    
    const token = authHeader.split(' ')[1];
    console.log('Token recebido para verificação:', token.substring(0, 15) + '...');
    console.log('JWT_SECRET na verificação:', JWT_SECRET ? `${JWT_SECRET.substring(0, 3)}...${JWT_SECRET.substring(JWT_SECRET.length - 3)}` : 'Ausente');
    
    try {
      // Verificar token
      console.log('Tentando verificar o token JWT...');
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('Token verificado com sucesso. Payload:', { id: decoded.id, username: decoded.username });
      
      // Obter usuário atual
      console.log('Buscando usuário com ID:', decoded.id);
      const user = await UserModel.getUserById(decoded.id);
      
      if (!user) {
        console.error('Usuário não encontrado com ID:', decoded.id);
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      console.log('Usuário encontrado:', user.username);
      
      // Adicionar usuário ao objeto da requisição
      req.user = user;
      
      // Continuar para o próximo middleware ou controlador
      next();
    } catch (err) {
      console.error('Erro na verificação do JWT:', err.name, '-', err.message);
      
      // Verificar se é um erro de autenticação (JWT) ou outro tipo
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        // Erros relacionados ao JWT
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      } else {
        // Outros erros não relacionados à autenticação
        return res.status(500).json({ error: `Erro interno do servidor: ${err.message}` });
      }
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
    console.log('[OptionalAuth] Auth header:', authHeader ? 'Presente' : 'Ausente');
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      console.log('[OptionalAuth] Nenhum token válido encontrado, continuando sem autenticação');
      // Se não houver token, continue sem usuário
      return next();
    }
    
    const token = authHeader.split(' ')[1];
    console.log('[OptionalAuth] Token recebido:', token.substring(0, 15) + '...');
    
    try {
      // Verificar token
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('[OptionalAuth] Token verificado com sucesso. Payload ID:', decoded.id);
      
      // Obter usuário atual
      const user = await UserModel.getUserById(decoded.id);
      
      if (user) {
        console.log('[OptionalAuth] Usuário encontrado:', user.username);
        // Adicionar usuário ao objeto da requisição
        req.user = user;
      } else {
        console.log('[OptionalAuth] Usuário não encontrado para o ID:', decoded.id);
      }
    } catch (err) {
      // Se o token for inválido, ignore e continue sem usuário
      console.warn('[OptionalAuth] Token inválido, ignorando. Erro:', err.name, '-', err.message);
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