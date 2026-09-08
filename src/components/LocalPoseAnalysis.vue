<template>
  <section class="local-analysis">
    <header class="module-head">
      <p class="kicker">{{ text.kicker }}</p>
      <h3>{{ text.title }}</h3>
      <p class="lead">{{ text.lead }}</p>
    </header>

    <div class="controls">
      <label class="upload-field">
        <span>{{ text.uploadLabel }}</span>
        <div class="upload-picker">
          <input
            ref="fileInputRef"
            class="upload-input-hidden"
            type="file"
            accept="video/*"
            @change="handleFileChange"
          />
          <button type="button" class="upload-trigger" @click="openFilePicker">
            {{ text.selectFile }}
          </button>
          <span class="upload-file-name">{{ selectedFileName || text.noFileChosen }}</span>
        </div>
      </label>

      <label class="side-field">
        <span>{{ text.sideLabel }}</span>
        <select v-model="dominantSide">
          <option value="right">{{ text.rightHand }}</option>
          <option value="left">{{ text.leftHand }}</option>
        </select>
      </label>

      <button
        type="button"
        class="analyze-btn"
        :disabled="!videoUrl || isAnalyzing"
        @click="runAnalysis"
      >
        {{ isAnalyzing ? text.analyzing : text.analyze }}
      </button>
    </div>

    <p v-if="statusText" class="status">{{ statusText }}</p>
    <p v-if="errorText" class="status status-error">{{ errorText }}</p>

    <div class="preview-grid">
      <div class="video-card">
        <div class="preview-stage">
          <video
            ref="previewVideoRef"
            :src="videoUrl || ''"
            controls
            preload="metadata"
            playsinline
            class="preview-video"
            @timeupdate="syncPreviewTime"
            @loadedmetadata="syncPreviewDuration"
          />
          <canvas ref="overlayCanvasRef" class="overlay-canvas" />
          <div v-if="analysisResult" class="overlay-hint">
            <span class="overlay-dot" :style="{ background: activeJointAccent }" />
            <span>{{ overlayHintText }}</span>
          </div>
        </div>

        <div v-if="analysisResult" class="scrub-wrap">
          <div class="scrub-head">
            <span>{{ text.scrubLabel }}</span>
            <span>{{ formatTime(previewTime) }} / {{ formatTime(previewDuration) }}</span>
          </div>
          <input
            v-model.number="previewTime"
            type="range"
            min="0"
            :max="Math.max(previewDuration, 0)"
            step="0.01"
            class="scrub-input"
            @input="handleScrub"
          />
        </div>
      </div>

      <div class="summary-card">
        <template v-if="analysisResult">
          <div class="summary-top">
            <p class="summary-label">{{ text.currentPhase }}</p>
            <h4>{{ phaseText }}</h4>
            <span>{{ standardTitle }}</span>
          </div>

          <div class="summary-metrics">
            <div class="metric">
              <span>{{ text.frameCount }}</span>
              <strong>{{ analysisResult.frameCount }}</strong>
            </div>
            <div class="metric">
              <span>{{ text.duration }}</span>
              <strong>{{ formatTime(analysisResult.duration) }}</strong>
            </div>
            <div class="metric">
              <span>{{ text.visibility }}</span>
              <strong>{{ visibilityPercent }}</strong>
            </div>
          </div>

          <div class="prompt-list">
            <p class="prompt-title">{{ text.feedbackTitle }}</p>
            <p v-for="item in feedbackPromptList" :key="item" class="prompt-item">{{ item }}</p>
          </div>
        </template>

        <template v-else>
          <div class="empty-box">
            <p>{{ text.emptyTitle }}</p>
            <span>{{ text.emptyDesc }}</span>
          </div>
        </template>
      </div>
    </div>

    <div v-if="analysisResult" class="bars-card">
      <div class="bars-head">
        <h4>{{ text.forceTitle }}</h4>
        <span>{{ text.forceHint }}</span>
      </div>

      <div class="bar-row" v-for="joint in joints" :key="joint.key">
        <div class="bar-side">
          <div class="joint-badge" :style="{ '--joint-accent': joint.accent }">
            <span>{{ joint.marker }}</span>
          </div>
          <div class="bar-meta">
            <strong>{{ joint.label }}</strong>
            <span>{{ currentValueText(joint.key) }}</span>
          </div>
        </div>
        <div class="bar-track">
          <div
            class="bar-shadow"
            :style="{ width: `${getStandardBarPercent(joint.key)}%`, '--joint-accent': joint.accent }"
          />
          <div
            class="bar-fill"
            :style="{ width: `${getBarPercent(joint.key)}%`, background: joint.color, '--joint-accent': joint.accent }"
          >
            <span class="bar-sheen" />
          </div>
        </div>
      </div>
    </div>

    <video ref="analysisVideoRef" :src="videoUrl || ''" preload="metadata" playsinline class="hidden-video" />
  </section>
</template>

<script setup>
import { computed, nextTick, onBeforeUnmount, onMounted, ref, shallowRef, watch } from 'vue'
import standards from '../mock/poseStandards.json'
import {
  analyzePoseFrames,
  getPhaseKey,
  getValuesAtIndex
} from '../utils/poseAnalysis'

const props = defineProps({
  courseSlug: {
    type: String,
    default: ''
  },
  locale: {
    type: String,
    default: 'zh-CN'
  }
})

