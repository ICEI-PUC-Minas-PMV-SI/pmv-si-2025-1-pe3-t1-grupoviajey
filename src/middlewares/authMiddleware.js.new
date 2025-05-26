/**
 * Middleware de Autenticação - Versão Simplificada
 * Reescrito do zero para eliminar problemas persistentes
 */

const jwt = require('jsonwebtoken');
const db = require('../db');

// Chave secreta para tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'viajey_secret_key_2025';

/**
 * Middleware para rotas que exigem autenticação
 */
exports.requerAutenticacao = async (req, res, next) => {
  try {
    // Extrair o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    if (!token) {
      return res.status(401).json({ erro: 'Acesso não autorizado. Token não fornecido.' });
    }
    
    try {
      // Verificar o token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Buscar dados atualizados do usuário
      const resultado = await db.query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [decoded.id]
      );
      
      if (resultado.rows.length === 0) {
        return res.status(401).json({ erro: 'Usuário não encontrado ou inativo.' });
      }
      
      // Anexar dados do usuário ao objeto de requisição
      req.usuario = resultado.rows[0];
      
      // Prosseguir para o próximo middleware/rota
      next();
    } catch (erroJwt) {
      console.error('[AUTH-MIDDLEWARE] Erro no token:', erroJwt.message);
      return res.status(401).json({ erro: 'Token inválido ou expirado.' });
    }
  } catch (erro) {
    console.error('[AUTH-MIDDLEWARE] Erro geral:', erro);
    return res.status(500).json({ erro: 'Erro interno ao validar autenticação.' });
  }
};

/**
 * Middleware opcional para incluir informações do usuário quando disponíveis,
 * mas permitir acesso mesmo sem autenticação
 */
exports.usuarioOpcional = async (req, res, next) => {
  try {
    // Extrair o token do cabeçalho Authorization
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN
    
    // Se não houver token, apenas continua sem autenticar
    if (!token) {
      req.usuario = null;
      return next();
    }
    
    try {
      // Verificar o token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Buscar dados atualizados do usuário
      const resultado = await db.query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [decoded.id]
      );
      
      // Se encontrar o usuário, anexar à requisição
      if (resultado.rows.length > 0) {
        req.usuario = resultado.rows[0];
      } else {
        req.usuario = null;
      }
      
      // Prosseguir para o próximo middleware/rota
      next();
    } catch (erroJwt) {
      // Em caso de erro no token, apenas ignora sem bloquear
      console.warn('[AUTH-MIDDLEWARE] Token inválido:', erroJwt.message);
      req.usuario = null;
      next();
    }
  } catch (erro) {
    // Em caso de erro geral, apenas registra e continua
    console.error('[AUTH-MIDDLEWARE] Erro ao processar token:', erro);
    req.usuario = null;
    next();
  }
};