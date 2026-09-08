<template>
  <div>
    <section class="hero">
      <div class="hero-image-layer" aria-hidden="true">
        <img
          v-for="(image, index) in heroBackgrounds"
          :key="image"
          :src="image"
          alt=""
          :class="{ active: index === currentHeroIndex }"
        />
      </div>
      <div class="hero-content">
        <p class="eyebrow">{{ $t('page.hero.eyebrow') }}</p>
        <h1>
          {{ $t('page.hero.titleLine1') }}
          <span>{{ $t('page.hero.titleLine2') }}</span>
        </h1>
        <p class="lead">{{ $t('page.hero.lead') }}</p>
        <a-button class="cta-btn" type="primary" shape="round" href="#featured">
          {{ $t('page.hero.cta') }}
        </a-button>
      </div>
    </section>
    <transition name="float-welcome-fade">
      <div v-if="showFloatingWelcome" class="floating-welcome" aria-live="polite">
        <span v-for="(token, index) in floatingWelcomeTokens" :key="`${token}-${index}`" :style="{ animationDelay: `${index * 80}ms` }">
          {{ token }}
        </span>
      </div>
    </transition>

    <section class="featured-area">
      <div class="featured-title-wrap">
        <h2>{{ $t('page.featured.sectionTitle') }}</h2>
      </div>

      <section
        id="featured"
        class="featured-shell"
        :class="{
          'shake-left': featuredEdgeShake === 'left',
          'shake-right': featuredEdgeShake === 'right'
        }"
      >
        <button
          v-if="featuredPageCount > 1"
          type="button"
          class="arrow-btn arrow-left"
          :aria-label="$t('page.featured.prevPage')"
          @click="prevFeaturedPage"
        >
          <span aria-hidden="true">‹</span>
        </button>

        <div class="featured" :class="`featured-page-${currentFeaturedPage}`">
          <article v-for="item in pagedFeatured" :key="item.key" class="card">
            <img :src="item.image" :alt="$t(`${item.i18nKey}.imageAlt`)" />
            <RouterLink
              v-if="item.route"
              class="card-link"
              :to="item.route"
              :aria-label="$t('page.featured.openCard')"
            />
            <div class="card-meta">
              <p>{{ $t(`${item.i18nKey}.category`) }}</p>
              <h2>{{ $t(`${item.i18nKey}.title`) }}</h2>
            </div>
          </article>
        </div>

        <button
          v-if="featuredPageCount > 1"
          type="button"
          class="arrow-btn arrow-right"
          :aria-label="$t('page.featured.nextPage')"
          @click="nextFeaturedPage"
        >
          <span aria-hidden="true">›</span>
        </button>
      </section>
    </section>

    <section id="philosophy" class="manifesto">
      <p>
        {{ $t('page.manifesto.part1') }}
        <strong>{{ $t('page.manifesto.highlight') }}</strong>
        {{ $t('page.manifesto.part2') }}
      </p>
    </section>

    <section class="split">
      <RouterLink class="panel light panel-link panel-link-light" to="/ai-training-plan">
        <p class="panel-tag">{{ $t('page.split.left.tag') }}</p>
        <h3>{{ $t('page.split.left.title') }}</h3>
        <p>{{ $t('page.split.left.desc') }}</p>
        <span class="panel-link-label panel-link-label-light">{{ $t('page.split.left.action') }}</span>
      </RouterLink>
      <RouterLink class="panel dark panel-link" to="/training-feedback/coaches">
        <p class="panel-tag">{{ $t('page.split.right.tag') }}</p>
        <h3>{{ $t('page.split.right.title') }}</h3>
        <p>{{ $t('page.split.right.desc') }}</p>
        <span class="panel-link-label">{{ $t('page.split.right.action') }}</span>
      </RouterLink>
    </section>

    <section class="home-bottom-bg" aria-hidden="true"></section>
  </div>
</template>

<script>
import { Button as AButton } from '@arco-design/web-vue'
import '@arco-design/web-vue/es/button/style/css.js'
import { RouterLink } from 'vue-router'
import heroBg1 from '../assets/hero-title-bg-4.jpg'
import heroBg2 from '../assets/hero-title-bg-3.jpg'
import heroBg3 from '../assets/hero-title-bg-2.jpg'
import heroBg4 from '../assets/hero-title-bg-1.jpg'
import featuredFirst from '../assets/featured/featured-first.jpg'
import featuredSecond from '../assets/featured/featured-second.jpg'
import featuredThird from '../assets/featured/featured-third.jpg'
import featuredFourth from '../assets/featured/featured-fourth.jpg'
import featuredFifth from '../assets/featured/featured-fifth.jpg'
import featuredSixth from '../assets/featured/featured-sixth.jpg'
import featuredSeventh from '../assets/featured/featured-seventh.jpg'
import { getStoredAuthToken } from '../services/authService'

