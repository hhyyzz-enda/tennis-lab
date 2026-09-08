<template>
  <section class="developing-letter-page">
    <p class="kicker">{{ $t('page.developingLetter.kicker') }}</p>
    <h1>
      {{ $t('page.developingLetter.titleLine1') }}
      <span>{{ $t('page.developingLetter.titleLine2') }}</span>
    </h1>
    <p class="lead">{{ $t('page.developingLetter.lead') }}</p>

    <RouterLink class="back-home" to="/">
      {{ $t('page.developingLetter.backHome') }}
    </RouterLink>

    <transition name="letter-fade">
      <div v-if="showLetter" class="letter-mask" @click.self="closeLetter">
        <article class="letter-panel" role="dialog" aria-modal="true" :aria-label="$t('page.developingLetter.dialogTitle')">
          <header class="letter-header">
            <p>{{ $t('page.developingLetter.letter.from') }}</p>
            <button type="button" class="close-btn" :aria-label="$t('page.developingLetter.close')" @click="closeLetter">
              ×
            </button>
          </header>

          <h2>{{ $t('page.developingLetter.dialogTitle') }}</h2>
          <p class="letter-content" aria-live="polite">
            {{ typedMessage }}<span v-if="isTyping" class="typing-caret" aria-hidden="true"></span>
          </p>
          <p v-if="!isTyping" class="letter-contact">
            {{ $t('page.developingLetter.letter.contactPrefix') }}
            <a href="mailto:hhyyzz4121@163.com">hhyyzz4121@163.com</a>
          </p>
          <p v-if="!isTyping" class="signature">{{ $t('page.developingLetter.letter.signature') }}</p>
        </article>
      </div>
    </transition>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'

export default {
  name: 'DevelopingLetterView',
  components: {
    RouterLink
  },
  data() {
    return {
      showLetter: true,
      typedLength: 0,
      typingTimer: null
    }
  },
  computed: {
    fullMessage() {
      return String(this.$t('page.developingLetter.letter.message') || '')
    },
    typedMessage() {
      return this.fullMessage.slice(0, this.typedLength)
    },
    isTyping() {
      return this.typedLength < this.fullMessage.length
    }
  },
  mounted() {
    this.startTypewriter()
  },
  beforeUnmount() {
    this.clearTypingTimer()
  },
  methods: {
    clearTypingTimer() {
      if (this.typingTimer) {
        clearInterval(this.typingTimer)
        this.typingTimer = null
      }
    },
    startTypewriter() {
      this.clearTypingTimer()
      this.typedLength = 0
      // Match the paper unfold motion before text starts.
      setTimeout(() => {
        this.typingTimer = setInterval(() => {
          if (this.typedLength >= this.fullMessage.length) {
            this.clearTypingTimer()
            return
          }
          this.typedLength += 1
        }, 20)
      }, 520)
    },
    closeLetter() {
      this.clearTypingTimer()
      this.showLetter = false
    }
  }
}
</script>

<style scoped>
.developing-letter-page {
  position: relative;
  isolation: isolate;
  margin: 24px auto 0;
  max-width: 1120px;
  min-height: calc(100vh - 170px);
  padding: 18px clamp(14px, 2.2vw, 24px) 24px;
}

.developing-letter-page::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  background:
    linear-gradient(160deg, rgba(245, 245, 242, 0.32) 0%, rgba(245, 245, 242, 0.2) 45%, rgba(16, 16, 16, 0.34) 100%),
    url('../assets/letter.jpg') center / cover no-repeat;
  filter: grayscale(12%) contrast(98%);
  pointer-events: none;
}

.developing-letter-page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  background: radial-gradient(circle at 86% 18%, rgba(16, 16, 16, 0.22), transparent 44%);
  pointer-events: none;
}

.developing-letter-page > * {
  position: relative;
  z-index: 1;
}

.kicker {
  font-size: 12px;
  letter-spacing: 0.12em;
  text-transform: uppercase;
  color: rgba(16, 16, 16, 0.62);
}

h1 {
  margin-top: 14px;
  font-size: clamp(2.2rem, 7vw, 5.2rem);
  line-height: 1.06;
  text-transform: uppercase;
  letter-spacing: -0.03em;
}

