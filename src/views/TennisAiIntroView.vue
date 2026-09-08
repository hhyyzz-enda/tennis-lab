<template>
  <section class="ai-intro">
    <div v-if="showEntryGuide" class="entry-guide-mask">
      <div class="entry-guide-panel">
        <h2>{{ $t('page.tennisAiIntro.entryGuide.title') }}</h2>
        <p>{{ $t('page.tennisAiIntro.entryGuide.desc') }}</p>
        <div class="entry-guide-actions">
          <button type="button" class="guide-btn ghost" @click="goBasicTraining">
            {{ $t('page.tennisAiIntro.entryGuide.toBasic') }}
          </button>
          <button type="button" class="guide-btn solid" @click="goAiCoursesDirectly">
            {{ $t('page.tennisAiIntro.entryGuide.toAiCourses') }}
          </button>
        </div>
      </div>
    </div>

    <p class="kicker">{{ $t('page.tennisAiIntro.kicker') }}</p>
    <h1>{{ $t('page.tennisAiIntro.title') }}</h1>
    <p class="lead">{{ $t('page.tennisAiIntro.lead') }}</p>

    <div class="system-grid">
      <article v-for="item in systems" :key="item.key" class="system-card">
        <p>{{ $t(`page.tennisAiIntro.system.${item.key}.tag`) }}</p>
        <h2>{{ $t(`page.tennisAiIntro.system.${item.key}.title`) }}</h2>
        <span>{{ $t(`page.tennisAiIntro.system.${item.key}.desc`) }}</span>
      </article>
    </div>

    <RouterLink class="start-btn" to="/tennis-ai/courses">
      {{ $t('page.tennisAiIntro.startLearning') }}
    </RouterLink>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'

export default {
  name: 'TennisAiIntroView',
  components: {
    RouterLink
  },
  data() {
    return {
      showEntryGuide: true,
      systems: [{ key: 'first' }, { key: 'second' }, { key: 'third' }]
    }
  },
  methods: {
    goBasicTraining() {
      this.$router.push('/premium-courses')
    },
    goAiCoursesDirectly() {
      this.showEntryGuide = false
    }
  }
}
</script>

<style scoped>
.ai-intro {
  margin: 20px auto 0;
  max-width: 1120px;
}

.entry-guide-mask {
  position: fixed;
  inset: 0;
  z-index: 30;
  background: rgba(38, 38, 38, 0.68);
  display: grid;
  place-items: center;
  padding: 20px;
}

.entry-guide-panel {
  width: min(92vw, 720px);
  border-radius: 16px;
  background: rgba(112, 112, 112, 0.34);
  border: 1px solid rgba(220, 220, 220, 0.24);
  backdrop-filter: blur(8px);
  box-shadow: 0 14px 34px rgba(12, 12, 12, 0.34);
  padding: 22px 20px;
}

.entry-guide-panel h2 {
  font-size: clamp(1.05rem, 2.1vw, 1.35rem);
  letter-spacing: -0.01em;
  color: rgba(250, 250, 250, 0.96);
}

.entry-guide-panel p {
  margin-top: 10px;
  line-height: 1.7;
  color: rgba(248, 248, 248, 0.9);
}

.entry-guide-actions {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.guide-btn {
  min-height: 40px;
  border-radius: 999px;
  padding: 0 14px;
  font-weight: 600;
  cursor: pointer;
}

.guide-btn.ghost {
  border: 1px solid rgba(245, 245, 245, 0.26);
  background: rgba(78, 78, 78, 0.5);
  color: rgba(250, 250, 250, 0.92);
}

.guide-btn.solid {
  border: 1px solid rgba(250, 250, 250, 0.84);
  background: rgba(238, 238, 238, 0.92);
  color: #181818;
}

.kicker {
  text-transform: uppercase;
  letter-spacing: 0.11em;
  font-size: 12px;
}

h1 {
  margin-top: 12px;
  font-size: clamp(2.1rem, 5.1vw, 4.6rem);
  letter-spacing: -0.03em;
}

.lead {
  margin-top: 14px;
  max-width: 840px;
  line-height: 1.7;
  color: rgba(16, 16, 16, 0.78);
}

.system-grid {
  margin-top: 28px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.system-card {
  border-radius: 22px;
  padding: 24px 22px;
  background: #ffffff;
  border: 1px solid rgba(16, 16, 16, 0.07);
}

.system-card p {
  font-size: 12px;
  letter-spacing: 0.1em;
  text-transform: uppercase;
  opacity: 0.7;
}

.system-card h2 {
  margin-top: 12px;
  font-size: clamp(1.2rem, 2.4vw, 1.65rem);
  letter-spacing: -0.02em;
}

.system-card span {
  display: block;
  margin-top: 10px;
  line-height: 1.6;
  color: rgba(16, 16, 16, 0.78);
}

.start-btn {
  margin-top: 34px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 24px;
  border-radius: 999px;
  text-decoration: none;
  background: #101010;
  color: #f5f5f2;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition: transform 0.25s ease, opacity 0.25s ease;
}

.start-btn:hover {
  transform: translateY(-2px);
  opacity: 0.92;
}

@media (max-width: 900px) {
  .system-grid {
    grid-template-columns: 1fr;
  }
}
</style>
