<template>
  <div class="page">
    <transition name="intro-fade">
      <div v-if="showIntroOverlay" class="intro-overlay">
        <div class="intro-video-shell" aria-hidden="true">
          <div
            v-if="showIntroFallback"
            class="intro-video-fallback"
            :style="{ backgroundImage: `url(${introFallbackImage})` }"
          />
          <template v-else>
            <video
              class="intro-video intro-video-backdrop"
              autoplay
              muted
              playsinline
              preload="auto"
              :poster="introFallbackImage"
              tabindex="-1"
              disablepictureinpicture
              controlslist="nodownload noplaybackrate nofullscreen"
            >
              <source :src="introVideoSrc" type="video/mp4" />
            </video>
            <video
              ref="introVideo"
              class="intro-video intro-video-main"
              autoplay
              muted
              playsinline
              preload="auto"
              :poster="introFallbackImage"
              disablepictureinpicture
              controlslist="nodownload noplaybackrate nofullscreen"
              @loadedmetadata="handleIntroVideoMetadata"
              @ended="dismissIntroOverlay"
              @error="handleIntroVideoError"
            >
              <source :src="introVideoSrc" type="video/mp4" />
            </video>
          </template>
        </div>
        <div class="intro-scrim" />
        <div class="intro-content">
          <p class="intro-eyebrow">Tennis Lab</p>
          <h1>欢迎来到<br>云析跃网</h1>
          <p>即将进入，开始浏览课程、训练与社区内容。</p>
        </div>
        <button type="button" class="intro-skip-btn" @click="dismissIntroOverlay">
          跳过 / Skip
        </button>
      </div>
    </transition>

    <header class="topbar">
      <p class="brand">{{ $t('page.brand') }}</p>
      <nav class="desktop-nav">
        <RouterLink v-if="isAuthenticated" to="/messages">
          {{ $t('page.nav.messages') }}
        </RouterLink>
        <RouterLink :to="{ path: '/', hash: '#featured' }">{{ $t('page.nav.learningResources') }}</RouterLink>
        <RouterLink to="/my-tennis">{{ $t('page.nav.myTennis') }}</RouterLink>
        <RouterLink :to="{ path: '/', hash: '#contact' }">{{ $t('page.nav.contact') }}</RouterLink>
        <button v-if="isAuthenticated" type="button" class="nav-action-btn" @click="handleLogout">
          {{ $t('page.nav.logout') }}
        </button>
        <RouterLink v-else to="/auth">{{ $t('page.nav.auth') }}</RouterLink>
      </nav>
      <div class="lang-switch desktop-lang-switch" role="group" aria-label="Language Switch">
        <button
          type="button"
          :class="{ active: currentLocale === 'zh-CN' }"
          @click="setLocale('zh-CN')"
        >
          {{ $t('common.language.zh') }}
        </button>
        <button
          type="button"
          :class="{ active: currentLocale === 'en-US' }"
          @click="setLocale('en-US')"
        >
          {{ $t('common.language.en') }}
        </button>
      </div>
      <button
        type="button"
        class="menu-toggle"
        :aria-expanded="isMobileMenuOpen ? 'true' : 'false'"
        aria-label="Toggle Menu"
        @click="toggleMobileMenu"
      >
        <span />
        <span />
        <span />
      </button>
      <transition name="mobile-menu-fade">
        <div v-if="isMobileMenuOpen" class="mobile-menu">
          <nav class="mobile-nav">
            <RouterLink
              v-if="isAuthenticated"
              to="/messages"
              @click="closeMobileMenu"
            >
              {{ $t('page.nav.messages') }}
            </RouterLink>
            <RouterLink :to="{ path: '/', hash: '#featured' }" @click="closeMobileMenu">
              {{ $t('page.nav.learningResources') }}
            </RouterLink>
            <RouterLink to="/my-tennis" @click="closeMobileMenu">{{ $t('page.nav.myTennis') }}</RouterLink>
            <RouterLink :to="{ path: '/', hash: '#contact' }" @click="closeMobileMenu">{{ $t('page.nav.contact') }}</RouterLink>
            <button
              v-if="isAuthenticated"
              type="button"
              class="mobile-nav-action-btn"
              @click="handleLogout"
            >
              {{ $t('page.nav.logout') }}
            </button>
            <RouterLink v-else to="/auth" @click="closeMobileMenu">{{ $t('page.nav.auth') }}</RouterLink>
          </nav>
          <div class="lang-switch mobile-lang-switch" role="group" aria-label="Language Switch">
            <button
              type="button"
              :class="{ active: currentLocale === 'zh-CN' }"
              @click="setLocaleAndClose('zh-CN')"
            >
              {{ $t('common.language.zh') }}
            </button>
            <button
              type="button"
              :class="{ active: currentLocale === 'en-US' }"
              @click="setLocaleAndClose('en-US')"
            >
              {{ $t('common.language.en') }}
            </button>
          </div>
        </div>
      </transition>
    </header>

    <main class="view-wrapper">
      <RouterView />
    </main>

    <footer v-if="showFooter" id="contact">
      <div class="footer-title">
        <h3>{{ $t('page.footer.title') }}</h3>
      </div>
      <div class="footer-contact">
        <p class="contact-item">
          <IconUser />
          <span>{{ $t('page.footer.creatorLabel') }}{{ $t('page.footer.creator') }}</span>
        </p>
        <a class="contact-item contact-link" :href="`mailto:${$t('page.footer.email')}`">
          <IconEmail />
          <span>{{ $t('page.footer.emailLabel') }}{{ $t('page.footer.email') }}</span>
        </a>
      </div>
    </footer>
  </div>
