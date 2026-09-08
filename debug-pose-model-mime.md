[OPEN] pose-model-mime

## 症状
- 发布后，视频实时上传的可视化组件提示“姿态模型加载失败，请检查网络后重试”。
- 浏览器控制台报错：`Failed to load module script: Expected a JavaScript-or-Wasm module script but the server responded with a MIME type of "application/octet-stream"`.

## 当前假设
1. 发布服务器将 `public/mediapipe/vision_bundle.mjs` 以 `application/octet-stream` 返回，导致模块脚本被浏览器拒绝执行。
2. 代码显式请求了 `.mjs` 入口，但当前静态托管环境只对 `.js` 配置了正确 MIME。
3. 构建后的资源路径与运行时代码拼接方式不一致，导致请求落到了错误路由或对象存储回源规则上。
4. `FilesetResolver` 或相关 Mediapipe 初始化逻辑在生产环境使用了需要 ES module 的入口，而本项目部署环境更适合非 module 版本。
5. 发布链路对 `mediapipe/` 目录做了特殊上传或压缩处理，覆盖了默认的静态资源内容类型。

## 计划
- 检查姿态分析组件与 Mediapipe 初始化代码，确认实际请求的资源名和路径。
- 检查构建配置与 `public/mediapipe` 目录，确认产物是否保持原样复制。
- 如有必要，增加最小化埋点，采集生产环境下实际请求 URL 和初始化阶段失败点。

## 已收集证据
- `src/components/LocalPoseAnalysis.vue` 原先在 `initLandmarker()` 中直接动态导入 `/mediapipe/vision_bundle.mjs`。
- 用户提供的浏览器报错明确指向该模块入口返回 `application/octet-stream`，与浏览器对 module script 的 MIME 校验冲突。
- `public/mediapipe/vision_bundle.mjs` 与相关 wasm 资源都存在，问题更接近“发布端 MIME 配置”而非“资源缺失”。
- 构建后 `dist/mediapipe/` 中已确认包含 `vision_bundle.js` 与 `vision_bundle.mjs` 两个入口文件。

## 已实施变更
- 在 `src/components/LocalPoseAnalysis.vue` 中增加最小化调试埋点，记录模块导入开始、导入成功、WASM 初始化成功、初始化失败四个关键点。
- 将姿态模型入口从 `/mediapipe/vision_bundle.mjs` 切换为 `/mediapipe/vision_bundle.js`，规避生产环境对 `.mjs` 返回错误 MIME 的问题。
- 新增 `public/mediapipe/vision_bundle.js`，内容与原 `vision_bundle.mjs` 保持一致，用于静态托管环境兼容。

## 验证结果
- `npm run build` 通过。
- `src/components/LocalPoseAnalysis.vue` 无新增诊断问题。
- 本地 `vite dev` 环境已验证：直接动态导入 `http://127.0.0.1:4173/mediapipe/vision_bundle.js` 成功，不再触发 “This file is in /public ... should not be imported from source code” 错误。
- 待重新发布后在真实环境验证姿态模型是否恢复加载。