export default {
  name: 'HomeView',
  components: {
    AButton,
    RouterLink
  },
  data() {
    return {
      currentHeroIndex: 0,
      heroTimer: null,
      heroBackgrounds: [heroBg1, heroBg2, heroBg3, heroBg4],
      currentFeaturedPage: 0,
      featuredPageSize: 4,
      featuredEdgeShake: '',
      featuredShakeTimer: null,
      showFloatingWelcome: false,
      floatingWelcomeTimer: null,
      authDisplayName: '',
      featured: [
        {
          key: 'first',
          i18nKey: 'page.featured.items.first',
          image: featuredFirst,
          route: '/tennis-origins'
        },
        {
          key: 'second',
          i18nKey: 'page.featured.items.second',
          image: featuredSecond,
          route: '/tennis-forum'
        },
        {
          key: 'third',
          i18nKey: 'page.featured.items.third',
          image: featuredThird,
          route: '/tennis-ai'
        },
        {
          key: 'fourth',
          i18nKey: 'page.featured.items.fourth',
          image: featuredFourth,
          route: '/tennis-resources'
        },
        {
          key: 'fifth',
          i18nKey: 'page.featured.items.fifth',
          image: featuredFifth,
          route: '/premium-courses'
        },
        {
          key: 'sixth',
          i18nKey: 'page.featured.items.sixth',
          image: featuredSixth,
          route: '/external-courses'
        },
        {
          key: 'seventh',
          i18nKey: 'page.featured.items.seventh',
          image: featuredSeventh,
          route: '/developing-letter'
        }
      ]
    }
  },
  computed: {
    floatingWelcomeTokens() {
      const text = this.$t('page.homeWelcome.floatText', { name: this.authDisplayName || '' })
      return Array.from(String(text || '')).filter((ch) => ch.trim())
    },
    featuredPageCount() {
      return Math.ceil(this.featured.length / this.featuredPageSize)
    },
    pagedFeatured() {
      const start = this.currentFeaturedPage * this.featuredPageSize
      return this.featured.slice(start, start + this.featuredPageSize)
    }
  },
  mounted() {
    this.syncAuthDisplayName()
    window.addEventListener('storage', this.syncAuthDisplayName)
    window.addEventListener('tennislab-auth-changed', this.syncAuthDisplayName)
    this.startHeroAutoplay()
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.syncAuthDisplayName)
    window.removeEventListener('tennislab-auth-changed', this.syncAuthDisplayName)
    this.clearFloatingWelcomeTimer()
    this.stopHeroAutoplay()
    this.clearFeaturedShake()
  },
  methods: {
    consumeWelcomeFlag() {
      if (typeof window === 'undefined') return false
      const flag = window.sessionStorage.getItem('tennisLabShowWelcomeOnce') === '1'
      if (flag) {
        window.sessionStorage.removeItem('tennisLabShowWelcomeOnce')
      }
      return flag
    },
    clearFloatingWelcomeTimer() {
      if (this.floatingWelcomeTimer) {
        clearTimeout(this.floatingWelcomeTimer)
        this.floatingWelcomeTimer = null
      }
    },
    triggerFloatingWelcome() {
      this.clearFloatingWelcomeTimer()
      if (!getStoredAuthToken() || !this.authDisplayName) {
        this.showFloatingWelcome = false
        return
      }
      this.showFloatingWelcome = false
      this.$nextTick(() => {
        this.showFloatingWelcome = true
        this.floatingWelcomeTimer = setTimeout(() => {
          this.showFloatingWelcome = false
          this.floatingWelcomeTimer = null
        }, 2000)
      })
    },
    syncAuthDisplayName() {
      if (typeof window === 'undefined') {
        this.authDisplayName = ''
        this.showFloatingWelcome = false
        return
      }
      const rawAuth = window.localStorage.getItem('tennisLabAuth')
      if (!rawAuth) {
        this.authDisplayName = ''
        this.showFloatingWelcome = false
        return
      }
      try {
        const parsed = JSON.parse(rawAuth)
        const user = parsed?.user || parsed?.data?.user || {}
        const displayName = String(user?.username || user?.realName || user?.name || '').trim()
        this.authDisplayName = displayName
        if (this.consumeWelcomeFlag()) {
          this.triggerFloatingWelcome()
        } else {
          this.showFloatingWelcome = false
        }
      } catch {
        this.authDisplayName = ''
        this.showFloatingWelcome = false
      }
    },
    startHeroAutoplay() {
      this.stopHeroAutoplay()
      this.heroTimer = setInterval(() => {
        this.currentHeroIndex = (this.currentHeroIndex + 1) % this.heroBackgrounds.length
      }, 2500)
    },
    stopHeroAutoplay() {
      if (this.heroTimer) {
        clearInterval(this.heroTimer)
        this.heroTimer = null
      }
    },
    goToFeaturedPage(pageIndex) {
      if (pageIndex < 0 || pageIndex >= this.featuredPageCount) {
        return
      }
      this.currentFeaturedPage = pageIndex
    },
    clearFeaturedShake() {
      if (this.featuredShakeTimer) {
        clearTimeout(this.featuredShakeTimer)
        this.featuredShakeTimer = null
      }
      this.featuredEdgeShake = ''
    },
    triggerFeaturedEdgeShake(direction) {
      this.clearFeaturedShake()
      this.$nextTick(() => {
        this.featuredEdgeShake = direction
        this.featuredShakeTimer = setTimeout(() => {
          this.featuredEdgeShake = ''
          this.featuredShakeTimer = null
        }, 420)
      })
    },
    prevFeaturedPage() {
      if (this.currentFeaturedPage <= 0) {
        this.triggerFeaturedEdgeShake('left')
        return
      }
      this.goToFeaturedPage(this.currentFeaturedPage - 1)
    },
    nextFeaturedPage() {
      if (this.currentFeaturedPage >= this.featuredPageCount - 1) {
        this.triggerFeaturedEdgeShake('right')
        return
      }
      this.goToFeaturedPage(this.currentFeaturedPage + 1)
    }
  }
}
</script>

