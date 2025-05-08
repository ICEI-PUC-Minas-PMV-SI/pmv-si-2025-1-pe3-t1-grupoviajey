/**
 * Gerador de migrações SQL para o banco de dados
 * Converte o schema definido em JavaScript para comandos SQL
 */

const fs = require('fs');
const path = require('path');
const { schema } = require('../shared/schema');

/**
 * Converte um objeto de definição de coluna para SQL
 * @param {string} columnName - Nome da coluna
 * @param {Object} definition - Definição da coluna
 * @returns {string} Definição SQL da coluna
 */
function columnToSql(columnName, definition) {
  // Ignorar propriedade de índices
  if (columnName === 'indexes') return null;
  
  let sql = `"${columnName}" `;
  
  // Tipo de dados
  if (definition.type) {
    // Se o tipo tem comprimento
    if (definition.length) {
      sql += `${definition.type}(${definition.length})`;
    } 
    // Se o tipo tem precisão e escala
    else if (definition.precision !== undefined && definition.scale !== undefined) {
      sql += `${definition.type}(${definition.precision},${definition.scale})`;
    } 
    // Tipo simples
    else {
      sql += definition.type;
    }
  }
  
  // Restrições de nulidade
  if (definition.nullable === false) {
    sql += ' NOT NULL';
  }
  
  // Valor padrão
  if (definition.default !== undefined) {
    sql += ` DEFAULT ${definition.default}`;
  }
  
  // Restrição de chave primária
  if (definition.primaryKey) {
    sql += ' PRIMARY KEY';
  }
  
  // Restrição de unicidade
  if (definition.unique) {
    sql += ' UNIQUE';
  }
  
  // Restrição de chave estrangeira
  if (definition.references) {
    sql += ` REFERENCES "${definition.references.table}"("${definition.references.column}")`;
    
    // Ação em caso de exclusão
    if (definition.onDelete) {
      sql += ` ON DELETE ${definition.onDelete}`;
    }
  }
  
  // Restrição check
  if (definition.check) {
    sql += ` CHECK (${definition.check})`;
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
  const columnDefinitions = [];
  
  // Gerar definições de colunas
  for (const columnName in tableDefinition) {
    if (columnName !== 'indexes') {
      const colSql = columnToSql(columnName, tableDefinition[columnName]);
      if (colSql) {
        columnDefinitions.push(colSql);
      }
    }
  }
  
  // Montar SQL completo da tabela
  return `
CREATE TABLE IF NOT EXISTS "${tableName}" (
  ${columnDefinitions.join(',\n  ')}
);`;
}

/**
 * Gera SQL para criar índices para uma tabela
 * @param {string} tableName - Nome da tabela
 * @param {Object} tableDefinition - Definição da tabela
 * @returns {string} SQL para criar índices
 */
function generateCreateIndexes(tableName, tableDefinition) {
  if (!tableDefinition.indexes || !Array.isArray(tableDefinition.indexes)) {
    return '';
  }
  
  const indexSql = [];
  
  // Gerar SQL para cada índice
  tableDefinition.indexes.forEach((index, i) => {
    if (!index.columns || !index.columns.length) return;
    
    const indexName = index.name || `idx_${tableName}_${index.columns.join('_')}`;
    const indexType = index.type || 'btree';
    const uniqueClause = index.unique ? 'UNIQUE ' : '';
    const columnsClause = index.columns.map(col => `"${col}"`).join(', ');
    
    indexSql.push(`
CREATE ${uniqueClause}INDEX IF NOT EXISTS "${indexName}" ON "${tableName}" USING ${indexType} (${columnsClause});`);
  });
  
  return indexSql.join('');
}

/**
 * Gera o SQL completo para criar todas as tabelas
 * @returns {string} SQL completo
 */
function generateFullSchemaSql() {
  let sql = `-- Schema do banco de dados Viajey
-- Gerado automaticamente em ${new Date().toISOString()}

BEGIN;

`;
  
  // Primeiro, criar todas as tabelas
  for (const tableName in schema) {
    sql += generateCreateTable(tableName, schema[tableName]);
    sql += '\n';
  }
  
  // Depois, criar todos os índices
  for (const tableName in schema) {
    const indexesSql = generateCreateIndexes(tableName, schema[tableName]);
    if (indexesSql) {
      sql += indexesSql;
      sql += '\n';
    }
  }
  
  sql += `
COMMIT;
`;
  
  return sql;
}

/**
 * Salva o SQL gerado como um arquivo de migração
 * @param {string} sql - SQL gerado
 */
function saveMigration(sql) {
  // Criar diretório de migrações se não existir
  const migrationsDir = path.join(__dirname, 'migrations');
  if (!fs.existsSync(migrationsDir)) {
    fs.mkdirSync(migrationsDir, { recursive: true });
  }
  
  // Gerar nome do arquivo com timestamp
  const timestamp = new Date().toISOString().replace(/[^0-9]/g, '').substring(0, 14);
  const filename = `${timestamp}_initial_schema.sql`;
  const filepath = path.join(migrationsDir, filename);
  
  // Salvar arquivo
  fs.writeFileSync(filepath, sql);
  
  return filepath;
}

// Exportar funções
module.exports = {
  generateFullSchemaSql,
  saveMigration
};

// Se o script for executado diretamente, gerar e salvar a migração
if (require.main === module) {
  console.log('Gerando migração...');
  const sql = generateFullSchemaSql();
  const filepath = saveMigration(sql);
  console.log(`Migração salva em: ${filepath}`);
}