</template>

<script>
import { RouterLink, RouterView } from 'vue-router'
import IconEmail from '@arco-design/web-vue/es/icon/icon-email'
import IconUser from '@arco-design/web-vue/es/icon/icon-user'
import { getStoredAuthToken } from './services/authService'
import introVideoSrc from './assets/open2-web.mp4'
import introFallbackImage from './assets/tennis-open.jpg'

const INTRO_SEEN_STORAGE_KEY = 'tennisLabIntroSeen'
const INTRO_FALLBACK_DURATION_MS = 2200

export default {
  name: 'TennisLabApp',
  components: {
    RouterLink,
    RouterView,
    IconEmail,
    IconUser
  },
  data() {
    return {
      isAuthenticated: false,
      isMobileMenuOpen: false,
      introVideoSrc,
      introFallbackImage,
      showIntroOverlay: false,
      showIntroFallback: false,
      introDismissTimer: null
    }
  },
  watch: {
    '$route.fullPath'() {
      this.closeMobileMenu()
    }
  },
  computed: {
    currentLocale() {
      return this.$i18n.locale
    },
    showFooter() {
      return !['tennis-resources', 'premium-courses', 'premium-course-detail', 'external-courses', 'my-tennis'].includes(this.$route.name)
    }
  },
  mounted() {
    this.initIntroOverlay()
    this.syncAuthStatus()
    window.addEventListener('storage', this.syncAuthStatus)
    window.addEventListener('tennislab-auth-changed', this.syncAuthStatus)
  },
  beforeUnmount() {
    this.clearIntroDismissTimer()
    this.unlockPageScroll()
    window.removeEventListener('storage', this.syncAuthStatus)
    window.removeEventListener('tennislab-auth-changed', this.syncAuthStatus)
  },
  methods: {
    initIntroOverlay() {
      if (typeof window === 'undefined') {
        return
      }

      const hasSeenIntro = window.sessionStorage.getItem(INTRO_SEEN_STORAGE_KEY) === '1'
      if (hasSeenIntro) {
        this.showIntroOverlay = false
        return
      }

      this.showIntroFallback = !this.canPlayIntroVideo()
      this.showIntroOverlay = true
      this.lockPageScroll()
      this.$nextTick(() => {
        if (this.showIntroFallback) {
          this.startIntroDismissTimer(INTRO_FALLBACK_DURATION_MS)
          return
        }

        const video = this.$refs.introVideo
        if (video?.play) {
          video.play().catch(() => {
            this.handleIntroVideoError()
          })
        }
      })
    },
    canPlayIntroVideo() {
      if (typeof document === 'undefined') {
        return false
      }

      const probe = document.createElement('video')
      return Boolean(probe.canPlayType?.('video/mp4'))
    },
    clearIntroDismissTimer() {
      if (this.introDismissTimer) {
        clearTimeout(this.introDismissTimer)
        this.introDismissTimer = null
      }
    },
    startIntroDismissTimer(durationMs) {
      this.clearIntroDismissTimer()
      this.introDismissTimer = setTimeout(() => {
        this.dismissIntroOverlay()
      }, durationMs)
    },
    handleIntroVideoMetadata(event) {
      const duration = Number(event?.target?.duration)
      if (!Number.isFinite(duration) || duration <= 0) {
        this.startIntroDismissTimer(INTRO_FALLBACK_DURATION_MS)
        return
      }

      this.startIntroDismissTimer(Math.round(duration * 1000) + 120)
    },
    handleIntroVideoError() {
      this.showIntroFallback = true
      this.startIntroDismissTimer(INTRO_FALLBACK_DURATION_MS)
    },
    dismissIntroOverlay() {
      if (!this.showIntroOverlay) {
        return
      }

      this.clearIntroDismissTimer()
      this.showIntroOverlay = false
      this.unlockPageScroll()
      if (typeof window !== 'undefined') {
        window.sessionStorage.setItem(INTRO_SEEN_STORAGE_KEY, '1')
      }
    },
    lockPageScroll() {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = 'hidden'
      }
    },
    unlockPageScroll() {
      if (typeof document !== 'undefined') {
        document.body.style.overflow = ''
      }
    },
    syncAuthStatus() {
      this.isAuthenticated = Boolean(getStoredAuthToken())
    },
    handleLogout() {
      const shouldLogout = window.confirm(this.$t('page.nav.logoutConfirm'))
      if (!shouldLogout) {
        return
      }
      localStorage.removeItem('tennisLabAuth')
      window.dispatchEvent(new Event('tennislab-auth-changed'))
      this.closeMobileMenu()
      if (this.$route.path !== '/') {
        this.$router.push('/')
      }
    },
    toggleMobileMenu() {
      this.isMobileMenuOpen = !this.isMobileMenuOpen
    },
    closeMobileMenu() {
      this.isMobileMenuOpen = false
    },
    setLocale(locale) {
      this.$i18n.locale = locale
    },
    setLocaleAndClose(locale) {
      this.setLocale(locale)
      this.closeMobileMenu()
    }
  }
}
</script>

