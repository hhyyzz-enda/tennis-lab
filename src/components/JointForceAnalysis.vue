// AI辅助生成：Kimi, 2026-04-22
<!-- JointForceAnalysis.vue -->
<template>
  <div class="analysis-container">
    <!-- 1. 各关节实时发力强度 -->
    <div class="panel bars-panel">
      <div class="panel-title">{{ uiText.realtimeForceTitle }}</div>
      <div class="bars-list">
        <div v-for="joint in joints" :key="joint.key" class="bar-row">
          <span class="bar-label">{{ getJointLabel(joint) }}</span>
          <div class="bar-track">
            <div
              class="bar-fill"
              :style="{
                width: getBarPercent(joint.key) + '%',
                backgroundColor: joint.color
              }"
            />
          </div>
        </div>
      </div>
    </div>

    <!-- 2. 运动链衔接情况 (SVG) -->
    <div class="panel chain-panel">
      <div class="panel-title">{{ uiText.chainTitle }}</div>
      <div class="chain-layout">
        <div class="prompt-side">
          <div class="prompt-side-title">{{ uiText.promptTitle }}</div>
          <div class="prompt-phase">{{ displayedPhasePrompt }}</div>
          <div class="prompt-list">
            <p v-for="item in displayedActivePrompts" :key="item.key" class="prompt-item">
              <span class="prompt-joint">{{ item.label || getJointLabelByKey(item.key) }}</span>
              <span>{{ item.text }}</span>
            </p>
          </div>
        </div>

        <div class="chain-wrapper">
          <svg viewBox="0 0 260 320" class="chain-svg">
            <circle cx="130" cy="24" r="10" fill="none" stroke="rgba(245, 245, 242, 0.9)" stroke-width="2.5" />
            <line x1="130" y1="35" x2="130" y2="98" stroke="rgba(245, 245, 242, 0.72)" stroke-width="3" stroke-linecap="round" />
            <line x1="130" y1="56" x2="84" y2="88" stroke="rgba(245, 245, 242, 0.64)" stroke-width="3" stroke-linecap="round" />
            <line x1="84" y1="88" x2="58" y2="124" stroke="rgba(245, 245, 242, 0.56)" stroke-width="3" stroke-linecap="round" />
            <line x1="130" y1="56" x2="182" y2="78" stroke="rgba(245, 245, 242, 0.72)" stroke-width="3" stroke-linecap="round" />
            <line x1="182" y1="78" x2="216" y2="122" stroke="rgba(245, 245, 242, 0.64)" stroke-width="3" stroke-linecap="round" />
            <line x1="130" y1="98" x2="130" y2="186" stroke="rgba(245, 245, 242, 0.72)" stroke-width="3" stroke-linecap="round" />
            <line x1="130" y1="186" x2="98" y2="234" stroke="rgba(245, 245, 242, 0.58)" stroke-width="3" stroke-linecap="round" />
            <line x1="98" y1="234" x2="98" y2="300" stroke="rgba(245, 245, 242, 0.5)" stroke-width="3" stroke-linecap="round" />
            <line x1="130" y1="186" x2="162" y2="234" stroke="rgba(245, 245, 242, 0.58)" stroke-width="3" stroke-linecap="round" />
            <line x1="162" y1="234" x2="162" y2="300" stroke="rgba(245, 245, 242, 0.5)" stroke-width="3" stroke-linecap="round" />

            <line
              v-for="(joint, i) in joints.slice(0, -1)"
              :key="'link-' + i"
              :x1="getChainJointPoint(joint.key, i).x"
              :y1="getChainJointPoint(joint.key, i).y"
              :x2="getChainJointPoint(joints[i + 1].key, i + 1).x"
              :y2="getChainJointPoint(joints[i + 1].key, i + 1).y"
              :stroke="getLinkColor(i)"
              :stroke-width="getLinkWidth(i)"
              stroke-linecap="round"
            />
            <circle
              v-for="(joint, i) in joints"
              :key="'node-' + i"
              :cx="getChainJointPoint(joint.key, i).x"
              :cy="getChainJointPoint(joint.key, i).y"
              :r="getNodeRadius(joint.key)"
              :fill="getNodeFill(joint.key)"
              :stroke="joint.color"
              stroke-width="2.5"
            />
            <text
              v-for="(joint, i) in joints"
              :key="'text-' + i"
              :x="getChainJointPoint(joint.key, i).x + 20"
              :y="getChainJointPoint(joint.key, i).y - 12"
              font-size="15"
              font-weight="bold"
              fill="rgba(245, 245, 242, 0.92)"
            >{{ getJointLabel(joint) }}</text>
          </svg>
          <div class="chain-legend">
            <div class="legend-item">
              <span class="legend-dot" style="background:#333"></span>
              <span>{{ uiText.legendNode }}</span>
            </div>
            <div class="legend-item">
              <span class="legend-line" style="background:#2ecc71"></span>
              <span>{{ uiText.legendLinkPrefix }} (&gt;{{ syncThresholdValue }})</span>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- 控制条 -->
    <div v-if="!props.hideControls" class="controls">
      <button @click="togglePlay">{{ isPlaying ? uiText.pause : uiText.play }}</button>
      <label class="speed-select-wrap">
        <span class="speed-select-label">{{ uiText.speedModeLabel }}</span>
        <select v-model="speedMode" class="speed-select" :aria-label="uiText.speedModeLabel">
          <option v-for="mode in speedModes" :key="mode.key" :value="mode.key">
            {{ mode.label }}
          </option>
        </select>
      </label>
    </div>

    <PlayCountdownOverlay :visible="showCountdown" :count="countdownValue" />
  </div>
