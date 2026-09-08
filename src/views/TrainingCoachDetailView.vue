<template>
  <section class="coach-detail-page">
    <p v-if="loading" class="status">{{ $t('page.trainingCoachDetail.loading') }}</p>
    <p v-else-if="error" class="status status-error">{{ $t('page.trainingCoachDetail.error') }}</p>
    <p v-else-if="!coach" class="status status-error">{{ $t('page.trainingCoachDetail.empty') }}</p>

    <template v-else>
      <article class="hero-card">
        <div class="hero-media">
          <img :src="coach.avatar" :alt="coach.name" />
        </div>
        <div class="hero-content">
          <p class="kicker">{{ $t('page.trainingCoachDetail.kicker') }}</p>
          <h1>{{ coach.name }}</h1>
          <p class="intro">{{ localize(coach.intro) }}</p>
          <p class="email-line">
            <span>{{ $t('page.trainingCoachDetail.contactLabel') }}</span>
            <template v-if="coach.phone || coach.email">
              <a v-if="coach.phone" :href="`tel:${coach.phone}`">
                {{ $t('page.trainingCoachDetail.phoneLabel') }}: {{ coach.phone }}
              </a>
              <a v-if="coach.email" :href="`mailto:${coach.email}`">
                {{ $t('page.trainingCoachDetail.emailLabel') }}: {{ coach.email }}
              </a>
            </template>
            <span v-else>{{ $t('page.trainingCoachDetail.contactPending') }}</span>
          </p>
        </div>
      </article>

      <section class="field-panel">
        <article v-if="teachingInfoItems.length" class="field-card">
          <p class="field-title">{{ $t('page.trainingCoachDetail.teachingInfoTitle') }}</p>
          <dl class="field-list">
            <div v-for="item in teachingInfoItems" :key="item.label" class="field-row">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </article>

        <article v-if="contactInfoItems.length" class="field-card">
          <p class="field-title">{{ $t('page.trainingCoachDetail.contactInfoTitle') }}</p>
          <dl class="field-list">
            <div v-for="item in contactInfoItems" :key="item.label" class="field-row">
              <dt>{{ item.label }}</dt>
              <dd>{{ item.value }}</dd>
            </div>
          </dl>
        </article>
      </section>

      <div class="actions">
        <RouterLink class="ghost-btn" to="/training-feedback/coaches">
          {{ $t('page.trainingCoachDetail.backList') }}
        </RouterLink>
        <RouterLink class="ghost-btn" to="/">
          {{ $t('page.trainingCoachDetail.backHome') }}
        </RouterLink>
        <RouterLink class="ghost-btn" to="/messages">
          {{ $t('page.trainingCoachDetail.viewMessages') }}
        </RouterLink>
      </div>

      <section class="chat-panel">
        <p class="chat-title">{{ $t('page.trainingCoachDetail.privateMessageTitle') }}</p>
        <p v-if="!isAuthenticated" class="chat-tip">
          {{ $t('page.trainingCoachDetail.loginToMessage') }}
        </p>
        <template v-else>
          <div class="chat-history-head">
            <p class="chat-history-title">{{ $t('page.trainingCoachDetail.chatHistoryTitle') }}</p>
            <button type="button" class="ghost-btn mini" :disabled="chatLoading" @click="loadChatHistory">
              {{ chatLoading ? $t('page.trainingCoachDetail.chatLoading') : $t('page.trainingCoachDetail.refreshMessages') }}
            </button>
          </div>

          <p v-if="chatLoading" class="chat-tip">{{ $t('page.trainingCoachDetail.chatLoading') }}</p>
          <p v-else-if="chatError" class="chat-tip status-error">{{ $t('page.trainingCoachDetail.chatError') }}</p>
          <p v-else-if="!chatMessages.length" class="chat-tip">{{ $t('page.trainingCoachDetail.chatEmpty') }}</p>
          <div v-else class="chat-history-list">
            <template v-for="(record, index) in chatMessages" :key="record.id || `${record.createTime}-${index}`">
              <p v-if="shouldShowTimeDivider(record, chatMessages[index - 1])" class="chat-time-divider">
                {{ formatTime(record.createTime) }}
              </p>
              <div class="chat-row" :class="{ mine: isMine(record) }">
                <div class="chat-bubble-wrap">
                  <p class="chat-username">{{ resolveRecordUserName(record) }}</p>
                  <p class="chat-bubble">{{ record.content || '-' }}</p>
                </div>
              </div>
            </template>
          </div>

          <textarea
            v-model.trim="messageContent"
            class="chat-input"
            :placeholder="$t('page.trainingCoachDetail.privateMessagePlaceholder')"
            rows="4"
          />
          <button type="button" class="send-btn" :disabled="sendingMessage" @click="handleSendMessage">
            {{ sendingMessage ? $t('page.trainingCoachDetail.sendingMessage') : $t('page.trainingCoachDetail.sendMessage') }}
          </button>
        </template>
      </section>
    </template>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { fetchCoachById } from '../services/coachService'
