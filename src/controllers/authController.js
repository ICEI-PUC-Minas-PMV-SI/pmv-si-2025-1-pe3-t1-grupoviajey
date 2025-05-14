/**
 * Controlador de Autenticação com Banco de Dados
 * Integração com PostgreSQL para gerenciamento de usuários
 * Versão reconstruída para resolver problemas de compatibilidade com campo password_hash
 */

const jwt = require('jsonwebtoken');
const db = require('../db');
const crypto = require('crypto');

// Chave secreta para tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'viajey_secret_key_2025';

/**
 * Função de hash para senhas
 */
const hashPassword = (password) => {
  return crypto.createHash('sha256').update(String(password)).digest('hex');
};

/**
 * Registra um novo usuário
 */
const register = async (req, res) => {
  try {
    console.log('REGISTRO: Dados recebidos:', JSON.stringify(req.body));
    
    // Extrair apenas os campos que realmente precisamos
    const { username, email } = req.body;
    
    // Usar qualquer campo de senha que estiver disponível
    const senhaParaHash = req.body.senha || req.body.password || req.body.password_hash;
    
    console.log('REGISTRO: Campos extraídos:', { 
      username, 
      email, 
      temSenha: !!senhaParaHash 
    });
    
    // Validar dados obrigatórios
    if (!username || !email || !senhaParaHash) {
      return res.status(400).json({ 
        error: 'Campos obrigatórios ausentes',
        fields: {
          username: !username ? 'ausente' : 'presente',
          email: !email ? 'ausente' : 'presente',
          senha: !senhaParaHash ? 'ausente' : 'presente'
        }
      });
    }
    
    // Validar formato de email
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Formato de email inválido' });
    }
    
    // Verificar se o email já está em uso
    const emailCheck = await db.query('SELECT id FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }
    
    // Verificar se o nome de usuário já está em uso
    const usernameCheck = await db.query('SELECT id FROM users WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      return res.status(409).json({ error: 'Nome de usuário já está em uso' });
    }
    
    // Hash da senha
    const hashed_password = hashPassword(senhaParaHash);
    
    console.log(`REGISTRO: Preparando SQL para inserir usuário: ${username} / ${email}`);
    
    // Inserir o novo usuário no banco de dados - IMPORTANTE: usar o nome exato da coluna
    const insertQuery = `
      INSERT INTO users (username, email, password_hash) 
      VALUES ($1, $2, $3) 
      RETURNING id, username, email, created_at
    `;
    
    const result = await db.query(insertQuery, [username, email, hashed_password]);
    
    // Obter o usuário criado
    const newUser = result.rows[0];
    
    // Gerar token JWT
    const token = generateToken(newUser);
    
    console.log('REGISTRO: Usuário registrado com sucesso: ID:', newUser.id);
    
    res.status(201).json({
      user: newUser,
      token
    });
  } catch (error) {
    console.error('REGISTRO: Erro ao registrar usuário:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Autentica um usuário
 */
const login = async (req, res) => {
  try {
    console.log('LOGIN: Dados recebidos:', JSON.stringify(req.body));
    
    const { email } = req.body;
    
    // Usar qualquer campo de senha que estiver disponível
    const senhaParaHash = req.body.senha || req.body.password || req.body.password_hash;
    
    // Validar dados obrigatórios
    if (!email || !senhaParaHash) {
      return res.status(400).json({ 
        error: 'Email e senha são obrigatórios',
        fields: {
          email: !email ? 'ausente' : 'presente',
          senha: !senhaParaHash ? 'ausente' : 'presente'
        }
      });
    }
    
    console.log(`LOGIN: Processando login para: ${email}`);
    
    // Buscar usuário pelo email
    const result = await db.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1', 
      [email]
    );
    
    if (result.rows.length === 0) {
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    const user = result.rows[0];
    
    // Verificar se a senha está correta
    const hashedPassword = hashPassword(senhaParaHash);
    
    if (user.password_hash !== hashedPassword) {
      console.log('LOGIN: Senha incorreta para usuário:', email);
      return res.status(401).json({ error: 'Credenciais inválidas' });
    }
    
    // Preparar objeto para resposta (sem incluir a senha)
    const userForResponse = {
      id: user.id,
      username: user.username,
      email: user.email
    };
    
    // Gerar token JWT
    const token = generateToken(userForResponse);
    
    console.log('LOGIN: Login bem-sucedido para:', email);
    
    res.json({
      user: userForResponse,
      token
    });
  } catch (error) {
    console.error('LOGIN: Erro ao fazer login:', error);
    res.status(500).json({ 
      error: error.message,
      stack: error.stack
    });
  }
};

/**
 * Verifica se um token JWT é válido
 */
const verify = async (req, res) => {
  try {
    console.log('VERIFY: Headers recebidos:', JSON.stringify(req.headers));
    const token = req.body.token || req.query.token || req.headers['authorization']?.split(' ')[1];
    
    if (!token) {
      console.log('VERIFY: Nenhum token fornecido na requisição');
      return res.status(401).json({ error: 'Token não fornecido' });
    }
    
    try {
      // Verificar token
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Buscar usuário pelo ID
      const result = await db.query('SELECT id, username, email FROM users WHERE id = $1', [decoded.id]);
      
      if (result.rows.length === 0) {
        console.error('VERIFY: Usuário não encontrado para o ID:', decoded.id);
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      const user = result.rows[0];
      
      console.log('VERIFY: Usuário autenticado:', user.username);
      
      res.json({
        valid: true,
        user: user
      });
    } catch (err) {
      console.error('VERIFY: Erro na verificação do JWT:', err.name, '-', err.message);
      
      // Verificar se é um erro de autenticação ou outro tipo
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      } else {
        // Outros erros do servidor não relacionados à autenticação
        return res.status(500).json({ error: 'Erro interno ao verificar autenticação' });
      }
    }
  } catch (error) {
    console.error('VERIFY: Erro ao verificar token:', error);
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
  
  // Token válido por 30 dias para melhor experiência do usuário
  const token = jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
  
  return token;
};

module.exports = {
  register,
  login,
  verify
};