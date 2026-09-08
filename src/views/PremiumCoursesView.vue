<template>
  <section class="premium-courses-page" :style="pageStyleVars">
    <header class="hero">
      <p class="kicker">{{ $t('page.premiumCourses.kicker') }}</p>
      <h1>{{ $t('page.premiumCourses.title') }}</h1>
    </header>

    <div v-if="typeLoading" class="status">{{ $t('page.premiumCourses.typeLoading') }}</div>
    <div v-else class="type-tabs">
      <button
        v-for="type in courseTypes"
        :key="type.code"
        type="button"
        :class="['type-btn', { active: activeType === type.code }]"
        @click="handleTypeChange(type.code)"
      >
        {{ localize(type.name) }}
      </button>
    </div>
    <form class="search-bar" @submit.prevent="handleSearch">
      <input
        v-model.trim="searchKeyword"
        @input="handleKeywordInput"
        type="search"
        class="search-input"
        :placeholder="$t('page.premiumCourses.searchPlaceholder')"
      />
      <button type="submit" class="search-btn" :disabled="loading">
        {{ $t('page.premiumCourses.searchAction') }}
      </button>
      <button
        v-if="appliedKeyword"
        type="button"
        class="search-reset"
        :disabled="loading"
        @click="clearSearch"
      >
        {{ $t('page.premiumCourses.clearSearch') }}
      </button>
    </form>

    <p v-if="loading" class="status">{{ $t('page.premiumCourses.loading') }}</p>
    <p v-else-if="error" class="status status-error">{{ $t('page.premiumCourses.error') }}</p>

    <div v-else-if="courses.length" class="video-list">
      <article v-for="course in pagedCourses" :key="course.id" class="video-item">
        <RouterLink class="cover-wrap" :to="`/premium-courses/${course.id}`">
          <img :src="course.cover" :alt="localize(course.title)" loading="lazy" />
        </RouterLink>
        <div class="video-meta">
          <RouterLink class="video-title" :to="`/premium-courses/${course.id}`">
            {{ localize(course.title) }}
          </RouterLink>
          <p class="video-intro">{{ localize(course.intro) }}</p>
          <p class="video-extra">
            <span>{{ $t('page.premiumCourses.teacher') }}: {{ course.teacher || '-' }}</span>
            <span>{{ $t('page.premiumCourses.publishedAt') }}: {{ course.publishedAt || '-' }}</span>
          </p>
          <div class="meta-action">
            <RouterLink class="detail-btn" :to="`/premium-courses/${course.id}`">
              {{ $t('page.premiumCourses.viewDetail') }}
            </RouterLink>
          </div>
        </div>
      </article>
    </div>

    <div v-if="courses.length && totalPages > 1" class="pager-wrap">
      <button
        type="button"
        class="pager-nav"
        :disabled="currentPage === 1"
        @click="prevPage"
      >
        {{ $t('page.premiumCourses.prevPage') }}
      </button>

      <div class="pager-numbers">
        <button
          v-for="item in pagerItems"
          :key="`page-${item}`"
          type="button"
          class="pager-num"
          :class="{ active: item === currentPage, ellipsis: typeof item !== 'number' }"
          :disabled="typeof item !== 'number'"
          @click="typeof item === 'number' && goToPage(item)"
        >
          <span>{{ typeof item === 'number' ? item : '…' }}</span>
        </button>
      </div>

      <button
        type="button"
        class="pager-nav"
        :disabled="currentPage === totalPages"
        @click="nextPage"
      >
        {{ $t('page.premiumCourses.nextPage') }}
      </button>
      <p class="pager-status">{{ $t('page.premiumCourses.pageStatus', { current: currentPage, total: totalPages }) }}</p>
    </div>

    <div v-else class="empty-state">
      <h3>{{ $t('page.premiumCourses.emptyTitle') }}</h3>
      <p>{{ $t('page.premiumCourses.emptyDesc') }}</p>
    </div>

    <div class="bottom-action">
      <RouterLink class="back-home" to="/">{{ $t('page.premiumCourses.backHome') }}</RouterLink>
      <RouterLink class="to-ai-courses" to="/tennis-ai/courses">
        {{ $t('page.premiumCourses.goAiCourses') }}
      </RouterLink>
      <RouterLink class="to-ai-courses" to="/external-courses">
        {{ $t('page.premiumCourses.goExternalCourses') }}
      </RouterLink>
    </div>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { fetchPremiumCourses, fetchPremiumCourseTypes } from '../services/premiumCourseService'
import basicCourseBg from '../assets/basic-course-bg.jpg'

