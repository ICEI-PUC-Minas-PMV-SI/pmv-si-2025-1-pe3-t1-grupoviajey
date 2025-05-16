/**
 * Viajey - Servidor principal reescrito
 * Versão com autenticação totalmente reconstruída para resolver problemas persistentes
 */

const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Client } = require('pg');
const dotenv = require('dotenv');

// Carregar variáveis de ambiente
dotenv.config();

// Importar rotas
const authRoutes = require('./routes/auth');
const apiRoutes = require('./routes/api');

// Configuração do servidor
const app = express();
const PORT = process.env.PORT || 3000; // Usando 3000 para evitar conflito com a porta 5000

// Middleware
app.use(cors());
app.use(bodyParser.json());

// Servir arquivos estáticos
app.use(express.static(path.join(__dirname, 'public')));
app.use('/static', express.static(path.join(__dirname, 'static')));

// Verificar conexão com o banco de dados
async function verificarBancoDados() {
  console.log('Verificando conexão com banco de dados...');
  
  try {
    const db = require('./db');
    const resultado = await db.query('SELECT NOW()');
    
    if (resultado.rows && resultado.rows.length > 0) {
      console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
      return true;
    } else {
      console.error('Falha ao consultar o banco de dados.');
      return false;
    }
  } catch (erro) {
    console.error('Erro ao conectar no banco de dados:', erro.message);
    return false;
  }
}

// Rotas de autenticação (novas)
app.use('/api/auth', authRoutes);

// Rotas da API 
app.use('/api', apiRoutes);

// Redirecionar para as páginas adequadas
app.get('/register', (req, res) => {
  res.redirect('/register.html');
});

app.get('/login', (req, res) => {
  res.redirect('/login.html');
});

app.get('/desktop', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'desktop.html'));
});

app.get('/desktop.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'desktop.html'));
});

// Rota principal
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Manipulação de erros
app.use((err, req, res, next) => {
  console.error('Erro no servidor:', err);
  res.status(500).json({ erro: 'Erro interno no servidor', detalhes: err.message });
});

// Iniciar o servidor
async function iniciarServidor() {
  console.log('Inicializando servidor Viajey...');
  console.log('Sistema de autenticação: PostgreSQL (reconstruído)');
  
  // Verificar conexão com banco de dados
  const dbOk = await verificarBancoDados();
  
  // Forçar uso da porta 3000
  const PORTA_FIXA = 3000;
  console.log('Porta forçada para:', PORTA_FIXA);
  
  // Iniciar o servidor diretamente na porta 3000
  app.listen(PORTA_FIXA, () => {
    console.log(`Servidor rodando na porta ${PORTA_FIXA}`);
    
    if (!dbOk) {
      console.warn('⚠️ Servidor iniciado, mas há problemas na conexão com o banco de dados.');
    }
  });
}

// Executar o servidor
iniciarServidor();