#!/bin/bash

# Script robusto para iniciar o servidor Viajey
# Este script garante que:
# 1. A porta 3000 está livre
# 2. As variáveis de ambiente estão configuradas
# 3. O servidor é iniciado e fica em execução

# Definir as configurações
export PORT=3000
echo "Configurando variáveis de ambiente..."

# Verificar processos existentes na porta 3000
echo "Verificando se há processos existentes na porta 3000..."
pkill -f "node.*server.js" || true

# Aguardar a liberação da porta
sleep 1

# Iniciar o servidor em processo separado
echo "Iniciando servidor Viajey na porta 3000..."
nohup node server.js > detailed-server.log 2>&1 &

# Salvar o PID
SERVER_PID=$!
echo $SERVER_PID > server.pid
echo "Servidor iniciado com PID: $SERVER_PID"

# Aguardar para verificar se o servidor permanece em execução
sleep 3
if ps -p $SERVER_PID > /dev/null; then
    echo "Servidor rodando com sucesso!"
    echo "Para verificar logs, execute: tail -f detailed-server.log"
else
    echo "Erro ao iniciar o servidor. Verifique detailed-server.log para detalhes."
    exit 1
fi