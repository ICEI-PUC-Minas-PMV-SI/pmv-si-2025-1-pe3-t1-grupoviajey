#!/bin/bash

# Verifique e force a porta 3000
export PORT=3000

# Mate qualquer processo anterior usando a porta 3000
echo "Verificando se há processos existentes na porta 3000..."
fuser -k 3000/tcp 2>/dev/null || true

# Crie o arquivo .env se não existir
if [ ! -f .env ]; then
  echo "Criando arquivo .env padrão..."
  echo "PORT=3000" > .env
fi

echo "Iniciando servidor na porta 3000..."
node server.js