</template>

<script setup>
import { ref, computed, watch, onMounted, onBeforeUnmount } from 'vue'
import PlayCountdownOverlay from './PlayCountdownOverlay.vue'

// ==================== Props ====================
const props = defineProps({
  // 接口地址：开发时 /data/backhand.json，生产时 /api/analysis
  apiUrl: {
    type: String,
    required: true
  },
  // 关节配置（如果 JSON 里带了 meta，这个可省略）
  jointConfig: {
    type: Array,
    default: () => []
  },
  syncThreshold: { type: Number, default: 2.0 },
  maxBarValue:   { type: Number, default: 8.5 },
  playSpeed:     { type: Number, default: 0.03 },
  autoPlay:      { type: Boolean, default: true },
  hideControls:  { type: Boolean, default: false },
  locale: {
    type: String,
    default: 'zh-CN'
  }
})

// ==================== 状态 ====================
const joints = ref([])
const timestamps = ref([])
const angularVelocities = ref({})
const maxVals = ref({})
const currentTime = ref(0)
const duration = ref(0)
const isPlaying = ref(false)
const speedMode = ref('beginnerTraining')
const isCountingDown = ref(false)
const showCountdown = ref(false)
const countdownValue = ref(3)
const syncThresholdValue = ref(props.syncThreshold)
const maxBarValueValue = ref(props.maxBarValue)
const motionTips = ref({})
const playSlowdownFactor = 0.38
const PROMPT_MIN_HOLD_MS = 1200
let rafId = null
let countdownTimer = null
let lastFrameTs = 0
let lastPromptUpdateAt = 0
let pendingPromptState = null

const defaultMotionTips = {
  hip: {
    'zh-CN': '转体送髋，重心向前传递',
    'en-US': 'Drive hip rotation forward and transfer body weight'
  },
  chest: {
    'zh-CN': '胸椎带动躯干旋转，保持核心稳定',
    'en-US': 'Rotate through the chest while keeping core stability'
  },
  shoulder: {
    'zh-CN': '挥拍加速，肩部顺畅前送',
    'en-US': 'Accelerate the swing with smooth shoulder drive'
  },
  elbow: {
    'zh-CN': '小臂鞭打发力，注意击球瞬间制动',
    'en-US': 'Whip through the forearm and control follow-through at contact'
  }
}

