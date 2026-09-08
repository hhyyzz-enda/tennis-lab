# Tennis Lab

网球学习与训练平台前端项目，基于 Vue 3 + Vite 构建，支持中英文切换，覆盖课程学习、AI 训练计划、个人中心、论坛交流、教练反馈与站内消息等核心场景。

## 项目特性

- 多模块业务闭环：课程浏览 -> 学习计划 -> 训练反馈 -> 社区互动
- 双语支持：`zh-CN` / `en-US`
- 多数据源模式：支持 `mock` 与 `api` 切换
- 用户体系：注册、登录、邮箱验证码登录、个人信息与密码修改
- 训练能力：AI 训练计划生成、动作分析（关节发力与运动链可视化）

## 技术栈

- 框架：Vue 3
- 构建工具：Vite
- 路由：Vue Router 4
- 国际化：vue-i18n
- UI 组件：Naive UI、Element Plus、Arco Design Vue
- 样式：CSS + Tailwind CSS（已集成）

## 运行环境

- Node.js：`^20.19.0 || >=22.12.0`
- npm：推荐使用最新稳定版

## 快速开始

```bash
npm install
npm run dev
```

启动后默认访问本地 Vite 地址（通常为 `http://localhost:5173`）。

## 常用命令

```bash
# 本地开发
npm run dev

# 生产构建
npm run build

# 本地预览构建产物
npm run preview
```

## 环境变量配置

在项目根目录创建 `.env.local`（或对应环境的 `.env.*`）：

```env
# 通用 API
VITE_TENNIS_API_BASE_URL=http://47.238.94.176:8081
VITE_TENNIS_DATA_SOURCE=api

# 认证与用户
VITE_TENNIS_AUTH_API_BASE_URL=http://47.238.94.176:8081

# 论坛
VITE_POST_API_BASE_URL=http://47.238.94.176:8081

# 聊天
VITE_TENNIS_CHAT_API_BASE_URL=http://47.238.94.176:8081

# AI 训练计划
VITE_TENNIS_AI_API_BASE_URL=http://47.238.94.176:8081/api

# 教练模块
VITE_COACH_API_BASE_URL=http://47.238.94.176:8081
VITE_COACH_DATA_SOURCE=api

# 精品课程
VITE_PREMIUM_COURSE_LIST_API=http://47.238.94.176:8081/api/course/list
VITE_PREMIUM_COURSE_SEARCH_API=http://47.238.94.176:8081/api/course/search/keyword
VITE_PREMIUM_COURSE_DETAIL_API_BASE=http://47.238.94.176:8081/api/course
VITE_PREMIUM_COURSE_ADDED_API=http://47.238.94.176:8081/api/course/added
VITE_PREMIUM_COURSE_ASSET_ORIGIN=http://47.238.94.176:8081
```

说明：

- `VITE_TENNIS_DATA_SOURCE` 可设为 `mock` 或 `api`
- 若未配置部分变量，代码中存在默认回退地址

## 页面与路由（核心）

- `/`：首页
- `/auth`：登录/注册
- `/my-tennis`：个人中心总览
- `/my-tennis/courses`：我的课程
- `/my-tennis/profile`：个人档案
- `/ai-training-plan`：AI 训练计划
- `/tennis-ai`：AI 网球介绍
- `/tennis-ai/courses`：AI 课程列表
- `/tennis-ai/courses/:slug`：AI 课程详情
- `/premium-courses`：精品课程
- `/premium-courses/:id`：精品课程详情
- `/tennis-forum`：网球论坛
- `/tennis-forum/:id`：帖子详情
- `/training-feedback/coaches`：训练教练列表
- `/training-feedback/coaches/:id`：教练详情
- `/messages`：消息列表
- `/messages/:contactId`：会话详情

## 目录结构

```text
src
├─ assets/            静态资源（背景图、页面图片等）
├─ components/        通用组件与业务组件
├─ i18n/              i18n 初始化
├─ locales/           中英文文案
├─ mock/              本地 mock 数据
├─ router/            路由配置
├─ services/          API 与数据访问层
├─ views/             页面级组件
├─ App.vue            根组件
└─ main.js            应用入口
```

## 开发建议

- 推荐 IDE：VS Code + Vue Official (Volar)
- 推荐浏览器插件：Vue.js devtools
- 开发接口不稳定时可切换到 `mock` 数据源保证联调效率

## 打包与部署

```bash
npm run build
npm run preview
```

- 构建产物位于 `dist/`
- 将 `dist/` 部署至静态资源服务器（Nginx、OSS、CDN 等）
- 生产环境请按后端地址配置对应 `VITE_*` 变量
