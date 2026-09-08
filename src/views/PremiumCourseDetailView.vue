<template>
  <section class="premium-course-detail">
    <p v-if="loading" class="status">{{ $t('page.premiumCourseDetail.loading') }}</p>
    <p v-else-if="error" class="status status-error">{{ $t('page.premiumCourseDetail.error') }}</p>
    <p v-else-if="!course" class="status status-error">{{ $t('page.premiumCourseDetail.empty') }}</p>

    <template v-else>
      <div class="hero">
        <img :src="course.cover" :alt="localize(course.title)" />
        <div class="overlay" />
        <div class="hero-meta">
          <p>{{ course.level }} / {{ course.durationMinutes }} min</p>
          <h1>{{ localize(course.title) }}</h1>
          <span>{{ localize(course.intro) }}</span>
        </div>
      </div>

      <div class="detail-grid">
        <article class="panel panel-video">
          <h2>{{ $t('page.premiumCourseDetail.videoSection') }}</h2>
          <div class="video-wrap">
            <video
              v-if="course.videoUrl"
              :src="course.videoUrl"
              controls
              preload="metadata"
              playsinline
              class="course-video"
            />
            <div v-else class="video-placeholder">
              {{ $t('page.premiumCourseDetail.videoUnavailable') }}
            </div>
          </div>
        </article>

        <article class="panel">
          <h2>{{ $t('page.premiumCourseDetail.overview') }}</h2>
          <p>{{ localize(course.overview) }}</p>
        </article>

        <article class="panel">
          <h2>{{ $t('page.premiumCourseDetail.baseInfo') }}</h2>
          <ul class="plain-list">
            <li>{{ $t('page.premiumCourseDetail.teacher') }}: {{ course.teacher || '-' }}</li>
            <li>{{ $t('page.premiumCourseDetail.publishedAt') }}: {{ course.publishedAt || '-' }}</li>
            <li>{{ $t('page.premiumCourseDetail.suitableFor') }}: {{ localize(course.suitableFor) }}</li>
          </ul>
        </article>

        <article class="panel">
          <h2>{{ $t('page.premiumCourseDetail.keyPoints') }}</h2>
          <ul>
            <li v-for="(point, index) in course.keyPoints" :key="`${course.id}-point-${index}`">
              {{ localize(point) }}
            </li>
          </ul>
        </article>

        <article class="panel">
          <h2>{{ $t('page.premiumCourseDetail.modules') }}</h2>
          <ol>
            <li v-for="module in course.modules" :key="module.id">
              <strong>{{ localize(module.title) }}</strong>
              <p>{{ localize(module.desc) }}</p>
            </li>
          </ol>
        </article>
      </div>

      <div class="actions">
        <button
          type="button"
          class="primary-btn"
          :disabled="adding"
          @click="handleAddCourse"
        >
          {{ adding ? $t('page.premiumCourseDetail.adding') : $t('page.premiumCourseDetail.addToMyCourses') }}
        </button>
        <RouterLink to="/my-tennis/courses" class="ghost-btn">{{ $t('page.premiumCourseDetail.goMyCourses') }}</RouterLink>
        <RouterLink to="/premium-courses" class="ghost-btn">{{ $t('page.premiumCourseDetail.backList') }}</RouterLink>
        <RouterLink to="/tennis-ai/courses" class="ghost-btn">{{ $t('page.premiumCourseDetail.goAiCourses') }}</RouterLink>
      </div>
    </template>
    <Teleport to="body">
      <Transition name="toast-fade">
        <div v-if="toastVisible" class="center-toast" :class="toastType">
          {{ toastMessage }}
        </div>
      </Transition>
    </Teleport>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { addPremiumCourseToMyCourses, fetchPremiumCourseById } from '../services/premiumCourseService'

export default {
  name: 'PremiumCourseDetailView',
  components: {
    RouterLink
  },
  data() {
    return {
      course: null,
      loading: false,
      error: false,
      adding: false,
      toastVisible: false,
      toastType: 'success',
      toastMessage: '',
      toastTimer: null
    }
  },
  beforeUnmount() {
    if (this.toastTimer) {
      window.clearTimeout(this.toastTimer)
      this.toastTimer = null
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(id) {
        this.loadCourse(id)
      }
    }
  },
  methods: {
    localize(value) {
      if (!value || typeof value !== 'object') return ''
      return value[this.$i18n.locale] || value['zh-CN'] || ''
    },
    async loadCourse(id) {
      if (!id) return
      this.loading = true
      this.error = false
      this.course = null
      this.adding = false
      try {
        this.course = await fetchPremiumCourseById(id)
      } catch (error) {
        this.error = true
      } finally {
        this.loading = false
      }
    },
    async handleAddCourse() {
      if (!this.course?.id || this.adding) return
      this.adding = true
      try {
        await addPremiumCourseToMyCourses(this.course.id)
        this.showToast(this.$t('page.premiumCourseDetail.addSuccess'), 'success')
      } catch (error) {
        this.showToast(error?.message || this.$t('page.premiumCourseDetail.addError'), 'error')
      } finally {
        this.adding = false
      }
    },
    showToast(message, type) {
      this.toastType = type === 'error' ? 'error' : 'success'
      this.toastMessage = message || ''
      this.toastVisible = true
      if (this.toastTimer) {
        window.clearTimeout(this.toastTimer)
      }
      this.toastTimer = window.setTimeout(() => {
        this.toastVisible = false
        this.toastTimer = null
      }, 2000)
    }
  }
}
</script>

