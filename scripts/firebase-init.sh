#!/usr/bin/env bash
set -euo pipefail

# =============================================================================
# Firebase 项目初始化脚本
# 用途：在新 GCP 项目绑定的 Firebase 中初始化 Firestore、Storage、Emulator
# 用法：bash scripts/firebase-init.sh <project_id>
# =============================================================================

PROJECT_ID="${1:-}"
if [ -z "$PROJECT_ID" ]; then
  echo "❌ 错误：请提供 Firebase/GCP 项目 ID"
  echo "用法：bash firebase-init.sh <project_id>"
  exit 1
fi

echo "🚀 初始化 Firebase 项目: $PROJECT_ID"

# 1. 检查 firebase-tools
if ! command -v firebase &> /dev/null; then
  echo "📦 安装 firebase-tools..."
  npm install -g firebase-tools
fi

# 2. 登录（CI 环境中可跳过，通过 GOOGLE_APPLICATION_CREDENTIALS 认证）
if [ -z "${CI:-}" ]; then
  echo "🔐 请确保已登录 Firebase:"
  firebase login --reauth || firebase login
fi

# 3. 选择项目
cd "$(dirname "$0")/../firebase"
firebase use "$PROJECT_ID" || firebase use --add "$PROJECT_ID"

# 4. 启用 Firestore Native 模式（若尚未启用）
echo "🔥 启用 Firestore..."
firebase firestore:databases:default:create --project "$PROJECT_ID" --location nam5 || true

# 5. 部署规则与索引
echo "📜 部署 Firestore Rules & Indexes..."
firebase deploy --only firestore:rules,firestore:indexes --project "$PROJECT_ID"

# 6. 部署 Storage 规则（如需）
if [ -f "storage.rules" ]; then
  echo "🗄️  部署 Storage Rules..."
  firebase deploy --only storage --project "$PROJECT_ID" || true
fi

echo "✅ Firebase 初始化完成: $PROJECT_ID"
echo ""
echo "📋 下一步："
echo "   1. 在 Firebase Console 下载 google-services.json / GoogleService-Info.plist"
echo "   2. 配置 FCM (Project Settings → Cloud Messaging)"
echo "   3. 在 GCP Console 为该项目的 Service Account 创建 Cloud Run / Cloud Build 密钥"