<style scoped>
.hero {
  position: relative;
  min-height: calc(100vh - 94px);
  display: grid;
  align-content: center;
  justify-items: start;
  width: min(100%, 1100px);
  max-width: 1100px;
  margin: 0 auto;
  gap: 20px;
  isolation: isolate;
}

.hero-content {
  position: relative;
  z-index: 1;
  width: 100vw;
  margin-left: calc(50% - 50vw);
  padding-left: clamp(18px, 4vw, 56px);
  text-align: left;
}

.hero-image-layer {
  position: absolute;
  top: 8%;
  bottom: 2%;
  left: calc(50% - 50vw);
  width: 100vw;
  z-index: 0;
  pointer-events: none;
  overflow: hidden;
}

.hero-image-layer::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(245, 245, 242, 0.48) 0%, rgba(245, 245, 242, 0) 12%),
    linear-gradient(180deg, rgba(245, 245, 242, 0) 78%, rgba(245, 245, 242, 0.24) 90%, #f5f5f2 100%);
}

.hero-image-layer img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  object-position: 100% 40%;
  opacity: 0;
  filter: grayscale(88%) contrast(96%) blur(0.1px);
  transition: opacity 1.2s ease;
}

.hero-image-layer img.active {
  opacity: 0.38;
}

.eyebrow {
  text-transform: uppercase;
  letter-spacing: 0.12em;
  font-size: 12px;
}

h1 {
  font-size: clamp(3rem, 11vw, 9rem);
  line-height: 1.1;
  text-transform: uppercase;
  font-weight: 900;
  letter-spacing: -0.04em;
}

h1 span {
  display: block;
  margin-left: clamp(24px, 10vw, 220px);
}

.lead {
  max-width: 660px;
  font-size: clamp(1rem, 1.6vw, 1.25rem);
  line-height: 1.6;
  color: rgba(16, 16, 16, 0.76);
}

.cta-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-top: 8px;
  min-height: 44px;
  padding: 0 20px;
  border: 1px solid #101010;
  border-radius: 999px;
  background: #101010;
  color: #f5f5f2;
  font-weight: 600;
  letter-spacing: 0.03em;
  transition:
    transform 0.25s ease,
    background-color 0.25s ease,
    color 0.25s ease,
    border-color 0.25s ease,
    box-shadow 0.25s ease;
}

.cta-btn:hover {
  transform: translateY(-2px);
  background: #ffffff;
  color: #101010;
  border-color: #101010;
}

.cta-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(16, 16, 16, 0.22);
}

.floating-welcome {
  position: fixed;
  top: 112px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 15;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  justify-content: center;
  max-width: min(92vw, 860px);
  pointer-events: none;
}

