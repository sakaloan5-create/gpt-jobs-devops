# Stage 1: Dependencies
FROM node:20-alpine AS deps
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production

# Stage 2: Runtime
FROM node:20-alpine
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=8080
COPY --from=deps /app/node_modules ./node_modules

# Copy source code (excluding public, which is copied separately)
COPY src/ ./src/
COPY server.js ./
COPY package*.json ./

# Copy public directory LAST to ensure fresh static files
COPY public/ ./public/

EXPOSE 8080
CMD ["node", "server.js"]
