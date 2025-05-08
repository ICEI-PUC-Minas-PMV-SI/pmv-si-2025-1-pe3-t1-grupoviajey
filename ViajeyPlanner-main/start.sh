#!/bin/bash

# Script para iniciar o servidor com inicialização do banco de dados

# Inicializar banco de dados
echo "Inicializando banco de dados..."
node init-db.js

# Status de saída do comando anterior
DB_INIT_STATUS=$?

if [ $DB_INIT_STATUS -ne 0 ]; then
  echo "Aviso: Inicialização do banco de dados falhou (código $DB_INIT_STATUS), mas tentando iniciar servidor mesmo assim..."
else
  echo "Banco de dados inicializado com sucesso!"
fi

# Iniciar servidor
echo "Iniciando servidor..."
exec node server.js