<style scoped>
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;700;800;900&display=swap');

.page {
  position: relative;
  min-height: 100vh;
  background: #f5f5f2;
  color: #101010;
  font-family: Inter, system-ui, -apple-system, sans-serif;
}

.intro-overlay {
  position: fixed;
  inset: 0;
  z-index: 30;
  display: grid;
  place-items: center;
  overflow: hidden;
  background: #050505;
}

.intro-overlay::before {
  content: '';
  position: absolute;
  inset: 18px;
  border-radius: 28px;
  border: 1px solid rgba(255, 255, 255, 0.28);
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.26), rgba(255, 255, 255, 0.03) 18%, rgba(255, 255, 255, 0.03) 82%, rgba(255, 255, 255, 0.26)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.24), rgba(255, 255, 255, 0.03) 22%, rgba(255, 255, 255, 0.03) 78%, rgba(255, 255, 255, 0.24));
  box-shadow:
    inset 0 0 48px rgba(255, 255, 255, 0.06),
    0 0 28px rgba(255, 255, 255, 0.04);
  opacity: 0.7;
  pointer-events: none;
  -webkit-mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  -webkit-mask-composite: xor;
  mask:
    linear-gradient(#000 0 0) content-box,
    linear-gradient(#000 0 0);
  mask-composite: exclude;
  padding: 14px;
}

.intro-video-shell {
  position: absolute;
  inset: 0;
  overflow: hidden;
}

.intro-video-shell::before,
.intro-video-shell::after {
  content: '';
  position: absolute;
  top: 0;
  bottom: 0;
  width: clamp(56px, 10vw, 132px);
  z-index: 1;
  pointer-events: none;
}

.intro-video-shell::before {
  left: 0;
  background: linear-gradient(90deg, rgba(248, 248, 248, 0.44) 0%, rgba(248, 248, 248, 0.16) 36%, rgba(248, 248, 248, 0) 100%);
}

.intro-video-shell::after {
  right: 0;
  background: linear-gradient(270deg, rgba(248, 248, 248, 0.44) 0%, rgba(248, 248, 248, 0.16) 36%, rgba(248, 248, 248, 0) 100%);
}

.intro-video {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.intro-video-fallback {
  position: absolute;
  inset: 0;
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  transform: scale(1.02);
  filter: saturate(1) brightness(1.01) contrast(1.02);
}

.intro-video-fallback::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at center, rgba(255, 255, 255, 0.05), transparent 52%),
    linear-gradient(90deg, rgba(248, 248, 248, 0.08), transparent 14%, transparent 86%, rgba(248, 248, 248, 0.08));
}

