/**
 * Script de inicialização do servidor Node.js
 * Este arquivo substitui a funcionalidade que estava em main.py,
 * tornando o projeto 100% JavaScript
 */

const { spawn } = require('child_process');
const express = require('express');
const path = require('path');

// Criar aplicativo Express simples para redirecionamento
const app = express();
const PORT = process.env.PORT || 5000;

// Variável para armazenar o processo do servidor
let serverProcess = null;

/**
 * Inicia o servidor Node.js (server.js)
 */
function startNodeServer() {
  try {
    // Encerrar processo existente se houver
    if (serverProcess) {
      console.log(`Encerrando processo existente (PID: ${serverProcess.pid})`);
      serverProcess.kill();
    }

    // Iniciar novo processo
    serverProcess = spawn('node', ['server.js'], {
      stdio: 'inherit', // Compartilhar stdout/stderr com o processo atual
      env: { ...process.env, PORT: 3000 } // Garantir que o servidor interno use a porta 3000
    });

    console.log(`Servidor Node.js iniciado com PID ${serverProcess.pid}`);

    // Monitorar processo
    serverProcess.on('close', (code) => {
      console.log(`Servidor Node.js encerrado com código ${code}`);
      serverProcess = null;
    });

    return true;
  } catch (error) {
    console.error(`Erro ao iniciar servidor Node.js: ${error.message}`);
    return false;
  }
}

// Configurar rota de redirecionamento
app.get('/', (req, res) => {
  // Iniciar servidor se necessário
  if (!serverProcess) {
    startNodeServer();
  }

  // Redirecionar para a porta do servidor interno
  res.send(`
    Redirecionando para o servidor...
    <script>
      window.location.href = window.location.protocol + '//' + window.location.hostname + ':3000';
    </script>
  `);
});

// Rota de status
app.get('/node-status', (req, res) => {
  if (!serverProcess) {
    res.send("Servidor Node.js não foi iniciado");
  } else {
    res.send(`Servidor Node.js está em execução (PID: ${serverProcess.pid})`);
  }
});

// Rota para iniciar o servidor manualmente
app.get('/start-node', (req, res) => {
  const success = startNodeServer();
  res.send(`Tentativa de iniciar servidor Node.js: ${success ? 'Sucesso' : 'Falha'}`);
});

// Iniciar servidor redirecionador e servidor Node.js
app.listen(PORT, '0.0.0.0', () => {
  console.log(`Servidor de redirecionamento iniciado na porta ${PORT}`);
  startNodeServer();
});

// Gerenciar limpeza em caso de encerramento
process.on('SIGINT', () => {
  if (serverProcess) {
    console.log(`Encerrando servidor Node.js (PID: ${serverProcess.pid})`);
    serverProcess.kill();
  }
  process.exit();
});

process.on('SIGTERM', () => {
  if (serverProcess) {
    console.log(`Encerrando servidor Node.js (PID: ${serverProcess.pid})`);
    serverProcess.kill();
  }
  process.exit();
});