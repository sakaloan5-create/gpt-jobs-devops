# 🚀 GitHub 自动构建 APK 配置指南

## 📋 步骤说明

### 1️⃣ 创建 GitHub 仓库

访问 https://github.com/new 创建新仓库：

- **Repository name**: `fittrack-pro`
- **Description**: `FitTrack Pro - 健身追踪应用`
- **Visibility**: 🔴 **Private** (建议私有，保护代码)
- ✅ Initialize with README (可选)

点击 **Create repository**

---

### 2️⃣ 推送代码到 GitHub

在你的电脑上运行以下命令：

```bash
# 进入项目目录
cd /Users/laosan/.openclaw/workspace/projects/fittrack-pro

# 添加远程仓库（替换 YOUR_USERNAME 为你的GitHub用户名）
git remote add origin https://github.com/YOUR_USERNAME/fittrack-pro.git

# 推送代码
git branch -M main
git push -u origin main
```

---

### 3️⃣ 触发自动构建

推送完成后：

1. 访问 `https://github.com/YOUR_USERNAME/fittrack-pro`
2. 点击 **Actions** 标签
3. 你会看到 **Build APK** 工作流
4. 点击 **Run workflow** → **Run workflow**
5. 等待构建完成（约5-10分钟）

---

### 4️⃣ 下载 APK

构建完成后：

1. 点击最新的 workflow run
2. 滚动到页面底部 **Artifacts** 部分
3. 点击 **FitTrackPro-APK** 下载
4. 解压后得到 `app-release.apk`

---

## 📱 APK 使用

下载的 APK 可以直接安装到Android手机：

```bash
# 通过ADB安装
adb install app-release.apk

# 或发送到手机安装
# 微信/QQ/邮件传输到手机 → 点击安装
```

---

## 🔐 配置密钥（重要！）

GitHub Actions 已经配置了自动签名，但如果你想要使用自己的密钥：

### 方法1：使用 GitHub Secrets（推荐）

1. 访问 `https://github.com/YOUR_USERNAME/fittrack-pro/settings/secrets/actions`
2. 点击 **New repository secret**
3. 添加以下 secrets：
   - `KEYSTORE_BASE64`: 密钥库的 base64 编码
   - `KEYSTORE_PASSWORD`: fittrack2024
   - `KEY_ALIAS`: fittrack
   - `KEY_PASSWORD`: fittrack2024

生成 base64 密钥：
```bash
base64 -i android/app/fittrack-pro.keystore | pbcopy
```

### 方法2：使用默认密钥

不配置 secrets，构建将使用默认密钥（适合测试）

---

## 🔄 后续更新

修改代码后重新构建：

```bash
# 修改代码
git add .
git commit -m "Update: xxx"
git push

# GitHub Actions 会自动触发构建
# 访问 Actions 页面查看进度
```

---

## 🆘 常见问题

### Q: Push 失败 "Permission denied"
**A**: 需要配置 GitHub 凭据
```bash
# 方法1：使用 HTTPS + Token
git remote set-url origin https://TOKEN@github.com/YOUR_USERNAME/fittrack-pro.git

# 方法2：使用 SSH
git remote set-url origin git@github.com:YOUR_USERNAME/fittrack-pro.git
```

### Q: Actions 构建失败
**A**: 查看构建日志，常见原因：
- 缺少签名密钥（使用默认配置即可）
- 依赖下载失败（重新运行）
- 代码错误（检查提交）

### Q: 如何更新签名密钥
**A**: 
1. 本地生成新密钥
2. 转换为 base64
3. 更新 GitHub Secrets
4. 重新运行工作流

---

## 📊 构建状态

在你的仓库页面可以看到：
- 构建状态徽章
- 最近的构建记录
- 下载统计

---

## 🎯 下一步

APK构建完成后：

1. **测试安装** - 安装到手机测试功能
2. **部署控制后台** - 上传到 Vercel
3. **配置远程控制** - 更新APK中的API地址
4. **上传Google Play** - 提交审核

---

**准备好开始了吗？** 按照步骤1-4操作即可！🎉

有任何问题随时联系我！