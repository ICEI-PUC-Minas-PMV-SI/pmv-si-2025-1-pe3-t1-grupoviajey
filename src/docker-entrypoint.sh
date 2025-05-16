#!/bin/bash
set -e

echo "====================================================="
echo "VIAJEY - Script de inicialização do contêiner Docker"
echo "====================================================="

# Função para verificar a conexão com o banco de dados
check_db_connection() {
    local db_url=$1
    echo "Testando conexão com o banco de dados..."
    
    # Extrair informações da URL
    if [[ "$db_url" == *"viajey:viajey@viajey_viajey"* ]]; then
        echo "Detectado formato EasyPanel!"
        DB_USER="viajey"
        DB_PASS="viajey"
        DB_HOST="viajey_viajey"
        DB_PORT="5432"
        DB_NAME="viajey"
    else
        regex="postgres:\/\/([^:]+):([^@]+)@([^:]+):([^\/]+)\/([^?]+)"
        if [[ $db_url =~ $regex ]]; then
            DB_USER="${BASH_REMATCH[1]}"
            DB_PASS="${BASH_REMATCH[2]}"
            DB_HOST="${BASH_REMATCH[3]}"
            DB_PORT="${BASH_REMATCH[4]}"
            DB_NAME="${BASH_REMATCH[5]}"
        else
            echo "Formato da URL de banco de dados não reconhecido: $db_url"
            return 1
        fi
    fi
    
    DB_NAME=$(echo $DB_NAME | cut -d'?' -f1)
    export PGPASSWORD="$DB_PASS"
    
    if timeout 5 psql -h "$DB_HOST" -p "$DB_PORT" -U "$DB_USER" -d "$DB_NAME" -c '\q' > /dev/null 2>&1; then
        echo "Conexão bem-sucedida!"
        return 0
    else
        echo "Falha na conexão."
        return 1
    fi
}

# Tentar diferentes configurações de banco de dados
try_db_connections() {
    local db_vars=("DATABASE_URL" "DB_URL" "POSTGRES_URL" "PGDATABASE_URL")
    local db_hosts=("postgres" "db" "database" "postgresql" "postgres-db")
    
    for var in "${db_vars[@]}"; do
        if [ ! -z "${!var}" ]; then
            echo "Encontrada variável de ambiente $var"
            if check_db_connection "${!var}"; then
                export DATABASE_URL="${!var}"
                return 0
            fi
        fi
    done
    
    if [ ! -z "$DB_HOST" ] && [ ! -z "$DB_USER" ] && [ ! -z "$DB_PASSWORD" ] && [ ! -z "$DB_NAME" ]; then
        local db_port=${DB_PORT:-5432}
        local url="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${db_port}/${DB_NAME}"
        echo "Construindo URL do banco a partir de variáveis separadas"
        if check_db_connection "$url"; then
            export DATABASE_URL="$url"
            return 0
        fi
    fi
    
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
    
    echo "Todas as tentativas de conexão falharam. Usando valor padrão de DATABASE_URL."
    return 1
}

# Inicializar banco de dados
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
echo "DATABASE_URL: ****** (ofuscado para segurança)"

# Configurar variáveis do PostgreSQL
if [[ "$DATABASE_URL" == *"viajey:viajey@viajey_viajey"* ]]; then
    export PGUSER="viajey"
    export PGPASSWORD="viajey"
    export PGHOST="viajey_viajey"
    export PGPORT="5432"
    export PGDATABASE="viajey"
elif [[ $DATABASE_URL =~ postgres:\/\/([^:]+):([^@]+)@([^:]+):([^\/]+)\/(.+) ]]; then
    export PGUSER="${BASH_REMATCH[1]}"
    export PGPASSWORD="${BASH_REMATCH[2]}"
    export PGHOST="${BASH_REMATCH[3]}"
    export PGPORT="${BASH_REMATCH[4]}"
    export PGDATABASE="${BASH_REMATCH[5]}"
    export PGDATABASE=$(echo $PGDATABASE | cut -d'?' -f1)
fi

# Desativar SSL se necessário
if [[ "$DATABASE_URL" != *"sslmode=disable"* && "$DISABLE_SSL" == "true" ]]; then
    if [[ "$DATABASE_URL" == *"?"* ]]; then
        export DATABASE_URL="${DATABASE_URL}&sslmode=disable"
    else
        export DATABASE_URL="${DATABASE_URL}?sslmode=disable"
    fi
    echo "Modo SSL desativado para a conexão com o banco de dados"
fi

# Inicializar banco de dados
if [ -n "$PGHOST" ] && [ -n "$PGUSER" ] && [ -n "$PGPASSWORD" ] && [ -n "$PGDATABASE" ]; then
    echo "Aguardando o PostgreSQL ficar disponível..."
    ./wait-for-postgres.sh "$PGHOST" "${PGPORT:-5432}" "$PGUSER" "$PGPASSWORD" "$PGDATABASE" "node init-db.js"
    
    if [ $? -ne 0 ]; then
        echo "AVISO: Inicialização do banco de dados falhou, mas tentando iniciar a aplicação mesmo assim..."
    else
        echo "Banco de dados inicializado com sucesso!"
    fi
    
    echo "Iniciando aplicação..."
    exec node server.js
else
    echo "Variáveis de ambiente PostgreSQL não definidas completamente, tentando iniciar mesmo assim..."
    node init-db.js || true
    exec node server.js
fi 