import { getStoredAuthToken } from '../services/authService'
import { fetchAllChatMessages, sendChatMessage } from '../services/chatService'

const resolveCurrentUserId = () => {
  if (typeof window === 'undefined') return null
  const raw = window.localStorage.getItem('tennisLabAuth')
  if (!raw) return null
  try {
    const parsed = JSON.parse(raw)
    const user = parsed?.user || parsed?.data?.user || {}
    const candidateId = user?.id ?? user?.userId ?? user?.uid
    const idNumber = Number(candidateId)
    return Number.isFinite(idNumber) ? idNumber : null
  } catch {
    return null
  }
}

const toTimestamp = (value) => {
  const time = new Date(value).getTime()
  return Number.isFinite(time) ? time : 0
}

export default {
  name: 'TrainingCoachDetailView',
  components: {
    RouterLink
  },
  data() {
    return {
      coach: null,
      loading: false,
      error: false,
      messageContent: '',
      sendingMessage: false,
      isAuthenticated: false,
      currentUserId: null,
      chatLoading: false,
      chatError: false,
      chatMessages: []
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler(id) {
        this.loadCoach(id)
      }
    }
  },
  computed: {
    teachingInfoItems() {
      return this.filterFieldItems([
        { label: this.$t('page.trainingCoachDetail.certificationLabel'), value: this.coach?.certification },
        { label: this.$t('page.trainingCoachDetail.experienceYearsLabel'), value: this.formatExperienceYears(this.coach?.experienceYears) },
        { label: this.$t('page.trainingCoachDetail.specialtyLabel'), value: this.coach?.specialty },
        { label: this.$t('page.trainingCoachDetail.hourlyRateLabel'), value: this.formatMoney(this.coach?.hourlyRate) },
        { label: this.$t('page.trainingCoachDetail.ratingLabel'), value: this.formatRating(this.coach?.rating) },
        { label: this.$t('page.trainingCoachDetail.statusLabel'), value: this.formatCoachStatus(this.coach?.status) }
      ])
    },
    contactInfoItems() {
      return this.filterFieldItems([
        { label: this.$t('page.trainingCoachDetail.phoneLabel'), value: this.coach?.phone },
        { label: this.$t('page.trainingCoachDetail.emailLabel'), value: this.coach?.email },
        { label: this.$t('page.trainingCoachDetail.createTimeLabel'), value: this.formatDateTime(this.coach?.createTime) },
        { label: this.$t('page.trainingCoachDetail.updateTimeLabel'), value: this.formatDateTime(this.coach?.updateTime) }
      ])
    }
  },
  methods: {
    syncAuthStatus() {
      this.isAuthenticated = Boolean(getStoredAuthToken())
      this.currentUserId = resolveCurrentUserId()
    },
    localize(value) {
      if (!value || typeof value !== 'object') return ''
      return value[this.$i18n.locale] || value['zh-CN'] || ''
    },
    filterFieldItems(items) {
      return items
        .map((item) => ({ ...item, value: String(item.value ?? '').trim() }))
        .filter((item) => item.value)
    },
    formatExperienceYears(value) {
      const years = Number(value)
      if (!Number.isFinite(years) || years < 0) return ''
      return this.$i18n.locale === 'zh-CN' ? `${years} 年` : `${years} years`
    },
    formatMoney(value) {
      const amount = Number(value)
      if (!Number.isFinite(amount) || amount <= 0) return ''
      return this.$i18n.locale === 'zh-CN' ? `￥${amount.toFixed(2)}/小时` : `$${amount.toFixed(2)}/hour`
    },
    formatRating(value) {
      const score = Number(value)
      if (!Number.isFinite(score) || score <= 0) return ''
      return score.toFixed(2)
    },
    formatCoachStatus(value) {
      const normalized = Number(value)
      if (normalized === 1) return this.$t('page.trainingCoachDetail.statusEnabled')
      if (normalized === 0) return this.$t('page.trainingCoachDetail.statusDisabled')
      return ''
    },
    formatDateTime(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return String(value).trim()
      return date.toLocaleString(this.$i18n.locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    async loadCoach(id) {
      if (!id) return
      this.loading = true
      this.error = false
      this.coach = null
      try {
        this.coach = await fetchCoachById(id)
      } catch (error) {
        this.error = true
      } finally {
        this.loading = false
      }
      if (this.isAuthenticated) {
        this.loadChatHistory()
      }
    },
    async loadChatHistory() {
      if (!this.isAuthenticated || !this.coach?.userId || !this.currentUserId) {
        this.chatMessages = []
        return
      }
      this.chatLoading = true
      this.chatError = false
      try {
        const payload = await fetchAllChatMessages()
        const records = Array.isArray(payload?.records) ? payload.records : []
        const coachUserId = Number(this.coach.userId)
        const currentUserId = Number(this.currentUserId)
        this.chatMessages = records
          .filter((record) => {
            const senderId = Number(record.senderId)
            const receiverId = Number(record.receiverId)
            return (
              (senderId === currentUserId && receiverId === coachUserId) ||
              (senderId === coachUserId && receiverId === currentUserId)
            )
          })
          .sort((a, b) => {
            const delta = toTimestamp(a.createTime) - toTimestamp(b.createTime)
            if (delta !== 0) return delta
            return Number(a.id || 0) - Number(b.id || 0)
          })
      } catch (error) {
        this.chatError = true
      } finally {
        this.chatLoading = false
      }
    },
    async handleSendMessage() {
      if (this.sendingMessage || !this.coach) return
      if (!this.isAuthenticated) {
        ElMessage.warning(this.$t('page.trainingCoachDetail.loginToMessage'))
        return
      }
      const content = String(this.messageContent || '').trim()
      if (!content) {
        ElMessage.warning(this.$t('page.trainingCoachDetail.emptyMessageWarning'))
        return
      }
      const receiverIdNumber = Number(this.coach.userId)
      if (!Number.isFinite(receiverIdNumber) || receiverIdNumber <= 0) {
        ElMessage.error(this.$t('page.trainingCoachDetail.sendMessageError'))
        return
      }
      this.sendingMessage = true
      try {
        await sendChatMessage({
          receiverId: receiverIdNumber,
          content
        })
        ElMessage.success(this.$t('page.trainingCoachDetail.sendMessageSuccess'))
        this.messageContent = ''
        await this.loadChatHistory()
      } catch (error) {
        ElMessage.error(`${this.$t('page.trainingCoachDetail.sendMessageError')}：${error.message || ''}`)
      } finally {
        this.sendingMessage = false
      }
    },
    isMine(record) {
      return Number(record?.senderId) === Number(this.currentUserId)
    },
    resolveRecordUserName(record) {
      if (!record || typeof record !== 'object') return this.$t('page.trainingCoachDetail.defaultUserName')
      if (this.isMine(record)) {
        return String(record.senderUsername || this.$t('page.trainingCoachDetail.meLabel'))
      }
      return String(record.senderUsername || this.coach?.name || this.$t('page.trainingCoachDetail.defaultUserName'))
    },
    shouldShowTimeDivider(currentRecord, previousRecord) {
      if (!currentRecord) return false
      if (!previousRecord) return true
      const currentTime = toTimestamp(currentRecord.createTime)
      const previousTime = toTimestamp(previousRecord.createTime)
      return Math.abs(currentTime - previousTime) >= 5 * 60 * 1000
    },
    formatTime(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return String(value)
      return date.toLocaleString(this.$i18n.locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    }
  },
  mounted() {
    this.syncAuthStatus()
    window.addEventListener('storage', this.syncAuthStatus)
    window.addEventListener('tennislab-auth-changed', this.syncAuthStatus)
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.syncAuthStatus)
    window.removeEventListener('tennislab-auth-changed', this.syncAuthStatus)
  }
}
</script>

<style scoped>
.coach-detail-page {
  position: relative;
  isolation: isolate;
  margin: 24px auto 58px;
  width: min(100%, 1120px);
}

.coach-detail-page::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  background-image: url('../assets/coach-page-bg.jpg');
  background-size: cover;
  background-position: center 46%;
  filter: saturate(92%) contrast(95%);
}

.coach-detail-page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(247, 247, 244, 0.92) 0%, rgba(247, 247, 244, 0.68) 28%, rgba(247, 247, 244, 0.58) 70%, rgba(247, 247, 244, 0.9) 100%),
    linear-gradient(90deg, rgba(247, 247, 244, 0.22) 0%, rgba(247, 247, 244, 0) 18%, rgba(247, 247, 244, 0) 82%, rgba(247, 247, 244, 0.22) 100%);
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

