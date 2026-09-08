<template>
  <section class="course-detail">
    <p v-if="loading" class="status">{{ $t('page.tennisAiCourseDetail.loading') }}</p>
    <p v-else-if="error" class="status status-error">{{ $t('page.tennisAiCourseDetail.error') }}</p>
    <p v-else-if="!course" class="status status-error">{{ $t('page.tennisAiCourseDetail.empty') }}</p>

    <template v-else>
      <nav class="jump-nav" :aria-label="$t('page.tennisAiCourseDetail.jumpNav.ariaLabel')">
        <button
          v-for="item in jumpItems"
          :key="item.key"
          type="button"
          class="jump-btn"
          :class="{ active: activeSection === item.key }"
          @click="changeSection(item.key)"
        >
          {{ item.label }}
        </button>
      </nav>

      <div class="section-stage">
        <Transition name="card-switch" mode="out-in">
          <div :key="activeSection" class="stage-card">
            <template v-if="activeSection === 'intro'">
              <div class="intro-layout">
                <div class="hero">
                  <img :src="course.cover" :alt="localize(course.title)" />
                  <div class="overlay" />
                  <div class="hero-meta">
                    <p>{{ course.level }} / {{ course.durationMinutes }} min</p>
                    <h1>{{ localize(course.title) }}</h1>
                    <span>{{ localize(course.subtitle) }}</span>
                  </div>
                </div>
                <div class="content">
                  <h2>{{ $t('page.tennisAiCourseDetail.overview') }}</h2>
                  <p>{{ localize(course.overview) }}</p>

                  <h2>{{ $t('page.tennisAiCourseDetail.keyPoints') }}</h2>
                  <ul>
                    <li v-for="(point, index) in course.keyPoints" :key="`${course.id}-${index}`">
                      {{ localize(point) }}
                    </li>
                  </ul>
                </div>
              </div>
            </template>

            <template v-else-if="activeSection === 'breath'">
              <div class="analysis-wrap">
                <section class="task-manifesto breath-manifesto">
                  <p>
                    {{ $t('page.tennisAiCourseDetail.taskGuides.breath.part1') }}
                    <strong>{{ $t('page.tennisAiCourseDetail.taskGuides.breath.highlight') }}</strong>
                    {{ $t('page.tennisAiCourseDetail.taskGuides.breath.part2') }}
                    {{ $t('page.tennisAiCourseDetail.taskGuides.breath.tail') }}
                  </p>
                </section>
                <div class="breath-block">
                  <BreathTrainingOrb :locale="$i18n.locale" @next-training="handleNextTraining" />
                </div>
              </div>
            </template>

            <template v-else-if="activeSection === 'analysis' && showJointAnalysis">
              <div class="analysis-wrap">
                <section class="task-manifesto analysis-manifesto">
                  <p>
                    {{ $t('page.tennisAiCourseDetail.taskGuides.analysis.part1') }}
                    <strong>{{ $t('page.tennisAiCourseDetail.taskGuides.analysis.highlight') }}</strong>
                    {{ $t('page.tennisAiCourseDetail.taskGuides.analysis.part2') }}
                    {{ $t('page.tennisAiCourseDetail.taskGuides.analysis.tail') }}
                  </p>
                </section>
                <div class="task-panel analysis-panel">
                  <h2>{{ $t('page.tennisAiCourseDetail.analysisTitle') }}</h2>
                  <JointForceAnalysis
                    :api-url="analysisApiUrl"
                    :joint-config="course.analysis.jointConfig || []"
                    :sync-threshold="course.analysis.syncThreshold || 2"
                    :max-bar-value="course.analysis.maxBarValue || 8.5"
                    :play-speed="course.analysis.playSpeed || 0.05"
                    :auto-play="course.analysis.autoPlay !== false"
                    :locale="$i18n.locale"
                  />
                </div>
                <div class="task-panel analysis-panel analysis-panel-upload">
                  <LocalPoseAnalysis :course-slug="course.slug" :locale="$i18n.locale" />
                </div>
              </div>
            </template>

            <template v-else-if="activeSection === 'combo' && showJointAnalysis">
              <div class="analysis-wrap">
                <section class="task-manifesto combo-manifesto">
                  <p>
                    {{ $t('page.tennisAiCourseDetail.taskGuides.combo.part1') }}
                    <strong>{{ $t('page.tennisAiCourseDetail.taskGuides.combo.highlight') }}</strong>
                    {{ $t('page.tennisAiCourseDetail.taskGuides.combo.part2') }}
                    {{ $t('page.tennisAiCourseDetail.taskGuides.combo.tail') }}
                  </p>
                </section>
                <div class="combo-control">
                  <button class="combo-start-btn" :disabled="comboStarting" @click="startComboTraining">
                    {{ comboStarting ? $t('page.tennisAiCourseDetail.comboStarting') : $t('page.tennisAiCourseDetail.comboStart') }}
                  </button>
                  <button class="combo-stop-btn" @click="pauseComboTraining">
                    {{ $t('page.tennisAiCourseDetail.comboPause') }}
                  </button>
                </div>
                <Transition name="overlay-fade">
                  <div v-if="showComboCountdown" class="combo-countdown-overlay">
                    <article class="combo-countdown-card">
                      <p>{{ $t('page.tennisAiCourseDetail.comboCountdownTitle') }}</p>
                      <span>{{ comboCountdownValue }}</span>
                    </article>
                  </div>
                </Transition>
                <div class="combo-grid">
                  <div class="task-panel combo-panel combo-panel-breath">
                    <h2>{{ $t('page.tennisAiCourseDetail.jumpNav.breath') }}</h2>
                    <BreathTrainingOrb
                      ref="comboBreathRef"
                      :locale="$i18n.locale"
                      :hide-start-button="true"
                    />
                  </div>
                  <div class="task-panel combo-panel combo-panel-analysis">
                    <h2>{{ $t('page.tennisAiCourseDetail.analysisTitle') }}</h2>
                    <JointForceAnalysis
                      ref="comboAnalysisRef"
                      :api-url="analysisApiUrl"
                      :joint-config="course.analysis.jointConfig || []"
                      :sync-threshold="course.analysis.syncThreshold || 2"
                      :max-bar-value="course.analysis.maxBarValue || 8.5"
                      :play-speed="course.analysis.playSpeed || 0.05"
                      :auto-play="false"
                      :hide-controls="true"
                      :locale="$i18n.locale"
                    />
                  </div>
                </div>
              </div>
            </template>

            <template v-else>
              <div class="actions actions-stage">
                <RouterLink to="/tennis-ai/courses" class="ghost-btn">
                  {{ $t('page.tennisAiCourseDetail.backCourses') }}
                </RouterLink>
                <RouterLink to="/" class="ghost-btn">
                  {{ $t('page.tennisAiCourseDetail.backIntro') }}
                </RouterLink>
              </div>
            </template>
          </div>
        </Transition>
      </div>
    </template>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { fetchTennisAiCourseBySlug } from '../services/tennisAiCourseService'
