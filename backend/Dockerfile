# 后端 Dockerfile (Node.js 20 for Cloud Run)
# Usage: docker build -t gpt-jobs-api ./backend

FROM node:20-alpine

# 安装常用工具（如需 Python 等构建依赖可取消注释）
# RUN apk add --no-cache python3 make g++

WORKDIR /app

# 先复制依赖清单以利用 Docker 缓存层
COPY package*.json ./

# 安装生产依赖
RUN npm ci --only=production && npm cache clean --force

# 复制源码
COPY . .

# Cloud Run 要求的端口（默认 8080）
ENV PORT=8080
EXPOSE 8080

# 非 root 运行更安全
USER node

# 启动命令（根据实际入口文件调整）
CMD ["node", "server.js"]
