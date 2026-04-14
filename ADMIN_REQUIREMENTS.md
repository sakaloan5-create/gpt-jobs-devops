# GPTJobs Admin Dashboard 需求文档

**项目:** GPTJobs (兼职招聘平台)  
**交付物:** Admin 后台管理页面 + 招聘方提交页  
**技术栈:** 纯 HTML + Tailwind CSS (CDN) + Vanilla JS

---

## 文件路径

| 文件 | 说明 |
|---|---|
| `/Users/laosan/.openclaw/workspace/gpt-jobs-devops/backend/public/admin/index.html` | 运营后台主页面 (需彻底重写) |
| `/Users/laosan/.openclaw/workspace/gpt-jobs-devops/backend/public/submit.html` | 招聘方提交岗位页 (需美化) |

后端已部署地址: `https://gpt-jobs-api-mujotqfwaa-de.a.run.app`  
API Base: `/api`

---

## 页面模块

### 1. 审核中心
- **API:** `GET /api/admin/jobs?status=pending&page_size=100`
- **操作:** `PATCH /api/admin/jobs/:id/review` body: `{ "action": "approve" | "reject" | "ban" }`
- **需求:**
  - 表格展示待审核岗位: 岗位标题/公司、国家/城市、薪资、提交时间
  - 每行右侧三个按钮: 通过(绿色) / 拒绝(黄色) / 下架(红色)
  - 操作后刷新列表并 Toast 提示
  - 侧边栏显示待审核数量角标

### 2. 举报处理
- **API:** `GET /api/admin/reports?page_size=100`
- **操作:** `POST /api/admin/reports/:id/handle` body: `{ "action": "resolve" | "dismiss", "ban_job": true | false }`
- **需求:**
  - 表格展示: 举报类型、原因/描述、岗位ID、状态、操作
  - 顶部快捷筛选: 全部 / 待处理 / 已处理
  - 待处理行操作: 违规下架(红) / 正常通过(绿) / 忽略(灰)
  - 违规下架需同时把对应岗位状态改为 banned
  - 侧边栏显示待处理数量角标

### 3. 岗位管理
- **API:** `GET /api/admin/jobs?page_size=100` (列表)  
  `POST /api/admin/jobs` (新增)  
  `PATCH /api/admin/jobs/:id` (编辑)  
  `DELETE /api/admin/jobs/:id` (删除)
- **需求:**
  - 搜索框(按标题) + 国家下拉筛选 + 状态下拉筛选(上架/待审核/下架/已拒绝)
  - 表格展示: 岗位/公司、地点、薪资、状态标签、编辑/删除按钮
  - Modal 弹窗表单字段:
    - 岗位标题 *、公司名称 *、国家 *、城市 *、薪资 *
    - 工作类型(Part-time/Full-time/Contract)
    - 联系平台(whatsapp/telegram/email/external_url)
    - 联系链接 *
    - 岗位描述 *
    - 岗位要求(每行一个)
    - 工作职责(每行一个)
    - 标签(逗号分隔)

### 4. 国家配置
- **API:** `GET /api/admin/countries`  
  `POST /api/admin/countries/:code`  
  `DELETE /api/admin/countries/:code`
- **需求:**
  - 表格展示: 国家代码(如 BR)、显示名称、货币符号、兜底顺序、编辑/删除
  - Modal 弹窗: 国家代码 *、显示名称 *、货币符号、客服链接、兜底顺序(逗号分隔)

### 5. 应用配置
- **API:** `GET /api/admin/configs`  
  `POST /api/admin/configs`
- **需求:**
  - 功能开关卡片: 搜索、筛选、联系入口、举报、分享
  - 版本号输入框
  - 保存按钮

---

## 设计要求

- **PC 桌面端优先**: 宽屏、侧边栏固定、内容区自适应
- **现代简洁**: 圆角卡片、细边框、柔和阴影、清晰层级
- **颜色建议**: 蓝色为主色调，绿色(通过/成功)、黄色(警告/待审)、红色(下架/删除/违规)
- **交互**: Modal、右上角 Toast、表格 hover 效果、侧边栏数字角标
- **加载**: 页面初始化时默认加载"审核中心"

---

## 招聘方提交页 (/submit)

- 独立单页，招聘方用来提交新岗位
- 表单字段同"岗位管理"新增 Modal
- 提交时 status 固定为 `pending`
- 提交成功后显示提示: "岗位提交成功，平台将在 24 小时内审核"
- 风格与 Admin 后台保持一致

---

## 完成流程

1. 修改上述两个 HTML 文件
2. **不要 push 到 git，不要部署**
3. 通知 OpenClaw 说"做好了"
4. 等老大本地确认后，再由 OpenClaw 统一提交部署
