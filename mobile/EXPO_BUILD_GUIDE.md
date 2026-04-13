# Expo EAS Build 配置指南

> 本文件与 `eas.json` 配套使用，面向 Junior 工程师。

## 前置条件

1. 全局安装 EAS CLI：
   ```bash
   npm install -g eas-cli
   ```
2. 登录 Expo 账号：
   ```bash
   eas login
   ```
3. 在项目根目录执行（已完成则跳过）：
   ```bash
   eas build:configure
   ```

## 构建命令速查

### 1. 开发版（Development Client）
用于真机调试，带原生调试能力。
```bash
eas build --profile development --platform ios
eas build --profile development --platform android
```

### 2. 内测预览版（Internal Preview）
生成 APK（Android）或 Simulator 包（iOS），不上架。
```bash
eas build --profile preview --platform android   # 输出 APK
eas build --profile preview --platform ios       # 输出 Simulator .app
```

### 3. 生产版（Production）
用于 App Store / Google Play 上架。
```bash
eas build --profile production --platform ios
eas build --profile production --platform android
```

### 4. 自动提交商店（Submit）
Android 需要配置 Google Play Service Account JSON 路径。
```bash
# iOS 自动提交到 App Store Connect
eas submit --platform ios

# Android 自动提交到 Google Play
eas submit --platform android
```

## 环境变量

EAS Build 会自动读取 `.env` 中以 `EXPO_PUBLIC_` 开头的变量并注入到构建中。请确保本地 `.env` 与 EAS Secret 同步：

```bash
# 查看已配置的 Secret
eas secret:list

# 添加 Secret（ production 环境）
eas secret:create --name EXPO_PUBLIC_API_BASE_URL --value "https://api.gptjobs.com" --scope project
```

## 更新（OTA）— 不重新构建原生包

对于 JS 层修改，可使用 EAS Update 快速热更新：

```bash
# 推送到 production 分支
eas update --branch production --message "fix job list loading"

# 推送到 preview 分支
eas update --branch preview --message "add report button"
```

客户端需配置 `expo-updates` 并设置正确的 `updates.url`。

## 审核Tip

- 提交审核前，务必使用 `--profile preview` 在 iOS Simulator / Android 真机上完整跑一遍核心流程。
- 确保 `app.json` 中的 `privacyPolicy` 和 `termsOfService` URL 可访问。