export default {
  name: 'PremiumCoursesView',
  components: {
    RouterLink
  },
  data() {
    return {
      courseTypes: [],
      activeType: 'all',
      courses: [],
      searchKeyword: '',
      appliedKeyword: '',
      pageSize: 6,
      currentPage: 1,
      totalPages: 0,
      loading: false,
      typeLoading: false,
      error: false
    }
  },
  computed: {
    pageStyleVars() {
      return {
        '--premium-bg-image': `url('${basicCourseBg}')`
      }
    },
    pagedCourses() {
      return this.courses
    },
    pagerItems() {
      const total = this.totalPages
      const current = this.currentPage
      if (total <= 7) {
        return Array.from({ length: total }, (_, index) => index + 1)
      }

      const items = [1]
      const start = Math.max(2, current - 1)
      const end = Math.min(total - 1, current + 1)

      if (start > 2) {
        items.push('left')
      }
      for (let page = start; page <= end; page += 1) {
        items.push(page)
      }
      if (end < total - 1) {
        items.push('right')
      }

      items.push(total)
      return items
    }
  },
  mounted() {
    this.initPage()
  },
  methods: {
    localize(value) {
      if (!value || typeof value !== 'object') return ''
      return value[this.$i18n.locale] || value['zh-CN'] || ''
    },
    async initPage() {
      this.typeLoading = true
      this.error = false
      try {
        const types = await fetchPremiumCourseTypes()
        this.courseTypes = (types.length
          ? types
          : [{ code: 'all', name: { 'zh-CN': '全部课程', 'en-US': 'All Courses' } }]
        ).filter((item) => item.code !== 'all')
        if (!this.courseTypes.some((item) => item.code === this.activeType)) {
          this.activeType = this.courseTypes[0]?.code || 'all'
        }
      } catch (error) {
        this.error = true
      } finally {
        this.typeLoading = false
      }

      if (!this.error) {
        await this.loadCourses()
      }
    },
    async loadCourses() {
      await this.loadCoursesByPage(1)
    },
    async loadCoursesByPage(page) {
      this.loading = true
      this.error = false
      try {
        const response = await fetchPremiumCourses({
          type: this.activeType,
          page,
          size: this.pageSize,
          keyword: this.appliedKeyword
        })
        this.courses = Array.isArray(response?.records) ? response.records : []
        this.currentPage = Number(response?.current || page || 1)
        this.totalPages = Number(response?.pages || 0)
      } catch (error) {
        this.error = true
      } finally {
        this.loading = false
      }
    },
    async handleTypeChange(typeCode) {
      if (this.activeType === typeCode || this.loading) {
        return
      }
      this.activeType = typeCode
      await this.loadCoursesByPage(1)
    },
    async handleSearch() {
      if (this.loading) return
      const keyword = this.searchKeyword.trim()
      this.appliedKeyword = keyword
      await this.loadCoursesByPage(1)
    },
    async handleKeywordInput() {
      if (this.loading) return
      if (this.searchKeyword.trim()) return
      if (!this.appliedKeyword) return
      this.appliedKeyword = ''
      await this.loadCoursesByPage(1)
    },
    async clearSearch() {
      if (this.loading) return
      this.searchKeyword = ''
      this.appliedKeyword = ''
      await this.loadCoursesByPage(1)
    },
    async goToPage(page) {
      if (!Number.isInteger(page)) return
      if (page < 1 || page > this.totalPages) return
      if (this.loading || page === this.currentPage) return
      await this.loadCoursesByPage(page)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    async prevPage() {
      if (this.currentPage <= 1) return
      await this.goToPage(this.currentPage - 1)
    },
    async nextPage() {
      if (this.currentPage >= this.totalPages) return
      await this.goToPage(this.currentPage + 1)
    }
  }
}
</script>

<style scoped>
.premium-courses-page {
  position: relative;
  isolation: isolate;
  margin: 22px auto 60px;
  width: min(100%, 1120px);
}

.premium-courses-page::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  background-image: var(--premium-bg-image);
  background-size: cover;
  background-position: center 45%;
  filter: saturate(92%) contrast(96%);
}

.premium-courses-page::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(247, 247, 244, 0.94) 0%, rgba(247, 247, 244, 0.62) 26%, rgba(247, 247, 244, 0.58) 74%, rgba(247, 247, 244, 0.9) 100%),
    linear-gradient(90deg, rgba(247, 247, 244, 0.2) 0%, rgba(247, 247, 244, 0) 18%, rgba(247, 247, 244, 0) 82%, rgba(247, 247, 244, 0.2) 100%);
}

.hero .kicker {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  color: rgba(16, 16, 16, 0.62);
}

.hero h1 {
  margin-top: 8px;
  font-size: clamp(2rem, 4.4vw, 3.6rem);
  letter-spacing: -0.03em;
}

.hero .lead {
  margin-top: 12px;
  max-width: 860px;
  line-height: 1.72;
  color: rgba(16, 16, 16, 0.72);
}