const uiDict = {
  'zh-CN': {
    realtimeForceTitle: '各关节实时发力强度',
    chainTitle: '运动链衔接情况',
    promptTitle: '动作提示',
    legendNode: '节点大小/颜色深度表示当前角速度大小',
    legendLinkPrefix: '连线变绿表示相邻关节同步发力',
    play: '播放',
    pause: '暂停',
    speedModeLabel: '速度档位',
    speedNormal: '正常速度',
    speedBeginnerTraining: '新手训练',
    speedBeginnerIntro: '新手启蒙',
    phasePrepare: '准备阶段：放松上肢，保持抛球与节奏稳定',
    phaseHip: '发力起始：下肢蹬转启动，转体送髋',
    phaseChest: '传导阶段：躯干旋转带动肩带向前',
    phaseShoulder: '加速阶段：挥拍提速，锁定击球点',
    phaseElbow: '鞭打阶段：小臂前送，完成击球与收拍',
    phaseGeneric: '动作执行中：保持击球节奏和身体平衡',
    hintLabel: '提示',
    hintPrepare: '当前处于衔接阶段，注意脚步和重心准备',
    joint: {
      hip: '髋',
      chest: '胸',
      shoulder: '肩',
      elbow: '肘'
    }
  },
  'en-US': {
    realtimeForceTitle: 'Real-Time Joint Force Intensity',
    chainTitle: 'Kinetic Chain Coordination',
    promptTitle: 'Movement Cues',
    legendNode: 'Node size/color depth indicates current angular speed',
    legendLinkPrefix: 'Green links indicate synchronized adjacent joint drive',
    play: 'Play',
    pause: 'Pause',
    speedModeLabel: 'Speed Modes',
    speedNormal: 'Normal',
    speedBeginnerTraining: 'Beginner Training',
    speedBeginnerIntro: 'Beginner Intro',
    phasePrepare: 'Preparation: stay relaxed and stabilize toss rhythm',
    phaseHip: 'Initiation: leg drive starts and hips rotate forward',
    phaseChest: 'Transfer: torso rotation carries force to the upper body',
    phaseShoulder: 'Acceleration: increase swing speed and lock contact point',
    phaseElbow: 'Whip: forearm snaps through and completes follow-through',
    phaseGeneric: 'Execution: keep rhythm and whole-body balance',
    hintLabel: 'Hint',
    hintPrepare: 'Transition phase: focus on footwork timing and weight setup',
    joint: {
      hip: 'Hip',
      chest: 'Chest',
      shoulder: 'Shoulder',
      elbow: 'Elbow'
    }
  }
}

const currentLocale = computed(() => props.locale || 'zh-CN')
const localeKey = computed(() => (currentLocale.value === 'en-US' ? 'en-US' : 'zh-CN'))
const uiText = computed(() => uiDict[localeKey.value])
const speedModes = computed(() => [
  { key: 'normal', label: uiText.value.speedNormal },
  { key: 'beginnerTraining', label: uiText.value.speedBeginnerTraining },
  { key: 'beginnerIntro', label: uiText.value.speedBeginnerIntro }
])
const speedModeMultiplier = computed(() => {
  if (speedMode.value === 'normal') return 1.55
  if (speedMode.value === 'beginnerIntro') return 0.62
  return 1
})

function getJointLabelByKey(key) {
  return uiText.value.joint[key] || key
}

function getJointLabel(joint) {
  if (localeKey.value === 'zh-CN') return joint.label || getJointLabelByKey(joint.key)
  return getJointLabelByKey(joint.key)
}

function getLocalizedTip(tipValue, jointKey) {
  if (tipValue && typeof tipValue === 'object') {
    return tipValue[localeKey.value] || tipValue['zh-CN'] || tipValue['en-US'] || ''
  }
  if (typeof tipValue === 'string') {
    if (localeKey.value === 'zh-CN') return tipValue
    return defaultMotionTips[jointKey]?.['en-US'] || tipValue
  }
  return defaultMotionTips[jointKey]?.[localeKey.value] || defaultMotionTips[jointKey]?.['zh-CN'] || ''
}

// ==================== 四元数工具函数 ====================
function quatNorm(q) {
  return Math.sqrt(q[0]**2 + q[1]**2 + q[2]**2 + q[3]**2)
}
function quatMul(a, b) {
  return [
    a[3]*b[0] + a[0]*b[3] + a[1]*b[2] - a[2]*b[1],
    a[3]*b[1] - a[0]*b[2] + a[1]*b[3] + a[2]*b[0],
    a[3]*b[2] + a[0]*b[1] - a[1]*b[0] + a[2]*b[3],
    a[3]*b[3] - a[0]*b[0] - a[1]*b[1] - a[2]*b[2]
  ]
}
function quatConj(q) { return [-q[0], -q[1], -q[2], q[3]] }
function quatToRotVec(q) {
  const w = Math.min(1, Math.max(-1, q[3]))
  const theta = 2 * Math.acos(Math.abs(w))
  if (theta < 1e-6) return [0, 0, 0]
  const s = Math.sin(theta / 2)
  const axis = [q[0]/s, q[1]/s, q[2]/s]
  const norm = Math.sqrt(axis[0]**2 + axis[1]**2 + axis[2]**2)
  if (norm < 1e-6) return [0, 0, 0]
  return axis.map(v => v * theta / norm)
}
function calcAngularSpeed(quats, tArr) {
  const n = quats.length
  const out = new Float64Array(n)
  for (let i = 1; i < n; i++) {
    const dt = tArr[i] - tArr[i-1]
    if (dt <= 0) { out[i] = 0; continue }
    const qPrev = quats[i-1], qCurr = quats[i]
    const n1 = quatNorm(qPrev) || 1, n2 = quatNorm(qCurr) || 1
    const qn1 = qPrev.map(v => v / n1), qn2 = qCurr.map(v => v / n2)
    const qRel = quatMul(qn2, quatConj(qn1))
    const rv = quatToRotVec(qRel)
    out[i] = Math.sqrt(rv[0]**2 + rv[1]**2 + rv[2]**2) / dt
  }
  return Array.from(out)
}
function smooth(arr, window = 15) {
  const n = arr.length, out = new Float64Array(n)
  const half = Math.floor(window / 2)
  for (let i = 0; i < n; i++) {
    let sum = 0, cnt = 0
    for (let j = Math.max(0, i - half); j <= Math.min(n - 1, i + half); j++) {
      sum += arr[j]; cnt++
    }
    out[i] = sum / cnt
  }
  return Array.from(out)
}

