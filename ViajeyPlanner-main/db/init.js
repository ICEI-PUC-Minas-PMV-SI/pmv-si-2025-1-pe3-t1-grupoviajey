/**
 * Script para inicialização do banco de dados
 * Cria todas as tabelas necessárias para a aplicação Viajey
 */

const db = require('./index');

/**
 * Inicializa o banco de dados criando todas as tabelas necessárias
 * @returns {Promise<boolean>} True se a inicialização foi bem-sucedida
 */
async function initDatabase() {
  try {
    console.log('Inicializando banco de dados...');
    
    // Criar tabela de usuários
    await db.query(`
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
    console.log('- Tabela "users" verificada/criada');

    // Criar tabela de itinerários
    await db.query(`
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
    console.log('- Tabela "itineraries" verificada/criada');

    // Criar tabela de dias do itinerário
    await db.query(`
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
    console.log('- Tabela "itinerary_days" verificada/criada');

    // Criar tabela de atividades
    await db.query(`
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
    console.log('- Tabela "activities" verificada/criada');
    
    // Criar tabela de lista de verificação (checklist)
    await db.query(`
      CREATE TABLE IF NOT EXISTS checklists (
        id SERIAL PRIMARY KEY,
        itinerary_id INTEGER REFERENCES itineraries(id) ON DELETE CASCADE,
        title VARCHAR(100) NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('- Tabela "checklists" verificada/criada');
    
    // Criar tabela de itens do checklist
    await db.query(`
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
    console.log('- Tabela "checklist_items" verificada/criada');
    
    // Criar tabela para armazenar dados de lugares (para reduzir chamadas à API)
    await db.query(`
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
    console.log('- Tabela "cached_places" verificada/criada');
    
    // Criar tabela para comentários
    await db.query(`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        itinerary_id INTEGER REFERENCES itineraries(id) ON DELETE CASCADE,
        user_id INTEGER REFERENCES users(id),
        comment TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
    console.log('- Tabela "comments" verificada/criada');
    
    // Criar tabela para favoritos
    await db.query(`
      CREATE TABLE IF NOT EXISTS favorites (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        itinerary_id INTEGER REFERENCES itineraries(id) ON DELETE CASCADE,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, itinerary_id)
      )
    `);
    console.log('- Tabela "favorites" verificada/criada');

    console.log('Banco de dados inicializado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return false;
  }
}

/**
 * Verifica a conexão com o banco de dados e retorna informações
 * @returns {Promise<Object>} Informações do banco de dados
 */
async function checkDatabaseConnection() {
  try {
    // Verificar conexão
    const res = await db.query('SELECT NOW() as timestamp');
    
    // Verificar tabelas existentes
    const tables = await db.query(`
      SELECT table_name FROM information_schema.tables 
      WHERE table_schema = 'public'
      ORDER BY table_name
    `);
    
    return {
      connected: true,
      timestamp: res.rows[0].timestamp,
      tables: tables.rows.map(row => row.table_name),
      connectionInfo: {
        host: process.env.PGHOST || 'não definido',
        port: process.env.PGPORT || '5432 (padrão)',
        database: process.env.PGDATABASE || 'não definido',
        user: process.env.PGUSER || 'não definido',
        ssl: process.env.DISABLE_SSL === 'true' ? 'Desativado' : 'Configuração padrão'
      }
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message,
      connectionInfo: {
        host: process.env.PGHOST || 'não definido',
        port: process.env.PGPORT || '5432 (padrão)',
        database: process.env.PGDATABASE || 'não definido',
        user: process.env.PGUSER || 'não definido',
        ssl: process.env.DISABLE_SSL === 'true' ? 'Desativado' : 'Configuração padrão'
      }
    };
  }
}

// Exportar funções
module.exports = {
  initDatabase,
  checkDatabaseConnection
};

// Permitir execução direta do script
if (require.main === module) {
  (async () => {
    try {
      // Verificar conexão
      console.log('Verificando conexão com o banco de dados...');
      const status = await checkDatabaseConnection();
      
      if (!status.connected) {
        console.error('Falha na conexão com o banco de dados:', status.error);
        process.exit(1);
      }
      
      console.log('Conexão com o banco de dados estabelecida em:', status.timestamp);
      console.log('Tabelas existentes:', status.tables.join(', ') || 'Nenhuma');
      
      // Inicializar banco
      const success = await initDatabase();
      
      process.exit(success ? 0 : 1);
    } catch (err) {
      console.error('Erro fatal:', err);
      process.exit(1);
    }
  })();
}