const uiDict = {
  'zh-CN': {
    kicker: '本地视频上传',
    title: '上传你自己的视频做 AI 简版分析',
    lead: '本模块会在浏览器本地提取姿态关键点，输出肩、肘、髋、胸四个部位的角速度代理值，并与课程标准动作做简版对比。',
    uploadLabel: '选择本地网球视频',
    selectFile: '选择文件',
    noFileChosen: '请选择视频文件',
    sideLabel: '持拍手',
    rightHand: '右手持拍',
    leftHand: '左手持拍',
    analyze: '开始分析',
    analyzing: '分析中...',
    initializing: '正在加载姿态模型...',
    extracting: '正在提取逐帧关键点...',
    finished: '分析完成，可拖动视频查看当前阶段发力。',
    noFile: '请先选择本地视频文件。',
    noFrames: '没有识别到足够的人体关键点，请换一段更清晰、人物完整的视频再试。',
    modelError: '姿态模型加载失败，请检查网络后重试。',
    genericError: '视频分析失败，请换一段更短或更清晰的视频。',
    scrubLabel: '按时间查看当前动作',
    currentPhase: '当前阶段',
    frameCount: '有效帧',
    duration: '动作时长',
    visibility: '识别稳定度',
    feedbackTitle: '反馈建议',
    emptyTitle: '选择视频后即可开始',
    emptyDesc: '建议使用单人、侧前方视角、3~10 秒的网球挥拍视频。',
    forceTitle: '当前四关节发力条',
    forceHint: '上层亮条为当前发力，下层暗条会按当前识别出的动作阶段对齐标准参考强度，不代表真实肌肉力。',
    joints: {
      hip: '髋',
      chest: '胸',
      shoulder: '肩',
      elbow: '肘'
    },
    phases: {
      prepare: '准备阶段：先稳定站位和节奏',
      hip: '起动阶段：下肢与髋部开始带动',
      chest: '传导阶段：胸廓与躯干向前传递',
      shoulder: '加速阶段：肩部开始主导挥拍',
      elbow: '释放阶段：前臂与肘部完成加速'
    },
    promptCodes: {
      'hip-drive-weak': '髋部峰值偏弱，下肢和转髋带动不够明显。',
      'hip-drive-good': '髋部启动比较积极，下肢带动表现较好。',
      'chest-transfer-late': '胸部承接偏慢，躯干传导有些滞后。',
      'chest-transfer-good': '胸部承接顺畅，躯干传导比较连贯。',
      'shoulder-early': '肩部启动早于胸部，容易出现手臂抢拍。',
      'shoulder-underactive': '肩部加速不够明显，挥拍前送不足。',
      'elbow-early': '肘部释放偏早，击球前容易提前打开。',
      'elbow-lagging': '肘部释放偏慢，击球末端不够干脆。',
      'arm-dominant': '肘部峰值过高，当前动作更偏手臂主导。',
      'chain-sync-weak': '关节衔接不同步，发力链条不够连贯。',
      'chain-order-good': '整体发力顺序较清晰，运动链衔接表现不错。',
      'prepare-stable': '准备阶段比较稳定，节奏和重心控制良好。',
      'timing-balanced': '当前阶段各环节配合较均衡，发力节奏比较自然。',
      fallback: '当前视频已经完成基础分析，可继续拖动视频观察不同阶段。'
    }
  },
  'en-US': {
    kicker: 'Local Upload',
    title: 'Upload Your Own Video for a Lightweight AI Analysis',
    lead: 'This module extracts pose landmarks in the browser, estimates shoulder/elbow/hip/chest velocity proxies, and compares them with the lesson reference.',
    uploadLabel: 'Choose a local tennis video',
    selectFile: 'Choose File',
    noFileChosen: 'Select a video file',
    sideLabel: 'Racket Side',
    rightHand: 'Right-handed',
    leftHand: 'Left-handed',
    analyze: 'Analyze Video',
    analyzing: 'Analyzing...',
    initializing: 'Loading pose model...',
    extracting: 'Extracting frame landmarks...',
    finished: 'Analysis ready. Scrub the video to inspect the current phase.',
    noFile: 'Please choose a local video first.',
    noFrames: 'Not enough body landmarks were detected. Try a clearer single-player clip.',
    modelError: 'Failed to load the pose model. Please check your network and retry.',
    genericError: 'Video analysis failed. Try a shorter or clearer clip.',
    scrubLabel: 'Scrub to inspect the movement',
    currentPhase: 'Current Phase',
    frameCount: 'Frames',
    duration: 'Duration',
    visibility: 'Stability',
    feedbackTitle: 'Feedback',
    emptyTitle: 'Choose a video to begin',
    emptyDesc: 'A 3-10 second single-player tennis clip from a side/front-side angle works best.',
    forceTitle: 'Current Four-Joint Force Bars',
    forceHint: 'The upper bright lane shows current force, while the lower shadow lane aligns the reference pattern to the detected movement phase. These are angular velocity proxies, not actual muscle force.',
    joints: {
      hip: 'Hip',
      chest: 'Chest',
      shoulder: 'Shoulder',
      elbow: 'Elbow'
    },
    phases: {
      prepare: 'Preparation: settle stance and rhythm',
      hip: 'Initiation: legs and hips begin the drive',
      chest: 'Transfer: trunk and chest pass force forward',
      shoulder: 'Acceleration: shoulder takes over swing speed',
      elbow: 'Release: elbow and forearm complete acceleration'
    },
    promptCodes: {
      'hip-drive-weak': 'Hip peak looks weak, so lower-body drive is limited.',
      'hip-drive-good': 'Hip initiation looks active, so lower-body drive is in a good place.',
      'chest-transfer-late': 'Chest transfer arrives late and breaks trunk continuity.',
      'chest-transfer-good': 'Chest transfer looks smooth and keeps the trunk chain connected.',
      'shoulder-early': 'Shoulder fires before the chest, suggesting an arm-led swing.',
      'shoulder-underactive': 'Shoulder acceleration looks limited and the forward drive is not fully built.',
      'elbow-early': 'Elbow releases too early before contact.',
      'elbow-lagging': 'Elbow release is late, so the finish looks less decisive.',
      'arm-dominant': 'Elbow peak is too dominant, so the swing leans too much on the arm.',
      'chain-sync-weak': 'Joint timing is not well synchronized, so the force chain looks fragmented.',
      'chain-order-good': 'The overall force order looks clear with decent chain timing.',
      'prepare-stable': 'Preparation looks stable, with solid balance and rhythm.',
      'timing-balanced': 'The current phase looks well balanced, with natural force timing.',
      fallback: 'The base analysis is ready. Scrub the video to inspect each phase.'
    }
  }
}

const joints = computed(() => {
  const labels = text.value.joints
  const markers =
    localeKey.value === 'zh-CN'
      ? { hip: '髋', chest: '胸', shoulder: '肩', elbow: '肘' }
      : { hip: 'H', chest: 'C', shoulder: 'S', elbow: 'E' }

  return [
    {
      key: 'hip',
      label: labels.hip,
      marker: markers.hip,
      accent: '#f2b233',
      color: 'linear-gradient(90deg, #f2b233, #f7cf72)'
    },
    {
      key: 'chest',
      label: labels.chest,
      marker: markers.chest,
      accent: '#2b5cb8',
      color: 'linear-gradient(90deg, #2b5cb8, #5f8ae4)'
    },
    {
      key: 'shoulder',
      label: labels.shoulder,
      marker: markers.shoulder,
      accent: '#49a65a',
      color: 'linear-gradient(90deg, #49a65a, #75ca87)'
    },
    {
      key: 'elbow',
      label: labels.elbow,
      marker: markers.elbow,
      accent: '#d9534f',
      color: 'linear-gradient(90deg, #d9534f, #f07c78)'
    }
  ]
})

const previewVideoRef = ref(null)
const analysisVideoRef = ref(null)
const overlayCanvasRef = ref(null)
const fileInputRef = ref(null)
const videoUrl = ref('')
const previewTime = ref(0)
const previewDuration = ref(0)
const dominantSide = ref('right')
const statusText = ref('')
const errorText = ref('')
const isAnalyzing = ref(false)
const analysisResult = ref(null)
const analyzedFrames = ref([])
const poseLandmarker = shallowRef(null)
const objectUrl = ref('')
const selectedFileName = ref('')
const appBaseUrl = new URL(import.meta.env.BASE_URL, window.location.origin)
const resolvePublicAssetUrl = (assetPath) =>
  new URL(assetPath.replace(/^\/+/, ''), appBaseUrl).href.replace(/\/$/, '')
