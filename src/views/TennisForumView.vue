<template>
  <section class="forum-page">
    <header class="hero">
      <p class="kicker">{{ $t('page.tennisForum.kicker') }}</p>
      <h1>{{ $t('page.tennisForum.title') }}</h1>
      <p class="lead">{{ $t('page.tennisForum.lead') }}</p>
    </header>

    <div class="publish-entry">
      <button type="button" class="toggle-publish-btn" @click="togglePublishPanel">
        {{ showPublishPanel ? $t('page.tennisForum.hidePublishPanel') : $t('page.tennisForum.showPublishPanel') }}
      </button>
    </div>

    <section v-if="showPublishPanel" class="publish-panel">
      <h2>{{ $t('page.tennisForum.publishTitle') }}</h2>
      <p class="publish-hint">{{ $t('page.tennisForum.publishHint') }}</p>
      <form class="publish-form" @submit.prevent="handlePublish">
        <label class="field">
          <span>{{ $t('page.tennisForum.fields.title') }}</span>
          <input v-model.trim="form.title" type="text" :placeholder="$t('page.tennisForum.placeholders.title')" maxlength="80" />
        </label>
        <label class="field">
          <span>{{ $t('page.tennisForum.fields.tags') }}</span>
          <input v-model.trim="form.tags" type="text" :placeholder="$t('page.tennisForum.placeholders.tags')" maxlength="60" />
        </label>
        <label class="field">
          <span>{{ $t('page.tennisForum.fields.content') }}</span>
          <textarea
            v-model.trim="form.content"
            :placeholder="$t('page.tennisForum.placeholders.content')"
            rows="4"
            maxlength="2000"
          />
        </label>
        <div class="publish-actions">
          <button type="submit" class="submit-btn" :disabled="isPublishing">
            {{ isPublishing ? $t('page.tennisForum.publishing') : $t('page.tennisForum.publishAction') }}
          </button>
        </div>
      </form>
    </section>

    <p v-if="loading" class="status">{{ $t('page.tennisForum.loading') }}</p>
    <p v-else-if="error" class="status status-error">{{ $t('page.tennisForum.error') }}</p>

    <section v-else-if="posts.length" class="post-list">
      <article
        v-for="post in posts"
        :key="post.id"
        class="post-card post-card-clickable"
        role="button"
        tabindex="0"
        @click="openPostDetail(post.id)"
        @keydown.enter.prevent="openPostDetail(post.id)"
        @keydown.space.prevent="openPostDetail(post.id)"
      >
        <div class="post-head">
          <p class="meta">{{ formatDate(post.createTime) }}</p>
        </div>
        <h3>{{ post.title }}</h3>
        <p class="content-preview">{{ getPostPreview(post.content) }}</p>

        <div v-if="post.tags.length" class="tag-row">
          <span v-for="tag in post.tags" :key="`${post.id}-${tag}`" class="tag">#{{ tag }}</span>
        </div>

        <p class="open-tip">{{ $t('page.tennisForum.openDetail') }}</p>
      </article>
    </section>

    <section v-else class="empty-state">
      <h3>{{ $t('page.tennisForum.emptyTitle') }}</h3>
      <p>{{ $t('page.tennisForum.emptyDesc') }}</p>
    </section>

    <div class="bottom-action">
      <RouterLink class="back-home" to="/">{{ $t('page.tennisForum.backHome') }}</RouterLink>
    </div>
  </section>
</template>

<script>
import { ElMessage } from 'element-plus'
import { RouterLink } from 'vue-router'
import { fetchForumPosts, publishForumPost } from '../services/postService'

