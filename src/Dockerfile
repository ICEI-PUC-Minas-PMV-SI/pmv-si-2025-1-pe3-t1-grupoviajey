FROM node:20-slim

# Instalar ferramentas necessárias
RUN apt-get update && apt-get install -y \
    postgresql-client \
    python3 \
    python3-pip \
    gunicorn \
    curl \
    netcat-openbsd \
    procps \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Instalar dependências do Python para o script de inicialização
RUN pip3 install flask psycopg2-binary

# Criar diretório da aplicação
WORKDIR /app

# Instalar dependências
COPY package*.json ./
RUN npm install

# Copiar arquivos da aplicação
COPY . .

# Remover arquivos desnecessários para reduzir o tamanho da imagem
RUN rm -rf .git .cache .vscode

# Expor porta
EXPOSE 5000

# Definir variáveis de ambiente, com valores padrão que serão substituídos no deploy
ENV PORT=5000
ENV NODE_ENV=production
# As variáveis de ambiente abaixo são apenas valores padrão para desenvolvimento local
# No deploy via EasyPanel, elas serão substituídas pelas variáveis fornecidas na plataforma
ENV DATABASE_URL=postgres://viajey:viajey@postgres:5432/viajey
ENV DB_HOST=postgres
ENV DB_PORT=5432
ENV DB_USER=viajey
ENV DB_PASSWORD=viajey
ENV DB_NAME=viajey
# Opcional: desativar SSL para ambientes que não precisam de conexão segura
ENV DISABLE_SSL=true

# Scripts para iniciar a aplicação e verificar PostgreSQL
COPY docker-entrypoint.sh wait-for-postgres.sh /app/
RUN chmod +x /app/docker-entrypoint.sh /app/wait-for-postgres.sh

# Executar o script de entrada em vez de iniciar a aplicação diretamente
CMD ["/app/docker-entrypoint.sh"]