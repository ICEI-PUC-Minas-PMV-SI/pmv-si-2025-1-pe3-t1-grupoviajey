/**
 * Módulo para gerenciar a conexão com o banco de dados PostgreSQL
 * e fornecer funções utilitárias para consultas
 */

const { Pool } = require('pg');

// Configurar conexão PostgreSQL
const getDbConfig = () => {
  console.log('Configurando conexão com PostgreSQL (db/index.js)...');
  
  // Obter string de conexão da variável de ambiente ou usar valor padrão para EasyPanel
  const connectionString = process.env.DATABASE_URL || 'postgres://viajey:viajey@viajey_viajey:5432/viajey?sslmode=disable';
  
  // Tratar conexões no formato EasyPanel
  let dbConfig = {};
  
  // Verificar se é uma string de conexão Postgres (formato URI)
  if (connectionString && connectionString.startsWith('postgres')) {
    console.log(`Usando string de conexão do tipo URI`);
    
    // Verificar se SSL deve ser desativado explicitamente
    // Tanto pelo parâmetro na URL quanto pela variável de ambiente
    const disableSSL = process.env.DISABLE_SSL === 'true' || 
                     connectionString.includes('sslmode=disable');
    
    // Para EasyPanel em ambiente Docker, geralmente desabilitar SSL é necessário
    const useSSL = !disableSSL;
    
    // Log da decisão de SSL (sem exibir a string completa por segurança)
    console.log(`Modo SSL: ${useSSL ? 'ATIVADO' : 'DESATIVADO'}`);
    
    // Suporte especial para formato EasyPanel (viajey_viajey como hostname)
    if (connectionString.includes('viajey_viajey')) {
      console.log('Detectada string de conexão no formato EasyPanel');
    }
    
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

// Criar pool de conexões PostgreSQL
const pool = new Pool(getDbConfig());

// Interceptar erros na pool
pool.on('error', (err) => {
  console.error('Erro inesperado na pool de conexões do PostgreSQL', err);
});

/**
 * Executa uma consulta SQL com parâmetros
 * 
 * @param {string} text - Consulta SQL
 * @param {Array} params - Parâmetros para a consulta
 * @returns {Promise} Resultado da consulta
 */
const query = async (text, params) => {
  const start = Date.now();
  try {
    const res = await pool.query(text, params);
    const duration = Date.now() - start;
    
    // Log para queries demoradas (mais de 500ms)
    if (duration > 500) {
      console.log('Consulta lenta:', { text, params, duration, rows: res.rowCount });
    }
    
    return res;
  } catch (error) {
    console.error('Erro ao executar query:', { text, params, error });
    throw error;
  }
};

/**
 * Obtém um cliente da pool para executar transações
 * 
 * @returns {Object} Cliente da pool e função para liberar
 */
const getClient = async () => {
  const client = await pool.connect();
  const originalQuery = client.query;
  const release = client.release;
  
  // Contabilizar tempo de uso do cliente
  const timeout = setTimeout(() => {
    console.error('Cliente da pool possivelmente vazado, query demorada');
  }, 30000);
  
  // Sobrescrever método de liberação
  client.release = () => {
    clearTimeout(timeout);
    client.release = release;
    return release.apply(client);
  };
  
  // Sobrescrever método de query para logs
  client.query = (...args) => {
    return originalQuery.apply(client, args);
  };
  
  return client;
};

/**
 * Executa múltiplas consultas em uma única transação
 * 
 * @param {Function} callback - Função que recebe o cliente e executa as queries
 * @returns {Promise} Resultado da última operação da transação
 */
const transaction = async (callback) => {
  const client = await getClient();
  try {
    await client.query('BEGIN');
    const result = await callback(client);
    await client.query('COMMIT');
    return result;
  } catch (error) {
    await client.query('ROLLBACK');
    throw error;
  } finally {
    client.release();
  }
};

// Exportar funções e pool
module.exports = {
  pool,
  query,
  getClient,
  transaction,
  getDbConfig
};