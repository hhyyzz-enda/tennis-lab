<template>
  <section class="member-section">
    <div class="section-head">
      <p class="section-kicker">{{ $t('page.myTennis.kicker') }}</p>
      <h2>{{ $t('page.myTennis.title') }}</h2>
      <p class="section-lead">{{ $t('page.myTennis.lead') }}</p>
    </div>
    <div class="member-grid">
      <n-card
        class="member-card courses-card"
        :bordered="false"
        role="button"
        tabindex="0"
        @click="goToMyCourses"
        @keydown.enter.prevent="goToMyCourses"
        @keydown.space.prevent="goToMyCourses"
      >
        <p class="panel-tag">{{ $t('page.myTennis.myCourses.tag') }}</p>
        <h3>{{ $t('page.myTennis.myCourses.title') }}</h3>
        <p>{{ $t('page.myTennis.myCourses.desc') }}</p>
      </n-card>
      <n-card
        class="member-card plan-card"
        :bordered="false"
        role="button"
        tabindex="0"
        @click="goToTrainingPlan"
        @keydown.enter.prevent="goToTrainingPlan"
        @keydown.space.prevent="goToTrainingPlan"
      >
        <p class="panel-tag">{{ $t('page.myTennis.myPlan.tag') }}</p>
        <h3>{{ $t('page.myTennis.myPlan.title') }}</h3>
        <p>{{ $t('page.myTennis.myPlan.desc') }}</p>
      </n-card>
      <n-card class="member-card dark profile-card" :bordered="false" role="button" tabindex="0" @click="goToProfile" @keydown.enter.prevent="goToProfile" @keydown.space.prevent="goToProfile">
        <p class="panel-tag">{{ $t('page.myTennis.profile.tag') }}</p>
        <h3>{{ $t('page.myTennis.profile.title') }}</h3>
        <ul>
          <li>{{ $t('page.myTennis.profile.levelInfo') }}</li>
          <li>{{ $t('page.myTennis.profile.basicInfo') }}</li>
          <li v-if="$t('page.myTennis.profile.tennisInfo')">{{ $t('page.myTennis.profile.tennisInfo') }}</li>
        </ul>
      </n-card>
    </div>
    <div class="member-actions">
      <button type="button" class="back-home-btn" @click="goHome">
        {{ $t('page.myTennis.backHome') }}
      </button>
    </div>
  </section>
</template>

<script>
import { NCard } from 'naive-ui'

// AI辅助生成：kimi, 2026-4-24
export default {
  name: 'MyTennisView',
  components: {
    NCard
  },
  methods: {
    goToMyCourses() {
      this.$router.push('/my-tennis/courses')
    },
    goToTrainingPlan() {
      this.$router.push('/ai-training-plan')
    },
    goToProfile() {
      this.$router.push('/my-tennis/profile')
    },
    goHome() {
      this.$router.push('/')
    }
  }
}
</script>

<style scoped>
.member-section {
  position: relative;
  isolation: isolate;
  min-height: calc(100vh - 94px);
  padding: 26px 0 74px;
}

.member-section::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url('../assets/aibackground.png');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  opacity: 0.5;
  filter: saturate(1.08) contrast(1.07) brightness(1.04);
  z-index: -2;
  pointer-events: none;
}

.member-section::after {
  content: '';
  position: fixed;
  inset: 0;
  background: linear-gradient(
    180deg,
    rgba(245, 245, 242, 0.82) 0%,
    rgba(245, 245, 242, 0.28) 18%,
    rgba(245, 245, 242, 0.22) 82%,
    rgba(245, 245, 242, 0.82) 100%
  );
  z-index: -1;
  pointer-events: none;
}

.section-head {
  max-width: 900px;
}

.section-kicker {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.1em;
}

.section-head h2 {
  margin-top: 10px;
  font-size: clamp(1.9rem, 4vw, 3.4rem);
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.section-lead {
  margin-top: 12px;
  max-width: 680px;
  line-height: 1.7;
  color: rgba(16, 16, 16, 0.72);
}

.member-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 16px;
  align-items: start;
}

.member-actions {
  margin-top: 18px;
  display: flex;
  justify-content: flex-end;
}

.back-home-btn {
  border: 1px solid rgba(16, 16, 16, 0.2);
  border-radius: 999px;
  min-height: 38px;
  padding: 0 16px;
  background: #101010;
  color: #f5f5f2;
  font: inherit;
  font-size: 13px;
  font-weight: 600;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, opacity 0.2s ease;
}

.back-home-btn:hover,
.back-home-btn:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 10px 20px rgba(0, 0, 0, 0.18);
  opacity: 0.96;
}

.member-card {
  border-radius: 22px;
  padding: clamp(20px, 4vw, 34px);
  background: rgba(255, 255, 255, 0.9);
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  backdrop-filter: blur(1px);
}

.panel-tag {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.1em;
}

h3 {
  margin-top: 12px;
  font-size: clamp(1.6rem, 3.5vw, 3rem);
  line-height: 1.03;
}

p {
  margin-top: 12px;
  max-width: 520px;
  line-height: 1.6;
}

ul {
  margin-top: 14px;
  padding-left: 18px;
  line-height: 1.7;
}

.dark {
  background-color: rgba(96, 96, 96, 0.9);
  color: #f5f5f2;
}

.courses-card,
.profile-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.plan-card {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease;
}

.courses-card {
  grid-column: 1 / span 7;
  background-image:
    linear-gradient(145deg, rgba(255, 255, 255, 0.86), rgba(255, 255, 255, 0.8)),
    url('../assets/learning-resources-bg.jpg');
}

.plan-card {
  grid-column: 8 / span 5;
  margin-top: 26px;
  background-image:
    linear-gradient(145deg, rgba(255, 255, 255, 0.84), rgba(255, 255, 255, 0.78)),
    url('../assets/ai-course-bg.jpg');
}

.profile-card {
  grid-column: 3 / span 8;
  margin-top: 2px;
  background-image:
    linear-gradient(145deg, rgba(96, 96, 96, 0.68), rgba(72, 72, 72, 0.6)),
    url('../assets/coach-page-bg.jpg');
  background-position: center 24%;
}

.courses-card:hover,
.courses-card:focus-visible,
.plan-card:hover,
.plan-card:focus-visible,
.profile-card:hover,
.profile-card:focus-visible {
  transform: translateY(-2px);
  box-shadow: 0 14px 30px rgba(0, 0, 0, 0.22);
}

@media (max-width: 900px) {
  .member-grid {
    grid-template-columns: 1fr;
  }

  .courses-card,
  .plan-card,
  .profile-card {
    grid-column: auto;
    margin-top: 0;
  }
}
</style>
