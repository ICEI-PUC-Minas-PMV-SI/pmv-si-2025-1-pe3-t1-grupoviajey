/**
 * Script para inicialização independente do banco de dados
 * Pode ser executado diretamente para criar tabelas e verificar conexão
 */

// Carregar variáveis de ambiente
require('dotenv').config();

// Importar script de inicialização
const initializeDatabase = require('./init-db/setup');

// Função principal
async function main() {
  try {
    // Inicializar banco de dados
    const success = await initializeDatabase();
    
    // Sair com código de status apropriado
    process.exit(success ? 0 : 1);
  } catch (err) {
    console.error('Erro fatal:', err);
    process.exit(1);
  }
}

// Executar
main();