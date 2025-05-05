FROM node:20-slim

# Instalar ferramentas necessárias
RUN apt-get update && apt-get install -y \
    postgresql-client \
    curl \
    netcat-openbsd \
    procps \
    dnsutils \
    host \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

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

# Definir variáveis de ambiente mínimas necessárias para o funcionamento
# As variáveis de banco de dados não devem ser definidas no Dockerfile por questões de segurança
# Serão fornecidas como variáveis de ambiente no EasyPanel ou via .env no desenvolvimento local
ENV PORT=5000
ENV NODE_ENV=production
ENV DISABLE_SSL=true

# Scripts para iniciar a aplicação e verificar PostgreSQL
COPY docker-entrypoint.sh wait-for-postgres.sh /app/
RUN chmod +x /app/docker-entrypoint.sh /app/wait-for-postgres.sh

# Executar o script de entrada em vez de iniciar a aplicação diretamente
CMD ["/app/docker-entrypoint.sh"]