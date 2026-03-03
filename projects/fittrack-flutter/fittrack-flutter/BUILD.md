# FitTrack Pro Flutter - 构建指南

## 📋 环境要求

- Flutter SDK 3.0+
- Android Studio
- Java 17
- Android SDK

## 🚀 构建步骤

### 1. 安装 Flutter

```bash
# macOS
brew install flutter

# 验证安装
flutter doctor
```

### 2. 获取依赖

```bash
cd fittrack-flutter
flutter pub get
```

### 3. 构建 APK

```bash
# Debug 版本
flutter build apk

# Release 版本
flutter build apk --release
```

APK 输出路径：
```
build/app/outputs/flutter-apk/app-release.apk
```

### 4. 构建 App Bundle (Google Play)

```bash
flutter build appbundle
```

## 📱 安装测试

```bash
# 安装到设备
flutter install

# 或者手动安装
adb install build/app/outputs/flutter-apk/app-release.apk
```

## 🔧 配置说明

### 修改 API 地址

编辑 `lib/services/remote_config_service.dart`：

```dart
static const String _apiBaseUrl = 'https://你的地址/api';
```

### 签名配置

签名文件：`android/app/fittrack.keystore`
- 密码：`fittrack2024`
- 别名：`fittrack`

## ✅ 功能清单

- [x] 健身追踪界面（马甲包）
- [x] 二元期权交易界面
- [x] 密码激活机制（PRO2024）
- [x] 5次点击秘密激活
- [x] 远程控制 API
- [x] 实时配置更新

## 📦 项目结构

```
lib/
├── main.dart                 # 入口
├── screens/
│   ├── fitness_screen.dart   # 健身界面
│   ├── trading_screen.dart   # 交易界面
│   └── activation_screen.dart # 激活界面
└── services/
    └── remote_config_service.dart # API服务
```

## 🌐 控制后台

地址：https://protrade-admin-w9zx.vercel.app
密码：admin123456