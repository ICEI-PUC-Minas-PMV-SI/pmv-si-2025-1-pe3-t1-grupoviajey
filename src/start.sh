#!/bin/bash

# Verificar se node está instalado
if ! command -v node &> /dev/null; then
    echo "Node.js não encontrado. Por favor, instale o Node.js."
    exit 1
fi

# Verificar se o arquivo server.js existe
if [ ! -f server.js ]; then
    echo "Arquivo server.js não encontrado."
    exit 1
fi

# Verificar se os módulos estão instalados
if [ ! -d "node_modules" ]; then
    echo "Instalando dependências..."
    npm install
fi

# Encerrar qualquer instância anterior
pkill -f "node server.js" || true

# Configurar a chave da API do Google Maps como variável de ambiente
export GOOGLE_MAPS_API_KEY="AIzaSyD7M0OUg3wzN6p1J5Onzix7o3KmsBQRMAo"

# Definir a porta para o servidor
export PORT=5000

# Iniciar o servidor
echo "Iniciando o servidor Node.js na porta $PORT..."
node server.js