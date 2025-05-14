/**
 * Viajey - Servidor principal
 * Aplicação de planejamento de viagens com Node.js
 * Versão com autenticação baseada em banco de dados PostgreSQL
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');

// Inicialização do app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Importar configuração do banco de dados
const db = require('./shared/db');

console.log('Inicializando servidor Viajey...');
console.log(`Porta configurada: ${PORT}`);
console.log('Sistema de autenticação: PostgreSQL (autenticação baseada em banco de dados)');

// Verificação da conexão com o banco de dados 
(async () => {
  try {
    console.log('Verificando conexão com banco de dados...');
    const status = await db.checkConnection();
    
    if (status.connected) {
      console.log('Conexão com o banco de dados PostgreSQL estabelecida com sucesso!');
    } else {
      console.log('ERRO: Banco de dados PostgreSQL não disponível!');
      console.log('ERRO: Sistema de autenticação pode não funcionar corretamente.');
    }
  } catch (error) {
    console.log('ERRO: Falha ao conectar com o banco de dados PostgreSQL!');
    console.log('ERRO: Sistema de autenticação pode não funcionar corretamente.');
    console.error(error);
  }
})();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Servir arquivos estáticos
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use('/public', express.static(path.join(__dirname, 'public')));

// Rotas principais para páginas
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'desktop.html'));
});

app.get('/explorar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'explorar.html'));
});

app.get('/detail', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'detail.html'));
});

app.get('/itinerary', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'itinerary.html'));
});

app.get('/itinerary-kanban', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'itinerary-kanban.html'));
});

app.get('/google-maps-example', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'google-maps-example.html'));
});

app.get('/status', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'status.html'));
});

// Importar rotas da API
const apiRoutes = require('./routes/api');

// Endpoint de ping para verificação de status
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor funcionando!' });
});

// Endpoint para verificar conexão com o banco de dados
app.get('/api/healthcheck', async (req, res) => {
  try {
    // Usar nosso módulo de BD para verificar a conexão
    const status = await db.checkConnection();
    
    if (!status.connected) {
      throw new Error(status.error || 'Falha na conexão com o banco de dados');
    }
    
    const dbInfo = {
      host: process.env.PGHOST || 'não definido',
      port: process.env.PGPORT || '5432 (padrão)',
      database: process.env.PGDATABASE || 'não definido',
      user: process.env.PGUSER || 'não definido',
      ssl: process.env.DISABLE_SSL === 'true' ? 'Desativado' : 'Configuração padrão',
      serverTime: status.time,
      tables: status.tables || []
    };
    
    res.status(200).json({
      status: 'ok',
      message: 'Conexão com o banco de dados estabelecida',
      dbInfo
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Falha na conexão com o banco de dados',
      error: error.message,
      config: {
        host: process.env.PGHOST || 'não definido',
        port: process.env.PGPORT || '5432 (padrão)',
        database: process.env.PGDATABASE || 'não definido',
        user: process.env.PGUSER || 'não definido',
        ssl: process.env.DISABLE_SSL === 'true' ? 'Desativado' : 'Configuração padrão'
      }
    });
  }
});

// Endpoint para testar o sistema (sem dependência de banco de dados)
app.get('/api/test/itineraries', async (req, res) => {
  try {
    // Dados de teste para demonstração
    const mockItineraries = [
      { id: 1, title: 'Férias em Paris', destination: 'Paris, França', start_date: '2025-06-10', end_date: '2025-06-20' },
      { id: 2, title: 'Fim de semana em São Paulo', destination: 'São Paulo, Brasil', start_date: '2025-05-23', end_date: '2025-05-25' },
      { id: 3, title: 'Viagem a Tóquio', destination: 'Tóquio, Japão', start_date: '2025-09-01', end_date: '2025-09-15' }
    ];
    
    res.status(200).json({
      status: 'ok',
      message: 'Dados de teste obtidos com sucesso',
      count: mockItineraries.length,
      data: mockItineraries,
      note: 'Dados simulados para demonstração do sistema de autenticação sem banco de dados'
    });
  } catch (error) {
    res.status(500).json({
      status: 'error',
      message: 'Erro interno do servidor',
      error: error.message
    });
  }
});

// Usar as rotas da API
app.use('/api', apiRoutes);

// As rotas específicas abaixo serão movidas para os controladores e rotas API
// Mantemos apenas para compatibilidade temporária durante a migração

// Importar controllers de atividades
const activityController = require('./controllers/activityController');

// Rotas diretas para atividades (compatibilidade)
app.post('/api/activities', activityController.createActivity);
app.put('/api/activities/:id', activityController.updateActivity);
app.delete('/api/activities/:id', activityController.deleteActivity);

// Fallback para rotas não encontradas
app.get('*', (req, res) => {
  // Tenta servir o arquivo diretamente do diretório public
  const filePath = path.join(__dirname, 'public', req.path);
  res.sendFile(filePath, (err) => {
    if (err) {
      // Se o arquivo não existir, redireciona para a página inicial
      res.redirect('/');
    }
  });
});

// Função para iniciar o servidor com fallback para portas alternativas
function startServer(port) {
  // Converter para número para garantir que seja tratado como número
  port = Number(port);
  
  // Verificar se é um número válido e está dentro do intervalo permitido
  if (isNaN(port) || port < 1024 || port > 65535) {
    console.warn(`Porta inválida: ${port}, usando porta padrão 3000`);
    port = 3000;
  }
  
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Porta ${port} já está em uso, tentando porta alternativa...`);
      
      // Se a porta solicitada for 5000, tentar 3000, senão incrementar em 1
      const newPort = port === 5000 ? 3000 : (port + 1 > 65535 ? 3000 : port + 1);
      
      console.log(`Tentando porta alternativa: ${newPort}`);
      startServer(newPort);
    } else {
      console.error('Erro ao iniciar servidor:', err);
    }
  });
  
  return server;
}

// Iniciar servidor com fallback automático
startServer(PORT);