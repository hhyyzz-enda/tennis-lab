<template>
  <section class="origins-page">
    <section class="hero">
      <p class="kicker">{{ $t('page.tennisOrigins.kicker') }}</p>
      <h1>{{ $t('page.tennisOrigins.title') }}</h1>
      <p class="lead">{{ $t('page.tennisOrigins.lead') }}</p>
      <RouterLink class="back-link" to="/">
        {{ $t('page.tennisOrigins.backHome') }}
      </RouterLink>
    </section>

    <section class="overview-grid">
      <button type="button" class="panel panel-link panel-first light" @click="scrollToSection('process')">
        <p class="panel-tag">{{ $t('page.tennisOrigins.timeline.tag') }}</p>
        <h2>{{ $t('page.tennisOrigins.timeline.title') }}</h2>
        <p>{{ $t('page.tennisOrigins.timeline.desc') }}</p>
      </button>
      <button type="button" class="panel panel-link dark" @click="scrollToSection('gear-focus')">
        <p class="panel-tag">{{ $t('page.tennisOrigins.gear.tag') }}</p>
        <h2>{{ $t('page.tennisOrigins.gear.title') }}</h2>
        <p>{{ $t('page.tennisOrigins.gear.desc') }}</p>
      </button>
      <button type="button" class="panel panel-link dark" @click="scrollToSection('legends-focus')">
        <p class="panel-tag">{{ $t('page.tennisOrigins.legends.tag') }}</p>
        <h2>{{ $t('page.tennisOrigins.legends.title') }}</h2>
        <p>{{ $t('page.tennisOrigins.legends.desc') }}</p>
      </button>
      <button type="button" class="panel panel-link light" @click="scrollToSection('today-focus')">
        <p class="panel-tag">{{ $t('page.tennisOrigins.today.tag') }}</p>
        <h2>{{ $t('page.tennisOrigins.today.title') }}</h2>
        <p>{{ $t('page.tennisOrigins.today.desc') }}</p>
      </button>
    </section>

    <section id="process" class="process anchor-section">
      <h3>{{ $t('page.tennisOrigins.process.title') }}</h3>
      <div class="timeline">
        <article
          v-for="(step, index) in steps"
          :key="step.key"
          class="timeline-item"
          :class="{ reverse: index % 2 !== 0 }"
        >
          <div
            class="timeline-col text-col"
            :class="{ right: index % 2 !== 0 }"
          >
            <div class="step-body">
              <p class="step-index">{{ $t(`${step.i18nKey}.index`) }}</p>
              <h4>{{ $t(`${step.i18nKey}.title`) }}</h4>
              <p>{{ $t(`${step.i18nKey}.desc`) }}</p>
            </div>
          </div>
          <div class="timeline-dot">{{ index + 1 }}</div>
          <div
            class="timeline-col image-col"
            :class="{ left: index % 2 !== 0 }"
          >
            <div class="image-card">
              <img :src="step.image" :alt="$t(`${step.i18nKey}.imageAlt`)" />
            </div>
          </div>
        </article>
      </div>
    </section>

    <section id="gear-focus" class="detail-section anchor-section">
      <div class="detail-copy">
        <p class="detail-tag">{{ $t('page.tennisOrigins.gearFocus.tag') }}</p>
        <h3>{{ $t('page.tennisOrigins.gearFocus.title') }}</h3>
        <p>{{ $t('page.tennisOrigins.gearFocus.paragraph1') }}</p>
        <p>{{ $t('page.tennisOrigins.gearFocus.paragraph2') }}</p>
        <div class="gear-focus-action">
          <RouterLink class="gear-focus-link" to="/ai-training-plan">
            {{ $t('page.tennisOrigins.gearFocus.chooseRacket') }}
          </RouterLink>
        </div>
      </div>
    </section>

    <section id="legends-focus" class="detail-section anchor-section">
      <div class="detail-copy detail-copy-wide">
        <p class="detail-tag">{{ $t('page.tennisOrigins.legendFocus.tag') }}</p>
        <h3>{{ $t('page.tennisOrigins.legendFocus.title') }}</h3>
        <p>{{ $t('page.tennisOrigins.legendFocus.lead') }}</p>

        <div class="legend-grid">
          <article v-for="legend in legends" :key="legend.key" class="legend-card">
            <img :src="legend.image" :alt="$t(`${legend.i18nKey}.imageAlt`)" />
            <div class="legend-body">
              <p class="legend-era">{{ $t(`${legend.i18nKey}.era`) }}</p>
              <h4>{{ $t(`${legend.i18nKey}.name`) }}</h4>
              <p>{{ $t(`${legend.i18nKey}.desc`) }}</p>
            </div>
          </article>
        </div>

        <div class="legend-more">
          <a
            class="legend-more-link"
            href="https://www.tennisfame.com/"
            target="_blank"
            rel="noreferrer noopener"
          >
            {{ $t('page.tennisOrigins.legendFocus.viewMore') }}
          </a>
        </div>
      </div>
    </section>

    <section id="today-focus" class="detail-section anchor-section">
      <div class="detail-copy">
        <p class="detail-tag">{{ $t('page.tennisOrigins.todayFocus.tag') }}</p>
        <h3>{{ $t('page.tennisOrigins.todayFocus.title') }}</h3>
        <p>{{ $t('page.tennisOrigins.todayFocus.paragraph1') }}</p>
        <p>{{ $t('page.tennisOrigins.todayFocus.paragraph2') }}</p>
      </div>
    </section>

    <button
      v-show="showBackToTop"
      type="button"
      class="back-to-top"
      :aria-label="$t('page.tennisOrigins.backToTop')"
      @click="scrollToTop"
    >
      <span aria-hidden="true">↑</span>
    </button>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import earlyLawnTennisImage from '../assets/early-lawn-court.jpg'
