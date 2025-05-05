#!/bin/bash

set -e

# Parâmetros
host="$1"
port="$2"
user="$3"
password="$4"
dbname="$5"
cmd="$6"

# Configurações
max_attempts=30
count=0

echo "Aguardando PostgreSQL em $host:$port..."
echo "Usuário: $user, Banco: $dbname"

export PGPASSWORD="$password"

# Tenta a conexão várias vezes
until psql -h "$host" -p "$port" -U "$user" -d "$dbname" -c '\q' >/dev/null 2>&1; do
  count=$((count + 1))
  
  if [ $count -ge $max_attempts ]; then
    echo "Atingido número máximo de tentativas ($max_attempts). Verificando detalhes da conexão..."
    
    # Detalhes da conexão
    echo "Detalhes de conexão:"
    echo "- Host: $host"
    echo "- Porta: $port"
    echo "- Usuário: $user"
    echo "- Banco: $dbname"
    
    # Diagnóstico de conexão
    echo "Tentando diagnóstico avançado..."
    
    # Verificar configuração de rede
    echo "Verificando rede:"
    echo "- Hostname:" $(hostname)
    echo "- Interfaces:" $(ip -o addr | awk '{print $2 ": " $4}' | grep -v ": 127." || echo "N/A")
    
    # Verificar DNS
    echo "Verificando DNS para $host:"
    host "$host" || echo "Não foi possível resolver $host"
    
    # Verificar porta TCP
    echo "Verificando porta TCP $port em $host:"
    nc -zv "$host" "$port" -w 5 || echo "Não foi possível conectar a $host:$port"
    
    # Tentar hosts alternativos na rede EasyPanel
    if [[ "$host" == *"viajey"* || "$host" == "viajey_viajey" ]]; then
      echo "Ambiente EasyPanel detectado. Tentando hosts alternativos..."
      
      # Lista de hosts alternativos comuns no EasyPanel e Docker
      alt_hosts=("postgres" "postgresql" "db" "database" "postgres-db" "pgsql" "viajey-db" "viajey_db")
      
      # Tentar primeiro o nome viajey_viajey diretamente
      echo "Tentando host principal: viajey_viajey"
      if nc -zv "viajey_viajey" "$port" -w 3 >/dev/null 2>&1; then
        echo "Porta $port aberta em viajey_viajey!"
        if psql -h "viajey_viajey" -p "$port" -U "$user" -d "$dbname" -c '\q' >/dev/null 2>&1; then
          echo "Conexão PostgreSQL bem-sucedida via viajey_viajey!"
          host="viajey_viajey"
          return
        fi
      fi
      
      # Tentar alternativas
      for alt_host in "${alt_hosts[@]}"; do
        echo "Tentando host alternativo: $alt_host"
        
        if nc -zv "$alt_host" "$port" -w 2 >/dev/null 2>&1; then
          echo "Porta $port aberta em $alt_host!"
          
          if psql -h "$alt_host" -p "$port" -U "$user" -d "$dbname" -c '\q' >/dev/null 2>&1; then
            echo "Conexão PostgreSQL bem-sucedida via $alt_host!"
            host="$alt_host"
            break
          else
            echo "Porta aberta, mas conexão PostgreSQL falhou em $alt_host."
          fi
        else
          echo "Porta $port fechada ou host $alt_host não acessível."
        fi
      done
    fi
    
    echo "Continuando mesmo após falhas de conexão..."
    break
  fi
  
  echo "PostgreSQL não está disponível - esperando... ($count/$max_attempts)"
  sleep 2
done

echo "PostgreSQL está disponível em $host:$port - continuando"

# Executar o comando especificado
if [ -n "$cmd" ]; then
  echo "Executando comando: $cmd"
  exec $cmd
fi