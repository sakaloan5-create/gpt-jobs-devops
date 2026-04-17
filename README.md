# GigStream

全球远程岗位平台 - 连接人才与机会

## 项目结构

```
gpt-jobs-devops/
├── backend/          # Node.js + Express API
│   ├── src/         # 源代码
│   ├── public/      # 静态文件（管理后台、提交页面）
│   └── package.json
├── mobile/          # Android 原生应用（Kotlin + Jetpack Compose）
└── README.md
```

## 核心功能

- 🌍 全球岗位发布与浏览
- 🔍 按国家/地区筛选
- 📱 Android 原生应用
- 📊 数据统计与分析
- 🛡️ 岗位审核与举报

## 快速开始

### 后端
```bash
cd backend
npm install
npm run dev
```

### Android
```bash
cd mobile
./gradlew :app:assembleDebug
```

## API 文档

- `GET /api/jobs` - 岗位列表
- `GET /api/job/detail?id={id}` - 岗位详情
- `GET /api/countries` - 国家列表
- `POST /api/admin/jobs` - 发布岗位（管理后台）

## 部署

后端：Google Cloud Run / Vercel / Render
Android：Google Play / 直接安装
