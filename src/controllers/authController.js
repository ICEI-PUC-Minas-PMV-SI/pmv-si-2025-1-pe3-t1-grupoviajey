/**
 * Controlador de Autenticação
 * Gerencia login, registro e autenticação de usuários
 */

const UserModel = require('../models/user');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Chave secreta para tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'viajey_secret_key_2025';

/**
 * Registra um novo usuário
 */
const register = async (req, res) => {
  try {
    const { username, email, password, profile_pic } = req.body;
    
    // Validar dados obrigatórios
    if (!username || !email || !password) {
      return res.status(400).json({ error: 'Campos obrigatórios ausentes' });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }
    
    // Verificar se o email já está em uso
    const existingEmail = await UserModel.getUserByEmail(email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }
    
    // Verificar se o nome de usuário já está em uso
    const existingUsername = await UserModel.getUserByUsername(username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Nome de usuário já está em uso' });
    }
    
    // Criar o usuário
    const userData = {
      username,
      email,
      password,
      profile_pic
    };
    
    const newUser = await UserModel.createUser(userData);
    
    // Gerar token JWT
    const token = generateToken(newUser);
    
    res.status(201).json({
      user: newUser,
      token
    });
  } catch (error) {
    console.error('Erro ao registrar usuário:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Autentica um usuário
 */
const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    // Validar dados obrigatórios
    if (!email || !password) {
      return res.status(400).json({ error: 'Email e senha são obrigatórios' });
    }
    
    // Verificar credenciais
    const user = await UserModel.verifyCredentials(email, password);
    
    if (!user) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = generateToken(user);
    
    res.json({
      user,
      token
    });
  } catch (error) {
    console.error('Erro ao fazer login:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Verifica se um token JWT é válido
 */
const verify = async (req, res) => {
  try {
    console.log('[Verify] Headers recebidos:', JSON.stringify(req.headers));
    const token = req.body.token || req.query.token || req.headers['authorization']?.split(' ')[1];
    
    console.log('[Verify] Token extraído:', token ? `${token.substring(0, 15)}...` : 'Nenhum token encontrado');
    
    if (!token) {
      console.log('[Verify] Nenhum token fornecido na requisição');
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    try {
      // Verificar token
      console.log('[Verify] JWT_SECRET:', JWT_SECRET ? `${JWT_SECRET.substring(0, 3)}...${JWT_SECRET.substring(JWT_SECRET.length - 3)}` : 'Ausente');
      console.log('[Verify] Tentando verificar token...');
      
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('[Verify] Token verificado com sucesso. Payload:', { id: decoded.id, username: decoded.username });
      
      // Obter usuário atual
      console.log('[Verify] Buscando usuário com ID:', decoded.id);
      const user = await UserModel.getUserById(decoded.id);
      
      if (!user) {
        console.error('[Verify] Usuário não encontrado para o ID:', decoded.id);
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      console.log('[Verify] Usuário encontrado:', user.username);
      
      res.json({
        valid: true,
        user
      });
    } catch (err) {
      console.error('[Verify] Erro na verificação do JWT:', err.name, '-', err.message);
      return res.status(401).json({ error: `Token inválido ou expirado - ${err.message}` });
    }
  } catch (error) {
    console.error('Erro ao verificar token:', error);
    res.status(500).json({ error: error.message });
  }
};

/**
 * Gera um token JWT para um usuário
 */
const generateToken = (user) => {
  const payload = {
    id: user.id,
    username: user.username,
    email: user.email
  };
  
  console.log('Gerando token JWT para usuário:', user.username, '(ID:', user.id, ')');
  console.log('JWT_SECRET no login:', JWT_SECRET ? `${JWT_SECRET.substring(0, 3)}...${JWT_SECRET.substring(JWT_SECRET.length - 3)}` : 'Ausente');
  console.log('Payload do token:', payload);
  
  // Token válido por 30 dias para melhor experiência do usuário
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  console.log('Token gerado com sucesso:', token.substring(0, 15) + '...');
  
  return token;
};

module.exports = {
  register,
  login,
  verify
};