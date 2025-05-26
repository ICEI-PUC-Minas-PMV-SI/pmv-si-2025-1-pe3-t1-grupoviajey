/**
 * Controlador de Autenticação - Versão Simplificada
 * Reescrito do zero para eliminar problemas persistentes
 */

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const db = require('../db');

// Chave secreta para tokens JWT
const JWT_SECRET = process.env.JWT_SECRET || 'viajey_secret_key_2025';

// Função de hash para senhas (não altera nome das propriedades)
const hashSenha = (texto) => {
  return crypto.createHash('sha256').update(String(texto)).digest('hex');
};

/**
 * Registro de novos usuários
 */
exports.registrar = async (req, res) => {
  try {
    // Debug dos dados recebidos
    console.log('[AUTH-REGISTRAR] Payload recebido:', JSON.stringify(req.body));
    
    // Extrair campos necessários
    const { username, email } = req.body;
    
    // A senha pode vir em vários campos, tentamos todos
    let senhaTexto = req.body.senha;
    
    // Se não tiver senha no formato primário, procurar outros formatos
    if (!senhaTexto) {
      console.log('[AUTH-REGISTRAR] Senha primária não encontrada, buscando alternativas...');
      senhaTexto = req.body.password;
    }
    
    // Validações básicas
    if (!username || !email || !senhaTexto) {
      console.log('[AUTH-REGISTRAR] Dados incompletos:', { 
        temUsername: !!username, 
        temEmail: !!email, 
        temSenha: !!senhaTexto 
      });
      return res.status(400).json({
        erro: 'Dados incompletos. Todos os campos são obrigatórios.',
        campos: { username: !!username, email: !!email, senha: !!senhaTexto }
      });
    }
    
    // Fazer hash da senha
    const hashDaSenha = hashSenha(senhaTexto);
    
    // Verificar se email já existe
    const emailCheck = await db.query('SELECT 1 FROM users WHERE email = $1', [email]);
    if (emailCheck.rows.length > 0) {
      return res.status(409).json({ erro: 'Este email já está cadastrado' });
    }
    
    // Verificar se username já existe
    const usernameCheck = await db.query('SELECT 1 FROM users WHERE username = $1', [username]);
    if (usernameCheck.rows.length > 0) {
      return res.status(409).json({ erro: 'Este nome de usuário já está em uso' });
    }
    
    // SQL para inserção (usando explicitamente o nome da coluna password_hash)
    const sql = `
      INSERT INTO users (username, email, password_hash, created_at, updated_at) 
      VALUES ($1, $2, $3, NOW(), NOW()) 
      RETURNING id, username, email, created_at
    `;
    
    // Executar a inserção
    console.log('[AUTH-REGISTRAR] Executando SQL com parâmetros:', { username, email, password_hash: '[HASH]' });
    const result = await db.query(sql, [username, email, hashDaSenha]);
    
    if (result.rows.length === 0) {
      throw new Error('Erro na inserção de usuário');
    }
    
    // Extrair dados do usuário inserido
    const novoUsuario = result.rows[0];
    console.log('[AUTH-REGISTRAR] Usuário criado com sucesso:', novoUsuario.id);
    
    // Gerar token JWT
    const token = gerarToken(novoUsuario);
    
    // Resposta de sucesso
    res.status(201).json({
      mensagem: 'Cadastro realizado com sucesso',
      usuario: {
        id: novoUsuario.id,
        username: novoUsuario.username,
        email: novoUsuario.email
      },
      token
    });
  } catch (erro) {
    console.error('[AUTH-REGISTRAR] Erro:', erro);
    res.status(500).json({ 
      erro: 'Erro no servidor ao processar o registro', 
      detalhes: erro.message 
    });
  }
};

/**
 * Login de usuários
 */
exports.login = async (req, res) => {
  try {
    // Debug dos dados recebidos
    console.log('[AUTH-LOGIN] Payload recebido:', JSON.stringify(req.body));
    
    // Extrair campos obrigatórios
    const { email } = req.body;
    
    // A senha pode vir em vários campos
    let senhaTexto = req.body.senha;
    
    // Se não tiver senha no formato primário, procurar outros formatos
    if (!senhaTexto) {
      console.log('[AUTH-LOGIN] Senha primária não encontrada, buscando alternativas...');
      senhaTexto = req.body.password;
    }
    
    // Validações básicas
    if (!email || !senhaTexto) {
      return res.status(400).json({
        erro: 'Dados incompletos. Email e senha são obrigatórios.',
        campos: { email: !!email, senha: !!senhaTexto }
      });
    }
    
    // Buscar usuário pelo email
    const resultado = await db.query(
      'SELECT id, username, email, password_hash FROM users WHERE email = $1',
      [email]
    );
    
    // Verificar se usuário existe
    if (resultado.rows.length === 0) {
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Extrair dados do usuário
    const usuario = resultado.rows[0];
    
    // Fazer hash da senha fornecida para comparar
    const hashDaSenha = hashSenha(senhaTexto);
    
    // Verificar se a senha está correta
    if (usuario.password_hash !== hashDaSenha) {
      console.log('[AUTH-LOGIN] Senha incorreta para usuário:', email);
      return res.status(401).json({ erro: 'Credenciais inválidas' });
    }
    
    // Gerar token JWT
    const token = gerarToken(usuario);
    
    // Resposta de sucesso
    console.log('[AUTH-LOGIN] Login bem-sucedido para:', email);
    res.json({
      mensagem: 'Login bem-sucedido',
      usuario: {
        id: usuario.id,
        username: usuario.username,
        email: usuario.email
      },
      token
    });
  } catch (erro) {
    console.error('[AUTH-LOGIN] Erro:', erro);
    res.status(500).json({ 
      erro: 'Erro no servidor ao processar o login', 
      detalhes: erro.message 
    });
  }
};

/**
 * Verificação de token
 */
exports.verificarToken = async (req, res) => {
  try {
    // Extrair token do cabeçalho, query ou body
    const token = req.headers.authorization?.split(' ')[1] || 
                 req.query.token || 
                 req.body.token;
    
    if (!token) {
      return res.status(401).json({ erro: 'Token não fornecido' });
    }
    
    // Verificar token
    try {
      const decoded = jwt.verify(token, JWT_SECRET);
      
      // Buscar usuário para confirmar que ainda existe
      const resultado = await db.query(
        'SELECT id, username, email FROM users WHERE id = $1',
        [decoded.id]
      );
      
      if (resultado.rows.length === 0) {
        return res.status(401).json({ erro: 'Usuário não encontrado' });
      }
      
      // Dados do usuário
      const usuario = resultado.rows[0];
      
      // Resposta de sucesso
      res.json({
        valido: true,
        usuario: {
          id: usuario.id,
          username: usuario.username,
          email: usuario.email
        }
      });
    } catch (erroJwt) {
      // Erro na verificação do token
      return res.status(401).json({ erro: 'Token inválido ou expirado' });
    }
  } catch (erro) {
    console.error('[AUTH-VERIFICAR] Erro:', erro);
    res.status(500).json({ erro: 'Erro no servidor ao verificar token' });
  }
};

/**
 * Geração de token JWT
 */
function gerarToken(usuario) {
  const payload = {
    id: usuario.id,
    username: usuario.username,
    email: usuario.email
  };
  
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '30d' });
}