import JointForceAnalysis from '../components/JointForceAnalysis.vue'
import BreathTrainingOrb from '../components/BreathTrainingOrb.vue'
import LocalPoseAnalysis from '../components/LocalPoseAnalysis.vue'

export default {
  name: 'TennisAiCourseDetailView',
  components: {
    RouterLink,
    JointForceAnalysis,
    BreathTrainingOrb,
    LocalPoseAnalysis
  },
  data() {
    return {
      course: null,
      loading: false,
      error: false,
      activeSection: 'intro',
      comboStarting: false,
      comboPaused: false,
      showComboCountdown: false,
      comboCountdownValue: 3,
      comboCountdownTimer: null,
      comboCountdownResolver: null
    }
  },
  watch: {
    '$route.params.slug': {
      immediate: true,
      async handler(slug) {
        await this.loadCourse(slug)
      }
    }
  },
  computed: {
    jumpItems() {
      const items = [
        { key: 'intro', label: this.$t('page.tennisAiCourseDetail.jumpNav.intro') },
        { key: 'breath', label: this.$t('page.tennisAiCourseDetail.jumpNav.breath') }
      ]
      if (this.showJointAnalysis) {
        items.push({ key: 'analysis', label: this.$t('page.tennisAiCourseDetail.jumpNav.analysis') })
        items.push({ key: 'combo', label: this.$t('page.tennisAiCourseDetail.jumpNav.combo') })
      }
      items.push({ key: 'actions', label: this.$t('page.tennisAiCourseDetail.jumpNav.actions') })
      return items
    },
    showJointAnalysis() {
      return this.course?.analysis?.component === 'JointForceAnalysis' && !!this.analysisApiUrl
    },
    analysisApiUrl() {
      const analysis = this.course?.analysis
      if (!analysis) return ''
      if (analysis.dataUrl) return analysis.dataUrl
      const dataFile = analysis.dataFile
      if (!dataFile) return ''
      return new URL(`../mock/${dataFile}`, import.meta.url).href
    }
  },
  methods: {
    changeSection(section) {
      if (this.activeSection === 'combo' && section !== 'combo') {
        this.pauseComboTraining()
      }
      this.activeSection = section
    },
    handleNextTraining() {
      this.activeSection = this.showJointAnalysis ? 'analysis' : 'actions'
    },
    async startComboTraining() {
      const breath = this.$refs.comboBreathRef
      const analysis = this.$refs.comboAnalysisRef
      if (!breath || !analysis || this.comboStarting) return

      this.comboStarting = true
      try {
        if (this.comboPaused) {
          const resumedBreath =
            typeof breath.resumeTraining === 'function' ? breath.resumeTraining() : false
          const resumedAnalysis =
            typeof analysis.resumeUnifiedPlayback === 'function' ? analysis.resumeUnifiedPlayback() : false
          if (resumedBreath || resumedAnalysis) {
            this.comboPaused = false
            return
          }
        }
        this.stopComboRuntime()
        const shouldStart = await this.runComboCountdown()
        if (!shouldStart) return
        const breathPromise =
          typeof breath.startUnifiedDirect === 'function'
            ? Promise.resolve(breath.startUnifiedDirect())
            : Promise.resolve(false)
        const analysisPromise =
          typeof analysis.startUnifiedPlaybackDirect === 'function'
            ? Promise.resolve(analysis.startUnifiedPlaybackDirect())
            : Promise.resolve(false)
        await Promise.all([breathPromise, analysisPromise])
        this.comboPaused = false
      } finally {
        this.comboStarting = false
      }
    },
    clearComboCountdown(cancelled = true) {
      if (this.comboCountdownTimer) {
        clearInterval(this.comboCountdownTimer)
        this.comboCountdownTimer = null
      }
      if (cancelled && this.comboCountdownResolver) {
        this.comboCountdownResolver(false)
      }
      this.comboCountdownResolver = null
      this.showComboCountdown = false
      this.comboCountdownValue = 3
    },
    runComboCountdown() {
      return new Promise((resolve) => {
        this.clearComboCountdown()
        this.comboCountdownResolver = resolve
        this.showComboCountdown = true
        this.comboCountdownValue = 3
        this.comboCountdownTimer = setInterval(() => {
          if (this.comboCountdownValue <= 1) {
            if (this.comboCountdownResolver) {
              this.comboCountdownResolver(true)
            }
            this.clearComboCountdown(false)
            return
          }
          this.comboCountdownValue -= 1
        }, 720)
      })
    },
    stopComboRuntime() {
      this.clearComboCountdown()
      const breath = this.$refs.comboBreathRef
      const analysis = this.$refs.comboAnalysisRef
      if (breath && typeof breath.pauseTraining === 'function') breath.pauseTraining()
      if (analysis && typeof analysis.stopUnifiedPlayback === 'function') analysis.stopUnifiedPlayback()
    },
    pauseComboTraining() {
      this.stopComboRuntime()
      this.comboStarting = false
      this.comboPaused = true
    },
    localize(value) {
      return value[this.$i18n.locale] || value['zh-CN']
    },
    async loadCourse(slug) {
      this.loading = true
      this.error = false
      this.course = null
      this.activeSection = 'intro'
      this.comboStarting = false
      this.comboPaused = false
      this.clearComboCountdown()
      try {
        this.course = await fetchTennisAiCourseBySlug(slug)
      } catch (error) {
        this.error = true
      } finally {
        this.loading = false
      }
    }
  },
  beforeUnmount() {
    this.stopComboRuntime()
  }
}
</script>

