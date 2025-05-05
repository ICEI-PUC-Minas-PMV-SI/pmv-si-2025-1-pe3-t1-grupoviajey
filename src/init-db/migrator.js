/**
 * Gerador de migrações SQL para o banco de dados
 * Converte o schema definido em JavaScript para comandos SQL
 */

const fs = require('fs');
const path = require('path');
const schema = require('../shared/schema');

/**
 * Converte um objeto de definição de coluna para SQL
 * @param {string} columnName - Nome da coluna
 * @param {Object} definition - Definição da coluna
 * @returns {string} Definição SQL da coluna
 */
function columnToSql(columnName, definition) {
  let sql = `${columnName} ${definition.type}`;
  
  if (definition.primaryKey) {
    sql += ' PRIMARY KEY';
  }
  
  if (definition.notNull) {
    sql += ' NOT NULL';
  }
  
  if (definition.unique) {
    sql += ' UNIQUE';
  }
  
  if (definition.defaultValue) {
    sql += ` DEFAULT ${definition.defaultValue}`;
  }
  
  return sql;
}

/**
 * Gera SQL para criar uma tabela com suas colunas e restrições
 * @param {string} tableName - Nome da tabela
 * @param {Object} tableDefinition - Definição da tabela
 * @returns {string} SQL para criar a tabela
 */
function generateCreateTable(tableName, tableDefinition) {
  // Converter colunas para SQL
  const columns = Object.entries(tableDefinition)
    .filter(([name, def]) => !['unique', 'index'].includes(name))
    .map(([columnName, definition]) => {
      return columnToSql(columnName, definition);
    });
    
  // Adicionar chaves estrangeiras
  const foreignKeys = Object.entries(tableDefinition)
    .filter(([_, def]) => def.references)
    .map(([columnName, definition]) => {
      let fkSql = `FOREIGN KEY (${columnName}) REFERENCES ${definition.references.table}(${definition.references.column})`;
      
      if (definition.onDelete) {
        fkSql += ` ON DELETE ${definition.onDelete}`;
      }
      
      return fkSql;
    });
  
  // Adicionar restrições de unicidade compostas
  const uniqueConstraints = [];
  if (tableDefinition.unique) {
    if (Array.isArray(tableDefinition.unique[0])) {
      // Múltiplas restrições únicas
      tableDefinition.unique.forEach((columns, index) => {
        uniqueConstraints.push(`UNIQUE (${columns.join(', ')})`);
      });
    } else {
      // Uma única restrição única
      uniqueConstraints.push(`UNIQUE (${tableDefinition.unique.join(', ')})`);
    }
  }
  
  // Combinar todas as partes
  const allDefinitions = [...columns, ...foreignKeys, ...uniqueConstraints];
  
  return `
CREATE TABLE IF NOT EXISTS ${tableName} (
  ${allDefinitions.join(',\n  ')}
);`;
}

/**
 * Gera SQL para criar índices para uma tabela
 * @param {string} tableName - Nome da tabela
 * @param {Object} tableDefinition - Definição da tabela
 * @returns {string} SQL para criar índices
 */
function generateCreateIndexes(tableName, tableDefinition) {
  if (!tableDefinition.index) {
    return '';
  }
  
  let indexSql = '';
  
  if (Array.isArray(tableDefinition.index)) {
    // Lista de índices
    tableDefinition.index.forEach((indexDef, i) => {
      if (typeof indexDef === 'string') {
        // Índice simples em uma coluna
        indexSql += `\nCREATE INDEX IF NOT EXISTS idx_${tableName}_${indexDef} ON ${tableName}(${indexDef});`;
      } else if (Array.isArray(indexDef)) {
        // Índice composto
        const indexName = `idx_${tableName}_${indexDef.join('_')}`;
        indexSql += `\nCREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${indexDef.join(', ')});`;
      }
    });
  } else {
    // Objeto de definição de índices
    for (const [indexName, indexColumns] of Object.entries(tableDefinition.index)) {
      const columns = Array.isArray(indexColumns) ? indexColumns.join(', ') : indexColumns;
      indexSql += `\nCREATE INDEX IF NOT EXISTS ${indexName} ON ${tableName}(${columns});`;
    }
  }
  
  return indexSql;
}

/**
 * Gera o SQL completo para criar todas as tabelas
 * @returns {string} SQL completo
 */
function generateFullSchemaSql() {
  let sql = '-- Migração gerada automaticamente\n';
  
  // Adicionar controle de transação
  sql += 'BEGIN;\n';
  
  // Criar cada tabela
  for (const [tableName, tableDefinition] of Object.entries(schema)) {
    sql += generateCreateTable(tableName, tableDefinition);
    sql += '\n';
    
    // Adicionar índices
    const indexesSql = generateCreateIndexes(tableName, tableDefinition);
    if (indexesSql) {
      sql += indexesSql;
      sql += '\n';
    }
  }
  
  // Finalizar transação
  sql += 'COMMIT;\n';
  
  return sql;
}

/**
 * Salva o SQL gerado como um arquivo de migração
 * @param {string} sql - SQL gerado
 */
function saveMigration(sql) {
  const timestamp = new Date().toISOString().replace(/[-:]/g, '').split('.')[0];
  const filename = `${timestamp}_initial_schema.sql`;
  const filepath = path.join(__dirname, 'migrations', filename);
  
  // Criar diretório de migrações se não existir
  const migrationDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationDir)) {
    fs.mkdirSync(migrationDir, { recursive: true });
  }
  
  // Salvar o arquivo
  fs.writeFileSync(filepath, sql);
  console.log(`Migração salva em: ${filepath}`);
  
  return filepath;
}

// Executar se for chamado diretamente
if (require.main === module) {
  console.log('Gerando migração SQL a partir do schema...');
  const sql = generateFullSchemaSql();
  const filepath = saveMigration(sql);
  console.log('Migração gerada com sucesso!');
}

// Exportar funções
module.exports = {
  generateFullSchemaSql,
  saveMigration
};