function pickCoreJoints(allJoints) {
  if (!Array.isArray(allJoints) || !allJoints.length) return []
  const byLabel = (keywords, usedKeys) => {
    const found = allJoints.find((joint) => {
      if (!joint?.key || usedKeys.has(joint.key)) return false
      const label = String(joint.label || '').toLowerCase()
      return keywords.some((word) => label.includes(word))
    })
    if (!found) return null
    usedKeys.add(found.key)
    return found
  }

  const canonicalMeta = {
    hip: { label: '髋', color: '#f2b233' },
    chest: { label: '胸', color: '#2b5cb8' },
    shoulder: { label: '肩', color: '#49a65a' },
    elbow: { label: '肘', color: '#d9534f' }
  }

  const used = new Set()
  const hip = byLabel(['髋', 'hip', 'pelvis'], used)
  const chest = byLabel(['胸', 'chest', 'thorax'], used)
  const shoulder = byLabel(['右肩', '左肩', '肩', 'shoulder'], used)
  const elbow = byLabel(['右肘', '左肘', '肘', 'elbow'], used)
  if (!hip || !chest || !shoulder || !elbow) return []

  return [
    { key: 'hip', sourceKey: hip.key, ...canonicalMeta.hip },
    { key: 'chest', sourceKey: chest.key, ...canonicalMeta.chest },
    { key: 'shoulder', sourceKey: shoulder.key, ...canonicalMeta.shoulder },
    { key: 'elbow', sourceKey: elbow.key, ...canonicalMeta.elbow }
  ]
}

// ==================== 核心：加载 JSON 数据 ====================
async function loadData(url) {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`HTTP ${res.status}`)
  const json = await res.json()

  // 关节优先级：显式传入 props > 从 meta 自动抽取髋/胸/肩/肘 > meta 原始配置
  const metaJoints = json.meta?.joints || []
  const propJoints = Array.isArray(props.jointConfig) ? props.jointConfig : []
  const coreJoints = pickCoreJoints(metaJoints)
  const resolvedJoints = propJoints.length ? propJoints : (coreJoints.length ? coreJoints : metaJoints)
  if (!resolvedJoints.length) throw new Error('缺少关节配置')
  joints.value = resolvedJoints

  // 归一化时间
  const rawT = json.timestamps
  const t0 = rawT[0]
  const tNorm = rawT.map(v => v - t0)
  timestamps.value = tNorm
  duration.value = tNorm[tNorm.length - 1]

  // 计算角速度
  const vels = {}
  const peaks = {}
  for (const j of resolvedJoints) {
    const sourceKey = j.sourceKey || j.key
    const quats = json.quaternions[sourceKey]
    if (!quats?.length) continue
    vels[j.key] = smooth(calcAngularSpeed(quats, tNorm))
    peaks[j.key] = Math.max(...vels[j.key], 0.01)
  }
  angularVelocities.value = vels
  maxVals.value = peaks

  // 如果 JSON 带了阈值配置，可覆盖 props
  if (json.meta?.threshold) syncThresholdValue.value = json.meta.threshold
  if (json.meta?.maxBar) maxBarValueValue.value = json.meta.maxBar
  motionTips.value = json.meta?.motionTips || {}
}

// ==================== 数据索引与计算 ====================
const dataIndex = computed(() => {
  if (!timestamps.value.length) return 0
  const ratio = currentTime.value / duration.value
  return Math.min(timestamps.value.length - 1, Math.max(0, Math.floor(ratio * timestamps.value.length)))
})
const interpolationInfo = computed(() => {
  const ts = timestamps.value
  const len = ts.length
  if (!len) {
    return { left: 0, right: 0, alpha: 0 }
  }
  if (len === 1 || currentTime.value <= ts[0]) {
    return { left: 0, right: 0, alpha: 0 }
  }
  const lastIndex = len - 1
  if (currentTime.value >= ts[lastIndex]) {
    return { left: lastIndex, right: lastIndex, alpha: 0 }
  }

  let low = 0
  let high = lastIndex
  while (low <= high) {
    const mid = Math.floor((low + high) / 2)
    if (ts[mid] <= currentTime.value && currentTime.value < ts[mid + 1]) {
      const left = mid
      const right = mid + 1
      const span = ts[right] - ts[left] || 1
      const alpha = (currentTime.value - ts[left]) / span
      return { left, right, alpha }
    }
    if (ts[mid] < currentTime.value) {
      low = mid + 1
    } else {
      high = mid - 1
    }
  }
  return { left: 0, right: 0, alpha: 0 }
})