<style scoped>
.course-detail {
  position: relative;
  isolation: isolate;
  margin: 20px auto 0;
  max-width: 1080px;
}

.course-detail::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  pointer-events: none;
  background-image: url('../assets/ai-course-bg.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
}

.course-detail::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background: linear-gradient(
    180deg,
    rgba(0, 0, 0, 0.28) 0%,
    rgba(0, 0, 0, 0.34) 100%
  );
}

.status {
  border-radius: 14px;
  padding: 12px 14px;
  background: rgba(16, 16, 16, 0.05);
  width: fit-content;
}

.status-error {
  background: rgba(184, 33, 33, 0.12);
}

.jump-nav {
  position: sticky;
  top: 12px;
  z-index: 4;
  margin-bottom: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 10px;
  border-radius: 14px;
  border: 1px solid rgba(245, 245, 242, 0.22);
  background: rgba(16, 16, 16, 0.5);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.jump-btn {
  min-height: 36px;
  border: 1px solid rgba(245, 245, 242, 0.28);
  border-radius: 999px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.04);
  color: rgba(245, 245, 242, 0.92);
  cursor: pointer;
  font-size: 13px;
  font-weight: 600;
}

.jump-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

.jump-btn.active {
  background: rgba(245, 245, 242, 0.88);
  color: #101010;
  border-color: rgba(245, 245, 242, 0.72);
}

