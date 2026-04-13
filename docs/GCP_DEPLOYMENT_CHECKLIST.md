# GCP 部署检查清单

> 本清单面向 Junior 工程师，按步骤执行即可将 GigStream 后端 + Firebase 基础设施部署到 GCP。

---

## Step 0：前置准备

- [ ] 拥有一个 Google 账号，并已访问 [Google Cloud Console](https://console.cloud.google.com/)
- [ ] 已安装本地工具：
  - `gcloud` CLI（[安装指南](https://cloud.google.com/sdk/docs/install)）
  - `firebase-tools`（`npm install -g firebase-tools`）

---

## Step 1：创建 GCP 项目

1. 登录 Cloud Console → IAM & Admin → Manage Resources → Create Project
2. 项目 ID 建议格式：`gpt-jobs-dev` / `gpt-jobs-staging` / `gpt-jobs-prod`
3. 记录 **Project ID**（如 `gpt-jobs-dev`），后续全部使用该 ID

---

## Step 2：绑定 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击 "Add project" → 选择刚才创建的 GCP Project
3. 按向导完成创建，**升级为 Blaze（随用随付）计划**（Cloud Run 扩展必需）

---

## Step 3：启用 GCP API

在 Cloud Console 或本地终端执行：

```bash
gcloud config set project <PROJECT_ID>

gcloud services enable run.googleapis.com
gcloud services enable firestore.googleapis.com
gcloud services enable cloudbuild.googleapis.com
gcloud services enable secretmanager.googleapis.com
gcloud services enable artifactregistry.googleapis.com
gcloud services enable firebase.googleapis.com
```

检查启用状态：
```bash
gcloud services list --enabled
```

---

## Step 4：创建 Artifact Registry 仓库（Docker 镜像仓库）

```bash
gcloud artifacts repositories create cloudrun \
  --repository-format=docker \
  --location=asia-east1 \
  --description="Docker repo for Cloud Run"
```

---

## Step 5：设置 IAM（Service Account & 密钥）

### 5.1 创建 CI/CD 专用 Service Account
```bash
gcloud iam service-accounts create github-ci \
  --display-name="GitHub Actions CI"
```

### 5.2 授予必要角色
```bash
PROJECT_ID=<PROJECT_ID>

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-ci@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/run.admin"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-ci@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/cloudbuild.builds.editor"

gcloud projects add-iam-policy-binding $PROJECT_ID \
  --member="serviceAccount:github-ci@$PROJECT_ID.iam.gserviceaccount.com" \
  --role="roles/artifactregistry.writer"
```

### 5.3 生成 JSON 密钥并保存到 GitHub Secrets
```bash
gcloud iam service-accounts keys create github-ci-key.json \
  --iam-account=github-ci@$PROJECT_ID.iam.gserviceaccount.com
```

- 打开生成的 `github-ci-key.json`，**Base64 编码**：
  ```bash
  base64 -i github-ci-key.json -o github-ci-key.b64
  cat github-ci-key.b64 | pbcopy  # macOS 直接复制到剪贴板
  ```
- 前往 GitHub Repo → Settings → Secrets and variables → Actions → New repository secret
  - Name: `GCP_SA_KEY`
  - Value: 粘贴 Base64 内容
- 删除本地 JSON 文件：`rm github-ci-key.json github-ci-key.b64`

---

## Step 6：初始化 Firestore

1. Cloud Console → Firestore Database → Create Database
2. 选择 **Native Mode**
3. 选择 region（建议 `asia-east1` 或 `nam5`）
4. 安全规则先选 "Start in production mode"，随后用本仓库的 `firestore.rules` 覆盖

部署规则：
```bash
cd firebase
firebase use <PROJECT_ID>
firebase deploy --only firestore:rules,firestore:indexes
```

---

## Step 7：配置 FCM（Firebase Cloud Messaging）

1. Firebase Console → Project Settings → Cloud Messaging
2. 记录 **Server key**（旧版 V1 已废弃，新版使用 Admin SDK 自动集成）
3. 确保 Cloud Run 后端代码使用 `firebase-admin` SDK 发送消息，无需手动配置 Server Key
4. （Android）在 FCM 设置中下载 `google-services.json` 给客户端使用
5. （iOS）上传 APNs Auth Key / APNs Certificate 到 Firebase，下载 `GoogleService-Info.plist`

---

## Step 8：首次部署 Cloud Run

本地测试构建（可选）：
```bash
cd backend
docker build -t gpt-jobs-api .
docker run -p 8080:8080 --env PORT=8080 gpt-jobs-api
```

通过 GitHub Actions 自动部署：
1. 确保 `main` 分支已推送
2. 确保 GitHub Secrets 已配置 `GCP_SA_KEY` 和 `GCP_PROJECT_ID`
3. GitHub Actions 自动触发，约 3-5 分钟后访问服务 URL
4. 测试健康检查：`curl https://YOUR_SERVICE_URL/v1/health`

---

## Step 9：移动端 Firebase 配置文件

- Android：`google-services.json` → 放入 Expo 项目根目录或 `android/app/`
- iOS：`GoogleService-Info.plist` → 放入项目目录并在 `app.json` 中通过 `"googleServicesFile"` 引用

---

## 故障排查速查

| 问题 | 排查方向 |
|------|----------|
| Cloud Run 部署失败 | 检查 `GCP_SA_KEY` 是否正确、Service Account 是否缺少 `run.admin` 角色 |
| Firestore 无法写入 | 检查 `firestore.rules` 是否已部署、用户是否已登录 |
| FCM 收不到推送 | 检查 APNs / Android 密钥配置、FCM Token 是否正确注册 |
| GitHub Actions 超时 | Cloud Build 是否已启用、Artifact Registry 是否存在 |
