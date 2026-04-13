# GigStream 环境变量管理规范

## 1. 基本原则

- **永不提交 `.env` 文件到 Git**
  - `env/.env.example` 是唯一可以提交的模板。
  - 团队各自的本地文件为 `.env.local`，已加入 `.gitignore`。
- **分级管理**
  - `dev`：本地开发机 + Firestore Emulator
  - `staging`：Cloud Run 临时实例 + 测试 Firebase 项目
  - `prod`：生产 Cloud Run + 生产 Firebase 项目
- **敏感信息上云**
  - 生产环境的密钥（Firebase Admin SDK、Algolia Key）必须存放在 **Google Secret Manager** 或 **GitHub Secrets** 中。

## 2. 文件命名规范

| 环境 | 后端文件 | 移动端文件 | 说明 |
|------|----------|------------|------|
| dev | `.env.local` | `.env.local` | 本地 Emulator / 本地 API |
| staging | `.env.staging` | `.env.staging` | 连接 Staging Cloud Run |
| prod | `.env.production` | `.env.production` | 连接 Prod Cloud Run |

> 后端加载优先级（推荐 `dotenv`）：`.env.${NODE_ENV}` → `.env.local` → `.env`
> 移动端：Expo 自动读取 `.env` 文件，构建时通过 `EXPO_PUBLIC_*` 注入。

## 3. 环境变量注入方式

### 后端 (Cloud Run)

在 GitHub Actions 中通过 `--set-env-vars` 或 `--update-secrets` 注入：

```bash
# 普通变量
gcloud run deploy gpt-jobs-api \
  --set-env-vars NODE_ENV=production,FIREBASE_PROJECT_ID=gpt-jobs-prod

# 敏感变量（优先）
gcloud run deploy gpt-jobs-api \
  --update-secrets FIREBASE_ADMIN_SDK_JSON=firebase-admin-sdk:latest
```

### 移动端 (EAS Build)

方式A：EAS Secret（推荐 production）
```bash
eas secret:create --name EXPO_PUBLIC_API_BASE_URL --value "https://api.gptjobs.com" --scope project
```

方式B：`eas.json` 的 `env` 字段（但不建议存敏感值）

方式C：构建时本地 `.env.production` 文件（确保不上传 Git）

## 4. Junior 工程师操作步骤

### 首次配置本地环境

1. 复制模板：
   ```bash
   cp env/.env.example .env.local
   ```
2. 向 Tech Lead 索要：
   - `firebase-admin-sdk.json`（本地调试后端时可选）
   - `google-services.json`（Android）
   - `GoogleService-Info.plist`（iOS）
3. 修改 `.env.local` 中的 API_BASE_URL、Firebase 配置。
4. 运行 Firebase Emulator：
   ```bash
   firebase emulators:start --only firestore,auth,storage
   ```

### 新增环境变量流程

1. 在 `.env.example` 中添加该变量（默认值留空或示例）。
2. 更新本规范文档 `ENV_MANAGEMENT.md` 的说明。
3. 通知 DevOps 在 GCP Secret Manager / GitHub Secrets / EAS Secret 中同步添加。
4. 在 PR 描述中备注新增变量，提醒 Reviewer。

## 5. 禁止事项

- ❌ 禁止将 Private Key、SA JSON 直接写在代码仓库任何位置。
- ❌ 禁止在微信/飞书/邮件中明文传输 Service Account JSON。
- ❌ 禁止在客户端代码中硬写 Admin SDK 或其他服务端密钥。
