FROM node:18-alpine

WORKDIR /app

# Copiar arquivos de dependências
COPY package*.json ./

# Instalar dependências
RUN npm ci --only=production && \
    npm install prisma

# Copiar código
COPY . .

# Gerar Prisma Client
RUN npx prisma generate

# Expor porta
EXPOSE 5000

# Iniciar servidor
CMD ["npm", "start"]