.intro-video-backdrop {
  transform: scale(1.16);
  filter: blur(14px) brightness(1.08) saturate(1.02);
}

.intro-video-main {
  transform: scale(1.01);
  filter: brightness(1.01) contrast(1.04) saturate(1.01);
  -webkit-mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%);
  mask-image: linear-gradient(90deg, transparent 0%, #000 10%, #000 90%, transparent 100%);
}

.intro-scrim {
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at top, rgba(255, 255, 255, 0.18), transparent 34%),
    radial-gradient(circle at center, rgba(255, 255, 255, 0.06), transparent 58%),
    linear-gradient(180deg, rgba(255, 255, 255, 0.03) 0%, rgba(245, 245, 245, 0.08) 36%, rgba(12, 12, 12, 0.18) 72%, rgba(8, 8, 8, 0.34) 100%);
}

.intro-scrim::after {
  content: '';
  position: absolute;
  inset: 0;
  background:
    linear-gradient(90deg, rgba(255, 255, 255, 0.08), transparent 12%, transparent 88%, rgba(255, 255, 255, 0.08)),
    linear-gradient(180deg, rgba(255, 255, 255, 0.06), transparent 14%, transparent 86%, rgba(255, 255, 255, 0.05));
  opacity: 0.42;
}

.intro-content {
  position: relative;
  z-index: 1;
  display: grid;
  justify-items: center;
  gap: 14px;
  width: min(92vw, 680px);
  padding: clamp(24px, 5vw, 44px);
  text-align: center;
  color: #fff;
}

.intro-eyebrow {
  margin: 0;
  font-size: 12px;
  font-weight: 700;
  letter-spacing: 0.28em;
  text-transform: uppercase;
}

.intro-content h1 {
  margin: 0;
  font-size: clamp(2.4rem, 7vw, 5.4rem);
  line-height: 1.02;
  letter-spacing: -0.04em;
}

.intro-content p {
  margin: 0;
  max-width: 520px;
  font-size: clamp(1rem, 2vw, 1.2rem);
  line-height: 1.7;
  color: rgba(255, 255, 255, 0.84);
}

.intro-skip-btn {
  position: absolute;
  right: clamp(18px, 3vw, 32px);
  bottom: clamp(18px, 3vw, 32px);
  z-index: 2;
  min-width: 84px;
  min-height: 40px;
  padding: 0 16px;
  border: 1px solid rgba(255, 255, 255, 0.42);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.12);
  color: rgba(255, 255, 255, 0.94);
  font-size: 14px;
  font-weight: 600;
  letter-spacing: 0.04em;
  cursor: pointer;
  backdrop-filter: blur(8px);
  transition: background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease;
}

.intro-skip-btn:hover {
  transform: translateY(-1px);
  background: rgba(255, 255, 255, 0.18);
  border-color: rgba(255, 255, 255, 0.64);
}

.intro-skip-btn:focus-visible {
  outline: none;
  box-shadow: 0 0 0 3px rgba(255, 255, 255, 0.2);
}

.intro-fade-enter-active,
.intro-fade-leave-active {
  transition: opacity 0.6s ease, visibility 0.6s ease;
}

.intro-fade-enter-from,
.intro-fade-leave-to {
  opacity: 0;
}

.topbar {
  position: sticky;
  top: 0;
  z-index: 8;
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 26px clamp(18px, 4vw, 56px);
  backdrop-filter: blur(8px);
  background: rgba(245, 245, 242, 0.72);
  border-bottom: 1px solid rgba(16, 16, 16, 0.08);
}

.brand {
  font-weight: 800;
  letter-spacing: 0.08em;
}

