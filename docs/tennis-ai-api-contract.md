# TENNIS AI 后端接口约定

## 环境变量（前端）

在项目根目录创建 `.env.local`：

```env
VITE_TENNIS_DATA_SOURCE=api
VITE_TENNIS_API_BASE_URL=https://your-domain.com
```

- `VITE_TENNIS_DATA_SOURCE`
  - `mock`：只走本地 mock
  - `api`：只走后端接口
  - 其他值：自动模式（有 `VITE_TENNIS_API_BASE_URL` 就走后端）

## 接口 1：课程卡片列表

- Method: `GET`
- Path: `/api/v1/tennis-ai/courses`

### 响应格式（推荐）

```json
{
  "items": [
    {
      "id": "course-forehand-serve",
      "slug": "forehand-serve",
      "title": {
        "zh-CN": "正手发球",
        "en-US": "Forehand Serve"
      },
      "subtitle": {
        "zh-CN": "建立发球节奏与抛球稳定性",
        "en-US": "Build Serving Rhythm and Toss Consistency"
      },
      "level": "L1",
      "durationMinutes": 28,
      "cover": "https://cdn.example.com/images/forehand-serve.jpg",
      "overview": {
        "zh-CN": "从站位、抛球到完整挥拍链路，帮助初学者建立可重复的发球动作。",
        "en-US": "From stance and toss to full swing sequence, this course helps beginners build a repeatable service motion."
      },
      "keyPoints": [
        {
          "zh-CN": "抛球高度与击球点统一",
          "en-US": "Align toss height with contact point"
        }
      ]
    }
  ]
}
```

> 前端也兼容 `[]`（纯数组）或 `{ data: { items: [] } }` 的返回结构。

## 接口 2：课程详情

- Method: `GET`
- Path: `/api/v1/tennis-ai/courses/{slug}`

### 响应格式（推荐）

```json
{
  "data": {
    "id": "course-forehand-serve",
    "slug": "forehand-serve",
    "title": {
      "zh-CN": "正手发球",
      "en-US": "Forehand Serve"
    },
    "subtitle": {
      "zh-CN": "建立发球节奏与抛球稳定性",
      "en-US": "Build Serving Rhythm and Toss Consistency"
    },
    "level": "L1",
    "durationMinutes": 28,
    "cover": "https://cdn.example.com/images/forehand-serve.jpg",
    "overview": {
      "zh-CN": "从站位、抛球到完整挥拍链路，帮助初学者建立可重复的发球动作。",
      "en-US": "From stance and toss to full swing sequence, this course helps beginners build a repeatable service motion."
    },
    "keyPoints": [
      {
        "zh-CN": "抛球高度与击球点统一",
        "en-US": "Align toss height with contact point"
      }
    ],
    "analysis": {
      "component": "JointForceAnalysis",
      "dataUrl": "https://cdn.example.com/analysis/forehand-serve.json",
      "csvUrl": "https://cdn.example.com/analysis/forehand-serve.csv",
      "jointConfig": [
        { "key": "hip", "label": "髋", "color": "#f2b233" },
        { "key": "chest", "label": "胸", "color": "#2b5cb8" },
        { "key": "shoulder", "label": "肩", "color": "#49a65a" },
        { "key": "elbow", "label": "肘", "color": "#d9534f" }
      ],
      "syncThreshold": 2,
      "maxBarValue": 8.5,
      "playSpeed": 0.03,
      "autoPlay": false
    }
  }
}
```

## 字段说明（重点）

- `cover`: 课程卡片/详情顶部图片 URL（后端直出）
- `overview`: 课程介绍（中英）
- `keyPoints`: 课程要点（中英数组）
- `analysis.dataUrl`: AI 可视化训练数据 URL（前端 `JointForceAnalysis` 直接 fetch 这个 URL）
- `analysis.csvUrl`: 原始 CSV 下载地址（前端先预留，不强制使用）

> 当前 `JointForceAnalysis` 需要的是 JSON 数据结构。  
> 如果后端只有 CSV，请在后端先转成该组件可消费的 JSON，或提供一个“CSV 转 JSON”的接口并把结果放在 `dataUrl`。

## 分析数据 JSON（`analysis.dataUrl`）示例

```json
{
  "timestamps": [0.0, 0.02, 0.04],
  "quaternions": {
    "hip": [[0, 0, 0, 1], [0.01, 0.02, 0.01, 0.99]],
    "chest": [[0, 0, 0, 1], [0.02, 0.01, 0.01, 0.99]],
    "shoulder": [[0, 0, 0, 1], [0.03, 0.02, 0.01, 0.99]],
    "elbow": [[0, 0, 0, 1], [0.02, 0.03, 0.02, 0.99]]
  },
  "meta": {
    "joints": [
      { "key": "hip", "label": "髋", "color": "#f2b233" },
      { "key": "chest", "label": "胸", "color": "#2b5cb8" },
      { "key": "shoulder", "label": "肩", "color": "#49a65a" },
      { "key": "elbow", "label": "肘", "color": "#d9534f" }
    ],
    "threshold": 2,
    "maxBar": 8.5
  }
}
```

