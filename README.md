# Tennis Lab

网球学习与训练平台前端项目，基于 Vue 3 + Vite 构建，支持中英文切换，覆盖课程学习、AI 训练计划、个人中心、论坛交流、教练反馈与站内消息等核心场景。

- 网站地址：https://tennis-lab.cn

## 项目特性

- 多模块业务闭环：课程浏览 -> 学习计划 -> 训练反馈 -> 社区互动
- 双语支持：`zh-CN` / `en-US`
- 多数据源模式：支持 `mock` 与 `api` 切换
- 用户体系：注册、登录、邮箱验证码登录、个人信息与密码修改
- 训练能力：AI 训练计划生成、动作分析（关节发力与运动链可视化、本地视频姿态分析）
- 媒体与内容呈现：图文课程、视频课程、动作标准说明、历史文化与资源整合展示

## 网站模块功能

- 首页：展示品牌入口、核心功能导览、精选内容与课程推荐。
- 登录注册：支持账号注册、密码登录、邮箱验证码登录与基础身份校验。
- 我的网球：聚合个人学习入口，连接我的课程、个人信息、训练数据等内容。
- 我的课程：查看已加入或已学习课程，承接个人学习路径。
- 个人档案：维护头像、昵称、邮箱、密码等个人资料。
- AI 训练计划：根据训练目标生成阶段化训练建议与计划内容。
- AI 网球介绍：介绍平台 AI 能力、训练方式与交互入口。
- AI 课程列表/详情：查看 AI 训练课程，并进入课程详情体验动作讲解、可视化分析与本地视频分析。
- 精品课程：展示平台课程资源，支持列表浏览、关键词搜索、详情查看与加入课程。
- 网球论坛：支持帖子浏览、详情查看与社区交流。
- 训练教练：展示教练列表、教练详情与训练反馈相关内容。
- 站内消息：展示消息联系人列表与会话详情。
- 网球起源/学习资源：补充网球文化、发展历史与学习资料内容，增强知识型体验。

## 动作可视化组件

项目中的动作分析核心集中在 AI 课程详情页，当前包含两类可视化组件：

### 1. 关节发力与运动链可视化（`JointForceAnalysis`）

功能说明：

- 面向标准动作数据做逐时刻播放，展示髋、胸、肩、肘四个关键部位的实时发力强度。
- 用条形图展示当前各关节角速度强弱，帮助用户观察每个部位何时开始发力、谁是当前主导关节。
- 用 SVG 人体骨架和连线展示运动链衔接情况，当相邻关节达到阈值并同步发力时，连线会高亮变色。
- 根据当前主导关节输出阶段提示与动作文案，帮助用户理解“准备 -> 起动 -> 传导 -> 加速 -> 鞭打/释放”的链路。
- 提供播放、暂停、倒计时与不同速度档位，适合演示、教学和新手慢速观察。

实现方式：

- 组件从 `apiUrl` 加载动作 JSON，读取时间戳、关节元信息和四元数序列。
- 通过四元数相对旋转计算角速度，再经过平滑处理，得到四个核心关节的连续角速度曲线。
- 以当前播放时间为基准进行插值，得到每个时刻的实时数值，并映射成条形图宽度、节点大小、节点颜色深浅。
- 运动链区域使用 SVG 绘制固定骨架点位，再按实时角速度判断相邻关节是否同步激活，动态更新连线颜色与粗细。
- 文案层根据当前激活比例选出主导关节，并结合 `motionTips`、中英文词典和节奏保持逻辑输出阶段说明与训练提示。

### 2. 本地视频姿态分析可视化（`LocalPoseAnalysis`）

功能说明：

- 用户可上传自己的本地网球视频，在浏览器中直接完成轻量化 AI 分析。
- 支持选择左右持拍手，适配左右侧挥拍观察。
- 在视频画面上实时叠加肩、肘、髋、胸关键点与骨架连接线，并高亮当前主导发力部位。
- 生成当前动作阶段、有效帧数、动作时长、识别稳定度等摘要指标。
- 通过上下双层发力条，对比“用户当前动作强度”和“课程标准动作参考强度”，给出分阶段反馈建议。

实现方式：

- 组件基于 MediaPipe Pose Landmarker，在前端本地加载模型并逐帧提取人体关键点，不依赖后端完成姿态识别。
- 分析时会按固定步长对视频逐帧采样，得到 landmark 序列，再交给 `src/utils/poseAnalysis.js` 做动作分析。
- 分析逻辑会根据关键点位置关系估算肩、肘、髋、胸四个部位的角速度代理值，并识别当前动作阶段与峰值顺序。
- 结合 `src/mock/poseStandards.json` 中的课程标准动作配置，对用户动作与标准节奏、峰值窗口、速度区间做对齐比较。
- 可视化层一方面在视频 Canvas 覆盖层绘制关键点和骨架，另一方面通过亮条/暗条并置方式展示“当前发力”和“标准参考”差异，并输出针对性的中文/英文反馈。

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

以上路由共同构成了课程学习、AI 训练、社区互动、个人成长与教练反馈几条主要业务链路。

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