.floating-welcome span {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 26px;
  min-height: 26px;
  padding: 2px 8px;
  border: 1px solid rgba(16, 16, 16, 0.14);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.88);
  color: #101010;
  box-shadow: 0 10px 18px rgba(16, 16, 16, 0.08);
  backdrop-filter: blur(4px);
  font-size: clamp(14px, 1.6vw, 18px);
  font-weight: 700;
  animation: floatUp 1s ease forwards;
}

.float-welcome-fade-enter-active,
.float-welcome-fade-leave-active {
  transition: opacity 0.25s ease;
}

.float-welcome-fade-enter-from,
.float-welcome-fade-leave-to {
  opacity: 0;
}

@keyframes floatUp {
  0% {
    transform: translateY(8px);
    opacity: 0;
  }
  30% {
    opacity: 1;
  }
  100% {
    transform: translateY(-18px);
    opacity: 1;
  }
}

.featured-shell {
  position: relative;
  margin-top: 42px;
  padding: 0 56px;
}

.featured-area {
  position: relative;
  margin-top: 34px;
  padding: 12px 0 18px;
  isolation: isolate;
}

.featured-area::before {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  left: calc(50% - 50vw);
  width: 100vw;
  background-image: url('../assets/learning-resources-bg.jpg');
  background-size: cover;
  background-position: center;
  filter: saturate(92%) contrast(96%);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 14%,
    #000 86%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 16%,
    #000 84%,
    transparent 100%
  );
  z-index: 0;
  pointer-events: none;
}

.featured-area::after {
  content: none;
}

.featured-area > * {
  position: relative;
  z-index: 1;
}

.featured {
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  gap: 12px;
}

.arrow-btn {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  width: 42px;
  height: 42px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.18);
  background: rgba(255, 255, 255, 0.68);
  color: rgba(16, 16, 16, 0.9);
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  opacity: 0;
  pointer-events: none;
  transition: opacity 0.2s ease, transform 0.2s ease, border-color 0.2s ease;
  z-index: 6;
  backdrop-filter: blur(5px);
}

.arrow-left {
  left: 2px;
}

.arrow-right {
  right: 2px;
}

.arrow-btn span {
  font-size: 28px;
  line-height: 1;
  font-weight: 300;
}

.featured-shell:hover .arrow-btn,
.featured-shell:focus-within .arrow-btn {
  opacity: 1;
  pointer-events: auto;
}

.arrow-btn:hover {
  transform: translateY(-50%) scale(1.04);
  border-color: rgba(16, 16, 16, 0.36);
}

.shake-left {
  animation: shakeLeft 0.4s ease;
}

.shake-right {
  animation: shakeRight 0.4s ease;
}

@keyframes shakeLeft {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(12px);
  }
  55% {
    transform: translateX(-7px);
  }
  80% {
    transform: translateX(4px);
  }
}

@keyframes shakeRight {
  0%,
  100% {
    transform: translateX(0);
  }
  25% {
    transform: translateX(-12px);
  }
  55% {
    transform: translateX(7px);
  }
  80% {
    transform: translateX(-4px);
  }
}

.featured-title-wrap {
  display: flex;
  justify-content: flex-end;
  padding-right: clamp(20px, 5vw, 72px);
}

.featured-title-wrap h2 {
  font-size: clamp(1.8rem, 3.3vw, 2.7rem);
  font-weight: 800;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(16, 16, 16, 0.86);
}

.card {
  position: relative;
  overflow: hidden;
  border-radius: 20px;
  background: #161616;
  color: #fff;
  min-height: 214px;
  transition: transform 0.28s ease;
}

.featured-page-0 .card:nth-child(1) {
  grid-column: span 7;
}

.featured-page-0 .card:nth-child(2) {
  grid-column: span 5;
  margin-top: 18px;
}

.featured-page-0 .card:nth-child(3) {
  grid-column: span 6;
  margin-top: 16px;
}

.featured-page-0 .card:nth-child(4) {
  grid-column: span 6;
  margin-top: 26px;
}

.featured-page-1 .card:nth-child(1) {
  grid-column: 1 / span 5;
  margin-top: 22px;
}

.featured-page-1 .card:nth-child(2) {
  grid-column: 6 / -1;
}

.featured-page-1 .card:nth-child(3) {
  grid-column: 3 / span 8;
  margin-top: 20px;
}

.card:hover {
  transform: translateY(-6px);
}

.card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(20%);
  transition: transform 0.6s ease;
}

.card:hover img {
  transform: scale(1.06);
}