import woodenRacketImage from '../assets/wooden-racket.jpg'
import openTournamentImage from '../assets/tennis-open.jpg'
import smartTennisImage from '../assets/tech-tennis.jpg'
import federerImage from '../assets/名人图片/roger-federer.png'
import nadalImage from '../assets/名人图片/rafael-nadal.jpg'
import serenaImage from '../assets/名人图片/serena-williams.png'
import djokovicImage from '../assets/名人图片/novak-djokovic.jpg'
import liNaImage from '../assets/名人图片/li-na.jpg'
import zhengQinwenImage from '../assets/名人图片/zheng-qinwen.png'
import grafImage from '../assets/名人图片/steffi-graf.jpg'
import alcarazImage from '../assets/名人图片/carlos-alcaraz.jpg'

export default {
  name: 'TennisOriginsView',
  components: {
    RouterLink
  },
  data() {
    return {
      steps: [
        {
          key: 'first',
          i18nKey: 'page.tennisOrigins.process.steps.first',
          image: earlyLawnTennisImage
        },
        {
          key: 'second',
          i18nKey: 'page.tennisOrigins.process.steps.second',
          image: woodenRacketImage
        },
        {
          key: 'third',
          i18nKey: 'page.tennisOrigins.process.steps.third',
          image: openTournamentImage
        },
        {
          key: 'fourth',
          i18nKey: 'page.tennisOrigins.process.steps.fourth',
          image: smartTennisImage
        }
      ],
      legends: [
        {
          key: 'federer',
          i18nKey: 'page.tennisOrigins.legendFocus.items.federer',
          image: federerImage
        },
        {
          key: 'nadal',
          i18nKey: 'page.tennisOrigins.legendFocus.items.nadal',
          image: nadalImage
        },
        {
          key: 'serena',
          i18nKey: 'page.tennisOrigins.legendFocus.items.serena',
          image: serenaImage
        },
        {
          key: 'djokovic',
          i18nKey: 'page.tennisOrigins.legendFocus.items.djokovic',
          image: djokovicImage
        },
        {
          key: 'liNa',
          i18nKey: 'page.tennisOrigins.legendFocus.items.liNa',
          image: liNaImage
        },
        {
          key: 'zhengQinwen',
          i18nKey: 'page.tennisOrigins.legendFocus.items.zhengQinwen',
          image: zhengQinwenImage
        },
        {
          key: 'graf',
          i18nKey: 'page.tennisOrigins.legendFocus.items.graf',
          image: grafImage
        },
        {
          key: 'alcaraz',
          i18nKey: 'page.tennisOrigins.legendFocus.items.alcaraz',
          image: alcarazImage
        }
      ],
      showBackToTop: false
    }
  },
  methods: {
    scrollToSection(id) {
      const target = document.getElementById(id)

      if (target) {
        const offset = 96
        const top = target.getBoundingClientRect().top + window.scrollY - offset

        window.scrollTo({
          top: Math.max(top, 0),
          behavior: 'smooth'
        })
      }
    },
    handleScroll() {
      this.showBackToTop = window.scrollY > 480
    },
    scrollToTop() {
      window.scrollTo({
        top: 0,
        behavior: 'smooth'
      })
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleScroll, { passive: true })
    this.handleScroll()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleScroll)
  }
}
</script>