<style scoped>
.premium-course-detail {
  margin: 22px auto 58px;
  width: min(100%, 1120px);
}

.status {
  margin-top: 12px;
  border-radius: 12px;
  padding: 12px 14px;
  width: fit-content;
  background: rgba(16, 16, 16, 0.06);
}

.status-error {
  background: rgba(189, 36, 36, 0.12);
}

.hero {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  min-height: 330px;
  border: 1px solid rgba(16, 16, 16, 0.14);
}

.hero img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(18%);
}

.overlay {
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.1) 20%, rgba(0, 0, 0, 0.75) 100%);
}

.hero-meta {
  position: relative;
  z-index: 1;
  color: #f5f5f2;
  padding: 190px 24px 24px;
}

.hero-meta p {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  opacity: 0.86;
}

.hero-meta h1 {
  margin-top: 8px;
  font-size: clamp(1.8rem, 4.4vw, 3rem);
}

.hero-meta span {
  display: block;
  margin-top: 8px;
  max-width: 840px;
  line-height: 1.62;
  opacity: 0.92;
}

.detail-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 14px;
}

.panel {
  border-radius: 16px;
  border: 1px solid rgba(16, 16, 16, 0.12);
  background: rgba(248, 248, 246, 0.88);
  padding: 16px;
}

.panel-video {
  grid-column: 1 / -1;
}

.video-wrap {
  margin-top: 10px;
  width: 100%;
  border-radius: 12px;
  overflow: hidden;
  border: 1px solid rgba(16, 16, 16, 0.12);
  background: rgba(16, 16, 16, 0.04);
}

.course-video {
  display: block;
  width: 100%;
  aspect-ratio: 16 / 9;
  background: #000;
}

.video-placeholder {
  width: 100%;
  aspect-ratio: 16 / 9;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(16, 16, 16, 0.62);
}

.panel h2 {
  font-size: 1.1rem;
}

.panel p {
  margin-top: 10px;
  line-height: 1.68;
  color: rgba(16, 16, 16, 0.74);
}

.panel ul,
.panel ol {
  margin-top: 10px;
  padding-left: 18px;
  color: rgba(16, 16, 16, 0.76);
  line-height: 1.62;
}

.plain-list {
  list-style: none;
  padding-left: 0;
}

.plain-list li + li {
  margin-top: 6px;
}

.panel ol li + li {
  margin-top: 8px;
}

.panel ol p {
  margin-top: 2px;
}

.actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.22);
  padding: 0 14px;
  text-decoration: none;
  color: rgba(16, 16, 16, 0.82);
  background: rgba(255, 255, 255, 0.8);
  font-weight: 600;
}

.ghost-btn:hover {
  opacity: 0.75;
}

.primary-btn {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  border-radius: 999px;
  border: 1px solid #101010;
  padding: 0 14px;
  background: #101010;
  color: #f7f7f4;
  font-weight: 600;
  cursor: pointer;
}

.primary-btn:hover:not(:disabled) {
  opacity: 0.8;
}

.primary-btn:disabled {
  opacity: 0.55;
  cursor: not-allowed;
}

.center-toast {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 99999;
  max-width: min(84vw, 560px);
  padding: 14px 20px;
  border-radius: 14px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: rgba(16, 16, 16, 0.38);
  backdrop-filter: blur(8px);
  box-shadow:
    0 18px 34px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.18);
  text-align: center;
  color: rgba(255, 255, 255, 0.82);
  text-shadow:
    0 2px 8px rgba(0, 0, 0, 0.58),
    0 0 1px rgba(0, 0, 0, 0.72);
  pointer-events: none;
}

.center-toast.error {
  background: rgba(98, 24, 24, 0.42);
}

.toast-fade-enter-active,
.toast-fade-leave-active {
  transition:
    opacity 0.35s ease,
    transform 0.35s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
  opacity: 0;
  transform: translate(-50%, calc(-50% + 10px)) scale(0.96);
}

.toast-fade-enter-to,
.toast-fade-leave-from {
  opacity: 1;
  transform: translate(-50%, -50%) scale(1);
}

@media (max-width: 900px) {
  .detail-grid {
    grid-template-columns: 1fr;
  }
}
</style>
