/**
 * Script de inicialização do banco de dados
 * Cria o schema inicial baseado nas definições
 */

const path = require('path');
const fs = require('fs');
const db = require('../shared/db');
const migrator = require('./migrator');

/**
 * Executa um arquivo SQL
 * @param {string} filepath - Caminho para o arquivo SQL
 * @returns {Promise<boolean>} Resultado da execução
 */
async function executeSqlFile(filepath) {
  try {
    console.log(`Executando arquivo SQL: ${filepath}`);
    const sql = fs.readFileSync(filepath, 'utf8');
    
    // Dividir o SQL por quebras de linha e filtrar comentários e linhas vazias
    const queries = sql
      .split('\n')
      .filter(line => !line.trim().startsWith('--') && line.trim() !== '')
      .join('\n');
    
    // Executar as queries
    await db.query(queries);
    
    console.log(`Arquivo SQL executado com sucesso: ${filepath}`);
    return true;
  } catch (err) {
    console.error(`Erro ao executar arquivo SQL: ${filepath}`, err);
    return false;
  }
}

/**
 * Verifica se o banco de dados já foi inicializado
 * @returns {Promise<boolean>} True se já inicializado
 */
async function isDatabaseInitialized() {
  try {
    const result = await db.query(`
      SELECT EXISTS (
        SELECT FROM information_schema.tables 
        WHERE table_schema = 'public' 
        AND table_name = 'users'
      ) as exists
    `);
    
    return result.rows[0].exists;
  } catch (err) {
    console.error('Erro ao verificar inicialização do banco de dados:', err);
    return false;
  }
}

/**
 * Executa todas as migrações pendentes
 * @returns {Promise<boolean>} Resultado da execução
 */
async function runMigrations() {
  const migrationsDir = path.join(__dirname, 'migrations');
  
  // Verificar se o diretório de migrações existe
  if (!fs.existsSync(migrationsDir)) {
    console.log('Diretório de migrações não encontrado, criando...');
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // Listar arquivos de migração
  const migrationFiles = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  // Se não há migrações, gerar uma nova
  if (migrationFiles.length === 0) {
    console.log('Nenhuma migração encontrada, gerando nova migração...');
    const sql = migrator.generateFullSchemaSql();
    const filepath = migrator.saveMigration(sql);
    
    // Adicionar o arquivo recém-criado à lista
    migrationFiles.push(path.basename(filepath));
  }
  
  console.log(`Encontradas ${migrationFiles.length} migrações para executar.`);
  
  // Executar cada migração
  for (const file of migrationFiles) {
    const filepath = path.join(migrationsDir, file);
    const success = await executeSqlFile(filepath);
    
    if (!success) {
      console.error(`Falha ao executar migração: ${file}`);
      return false;
    }
  }
  
  return true;
}

/**
 * Inicializa o banco de dados
 */
async function initializeDatabase() {
  try {
    console.log('====================================================');
    console.log('VIAJEY - Inicialização do Banco de Dados');
    console.log('====================================================\n');
    
    // Verificar conexão com o banco
    console.log('Verificando conexão com o banco de dados...');
    const connectionStatus = await db.checkConnection();
    
    if (!connectionStatus.connected) {
      console.error('Falha na conexão com o banco de dados:', connectionStatus.error);
      return false;
    }
    
    console.log(`Conexão com o banco de dados estabelecida em: ${connectionStatus.time}`);
    
    // Verificar se o banco já está inicializado
    const isInitialized = await isDatabaseInitialized();
    
    if (isInitialized) {
      console.log('Banco de dados já foi inicializado anteriormente.');
      
      if (connectionStatus.tables && connectionStatus.tables.length > 0) {
        console.log('Tabelas existentes:');
        connectionStatus.tables.forEach(table => {
          console.log(`- ${table}`);
        });
      }
      
      // Perguntar se o usuário deseja executar migrações mesmo assim
      console.log('Executando migrações pendentes...');
      await runMigrations();
    } else {
      console.log('Banco de dados não inicializado, criando schema inicial...');
      const success = await runMigrations();
      
      if (!success) {
        console.error('Falha ao inicializar o banco de dados.');
        return false;
      }
      
      console.log('Banco de dados inicializado com sucesso!');
    }
    
    // Verificar estado final do banco
    const finalStatus = await db.checkConnection();
    console.log('\nVerificação final do banco de dados:');
    
    if (finalStatus.tables && finalStatus.tables.length > 0) {
      console.log('Tabelas disponíveis:');
      finalStatus.tables.forEach(table => {
        console.log(`- ${table}`);
      });
    } else {
      console.log('Nenhuma tabela encontrada após inicialização!');
    }
    
    console.log('\n====================================================');
    console.log('Inicialização concluída com sucesso!');
    console.log('====================================================');
    
    return true;
  } catch (err) {
    console.error('Erro fatal durante inicialização do banco de dados:', err);
    return false;
  } finally {
    // Fechar pool de conexões para encerrar o script
    await db.pool.end();
  }
}

// Executar se for chamado diretamente
if (require.main === module) {
  initializeDatabase()
    .then(success => {
      process.exit(success ? 0 : 1);
    })
    .catch(err => {
      console.error('Erro não tratado:', err);
      process.exit(1);
    });
}

// Exportar função para uso em outros módulos
module.exports = initializeDatabase;