.hero-card {
  display: grid;
  grid-template-columns: minmax(260px, 420px) 1fr;
  border-radius: 20px;
  border: 1px solid rgba(16, 16, 16, 0.14);
  background: rgba(248, 248, 246, 0.9);
  overflow: hidden;
  box-shadow:
    0 10px 24px rgba(16, 16, 16, 0.09),
    inset 0 1px 0 rgba(255, 255, 255, 0.62);
}

.hero-media {
  min-height: 380px;
}

.hero-media img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(10%);
}

.hero-content {
  padding: clamp(20px, 3vw, 32px);
}

.kicker {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  color: rgba(16, 16, 16, 0.6);
}

.hero-content h1 {
  margin-top: 8px;
  font-size: clamp(1.8rem, 4.5vw, 3rem);
  letter-spacing: -0.03em;
}

.intro {
  margin-top: 16px;
  line-height: 1.75;
  color: rgba(16, 16, 16, 0.74);
}

.email-line {
  margin-top: 18px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  color: rgba(16, 16, 16, 0.82);
}

.email-line span {
  font-weight: 600;
}

.email-line a {
  color: #2d5b9a;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.field-panel {
  margin-top: 14px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 10px;
}

.field-card {
  border-radius: 14px;
  border: 1px solid rgba(16, 16, 16, 0.12);
  background: rgba(248, 248, 246, 0.88);
  padding: 12px;
}