.section-stage {
  margin-top: 4px;
}

.stage-card {
  min-height: 220px;
}

.actions-stage {
  margin-top: 0;
}

.card-switch-enter-active,
.card-switch-leave-active {
  transition: opacity 0.22s ease, transform 0.22s ease;
}

.card-switch-enter-from,
.card-switch-leave-to {
  opacity: 0;
  transform: translateY(8px);
}

.overlay-fade-enter-active,
.overlay-fade-leave-active {
  transition: opacity 0.22s ease;
}

.overlay-fade-enter-from,
.overlay-fade-leave-to {
  opacity: 0;
}

.hero {
  position: relative;
  min-height: clamp(280px, 42vw, 420px);
  border-radius: 24px;
  overflow: hidden;
}

.intro-layout {
  display: grid;
  grid-template-columns: 1.08fr 0.92fr;
  gap: 20px;
  align-items: stretch;
}

.hero img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 26%, rgba(0, 0, 0, 0.78) 100%);
}

.hero-meta {
  position: relative;
  z-index: 2;
  color: #f5f5f2;
  padding: clamp(18px, 4vw, 32px);
  margin-top: clamp(132px, 21vw, 240px);
}

.hero-meta p {
  text-transform: uppercase;
  letter-spacing: 0.09em;
  font-size: 12px;
}

.hero-meta h1 {
  margin-top: 8px;
  font-size: clamp(1.8rem, 4vw, 3rem);
  letter-spacing: -0.03em;
}

.hero-meta span {
  display: block;
  margin-top: 8px;
  line-height: 1.5;
  opacity: 0.88;
}

.content {
  border-radius: 20px;
  background: #ffffff;
  border: 1px solid rgba(16, 16, 16, 0.08);
  padding: clamp(18px, 4vw, 30px);
}

.content h2 {
  font-size: clamp(1.2rem, 2.6vw, 1.8rem);
}

.content p {
  margin-top: 10px;
  line-height: 1.7;
  color: rgba(16, 16, 16, 0.8);
}

.content ul {
  margin: 12px 0 0;
  padding-left: 18px;
}

.content li {
  margin-top: 8px;
  line-height: 1.65;
}

.analysis-wrap {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 28px;
}

.task-manifesto {
  position: relative;
  overflow: hidden;
  border-top: 1px solid rgba(16, 16, 16, 0.16);
  border-bottom: 1px solid rgba(16, 16, 16, 0.16);
  border-radius: 14px;
  padding: 20px 18px;
  background: linear-gradient(180deg, rgba(16, 16, 16, 0.44) 0%, rgba(16, 16, 16, 0.62) 100%);
}

.task-manifesto::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 46px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.42) 100%);
  pointer-events: none;
}