export default {
  name: 'TennisForumView',
  components: {
    RouterLink
  },
  data() {
    return {
      loading: false,
      error: false,
      posts: [],
      isPublishing: false,
      showPublishPanel: false,
      form: {
        title: '',
        content: '',
        tags: ''
      }
    }
  },
  mounted() {
    this.loadPosts()
  },
  methods: {
    formatDate(value) {
      if (!value) return '--'
      const normalized = String(value).replace('T', ' ')
      const timePart = normalized.split('.')[0]
      return timePart || '--'
    },
    validatePublishForm() {
      if (!this.form.title) {
        ElMessage.warning(this.$t('page.tennisForum.validation.titleRequired'))
        return false
      }
      if (!this.form.content) {
        ElMessage.warning(this.$t('page.tennisForum.validation.contentRequired'))
        return false
      }
      if (!this.form.tags) {
        ElMessage.warning(this.$t('page.tennisForum.validation.tagsRequired'))
        return false
      }
      return true
    },
    getPostPreview(content, maxLength = 120) {
      const normalized = String(content || '').replace(/\s+/g, ' ').trim()
      if (!normalized) return ''
      if (normalized.length <= maxLength) return normalized
      return `${normalized.slice(0, maxLength)}...`
    },
    resetForm() {
      this.form = {
        title: '',
        content: '',
        tags: ''
      }
    },
    async loadPosts() {
      this.loading = true
      this.error = false
      try {
        this.posts = await fetchForumPosts()
      } catch (error) {
        this.error = true
      } finally {
        this.loading = false
      }
    },
    async handlePublish() {
      if (this.isPublishing || !this.validatePublishForm()) return
      this.isPublishing = true
      try {
        await publishForumPost({
          title: this.form.title,
          content: this.form.content,
          tags: this.form.tags
        })
        this.resetForm()
        this.showPublishPanel = false
        ElMessage.success(this.$t('page.tennisForum.publishSuccess'))
        await this.loadPosts()
      } catch (error) {
        const message = String(error?.message || '')
        if (/Internal Server Error/i.test(message)) {
          ElMessage.error(this.$t('page.tennisForum.publishUnavailable'))
        } else {
          ElMessage.error(`${this.$t('page.tennisForum.publishError')}：${message || this.$t('page.tennisForum.requestFailed')}`)
        }
      } finally {
        this.isPublishing = false
      }
    },
    togglePublishPanel() {
      this.showPublishPanel = !this.showPublishPanel
    },
    openPostDetail(id) {
      this.$router.push(`/tennis-forum/${encodeURIComponent(String(id || ''))}`)
    }
  }
}
</script>

<style scoped>
.forum-page {
  position: relative;
  isolation: isolate;
  width: min(100%, 1080px);
  margin: 22px auto 60px;
}

.forum-page::before {
  content: '';
  position: fixed;
  inset: 0;
  background-image: url('../assets/tennis-open.jpg');
  background-size: cover;
  background-position: center;
  background-attachment: fixed;
  opacity: 0.34;
  z-index: -2;
  pointer-events: none;
}

.forum-page::after {
  content: '';
  position: fixed;
  inset: 0;
  background: rgba(128, 128, 128, 0.18);
  z-index: -1;
  pointer-events: none;
}

.hero .kicker {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  color: rgba(16, 16, 16, 0.62);
}

.hero h1 {
  margin-top: 8px;
  font-size: clamp(2rem, 4.2vw, 3.3rem);
  letter-spacing: -0.03em;
}

.hero .lead {
  margin-top: 12px;
  max-width: 900px;
  line-height: 1.72;
  color: rgba(16, 16, 16, 0.72);
}

.publish-entry {
  margin-top: 20px;
}

.toggle-publish-btn {
  min-height: 40px;
  border: 1px solid #101010;
  border-radius: 999px;
  padding: 0 16px;
  background: #101010;
  color: #f7f7f4;
  font-weight: 600;
  cursor: pointer;
}

.toggle-publish-btn:hover {
  opacity: 0.85;
}

.publish-panel {
  margin-top: 22px;
  border-radius: 16px;
  border: 1px solid rgba(16, 16, 16, 0.14);
  background: rgba(255, 255, 255, 0.82);
  padding: 16px;
}

.publish-panel h2 {
  font-size: clamp(1.1rem, 2.2vw, 1.5rem);
}

.publish-hint {
  margin-top: 6px;
  color: rgba(16, 16, 16, 0.62);
  line-height: 1.55;
}

.publish-form {
  margin-top: 14px;
  display: grid;
  gap: 12px;
}

.field {
  display: grid;
  gap: 6px;
}

.field span {
  font-size: 13px;
  color: rgba(16, 16, 16, 0.78);
}