<style scoped>
.origins-page {
  position: relative;
  isolation: isolate;
  padding: 20px 0 74px;
  color: #f5f5f2;
}

.origins-page::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background-image: url('../assets/history-bg.png');
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
}

.hero {
  max-width: 980px;
}

.kicker {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
}

h1 {
  margin-top: 10px;
  font-size: clamp(2.1rem, 6vw, 4.8rem);
  letter-spacing: -0.03em;
  line-height: 1.08;
}

.lead {
  margin-top: 14px;
  max-width: 760px;
  line-height: 1.7;
  color: rgba(245, 245, 242, 0.9);
}

.back-link {
  display: inline-block;
  margin-top: 16px;
  text-decoration: none;
  color: #f5f5f2;
  border-bottom: 1px solid rgba(245, 245, 242, 0.48);
  padding-bottom: 2px;
}

.overview-grid {
  margin-top: 64px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
  align-items: stretch;
}

.panel {
  border-radius: 22px;
  padding: clamp(28px, 4.5vw, 46px);
}

.panel-first {
  padding: clamp(20px, 3.2vw, 32px);
}

.panel-first h2 {
  margin-top: 8px;
}

.panel-first p {
  margin-top: 8px;
  line-height: 1.6;
}

.panel-link {
  width: 100%;
  border: 0;
  text-align: left;
  cursor: pointer;
  position: relative;
  isolation: isolate;
  overflow: hidden;
  transition:
    transform 0.28s ease,
    border-color 0.28s ease,
    background 0.28s ease,
    box-shadow 0.28s ease;
  will-change: transform;
}

.panel-link::after {
  content: '';
  position: absolute;
  inset: -24%;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(245, 245, 242, 0.2) 0%,
    rgba(245, 245, 242, 0.1) 26%,
    rgba(245, 245, 242, 0.04) 44%,
    rgba(245, 245, 242, 0) 70%
  );
  opacity: 0;
  transform: scale(0.72);
}

.panel-link:hover {
  transform: translateY(-6px) scale(1.02);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.22);
}

.panel-link:hover::after {
  animation: rippleFade 1.2s ease-out;
}

.panel-link:focus-visible {
  outline: 2px solid rgba(245, 245, 242, 0.8);
  outline-offset: 4px;
}

.panel-tag {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.1em;
}

h2 {
  margin-top: 12px;
  font-size: clamp(1.7rem, 3.4vw, 2.8rem);
  line-height: 1.1;
}

.panel p {
  margin-top: 12px;
  font-size: 17px;
  line-height: 1.78;
}

.light {
  background: rgba(16, 16, 16, 0.62);
  color: #f5f5f2;
  backdrop-filter: blur(6px);
}

.dark {
  background: rgba(16, 16, 16, 0.78);
  color: #f5f5f2;
  backdrop-filter: blur(6px);
}

.process {
  margin-top: 104px;
}

.anchor-section {
  scroll-margin-top: 96px;
}

h3 {
  font-size: clamp(1.5rem, 3vw, 2.4rem);
  letter-spacing: -0.02em;
}

.timeline {
  position: relative;
  margin-top: 18px;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 10px;
  bottom: 10px;
  left: 50%;
  width: 2px;
  transform: translateX(-50%);
  background: rgba(130, 150, 170, 0.35);
}

.timeline-item {
  display: grid;
  grid-template-columns: 1fr 60px 1fr;
  align-items: center;
  gap: 18px;
  margin-bottom: 18px;
  position: relative;
}

