FROM node:20-slim

WORKDIR /app

# Instalar ferramentas necessárias (inclui postgresql-client para scripts de inicialização)
RUN apt-get update && apt-get install -y postgresql-client wget curl && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci

# Copiar o restante dos arquivos do projeto
COPY . .

# Tornar o script de entrada executável
RUN chmod +x docker-entrypoint.sh
RUN chmod +x wait-for-postgres.sh

# Expor a porta utilizada pelo aplicativo
EXPOSE 5000

# Valores padrão para variáveis de ambiente
ENV DATABASE_URL=${DATABASE_URL:-postgres://viajey:viajey@viajey_viajey:5432/viajey?sslmode=disable}
ENV NODE_ENV=${NODE_ENV:-production}
ENV PORT=${PORT:-5000}
ENV JWT_SECRET=${JWT_SECRET:-segredo123}
ENV DISABLE_SSL=true

# Usar o script de entrada para inicialização
ENTRYPOINT ["./docker-entrypoint.sh"]

# Comando para iniciar a aplicação após o script de entrada
CMD ["node", "server.js"]