.back-home,
.to-ai-courses {
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

.back-home:hover,
.to-ai-courses:hover {
  opacity: 0.75;
}

.bottom-action {
  margin-top: 24px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.type-tabs {
  margin-top: 24px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.search-bar {
  margin-top: 14px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  align-items: center;
}

.search-input {
  flex: 1;
  min-width: 220px;
  min-height: 38px;
  border: 1px solid rgba(16, 16, 16, 0.2);
  border-radius: 999px;
  padding: 0 14px;
  background: rgba(255, 255, 255, 0.9);
  color: rgba(16, 16, 16, 0.9);
}

.search-btn,
.search-reset {
  min-height: 38px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.18);
  background: #ffffff;
  color: rgba(16, 16, 16, 0.86);
  padding: 0 14px;
  cursor: pointer;
  font-weight: 600;
}

.search-btn:disabled,
.search-reset:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.search-btn:hover:not(:disabled),
.search-reset:hover:not(:disabled) {
  opacity: 0.75;
}

.type-btn {
  border: 1px solid rgba(16, 16, 16, 0.16);
  background: #ffffff;
  border-radius: 999px;
  min-height: 38px;
  padding: 0 14px;
  color: rgba(16, 16, 16, 0.78);
  cursor: pointer;
  transition: all 0.2s ease;
}

.type-btn:hover {
  border-color: rgba(16, 16, 16, 0.28);
}

.type-btn.active {
  background: #101010;
  color: #f7f7f4;
  border-color: #101010;
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

.video-list {
  margin-top: 22px;
  display: grid;
  gap: 14px;
}

.video-item {
  display: grid;
  grid-template-columns: minmax(230px, 300px) 1fr;
  gap: 14px;
  height: 206px;
  border: 1px solid rgba(16, 16, 16, 0.16);
  border-radius: 16px;
  background: rgba(248, 248, 246, 0.86);
  backdrop-filter: blur(4px);
  box-shadow:
    0 8px 20px rgba(16, 16, 16, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  overflow: hidden;
}

.cover-wrap {
  position: relative;
  display: block;
  min-height: 170px;
}

.cover-wrap img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  filter: grayscale(16%);
  transition: transform 0.5s ease;
}

.video-item:hover .cover-wrap img {
  transform: scale(1.05);
}

.video-meta {
  padding: 14px 14px 12px 0;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  min-width: 0;
}

.video-title {
  color: #101010;
  text-decoration: none;
  font-size: clamp(1.08rem, 2vw, 1.3rem);
  font-weight: 700;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-title:hover {
  color: #2d5b9a;
}

.video-intro {
  margin-top: 8px;
  color: rgba(16, 16, 16, 0.72);
  line-height: 1.64;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.video-extra {
  margin-top: 10px;
  display: flex;
  gap: 16px;
  flex-wrap: wrap;
  color: rgba(16, 16, 16, 0.6);
  font-size: 13px;
}

.meta-action {
  margin-top: auto;
  padding-top: 10px;
}

.detail-btn {
  display: inline-flex;
  align-items: center;
  min-height: 34px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.2);
  background: rgba(255, 255, 255, 0.84);
  color: rgba(16, 16, 16, 0.86);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  padding: 0 12px;
}

.detail-btn:hover {
  opacity: 0.74;
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

.pager-wrap {
  margin-top: 18px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  flex-wrap: wrap;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(16, 16, 16, 0.12);
  background: linear-gradient(145deg, rgba(255, 255, 255, 0.86) 0%, rgba(245, 248, 255, 0.88) 100%);
  box-shadow:
    0 8px 20px rgba(16, 16, 16, 0.07),
    inset 0 1px 0 rgba(255, 255, 255, 0.72);
}

.pager-nav {
  border: 1px solid rgba(16, 16, 16, 0.16);
  background: rgba(255, 255, 255, 0.92);
  color: rgba(16, 16, 16, 0.82);
  min-height: 34px;
  border-radius: 999px;
  padding: 0 12px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.2s ease;
}

.pager-nav:hover:not(:disabled) {
  border-color: rgba(16, 16, 16, 0.3);
  transform: translateY(-1px);
}

.pager-nav:disabled {
  opacity: 0.45;
  cursor: not-allowed;
}

.pager-numbers {
  display: flex;
  gap: 8px;
}

.pager-num {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(16, 16, 16, 0.14);
  background: rgba(255, 255, 255, 0.92);
  color: rgba(16, 16, 16, 0.78);
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
}

.pager-num:hover:not(:disabled) {
  border-color: rgba(16, 16, 16, 0.3);
  transform: translateY(-1px);
}

.pager-num.active {
  border-color: #101010;
  background: #101010;
  color: #f7f7f4;
  box-shadow: 0 6px 16px rgba(16, 16, 16, 0.22);
}

.pager-num.ellipsis {
  border-style: dashed;
  cursor: default;
}

.pager-status {
  width: 100%;
  text-align: center;
  color: rgba(16, 16, 16, 0.62);
  font-size: 13px;
}

@media (max-width: 860px) {
  .video-item {
    grid-template-columns: 1fr;
  }

  .cover-wrap {
    min-height: 200px;
  }

  .video-meta {
    padding: 0 14px 14px;
  }

  .pager-status {
    width: 100%;
  }
}
</style>
