# Use Node.js LTS image
FROM node:20-slim

# Set working directory
WORKDIR /app

# Copy package files
COPY package*.json ./

# Install dependencies
RUN npm install

# Copy application code
COPY . .

# Install PostgreSQL client (for health checks and scripts)
RUN apt-get update && \
    apt-get install -y postgresql-client && \
    apt-get clean && \
    rm -rf /var/lib/apt/lists/*

# Set environment variables
ENV NODE_ENV=production
ENV PORT=5000

# Expose port
EXPOSE 5000

# Health check to verify database connection
HEALTHCHECK --interval=30s --timeout=10s --start-period=30s --retries=3 \
  CMD pg_isready -h $PGHOST -p $PGPORT -U $PGUSER || exit 1

# Create a script to wait for database before starting
RUN echo '#!/bin/bash \n\
echo "Waiting for PostgreSQL to start..." \n\
while ! pg_isready -h $PGHOST -p $PGPORT -U $PGUSER; do \n\
  sleep 2 \n\
done \n\
echo "PostgreSQL is ready. Starting application." \n\
node server.js' > /app/docker-entrypoint.sh && \
chmod +x /app/docker-entrypoint.sh

# Start the application
CMD ["/app/docker-entrypoint.sh"]