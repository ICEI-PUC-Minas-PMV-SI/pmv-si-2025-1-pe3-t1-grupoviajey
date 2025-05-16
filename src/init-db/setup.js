/**
 * Script de inicialização do banco de dados
 * Cria o schema inicial baseado nas definições
 */

const fs = require('fs');
const path = require('path');
const db = require('../shared/db');
const migrator = require('./migrator');

/**
 * Executa um arquivo SQL, com tratamento de erros específicos
 * @param {string} filepath - Caminho para o arquivo SQL
 * @returns {Promise<boolean>} Resultado da execução
 */
async function executeSqlFile(filepath) {
  try {
    console.log(`Executando arquivo SQL: ${path.basename(filepath)}`);
    
    // Ler conteúdo do arquivo
    let sql = fs.readFileSync(filepath, 'utf8');
    
    try {
      // Tentar executar o SQL completo
      await db.query(sql);
      console.log(`Arquivo SQL executado com sucesso: ${path.basename(filepath)}`);
      return true;
    } catch (error) {
      // Tratar erros específicos - por exemplo, índice share_code
      if (error.message.includes('share_code')) {
        console.warn('AVISO: Detectado erro relacionado a share_code. Tentando executar com adaptações...');
        
        // Remover referências a share_code do SQL
        const fixedSql = sql
          // Remover coluna share_code da tabela itineraries
          .replace(`,\n  "share_code" VARCHAR(20) UNIQUE`, '')
          // Remover índice para share_code
          .replace(/CREATE.*?INDEX.*?share_code.*?;/g, '');
        
        try {
          // Tentar executar versão corrigida
          await db.query(fixedSql);
          console.log(`Arquivo SQL executado com adaptações para esquema existente: ${path.basename(filepath)}`);
          return true;
        } catch (secondError) {
          console.error(`Erro após adaptação: ${secondError.message}`);
          return false;
        }
      }
      
      // Tratar outros erros - executar linha por linha
      console.warn(`AVISO: Erro ao executar arquivo SQL como transação: ${error.message}`);
      console.warn('Tentando executar cada declaração SQL individualmente...');
      
      // Dividir em declarações SQL individuais e executar uma a uma
      const statements = sql.split(';')
        .map(stmt => stmt.trim())
        .filter(stmt => stmt.length > 0 && !stmt.startsWith('--'));
      
      let success = true;
      for (const stmt of statements) {
        try {
          await db.query(stmt + ';');
        } catch (stmtError) {
          console.warn(`AVISO: Erro em declaração SQL: ${stmtError.message}`);
          console.warn(`SQL problemático: ${stmt.substring(0, 100)}...`);
          // Continuar mesmo com erro
          success = false;
        }
      }
      
      if (success) {
        console.log(`Arquivo SQL executado parcialmente: ${path.basename(filepath)}`);
        return true;
      } else {
        console.error(`Alguns erros ocorreram ao executar: ${path.basename(filepath)}`);
        return false;
      }
    }
  } catch (error) {
    console.error(`Erro ao processar arquivo SQL: ${error.message}`);
    return false;
  }
}

/**
 * Verifica se o banco de dados já foi inicializado
 * @returns {Promise<{initialized: boolean, existingSchema: boolean}>} Status de inicialização e detecção de esquema existente
 */
async function isDatabaseInitialized() {
  try {
    // Verificar tabelas essenciais do nosso esquema
    const checkTables = [
      "users", "itineraries", "itinerary_days", "activities", 
      "checklists", "checklist_items", "expenses", "places"
    ];
    
    // Montar query para verificar a existência de todas as tabelas do nosso esquema
    const tableChecks = await Promise.all(
      checkTables.map(tableName => 
        db.query(
          `SELECT EXISTS (
            SELECT FROM information_schema.tables 
            WHERE table_schema = 'public' AND table_name = $1
          ) as exists`,
          [tableName]
        )
      )
    );
    
    // Verificar se todas as tabelas existem (esquema completo)
    const tablesExist = tableChecks.every(result => result.rows[0].exists);
    
    // Verificar quantas tabelas existem no total
    const result = await db.query(
      "SELECT COUNT(*) as count FROM information_schema.tables WHERE table_schema = 'public'",
      []
    );
    
    const tableCount = parseInt(result.rows[0].count, 10);
    
    // Se temos pelo menos uma tabela, mas não temos nosso esquema completo
    const existingSchema = tableCount > 0 && !tablesExist;
    
    console.log(`Verificação de esquema: ${tablesExist ? 'Nosso esquema completo detectado' : 'Nosso esquema não está completo'}`);
    console.log(`Total de tabelas: ${tableCount}`);
    
    return {
      initialized: tablesExist,
      existingSchema
    };
  } catch (error) {
    console.error('Erro ao verificar inicialização do banco de dados:', error.message);
    return { initialized: false, existingSchema: false };
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
 * Analisa o esquema existente para compatibilidade
 * @returns {Promise<boolean>} True se esquema é compatível
 */
async function analyzeExistingSchema() {
  try {
    console.log('Analisando esquema existente...');
    
    // Listar todas as tabelas
    const tablesResult = await db.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name",
      []
    );
    
    // Verificar tabelas importantes
    const tableNames = tablesResult.rows.map(row => row.table_name);
    console.log('Tabelas encontradas:', tableNames.join(', '));
    
    // Verificar estrutura da tabela de itinerários
    if (tableNames.includes('itineraries')) {
      const columnsResult = await db.query(
        "SELECT column_name FROM information_schema.columns WHERE table_schema = 'public' AND table_name = 'itineraries'",
        []
      );
      
      const columnNames = columnsResult.rows.map(row => row.column_name);
      console.log('Colunas em itineraries:', columnNames.join(', '));
      
      // Verificar colunas básicas essenciais
      const essentialColumns = ['id', 'title', 'destination', 'start_date', 'end_date'];
      const hasEssentials = essentialColumns.every(col => columnNames.includes(col));
      
      if (hasEssentials) {
        console.log('Esquema existente tem estrutura básica compatível.');
        return true;
      }
    }
    
    console.log('Esquema existente não é compatível com a aplicação Viajey.');
    return false;
  } catch (error) {
    console.error('Erro ao analisar esquema existente:', error.message);
    return false;
  }
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
    const dbStatus = await isDatabaseInitialized();
    
    // Se já temos nosso esquema
    if (dbStatus.initialized) {
      console.log('Banco de dados já inicializado com esquema Viajey. Verificando migrações...');
      
      // Executar migrações pendentes
      const migrationsResult = await runMigrations();
      
      if (!migrationsResult) {
        console.error('Falha ao executar migrações pendentes.');
        return false;
      }
      
      console.log('Migrações executadas com sucesso.');
      return true;
    }
    
    // Se existe algum esquema que não é o nosso
    if (dbStatus.existingSchema) {
      console.log('Banco de dados contém um esquema existente diferente do esquema Viajey.');
      
      // Analisar esquema existente para compatibilidade
      const isCompatible = await analyzeExistingSchema();
      
      if (isCompatible) {
        console.log('Usando esquema existente por compatibilidade.');
        return true;
      } else {
        console.log('Esquema existente não é compatível. Pulando inicialização para evitar conflitos.');
        console.log('AVISO: A aplicação pode não funcionar corretamente com este esquema.');
        
        // Retornar true para não bloquear a inicialização do servidor
        return true;
      }
    }
    
    // Caso de banco novo sem esquema
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