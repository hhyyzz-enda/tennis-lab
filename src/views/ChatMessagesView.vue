<template>
  <section class="chat-page">
    <header class="hero">
      <h1>{{ $t('page.chatMessages.title') }}</h1>
      <p v-if="$t('page.chatMessages.lead')" class="lead">{{ $t('page.chatMessages.lead') }}</p>
    </header>

    <div class="actions">
      <button type="button" class="ghost-btn" :disabled="loading || !isAuthenticated" @click="loadAllData">
        {{ loading ? $t('page.chatMessages.loading') : $t('page.chatMessages.refresh') }}
      </button>
      <RouterLink class="ghost-btn" to="/">{{ $t('page.chatMessages.backHome') }}</RouterLink>
    </div>

    <p v-if="!isAuthenticated" class="status status-warn">
      {{ $t('page.chatMessages.loginRequired') }}
      <RouterLink class="inline-link" to="/auth">{{ $t('page.chatMessages.goLogin') }}</RouterLink>
    </p>
    <p v-else-if="loading" class="status">{{ $t('page.chatMessages.loading') }}</p>
    <p v-else-if="error" class="status status-error">{{ $t('page.chatMessages.error') }}</p>
    <p v-else-if="!contactList.length" class="status">{{ $t('page.chatMessages.empty') }}</p>

    <section v-else class="chat-layout">
      <aside class="chat-sidebar">
        <header class="sidebar-header">{{ $t('page.chatMessages.contactListTitle') }}</header>
        <ul class="contact-list">
          <li v-for="contact in contactList" :key="contact.contactId">
            <button
              type="button"
              class="contact-item"
              :class="{ active: Number(contact.contactId) === selectedContactId }"
              @click="openConversation(contact.contactId)"
            >
              <img v-if="contact.avatar" :src="contact.avatar" :alt="contact.name" class="contact-avatar" />
              <span v-else class="contact-avatar fallback">{{ contact.name.slice(0, 1) }}</span>
              <span class="contact-main">
                <span class="contact-top">
                  <span class="contact-name">{{ contact.name }}</span>
                  <span class="contact-time">{{ formatListTime(contact.lastTime) }}</span>
                </span>
                <span class="contact-bottom">
                  <span class="contact-preview">{{ contact.lastMessage || $t('page.chatMessages.noContent') }}</span>
                </span>
              </span>
            </button>
          </li>
        </ul>
      </aside>

      <main class="chat-main">
        <template v-if="currentContact">
          <header class="conversation-header">
            <p>{{ currentContact.name }}</p>
          </header>

          <div class="conversation-body">
            <template v-for="(record, index) in conversationMessages" :key="record.id || `${record.createTime}-${index}`">
              <p v-if="shouldShowTimeDivider(record, conversationMessages[index - 1])" class="time-divider">
                {{ formatConversationTime(record.createTime) }}
              </p>
              <div class="msg-row" :class="{ mine: isMine(record) }">
                <p class="msg-bubble">{{ record.content || '-' }}</p>
              </div>
            </template>
          </div>

          <footer class="conversation-input-wrap">
            <textarea
              v-model.trim="draftMessage"
              class="conversation-input"
              :placeholder="$t('page.chatMessages.inputPlaceholder')"
              rows="3"
            />
            <button type="button" class="send-btn" :disabled="sending" @click="handleSendCurrentMessage">
              {{ sending ? $t('page.chatMessages.sending') : $t('page.chatMessages.send') }}
            </button>
          </footer>
        </template>

        <div v-else class="empty-conversation">
          {{ $t('page.chatMessages.selectContact') }}
        </div>
      </main>
    </section>
  </section>
</template>

<script>
import { ElMessage } from 'element-plus'
import 'element-plus/es/components/message/style/css'
import { RouterLink } from 'vue-router'
import { fetchAllChatMessages, sendChatMessage } from '../services/chatService'
import { getStoredAuthToken, getUserInfo } from '../services/authService'
import { fetchCoaches } from '../services/coachService'

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

const normalizeMessages = (records) =>
  [...records].sort((a, b) => {
    const delta = toTimestamp(a.createTime) - toTimestamp(b.createTime)
    if (delta !== 0) return delta
    return Number(a.id || 0) - Number(b.id || 0)
  })