.task-manifesto p {
  margin: 0;
  max-width: 980px;
  font-size: clamp(1.02rem, 1.45vw, 1.52rem);
  line-height: 1.36;
  letter-spacing: -0.02em;
  color: rgba(245, 245, 242, 0.94);
  position: relative;
  z-index: 1;
}

.task-manifesto strong {
  background: rgba(255, 255, 255, 0.9);
  color: #101010;
  padding: 0 8px;
}

.task-panel {
  position: relative;
  overflow: hidden;
  border-radius: 18px;
  border: 1px solid rgba(245, 245, 242, 0.2);
  background: linear-gradient(180deg, rgba(16, 16, 16, 0.42) 0%, rgba(16, 16, 16, 0.62) 100%);
  padding: 16px;
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.task-panel::after {
  content: '';
  position: absolute;
  left: 0;
  right: 0;
  bottom: 0;
  height: 48px;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 0%, rgba(0, 0, 0, 0.36) 100%);
  pointer-events: none;
}

.task-panel h2 {
  color: rgba(245, 245, 242, 0.96);
  position: relative;
  z-index: 1;
}

.breath-manifesto {
  grid-column: 1 / -1;
}

.breath-block {
  grid-column: 1 / -1;
  margin-top: 20px;
  margin-bottom: 18px;
}

.analysis-manifesto {
  grid-column: 3 / span 10;
  margin-top: 12px;
  border-top: 1px solid rgba(245, 245, 242, 0.22);
  padding-top: 24px;
}

.analysis-panel {
  grid-column: 1 / -1;
  margin-top: 20px;
}

.combo-manifesto {
  grid-column: 1 / -1;
}

.combo-control {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  flex-wrap: wrap;
  gap: 10px;
}

.combo-start-btn {
  min-height: 44px;
  border: 1px solid rgba(245, 245, 242, 0.34);
  border-radius: 999px;
  padding: 0 22px;
  color: #101010;
  background: rgba(245, 245, 242, 0.92);
  font-weight: 700;
  cursor: pointer;
}

.combo-start-btn:disabled {
  opacity: 0.62;
  cursor: not-allowed;
}

.combo-stop-btn {
  min-height: 44px;
  border: 1px solid rgba(245, 245, 242, 0.34);
  border-radius: 999px;
  padding: 0 22px;
  color: rgba(245, 245, 242, 0.94);
  background: rgba(255, 255, 255, 0.08);
  font-weight: 700;
  cursor: pointer;
}

.combo-panel {
  margin-top: 0;
}

.combo-grid {
  grid-column: 1 / -1;
  margin-top: 2px;
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 18px;
  align-items: start;
}

.combo-panel-breath :deep(.breath-training) {
  width: 100%;
  margin-bottom: 0;
  border-radius: 14px;
  overflow: hidden;
  border: 1px solid rgba(245, 245, 242, 0.2);
  background: linear-gradient(180deg, rgba(16, 16, 16, 0.42) 0%, rgba(16, 16, 16, 0.62) 100%);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.2);
}

.combo-panel-breath :deep(.breath-training .kicker) {
  color: rgba(245, 245, 242, 0.66);
}

.combo-panel-breath :deep(.breath-training h3),
.combo-panel-breath :deep(.breath-training .guide),
.combo-panel-breath :deep(.breath-training .round-text) {
  color: rgba(245, 245, 242, 0.92);
}

.combo-panel-breath :deep(.breath-training .guide) {
  border-color: rgba(245, 245, 242, 0.26);
  background: rgba(255, 255, 255, 0.08);
}

.combo-panel-breath :deep(.breath-training .orb) {
  width: 146px;
  height: 146px;
  background:
    radial-gradient(circle at 28% 24%, rgba(255, 255, 255, 0.82), rgba(255, 255, 255, 0) 44%),
    radial-gradient(circle at 68% 72%, rgba(16, 16, 16, 0.12), rgba(16, 16, 16, 0) 48%),
    rgba(245, 245, 242, 0.48);
  border: 1px solid rgba(245, 245, 242, 0.52);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.88),
    0 18px 30px rgba(0, 0, 0, 0.34),
    0 0 0 2px rgba(245, 245, 242, 0.12);
}