const mediapipeBase = resolvePublicAssetUrl('mediapipe')
const mediapipeModulePath = resolvePublicAssetUrl('mediapipe/vision_bundle.js')
let overlayRafId = 0

const OVERLAY_INDEX = {
  leftShoulder: 11,
  rightShoulder: 12,
  leftElbow: 13,
  rightElbow: 14,
  leftWrist: 15,
  rightWrist: 16,
  leftHip: 23,
  rightHip: 24
}

const localeKey = computed(() => (props.locale === 'en-US' ? 'en-US' : 'zh-CN'))
const text = computed(() => uiDict[localeKey.value])

const standardConfig = computed(() => standards[props.courseSlug] || standards.default)
const standardTitle = computed(() => {
  const title = standardConfig.value?.title || {}
  return title[localeKey.value] || title['zh-CN'] || ''
})

const standardPeakCenters = computed(() => {
  const order = standardConfig.value?.peakOrder || ['hip', 'chest', 'shoulder', 'elbow']
  const baseCenters = [0.24, 0.44, 0.66, 0.84]
  return order.reduce((map, key, index) => {
    map[key] = baseCenters[index] ?? (0.24 + index * 0.2)
    return map
  }, {})
})

const standardPhaseWindows = computed(() => {
  const order = standardConfig.value?.peakOrder || ['hip', 'chest', 'shoulder', 'elbow']
  const centers = standardPeakCenters.value

  return order.reduce((map, key, index) => {
    const center = centers[key] ?? 0.5
    const prevCenter = index > 0 ? centers[order[index - 1]] : null
    const nextCenter = index < order.length - 1 ? centers[order[index + 1]] : null
    map[key] = {
      start: prevCenter == null ? 0.08 : (prevCenter + center) / 2,
      center,
      end: nextCenter == null ? 0.94 : (center + nextCenter) / 2
    }
    return map
  }, {})
})

const currentIndex = computed(() => {
  if (!analysisResult.value?.timestamps?.length) return 0
  const timestamps = analysisResult.value.timestamps
  let index = 0
  while (index < timestamps.length - 1 && timestamps[index + 1] <= previewTime.value) {
    index += 1
  }
  return index
})

const currentValues = computed(() => {
  if (!analysisResult.value) return { hip: 0, chest: 0, shoulder: 0, elbow: 0 }
  return getValuesAtIndex(analysisResult.value.velocities, currentIndex.value)
})

const phaseText = computed(() => {
  if (!analysisResult.value) return text.value.phases.prepare
  const phaseKey = getPhaseKey(currentValues.value, analysisResult.value.peaks)
  return text.value.phases[phaseKey] || text.value.phases.prepare
})

const visibilityPercent = computed(() => {
  const visibility = analysisResult.value?.averageVisibility || 0
  return `${Math.round(visibility * 100)}%`
})

const localizedPromptList = computed(() => {
  if (!analysisResult.value) return []
  const codes = analysisResult.value.comparison?.promptCodes || []
  const localized = codes
    .map((code) => {
      if (code === 'hip-drive-weak') {
        const baseline = standardConfig.value?.velocityBands?.hip?.[0] || 8
        const peak = analysisResult.value?.peaks?.hip?.value || 0
        return buildPromptText(code, {
          gapRatio: (baseline - peak) / Math.max(baseline, 1)
        })
      }

      if (code === 'chest-transfer-late') {
        const chestProgress = analysisResult.value?.peaks?.chest?.progress || 0
        const hipProgress = analysisResult.value?.peaks?.hip?.progress || 0
        return buildPromptText(code, {
          gapRatio: Math.max(0, chestProgress - hipProgress),
          leadJointLabel: text.value.joints.hip,
          lagJointLabel: text.value.joints.chest
        })
      }

      if (code === 'shoulder-early') {
        const chestProgress = analysisResult.value?.peaks?.chest?.progress || 0
        const shoulderProgress = analysisResult.value?.peaks?.shoulder?.progress || 0
        return buildPromptText(code, {
          gapRatio: Math.max(0, chestProgress - shoulderProgress)
        })
      }

      if (code === 'elbow-early') {
        const shoulderProgress = analysisResult.value?.peaks?.shoulder?.progress || 0
        const elbowProgress = analysisResult.value?.peaks?.elbow?.progress || 0
        return buildPromptText(code, {
          gapRatio: Math.max(0, shoulderProgress - elbowProgress)
        })
      }

      if (code === 'arm-dominant') {
        const elbowPeak = analysisResult.value?.peaks?.elbow?.value || 0
        const shoulderPeak = analysisResult.value?.peaks?.shoulder?.value || 0
        return buildPromptText(code, {
          gapRatio: Math.max(0, elbowPeak - shoulderPeak) / Math.max(elbowPeak, 1)
        })
      }

      return buildPromptText(code)
    })
    .filter(Boolean)

  return localized.length ? localized : [buildPromptText('fallback')]
})

const currentRatios = computed(() => {
  const keys = ['hip', 'chest', 'shoulder', 'elbow']
  return keys.reduce((map, key) => {
    const current = currentValues.value[key] || 0
    const peak = analysisResult.value?.peaks?.[key]?.value || 1
    map[key] = current / Math.max(peak, 1)
    return map
  }, {})
})

const currentPhaseKey = computed(() => {
  if (!analysisResult.value) return 'prepare'
  return getPhaseKey(currentValues.value, analysisResult.value.peaks)
})

const alignedStandardProgress = computed(() => {
  if (!analysisResult.value) return 0

  const phase = currentPhaseKey.value
  const ratios = currentRatios.value
  const phaseWindows = standardPhaseWindows.value
  const order = standardConfig.value?.peakOrder || ['hip', 'chest', 'shoulder', 'elbow']
  const firstPhase = order[0] || 'hip'
  const firstWindow = phaseWindows[firstPhase] || { start: 0.08 }

  if (phase === 'prepare') {
    const warmup = Math.max(...Object.values(ratios), 0)
    const prepareProgress = Math.min(1, warmup / 0.28)
    return firstWindow.start * prepareProgress
  }

  const window = phaseWindows[phase]
  if (!window) {
    const duration = analysisResult.value?.duration || previewDuration.value || 0
    if (!duration) return 0
    return Math.min(1, Math.max(0, previewTime.value / duration))
  }

  const phaseRatio = Math.min(1, Math.max(0, ratios[phase] || 0))
  const nextPhaseIndex = order.indexOf(phase) + 1
  const nextPhaseKey = nextPhaseIndex > 0 && nextPhaseIndex < order.length ? order[nextPhaseIndex] : ''
  const nextPhaseRatio = nextPhaseKey ? Math.min(1, Math.max(0, ratios[nextPhaseKey] || 0)) : 0

  if (nextPhaseRatio > 0.3) {
    const carry = Math.min(1, nextPhaseRatio / 0.85)
    return window.center + (window.end - window.center) * carry
  }

  return window.start + (window.center - window.start) * phaseRatio
})