.timeline-col {
  min-width: 0;
}

.text-col {
  grid-column: 1;
  justify-self: end;
  width: min(100%, 560px);
}

.text-col.right {
  grid-column: 3;
  justify-self: start;
}

.image-col {
  grid-column: 3;
  justify-self: start;
  width: min(100%, 560px);
}

.image-col.left {
  grid-column: 1;
  justify-self: end;
}

.timeline-dot {
  position: absolute;
  left: 50%;
  top: 50%;
  transform: translate(-50%, -50%);
  z-index: 1;
  width: 48px;
  height: 48px;
  border-radius: 50%;
  display: grid;
  place-items: center;
  font-weight: 700;
  color: #fff;
  background: #a6bbcb;
  box-shadow: 0 0 0 8px #f5f5f2;
}

.image-card {
  height: 100%;
  width: 100%;
  overflow: hidden;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(245, 245, 242, 0.18);
}

.image-card img {
  width: 100%;
  height: 100%;
  min-height: 280px;
  object-fit: cover;
  display: block;
}

.step-body {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  padding: 22px 24px 24px;
  border-radius: 22px;
  background: rgba(16, 16, 16, 0.6);
  backdrop-filter: blur(6px);
  transition: transform 0.28s ease, box-shadow 0.28s ease, background 0.28s ease;
  will-change: transform;
}

.step-body::after {
  content: '';
  position: absolute;
  inset: -24%;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(245, 245, 242, 0.18) 0%,
    rgba(245, 245, 242, 0.09) 28%,
    rgba(245, 245, 242, 0.03) 46%,
    rgba(245, 245, 242, 0) 72%
  );
  opacity: 0;
  transform: scale(0.72);
}

.step-body:hover {
  transform: scale(1.02);
  box-shadow: 0 16px 30px rgba(0, 0, 0, 0.22);
}

.step-body:hover::after {
  animation: rippleFade 1.25s ease-out;
}

.step-index {
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  color: rgba(245, 245, 242, 0.72);
}

h4 {
  margin-top: 8px;
  font-size: clamp(1.35rem, 2.5vw, 2rem);
  line-height: 1.2;
}

.step-body p {
  margin-top: 10px;
  font-size: 17px;
  line-height: 1.78;
}

.detail-section {
  margin-top: 92px;
  display: flex;
  justify-content: center;
}

.detail-copy {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  width: min(100%, 920px);
  padding: clamp(30px, 4.8vw, 46px);
  border-radius: 24px;
  background: rgba(16, 16, 16, 0.68);
  backdrop-filter: blur(8px);
  transition: transform 0.3s ease, box-shadow 0.3s ease, background 0.3s ease;
  will-change: transform;
}

.detail-copy::after {
  content: '';
  position: absolute;
  inset: -22%;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(245, 245, 242, 0.16) 0%,
    rgba(245, 245, 242, 0.08) 28%,
    rgba(245, 245, 242, 0.03) 46%,
    rgba(245, 245, 242, 0) 72%
  );
  opacity: 0;
  transform: scale(0.76);
}

.detail-copy:hover {
  transform: scale(1.01);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.2);
}

.detail-copy:hover::after {
  animation: rippleFade 1.35s ease-out;
}

.detail-tag {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  color: rgba(245, 245, 242, 0.76);
}

.detail-copy h3 {
  margin-top: 12px;
}

.detail-copy p {
  margin-top: 14px;
  font-size: 17px;
  line-height: 1.78;
  color: rgba(245, 245, 242, 0.92);
}

.gear-focus-action {
  margin-top: 28px;
  display: flex;
  justify-content: center;
}

.gear-focus-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 24px;
  border-radius: 999px;
  text-decoration: none;
  color: #f5f5f2;
  border: 1px solid rgba(245, 245, 242, 0.28);
  background: rgba(255, 255, 255, 0.06);
  transition: transform 0.28s ease, box-shadow 0.28s ease, background 0.28s ease;
}

.gear-focus-link:hover {
  transform: translateY(-2px) scale(1.02);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
}

.detail-copy-wide {
  width: min(100%, 1120px);
}

.legend-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 24px;
}

.legend-more {
  margin-top: 28px;
  display: flex;
  justify-content: center;
}

