#!/bin/bash

# Encerrar qualquer processo de node em execução
killall node 2>/dev/null

# Iniciar o servidor
echo "Iniciando servidor Node.js..."
node server.js