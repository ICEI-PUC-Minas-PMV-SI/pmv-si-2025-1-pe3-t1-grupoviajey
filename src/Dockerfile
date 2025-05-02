FROM node:20-slim

# Instalar ferramentas necessárias
RUN apt-get update && apt-get install -y postgresql-client && rm -rf /var/lib/apt/lists/*

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
# A URL do banco de dados será fornecida pelo EasyPanel como variável de ambiente
# Este é apenas um valor padrão para desenvolvimento local
ENV DATABASE_URL=postgres://viajey:viajey@postgres:5432/viajey

# Script para iniciar a aplicação
COPY docker-entrypoint.sh /app/docker-entrypoint.sh
RUN chmod +x /app/docker-entrypoint.sh

# Executar o script de entrada em vez de iniciar a aplicação diretamente
CMD ["/app/docker-entrypoint.sh"]