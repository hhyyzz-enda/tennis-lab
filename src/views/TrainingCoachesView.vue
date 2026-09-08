<template>
  <section class="coaches-page">
    <header class="hero">
      <p class="kicker">{{ $t('page.trainingCoaches.kicker') }}</p>
      <h1>{{ $t('page.trainingCoaches.title') }}</h1>
      <p class="lead">{{ $t('page.trainingCoaches.lead') }}</p>
    </header>

    <p v-if="loading" class="status">{{ $t('page.trainingCoaches.loading') }}</p>
    <p v-else-if="error" class="status status-error">{{ $t('page.trainingCoaches.error') }}</p>

    <section v-else-if="coaches.length" class="coach-grid">
      <RouterLink
        v-for="coach in coaches"
        :key="coach.id"
        class="coach-card"
        :to="`/training-feedback/coaches/${coach.id}`"
      >
        <div class="avatar-wrap">
          <img :src="coach.avatar" :alt="coach.name" loading="lazy" />
        </div>
        <div class="card-meta">
          <h2>{{ coach.name }}</h2>
          <p class="coach-brief">{{ getIntroPreview(coach) }}</p>
          <p class="contact-label">{{ $t('page.trainingCoaches.contactLabel') }}</p>
          <p class="contact-value">{{ coach.contact || $t('page.trainingCoaches.contactPending') }}</p>
        </div>
      </RouterLink>
    </section>

    <div v-else class="status">{{ $t('page.trainingCoaches.empty') }}</div>

    <div class="actions">
      <RouterLink class="ghost-btn" to="/">{{ $t('page.trainingCoaches.backHome') }}</RouterLink>
    </div>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { fetchCoaches } from '../services/coachService'

export default {
  name: 'TrainingCoachesView',
  components: {
    RouterLink
  },
  data() {
    return {
      coaches: [],
      loading: false,
      error: false
    }
  },
  mounted() {
    this.loadCoaches()
  },
  methods: {
    localize(value) {
      if (!value || typeof value !== 'object') return ''
      return value[this.$i18n.locale] || value['zh-CN'] || ''
    },
    getIntroPreview(coach) {
      const text = this.localize(coach.intro).trim()
      if (!text) return ''
      return text.length > 48 ? `${text.slice(0, 48)}...` : text
    },
    async loadCoaches() {
      this.loading = true
      this.error = false
      try {
        this.coaches = await fetchCoaches()
      } catch (error) {
        this.error = true
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.coaches-page {
  position: relative;
  isolation: isolate;
  margin: 24px auto 60px;
  width: min(100%, 1120px);
}

.coaches-page::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  background-image: url('../assets/coach-page-bg.jpg');
  background-size: cover;
  background-position: center 46%;
  filter: saturate(92%) contrast(95%);
}

.coaches-page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(247, 247, 244, 0.92) 0%, rgba(247, 247, 244, 0.68) 28%, rgba(247, 247, 244, 0.58) 70%, rgba(247, 247, 244, 0.9) 100%),
    linear-gradient(90deg, rgba(247, 247, 244, 0.22) 0%, rgba(247, 247, 244, 0) 18%, rgba(247, 247, 244, 0) 82%, rgba(247, 247, 244, 0.22) 100%);
}

.kicker {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  color: rgba(16, 16, 16, 0.62);
}

.hero h1 {
  margin-top: 8px;
  font-size: clamp(2rem, 4.4vw, 3.4rem);
  letter-spacing: -0.03em;
}

.lead {
  margin-top: 12px;
  max-width: 860px;
  line-height: 1.72;
  color: rgba(16, 16, 16, 0.72);
}

.status {
  margin-top: 18px;
  padding: 12px 14px;
  border-radius: 12px;
  width: fit-content;
  background: rgba(16, 16, 16, 0.06);
}

.status-error {
  background: rgba(189, 36, 36, 0.12);
}

.coach-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.coach-card {
  display: grid;
  grid-template-rows: 230px 1fr;
  border-radius: 18px;
  border: 1px solid rgba(16, 16, 16, 0.14);
  background: rgba(248, 248, 246, 0.9);
  text-decoration: none;
  color: #101010;
  overflow: hidden;
  box-shadow:
    0 8px 20px rgba(16, 16, 16, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.62);
  transition: transform 0.24s ease, box-shadow 0.24s ease;
}

.coach-card:hover {
  transform: translateY(-4px);
  box-shadow:
    0 12px 26px rgba(16, 16, 16, 0.12),
    inset 0 1px 0 rgba(255, 255, 255, 0.66);
}

.avatar-wrap {
  position: relative;
  overflow: hidden;
}

.avatar-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(12%);
  transition: transform 0.5s ease;
}

.coach-card:hover .avatar-wrap img {
  transform: scale(1.05);
}

.card-meta {
  padding: 14px 14px 16px;
}

.card-meta h2 {
  font-size: 1.22rem;
}

.coach-brief {
  margin-top: 6px;
  color: rgba(16, 16, 16, 0.66);
}

.contact-label {
  margin-top: 8px;
  font-size: 12px;
  text-transform: uppercase;
  letter-spacing: 0.08em;
  color: rgba(16, 16, 16, 0.56);
}

.contact-value {
  margin-top: 4px;
  color: rgba(16, 16, 16, 0.82);
  word-break: break-all;
}

.actions {
  margin-top: 20px;
  display: flex;
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

@media (max-width: 980px) {
  .coach-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 680px) {
  .coach-grid {
    grid-template-columns: 1fr;
  }
}
</style>