const currentJointValues = computed(() => {
  const { left, right, alpha } = interpolationInfo.value
  const values = {}
  for (const joint of joints.value) {
    const arr = angularVelocities.value[joint.key] || []
    const leftVal = arr[left] ?? 0
    const rightVal = arr[right] ?? leftVal
    values[joint.key] = leftVal + (rightVal - leftVal) * alpha
  }
  return values
})

function getCurrentValue(key) {
  return currentJointValues.value[key] ?? (angularVelocities.value[key]?.[dataIndex.value] ?? 0)
}
function getBarPercent(key) {
  return Math.min(100, (getCurrentValue(key) / maxBarValueValue.value) * 100)
}
function getActivationRatio(key) {
  const max = maxVals.value[key] || 1
  return Math.min(1, getCurrentValue(key) / max)
}
function getChainJointPoint(key, index = 0) {
  const fixed = {
    hip: { x: 130, y: 186 },
    chest: { x: 130, y: 98 },
    shoulder: { x: 182, y: 78 },
    elbow: { x: 216, y: 122 }
  }
  if (fixed[key]) return fixed[key]
  return { x: 70 + index * 32, y: 250 }
}

// ==================== SVG 运动链 ====================
function getNodeRadius(key) {
  const val = getCurrentValue(key)
  const ratio = Math.min(val / maxVals.value[key], 1)
  return 8 + ratio * 14
}
function getNodeFill(key) {
  const val = getCurrentValue(key)
  const ratio = Math.min(val / maxVals.value[key], 1)
  const c = joints.value.find(j => j.key === key).color
  const r = parseInt(c.slice(1, 3), 16), g = parseInt(c.slice(3, 5), 16), b = parseInt(c.slice(5, 7), 16)
  return `rgb(${Math.round(255-(255-r)*ratio)},${Math.round(255-(255-g)*ratio)},${Math.round(255-(255-b)*ratio)})`
}
function getLinkColor(i) {
  const vals = joints.value.map(j => getCurrentValue(j.key))
  const v = vals[i], v2 = vals[i + 1]
  if (v > syncThresholdValue.value && v2 > syncThresholdValue.value) return '#2ecc71'
  if (v > syncThresholdValue.value * 0.5 && v2 > syncThresholdValue.value * 0.5) return '#f1c40f'
  return '#d0d0d0'
}
function getLinkWidth(i) {
  const vals = joints.value.map(j => getCurrentValue(j.key))
  const v = vals[i], v2 = vals[i + 1]
  if (v > syncThresholdValue.value && v2 > syncThresholdValue.value) return 8
  if (v > syncThresholdValue.value * 0.5 && v2 > syncThresholdValue.value * 0.5) return 6
  return 6
}

const dominantJoint = computed(() => {
  if (!joints.value.length) return null
  return joints.value.reduce((best, joint) => {
    const ratio = getActivationRatio(joint.key)
    if (!best || ratio > best.ratio) {
      return { ...joint, ratio }
    }
    return best
  }, null)
})

const phasePrompt = computed(() => {
  if (!dominantJoint.value || dominantJoint.value.ratio < 0.3) {
    return uiText.value.phasePrepare
  }
  const key = dominantJoint.value.key
  if (key === 'hip') return uiText.value.phaseHip
  if (key === 'chest') return uiText.value.phaseChest
  if (key === 'shoulder') return uiText.value.phaseShoulder
  if (key === 'elbow') return uiText.value.phaseElbow
  return uiText.value.phaseGeneric
})

const activePrompts = computed(() => {
  const activeThreshold = 0.58
  const list = joints.value
    .map((joint) => {
      const ratio = getActivationRatio(joint.key)
      const sourceKey = joint.sourceKey || joint.key
      const text = getLocalizedTip(motionTips.value[sourceKey], joint.key)
      return {
        key: joint.key,
        label: getJointLabel(joint),
        text,
        ratio
      }
    })
    .filter((item) => item.ratio >= activeThreshold)
    .sort((a, b) => b.ratio - a.ratio)

  if (list.length) return list
  return [
    {
      key: 'prepare',
      label: uiText.value.hintLabel,
      text: uiText.value.hintPrepare,
      ratio: 0
    }
  ]
})