.combo-panel-analysis :deep(.analysis-container) {
  max-width: none;
  margin: 0;
  padding: 6px 0 0;
}

.combo-panel-analysis :deep(.chain-layout) {
  grid-template-columns: 1fr;
  gap: 14px;
}

.combo-panel-analysis :deep(.panel) {
  background: rgba(16, 16, 16, 0.62);
  border-color: rgba(245, 245, 242, 0.2);
}

.combo-panel-analysis :deep(.chain-svg) {
  width: min(100%, 360px);
  height: auto;
}

.combo-countdown-overlay {
  position: fixed;
  inset: 0;
  z-index: 10000;
  display: grid;
  place-items: center;
  background: rgba(10, 10, 10, 0.44);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
}

.combo-countdown-card {
  width: min(260px, calc(100vw - 28px));
  border-radius: 18px;
  padding: 20px;
  text-align: center;
  background: rgba(18, 18, 18, 0.92);
  border: 1px solid rgba(245, 245, 242, 0.24);
  box-shadow: 0 24px 52px rgba(0, 0, 0, 0.3);
}

.combo-countdown-card p {
  margin: 0;
  color: rgba(245, 245, 242, 0.78);
}

.combo-countdown-card span {
  display: block;
  margin-top: 8px;
  font-size: 70px;
  line-height: 1;
  font-weight: 800;
  color: rgba(245, 245, 242, 0.96);
}

.breath-block :deep(.breath-training) {
  width: 100%;
  margin-bottom: 0;
  border-radius: 18px;
  overflow: hidden;
  border: 1px solid rgba(245, 245, 242, 0.2);
  background: linear-gradient(180deg, rgba(16, 16, 16, 0.42) 0%, rgba(16, 16, 16, 0.62) 100%);
  box-shadow: 0 10px 24px rgba(0, 0, 0, 0.18);
}

.breath-block :deep(.breath-training .kicker) {
  color: rgba(245, 245, 242, 0.66);
}

.breath-block :deep(.breath-training h3) {
  color: rgba(245, 245, 242, 0.96);
}

.breath-block :deep(.breath-training .guide) {
  color: rgba(245, 245, 242, 0.92);
  border-color: rgba(245, 245, 242, 0.28);
  background: rgba(255, 255, 255, 0.08);
}

.breath-block :deep(.breath-training .round-text) {
  color: rgba(245, 245, 242, 0.78);
}

.breath-block :deep(.breath-training .start-btn) {
  color: #101010;
  background: rgba(245, 245, 242, 0.9);
}

.breath-block :deep(.breath-training .orb) {
  background:
    radial-gradient(circle at 28% 24%, rgba(255, 255, 255, 0.88), rgba(255, 255, 255, 0) 44%),
    radial-gradient(circle at 68% 72%, rgba(16, 16, 16, 0.12), rgba(16, 16, 16, 0) 48%),
    rgba(245, 245, 242, 0.6);
  border: 1px solid rgba(245, 245, 242, 0.58);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.9),
    0 20px 34px rgba(0, 0, 0, 0.32),
    0 0 0 2px rgba(245, 245, 242, 0.14);
}

.actions {
  margin-top: 22px;
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  padding: 0 2px;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 42px;
  padding: 0 16px;
  border-radius: 999px;
  text-decoration: none;
  color: #f5f5f2;
  border: 1px solid rgba(245, 245, 242, 0.42);
  background: rgba(255, 255, 255, 0.04);
}

.ghost-btn:hover {
  background: rgba(255, 255, 255, 0.14);
}

@media (max-width: 900px) {
  .course-detail::before {
    background-attachment: scroll;
  }

  .intro-layout {
    grid-template-columns: 1fr;
  }

  .jump-nav {
    top: 8px;
  }

  .content {
    margin-top: 0;
  }

  .analysis-wrap {
    grid-template-columns: 1fr;
  }

  .breath-manifesto,
  .breath-block,
  .analysis-manifesto,
  .analysis-panel,
  .combo-manifesto,
  .combo-control,
  .combo-grid,
  .combo-panel {
    grid-column: 1 / -1;
  }

  .combo-grid {
    grid-template-columns: 1fr;
  }
}
</style>