.card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.08) 20%, rgba(0, 0, 0, 0.7) 100%);
}

.card-link {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.card-meta {
  position: relative;
  z-index: 3;
  padding: 20px;
  margin-top: 146px;
}

.card-meta p {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 17px;
  font-weight: 600;
  opacity: 0.84;
}

.card-meta h2 {
  margin-top: 6px;
  font-size: clamp(1.4rem, 2.8vw, 2.3rem);
  letter-spacing: -0.02em;
}

.manifesto {
  margin: 82px 0 58px;
  border-top: 1px solid rgba(16, 16, 16, 0.2);
  border-bottom: 1px solid rgba(16, 16, 16, 0.2);
  padding: 34px 0;
}

.manifesto p {
  max-width: 980px;
  font-size: clamp(1.4rem, 3.2vw, 3rem);
  line-height: 1.18;
  letter-spacing: -0.03em;
}

.manifesto strong {
  background: #101010;
  color: #fff;
  padding: 0 8px;
}

.split {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 16px;
  padding-bottom: 74px;
}

.panel {
  border-radius: 22px;
  padding: clamp(20px, 4vw, 44px);
}

.panel-link {
  position: relative;
  display: block;
  text-decoration: none;
  transition: transform 0.24s ease, box-shadow 0.24s ease;
}

.panel-link:hover {
  transform: translateY(-3px);
  box-shadow: 0 14px 24px rgba(0, 0, 0, 0.2);
}

.panel-tag {
  text-transform: uppercase;
  font-size: 11px;
  letter-spacing: 0.1em;
}

.panel h3 {
  margin-top: 12px;
  font-size: clamp(1.6rem, 3.5vw, 3rem);
  line-height: 1.03;
}

.panel p {
  margin-top: 12px;
  max-width: 520px;
  line-height: 1.6;
}

.panel > p:not(.panel-tag) {
  font-size: clamp(1.05rem, 1.35vw, 1.28rem);
}

.panel-link-label {
  margin-top: 16px;
  display: inline-flex;
  align-items: center;
  min-height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(255, 255, 255, 0.32);
  color: rgba(255, 255, 255, 0.86);
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.panel-link-light {
  color: #101010;
}

.panel-link-label-light {
  border-color: rgba(16, 16, 16, 0.22);
  color: rgba(16, 16, 16, 0.8);
}

.light {
  background: #ffffff;
}

.dark {
  background: #101010;
  color: #f5f5f2;
}

.home-bottom-bg {
  position: relative;
  left: calc(50% - 50vw);
  width: 100vw;
  height: clamp(180px, 28vw, 360px);
  margin-top: 20px;
  overflow: hidden;
  isolation: isolate;
}

.home-bottom-bg::before {
  content: '';
  position: absolute;
  inset: 0;
  background-image: url('../assets/homepage-footer-bg.jpg');
  background-size: cover;
  background-position: center 45%;
  background-attachment: fixed;
  transform: scale(1.04);
  filter: saturate(92%) contrast(96%);
  -webkit-mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 18%,
    #000 82%,
    transparent 100%
  );
  mask-image: linear-gradient(
    to bottom,
    transparent 0%,
    #000 18%,
    #000 82%,
    transparent 100%
  );
}

.home-bottom-bg::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(180deg, rgba(247, 247, 244, 0.98) 0%, rgba(247, 247, 244, 0.42) 24%, rgba(247, 247, 244, 0.22) 50%, rgba(247, 247, 244, 0.5) 76%, rgba(247, 247, 244, 0.94) 100%),
    linear-gradient(90deg, rgba(247, 247, 244, 0.2) 0%, rgba(247, 247, 244, 0) 18%, rgba(247, 247, 244, 0) 82%, rgba(247, 247, 244, 0.2) 100%);
}

@media (max-width: 900px) {
  .hero-image-layer img {
    object-position: 26% 40%;
  }

  .home-bottom-bg::before {
    background-attachment: scroll;
  }
}

@media (max-width: 900px) {
  .featured-title-wrap {
    justify-content: flex-start;
    padding-right: 0;
  }

  .featured {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .arrow-btn {
    opacity: 1;
    pointer-events: auto;
  }

  .featured-shell {
    padding: 0 44px;
  }

  .card:nth-child(1),
  .card:nth-child(2),
  .card:nth-child(3),
  .card:nth-child(4) {
    grid-column: span 1;
    margin-top: 0;
  }

  .card-meta {
    margin-top: 130px;
  }

  .split {
    grid-template-columns: 1fr;
  }
}
</style>
