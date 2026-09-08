<template>
  <section class="my-courses-page">
    <header class="hero">
      <p class="kicker">{{ $t('page.myTennis.myCourses.tag') }}</p>
      <h1>{{ $t('page.myTennis.myCourses.title') }}</h1>
      <p class="lead">{{ $t('page.myTennis.myCourses.desc') }}</p>
    </header>

    <p v-if="loading" class="status">{{ $t('page.myTennisCourses.loading') }}</p>
    <p v-else-if="error" class="status status-error">{{ $t('page.myTennisCourses.error') }}</p>

    <div v-else-if="courses.length" class="course-list">
      <article
        v-for="course in courses"
        :key="course.id"
        class="course-card"
        role="button"
        tabindex="0"
        @click="goToDetail(course.id)"
        @keydown.enter.prevent="goToDetail(course.id)"
        @keydown.space.prevent="goToDetail(course.id)"
      >
        <img :src="course.cover" :alt="localize(course.title)" loading="lazy" />
        <div class="course-meta">
          <h3>{{ localize(course.title) }}</h3>
          <p>{{ localize(course.intro) }}</p>
          <span>{{ course.level }} / {{ course.durationMinutes || 0 }} min</span>
        </div>
      </article>
    </div>

    <div v-else class="status">{{ $t('page.myTennisCourses.empty') }}</div>

    <div v-if="totalPages > 1" class="pager">
      <button type="button" class="pager-btn" :disabled="currentPage <= 1 || loading" @click="loadAddedCourses(currentPage - 1)">
        {{ $t('page.premiumCourses.prevPage') }}
      </button>
      <span>{{ $t('page.premiumCourses.pageStatus', { current: currentPage, total: totalPages }) }}</span>
      <button type="button" class="pager-btn" :disabled="currentPage >= totalPages || loading" @click="loadAddedCourses(currentPage + 1)">
        {{ $t('page.premiumCourses.nextPage') }}
      </button>
    </div>

    <div class="actions">
      <RouterLink to="/my-tennis" class="ghost-btn">{{ $t('page.myTennisCourses.backMyTennis') }}</RouterLink>
      <RouterLink to="/premium-courses" class="ghost-btn">{{ $t('page.myTennisCourses.goAddCourses') }}</RouterLink>
    </div>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { fetchAddedPremiumCourses } from '../services/premiumCourseService'

export default {
  name: 'MyTennisCoursesView',
  components: {
    RouterLink
  },
  data() {
    return {
      courses: [],
      currentPage: 1,
      totalPages: 0,
      pageSize: 10,
      loading: false,
      error: false
    }
  },
  mounted() {
    this.loadAddedCourses(1)
  },
  methods: {
    localize(value) {
      if (!value || typeof value !== 'object') return ''
      return value[this.$i18n.locale] || value['zh-CN'] || ''
    },
    async loadAddedCourses(page) {
      this.loading = true
      this.error = false
      try {
        const payload = await fetchAddedPremiumCourses({
          page,
          size: this.pageSize
        })
        this.courses = Array.isArray(payload?.records) ? payload.records : []
        this.currentPage = Number(payload?.current || page || 1)
        this.totalPages = Number(payload?.pages || 0)
      } catch (error) {
        this.error = true
      } finally {
        this.loading = false
      }
    },
    goToDetail(id) {
      if (!id) return
      this.$router.push(`/premium-courses/${id}`)
    }
  }
}
</script>

<style scoped>
.my-courses-page {
  margin: 22px auto 58px;
  width: min(100%, 1120px);
}

.hero .kicker {
  text-transform: uppercase;
  font-size: 12px;
  letter-spacing: 0.1em;
}

.hero h1 {
  margin-top: 8px;
  font-size: clamp(2rem, 4vw, 3.2rem);
}

.hero .lead {
  margin-top: 10px;
  max-width: 860px;
  color: rgba(16, 16, 16, 0.72);
}

.status {
  margin-top: 18px;
  border-radius: 12px;
  padding: 12px 14px;
  width: fit-content;
  background: rgba(16, 16, 16, 0.06);
}

.status-error {
  background: rgba(189, 36, 36, 0.12);
}

.course-list {
  margin-top: 20px;
  display: grid;
  gap: 14px;
}

.course-card {
  display: grid;
  grid-template-columns: minmax(220px, 280px) 1fr;
  border: 1px solid rgba(16, 16, 16, 0.14);
  border-radius: 16px;
  background: rgba(248, 248, 246, 0.92);
  overflow: hidden;
  cursor: pointer;
}

.course-card img {
  width: 100%;
  height: 100%;
  min-height: 190px;
  object-fit: cover;
}

.course-meta {
  padding: 16px;
}

.course-meta h3 {
  font-size: 1.2rem;
  line-height: 1.4;
}

.course-meta p {
  margin-top: 8px;
  line-height: 1.65;
  color: rgba(16, 16, 16, 0.72);
}

.course-meta span {
  margin-top: 12px;
  display: inline-block;
  color: rgba(16, 16, 16, 0.6);
  font-size: 13px;
}

.pager {
  margin-top: 16px;
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
}

.pager-btn {
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.18);
  background: #fff;
  padding: 0 12px;
  cursor: pointer;
}

.pager-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.actions {
  margin-top: 20px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
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

@media (max-width: 860px) {
  .course-card {
    grid-template-columns: 1fr;
  }
}
</style>
