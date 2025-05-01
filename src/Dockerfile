FROM node:20-slim

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
ENV DATABASE_URL=postgres://viajey:viajey@localhost:5432/viajey

# Executar a aplicação
CMD ["node", "server.js"]