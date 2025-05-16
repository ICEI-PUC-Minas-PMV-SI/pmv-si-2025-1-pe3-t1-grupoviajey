#!/bin/bash

# Script para manter o servidor rodando indefinidamente
# Este script verifica periodicamente se o servidor está ativo
# e o reinicia se necessário

echo "Iniciando serviço de monitoramento do servidor Viajey..."
touch server.monitor.log

while true; do
  # Verificar se o servidor está rodando
  if ! pgrep -f "node server.js" > /dev/null; then
    echo "[$(date)] Servidor não encontrado, iniciando..." >> server.monitor.log
    
    # Matar qualquer processo que ainda possa estar na porta 3000
    pkill -f "node.*server.js" || true
    
    # Garantir que a porta 3000 seja utilizada
    export PORT=3000
    
    # Iniciar o servidor
    nohup node server.js >> detailed-server.log 2>&1 &
    
    # Guardar PID
    echo $! > server.pid
    echo "[$(date)] Servidor iniciado com PID: $(cat server.pid)" >> server.monitor.log
    
    # Aguardar inicialização
    sleep 5
  else
    # Servidor está rodando, verificar logs
    echo "[$(date)] Servidor Viajey rodando corretamente." >> server.monitor.log
  fi
  
  # Aguardar antes da próxima verificação
  sleep 10
done