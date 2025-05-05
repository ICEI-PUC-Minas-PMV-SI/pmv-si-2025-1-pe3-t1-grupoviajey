/**
 * Viajey - Servidor principal
 * Aplicação de planejamento de viagens com Node.js e PostgreSQL
 */

require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Inicialização do app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configurar conexão PostgreSQL
const getDbConfig = () => {
  console.log('Configurando conexão com PostgreSQL...');
  
  // Obter string de conexão da variável de ambiente ou usar valor padrão
  const connectionString = process.env.DATABASE_URL || 'postgres://viajey:viajey@postgres:5432/viajey';
  
  // Tratar conexões no formato EasyPanel
  let dbConfig = {};
  
  // Verificar se é uma string de conexão Postgres (formato URI)
  if (connectionString && connectionString.startsWith('postgres')) {
    console.log(`Usando string de conexão do tipo URI`);
    
    // Verificar se SSL deve ser usado
    const useSSL = process.env.NODE_ENV === 'production' && 
                 !process.env.DISABLE_SSL && 
                 !connectionString.includes('sslmode=disable');
    
    // Log da decisão de SSL (sem exibir a string completa por segurança)
    console.log(`Modo SSL: ${useSSL ? 'ATIVADO' : 'DESATIVADO'}`);
    
    dbConfig = {
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : false,
    };
  } else {
    // Configuração por parâmetros individuais (formato EasyPanel)
    console.log(`Usando configuração por parâmetros individuais`);
    
    // EasyPanel usa o formato: viajey_viajey para o host
    const host = process.env.PGHOST || 'viajey_viajey';
    const database = process.env.PGDATABASE || 'viajey';
    const user = process.env.PGUSER || 'viajey';
    const password = process.env.PGPASSWORD || 'viajey';
    const port = parseInt(process.env.PGPORT || '5432', 10);
    
    dbConfig = {
      host,
      database,
      user,
      password,
      port
    };
  }
  
  // Adicionar opções comuns
  return {
    ...dbConfig,
    // Configurações adicionais para robustez
    max: 20, // máximo de conexões no pool
    idleTimeoutMillis: 30000, // tempo máximo que uma conexão pode ficar inativa no pool
    connectionTimeoutMillis: 10000, // tempo máximo para tentar estabelecer uma conexão
  };
};

// Configuração da conexão com PostgreSQL
const dbConfig = getDbConfig();

// Criar pool de conexões PostgreSQL
const pool = new Pool(dbConfig);

