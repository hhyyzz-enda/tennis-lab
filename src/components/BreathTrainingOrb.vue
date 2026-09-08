<template>
  <section class="breath-training">
    <p class="kicker">{{ text.kicker }}</p>
    <h3>{{ text.title }}</h3>
    <div class="training-layout">
      <p class="guide" :class="{ empty: !phaseText }">{{ phaseText || text.placeholder }}</p>
      <div class="orb-wrap">
        <div class="orb" :class="{ expanded: isOrbExpanded }" />
        <div class="actions">
          <button v-if="!props.hideStartButton" class="start-btn" :disabled="isBusy" @click="startFlow">
            {{ isRunning ? text.trainingRunning : text.start }}
          </button>
          <p v-if="isRunning" class="round-text">{{ text.roundLabel }} {{ roundsCompleted }} / {{ targetRounds }}</p>
        </div>
      </div>
    </div>

    <Transition name="overlay-fade">
      <div v-if="showGuideOverlay" class="overlay">
        <article class="guide-card" :class="{ leaving: cardLeaving }">
          <button class="card-close" @click="cancelFlow">{{ text.cancel }}</button>
          <p class="card-step">{{ text.stepLabel }} {{ guideIndex + 1 }} / {{ guideSteps.length }}</p>
          <h4>{{ currentGuide.title }}</h4>
          <p>{{ currentGuide.desc }}</p>
          <button class="card-btn" @click="nextGuideCard">{{ text.gotIt }}</button>
        </article>
      </div>
    </Transition>

    <Transition name="overlay-fade">
      <div v-if="showCountdown" class="overlay">
        <article class="countdown-card">
          <p>{{ text.countdownTitle }}</p>
          <span>{{ countdownValue }}</span>
        </article>
      </div>
    </Transition>

    <Transition name="overlay-fade">
      <div v-if="showFinishOverlay" class="overlay">
        <article class="finish-card">
          <button class="card-close" @click="cancelFlow">{{ text.cancel }}</button>
          <h4>{{ text.finishTitle }}</h4>
          <p>{{ text.finishDesc }}</p>
          <div class="finish-actions">
            <button class="card-btn" @click="replayTraining">{{ text.replay }}</button>
            <button class="card-btn ghost" @click="goNextTraining">{{ text.nextTraining }}</button>
          </div>
        </article>
      </div>
    </Transition>
  </section>
</template>

<script setup>
import { computed, onBeforeUnmount, onMounted, ref } from 'vue'

const props = defineProps({
  locale: {
    type: String,
    default: 'zh-CN'
  },
  hideStartButton: {
    type: Boolean,
    default: false
  }
})
const emit = defineEmits(['next-training'])

const targetRounds = 3
const phaseDurationMs = 3800

const phase = ref('inhale')
const isRunning = ref(false)
const roundsCompleted = ref(0)
const showGuideOverlay = ref(false)
const guideIndex = ref(0)
const cardLeaving = ref(false)
const showCountdown = ref(false)
const countdownValue = ref(3)
const showFinishOverlay = ref(false)

let practiceTimer = null
let cardTimer = null
let countdownTimer = null

const dict = {
  'zh-CN': {
    kicker: '训练准备',
    title: '呼吸训练',
    start: '开始呼吸训练',
    trainingRunning: '训练进行中',
    cancel: '取消',
    roundLabel: '已完成回合',
    stepLabel: '步骤',
    gotIt: '知道了',
    countdownTitle: '准备开始',
    finishTitle: '本轮呼吸训练完成',
    finishDesc: '你已完成 3 回合呼吸训练。',
    replay: '再来一次',
    nextTraining: '结束吸气训练并进入下一个训练',
    placeholder: ' ',
    inhale: '吸气（圆球变小）',
    exhale: '呼气（圆球变大）',
    cards: [
      {
        title: '吸气提示',
        desc: '当圆球变小时，请尽力吸气，感受空气慢慢灌满肺部。'
      },
      {
        title: '呼气提示',
        desc: '当圆球变大时，缓缓吐气，保持节奏稳定，不要憋气。'
      },
      {
        title: '训练节奏',
        desc: '接下来就按这个节奏重复，系统将开始倒计时并进行 3 回合训练。'
      }
    ]
  },
  'en-US': {
    kicker: 'Preparation',
    title: 'Breathing Training',
    start: 'Start Breathing Training',
    trainingRunning: 'Training Running',
    cancel: 'Cancel',
    roundLabel: 'Completed Rounds',
    stepLabel: 'Step',
    gotIt: 'Got It',
    countdownTitle: 'Get Ready',
    finishTitle: 'Breathing Session Completed',
    finishDesc: 'You have completed 3 rounds.',
    replay: 'Try Again',
    nextTraining: 'Finish and go to next training',
    placeholder: ' ',
    inhale: 'Inhale (ball gets smaller)',
    exhale: 'Exhale (ball gets bigger)',
    cards: [
      {
        title: 'Inhale Cue',
        desc: 'When the ball gets smaller, inhale deeply and fill your lungs as much as possible.'
      },
      {
        title: 'Exhale Cue',
        desc: 'When the ball gets bigger, exhale slowly and keep a calm rhythm.'
      },
      {
        title: 'Training Rhythm',
        desc: 'Repeat this rhythm. The countdown will begin, followed by 3 training rounds.'
      }
    ]
  }
}