const displayedPhasePrompt = ref(uiDict['zh-CN'].phasePrepare)
const displayedActivePrompts = ref([
  {
    key: 'prepare',
    label: uiDict['zh-CN'].hintLabel,
    text: uiDict['zh-CN'].hintPrepare,
    ratio: 0
  }
])

function getPromptSignature(phase, prompts) {
  const promptText = prompts.map((item) => `${item.key}:${item.text}`).join('|')
  return `${phase}__${promptText}`
}

function applyPromptState(phase, prompts) {
  displayedPhasePrompt.value = phase
  displayedActivePrompts.value = prompts.map((item) => ({ ...item }))
  lastPromptUpdateAt = Date.now()
}

function flushPendingPrompt() {
  if (!pendingPromptState) return
  if (Date.now() - lastPromptUpdateAt < PROMPT_MIN_HOLD_MS) return
  applyPromptState(pendingPromptState.phase, pendingPromptState.prompts)
  pendingPromptState = null
}

watch(
  [phasePrompt, activePrompts],
  ([nextPhase, nextPrompts]) => {
    const currentSignature = getPromptSignature(displayedPhasePrompt.value, displayedActivePrompts.value)
    const nextSignature = getPromptSignature(nextPhase, nextPrompts)
    if (currentSignature === nextSignature) {
      pendingPromptState = null
      return
    }
    if (Date.now() - lastPromptUpdateAt >= PROMPT_MIN_HOLD_MS) {
      applyPromptState(nextPhase, nextPrompts)
      pendingPromptState = null
      return
    }
    pendingPromptState = {
      phase: nextPhase,
      prompts: nextPrompts
    }
  },
  { immediate: true }
)

watch(
  localeKey,
  () => {
    pendingPromptState = null
    applyPromptState(phasePrompt.value, activePrompts.value)
  },
  { immediate: true }
)

// ==================== 播放控制 ====================
function stopPlayback() {
  isPlaying.value = false
  if (rafId) cancelAnimationFrame(rafId)
  rafId = null
  lastFrameTs = 0
}

function clearCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  isCountingDown.value = false
  showCountdown.value = false
  countdownValue.value = 3
}

function runCountdown() {
  return new Promise((resolve) => {
    clearCountdown()
    isCountingDown.value = true
    showCountdown.value = true
    countdownValue.value = 3
    countdownTimer = setInterval(() => {
      if (countdownValue.value <= 1) {
        clearCountdown()
        resolve(true)
        return
      }
      countdownValue.value -= 1
    }, 720)
  })
}

function startPlayback() {
  isPlaying.value = true
  const animate = (ts) => {
    if (!isPlaying.value) return
    if (!lastFrameTs) lastFrameTs = ts
    const deltaSec = (ts - lastFrameTs) / 1000
    lastFrameTs = ts
    const currentRate = props.playSpeed * playSlowdownFactor * 20 * speedModeMultiplier.value
    currentTime.value += deltaSec * currentRate
    if (currentTime.value >= duration.value) currentTime.value = 0
    flushPendingPrompt()
    rafId = requestAnimationFrame(animate)
  }
  rafId = requestAnimationFrame(animate)
}

async function togglePlay() {
  if (isPlaying.value) {
    stopPlayback()
    return
  }
  if (isCountingDown.value) {
    clearCountdown()
    return
  }
  const shouldStart = await runCountdown()
  if (shouldStart) startPlayback()
}

async function startUnifiedPlayback() {
  if (isPlaying.value || isCountingDown.value) return false
  currentTime.value = 0
  const shouldStart = await runCountdown()
  if (shouldStart) startPlayback()
  return shouldStart
}

function startUnifiedPlaybackDirect() {
  if (isPlaying.value || isCountingDown.value) return false
  currentTime.value = 0
  startPlayback()
  return true
}

function stopUnifiedPlayback() {
  stopPlayback()
  clearCountdown()
}

function resumeUnifiedPlayback() {
  if (isPlaying.value || isCountingDown.value) return false
  startPlayback()
  return true
}

defineExpose({
  startUnifiedPlayback,
  startUnifiedPlaybackDirect,
  stopUnifiedPlayback,
  resumeUnifiedPlayback
})

// ==================== 生命周期 ====================
onMounted(async () => {
  try {
    await loadData(props.apiUrl)
  } catch (err) {
    console.error('数据加载失败:', err)
  }
})
onBeforeUnmount(() => {
  stopPlayback()
  clearCountdown()
})
</script>