.desktop-nav {
  display: flex;
  gap: 20px;
  margin-left: auto;
  margin-right: 18px;
}

.desktop-nav a {
  text-decoration: none;
  color: #101010;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.nav-action-btn {
  border: 0;
  background: transparent;
  color: #101010;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  cursor: pointer;
  padding: 0;
}

.nav-action-btn:hover {
  opacity: 0.7;
}

.menu-toggle {
  display: none;
  width: 40px;
  height: 40px;
  border: 1px solid rgba(16, 16, 16, 0.14);
  border-radius: 10px;
  background: rgba(245, 245, 242, 0.85);
  align-items: center;
  justify-content: center;
  flex-direction: column;
  gap: 4px;
  cursor: pointer;
}

.menu-toggle span {
  width: 16px;
  height: 2px;
  background: #101010;
  border-radius: 999px;
}

.mobile-menu {
  display: none;
}

.mobile-nav-action-btn {
  border: 0;
  background: transparent;
  color: #101010;
  font-size: 14px;
  letter-spacing: 0.04em;
  text-transform: uppercase;
  text-align: left;
  cursor: pointer;
  padding: 0;
}

.lang-switch {
  display: inline-flex;
  gap: 6px;
  border: 1px solid rgba(16, 16, 16, 0.14);
  border-radius: 999px;
  padding: 4px;
}

.lang-switch button {
  border: 0;
  background: transparent;
  color: #101010;
  border-radius: 999px;
  padding: 6px 10px;
  font-size: 12px;
  cursor: pointer;
}

.lang-switch button.active {
  background: #101010;
  color: #f5f5f2;
}

.view-wrapper {
  padding: 0 clamp(18px, 4vw, 56px) 56px;
}

footer {
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  gap: 12px;
  height: 132px;
  box-sizing: border-box;
  border-top: 1px solid rgba(16, 16, 16, 0.2);
  padding: 10px clamp(18px, 4vw, 56px);
  text-align: center;
}

.footer-title h3 {
  margin: 0;
  font-size: clamp(1.1rem, 2.3vw, 1.45rem);
  letter-spacing: 0.03em;
  white-space: nowrap;
}

.footer-contact {
  display: grid;
  gap: 12px;
  justify-items: center;
  text-align: center;
}

.contact-item {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 8px;
  color: #101010;
  letter-spacing: 0.02em;
  white-space: nowrap;
}

.contact-item svg {
  font-size: 18px;
}

.contact-link {
  text-decoration: none;
  border-bottom: 1px solid rgba(16, 16, 16, 0.28);
  width: fit-content;
  padding-bottom: 2px;
}

.contact-link:hover {
  opacity: 0.78;
}

@media (max-width: 900px) {
  .intro-overlay::before {
    inset: 10px;
    border-radius: 20px;
    padding: 10px;
  }

  .intro-video-shell::before,
  .intro-video-shell::after {
    width: clamp(44px, 10vw, 92px);
  }

  .intro-content {
    gap: 12px;
    padding: 24px 20px 32px;
  }

  .desktop-nav,
  .desktop-lang-switch {
    display: none;
  }

  .menu-toggle {
    display: inline-flex;
    margin-left: auto;
  }

  .mobile-menu {
    position: absolute;
    top: calc(100% + 8px);
    right: clamp(18px, 4vw, 56px);
    left: clamp(18px, 4vw, 56px);
    display: grid;
    gap: 16px;
    padding: 16px;
    border: 1px solid rgba(16, 16, 16, 0.12);
    border-radius: 12px;
    background: rgba(245, 245, 242, 0.98);
    box-shadow: 0 12px 30px rgba(16, 16, 16, 0.12);
  }

  .mobile-nav {
    display: grid;
    gap: 12px;
  }

  .mobile-nav a {
    text-decoration: none;
    color: #101010;
    font-size: 14px;
    letter-spacing: 0.04em;
    text-transform: uppercase;
  }

  .mobile-lang-switch {
    width: fit-content;
  }
}

.mobile-menu-fade-enter-active,
.mobile-menu-fade-leave-active {
  transition: opacity 0.2s ease, transform 0.2s ease;
}

.mobile-menu-fade-enter-from,
.mobile-menu-fade-leave-to {
  opacity: 0;
  transform: translateY(-6px);
}
</style>