export default {
  name: 'ChatMessagesView',
  components: {
    RouterLink
  },
  data() {
    return {
      loading: false,
      error: false,
      sending: false,
      messages: [],
      isAuthenticated: false,
      currentUserId: null,
      currentUserName: '',
      coachDirectory: {},
      draftMessage: ''
    }
  },
  computed: {
    selectedContactId() {
      const routeId = Number(this.$route.params.contactId)
      return Number.isFinite(routeId) && routeId > 0 ? routeId : null
    },
    involvedMessages() {
      if (!this.currentUserId) return []
      return this.messages.filter((record) => {
        const senderId = Number(record.senderId)
        const receiverId = Number(record.receiverId)
        return senderId === this.currentUserId || receiverId === this.currentUserId
      })
    },
    contactList() {
      const grouped = new Map()
      for (const record of this.involvedMessages) {
        const contactId = this.resolveContactId(record)
        if (!contactId) continue
        if (!grouped.has(contactId)) {
          grouped.set(contactId, {
            contactId,
            lastMessage: '',
            lastTime: '',
            lastTimestamp: 0,
            possibleName: ''
          })
        }
        const contact = grouped.get(contactId)
        const timestamp = toTimestamp(record.createTime)
        if (timestamp >= contact.lastTimestamp) {
          contact.lastTimestamp = timestamp
          contact.lastMessage = String(record.content || '')
          contact.lastTime = record.createTime
        }
        if (!contact.possibleName) {
          contact.possibleName = this.resolveRecordUserName(record, contactId)
        }
      }
      return Array.from(grouped.values())
        .map((contact) => {
          const coach = this.coachDirectory[String(contact.contactId)] || null
          return {
            ...contact,
            name:
              contact.possibleName ||
              coach?.name ||
              (Number(contact.contactId) === Number(this.currentUserId) ? this.currentUserName : '') ||
              this.$t('page.chatMessages.defaultContactName'),
            avatar: coach?.avatar || ''
          }
        })
        .sort((a, b) => b.lastTimestamp - a.lastTimestamp)
    },
    currentContact() {
      if (!this.selectedContactId) return null
      return this.contactList.find((item) => Number(item.contactId) === this.selectedContactId) || null
    },
    conversationMessages() {
      if (!this.selectedContactId || !this.currentUserId) return []
      return this.involvedMessages.filter((record) => this.resolveContactId(record) === this.selectedContactId)
    }
  },
  watch: {
    contactList: {
      deep: true,
      handler() {
        this.ensureConversationRoute()
      }
    },
    '$route.params.contactId'() {
      this.ensureConversationRoute()
    }
  },
  mounted() {
    this.syncAuthStatus()
    window.addEventListener('storage', this.syncAuthStatus)
    window.addEventListener('tennislab-auth-changed', this.syncAuthStatus)
    if (this.isAuthenticated) {
      this.loadAllData()
    }
  },
  beforeUnmount() {
    window.removeEventListener('storage', this.syncAuthStatus)
    window.removeEventListener('tennislab-auth-changed', this.syncAuthStatus)
  },
  methods: {
    syncAuthStatus() {
      this.isAuthenticated = Boolean(getStoredAuthToken())
      this.currentUserId = resolveCurrentUserId()
    },
    resolveContactId(record) {
      const senderId = Number(record.senderId)
      const receiverId = Number(record.receiverId)
      if (senderId === this.currentUserId) return receiverId
      if (receiverId === this.currentUserId) return senderId
      return null
    },
    ensureConversationRoute() {
      if (!this.contactList.length) return
      if (this.selectedContactId && this.contactList.some((item) => Number(item.contactId) === this.selectedContactId)) {
        return
      }
      const firstContactId = this.contactList[0]?.contactId
      if (!firstContactId) return
      this.$router.replace(`/messages/${firstContactId}`)
    },
    openConversation(contactId) {
      this.$router.push(`/messages/${contactId}`)
    },
    async loadAllData() {
      if (!this.isAuthenticated) return
      this.loading = true
      this.error = false
      try {
        const [messagePayload, coaches, userProfile] = await Promise.all([
          fetchAllChatMessages(),
          fetchCoaches().catch(() => []),
          getUserInfo().catch(() => null)
        ])
        const records = Array.isArray(messagePayload?.records) ? messagePayload.records : []
        this.messages = normalizeMessages(records)
        this.currentUserName = this.resolveProfileName(userProfile)
        this.coachDirectory = (Array.isArray(coaches) ? coaches : []).reduce((acc, coach) => {
          if (coach?.userId) {
            acc[String(coach.userId)] = coach
          }
          return acc
        }, {})
      } catch (error) {
        this.error = true
      } finally {
        this.loading = false
      }
    },
    async handleSendCurrentMessage() {
      if (this.sending || !this.selectedContactId) return
      const content = String(this.draftMessage || '').trim()
      if (!content) {
        ElMessage.warning(this.$t('page.chatMessages.emptyMessageWarning'))
        return
      }
      this.sending = true
      try {
        await sendChatMessage({
          receiverId: this.selectedContactId,
          content
        })
        this.draftMessage = ''
        await this.loadAllData()
      } catch (error) {
        ElMessage.error(`${this.$t('page.chatMessages.sendError')}：${error.message || ''}`)
      } finally {
        this.sending = false
      }
    },
    isMine(record) {
      return Number(record.senderId) === this.currentUserId
    },
    resolveProfileName(userProfile) {
      if (!userProfile || typeof userProfile !== 'object') return ''
      return String(userProfile.username || userProfile.realName || userProfile.name || '').trim()
    },
    resolveRecordUserName(record, contactId) {
      if (!record || typeof record !== 'object') return ''
      const normalizedContactId = Number(contactId)
      const senderId = Number(record.senderId)
      const receiverId = Number(record.receiverId)
      if (senderId === normalizedContactId) {
        return String(record.senderName || record.senderUsername || record.senderNickname || '').trim()
      }
      if (receiverId === normalizedContactId) {
        return String(record.receiverName || record.receiverUsername || record.receiverNickname || '').trim()
      }
      return ''
    },
    shouldShowTimeDivider(currentRecord, previousRecord) {
      if (!currentRecord) return false
      if (!previousRecord) return true
      const currentTime = toTimestamp(currentRecord.createTime)
      const previousTime = toTimestamp(previousRecord.createTime)
      return Math.abs(currentTime - previousTime) >= 5 * 60 * 1000
    },
    formatListTime(value) {
      if (!value) return ''
      const date = new Date(value)
      if (Number.isNaN(date.getTime())) return ''
      return date.toLocaleString(this.$i18n.locale === 'zh-CN' ? 'zh-CN' : 'en-US', {
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit'
      })
    },
    formatConversationTime(value) {
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
  }
}
</script>

<style scoped>
.chat-page {
  position: relative;
  isolation: isolate;
  margin: 20px auto 64px;
  width: min(100%, 1120px);
  padding: 18px 16px 20px;
}

.chat-page::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  background-image:
    linear-gradient(rgba(245, 245, 242, 0.86), rgba(245, 245, 242, 0.92)),
    url('../assets/learning-resources-bg.jpg');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}

