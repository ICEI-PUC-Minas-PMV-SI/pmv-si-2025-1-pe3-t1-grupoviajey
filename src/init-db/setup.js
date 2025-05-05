/**
 * Script de inicialização do banco de dados
 * Cria o schema inicial baseado nas definições
 */

const fs = require('fs');
const path = require('path');
const db = require('../shared/db');
const migrator = require('./migrator');

/**
 * Executa um arquivo SQL
 * @param {string} filepath - Caminho para o arquivo SQL
 * @returns {Promise<boolean>} Resultado da execução
 */
async function executeSqlFile(filepath) {
  try {
    console.log(`Executando arquivo SQL: ${path.basename(filepath)}`);
    
    // Ler conteúdo do arquivo
    const sql = fs.readFileSync(filepath, 'utf8');
    
    // Executar o SQL como uma transação
    await db.query(sql);
    
    console.log(`Arquivo SQL executado com sucesso: ${path.basename(filepath)}`);
    return true;
  } catch (error) {
    console.error(`Erro ao executar arquivo SQL: ${error.message}`);
    return false;
  }
}

/**
 * Verifica se o banco de dados já foi inicializado
 * @returns {Promise<boolean>} True se já inicializado
 */
async function isDatabaseInitialized() {
  try {
    // Verificar se a tabela de usuários existe
    const result = await db.query(
      "SELECT EXISTS (SELECT FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'users') as exists",
      []
    );
    
    return result.rows[0].exists;
  } catch (error) {
    console.error('Erro ao verificar inicialização do banco de dados:', error.message);
    return false;
  }
}

/**
 * Executa todas as migrações pendentes
 * @returns {Promise<boolean>} Resultado da execução
 */
async function runMigrations() {
  // Diretório de migrações
  const migrationsDir = path.join(__dirname, 'migrations');
  
  // Verificar se o diretório existe
  if (!fs.existsSync(migrationsDir)) {
    // Criar o diretório
    fs.mkdirSync(migrationsDir, { recursive: true });
    
    // Não há migrações para executar ainda
    return true;
  }
  
  // Listar arquivos de migração em ordem alfabética
  const migrations = fs.readdirSync(migrationsDir)
    .filter(file => file.endsWith('.sql'))
    .sort();
  
  // Se não houver migrações, criar uma inicial
  if (migrations.length === 0) {
    console.log('Nenhuma migração encontrada. Gerando migração inicial...');
    
    // Gerar SQL
    const sql = migrator.generateFullSchemaSql();
    
    // Salvar migração
    const filepath = migrator.saveMigration(sql);
    
    // Adicionar à lista de migrações
    migrations.push(path.basename(filepath));
  }
  
  // Executar cada migração
  for (const migration of migrations) {
    const migrationPath = path.join(migrationsDir, migration);
    
    const success = await executeSqlFile(migrationPath);
    if (!success) {
      console.error(`Falha ao executar migração: ${migration}`);
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
    // Verificar conexão
    const status = await db.checkConnection();
    
    if (!status.connected) {
      console.error('Falha na conexão com o banco de dados:', status.error);
      return false;
    }
    
    console.log('Conexão com o banco de dados estabelecida.');
    
    // Verificar se o banco já foi inicializado
    const initialized = await isDatabaseInitialized();
    
    if (initialized) {
      console.log('Banco de dados já inicializado. Verificando migrações...');
      
      // Executar migrações pendentes
      const migrationsResult = await runMigrations();
      
      if (!migrationsResult) {
        console.error('Falha ao executar migrações pendentes.');
        return false;
      }
      
      console.log('Migrações executadas com sucesso.');
      return true;
    }
    
    console.log('Banco de dados não inicializado. Criando schema...');
    
    // Executar migrações para criar o schema
    const result = await runMigrations();
    
    if (!result) {
      console.error('Falha ao criar schema inicial.');
      return false;
    }
    
    console.log('Schema criado com sucesso.');
    return true;
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error.message);
    return false;
  }
}

// Exportar função principal
module.exports = initializeDatabase;

// Se o script for executado diretamente
if (require.main === module) {
  initializeDatabase()
    .then(success => {
      if (success) {
        console.log('Banco de dados inicializado com sucesso!');
        process.exit(0);
      } else {
        console.error('Falha ao inicializar banco de dados. Veja os erros acima.');
        process.exit(1);
      }
    })
    .catch(error => {
      console.error('Erro fatal durante inicialização do banco de dados:', error);
      process.exit(1);
    });
}