.field-title {
  font-weight: 700;
}

.field-list {
  margin-top: 8px;
}

.field-row {
  display: grid;
  grid-template-columns: 96px 1fr;
  gap: 8px;
}

.field-row + .field-row {
  margin-top: 8px;
}

.field-row dt {
  color: rgba(16, 16, 16, 0.56);
}

.field-row dd {
  margin: 0;
  color: rgba(16, 16, 16, 0.86);
  word-break: break-word;
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

.chat-panel {
  margin-top: 18px;
  height: min(70vh, 560px);
  display: flex;
  flex-direction: column;
  border-radius: 16px;
  border: 1px solid rgba(16, 16, 16, 0.12);
  background: rgba(248, 248, 246, 0.88);
  padding: 16px;
  box-shadow:
    0 8px 20px rgba(16, 16, 16, 0.06),
    inset 0 1px 0 rgba(255, 255, 255, 0.58);
}

.chat-title {
  font-weight: 700;
}

.chat-tip {
  margin-top: 8px;
  color: rgba(16, 16, 16, 0.6);
}

.chat-history-head {
  margin-top: 10px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.chat-history-title {
  font-weight: 600;
}

.ghost-btn.mini {
  min-height: 32px;
  border-radius: 999px;
  padding: 0 10px;
  border: 1px solid rgba(16, 16, 16, 0.18);
  background: rgba(255, 255, 255, 0.9);
  cursor: pointer;
  color: rgba(16, 16, 16, 0.82);
  font-weight: 600;
}

.chat-history-list {
  margin-top: 10px;
  flex: 1;
  min-height: 0;
  overflow-y: auto;
  padding: 12px;
  border-radius: 12px;
  border: 1px solid rgba(16, 16, 16, 0.1);
  background:
    linear-gradient(180deg, rgba(247, 247, 244, 0.92) 0%, rgba(242, 242, 238, 0.9) 100%);
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.62),
    0 2px 6px rgba(16, 16, 16, 0.04);
}

.chat-time-divider {
  margin: 8px auto 10px;
  width: fit-content;
  color: rgba(16, 16, 16, 0.52);
  font-size: 12px;
  background: rgba(255, 255, 255, 0.72);
  border-radius: 999px;
  padding: 2px 8px;
  border: 1px solid rgba(16, 16, 16, 0.08);
}

.chat-row {
  display: flex;
  margin-bottom: 10px;
}

.chat-row.mine {
  justify-content: flex-end;
}

.chat-bubble-wrap {
  max-width: min(76%, 560px);
}

.chat-username {
  margin-bottom: 4px;
  font-size: 12px;
  color: rgba(16, 16, 16, 0.54);
}

.chat-row.mine .chat-username {
  text-align: right;
}

.chat-bubble {
  border-radius: 10px;
  padding: 9px 11px;
  line-height: 1.6;
  background: rgba(255, 255, 255, 0.94);
  border: 1px solid rgba(16, 16, 16, 0.08);
  word-break: break-word;
  box-shadow: 0 2px 6px rgba(16, 16, 16, 0.05);
}

.chat-row.mine .chat-bubble {
  background: rgba(225, 236, 249, 0.96);
  border-color: rgba(45, 91, 154, 0.2);
}

.chat-input {
  margin-top: 10px;
  width: 100%;
  border-radius: 12px;
  border: 1px solid rgba(16, 16, 16, 0.16);
  background: rgba(255, 255, 255, 0.96);
  resize: none;
  height: 112px;
  padding: 10px;
  font: inherit;
  overflow-y: auto;
  box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.send-btn {
  margin-top: 10px;
  border: 0;
  border-radius: 999px;
  min-height: 38px;
  padding: 0 14px;
  background: #101010;
  color: #f5f5f2;
  font-weight: 600;
  cursor: pointer;
}

.send-btn:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

@media (max-width: 900px) {
  .hero-card {
    grid-template-columns: 1fr;
  }

  .hero-media {
    min-height: 280px;
  }
  .field-panel {
    grid-template-columns: 1fr;
  }

  .chat-panel {
    height: min(68vh, 500px);
  }
}
</style>
