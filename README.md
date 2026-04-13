# GigStream - DevOps 配置仓库

本目录包含了 GigStream（全球兼职招聘平台）完整的基础设施配置、CI/CD 工作流、Firebase 规则及部署文档。

## 目录结构

```
gpt-jobs-devops/
├── backend/
│   ├── Dockerfile          # Cloud Run 后端容器构建文件
│   └── .dockerignore       # Docker 构建忽略清单
├── .github/
│   └── workflows/
│       └── deploy-backend.yml   # GitHub Actions 自动部署到 Cloud Run
├── firebase/
│   ├── firestore.rules          # Firestore 安全规则
│   ├── firestore.indexes.json   # Firestore 复合索引
│   ├── storage.rules            # Firebase Storage 安全规则
│   └── firebase.json            # Firebase 项目配置
├── scripts/
│   └── firebase-init.sh         # Firebase 项目一键初始化脚本
├── mobile/
│   ├── eas.json                 # Expo EAS Build 配置
│   └── EXPO_BUILD_GUIDE.md      # Expo 构建与热更新操作指南
├── env/
│   ├── .env.example             # 环境变量模板
│   └── ENV_MANAGEMENT.md        # 环境变量管理规范
└── docs/
    ├── GCP_DEPLOYMENT_CHECKLIST.md   # GCP 部署检查清单（Junior 可用）
    └── APP_REVIEW_SOP.md             # App Store / Play 审核版部署 SOP
```

## 快速开始

### 1. 初始化 Firebase 项目
```bash
bash scripts/firebase-init.sh gpt-jobs-dev
```

### 2. 配置 GitHub Actions Secrets
- `GCP_SA_KEY`：Base64 编码后的 Service Account JSON
- `GCP_PROJECT_ID`：例如 `gpt-jobs-dev`
- `EXPO_TOKEN`：EAS CLI 构建 Token（可选，用于移动端 CI）

### 3. 推送即部署
向 `main` 分支推送代码，GitHub Actions 将自动构建并部署后端到 Cloud Run。

### 4. 构建移动应用
参考 `mobile/EXPO_BUILD_GUIDE.md` 执行 EAS Build 与 EAS Update。

## 技术栈

- **移动端**：React Native (Expo)
- **后端**：Node.js 20 + Express + Cloud Run
- **数据库 / 认证 / 存储**：Firebase (Firestore, Auth, Storage)
- **推送 / 分析**：Firebase Cloud Messaging + Firebase Analytics
- **CI/CD**：GitHub Actions + gcloud CLI
- **容器**：Docker + Google Artifact Registry

## 重要文档

- [GCP 部署检查清单](./docs/GCP_DEPLOYMENT_CHECKLIST.md)
- [环境变量管理规范](./env/ENV_MANAGEMENT.md)
- [App 审核版部署 SOP](./docs/APP_REVIEW_SOP.md)
- [Expo 构建指南](./mobile/EXPO_BUILD_GUIDE.md)

---
*最后更新：2026-04-11*
