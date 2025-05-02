#!/bin/bash
set -e

# Função para verificar a conexão com o banco de dados
check_db_connection() {
    local db_url=$1
    echo "Testando conexão com o banco de dados..."
    
    # Extrair informações da URL
    # Suporta formatos:
    # 1. postgres://username:password@hostname:port/database
    # 2. postgres://username:username@hostname:port/database
    # 3. postgres://username-username@hostname.hostname:port/database
    
    # Tratar especificamente o formato do EasyPanel
    if [[ "$db_url" == *"viajey-viajey"* ]]; then
        echo "Detectado formato EasyPanel!"
        # Format: postgres://viajey-viajey@viajey_viajey:5432/viajey?sslmode=disable
        
        # Extração manual para este formato específico
        DB_USER="viajey"
        DB_PASS="viajey"
        
        # Extrair host e porta
        host_port=$(echo "$db_url" | sed -n 's/postgres:\/\/viajey-viajey@\([^\/]*\)\/.*/\1/p')
        DB_HOST=$(echo "$host_port" | cut -d':' -f1)
        DB_PORT=$(echo "$host_port" | cut -d':' -f2)
        
        # Extrair nome do banco
        DB_NAME=$(echo "$db_url" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    else
        # Formato padrão: postgres://username:password@hostname:port/database
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
}

# Função para tentar diferentes configurações de banco de dados
try_db_connections() {
    # Lista de possíveis variáveis de ambiente para URLs de banco de dados
    local db_vars=("DATABASE_URL" "DB_URL" "POSTGRES_URL" "PGDATABASE_URL")
    
    # Lista de possíveis hosts de banco de dados
    local db_hosts=("postgres" "db" "database" "postgresql" "postgres-db")
    
    # Tentar usar a variável de ambiente DATABASE_URL primeira
    for var in "${db_vars[@]}"; do
        if [ ! -z "${!var}" ]; then
            echo "Encontrada variável de ambiente $var"
            if check_db_connection "${!var}"; then
                export DATABASE_URL="${!var}"
                return 0
            fi
        fi
    done
    
    # Verificar se temos as variáveis de banco separadas (comum em muitas plataformas)
    if [ ! -z "$DB_HOST" ] && [ ! -z "$DB_USER" ] && [ ! -z "$DB_PASSWORD" ] && [ ! -z "$DB_NAME" ]; then
        local db_port=${DB_PORT:-5432}
        local url="postgres://${DB_USER}:${DB_PASSWORD}@${DB_HOST}:${db_port}/${DB_NAME}"
        echo "Construindo URL do banco a partir de variáveis separadas"
        if check_db_connection "$url"; then
            export DATABASE_URL="$url"
            return 0
        fi
    fi
    
    # Se não encontrar ou a conexão falhar, tentar diferentes hosts com as credenciais padrão
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
    echo "Todas as tentativas de conexão falharam. Usando valor padrão de DATABASE_URL."
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
echo "DATABASE_URL: ****** (ofuscado para segurança)"

# Definir variáveis de ambiente adicionais com base na DATABASE_URL
if [[ "$DATABASE_URL" == *"viajey-viajey"* ]]; then
    # Formato EasyPanel: postgres://viajey-viajey@viajey_viajey:5432/viajey?sslmode=disable
    export PGUSER="viajey"
    export PGPASSWORD="viajey"
    
    # Extrair host e porta
    host_port=$(echo "$DATABASE_URL" | sed -n 's/postgres:\/\/viajey-viajey@\([^\/]*\)\/.*/\1/p')
    export PGHOST=$(echo "$host_port" | cut -d':' -f1)
    export PGPORT=$(echo "$host_port" | cut -d':' -f2)
    
    # Extrair nome do banco
    export PGDATABASE=$(echo "$DATABASE_URL" | sed -n 's/.*\/\([^?]*\).*/\1/p')
    
    echo "Variáveis de ambiente PostgreSQL definidas com sucesso (formato EasyPanel)"
elif [[ $DATABASE_URL =~ postgres:\/\/([^:]+):([^@]+)@([^:]+):([^\/]+)\/(.+) ]]; then
    # Formato padrão
    export PGUSER="${BASH_REMATCH[1]}"
    export PGPASSWORD="${BASH_REMATCH[2]}"
    export PGHOST="${BASH_REMATCH[3]}"
    export PGPORT="${BASH_REMATCH[4]}"
    export PGDATABASE="${BASH_REMATCH[5]}"
    
    # Remover parâmetros extras da URL se existirem
    export PGDATABASE=$(echo $PGDATABASE | cut -d'?' -f1)
    
    echo "Variáveis de ambiente PostgreSQL definidas com sucesso (formato padrão)"
else
    echo "AVISO: Não foi possível definir variáveis de ambiente PostgreSQL a partir da URL"
fi

# Adicionar no driver PG para evitar erros com SSL no EasyPanel
if [[ "$DATABASE_URL" != *"sslmode=disable"* && "$DISABLE_SSL" == "true" ]]; then
    # Verificar se já tem parâmetros na URL
    if [[ "$DATABASE_URL" == *"?"* ]]; then
        export DATABASE_URL="${DATABASE_URL}&sslmode=disable"
    else
        export DATABASE_URL="${DATABASE_URL}?sslmode=disable"
    fi
    echo "Modo SSL desativado para a conexão com o banco de dados"
fi

# Configurar variáveis do PostgreSQL a partir da DATABASE_URL (se existir)
if [ -n "$DATABASE_URL" ]; then
    echo "Detectado DATABASE_URL, extraindo componentes..."
    
    # Tentar extrair informações da URL - formato esperado pelo EasyPanel
    # Formato comum: postgres://usuario:senha@host:porta/nome_banco
    if [[ "$DATABASE_URL" =~ postgres://([^:]+):([^@]+)@([^:]+):([^/]+)/([^?]+) ]]; then
        export PGUSER="${BASH_REMATCH[1]}"
        export PGPASSWORD="${BASH_REMATCH[2]}"
        export PGHOST="${BASH_REMATCH[3]}"
        export PGPORT="${BASH_REMATCH[4]}"
        export PGDATABASE="${BASH_REMATCH[5]}"
        
        # Remover parâmetros extras se existirem
        export PGDATABASE=$(echo $PGDATABASE | cut -d'?' -f1)
        
        echo "Componentes extraídos com sucesso:"
        echo "- Host: $PGHOST"
        echo "- Porta: $PGPORT"
        echo "- Banco: $PGDATABASE"
        echo "- Usuário: $PGUSER"
    else
        echo "Formato de DATABASE_URL não reconhecido, tentando alternativas..."
    fi
fi

# Verificar se o PostgreSQL está disponível antes de iniciar
if [ -n "$PGHOST" ] && [ -n "$PGUSER" ] && [ -n "$PGPASSWORD" ] && [ -n "$PGDATABASE" ]; then
    echo "Aguardando o PostgreSQL ficar disponível..."
    ./wait-for-postgres.sh "$PGHOST" "${PGPORT:-5432}" "$PGUSER" "$PGPASSWORD" "$PGDATABASE" "node server.js"
else
    echo "Variáveis de ambiente PostgreSQL não definidas completamente, tentando iniciar mesmo assim..."
    exec node server.js
fi