const activeJointKey = computed(() => {
  const phase = currentPhaseKey.value
  return phase === 'prepare' ? 'shoulder' : phase
})

const activeJointConfig = computed(() => joints.value.find((joint) => joint.key === activeJointKey.value) || joints.value[0])

const activeJointAccent = computed(() => activeJointConfig.value?.accent || '#ffffff')

const overlayHintText = computed(() => {
  const label = activeJointConfig.value?.label || ''
  return localeKey.value === 'zh-CN' ? `当前高亮：${label}` : `Highlight: ${label}`
})

const formatPercentNumber = (value) => `${Math.max(0, Math.round(value * 100))}%`

const buildPromptText = (code, context = {}) => {
  const isZh = localeKey.value === 'zh-CN'
  const { gapRatio = 0, leadJointLabel = '', lagJointLabel = '' } = context
  const gapText = formatPercentNumber(gapRatio)

  if (isZh) {
    const map = {
      'hip-drive-weak': `当前髋部发力低于参考区间，约偏弱 ${gapText}，下肢和转髋带动还不够明显。`,
      'hip-drive-good': `当前髋部启动积极，领先带动约 ${gapText}，下肢发力基础较好。`,
      'chest-transfer-late': `当前${lagJointLabel || '胸部'}承接慢于${leadJointLabel || '髋部'}，传导落后约 ${gapText}，躯干力量衔接偏弱。`,
      'chest-transfer-good': `当前${lagJointLabel || '胸部'}承接顺畅，与${leadJointLabel || '髋部'}衔接差值控制在 ${gapText}，传导比较连贯。`,
      'shoulder-early': `当前肩部启动早于胸部，领先约 ${gapText}，容易出现手臂抢拍。`,
      'shoulder-underactive': `当前肩部加速低于胸部约 ${gapText}，挥拍前送还不够充分。`,
      'elbow-early': `当前肘部释放快于肩部约 ${gapText}，击球前有提前打开的倾向。`,
      'elbow-lagging': `当前肘部释放慢于肩部约 ${gapText}，末端加速还可以更干脆。`,
      'arm-dominant': `当前肘部输出高于肩部约 ${gapText}，动作更偏手臂主导。`,
      'chain-sync-weak': `当前相邻关节的节奏差约 ${gapText}，发力链条同步性不足。`,
      'chain-order-good': '当前整体发力顺序较清晰，髋胸肩肘的衔接比较顺畅。',
      'prepare-stable': '当前准备阶段比较稳定，重心控制和引拍节奏都比较从容。',
      'timing-balanced': `当前各关节节奏差控制在 ${gapText} 内，整体配合比较均衡。`,
      fallback: '当前视频已经完成基础分析，可继续拖动视频观察不同阶段。'
    }
    return map[code] || map.fallback
  }

  const map = {
    'hip-drive-weak': `Hip drive is about ${gapText} below the expected band, so lower-body loading still looks limited.`,
    'hip-drive-good': `Hip initiation is leading well by about ${gapText}, so lower-body drive looks solid.`,
    'chest-transfer-late': `${lagJointLabel || 'Chest'} transfer trails ${leadJointLabel || 'hip'} by about ${gapText}, so trunk linkage looks late.`,
    'chest-transfer-good': `${lagJointLabel || 'Chest'} is staying within about ${gapText} of the ${leadJointLabel || 'hip'}, so transfer looks connected.`,
    'shoulder-early': `The shoulder is leading the chest by about ${gapText}, suggesting an arm-led swing.`,
    'shoulder-underactive': `The shoulder is about ${gapText} behind the chest, so forward acceleration still looks limited.`,
    'elbow-early': `The elbow is releasing about ${gapText} earlier than the shoulder and may open too soon.`,
    'elbow-lagging': `The elbow is trailing the shoulder by about ${gapText}, so the release could be sharper.`,
    'arm-dominant': `Elbow output is about ${gapText} higher than the shoulder, so the swing looks arm-dominant.`,
    'chain-sync-weak': `Adjacent joint timing differs by about ${gapText}, so the force chain looks less synchronized.`,
    'chain-order-good': 'The overall force sequence looks clear, with smooth hip-chest-shoulder-elbow transfer.',
    'prepare-stable': 'The preparation phase looks stable, with calm balance and rhythm.',
    'timing-balanced': `Joint timing stays within about ${gapText}, so the current phase looks balanced.`,
    fallback: 'Base analysis is ready. Scrub the video to inspect each phase.'
  }
  return map[code] || map.fallback
}

const phasePromptText = computed(() => {
  if (!analysisResult.value) return ''
  const phase = currentPhaseKey.value
  const isZh = localeKey.value === 'zh-CN'

  if (isZh) {
    const phaseMap = {
      prepare: '当前处于准备阶段，先稳定重心和引拍节奏，再进入发力传导。',
      hip: '当前主要由髋部启动，注意把下肢与转髋力量继续传向上半身。',
      chest: '当前进入胸廓传导阶段，核心保持稳定，避免力量在胸肩之间断开。',
      shoulder: '当前肩部正在主导加速，注意不要过早抢拍，继续顺势前送。',
      elbow: '当前肘部进入释放阶段，保持挥拍连贯，避免提前锁死手臂。'
    }
    return phaseMap[phase] || phaseMap.prepare
  }

  const phaseMap = {
    prepare: 'You are in the preparation phase. Stabilize balance and rhythm before acceleration.',
    hip: 'The hips are driving now. Keep sending lower-body force upward through the chain.',
    chest: 'The trunk transfer phase is active. Keep the core stable and avoid breaking the chain.',
    shoulder: 'The shoulder is leading acceleration now. Avoid arming the swing too early.',
    elbow: 'The elbow is in the release phase. Keep the swing connected and avoid locking too early.'
  }
  return phaseMap[phase] || phaseMap.prepare
})

