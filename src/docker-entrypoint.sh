#!/bin/bash
set -e

# Função para verificar a conexão com o banco de dados
check_db_connection() {
    local db_url=$1
    echo "Testando conexão com o banco de dados..."
    
    # Extrair informações da URL
    # Formato: postgres://username:password@hostname:port/database
    regex="postgres:\/\/([^:]+):([^@]+)@([^:]+):([^\/]+)\/(.+)"
    
    if [[ $db_url =~ $regex ]]; then
        DB_USER="${BASH_REMATCH[1]}"
        DB_PASS="${BASH_REMATCH[2]}"
        DB_HOST="${BASH_REMATCH[3]}"
        DB_PORT="${BASH_REMATCH[4]}"
        DB_NAME="${BASH_REMATCH[5]}"
        
        # Remover parâmetros extras da URL se existirem
        DB_NAME=$(echo $DB_NAME | cut -d'?' -f1)
        
        echo "Tentando conectar a $DB_HOST:$DB_PORT/$DB_NAME como $DB_USER..."
        
        # Exportar PGPASSWORD é uma prática comum para automatizar o login do psql
        export PGPASSWORD="$DB_PASS"
        
        # Tentar conexão com timeout para não travar se o banco estiver indisponível
        if timeout 5 psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' > /dev/null 2>&1; then
            echo "Conexão bem-sucedida!"
            return 0
        else
            echo "Falha na conexão."
            return 1
        fi
    else
        echo "Formato da URL de banco de dados inválido: $db_url"
        return 1
    fi
}

# Função para tentar diferentes configurações de banco de dados
try_db_connections() {
    # Lista de possíveis variáveis de ambiente para URLs de banco de dados
    local db_vars=("DATABASE_URL" "DB_URL" "POSTGRES_URL" "PGDATABASE_URL")
    
    # Lista de possíveis hosts de banco de dados
    local db_hosts=("postgres" "db" "database" "postgresql" "postgres-db")
    
    # Tentar usar a variável de ambiente primeira
    for var in "${db_vars[@]}"; do
        if [ ! -z "${!var}" ]; then
            echo "Encontrada variável de ambiente $var"
            if check_db_connection "${!var}"; then
                export DATABASE_URL="${!var}"
                return 0
            fi
        fi
    done
    
    # Se não encontrar ou a conexão falhar, tentar diferentes hosts
    local user="viajey"
    local pass="viajey"
    local database="viajey"
    
    for host in "${db_hosts[@]}"; do
        local url="postgres://${user}:${pass}@${host}:5432/${database}"
        echo "Tentando conexão com host alternativo: $host"
        if check_db_connection "$url"; then
            export DATABASE_URL="$url"
            return 0
        fi
    done
    
    # Se tudo falhar, usar o valor padrão
    echo "Todas as tentativas de conexão falharam. Usando valor padrão."
    return 1
}

# Tentar diferentes configurações de banco de dados
try_db_connections

# Verificar se psql está instalado
if ! command -v psql &> /dev/null; then
    echo "psql não encontrado, instalando..."
    apt-get update && apt-get install -y postgresql-client
fi

# Mostrar configurações
echo "Iniciando aplicação com as seguintes configurações:"
echo "NODE_ENV: $NODE_ENV"
echo "PORT: $PORT"
echo "DATABASE_URL: $DATABASE_URL (formato ofuscado para segurança)"

# Iniciar a aplicação
exec node server.js