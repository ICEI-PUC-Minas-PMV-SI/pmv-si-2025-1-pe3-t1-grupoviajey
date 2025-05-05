/**
 * Módulo de conexão com o banco de dados PostgreSQL
 * Fornece uma interface unificada para conexão e operações no banco
 */

const { Pool } = require('pg');

// Pool de conexões (criada sob demanda)
let pool;

/**
 * Obtém a configuração de conexão com o banco de dados
 * @returns {Object} Configuração para o pool de conexões PostgreSQL
 */
function getDbConfig() {
  console.log('Configurando conexão com PostgreSQL...');
  
  // Obter string de conexão da variável de ambiente ou usar valor padrão
  const connectionString = process.env.DATABASE_URL || 'postgres://viajey:viajey@postgres:5432/viajey';
  
  // Tratar conexões no formato EasyPanel
  let dbConfig = {};
  
  // Verificar se é uma string de conexão Postgres (formato URI)
  if (connectionString && connectionString.startsWith('postgres')) {
    console.log(`Usando string de conexão do tipo URI`);
    
    // Verificar se SSL deve ser desativado explicitamente
    const disableSSL = process.env.DISABLE_SSL === 'true';
    
    // Para serviços como Neon DB, sempre usar SSL com rejectUnauthorized: false
    const useSSL = !disableSSL;
    
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
    const host = process.env.PGHOST || 'postgres';
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
}

/**
 * Inicializa o pool de conexões se ainda não existir
 */
function initPool() {
  if (!pool) {
    const config = getDbConfig();
    pool = new Pool(config);
    
    // Monitoramento de erros no pool
    pool.on('error', (err, client) => {
      console.error('Erro inesperado no pool do postgres:', err);
    });
  }
  
  return pool;
}

/**
 * Executa uma consulta SQL parametrizada
 * @param {string} text - Consulta SQL
 * @param {Array} params - Parâmetros para a consulta
 * @returns {Promise<Object>} Resultado da consulta
 */
async function query(text, params) {
  const pool = initPool();
  
  try {
    return await pool.query(text, params);
  } catch (error) {
    console.error('Erro ao executar consulta:', error.message);
    console.error('SQL:', text);
    console.error('Parâmetros:', params);
    throw error;
  }
}

/**
 * Obtém um cliente do pool para transações
 * @returns {Promise<Object>} Cliente do pool
 */
async function getClient() {
  const pool = initPool();
  const client = await pool.connect();
  
  // Monkey patch para adicionar métodos de controle de transação
  const originalRelease = client.release;
  
  // Sobrescrever release para detectar liberações tardias
  client.release = () => {
    originalRelease.call(client);
  };
  
  // Adicionar métodos de controle de transação
  client.transaction = async (callback) => {
    try {
      await client.query('BEGIN');
      const result = await callback(client);
      await client.query('COMMIT');
      return result;
    } catch (error) {
      await client.query('ROLLBACK');
      throw error;
    }
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
    return await client.transaction(callback);
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
    // Tentar buscar o timestamp do servidor e listar tabelas
    const timeResult = await query('SELECT NOW() as time');
    const tablesResult = await query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    
    return {
      connected: true,
      time: timeResult.rows[0].time,
      tables: tablesResult.rows.map(row => row.table_name)
    };
  } catch (error) {
    return {
      connected: false,
      error: error.message
    };
  }
}

/**
 * Fecha a pool de conexões (útil em testes ou encerramento)
 */
async function end() {
  if (pool) {
    await pool.end();
    pool = null;
  }
}

module.exports = {
  query,
  getClient,
  transaction,
  checkConnection,
  end
};