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

# Force cache bust for public files - use both timestamp and git sha
ARG BUILD_TIMESTAMP=unknown
ARG GIT_SHA=unknown
RUN echo "Build: ${BUILD_TIMESTAMP} at ${GIT_SHA}" > /app/build.info && cat /app/build.info

COPY --from=deps /app/node_modules ./node_modules

# Copy source code
COPY src/ ./src/
COPY server.js ./
COPY package*.json ./

# Copy public directory LAST to ensure fresh static files
COPY public/ ./public/

# Force layer cache invalidation and verify files
RUN ls -la /app/public/admin/ && echo "---" && head -5 /app/public/admin/index.html

EXPOSE 8080
CMD ["node", "server.js"]
