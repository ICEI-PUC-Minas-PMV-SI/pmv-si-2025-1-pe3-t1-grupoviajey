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
    const token = req.body.token || req.query.token || req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    try {
      // Verificar token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Obter usuário atual
      const user = await UserModel.getUserById(decoded.id);
      
      if (!user) {
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      res.json({
        valid: true,
        user
      });
    } catch (err) {
      return res.status(401).json({ error: 'Token inválido ou expirado' });
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
  
  // Token válido por 24 horas
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '24h' });
};

module.exports = {
  register,
  login,
  verify
};