// Inicializar banco de dados - criação de tabelas
const initDatabase = async () => {
  try {
    let retryCount = 0;
    const maxRetries = 5;
    let connected = false;
    
    // Tentar conectar com retry
    while (!connected && retryCount < maxRetries) {
      try {
        await pool.query('SELECT NOW()');
        console.log('Conexão com o banco de dados estabelecida.');
        connected = true;
      } catch (dbError) {
        retryCount++;
        console.error(`Erro na conexão com o banco de dados (tentativa ${retryCount}/${maxRetries}):`, dbError);
        
        if (retryCount < maxRetries) {
          console.log(`Verificando novamente em ${retryCount * 2} segundos...`);
          // Espera com tempo crescente entre tentativas
          await new Promise(resolve => setTimeout(resolve, retryCount * 2000));
        } else {
          throw new Error('Número máximo de tentativas de conexão excedido');
        }
      }
    }
    
    console.log('Criando ou verificando tabelas do banco de dados...');
    
    // Criar tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        profile_pic VARCHAR(255),
        preferences JSONB,
        travel_style VARCHAR(50),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de itinerários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS itineraries (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        title VARCHAR(255) NOT NULL,
        destination VARCHAR(255) NOT NULL,
        start_date DATE NOT NULL,
        end_date DATE NOT NULL,
        preferences JSONB,
        price_range VARCHAR(50),
        cover_image VARCHAR(255),
        is_public BOOLEAN DEFAULT false,
        share_code VARCHAR(20) UNIQUE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de dias do itinerário
    await pool.query(`
      CREATE TABLE IF NOT EXISTS itinerary_days (
        id SERIAL PRIMARY KEY,
        itinerary_id INTEGER REFERENCES itineraries(id) ON DELETE CASCADE,
        day_number INTEGER NOT NULL,
        date DATE NOT NULL,
        title VARCHAR(100),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Criar tabela de atividades
    await pool.query(`
      CREATE TABLE IF NOT EXISTS activities (
        id SERIAL PRIMARY KEY,
        itinerary_day_id INTEGER REFERENCES itinerary_days(id) ON DELETE CASCADE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        location VARCHAR(255),
        address TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        period VARCHAR(50) NOT NULL,
        start_time TIME,
        end_time TIME,
        notes TEXT,
        position INTEGER,
        price DECIMAL(10, 2),
        rating DECIMAL(2, 1),
        image_url VARCHAR(255),
        place_id VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela de lista de verificação (checklist)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS checklists (
        id SERIAL PRIMARY KEY,
        itinerary_id INTEGER REFERENCES itineraries(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela de itens do checklist
    await pool.query(`
      CREATE TABLE IF NOT EXISTS checklist_items (
        id SERIAL PRIMARY KEY,
        checklist_id INTEGER REFERENCES checklists(id) ON DELETE CASCADE,
        description VARCHAR(255) NOT NULL,
        is_checked BOOLEAN DEFAULT false,
        category VARCHAR(50),
        priority INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela para armazenar dados de lugares (para reduzir chamadas à API)
    await pool.query(`
      CREATE TABLE IF NOT EXISTS cached_places (
        id SERIAL PRIMARY KEY,
        place_id VARCHAR(255) NOT NULL UNIQUE,
        name VARCHAR(255) NOT NULL,
        type VARCHAR(50),
        address TEXT,
        latitude DECIMAL(10, 8),
        longitude DECIMAL(11, 8),
        phone VARCHAR(50),
        website VARCHAR(255),
        rating DECIMAL(2, 1),
        price_level INTEGER,
        place_data JSONB,
        photos JSONB,
        last_updated TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela para comentários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        itinerary_id INTEGER REFERENCES itineraries(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    
    // Criar tabela para favoritos
    await pool.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        itinerary_id INTEGER REFERENCES itineraries(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, itinerary_id)
      )
    `);

    console.log('Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    throw error; // Propagar erro para permitir retry em nível superior
  }
};

// Inicializar banco de dados na inicialização do servidor
(async () => {
  let retries = 5;
  let connected = false;
  
  while (retries > 0 && !connected) {
    try {
      console.log(`Tentando inicializar o banco de dados (tentativas restantes: ${retries})...`);
      await initDatabase();
      connected = true;
      console.log('Banco de dados inicializado com sucesso.');
    } catch (error) {
      console.error('Erro ao conectar com o banco de dados:', error.message);
      retries--;
      
      if (retries > 0) {
        const waitTime = 5000; // 5 segundos
        console.log(`Tentando novamente em ${waitTime/1000} segundos...`);
        await new Promise(resolve => setTimeout(resolve, waitTime));
      } else {
        console.error('Número máximo de tentativas atingido. Verifique a conexão com o banco de dados.');
      }
    }
  }
  
  // Imprimir informações de diagnóstico (sem expor credenciais)
  console.log('Informações de conexão com o banco de dados:');
  console.log(`- Host: ${process.env.PGHOST || 'não definido'}`);
  console.log(`- Porta: ${process.env.PGPORT || '5432 (padrão)'}`);
  console.log(`- Banco: ${process.env.PGDATABASE || 'não definido'}`);
  console.log(`- Usuário: ${process.env.PGUSER || 'não definido'}`);
  console.log(`- SSL: ${dbConfig.ssl ? 'Ativado' : 'Desativado'}`);
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

// Exportar conexão do BD para ser usada pelos modelos
const db = require('./db');
db.pool = pool; // Adicionar pool à exportação do db

// Importar rotas da API
const apiRoutes = require('./routes/api');

// Endpoint de ping para verificação de status
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor funcionando!' });
});

// Endpoint para verificar conexão com o banco de dados
app.get('/api/healthcheck', async (req, res) => {
  try {
    // Tentar executar uma query simples para verificar o banco
    const result = await pool.query('SELECT NOW() as time');
    
    const dbInfo = {
      host: process.env.PGHOST || 'não definido',
      port: process.env.PGPORT || '5432 (padrão)',
      database: process.env.PGDATABASE || 'não definido',
      user: process.env.PGUSER || 'não definido',
      ssl: dbConfig.ssl ? 'Ativado' : 'Desativado',
      // Adicionar timestamp do banco para confirmar comunicação
      serverTime: result.rows[0].time,
      connectionPool: {
        totalCount: pool.totalCount,
        idleCount: pool.idleCount,
        waitingCount: pool.waitingCount
      }
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
        ssl: dbConfig.ssl ? 'Ativado' : 'Desativado'
      }
    });
  }
});

// Usar as rotas da API
app.use('/api', apiRoutes);

app.post('/api/activities', async (req, res) => {
  try {
    const { 
      itinerary_day_id, name, type, location, period, 
      start_time, end_time, notes, position 
    } = req.body;
    
    const result = await pool.query(
      `INSERT INTO activities (
        itinerary_day_id, name, type, location, period, 
        start_time, end_time, notes, position
      ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) RETURNING *`,
      [itinerary_day_id, name, type, location, period, start_time, end_time, notes, position]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.put('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const { 
      name, type, location, period, 
      start_time, end_time, notes, position 
    } = req.body;
    
    const result = await pool.query(
      `UPDATE activities SET 
        name = $1, type = $2, location = $3, period = $4,
        start_time = $5, end_time = $6, notes = $7, position = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = $9 RETURNING *`,
      [name, type, location, period, start_time, end_time, notes, position, id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    
    res.json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.delete('/api/activities/:id', async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query('DELETE FROM activities WHERE id = $1 RETURNING *', [id]);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ error: 'Atividade não encontrada' });
    }
    
    res.json({ message: 'Atividade excluída com sucesso' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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