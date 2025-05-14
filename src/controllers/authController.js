/**
 * Controlador de Autenticação Simplificado
 * Versão sem banco de dados - utiliza apenas memória
 */

const jwt = require('jsonwebtoken');

// Chave secreta para tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'viajey_secret_key_2025';

// Usuários simulados em memória (para fins de demonstração)
const demoUsers = [
  {
    id: 1,
    username: 'demo',
    email: 'demo@example.com',
    // Senha: demoaccount
    hashedPassword: '7a2f1ade3573d12c94a2c8e9e69d4203fd3bbee81af5be5a19e5263744e79712'
  },
  {
    id: 2,
    username: 'viajey',
    email: 'viajey@example.com',
    // Senha: viajey2025
    hashedPassword: '8a0b1e38291f9c1645676a185e326c71ff166766a9ab28b3e4723ecdcb9a8c35'
  }
];

/**
 * Função de hash simples
 */
const hashPassword = (password) => {
  const crypto = require('crypto');
  return crypto.createHash('sha256').update(String(password)).digest('hex');
};

/**
 * Registra um novo usuário
 */
const register = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    
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
    const existingEmail = demoUsers.find(user => user.email === email);
    if (existingEmail) {
      return res.status(409).json({ error: 'Email já está em uso' });
    }
    
    // Verificar se o nome de usuário já está em uso
    const existingUsername = demoUsers.find(user => user.username === username);
    if (existingUsername) {
      return res.status(409).json({ error: 'Nome de usuário já está em uso' });
    }
    
    // Criar o usuário (apenas em memória para demonstração)
    const newUser = {
      id: demoUsers.length + 1,
      username,
      email,
      hashedPassword: hashPassword(password)
    };
    
    // Adicionar à lista de demonstração
    demoUsers.push(newUser);
    
    // Preparar objeto para resposta (sem incluir a senha)
    const userForResponse = {
      id: newUser.id,
      username: newUser.username,
      email: newUser.email
    };
    
    // Gerar token JWT
    const token = generateToken(userForResponse);
    
    console.log('Usuário registrado com sucesso:', username);
    
    res.status(201).json({
      user: userForResponse,
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
    
    // Buscar usuário pelo email
    const user = demoUsers.find(user => user.email === email);
    
    // Verificar se usuário existe e senha está correta
    if (!user || user.hashedPassword !== hashPassword(password)) {
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
    
    console.log('Login bem-sucedido para:', email);
    
    res.json({
      user: userForResponse,
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
      const decoded = jwt.verify(token, JWT_SECRET);
      console.log('[Verify] Token verificado com sucesso. Payload:', { id: decoded.id, username: decoded.username });
      
      // Buscar usuário pelo ID
      const user = demoUsers.find(user => user.id === decoded.id);
      
      if (!user) {
        console.error('[Verify] Usuário não encontrado para o ID:', decoded.id);
        return res.status(404).json({ error: 'Usuário não encontrado' });
      }
      
      // Preparar objeto para resposta (sem incluir a senha)
      const userForResponse = {
        id: user.id,
        username: user.username,
        email: user.email
      };
      
      console.log('[Verify] Usuário encontrado:', user.username);
      
      res.json({
        valid: true,
        user: userForResponse
      });
    } catch (err) {
      console.error('[Verify] Erro na verificação do JWT:', err.name, '-', err.message);
      
      // Verificar se é um erro de autenticação ou outro tipo
      if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
        return res.status(401).json({ error: 'Token inválido ou expirado' });
      } else {
        // Outros erros do servidor não relacionados à autenticação
        return res.status(500).json({ error: 'Erro interno ao verificar autenticação' });
      }
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