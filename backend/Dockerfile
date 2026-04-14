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
# Copy public directory first (static files)
COPY public/ ./public/
# Then copy the rest
COPY . .
EXPOSE 8080
CMD ["node", "server.js"]