.hero h1 {
  margin-top: 10px;
  font-size: clamp(2rem, 4.2vw, 3rem);
  letter-spacing: -0.02em;
}

.lead {
  margin-top: 12px;
  max-width: 760px;
  line-height: 1.75;
  color: rgba(16, 16, 16, 0.66);
}

.actions {
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.chat-layout {
  margin-top: 18px;
  border-radius: 22px;
  border: 1px solid rgba(16, 16, 16, 0.12);
  background: #fff;
  overflow: hidden;
  display: grid;
  grid-template-columns: 320px minmax(0, 1fr);
  height: clamp(560px, 72vh, 700px);
  box-shadow:
    0 14px 34px rgba(16, 16, 16, 0.08),
    0 2px 8px rgba(16, 16, 16, 0.04);
}

.chat-sidebar {
  display: grid;
  grid-template-rows: 58px minmax(0, 1fr);
  min-height: 0;
  border-right: 1px solid rgba(16, 16, 16, 0.08);
  background: #f7f7f4;
}

.sidebar-header {
  min-height: 58px;
  display: flex;
  align-items: center;
  padding: 0 16px;
  font-weight: 700;
  letter-spacing: 0.02em;
  border-bottom: 1px solid rgba(16, 16, 16, 0.08);
}

.contact-list {
  list-style: none;
  margin: 0;
  padding: 0;
  min-height: 0;
  overflow-y: auto;
}

.contact-item {
  width: 100%;
  border: 0;
  border-bottom: 1px solid rgba(16, 16, 16, 0.06);
  background: transparent;
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 10px;
  align-items: center;
  padding: 11px 12px;
  text-align: left;
  cursor: pointer;
  transition: background-color 0.18s ease;
}

.contact-item:hover {
  background: rgba(16, 16, 16, 0.035);
}

.contact-item.active {
  background: rgba(16, 16, 16, 0.08);
}

.contact-avatar {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  background: #d9d9d9;
}

.contact-avatar.fallback {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 700;
  background: #8a8a8a;
}

.contact-main {
  min-width: 0;
}

.contact-top,
.contact-bottom {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.contact-name {
  font-weight: 600;
}

.contact-time,
.contact-preview {
  color: rgba(16, 16, 16, 0.56);
  font-size: 12px;
}

.contact-preview {
  max-width: 190px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.chat-main {
  display: grid;
  grid-template-rows: 56px minmax(0, 1fr) auto;
  min-width: 0;
}

.conversation-header {
  border-bottom: 1px solid rgba(16, 16, 16, 0.08);
  padding: 0 16px;
  display: flex;
  align-items: center;
  justify-content: flex-start;
  background: #fff;
}

.conversation-header p {
  font-weight: 700;
}

.conversation-body {
  background: #f4f4f1;
  padding: 16px;
  overflow-y: auto;
}

.time-divider {
  margin: 8px auto 12px;
  width: fit-content;
  color: rgba(16, 16, 16, 0.52);
  font-size: 12px;
}

.msg-row {
  display: flex;
  margin-bottom: 10px;
}

.msg-row.mine {
  justify-content: flex-end;
}

.msg-bubble {
  max-width: min(72%, 520px);
  border-radius: 14px;
  border: 1px solid rgba(16, 16, 16, 0.08);
  padding: 10px 12px;
  line-height: 1.6;
  background: #fff;
  color: #111;
  box-shadow: 0 2px 8px rgba(16, 16, 16, 0.06);
  word-break: break-word;
}

.msg-row.mine .msg-bubble {
  border-color: #101010;
  background: #101010;
  color: #f5f5f2;
}

.conversation-input-wrap {
  border-top: 1px solid rgba(16, 16, 16, 0.08);
  background: #fff;
  padding: 12px;
  display: grid;
  gap: 8px;
}

.conversation-input {
  border-radius: 12px;
  border: 1px solid rgba(16, 16, 16, 0.16);
  background: #fff;
  width: 100%;
  resize: none;
  height: 112px;
  padding: 10px;
  font: inherit;
  overflow-y: auto;
}

.send-btn {
  justify-self: end;
  min-width: 104px;
  min-height: 36px;
  border: 1px solid #101010;
  border-radius: 999px;
  background: #101010;
  color: #fff;
  cursor: pointer;
  font-weight: 600;
}

.send-btn:disabled {
  opacity: 0.58;
  cursor: not-allowed;
}

.empty-conversation {
  grid-row: 2 / 4;
  display: flex;
  align-items: center;
  justify-content: center;
  color: rgba(16, 16, 16, 0.56);
}

.status {
  margin-top: 18px;
  border-radius: 14px;
  padding: 12px 14px;
  width: fit-content;
  border: 1px solid rgba(16, 16, 16, 0.12);
  background: rgba(255, 255, 255, 0.9);
}

.status-error {
  background: rgba(189, 36, 36, 0.12);
}

.status-warn {
  background: rgba(184, 132, 12, 0.14);
}

.inline-link {
  margin-left: 8px;
  color: #101010;
}

.ghost-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.22);
  padding: 0 14px;
  text-decoration: none;
  color: #101010;
  background: #fff;
  font-weight: 600;
  cursor: pointer;
}

.ghost-btn:disabled {
  cursor: not-allowed;
  opacity: 0.5;
}

.ghost-btn:hover:not(:disabled) {
  opacity: 0.75;
}

@media (max-width: 960px) {
  .chat-page {
    padding: 14px 10px 14px;
  }

  .chat-layout {
    grid-template-columns: 1fr;
    height: auto;
  }

  .chat-sidebar {
    border-right: 0;
    border-bottom: 1px solid rgba(16, 16, 16, 0.08);
    max-height: 320px;
    overflow-y: auto;
  }

  .contact-preview {
    max-width: 220px;
  }
}
</style>