const currentIssuePromptList = computed(() => {
  if (!analysisResult.value) return []

  const prompts = []
  const ratios = currentRatios.value
  const phase = currentPhaseKey.value
  const current = currentValues.value
  const standardBands = standardConfig.value?.velocityBands || {}
  const timingSpread = Math.max(...Object.values(ratios)) - Math.min(...Object.values(ratios))

  if (phase === 'prepare' && Math.max(...Object.values(ratios)) < 0.22) {
    prompts.push(buildPromptText('prepare-stable'))
  }

  if (phase === 'hip' && current.hip < ((standardBands.hip?.[0] || 8) * 0.9)) {
    const baseline = standardBands.hip?.[0] || 8
    prompts.push(
      buildPromptText('hip-drive-weak', {
        gapRatio: (baseline - current.hip) / Math.max(baseline, 1)
      })
    )
  }

  if (phase === 'hip' && ratios.hip > Math.max(ratios.chest, ratios.shoulder) * 1.18) {
    prompts.push(
      buildPromptText('hip-drive-good', {
        gapRatio: Math.max(0, ratios.hip - Math.max(ratios.chest, ratios.shoulder))
      })
    )
  }

  if ((phase === 'chest' || phase === 'shoulder') && ratios.chest < ratios.hip * 0.78) {
    prompts.push(
      buildPromptText('chest-transfer-late', {
        gapRatio: Math.max(0, ratios.hip - ratios.chest),
        leadJointLabel: text.value.joints.hip,
        lagJointLabel: text.value.joints.chest
      })
    )
  }

  if ((phase === 'chest' || phase === 'shoulder') && Math.abs(ratios.chest - ratios.hip) < 0.16) {
    prompts.push(
      buildPromptText('chest-transfer-good', {
        gapRatio: Math.abs(ratios.chest - ratios.hip),
        leadJointLabel: text.value.joints.hip,
        lagJointLabel: text.value.joints.chest
      })
    )
  }

  if (phase === 'shoulder' && current.shoulder > current.chest * 1.18) {
    prompts.push(
      buildPromptText('shoulder-early', {
        gapRatio: (current.shoulder - current.chest) / Math.max(current.shoulder, 1)
      })
    )
  }

  if (phase === 'shoulder' && current.shoulder < current.chest * 0.82) {
    prompts.push(
      buildPromptText('shoulder-underactive', {
        gapRatio: (current.chest - current.shoulder) / Math.max(current.chest, 1)
      })
    )
  }

  if (phase === 'elbow' && current.elbow > current.shoulder * 1.12) {
    prompts.push(
      buildPromptText('elbow-early', {
        gapRatio: (current.elbow - current.shoulder) / Math.max(current.elbow, 1)
      })
    )
  }

  if (phase === 'elbow' && current.elbow < current.shoulder * 0.78) {
    prompts.push(
      buildPromptText('elbow-lagging', {
        gapRatio: (current.shoulder - current.elbow) / Math.max(current.shoulder, 1)
      })
    )
  }

  if ((phase === 'shoulder' || phase === 'elbow') && ratios.elbow > ratios.shoulder * 1.15) {
    prompts.push(
      buildPromptText('arm-dominant', {
        gapRatio: Math.max(0, ratios.elbow - ratios.shoulder)
      })
    )
  }

  if (timingSpread > 0.42) {
    prompts.push(
      buildPromptText('chain-sync-weak', {
        gapRatio: timingSpread
      })
    )
  }

  if (timingSpread < 0.16 && phase !== 'prepare') {
    prompts.push(
      buildPromptText('timing-balanced', {
        gapRatio: timingSpread
      })
    )
  }

  return [...new Set(prompts)].filter(Boolean)
})

const feedbackPromptList = computed(() => {
  if (!analysisResult.value) return []

  const phasePrompt = phasePromptText.value
  const currentPrompts = currentIssuePromptList.value
  const comparisonPrompts = localizedPromptList.value

  return [phasePrompt, ...currentPrompts, ...comparisonPrompts].filter(Boolean).slice(0, 4)
})

const handleFileChange = (event) => {
  const file = event.target?.files?.[0]
  resetAnalysis()
  if (!file) {
    clearVideoUrl()
    return
  }
  clearVideoUrl()
  selectedFileName.value = file.name
  const url = URL.createObjectURL(file)
  objectUrl.value = url
  videoUrl.value = url
}

const openFilePicker = () => {
  fileInputRef.value?.click()
}

const clearVideoUrl = () => {
  if (objectUrl.value) {
    URL.revokeObjectURL(objectUrl.value)
  }
  objectUrl.value = ''
  videoUrl.value = ''
  selectedFileName.value = ''
  if (fileInputRef.value) {
    fileInputRef.value.value = ''
  }
  previewTime.value = 0
  previewDuration.value = 0
  clearOverlay()
}

const resetAnalysis = () => {
  statusText.value = ''
  errorText.value = ''
  analysisResult.value = null
  analyzedFrames.value = []
  clearOverlay()
}

const formatTime = (seconds) => {
  const safe = Math.max(0, Number(seconds) || 0)
  const minutes = Math.floor(safe / 60)
  const remain = Math.floor(safe % 60)
  return `${minutes}:${String(remain).padStart(2, '0')}`
}

const currentValueText = (key) => `${(currentValues.value[key] || 0).toFixed(1)} / ${(analysisResult.value?.peaks?.[key]?.value || 0).toFixed(1)}`

const getTrackMax = (key) => {
  const userPeak = analysisResult.value?.peaks?.[key]?.value || 0
  const standardPeak = standardConfig.value?.velocityBands?.[key]?.[1] || 0
  return Math.max(userPeak, standardPeak, 1)
}

const getStandardProgress = () => {
  return alignedStandardProgress.value
}

const getStandardCurrentValue = (key) => {
  const peak = standardConfig.value?.velocityBands?.[key]?.[1] || 0
  if (!peak) return 0

  const center = standardPeakCenters.value[key] ?? 0.5
  const progress = getStandardProgress()
  const distance = Math.abs(progress - center)
  const width = key === 'hip' ? 0.2 : key === 'chest' ? 0.18 : 0.16
  const pulse = Math.exp(-Math.pow(distance, 2) / (2 * Math.pow(width, 2)))
  const baseLift = progress < 0.08 ? 0.04 : 0.08
  return peak * Math.min(1, baseLift + pulse * 0.92)
}

const getBarPercent = (key) => {
  const current = currentValues.value[key] || 0
  return Math.min(100, (current / getTrackMax(key)) * 100)
}

const getStandardBarPercent = (key) => {
  const standardValue = getStandardCurrentValue(key)
  return Math.min(100, (standardValue / getTrackMax(key)) * 100)
}

const syncPreviewTime = () => {
  previewTime.value = previewVideoRef.value?.currentTime || 0
}

const syncPreviewDuration = () => {
  previewDuration.value = previewVideoRef.value?.duration || 0
  queueOverlayDraw()
}

const handleScrub = () => {
  if (!previewVideoRef.value) return
  previewVideoRef.value.currentTime = previewTime.value
  queueOverlayDraw()
}

const getFrameByTime = (time) => {
  const frames = analyzedFrames.value
  if (!frames.length) return null
  let index = 0
  while (index < frames.length - 1 && frames[index + 1].t <= time) {
    index += 1
  }
  return frames[index]
}

