/**
 * Módulo de conexão com o banco de dados PostgreSQL
 * Fornece uma interface unificada para conexão e operações no banco
 */

const { Pool } = require('pg');

/**
 * Obtém a configuração de conexão com o banco de dados
 * @returns {Object} Configuração para o pool de conexões PostgreSQL
 */
function getDbConfig() {
  console.log('Configurando conexão com PostgreSQL...');
  
  // Obter string de conexão da variável de ambiente ou usar valor padrão
  const connectionString = process.env.DATABASE_URL || 'postgres://viajey:viajey@postgres:5432/viajey';
  
  // Determinar se deve usar SSL
  const useSSL = process.env.NODE_ENV === 'production' && 
               !process.env.DISABLE_SSL && 
               !connectionString.includes('sslmode=disable');
  
  // Configurar pela string de conexão ou parâmetros individuais
  let config;
  
  if (connectionString && connectionString.startsWith('postgres')) {
    // Usar string de conexão
    config = {
      connectionString,
      ssl: useSSL ? { rejectUnauthorized: false } : false
    };
    
    console.log(`Modo de conexão: String URI`);
    console.log(`Modo SSL: ${useSSL ? 'ATIVADO' : 'DESATIVADO'}`);
  } else {
    // Usar parâmetros individuais
    config = {
      host: process.env.PGHOST || 'viajey_viajey',
      database: process.env.PGDATABASE || 'viajey',
      user: process.env.PGUSER || 'viajey',
      password: process.env.PGPASSWORD || 'viajey',
      port: parseInt(process.env.PGPORT || '5432', 10),
      ssl: useSSL ? { rejectUnauthorized: false } : false
    };
    
    console.log(`Modo de conexão: Parâmetros`);
    console.log(`Parâmetros: ${config.user}@${config.host}:${config.port}/${config.database}`);
  }
  
  // Adicionar configurações comuns de pool
  return {
    ...config,
    max: 20,                     // Máximo de conexões no pool
    idleTimeoutMillis: 30000,    // Tempo máximo de inatividade
    connectionTimeoutMillis: 10000  // Timeout de conexão
  };
}

// Criar o pool de conexões
const pool = new Pool(getDbConfig());

// Monitorar eventos de erro no pool
pool.on('error', (err, client) => {
  console.error('Erro inesperado no pool de conexões:', err);
});

/**
 * Executa uma consulta SQL parametrizada
 * @param {string} text - Consulta SQL
 * @param {Array} params - Parâmetros para a consulta
 * @returns {Promise<Object>} Resultado da consulta
 */
async function query(text, params) {
  const start = Date.now();
  try {
    const result = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log de consultas lentas
    if (duration > 500) {
      console.log('Consulta lenta:', { text, duration, rows: result.rowCount });
    }
    
    return result;
  } catch (err) {
    console.error('Erro na execução da query:', { text, params, error: err.message });
    throw err;
  }
}

/**
 * Obtém um cliente do pool para transações
 * @returns {Promise<Object>} Cliente do pool
 */
async function getClient() {
  const client = await pool.connect();
  
  // Sobrescrever método de release para detectar vazamentos
  const originalRelease = client.release;
  const timeout = setTimeout(() => {
    console.error('Cliente do pool possível vazamento detectado');
  }, 30000);
  
  client.release = () => {
    clearTimeout(timeout);
    return originalRelease.call(client);
  };
  
  return client;
}

/**
 * Executa uma transação com múltiplas consultas
 * @param {Function} callback - Função que recebe o cliente e executa as queries
 * @returns {Promise<any>} Resultado da transação
 */
async function transaction(callback) {
  const client = await getClient();
  
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (err) {
    await client.query('ROLLBACK');
    throw err;
  } finally {
    client.release();
  }
}

/**
 * Verifica a conexão com o banco de dados
 * @returns {Promise<Object>} Status da conexão
 */
async function checkConnection() {
  try {
    const result = await query('SELECT NOW() as time');
    
    // Verificar tabelas existentes
    const tables = await query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `);
    
    return {
      connected: true,
      time: result.rows[0].time,
      tables: tables.rows.map(row => row.table_name)
    };
  } catch (err) {
    return {
      connected: false,
      error: err.message
    };
  }
}

// Exportar funcionalidades
module.exports = {
  query,
  getClient,
  transaction,
  checkConnection,
  pool
};