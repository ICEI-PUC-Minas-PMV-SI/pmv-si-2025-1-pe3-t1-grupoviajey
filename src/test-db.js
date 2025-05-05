/**
 * Script de teste de conexão com o banco de dados
 * Executa uma consulta simples para verificar a conexão
 */
require('dotenv').config();
const { Client } = require('pg');

async function testConnection() {
  console.log('Testando conexão com o banco de dados PostgreSQL...');
  
  try {
    // Obtendo as variáveis de ambiente
    const DATABASE_URL = process.env.DATABASE_URL;
    const PGPORT = process.env.PGPORT;
    const PGUSER = process.env.PGUSER;
    const PGPASSWORD = process.env.PGPASSWORD;
    const PGDATABASE = process.env.PGDATABASE;
    const PGHOST = process.env.PGHOST;
    
    if (!DATABASE_URL) {
      console.error('Erro: Variável de ambiente DATABASE_URL não está definida!');
      process.exit(1);
    }
    
    // Mostrar informações (sem credenciais)
    console.log('\nInformações de conexão:');
    console.log(`- Host: ${PGHOST || 'Não definido (usando URI)'}`);
    console.log(`- Porta: ${PGPORT || 'Não definido (usando URI)'}`);
    console.log(`- Banco: ${PGDATABASE || 'Não definido (usando URI)'}`);
    console.log(`- Usuário: ${PGUSER ? 'Definido (não exibido)' : 'Não definido (usando URI)'}`);
    console.log(`- String de conexão: ${DATABASE_URL ? 'Definida (não exibida)' : 'Não definida'}`);
    
    // Criar cliente com URI diretamente
    const client = new Client({
      connectionString: DATABASE_URL,
      ssl: {
        rejectUnauthorized: false // Necessário para alguns provedores como Heroku
      }
    });
    
    // Conectar
    console.log('\nConectando ao PostgreSQL...');
    await client.connect();
    
    // Executar query simples
    console.log('Executando consulta...');
    const result = await client.query('SELECT NOW() as time');
    
    console.log(`\nConexão bem sucedida! Horário do servidor: ${result.rows[0].time}`);
    
    // Listar tabelas
    console.log('\nListando tabelas existentes:');
    const tablesResult = await client.query(
      "SELECT table_name FROM information_schema.tables WHERE table_schema = 'public' ORDER BY table_name"
    );
    
    if (tablesResult.rows.length === 0) {
      console.log('Nenhuma tabela encontrada.');
    } else {
      tablesResult.rows.forEach(row => {
        console.log(`- ${row.table_name}`);
      });
    }
    
    // Fechar conexão
    await client.end();
    console.log('\nTeste de conexão concluído com sucesso!');
  } catch (error) {
    console.error('\nErro na conexão com o banco de dados:');
    console.error(error.message);
    process.exit(1);
  }
}

// Executar teste
testConnection();