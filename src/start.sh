#!/bin/bash

# Script para iniciar o servidor Node.js do Viajey
# Substitui a antiga configuração Python

echo "Iniciando Viajey em modo Node.js..."

# Definir variáveis de ambiente se não estiverem definidas
export PORT=${PORT:-5000}
export NODE_ENV=${NODE_ENV:-development}

# Encerrar qualquer processo Node.js em execução
pkill -f "node server.js" || true
pkill -f "node main.js" || true

# Iniciar o servidor
node main.js