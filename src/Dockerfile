FROM node:20-slim

WORKDIR /app

# Instalar ferramentas necessárias
RUN apt-get update && apt-get install -y postgresql-client wget curl && rm -rf /var/lib/apt/lists/*

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm install

# Copiar o restante dos arquivos do projeto
COPY . .

# Tornar os scripts executáveis
RUN chmod +x docker-entrypoint.sh
RUN chmod +x wait-for-postgres.sh

# Expor a porta utilizada pelo aplicativo
EXPOSE 5000

# Variáveis de ambiente padrão
ENV DATABASE_URL=postgres://viajey:viajey@viajey_viajey:5432/viajey?sslmode=disable
ENV NODE_ENV=production
ENV PORT=5000 
ENV JWT_SECRET=segredo123
ENV DISABLE_SSL=true

# Script de entrada
ENTRYPOINT ["./docker-entrypoint.sh"]

# Comando para iniciar a aplicação
CMD ["node", "server.js"] 