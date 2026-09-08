<template>
  <section class="ai-courses">
    <div class="heading">
      <p>{{ $t('page.tennisAiCourses.kicker') }}</p>
      <h1>{{ $t('page.tennisAiCourses.title') }}</h1>
      <span>{{ $t('page.tennisAiCourses.lead') }}</span>
      <input
        v-model.trim="searchKeyword"
        class="search-input"
        type="text"
        :placeholder="$t('page.tennisAiCourses.searchPlaceholder')"
      />
    </div>

    <p v-if="loading" class="status">{{ $t('page.tennisAiCourses.loading') }}</p>
    <p v-else-if="error" class="status status-error">{{ $t('page.tennisAiCourses.error') }}</p>

    <div v-else class="course-grid">
      <article v-for="course in filteredCourses" :key="course.id" class="course-card">
        <img :src="course.cover" :alt="localize(course.title)" />
        <RouterLink :to="`/tennis-ai/courses/${course.slug}`" class="card-link" />
        <div class="meta">
          <p>{{ course.level }} / {{ course.durationMinutes }} min</p>
          <h2>{{ localize(course.title) }}</h2>
          <span>{{ localize(course.subtitle) }}</span>
        </div>
      </article>
    </div>
    <p v-if="!loading && !error && !filteredCourses.length" class="status">{{ $t('page.tennisAiCourses.empty') }}</p>

    <div class="bottom-actions">
      <RouterLink to="/" class="action-btn">{{ $t('page.tennisAiCourses.backHome') }}</RouterLink>
      <RouterLink to="/premium-courses" class="action-btn">{{ $t('page.tennisAiCourses.goPremiumCourses') }}</RouterLink>
      <RouterLink to="/external-courses" class="action-btn">{{ $t('page.tennisAiCourses.goExternalCourses') }}</RouterLink>
    </div>

  </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import { fetchTennisAiCourses } from '../services/tennisAiCourseService'

export default {
  name: 'TennisAiCoursesView',
  components: {
    RouterLink
  },
  data() {
    return {
      courses: [],
      searchKeyword: '',
      loading: false,
      error: false
    }
  },
  computed: {
    filteredCourses() {
      const keyword = this.searchKeyword.toLowerCase()
      if (!keyword) {
        return this.courses
      }
      return this.courses.filter((course) => {
        const title = this.localize(course.title).toLowerCase()
        const subtitle = this.localize(course.subtitle).toLowerCase()
        const level = String(course.level || '').toLowerCase()
        return title.includes(keyword) || subtitle.includes(keyword) || level.includes(keyword)
      })
    }
  },
  mounted() {
    this.loadCourses()
  },
  methods: {
    localize(value) {
      return value[this.$i18n.locale] || value['zh-CN']
    },
    async loadCourses() {
      this.loading = true
      this.error = false
      try {
        this.courses = await fetchTennisAiCourses()
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
.ai-courses {
  margin: 20px auto 0;
  max-width: 1120px;
  position: relative;
  isolation: isolate;
}

.ai-courses::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  background-image: url('../assets/homepage-footer-bg.jpg');
  background-size: cover;
  background-position: center 45%;
  filter: saturate(92%) contrast(96%);
}

.ai-courses::after {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -1;
  pointer-events: none;
  background:
    linear-gradient(180deg, rgba(247, 247, 244, 0.94) 0%, rgba(247, 247, 244, 0.62) 26%, rgba(247, 247, 244, 0.58) 74%, rgba(247, 247, 244, 0.9) 100%),
    linear-gradient(90deg, rgba(247, 247, 244, 0.2) 0%, rgba(247, 247, 244, 0) 18%, rgba(247, 247, 244, 0) 82%, rgba(247, 247, 244, 0.2) 100%);
}

.heading p {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  opacity: 0.76;
}

.heading h1 {
  margin-top: 10px;
  font-size: clamp(2rem, 4.6vw, 4rem);
  letter-spacing: -0.03em;
}

.heading span {
  display: block;
  margin-top: 12px;
  max-width: 760px;
  line-height: 1.7;
  color: rgba(16, 16, 16, 0.75);
}

.search-input {
  margin-top: 14px;
  width: min(560px, 100%);
  min-height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.18);
  background: rgba(255, 255, 255, 0.84);
  padding: 0 14px;
}

.status {
  margin-top: 24px;
  border-radius: 14px;
  padding: 12px 14px;
  background: rgba(16, 16, 16, 0.05);
  width: fit-content;
}

.status-error {
  background: rgba(184, 33, 33, 0.12);
}

.course-grid {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 16px;
}

.course-card {
  position: relative;
  overflow: hidden;
  min-height: 250px;
  border-radius: 20px;
  background: #101010;
  color: #f5f5f2;
  grid-column: span 1;
}

.course-card img {
  position: absolute;
  inset: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  filter: grayscale(22%);
  transition: transform 0.55s ease;
}

.course-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.14) 22%, rgba(0, 0, 0, 0.8) 100%);
}

.course-card:hover img {
  transform: scale(1.06);
}

.card-link {
  position: absolute;
  inset: 0;
  z-index: 2;
}

.meta {
  position: relative;
  z-index: 3;
  margin-top: 150px;
  padding: 18px 20px;
}

.meta p {
  font-size: 12px;
  letter-spacing: 0.09em;
  text-transform: uppercase;
  opacity: 0.84;
}

.meta h2 {
  margin-top: 8px;
  font-size: clamp(1.4rem, 2.6vw, 2rem);
  letter-spacing: -0.02em;
}

.meta span {
  display: block;
  margin-top: 8px;
  line-height: 1.5;
  opacity: 0.86;
}

.bottom-actions {
  margin-top: 22px;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  flex-wrap: wrap;
}

.action-btn {
  min-height: 40px;
  border-radius: 999px;
  padding: 0 14px;
  display: inline-flex;
  align-items: center;
  text-decoration: none;
  font-weight: 600;
  border: 1px solid rgba(16, 16, 16, 0.2);
  background: rgba(255, 255, 255, 0.78);
  color: rgba(16, 16, 16, 0.84);
  transition: opacity 0.2s ease;
}

.action-btn:hover {
  opacity: 0.78;
}

@media (max-width: 920px) {
  .course-grid {
    grid-template-columns: 1fr;
  }

  .course-card {
    grid-column: span 1;
  }
}
</style>