const getLandmark = (landmarks, index) => landmarks?.[index] || null

const midPoint = (a, b, ratio = 0.5) => {
  if (!a || !b) return null
  return {
    x: a.x + (b.x - a.x) * ratio,
    y: a.y + (b.y - a.y) * ratio,
    visibility: Math.min(a.visibility ?? 1, b.visibility ?? 1)
  }
}

const drawPoint = (ctx, point, canvas, options = {}) => {
  if (!point) return
  const visibility = point.visibility ?? 1
  if (visibility < 0.25) return
  const x = point.x * canvas.width
  const y = point.y * canvas.height
  const radius = options.radius || 7

  if (options.glow) {
    ctx.beginPath()
    ctx.fillStyle = `${options.glow}33`
    ctx.arc(x, y, radius * 2.2, 0, Math.PI * 2)
    ctx.fill()
  }

  ctx.beginPath()
  ctx.fillStyle = options.fill || '#ffffff'
  ctx.arc(x, y, radius, 0, Math.PI * 2)
  ctx.fill()

  ctx.lineWidth = 2
  ctx.strokeStyle = options.stroke || 'rgba(255,255,255,0.86)'
  ctx.stroke()

  if (options.label) {
    ctx.font = '600 12px Arial'
    ctx.fillStyle = '#f5f5f2'
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.48)'
    ctx.lineWidth = 4
    ctx.strokeText(options.label, x + 10, y - 10)
    ctx.fillText(options.label, x + 10, y - 10)
  }
}

const drawLine = (ctx, from, to, canvas, color = 'rgba(255,255,255,0.36)', width = 2) => {
  if (!from || !to) return
  const minVisibility = Math.min(from.visibility ?? 1, to.visibility ?? 1)
  if (minVisibility < 0.2) return
  ctx.beginPath()
  ctx.moveTo(from.x * canvas.width, from.y * canvas.height)
  ctx.lineTo(to.x * canvas.width, to.y * canvas.height)
  ctx.strokeStyle = color
  ctx.lineWidth = width
  ctx.stroke()
}

const resizeOverlayCanvas = () => {
  const canvas = overlayCanvasRef.value
  const videoEl = previewVideoRef.value
  if (!canvas || !videoEl) return
  const rect = videoEl.getBoundingClientRect()
  if (!rect.width || !rect.height) return
  const ratio = window.devicePixelRatio || 1
  canvas.width = Math.round(rect.width * ratio)
  canvas.height = Math.round(rect.height * ratio)
  canvas.style.width = `${rect.width}px`
  canvas.style.height = `${rect.height}px`
}

const clearOverlay = () => {
  const canvas = overlayCanvasRef.value
  if (!canvas) return
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
}

const drawOverlay = () => {
  const canvas = overlayCanvasRef.value
  const videoEl = previewVideoRef.value
  if (!canvas || !videoEl || !analysisResult.value) {
    clearOverlay()
    return
  }

  resizeOverlayCanvas()
  const ctx = canvas.getContext('2d')
  if (!ctx) return
  ctx.clearRect(0, 0, canvas.width, canvas.height)
  const ratio = window.devicePixelRatio || 1
  ctx.save()
  ctx.scale(ratio, ratio)
  ctx.clearRect(0, 0, canvas.width, canvas.height)

  const logicalCanvas = {
    width: canvas.width / ratio,
    height: canvas.height / ratio
  }
  const frame = getFrameByTime(previewTime.value)
  if (!frame?.landmarks?.length) {
    ctx.restore()
    return
  }

  const landmarks = frame.landmarks
  const isLeft = dominantSide.value === 'left'
  const shoulder = getLandmark(landmarks, isLeft ? OVERLAY_INDEX.leftShoulder : OVERLAY_INDEX.rightShoulder)
  const elbow = getLandmark(landmarks, isLeft ? OVERLAY_INDEX.leftElbow : OVERLAY_INDEX.rightElbow)
  const wrist = getLandmark(landmarks, isLeft ? OVERLAY_INDEX.leftWrist : OVERLAY_INDEX.rightWrist)
  const hip = getLandmark(landmarks, isLeft ? OVERLAY_INDEX.leftHip : OVERLAY_INDEX.rightHip)
  const leftShoulder = getLandmark(landmarks, OVERLAY_INDEX.leftShoulder)
  const rightShoulder = getLandmark(landmarks, OVERLAY_INDEX.rightShoulder)
  const leftHip = getLandmark(landmarks, OVERLAY_INDEX.leftHip)
  const rightHip = getLandmark(landmarks, OVERLAY_INDEX.rightHip)
  const shoulderMid = midPoint(leftShoulder, rightShoulder)
  const hipMid = midPoint(leftHip, rightHip)
  const chest = shoulderMid && hipMid ? midPoint(shoulderMid, hipMid, 0.3) : shoulderMid

  drawLine(ctx, leftShoulder, rightShoulder, logicalCanvas, 'rgba(255,255,255,0.28)', 2)
  drawLine(ctx, leftHip, rightHip, logicalCanvas, 'rgba(255,255,255,0.22)', 2)
  drawLine(ctx, shoulderMid, hipMid, logicalCanvas, 'rgba(255,255,255,0.2)', 2)
  drawLine(ctx, shoulder, elbow, logicalCanvas, 'rgba(255,255,255,0.38)', 3)
  drawLine(ctx, elbow, wrist, logicalCanvas, 'rgba(255,255,255,0.28)', 2.5)
  drawLine(ctx, shoulder, hip, logicalCanvas, 'rgba(255,255,255,0.18)', 2)

  const configByKey = joints.value.reduce((map, joint) => {
    map[joint.key] = joint
    return map
  }, {})

  const pointMap = {
    shoulder,
    elbow,
    hip,
    chest
  }

  Object.entries(pointMap).forEach(([key, point]) => {
    const joint = configByKey[key]
    const isActive = key === activeJointKey.value
    drawPoint(ctx, point, logicalCanvas, {
      fill: joint?.accent || '#ffffff',
      stroke: isActive ? 'rgba(255,255,255,0.95)' : 'rgba(255,255,255,0.62)',
      glow: isActive ? joint?.accent : null,
      radius: isActive ? 8 : 6,
      label: joint?.label || key
    })
  })

  ctx.restore()
}

const queueOverlayDraw = () => {
  cancelAnimationFrame(overlayRafId)
  overlayRafId = requestAnimationFrame(drawOverlay)
}