.legend-more-link {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 46px;
  padding: 0 24px;
  border-radius: 999px;
  text-decoration: none;
  color: #f5f5f2;
  border: 1px solid rgba(245, 245, 242, 0.28);
  background: rgba(255, 255, 255, 0.06);
  transition: transform 0.28s ease, box-shadow 0.28s ease, background 0.28s ease;
}

.legend-more-link:hover {
  transform: translateY(-2px) scale(1.02);
  background: rgba(255, 255, 255, 0.12);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.22);
}

.legend-card {
  position: relative;
  isolation: isolate;
  overflow: hidden;
  border-radius: 22px;
  background: rgba(255, 255, 255, 0.08);
  border: 1px solid rgba(245, 245, 242, 0.16);
  transition: transform 0.28s ease, box-shadow 0.28s ease, border-color 0.28s ease;
  will-change: transform;
}

.legend-card::after {
  content: '';
  position: absolute;
  inset: -24%;
  border-radius: inherit;
  pointer-events: none;
  background: radial-gradient(
    circle,
    rgba(245, 245, 242, 0.2) 0%,
    rgba(245, 245, 242, 0.1) 26%,
    rgba(245, 245, 242, 0.04) 44%,
    rgba(245, 245, 242, 0) 70%
  );
  opacity: 0;
  transform: scale(0.72);
}

.legend-card:hover {
  transform: translateY(-4px) scale(1.02);
  box-shadow: 0 18px 36px rgba(0, 0, 0, 0.24);
  border-color: rgba(245, 245, 242, 0.26);
}

.legend-card:hover::after {
  animation: rippleFade 1.2s ease-out;
}

@keyframes rippleFade {
  0% {
    opacity: 0;
    transform: scale(0.72);
  }

  35% {
    opacity: 0.55;
  }

  100% {
    opacity: 0;
    transform: scale(1.28);
  }
}

.legend-card img {
  width: 100%;
  height: 280px;
  object-fit: cover;
  display: block;
}

.legend-body {
  padding: 22px 22px 24px;
}

.legend-era {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  color: rgba(245, 245, 242, 0.72);
}

.legend-body h4 {
  margin-top: 8px;
}

.legend-body p {
  margin-top: 10px;
  font-size: 16px;
  line-height: 1.82;
  color: rgba(245, 245, 242, 0.92);
}

.back-to-top {
  position: fixed;
  right: 24px;
  bottom: 24px;
  z-index: 20;
  width: 48px;
  height: 48px;
  border: 1px solid rgba(245, 245, 242, 0.28);
  border-radius: 50%;
  background: rgba(16, 16, 16, 0.72);
  color: #f5f5f2;
  font-size: 22px;
  line-height: 1;
  display: grid;
  place-items: center;
  cursor: pointer;
  backdrop-filter: blur(8px);
  box-shadow: 0 14px 28px rgba(0, 0, 0, 0.28);
  transition: transform 0.25s ease, background 0.25s ease, box-shadow 0.25s ease;
}

.back-to-top:hover {
  transform: translateY(-2px) scale(1.05);
  background: rgba(16, 16, 16, 0.86);
  box-shadow: 0 18px 34px rgba(0, 0, 0, 0.34);
}

@media (max-width: 900px) {
  .overview-grid {
    grid-template-columns: 1fr;
  }

  .timeline::before {
    left: 24px;
    transform: none;
  }

  .timeline-item {
    grid-template-columns: 48px 1fr;
    gap: 12px;
    margin-bottom: 20px;
  }

  .timeline-dot {
    position: static;
    transform: none;
    grid-column: 1;
    width: 40px;
    height: 40px;
    box-shadow: 0 0 0 6px #f5f5f2;
  }

  .text-col,
  .text-col.right,
  .image-col,
  .image-col.left {
    grid-column: 2;
    justify-self: stretch;
    width: 100%;
  }

  .text-col {
    order: 1;
  }

  .image-col {
    order: 2;
  }

  .image-card img {
    height: 220px;
  }

  .legend-grid {
    grid-template-columns: 1fr;
  }

  .back-to-top {
    right: 16px;
    bottom: 16px;
    width: 42px;
    height: 42px;
    font-size: 20px;
  }
}
</style>