const localeKey = computed(() => (props.locale === 'en-US' ? 'en-US' : 'zh-CN'))
const text = computed(() => dict[localeKey.value])
const guideSteps = computed(() => text.value.cards)
const currentGuide = computed(() => guideSteps.value[guideIndex.value] || guideSteps.value[0])
const isInhale = computed(() => phase.value === 'inhale')
const isOrbExpanded = computed(() => !isRunning.value || phase.value === 'exhale')
const isBusy = computed(() => isRunning.value || showGuideOverlay.value || showCountdown.value)
const phaseText = computed(() => {
  if (!isRunning.value) return ''
  return isInhale.value ? text.value.inhale : text.value.exhale
})

function clearPractice() {
  if (practiceTimer) {
    clearInterval(practiceTimer)
    practiceTimer = null
  }
  isRunning.value = false
}

function clearCardTimer() {
  if (cardTimer) {
    clearTimeout(cardTimer)
    cardTimer = null
  }
}

function clearCountdown() {
  if (countdownTimer) {
    clearInterval(countdownTimer)
    countdownTimer = null
  }
  showCountdown.value = false
  countdownValue.value = 3
}

function startGuide() {
  showFinishOverlay.value = false
  guideIndex.value = 0
  cardLeaving.value = false
  showGuideOverlay.value = true
}

function nextGuideCard() {
  if (cardLeaving.value) return
  cardLeaving.value = true
  clearCardTimer()
  cardTimer = setTimeout(() => {
    cardLeaving.value = false
    if (guideIndex.value < guideSteps.value.length - 1) {
      guideIndex.value += 1
      return
    }
    showGuideOverlay.value = false
    startCountdown()
  }, 280)
}

function startCountdown() {
  clearCountdown()
  showCountdown.value = true
  countdownValue.value = 3
  countdownTimer = setInterval(() => {
    if (countdownValue.value <= 1) {
      clearCountdown()
      startTrainingRounds()
      return
    }
    countdownValue.value -= 1
  }, 850)
}

function startTrainingRounds() {
  clearPractice()
  roundsCompleted.value = 0
  phase.value = 'inhale'
  runPracticeLoop()
}

function runPracticeLoop() {
  isRunning.value = true
  practiceTimer = setInterval(() => {
    if (phase.value === 'inhale') {
      phase.value = 'exhale'
      return
    }
    roundsCompleted.value += 1
    if (roundsCompleted.value >= targetRounds) {
      clearPractice()
      showFinishOverlay.value = true
      return
    }
    phase.value = 'inhale'
  }, phaseDurationMs)
}

function pauseTraining() {
  clearPractice()
  clearCountdown()
  showGuideOverlay.value = false
  cardLeaving.value = false
  clearCardTimer()
  return true
}

function replayTraining() {
  showFinishOverlay.value = false
  startCountdown()
}

function resetToIdle() {
  phase.value = 'exhale'
  roundsCompleted.value = 0
}

function cancelFlow() {
  clearPractice()
  clearCardTimer()
  clearCountdown()
  showGuideOverlay.value = false
  showFinishOverlay.value = false
  cardLeaving.value = false
  guideIndex.value = 0
  resetToIdle()
}

function goNextTraining() {
  showFinishOverlay.value = false
  resetToIdle()
  emit('next-training')
}

function startFlow() {
  if (isBusy.value) return
  startGuide()
}

function startUnified() {
  if (isBusy.value) return false
  showGuideOverlay.value = false
  showFinishOverlay.value = false
  cardLeaving.value = false
  guideIndex.value = 0
  startCountdown()
  return true
}

function startUnifiedDirect() {
  if (isBusy.value) return false
  showGuideOverlay.value = false
  showFinishOverlay.value = false
  cardLeaving.value = false
  guideIndex.value = 0
  startTrainingRounds()
  return true
}

function resumeTraining() {
  if (isRunning.value || isBusy.value) return false
  if (roundsCompleted.value >= targetRounds) return false
  runPracticeLoop()
  return true
}

defineExpose({
  startUnified,
  startUnifiedDirect,
  stopTraining: cancelFlow,
  pauseTraining,
  resumeTraining
})

onMounted(() => {
  resetToIdle()
})

