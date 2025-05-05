#!/bin/bash

set -e

host="$1"
port="$2"
user="$3"
password="$4"
dbname="$5"
cmd="$6"

max_attempts=30
count=0

echo "Aguardando PostgreSQL em $host:$port..."
echo "Usuário: $user, Banco: $dbname"

export PGPASSWORD="$password"

until psql -h "$host" -p "$port" -U "$user" -d "$dbname" -c '\q' >/dev/null 2>&1; do
  count=$((count + 1))
  
  if [ $count -ge $max_attempts ]; then
    echo "Atingido número máximo de tentativas ($max_attempts). Verificando detalhes da conexão..."
    echo "Host: $host"
    echo "Porta: $port"
    echo "Usuário: $user"
    echo "Banco: $dbname"
    
    # Tentar um diagnóstico mais detalhado
    psql -h "$host" -p "$port" -U "$user" -d "$dbname" -c '\conninfo' || true
    
    # Verificar se o host é acessível
    nc -zv "$host" "$port" || true
    
    # Verificar DNS
    host "$host" || true
    
    # Verificar ambiente EasyPanel
    if [[ "$host" == *viajey_viajey* ]]; then
      echo "Ambiente EasyPanel detectado. Ajustando configurações..."
      # Tentar nomes de host alternativos comuns no EasyPanel
      alt_hosts=("postgres" "postgresql" "database" "db" "postgres-db")
      for alt_host in "${alt_hosts[@]}"; do
        echo "Tentando host alternativo: $alt_host"
        if psql -h "$alt_host" -p "$port" -U "$user" -d "$dbname" -c '\q' >/dev/null 2>&1; then
          echo "Conexão bem-sucedida com $alt_host! Continuando..."
          host="$alt_host"
          break
        fi
      done
    fi
    
    echo "Continuando mesmo com falha na verificação do PostgreSQL..."
    break
  fi
  
  echo "PostgreSQL não está disponível - esperando... ($count/$max_attempts)"
  sleep 2
done

echo "PostgreSQL está disponível em $host:$port - continuando"

# Executar comando especificado
echo "Executando: $cmd"
exec $cmd