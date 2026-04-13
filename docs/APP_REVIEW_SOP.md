# App 审核版部署 SOP

> 目的：确保 iOS/Android 上架审核一次性通过，无骗审风险，并明确 dev/prod 双环境的运营切换逻辑。

---

## 一、审核核心原则（Based on PRD 12.2）

- [ ] 有可浏览的岗位列表（不能是空白页）
- [ ] 有真实可见的职位详情页
- [ ] 有帮助中心、隐私政策、用户协议入口
- [ ] 联系按钮为**用户主动点击**才能跳转外部 App
- [ ] 禁止任何自动跳转外部 App/Web 的行为
- [ ] 商店素材截图与 App 实际功能一致
- [ ] 审核员所在地区能看到兜底（fallback）岗位

---

## 二、Dev 环境过审流程

### 2.1 环境定义
- **Dev Firebase 项目**：`gpt-jobs-dev`
- **Dev Cloud Run 后端**：`https://api-dev-xxx.run.app`
- **Dev Expo Release Channel**：`preview` 或 `dev-review`

### 2.2 审核前数据准备

1. **准备兜底岗位池（Fallback Jobs）**
   - 在 Firestore `jobs` 中至少插入 20 条真实、合规的兼职岗位。
   - 覆盖多个审核热门地区：美国（US）、英国（GB）、加拿大（CA）、澳大利亚（AU）。
   - 岗位信息不得包含：押金、保证金、刷单、返利、博彩、陪聊、裸聊、代孕、毒品、枪支。
2. **配置国家兜底策略**
   - 在 `config/fallback` 文档中设置 fallback 国家列表：
     ```json
     { "defaultCountries": ["US", "GB", "CA", "AU", "PH", "BR"] }
     ```
3. **关闭未完成功能**
   - 将搜索、筛选、IM 聊天等 P1 功能的开关设为 `enabled: false`。

### 2.3 构建审核包

```bash
# 确保 .env 指向 dev 后端
export EXPO_PUBLIC_API_BASE_URL=https://api-dev-xxx.run.app/v1

# iOS - 生成 Simulator 包供内部测试
eas build --profile preview --platform ios

# Android - 生成 APK 供测试和预审核
eas build --profile preview --platform android

# 生产构建（提交审核用）
eas build --profile production --platform ios
eas build --profile production --platform android
```

### 2.4 过审自检清单（提审前必读）

| 检查项 | 合格标准 |
|--------|----------|
| 启动页 | 1.5 秒闪屏后进入岗位列表 |
| 列表页 | 下拉刷新正常，至少显示 5 条岗位 |
| 详情页 | 展示完整信息后，底部出现 Contact Now 按钮 |
| 点击 Contact Now | 弹出系统确认（Open WhatsApp?）或打开网页，**无自动跳转** |
| 举报入口 | 岗位详情页可见 Report this job |
| 帮助页 | 包含 Privacy Policy、Terms of Service、Contact Support |
| 空状态 | 任何网络/地区下都不允许纯空白页 |

### 2.5 审核期间注意事项

- 若收到 Apple/Google 的 "Guideline 4.2 - Minimum Functionality" 驳回，说明岗位数据太少或交互太简单，补充岗位池并重新提交。
- 若收到 "Guideline 5.1.1 - Legal" 驳回，检查隐私政策 URL 是否可访问，且 App 中必须包含 "Privacy Policy" 入口。
- **审核期间保持 Dev 后端 24h 可用，禁止部署破坏性更新。**

---

## 三、Prod 环境运营流程

### 3.1 环境切换时机
- App **正式上架**后，发布一个热更新（EAS Update）或原生版本，将 API_BASE_URL 切换到 Prod。
- Prod 环境使用独立的 GCP/Firebase 项目：`gpt-jobs-prod`。

### 3.2 运营期配置

1. **开启真实岗位审核流程**
   - 所有招聘方提交的岗位默认状态为 `pending`。
   - 运营人员 24h 内完成人工审核，通过后改为 `active`。
2. **启用内容过滤关键词**
   - Firestore Security Rules 配合 Cloud Function 自动拦截黑名单词汇。
3. **保留兜底策略**
   - 新上线国家若无岗位，自动展示 fallback 国家池的岗位，避免用户看到空页面。
4. **开启数据监控与崩溃监控**
   - Firebase Analytics 监控核心漏斗：浏览 → 详情 → 联系点击。
   - Sentry/Crashlytics 监控 App 崩溃率（目标 < 0.5%）。

### 3.3 版本更新与热更新策略

| 场景 | 操作 |
|------|------|
| 文案/Bug 修复（无原生改动） | `eas update --branch production` |
| 新增 P1 功能（搜索/推送） | 重新走 `eas build --profile production`，提交商店更新 |
| 后端 API 升级 | 保证向后兼容，Cloud Run 灰度部署 |

### 3.4 紧急下架 SOP

若发现诈骗/违规岗位已上线：
1. 运营后台立即将该岗位 `status` 改为 `suspended`。
2. Firestore Rules 会立即生效，客户端无法再读取该岗位。
3. 1 小时内发布 EAS Update，在客户端 UI 上增加风险提示文案。
4. 记录到 `reports` 集合，分析漏洞并优化自动过滤规则。

---

## 四、双环境对照表

| 项目 | Dev（过审） | Prod（运营） |
|------|-------------|--------------|
| GCP 项目 | `gpt-jobs-dev` | `gpt-jobs-prod` |
| Cloud Run URL | `api-dev-xxx.run.app` | `api-prod-xxx.run.app` |
| 岗位来源 | 运营手动录入兜底岗位 | 真实招聘方发布 + 运营审核 |
| 新功能开关 | 关闭未完成的 P1 功能 | 按版本计划逐步开放 |
| 数据监控 | Analytics + Crashlytics | Analytics + Crashlytics + Sentry |
| 推送通知 | 关闭或仅测试 | 正常运营 |

---

## 五、常见拒因与应对方案

| 拒因 | 应对 |
|------|------|
| "App 看起来是网页封装" | 确保原生导航、下拉刷新、卡片动效足够丰富 |
| "隐私政策缺失" | Help 页必须包含可点击的 Privacy Policy 外链 |
| "用户生成内容无举报机制" | 每篇岗位详情底部固定 Report 按钮 |
| "App 内购买未使用 IAP" | MVP 阶段关闭付费功能，后续若开启需接 StoreKit/Play Billing |
| "外部链接自动跳转" | 联系按钮必须要求用户主动点击，禁止自动打开 |
