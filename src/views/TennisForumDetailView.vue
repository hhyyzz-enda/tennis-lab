<template>
  <section class="forum-detail-page">
    <p v-if="loading" class="status">{{ $t('page.tennisForumDetail.loading') }}</p>
    <p v-else-if="error" class="status status-error">{{ $t('page.tennisForumDetail.error') }}</p>

    <article v-else-if="post" class="detail-card">
      <div class="detail-head">
        <p class="meta">{{ formatDate(post.createTime) }}</p>
      </div>
      <h1>{{ post.title }}</h1>
      <p class="content">{{ post.content }}</p>

      <div v-if="post.tags.length" class="tag-row">
        <span v-for="tag in post.tags" :key="`${post.id}-${tag}`" class="tag">#{{ tag }}</span>
      </div>

      <p class="stat-row">
        <span>{{ $t('page.tennisForum.stats.view') }} {{ post.viewCount }}</span>
        <span>{{ $t('page.tennisForum.stats.like') }} {{ post.likeCount }}</span>
        <span>{{ $t('page.tennisForum.stats.comment') }} {{ post.commentCount }}</span>
      </p>
    </article>

    <section v-else class="empty-state">
      <h3>{{ $t('page.tennisForumDetail.emptyTitle') }}</h3>
      <p>{{ $t('page.tennisForumDetail.emptyDesc') }}</p>
    </section>

    <div class="bottom-action">
      <RouterLink class="action-btn" to="/tennis-forum">{{ $t('page.tennisForumDetail.backForum') }}</RouterLink>
      <RouterLink class="action-btn" to="/">{{ $t('page.tennisForum.backHome') }}</RouterLink>
    </div>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { fetchForumPostById } from '../services/postService'

export default {
  name: 'TennisForumDetailView',
  components: {
    RouterLink
  },
  data() {
    return {
      loading: false,
      error: false,
      post: null
    }
  },
  watch: {
    '$route.params.id': {
      immediate: true,
      handler() {
        this.loadDetail()
      }
    }
  },
  methods: {
    formatDate(value) {
      if (!value) return '--'
      const normalized = String(value).replace('T', ' ')
      const timePart = normalized.split('.')[0]
      return timePart || '--'
    },
    async loadDetail() {
      this.loading = true
      this.error = false
      this.post = null
      try {
        this.post = await fetchForumPostById(this.$route.params.id)
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
.forum-detail-page {
  width: min(100%, 980px);
  margin: 24px auto 60px;
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

.detail-card {
  border: 1px solid rgba(16, 16, 16, 0.14);
  border-radius: 18px;
  background: rgba(248, 248, 246, 0.9);
  padding: clamp(16px, 3vw, 24px);
  box-shadow:
    0 10px 28px rgba(16, 16, 16, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.65);
}

.detail-head {
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.meta {
  color: rgba(16, 16, 16, 0.58);
  font-size: 13px;
}

.detail-card h1 {
  margin-top: 10px;
  font-size: clamp(1.6rem, 3.5vw, 2.3rem);
  line-height: 1.35;
  letter-spacing: -0.02em;
}

.content {
  margin-top: 16px;
  font-size: clamp(1.02rem, 1.35vw, 1.16rem);
  line-height: 1.84;
  color: rgba(16, 16, 16, 0.82);
  white-space: pre-wrap;
}

.tag-row {
  margin-top: 14px;
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

.stat-row {
  margin-top: 16px;
  display: flex;
  gap: 14px;
  flex-wrap: wrap;
  color: rgba(16, 16, 16, 0.62);
  font-size: 13px;
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
  margin-top: 18px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
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

.action-btn:hover {
  opacity: 0.75;
}

@media (max-width: 900px) {
  .forum-detail-page {
    margin: 16px auto 44px;
  }

  .status {
    width: 100%;
  }
}

@media (max-width: 600px) {
  .detail-card {
    border-radius: 14px;
    padding: 14px 12px;
  }

  .detail-card h1 {
    margin-top: 8px;
    font-size: clamp(1.28rem, 7vw, 1.72rem);
    line-height: 1.32;
  }

  .content {
    margin-top: 12px;
    font-size: 14px;
    line-height: 1.68;
  }

  .stat-row {
    gap: 8px 10px;
    font-size: 12px;
  }

  .bottom-action {
    flex-direction: column;
    align-items: stretch;
  }

  .action-btn {
    width: 100%;
    justify-content: center;
  }
}
</style>