onBeforeUnmount(() => {
  cancelFlow()
})
</script>

<style scoped>
.breath-training {
  margin-bottom: 18px;
  border-radius: 16px;
  padding: 18px;
  background: #ffffff;
  border: 1px solid rgba(16, 16, 16, 0.08);
  box-shadow: 0 10px 24px rgba(16, 16, 16, 0.08);
}

.kicker {
  margin: 0;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 11px;
  color: rgba(16, 16, 16, 0.54);
}

h3 {
  margin: 6px 0 0;
  font-size: clamp(1.2rem, 2.6vw, 1.8rem);
  color: #101010;
}

.guide {
  margin: 0;
  align-self: start;
  width: 220px;
  color: #101010;
  line-height: 1.4;
  font-size: 0.95rem;
  font-weight: 700;
  padding: 7px 10px;
  border-radius: 10px;
  border: 1px solid rgba(16, 16, 16, 0.12);
  background: rgba(16, 16, 16, 0.04);
}

.guide.empty {
  visibility: hidden;
}

.training-layout {
  margin-top: 14px;
  display: grid;
  grid-template-columns: 220px minmax(0, 1fr);
  align-items: start;
  gap: 20px;
}

.orb-wrap {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-self: center;
  min-height: 220px;
  flex: 1;
}

.orb {
  width: 186px;
  height: 186px;
  border-radius: 50%;
  background:
    radial-gradient(circle at 28% 24%, rgba(255, 255, 255, 0.64), rgba(255, 255, 255, 0) 42%),
    radial-gradient(circle at 68% 72%, rgba(16, 16, 16, 0.06), rgba(16, 16, 16, 0) 48%),
    rgba(16, 16, 16, 0.14);
  border: 1px solid rgba(16, 16, 16, 0.14);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.7),
    0 18px 34px rgba(16, 16, 16, 0.14);
  transform: scale(0.84);
  transition: transform 3.8s ease-in-out;
}

.orb.expanded {
  transform: scale(1.18);
}

.actions {
  margin-top: 30px;
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: center;
  text-align: center;
  gap: 12px;
}

.start-btn {
  min-height: 40px;
  border: 0;
  border-radius: 999px;
  padding: 0 18px;
  color: #f5f5f2;
  background: #101010;
  font-weight: 700;
  cursor: pointer;
}

.start-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.round-text {
  margin: 0;
  font-size: 0.92rem;
  color: rgba(16, 16, 16, 0.72);
}

.overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  background: rgba(10, 10, 10, 0.44);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.guide-card,
.finish-card,
.countdown-card {
  position: relative;
  width: min(560px, calc(100vw - 28px));
  border-radius: 18px;
  padding: 24px;
  background: rgba(255, 255, 255, 0.96);
  border: 1px solid rgba(16, 16, 16, 0.1);
  box-shadow:
    0 24px 52px rgba(0, 0, 0, 0.25),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.countdown-card {
  width: min(260px, calc(100vw - 28px));
  text-align: center;
}

.card-close {
  position: absolute;
  top: 10px;
  right: 10px;
  min-width: 58px;
  min-height: 30px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.14);
  background: rgba(16, 16, 16, 0.06);
  color: rgba(16, 16, 16, 0.72);
  font-size: 12px;
  font-weight: 700;
  cursor: pointer;
}

.guide-card {
  transition: transform 0.26s ease, opacity 0.26s ease;
}

.guide-card.leaving {
  transform: translateY(-34px) rotate(-4deg) scale(0.98);
  opacity: 0;
}

.card-step {
  margin: 0;
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(16, 16, 16, 0.56);
}

h4 {
  margin: 8px 0 0;
  font-size: 1.35rem;
  color: #101010;
}

.guide-card p,
.finish-card p {
  margin-top: 12px;
  line-height: 1.7;
  color: rgba(16, 16, 16, 0.8);
}

.card-btn {
  margin-top: 14px;
  min-height: 42px;
  border-radius: 999px;
  border: 0;
  padding: 0 18px;
  color: #f5f5f2;
  background: #101010;
  font-weight: 700;
  cursor: pointer;
}

.card-btn.ghost {
  color: #101010;
  background: rgba(16, 16, 16, 0.08);
  border: 1px solid rgba(16, 16, 16, 0.14);
}

.finish-actions {
  margin-top: 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.countdown-card p {
  margin: 0;
  color: rgba(16, 16, 16, 0.66);
}

.countdown-card span {
  display: block;
  margin-top: 8px;
  font-size: 70px;
  line-height: 1;
  font-weight: 800;
  color: #101010;
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.22s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

@media (max-width: 760px) {
  .training-layout {
    display: flex;
    flex-direction: column;
    align-items: stretch;
  }

  .guide {
    width: 100%;
    min-height: 0;
  }

  .actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