h1 span {
  display: inline-block;
  margin-left: clamp(12px, 2.4vw, 26px);
  background: #101010;
  color: #f5f5f2;
  padding: 0 12px;
}

.lead {
  margin-top: 16px;
  max-width: 760px;
  line-height: 1.7;
  color: rgba(16, 16, 16, 0.78);
}

.back-home {
  margin-top: 20px;
  display: inline-flex;
  min-height: 42px;
  align-items: center;
  justify-content: center;
  border-radius: 999px;
  border: 1px solid #101010;
  padding: 0 18px;
  text-decoration: none;
  color: #101010;
  transition: background-color 0.2s ease, color 0.2s ease, transform 0.2s ease;
}

.back-home:hover {
  background: #101010;
  color: #f5f5f2;
  transform: translateY(-2px);
}

.letter-mask {
  position: fixed;
  inset: 0;
  z-index: 24;
  background: rgba(16, 16, 16, 0.65);
  backdrop-filter: blur(3px);
  display: grid;
  place-items: center;
  padding: 20px;
}

.letter-panel {
  width: min(92vw, 760px);
  border-radius: 18px;
  border: 1px solid rgba(255, 255, 255, 0.24);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.94) 0%, rgba(242, 242, 242, 0.9) 100%);
  box-shadow: 0 22px 38px rgba(0, 0, 0, 0.28);
  padding: clamp(18px, 2.8vw, 30px);
  transform-origin: top center;
  animation: paperUnfold 0.7s cubic-bezier(0.22, 0.74, 0.26, 1);
}

.letter-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.letter-header p {
  font-size: 12px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  color: rgba(16, 16, 16, 0.58);
}

.close-btn {
  width: 34px;
  height: 34px;
  border: 1px solid rgba(16, 16, 16, 0.2);
  border-radius: 999px;
  background: rgba(255, 255, 255, 0.72);
  color: #101010;
  font-size: 24px;
  line-height: 1;
  cursor: pointer;
}

.letter-panel h2 {
  margin-top: 10px;
  font-size: clamp(1.5rem, 3.4vw, 2.3rem);
  letter-spacing: -0.02em;
}

.letter-content,
.letter-contact {
  margin-top: 14px;
  line-height: 1.8;
  font-size: clamp(1.02rem, 1.45vw, 1.16rem);
  color: rgba(16, 16, 16, 0.82);
}

.letter-content {
  white-space: pre-line;
  min-height: 7.6em;
}

.typing-caret {
  display: inline-block;
  width: 1px;
  height: 1em;
  background: #101010;
  margin-left: 2px;
  vertical-align: -2px;
  animation: caretBlink 0.9s steps(1, end) infinite;
}

.letter-contact a {
  color: #101010;
  font-weight: 700;
  text-decoration-thickness: 2px;
}

.signature {
  margin-top: 18px;
  font-weight: 700;
  color: #101010;
}

.letter-fade-enter-active,
.letter-fade-leave-active {
  transition: opacity 0.2s ease;
}

.letter-fade-enter-from,
.letter-fade-leave-to {
  opacity: 0;
}

@keyframes paperUnfold {
  0% {
    opacity: 0;
    transform: perspective(1000px) rotateX(-68deg) scale(0.95);
    filter: blur(1px);
  }
  60% {
    opacity: 1;
    transform: perspective(1000px) rotateX(10deg) scale(1.01);
    filter: blur(0);
  }
  100% {
    opacity: 1;
    transform: perspective(1000px) rotateX(0) scale(1);
  }
}

@keyframes caretBlink {
  0%,
  49% {
    opacity: 1;
  }
  50%,
  100% {
    opacity: 0;
  }
}

@media (max-width: 900px) {
  .developing-letter-page {
    isolation: auto;
  }

  .letter-mask {
    z-index: 40;
    padding: max(16px, env(safe-area-inset-top)) 16px 16px;
  }
}

@media (max-width: 720px) {
  h1 span {
    display: block;
    width: fit-content;
    margin: 6px 0 0;
  }
}
</style>
