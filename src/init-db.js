/**
 * Script para inicialização independente do banco de dados
 * Pode ser executado diretamente para criar tabelas e verificar conexão
 */

// Carregar variáveis de ambiente
require('dotenv').config();

// Importar módulo de inicialização
const dbInit = require('./db/init');

// Função principal
async function main() {
  console.log('====================================================');
  console.log('VIAJEY - Script de Inicialização do Banco de Dados');
  console.log('====================================================');
  console.log('');

  try {
    // Verificar conexão
    console.log('Verificando conexão com o banco de dados...');
    const status = await dbInit.checkDatabaseConnection();

    if (!status.connected) {
      console.error('Falha na conexão com o banco de dados:');
      console.error(status.error);
      console.error('\nInformações de conexão:');
      console.error(`- Host: ${status.connectionInfo.host}`);
      console.error(`- Porta: ${status.connectionInfo.port}`);
      console.error(`- Banco: ${status.connectionInfo.database}`);
      console.error(`- Usuário: ${status.connectionInfo.user}`);
      console.error(`- SSL: ${status.connectionInfo.ssl}`);
      console.error('\nVerifique as configurações e tente novamente.');
      process.exit(1);
    }

    console.log('✓ Conexão com o banco de dados estabelecida!');
    console.log(`  Timestamp do servidor: ${status.timestamp}`);
    console.log('');
    
    // Exibir variáveis de ambiente de conexão
    console.log('Variáveis de ambiente de conexão:');
    console.log(`- DATABASE_URL: ${process.env.DATABASE_URL ? '***' : 'não definido'}`);
    console.log(`- PGHOST: ${process.env.PGHOST || 'não definido'}`);
    console.log(`- PGPORT: ${process.env.PGPORT || 'não definido'}`);
    console.log(`- PGDATABASE: ${process.env.PGDATABASE || 'não definido'}`);
    console.log(`- PGUSER: ${process.env.PGUSER || 'não definido'}`);
    console.log('');

    // Listar tabelas existentes antes da inicialização
    if (status.tables && status.tables.length > 0) {
      console.log('Tabelas existentes antes da inicialização:');
      console.log(`- ${status.tables.join('\n- ')}`);
    } else {
      console.log('Nenhuma tabela encontrada no banco de dados.');
    }
    console.log('');

    // Inicializar banco de dados
    console.log('Iniciando criação/atualização das tabelas...');
    const success = await dbInit.initDatabase();

    if (!success) {
      console.error('Erro ao criar tabelas no banco de dados.');
      process.exit(1);
    }

    console.log('✓ Tabelas criadas/atualizadas com sucesso!');
    console.log('');

    // Verificar tabelas após inicialização
    const finalStatus = await dbInit.checkDatabaseConnection();
    
    console.log('Tabelas disponíveis após inicialização:');
    console.log(`- ${finalStatus.tables.join('\n- ')}`);
    console.log('');
    
    console.log('====================================================');
    console.log('✓ Banco de dados inicializado com sucesso!');
    console.log('====================================================');
    
    process.exit(0);
  } catch (error) {
    console.error('\nErro fatal durante a inicialização do banco de dados:');
    console.error(error);
    process.exit(1);
  }
}

// Executar
main();