const waitForVideoMetadata = (videoEl) =>
  new Promise((resolve, reject) => {
    if (!videoEl) {
      reject(new Error('video-not-found'))
      return
    }
    if (videoEl.readyState >= 1 && Number.isFinite(videoEl.duration)) {
      resolve(true)
      return
    }
    const cleanup = () => {
      videoEl.removeEventListener('loadedmetadata', onLoaded)
      videoEl.removeEventListener('error', onError)
    }
    const onLoaded = () => {
      cleanup()
      resolve(true)
    }
    const onError = () => {
      cleanup()
      reject(new Error('video-metadata-error'))
    }
    videoEl.addEventListener('loadedmetadata', onLoaded, { once: true })
    videoEl.addEventListener('error', onError, { once: true })
    videoEl.load()
  })

const seekVideo = (videoEl, time) =>
  new Promise((resolve, reject) => {
    if (!videoEl) {
      reject(new Error('video-not-found'))
      return
    }
    const target = Math.min(Math.max(time, 0), Math.max((videoEl.duration || 0) - 0.001, 0))
    if (Math.abs((videoEl.currentTime || 0) - target) < 0.005) {
      requestAnimationFrame(() => resolve(true))
      return
    }
    const cleanup = () => {
      videoEl.removeEventListener('seeked', onSeeked)
      videoEl.removeEventListener('error', onError)
    }
    const onSeeked = () => {
      cleanup()
      resolve(true)
    }
    const onError = () => {
      cleanup()
      reject(new Error('video-seek-error'))
    }
    videoEl.addEventListener('seeked', onSeeked, { once: true })
    videoEl.addEventListener('error', onError, { once: true })
    videoEl.currentTime = target
  })

const initLandmarker = async () => {
  if (poseLandmarker.value) return poseLandmarker.value

  statusText.value = text.value.initializing
  try {
    const mp = await import(/* @vite-ignore */ mediapipeModulePath)
    const vision = await mp.FilesetResolver.forVisionTasks(
      `${mediapipeBase}/wasm`
    )
    poseLandmarker.value = await mp.PoseLandmarker.createFromOptions(vision, {
      baseOptions: {
        modelAssetPath: `${mediapipeBase}/pose_landmarker_lite.task`
      },
      runningMode: 'VIDEO',
      numPoses: 1
    })
    return poseLandmarker.value
  } catch (error) {
    throw new Error('model-load-failed')
  }
}

const collectFrames = async (videoEl, landmarker) => {
  const duration = videoEl.duration || 0
  const fps = duration > 8 ? 12 : 15
  const step = 1 / fps
  const estimatedFrames = Math.max(1, Math.ceil(duration / step))
  const frames = []

  for (let index = 0; index < estimatedFrames; index += 1) {
    const time = Math.min(index * step, Math.max(duration - 0.001, 0))
    await seekVideo(videoEl, time)
    const result = landmarker.detectForVideo(videoEl, Math.round(time * 1000))
    const landmarks = result?.landmarks?.[0]
    if (landmarks?.length) {
      frames.push({ t: time, landmarks })
    }
    statusText.value = `${text.value.extracting} ${index + 1}/${estimatedFrames}`
  }

  return frames
}

const runAnalysis = async () => {
  if (!videoUrl.value) {
    errorText.value = text.value.noFile
    return
  }

  resetAnalysis()
  isAnalyzing.value = true

  try {
    const landmarker = await initLandmarker()
    const analyzer = analysisVideoRef.value
    const preview = previewVideoRef.value
    await Promise.all([waitForVideoMetadata(analyzer), waitForVideoMetadata(preview)])

    const frames = await collectFrames(analyzer, landmarker)
    if (frames.length < 8) {
      throw new Error('not-enough-frames')
    }

    analyzedFrames.value = frames
    analysisResult.value = analyzePoseFrames(frames, {
      side: dominantSide.value,
      standard: standardConfig.value
    })

    previewDuration.value = preview.duration || analysisResult.value.duration || 0
    previewTime.value = 0
    statusText.value = text.value.finished
    await nextTick()
    queueOverlayDraw()
  } catch (error) {
    if (error.message === 'model-load-failed') {
      errorText.value = text.value.modelError
    } else if (error.message === 'not-enough-frames') {
      errorText.value = text.value.noFrames
    } else {
      errorText.value = text.value.genericError
    }
  } finally {
    isAnalyzing.value = false
  }
}

watch(previewTime, () => {
  queueOverlayDraw()
})

watch(
  () => analysisResult.value,
  () => {
    nextTick(() => {
      queueOverlayDraw()
    })
  }
)

onMounted(() => {
  window.addEventListener('resize', queueOverlayDraw)
})

onBeforeUnmount(() => {
  window.removeEventListener('resize', queueOverlayDraw)
  cancelAnimationFrame(overlayRafId)
  if (poseLandmarker.value && typeof poseLandmarker.value.close === 'function') {
    poseLandmarker.value.close()
  }
  clearVideoUrl()
})
</script>

<style scoped>
.local-analysis {
  position: relative;
  z-index: 1;
  color: #f5f5f2;
}

.module-head h3 {
  margin: 0;
  font-size: 24px;
}

.kicker {
  margin: 0 0 8px;
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(245, 245, 242, 0.7);
}

.lead {
  margin: 10px 0 0;
  line-height: 1.7;
  color: rgba(245, 245, 242, 0.86);
}

.controls {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 12px;
  align-items: end;
}

.upload-field,
.side-field {
  display: flex;
  flex-direction: column;
  gap: 8px;
  min-width: 200px;
  flex: 1 1 220px;
}

.upload-field span,
.side-field span {
  font-size: 13px;
  font-weight: 700;
  color: rgba(245, 245, 242, 0.8);
}

.side-field select,
.analyze-btn {
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(245, 245, 242, 0.18);
  background: rgba(255, 255, 255, 0.08);
  color: #f5f5f2;
  padding: 0 14px;
}

.upload-picker {
  min-height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(245, 245, 242, 0.18);
  background: rgba(255, 255, 255, 0.08);
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 6px 10px;
}

.upload-input-hidden {
  display: none;
}

.upload-trigger {
  flex: 0 0 auto;
  min-height: 32px;
  border: 0;
  border-radius: 10px;
  background: rgba(245, 245, 242, 0.94);
  color: #101010;
  padding: 0 14px;
  font-size: 13px;
  font-weight: 700;
  cursor: pointer;
}

.upload-file-name {
  min-width: 0;
  flex: 1 1 auto;
  font-size: 13px;
  color: rgba(245, 245, 242, 0.82);
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.side-field select {
  appearance: none;
}

.analyze-btn {
  cursor: pointer;
  font-weight: 700;
  background: rgba(245, 245, 242, 0.92);
  color: #101010;
  flex: 0 0 auto;
}

.analyze-btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.status {
  margin: 14px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.08);
  color: rgba(245, 245, 242, 0.88);
}

.status-error {
  background: rgba(217, 83, 79, 0.18);
  color: #ffd7d5;
}

.preview-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: minmax(0, 1.15fr) minmax(300px, 0.85fr);
  gap: 16px;
}

