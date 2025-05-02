// Express server com suporte a banco de dados
const express = require('express');
const path = require('path');
const cors = require('cors');
const bodyParser = require('body-parser');
const { Pool } = require('pg');

// Configurar a chave da API do Google Maps
process.env.GOOGLE_MAPS_API_KEY = process.env.GOOGLE_MAPS_API_KEY || "AIzaSyD7M0OUg3wzN6p1J5Onzix7o3KmsBQRMAo";

// Create app
const app = express();
const PORT = process.env.PORT || 5000;

// Configuração da conexão com PostgreSQL
const dbConfig = {
  connectionString: process.env.DATABASE_URL || 'postgres://viajey:viajey@viajey_viajey:5432/viajey?sslmode=disable',
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
};

// Criar pool de conexões PostgreSQL
const pool = new Pool(dbConfig);

// Inicializar banco de dados
const initDatabase = async () => {
  try {
    // Testar conectividade com o banco
    try {
      await pool.query('SELECT NOW()');
      console.log('Conexão com o banco de dados estabelecida.');
    } catch (dbError) {
      console.error('Erro na conexão com o banco de dados:', dbError);
      console.log('Verificando novamente em 5 segundos...');
      await new Promise(resolve => setTimeout(resolve, 5000));
      await pool.query('SELECT NOW()');
    }
    
    // Criar tabelas necessárias
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

    await pool.query(`
      CREATE TABLE IF NOT EXISTS itinerary_days (
        id SERIAL PRIMARY KEY,
        itinerary_id INTEGER REFERENCES itineraries(id) ON DELETE CASCADE,
        day_number INTEGER NOT NULL,
        date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

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

    // Tabela para cache de resultados da API Google Maps
    await pool.query(`
      CREATE TABLE IF NOT EXISTS places_cache (
        id SERIAL PRIMARY KEY,
        place_id VARCHAR(255) NOT NULL UNIQUE,
        destination VARCHAR(255) NOT NULL,
        type VARCHAR(50) NOT NULL,
        data JSONB NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        expires_at TIMESTAMP DEFAULT (NOW() + INTERVAL '7 days')
      )
    `);

    console.log('Banco de dados inicializado com sucesso.');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
};

// Inicializar banco de dados
initDatabase();

// Middlewares
app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Serve static files
app.use(express.static('public'));
app.use('/static', express.static('static'));

// Main routes
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

// Página de exploração de destinos
app.get('/explorar', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'explorar.html'));
});

// Página de detalhes do local
app.get('/local/:placeId', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'local.html'));
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

// Endpoint para Google Maps API Key
app.get('/api/maps/key', (req, res) => {
  res.json({ key: process.env.GOOGLE_MAPS_API_KEY });
});

// Cache de lugares
app.post('/api/places/cache', async (req, res) => {
  try {
    const { place_id, destination, type, data } = req.body;
    
    // Verificar se o lugar já está em cache
    const existingPlace = await pool.query(
      'SELECT id FROM places_cache WHERE place_id = $1',
      [place_id]
    );
    
    if (existingPlace.rows.length > 0) {
      // Atualizar cache existente
      await pool.query(
        `UPDATE places_cache 
         SET data = $1, destination = $2, type = $3, expires_at = NOW() + INTERVAL '7 days' 
         WHERE place_id = $4`,
        [data, destination, type, place_id]
      );
    } else {
      // Inserir novo cache
      await pool.query(
        `INSERT INTO places_cache (place_id, destination, type, data) 
         VALUES ($1, $2, $3, $4)`,
        [place_id, destination, type, data]
      );
    }
    
    res.status(200).json({ success: true });
  } catch (error) {
    console.error('Erro ao cache de lugar:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obter lugar do cache
app.get('/api/places/cache/:placeId', async (req, res) => {
  try {
    const { placeId } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM places_cache WHERE place_id = $1 AND expires_at > NOW()',
      [placeId]
    );
    
    if (result.rows.length > 0) {
      res.json(result.rows[0].data);
    } else {
      res.status(404).json({ error: 'Lugar não encontrado em cache ou cache expirado' });
    }
  } catch (error) {
    console.error('Erro ao buscar cache de lugar:', error);
    res.status(500).json({ error: error.message });
  }
});

// Obter lugares por destino
app.get('/api/places/destination/:destination/:type?', async (req, res) => {
  try {
    const { destination, type } = req.params;
    
    let query = 'SELECT * FROM places_cache WHERE destination ILIKE $1 AND expires_at > NOW()';
    let params = [`%${destination}%`];
    
    if (type && type !== 'all') {
      query += ' AND type = $2';
      params.push(type);
    }
    
    query += ' ORDER BY created_at DESC';
    
    const result = await pool.query(query, params);
    
    res.json(result.rows.map(row => row.data));
  } catch (error) {
    console.error('Erro ao buscar lugares por destino:', error);
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
    const { itinerary_day_id, name, type, location, period, start_time, end_time, notes, position } = req.body;
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
    const { name, type, location, period, start_time, end_time, notes, position } = req.body;
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
      process.env.PORT = newPort; // Atualizar a variável de ambiente
      startServer(newPort);
    } else {
      console.error('Erro ao iniciar servidor:', err);
    }
  });
  
  return server;
}

// Iniciar servidor com fallback automático
startServer(PORT);