<style scoped>
.analysis-container {
  max-width: 980px;
  margin: 0 auto;
  padding: 24px;
  font-family: Inter, system-ui, -apple-system, sans-serif;
  color: #f5f5f2;
}

.panel {
  position: relative;
  overflow: hidden;
  background: rgba(16, 16, 16, 0.68);
  border-radius: 20px;
  border: 1px solid rgba(245, 245, 242, 0.18);
  box-shadow:
    0 18px 36px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(245, 245, 242, 0.08);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  padding: 24px;
  margin-bottom: 20px;
}

.panel::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(120% 72% at 0% 0%, rgba(245, 245, 242, 0.08) 0%, rgba(245, 245, 242, 0) 62%),
    linear-gradient(180deg, rgba(245, 245, 242, 0.05) 0%, rgba(245, 245, 242, 0) 100%);
  pointer-events: none;
}

.panel-title {
  position: relative;
  z-index: 1;
  font-size: 22px;
  font-weight: 800;
  letter-spacing: -0.01em;
  color: #f5f5f2;
  margin-bottom: 16px;
  text-align: center;
}

.bars-list { position: relative; z-index: 1; display: flex; flex-direction: column; gap: 16px; }
.bar-row { display: flex; align-items: center; gap: 12px; }
.bar-label { width: 48px; font-size: 18px; font-weight: 700; color: rgba(245, 245, 242, 0.92); text-align: right; }
.bar-track {
  flex: 1;
  height: 36px;
  background: rgba(245, 245, 242, 0.09);
  border-radius: 10px;
  border: 1px solid rgba(245, 245, 242, 0.16);
  position: relative;
  overflow: visible;
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: inset 0 1px 0 rgba(245, 245, 242, 0.06);
}
.bar-fill { height: 100%; border-radius: 10px; transition: width 0.08s linear; position: relative; display: flex; align-items: center; will-change: width; }
.bar-text-inside { position: absolute; left: 10px; color: #fff; font-size: 15px; font-weight: 700; }
.bar-text-outside { position: absolute; left: calc(100% + 8px); color: rgba(245, 245, 242, 0.9); font-size: 14px; font-weight: 700; white-space: nowrap; }

.chain-layout {
  position: relative;
  z-index: 1;
  display: grid;
  grid-template-columns: minmax(320px, 1fr) minmax(360px, 1.15fr);
  gap: 24px;
  align-items: start;
}

.prompt-side-title {
  font-size: 19px;
  font-weight: 800;
  margin-bottom: 10px;
  color: #f5f5f2;
  letter-spacing: -0.01em;
}

.chain-wrapper { display: flex; flex-direction: column; align-items: center; }
.chain-svg { width: 390px; height: 460px; }
.chain-legend { margin-top: 10px; font-size: 14px; color: rgba(245, 245, 242, 0.82); line-height: 1.9; }
.legend-item { display: flex; align-items: center; gap: 8px; }
.legend-dot { width: 12px; height: 12px; border-radius: 50%; display: inline-block; }
.legend-line { width: 26px; height: 5px; border-radius: 3px; display: inline-block; }

.prompt-phase {
  border-left: 5px solid rgba(245, 245, 242, 0.86);
  padding: 12px 14px;
  background: rgba(245, 245, 242, 0.08);
  border-radius: 12px;
  border: 1px solid rgba(245, 245, 242, 0.2);
  font-size: 20px;
  line-height: 1.6;
  font-weight: 700;
  color: #f5f5f2;
  box-shadow:
    inset 0 1px 0 rgba(245, 245, 242, 0.06),
    0 10px 24px rgba(0, 0, 0, 0.2);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.prompt-list {
  margin-top: 14px;
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.prompt-item {
  margin: 0;
  display: flex;
  align-items: flex-start;
  gap: 10px;
  font-size: 18px;
  font-weight: 600;
  line-height: 1.65;
  color: rgba(245, 245, 242, 0.92);
  padding: 8px 10px;
  border-radius: 10px;
  background: rgba(245, 245, 242, 0.08);
  border: 1px solid rgba(245, 245, 242, 0.18);
  box-shadow:
    inset 0 1px 0 rgba(245, 245, 242, 0.06),
    0 8px 20px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
}

.prompt-joint {
  min-width: 48px;
  padding: 4px 10px;
  border-radius: 999px;
  background: rgba(16, 16, 16, 0.92);
  color: #f4f4f0;
  text-align: center;
  font-size: 14px;
  line-height: 1.4;
  margin-top: 2px;
}

.controls {
  position: relative;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  background: rgba(16, 16, 16, 0.72);
  padding: 14px 18px;
  border-radius: 14px;
  border: 1px solid rgba(245, 245, 242, 0.2);
  box-shadow:
    0 16px 34px rgba(0, 0, 0, 0.24),
    inset 0 1px 0 rgba(245, 245, 242, 0.06);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.controls button {
  position: relative;
  z-index: 1;
  padding: 9px 18px;
  border: none;
  border-radius: 8px;
  background: rgba(245, 245, 242, 0.18);
  color: #f5f5f2;
  cursor: pointer;
  font-size: 15px;
  font-weight: 700;
  border: 1px solid rgba(245, 245, 242, 0.2);
}
.controls button:hover { background: rgba(245, 245, 242, 0.28); }

.speed-select-wrap {
  position: relative;
  z-index: 1;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  padding: 6px 10px;
  border-radius: 10px;
  border: 1px solid rgba(245, 245, 242, 0.18);
  background: rgba(245, 245, 242, 0.08);
  backdrop-filter: blur(6px);
  -webkit-backdrop-filter: blur(6px);
  box-shadow: inset 0 1px 0 rgba(245, 245, 242, 0.06);
}

.speed-select-label {
  font-size: 12px;
  font-weight: 700;
  color: rgba(245, 245, 242, 0.82);
}

.speed-select {
  min-width: 132px;
  border: 1px solid rgba(245, 245, 242, 0.22);
  border-radius: 8px;
  padding: 6px 28px 6px 10px;
  font-size: 13px;
  font-weight: 700;
  color: #f5f5f2;
  background: rgba(16, 16, 16, 0.6);
  cursor: pointer;
  appearance: none;
  -webkit-appearance: none;
  background-image:
    linear-gradient(45deg, transparent 50%, rgba(245, 245, 242, 0.8) 50%),
    linear-gradient(135deg, rgba(245, 245, 242, 0.8) 50%, transparent 50%),
    linear-gradient(180deg, rgba(255, 255, 255, 0), rgba(255, 255, 255, 0));
  background-position:
    calc(100% - 14px) calc(50% - 2px),
    calc(100% - 9px) calc(50% - 2px),
    0 0;
  background-size:
    5px 5px,
    5px 5px,
    100% 100%;
  background-repeat: no-repeat;
}

.speed-select:focus {
  outline: none;
  border-color: rgba(245, 245, 242, 0.42);
  box-shadow: 0 0 0 3px rgba(245, 245, 242, 0.12);
}

@media (max-width: 900px) {
  .analysis-container {
    padding: 16px;
  }

  .panel {
    padding: 18px;
    border-radius: 16px;
  }

  .panel-title {
    font-size: 18px;
    margin-bottom: 12px;
  }

  .bar-label {
    width: 40px;
    font-size: 16px;
  }

  .bar-track {
    height: 30px;
  }

  .chain-layout {
    grid-template-columns: 1fr;
    gap: 14px;
  }

  .chain-wrapper {
    width: 100%;
  }

  .chain-svg {
    width: min(100%, 360px);
    height: auto;
    aspect-ratio: 390 / 460;
  }

  .prompt-side-title {
    font-size: 17px;
    margin-bottom: 8px;
  }

  .prompt-phase {
    font-size: 16px;
    line-height: 1.5;
    padding: 10px 12px;
  }

  .prompt-item {
    font-size: 15px;
    line-height: 1.55;
  }

  .controls {
    justify-content: flex-start;
    flex-wrap: wrap;
  }

  .speed-select-wrap {
    flex-wrap: wrap;
  }
}

@media (max-width: 600px) {
  .analysis-container {
    padding: 12px;
  }

  .panel {
    padding: 14px 12px;
    margin-bottom: 14px;
  }

  .bars-list {
    gap: 10px;
  }

  .bar-row {
    gap: 8px;
  }

  .bar-label {
    width: 34px;
    font-size: 14px;
  }

  .bar-track {
    height: 24px;
    border-radius: 8px;
  }

  .prompt-item {
    gap: 8px;
    font-size: 14px;
    padding: 7px 8px;
  }

  .prompt-joint {
    min-width: 40px;
    padding: 2px 8px;
    font-size: 12px;
  }

  .chain-legend {
    margin-top: 8px;
    font-size: 12px;
    line-height: 1.6;
  }

  .controls {
    padding: 12px;
    gap: 8px;
  }

  .controls button,
  .speed-select-wrap,
  .speed-select {
    width: 100%;
  }

  .controls button {
    min-height: 40px;
  }

  .speed-select-wrap {
    padding: 8px 10px;
  }

  .speed-select-label {
    width: 100%;
  }

  .speed-select {
    min-width: 0;
  }
}
</style>