.video-card,
.summary-card,
.bars-card {
  border-radius: 18px;
  border: 1px solid rgba(245, 245, 242, 0.16);
  background: rgba(255, 255, 255, 0.06);
  padding: 16px;
}

.preview-stage {
  position: relative;
  border-radius: 14px;
  overflow: hidden;
}

.preview-video {
  display: block;
  width: 100%;
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.35);
}

.overlay-canvas {
  position: absolute;
  inset: 0;
  z-index: 2;
  pointer-events: none;
}

.overlay-hint {
  position: absolute;
  top: 12px;
  left: 12px;
  z-index: 3;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 999px;
  background: rgba(0, 0, 0, 0.38);
  border: 1px solid rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  font-size: 12px;
  color: rgba(245, 245, 242, 0.92);
  pointer-events: none;
}

.overlay-dot {
  width: 9px;
  height: 9px;
  border-radius: 50%;
  box-shadow: 0 0 12px currentColor;
}

.scrub-wrap {
  margin-top: 12px;
}

.scrub-head {
  display: flex;
  justify-content: space-between;
  gap: 12px;
  font-size: 13px;
  color: rgba(245, 245, 242, 0.78);
}

.scrub-input {
  width: 100%;
  margin-top: 8px;
}

.summary-top h4 {
  margin: 6px 0;
  font-size: 22px;
  line-height: 1.35;
}

.summary-top span,
.summary-label {
  color: rgba(245, 245, 242, 0.74);
}

.summary-label {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}

.summary-metrics {
  margin-top: 16px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.metric {
  border-radius: 14px;
  background: rgba(0, 0, 0, 0.18);
  padding: 12px;
}

.metric span {
  display: block;
  font-size: 12px;
  color: rgba(245, 245, 242, 0.7);
}

.metric strong {
  display: block;
  margin-top: 6px;
  font-size: 18px;
}

.prompt-list {
  margin-top: 16px;
}

.prompt-title {
  margin: 0 0 10px;
  font-size: 13px;
  font-weight: 700;
  color: rgba(245, 245, 242, 0.78);
}

.prompt-item {
  margin: 8px 0 0;
  padding: 10px 12px;
  border-radius: 12px;
  background: rgba(255, 255, 255, 0.06);
  line-height: 1.65;
}

.empty-box {
  min-height: 100%;
  display: grid;
  place-content: center;
  gap: 8px;
  text-align: center;
}

.empty-box p {
  margin: 0;
  font-size: 20px;
  font-weight: 700;
}

.empty-box span {
  color: rgba(245, 245, 242, 0.74);
  line-height: 1.7;
}

.bars-card {
  margin-top: 16px;
}

.bars-head {
  display: flex;
  justify-content: space-between;
  gap: 14px;
  align-items: baseline;
}

.bars-head h4 {
  margin: 0;
  font-size: 20px;
}

.bars-head span {
  font-size: 12px;
  color: rgba(245, 245, 242, 0.72);
}

.bar-row + .bar-row {
  margin-top: 16px;
}

.bar-row {
  display: grid;
  grid-template-columns: minmax(132px, 180px) minmax(0, 1fr);
  gap: 14px;
  align-items: center;
}

.bar-side {
  display: flex;
  align-items: center;
  gap: 12px;
}

.joint-badge {
  width: 42px;
  height: 42px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  background:
    radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.24), transparent 56%),
    color-mix(in srgb, var(--joint-accent) 78%, #101010 22%);
  border: 1px solid color-mix(in srgb, var(--joint-accent) 72%, white 28%);
  box-shadow:
    0 10px 24px color-mix(in srgb, var(--joint-accent) 24%, transparent),
    inset 0 1px 0 rgba(255, 255, 255, 0.22);
  flex: 0 0 42px;
}

.joint-badge span {
  font-size: 14px;
  font-weight: 800;
  color: #fff;
  letter-spacing: 0.02em;
}

.bar-meta {
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.bar-meta strong {
  font-size: 15px;
}

.bar-meta span {
  font-size: 13px;
  color: rgba(245, 245, 242, 0.72);
}

.bar-track {
  position: relative;
  height: 24px;
  border-radius: 999px;
  overflow: hidden;
  background:
    linear-gradient(180deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.02));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.08),
    inset 0 0 0 1px rgba(255, 255, 255, 0.06);
}

.bar-shadow {
  position: absolute;
  left: 0;
  bottom: 3px;
  height: 8px;
  border-radius: 999px;
  background:
    linear-gradient(90deg, color-mix(in srgb, var(--joint-accent) 24%, transparent), color-mix(in srgb, var(--joint-accent) 46%, rgba(255, 255, 255, 0.1)));
  opacity: 0.65;
  filter: saturate(0.72);
  box-shadow:
    0 0 0 1px color-mix(in srgb, var(--joint-accent) 18%, transparent) inset,
    0 0 18px color-mix(in srgb, var(--joint-accent) 18%, transparent);
  transition: width 0.32s ease, opacity 0.28s ease;
  pointer-events: none;
}

.bar-fill {
  position: absolute;
  left: 0;
  top: 3px;
  height: 11px;
  border-radius: 999px;
  z-index: 1;
  transition:
    width 0.34s cubic-bezier(0.22, 1, 0.36, 1),
    filter 0.28s ease,
    box-shadow 0.28s ease;
  box-shadow:
    0 0 0 1px rgba(255, 255, 255, 0.06) inset,
    0 0 18px color-mix(in srgb, var(--joint-accent) 38%, transparent);
  will-change: width;
  overflow: hidden;
  transform: translateZ(0);
}

.bar-fill::after {
  content: '';
  position: absolute;
  right: 4px;
  top: 50%;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.35);
  box-shadow:
    0 0 12px rgba(255, 255, 255, 0.32),
    0 0 20px color-mix(in srgb, var(--joint-accent) 42%, transparent);
  transform: translateY(-50%);
}

.bar-sheen {
  position: absolute;
  inset: 0;
  background: linear-gradient(110deg, transparent 10%, rgba(255, 255, 255, 0.18) 46%, transparent 78%);
  animation: bar-sheen 2.4s ease-in-out infinite;
  pointer-events: none;
}

@keyframes bar-sheen {
  0% {
    transform: translateX(-120%);
    opacity: 0;
  }

  20% {
    opacity: 0.45;
  }

  65% {
    transform: translateX(120%);
    opacity: 0.2;
  }

  100% {
    transform: translateX(120%);
    opacity: 0;
  }
}

.hidden-video {
  width: 0;
  height: 0;
  opacity: 0;
  pointer-events: none;
  position: absolute;
}

@media (max-width: 900px) {
  .preview-grid {
    grid-template-columns: 1fr;
  }

  .summary-metrics {
    grid-template-columns: 1fr;
  }

  .bars-head {
    flex-direction: column;
    align-items: flex-start;
  }

  .bar-row {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}
</style>
