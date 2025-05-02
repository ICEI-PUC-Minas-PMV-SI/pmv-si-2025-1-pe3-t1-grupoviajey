require('dotenv').config();
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Inicialização do app Express
const app = express();
const PORT = process.env.PORT || 3000;

// Configuração da conexão com PostgreSQL
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgres://viajey:viajey@viajey_viajey:5432/viajey?sslmode=disable',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Criar pool de conexões PostgreSQL
const pool = new Pool(dbConfig);

// Inicializar banco de dados - criação de tabelas
const initDatabase = async () => {
  try {
    // Testar conectividade com o banco antes de continuar
    try {
      await pool.query('SELECT NOW()');
      console.log('Conexão com o banco de dados estabelecida.');
    } catch (dbError) {
      console.error('Erro na conexão com o banco de dados:', dbError);
      console.log('Verificando novamente em 5 segundos...');
      // Espera 5 segundos e tenta novamente
      await new Promise(resolve => setTimeout(resolve, 5000));
      await pool.query('SELECT NOW()');
    }
    
    // Criar tabela de usuários
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username VARCHAR(100) NOT NULL UNIQUE,
        email VARCHAR(255) NOT NULL UNIQUE,
        password VARCHAR(255) NOT NULL,
        profile_pic VARCHAR(255),
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
        period VARCHAR(50) NOT NULL,
        start_time TIME,
        end_time TIME,
        notes TEXT,
        position INTEGER,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
};

// Inicializar banco de dados na inicialização do servidor
initDatabase();

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

// API Endpoints
// Usuários
app.post('/api/users', async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const result = await pool.query(
      'INSERT INTO users (username, email, password) VALUES ($1, $2, $3) RETURNING id',
      [username, email, password]
    );
    res.status(201).json({ id: result.rows[0].id, username, email });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Endpoint de ping para verificação de status
app.get('/ping', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'Servidor funcionando!' });
});

// Itinerários
app.get('/api/itineraries', async (req, res) => {
  try {
    const result = await pool.query('SELECT * FROM itineraries ORDER BY created_at DESC');
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

app.post('/api/itineraries', async (req, res) => {
  try {
    const { user_id, title, destination, start_date, end_date, preferences, price_range } = req.body;
    const result = await pool.query(
      'INSERT INTO itineraries (user_id, title, destination, start_date, end_date, preferences, price_range) VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *',
      [user_id, title, destination, start_date, end_date, preferences, price_range]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Dias do Itinerário
app.post('/api/itinerary-days', async (req, res) => {
  try {
    const { itinerary_id, day_number, date } = req.body;
    const result = await pool.query(
      'INSERT INTO itinerary_days (itinerary_id, day_number, date) VALUES ($1, $2, $3) RETURNING *',
      [itinerary_id, day_number, date]
    );
    res.status(201).json(result.rows[0]);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Atividades
app.get('/api/activities/:dayId', async (req, res) => {
  try {
    const { dayId } = req.params;
    const result = await pool.query(
      'SELECT * FROM activities WHERE itinerary_day_id = $1 ORDER BY period, position',
      [dayId]
    );
    res.json(result.rows);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

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
  const server = app.listen(port, '0.0.0.0', () => {
    console.log(`Servidor rodando na porta ${port}`);
  }).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.warn(`Porta ${port} já está em uso, tentando porta alternativa...`);
      
      // Se a porta solicitada for 5000, tentar 3000, senão incrementar em 10
      const newPort = port === 5000 ? 3000 : port + 10;
      
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