.field input,
.field textarea {
  width: 100%;
  border: 1px solid rgba(16, 16, 16, 0.2);
  border-radius: 10px;
  background: rgba(255, 255, 255, 0.96);
  color: #101010;
  padding: 10px 12px;
  font: inherit;
}

.field textarea {
  resize: vertical;
  min-height: 120px;
}

.field input:focus,
.field textarea:focus {
  outline: none;
  border-color: rgba(45, 91, 154, 0.7);
  box-shadow: 0 0 0 3px rgba(45, 91, 154, 0.15);
}

.publish-actions {
  display: flex;
  justify-content: flex-end;
}

.submit-btn {
  min-height: 38px;
  border: 1px solid #101010;
  border-radius: 999px;
  padding: 0 16px;
  background: #101010;
  color: #f7f7f4;
  font-weight: 600;
  cursor: pointer;
}

.submit-btn:hover:not(:disabled) {
  opacity: 0.85;
}

.submit-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
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

.post-list {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.post-card {
  border: 1px solid rgba(16, 16, 16, 0.14);
  border-radius: 16px;
  background: rgba(248, 248, 246, 0.84);
  padding: 14px;
}

.post-card-clickable {
  cursor: pointer;
  transition: transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease;
}

.post-card-clickable:hover,
.post-card-clickable:focus-visible {
  transform: translateY(-2px);
  border-color: rgba(16, 16, 16, 0.24);
  box-shadow: 0 12px 26px rgba(16, 16, 16, 0.1);
}

.post-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta {
  color: rgba(16, 16, 16, 0.58);
  font-size: 13px;
}

.post-card h3 {
  margin-top: 8px;
  font-size: clamp(1.12rem, 2.1vw, 1.5rem);
}

.content-preview {
  margin-top: 8px;
  line-height: 1.68;
  color: rgba(16, 16, 16, 0.8);
  display: -webkit-box;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 3;
  overflow: hidden;
}

.tag-row {
  margin-top: 10px;
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag {
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.18);
  padding: 2px 10px;
  font-size: 12px;
}

.open-tip {
  margin-top: 8px;
  color: rgba(45, 91, 154, 0.9);
  font-size: 12px;
  font-weight: 600;
}

.empty-state {
  margin-top: 20px;
  border-radius: 14px;
  border: 1px solid rgba(16, 16, 16, 0.14);
  background: rgba(255, 255, 255, 0.78);
  padding: 20px 16px;
}

.empty-state p {
  margin-top: 8px;
  color: rgba(16, 16, 16, 0.68);
}

.bottom-action {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.back-home {
  display: inline-flex;
  align-items: center;
  min-height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.2);
  background: rgba(255, 255, 255, 0.7);
  color: rgba(16, 16, 16, 0.85);
  padding: 0 14px;
  text-decoration: none;
  font-weight: 600;
}

.back-home:hover {
  opacity: 0.75;
}

@media (max-width: 900px) {
  .forum-page {
    margin: 14px auto 44px;
  }

  .forum-page::before {
    background-attachment: scroll;
  }

  .hero .lead {
    line-height: 1.62;
  }

  .publish-panel {
    margin-top: 16px;
    padding: 14px;
  }

  .publish-actions {
    justify-content: flex-start;
  }

  .submit-btn,
  .toggle-publish-btn {
    min-height: 42px;
  }

  .status {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .hero h1 {
    font-size: clamp(1.52rem, 8vw, 2.05rem);
  }

  .hero .lead {
    font-size: 14px;
  }

  .publish-panel {
    border-radius: 14px;
  }

  .post-card {
    border-radius: 14px;
    padding: 12px;
  }

  .post-card h3 {
    margin-top: 6px;
    font-size: clamp(1rem, 5.5vw, 1.22rem);
  }

  .content-preview {
    margin-top: 6px;
    line-height: 1.6;
    font-size: 14px;
  }

  .publish-actions,
  .bottom-action {
    flex-direction: column;
    align-items: stretch;
  }

  .submit-btn,
  .back-home {
    width: 100%;
    justify-content: center;
  }
}
</style>
