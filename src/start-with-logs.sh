#!/bin/bash
# Inicia o servidor com redirecionamento de logs detalhados
# Mata qualquer processo anterior que esteja rodando na porta 3000
lsof -ti:3000 | xargs kill -9 2>/dev/null || true

# Remove logs antigos
rm -f detailed-server.log 2>/dev/null || true

# Inicia o servidor com redirecionamento de logs detalhados
node server.js > detailed-server.log 2>&1 &
echo $! > server.pid
echo "Servidor iniciado com PID $(cat server.pid)"
echo "Logs disponíveis em detailed-server.log"