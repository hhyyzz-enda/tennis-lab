<template>
  <section class="external-courses-page" :style="pageStyleVars">
    <header class="hero">
      <p class="kicker">{{ $t('page.externalCourses.kicker') }}</p>
      <h1>{{ $t('page.externalCourses.title') }}</h1>
      <p class="quality-tip">
        {{ $t('page.externalCourses.qualityTipPart1') }}
        <strong class="quality-tip-highlight">{{ $t('page.externalCourses.qualityTipHighlight') }}</strong>
        {{ $t('page.externalCourses.qualityTipPart2') }}
      </p>
      <p class="lead">{{ $t('page.externalCourses.lead') }}</p>
      <div class="hero-actions">
        <input
          v-model.trim="searchKeyword"
          class="search-input"
          type="text"
          :placeholder="$t('page.externalCourses.searchPlaceholder')"
        />
      </div>
    </header>

    <div class="category-tabs">
      <button
        v-for="category in categories"
        :key="category.code"
        type="button"
        :class="['tab-btn', { active: activeCategory === category.code }]"
        @click="activeCategory = category.code"
      >
        {{ localize(category.label) }}
      </button>
    </div>

    <template v-if="filteredCourses.length">
      <div class="course-grid">
        <article v-for="course in pagedCourses" :key="course.id" class="course-card">
          <a
            class="cover-wrap"
            :href="course.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            <img :src="course.cover" :alt="localize(course.title)" loading="lazy" />
          </a>
          <div class="card-head">
            <p class="platform">{{ localize(course.platform) }}</p>
            <span class="tag">{{ localize(course.level) }}</span>
          </div>
          <h2>{{ localize(course.title) }}</h2>
          <p class="desc">{{ localize(course.desc) }}</p>
          <p class="adv-label">{{ $t('page.externalCourses.uniqueAdvantage') }}</p>
          <p class="adv-text">{{ localize(course.advantage) }}</p>
          <a
            class="open-btn"
            :href="course.url"
            target="_blank"
            rel="noopener noreferrer"
          >
            {{ $t('page.externalCourses.openLink') }}
          </a>
        </article>
      </div>
      <div class="list-footer">
        <RouterLink class="back-home" to="/">{{ $t('page.externalCourses.backHome') }}</RouterLink>
        <div v-if="totalPages > 1" class="pagination">
          <button type="button" class="page-btn" :disabled="currentPage === 1" @click="goPrevPage">
            {{ $t('page.externalCourses.prevPage') }}
          </button>
          <button
            v-for="page in totalPages"
            :key="page"
            type="button"
            :class="['page-btn', { active: page === currentPage }]"
            @click="goPage(page)"
          >
            {{ page }}
          </button>
          <button type="button" class="page-btn" :disabled="currentPage === totalPages" @click="goNextPage">
            {{ $t('page.externalCourses.nextPage') }}
          </button>
        </div>
      </div>
    </template>
    <div v-else class="empty-state">
      <h3>{{ $t('page.externalCourses.emptyTitle') }}</h3>
      <p>{{ $t('page.externalCourses.emptyDesc') }}</p>
    </div>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import externalCourseBg from '../assets/external-courses-bg.jpg'

const I18N = (zh, en) => ({ 'zh-CN': zh, 'en-US': en })

const EXTERNAL_COURSES = [
  {
    id: 'bili-serve-beginner',
    category: 'beginner',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('零基础网球发球教程', 'Beginner Tennis Serve Tutorial'),
    desc: I18N('从握拍、抛球到完整发球动作，适合零基础快速建立流程。', 'A step-by-step serve lesson from grip and toss to full motion.'),
    advantage: I18N('完整发球流程拆解，零基础也能快速上手。', 'Complete serve workflow breakdown ideal for true beginners.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('入门', 'Beginner'),
    cover: '/external-covers/BV15eQFBDEN6.jpg',
    url: 'https://www.bilibili.com/video/BV15eQFBDEN6/'
  },
  {
    id: 'bili-home-serve-drills',
    category: 'serve',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('7个居家发球专项动作', '7 At-home Serve Drills'),
    desc: I18N('不依赖球场的发球专项训练，适合发球节奏和动力链打底。', 'At-home serve drill set for rhythm and kinetic-chain foundations.'),
    advantage: I18N('无需场地器械，居家即可高频打基础。', 'No-court setup lets you build serve fundamentals at home.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('入门到进阶', 'Beginner to intermediate'),
    cover: '/external-covers/BV1YKAGzmE88.jpg',
    url: 'https://www.bilibili.com/video/BV1YKAGzmE88/'
  },
  {
    id: 'bili-toss-advanced',
    category: 'serve',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('网球发球进阶：抛球手要点', 'Serve Progression: Tossing Hand Details'),
    desc: I18N('聚焦发球抛球稳定性与手部路径，适合发球专项纠错。', 'Focuses on toss consistency and tossing-arm mechanics.'),
    advantage: I18N('专攻抛球稳定性，直接提升发球成功率。', 'Directly improves serve consistency via toss control.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('进阶', 'Intermediate'),
    cover: '/external-covers/BV1qyXzBgEdL.jpg',
    url: 'https://www.bilibili.com/video/BV1qyXzBgEdL/'
  },
  {
    id: 'bili-toss-fundamental',
    category: 'serve',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('如何正确抛球？', 'How to Toss Correctly'),
    desc: I18N('发球抛球细节课，适合解决“抛球不稳导致发球失误”的问题。', 'A dedicated toss lesson to improve serve consistency.'),
    advantage: I18N('动作要点短平快，适合赛前快速校正。', 'Concise key points for quick pre-match adjustment.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('入门', 'Beginner'),
    cover: '/external-covers/BV1zPwyzLEkm.jpg',
    url: 'https://www.bilibili.com/video/BV1zPwyzLEkm/'
  },
  {
    id: 'bili-wall-course',
    category: 'beginner',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('初学者网球墙课程：正手/反手/截击', 'Wall Training for Beginners: FH/BH/Volley'),
    desc: I18N('对墙训练入门课，覆盖正反手与截击，适合球感和稳定性提升。', 'Beginner wall-drill lesson for forehand, backhand, and volley stability.'),
    advantage: I18N('一课覆盖正反手与截击，训练效率高。', 'Covers FH/BH/volley in one lesson with high training efficiency.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('入门到进阶', 'Beginner to intermediate'),
    cover: '/external-covers/BV19mDpBjE6x.jpg',
    url: 'https://www.bilibili.com/video/BV19mDpBjE6x/'
  },
  {
    id: 'bili-self-study-advanced',
    category: 'improve',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('从零开始网球自习：比赛应用与下旋正手', 'Self-study Series: Match Use & Forehand Slice'),
    desc: I18N('偏进阶的动作与实战结合课，适合有基础后的持续提升。', 'A more advanced lesson connecting stroke detail to match situations.'),
    advantage: I18N('技术与实战结合，适合从会打到会赢。', 'Bridges technique with match application for real gains.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('中高级', 'Intermediate to advanced'),
    cover: '/external-covers/BV1rddeBMEQi.jpg',
    url: 'https://www.bilibili.com/video/BV1rddeBMEQi/'
  },
  {
    id: 'bili-topspin-serve-detail',
    category: 'serve',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('最详细的上旋发球教学', 'Detailed Topspin Serve Tutorial'),
    desc: I18N('拆解上旋二发细节与常见错误，适合系统补强发球稳定性。', 'Breaks down topspin-serve details and common mistakes.'),
    advantage: I18N('上旋二发讲解细致，容错率提升明显。', 'Detailed topspin second-serve guidance with better margin.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('进阶', 'Intermediate'),
    cover: '/external-covers/BV1XYDZBCEtT.jpg',
    url: 'https://www.bilibili.com/video/BV1XYDZBCEtT/'
  },
  {
    id: 'bili-yotc-acceleration',
    category: 'improve',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('提升挥拍加速度与爆发力', 'Increase Swing Speed And Power'),
    desc: I18N('针对挥拍速度和击球爆发力的训练课，适合中级提升。', 'Targets swing acceleration and explosive shot production.'),
    advantage: I18N('针对爆发力提升，适合突破击球上限。', 'Power-focused session to break your shot-speed ceiling.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('中级', 'Intermediate'),
    cover: '/external-covers/BV1ASoKBYE19.jpg',
    url: 'https://www.bilibili.com/video/BV1ASoKBYE19/'
  },
  {
    id: 'bili-serve-volley-footwork',
    category: 'serve',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('发球上网步法纠错课', 'Serve-and-Volley Footwork Fix'),
    desc: I18N('聚焦发球上网的第一步与衔接节奏，适合双打玩家。', 'Focuses on first-step timing for serve-and-volley transitions.'),
    advantage: I18N('发球上网衔接清晰，双打价值很高。', 'Excellent for doubles with clear serve-volley transitions.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('中级', 'Intermediate'),
    cover: '/external-covers/BV1eidLBuEpT.jpg',
    url: 'https://www.bilibili.com/video/BV1eidLBuEpT/'
  },
  {
    id: 'bili-consistency-secret',
    category: 'improve',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('击球稳定感的秘密', 'Secret Of Shot Consistency'),
    desc: I18N('讲解稳定击球的关键点与练习思路，适合实战前复盘。', 'Explains key consistency principles before match practice.'),
    advantage: I18N('稳定性逻辑清楚，实战失误率更低。', 'Clear consistency framework that reduces match errors.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('中级', 'Intermediate'),
    cover: '/external-covers/BV1v2o8BQENL.jpg',
    url: 'https://www.bilibili.com/video/BV1v2o8BQENL/'
  },
  {
    id: 'bili-home-medicine-ball',
    category: 'beginner',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('居家实心球正手蹬转', 'Home Medicine-Ball Forehand Drive'),
    desc: I18N('借助实心球强化正手发力链，适合居家基础训练。', 'Home drill to improve forehand kinetic-chain drive.'),
    advantage: I18N('体能与技术结合，提升发力链传导效率。', 'Blends strength and technique to improve kinetic-chain transfer.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('入门到进阶', 'Beginner to intermediate'),
    cover: '/external-covers/BV1xsXjBREHw.jpg',
    url: 'https://www.bilibili.com/video/BV1xsXjBREHw/'
  },
  {
    id: 'bili-mental-match-course',
    category: 'improve',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('比赛心态与对抗思路', 'Match Mindset And Decision Making'),
    desc: I18N('聚焦对抗心理和临场决策，适合有一定球龄后的升级。', 'Covers mindset and point construction in real matches.'),
    advantage: I18N('补齐比赛思维短板，关键分更稳。', 'Strengthens match IQ and pressure-point decisions.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('中高级', 'Intermediate to advanced'),
    cover: '/external-covers/BV116DkBXEBd.jpg',
    url: 'https://www.bilibili.com/video/BV116DkBXEBd/'
  },
  {
    id: 'bili-serve-swing-path',
    category: 'serve',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('发球挥拍轨迹纠正课', 'Serve Swing-Path Correction'),
    desc: I18N('专讲发球挥拍路径与节奏，改善发球命中和球速。', 'Fixes serve swing path for better contact and pace.'),
    advantage: I18N('挥拍路径可视化强，修正动作更直接。', 'Visual swing-path corrections make technique fixes faster.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('中级', 'Intermediate'),
    cover: '/external-covers/BV18mQwBSEjp.jpg',
    url: 'https://www.bilibili.com/video/BV18mQwBSEjp/'
  },
  {
    id: 'bili-forehand-misconception',
    category: 'beginner',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('网球认知误区：别盲目拉拍', 'Forehand Misconception Fix'),
    desc: I18N('纠正新手常见正手认知误区，帮助快速建立正确动作。', 'Corrects common forehand misconceptions for beginners.'),
    advantage: I18N('先纠错再进阶，避免反复走弯路。', 'Fixes misconceptions early to avoid bad habit loops.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('入门', 'Beginner'),
    cover: '/external-covers/BV1rHdSB2Epf.jpg',
    url: 'https://www.bilibili.com/video/BV1rHdSB2Epf/'
  },
  {
    id: 'bili-rally-unlock',
    category: 'beginner',
    platform: I18N('B站', 'Bilibili'),
    title: I18N('3个练习快速解锁对拉', '3 Drills To Unlock Rallying'),
    desc: I18N('通过三个简单练习提升连续对拉能力，适合新手上手。', 'Three practical drills to build rally consistency quickly.'),
    advantage: I18N('练习结构清晰，短时间就能看到进步。', 'Structured drills deliver visible progress in a short cycle.'),
    type: I18N('单视频', 'Single video'),
    level: I18N('入门', 'Beginner'),
    cover: '/external-covers/BV1v8dVBvEMR.jpg',
    url: 'https://www.bilibili.com/video/BV1v8dVBvEMR/'
  }
]

export default {
  name: 'ExternalCoursesView',
  components: {
    RouterLink
  },
  data() {
    return {
      searchKeyword: '',
      activeCategory: 'all',
      currentPage: 1,
      pageSize: 6,
      courses: EXTERNAL_COURSES
    }
  },
  computed: {
    categories() {
      return [
        { code: 'all', label: I18N('全部课程', 'All') },
        { code: 'beginner', label: I18N('入门基础', 'Beginner') },
        { code: 'serve', label: I18N('发球专项', 'Serve') },
        { code: 'improve', label: I18N('综合提升', 'Improve') }
      ]
    },
    pageStyleVars() {
      return {
        '--external-bg-image': `url('${externalCourseBg}')`
      }
    },
    filteredCourses() {
      const keyword = this.searchKeyword.toLowerCase()
      return this.courses.filter((course) => {
        const passCategory = this.activeCategory === 'all' || course.category === this.activeCategory
        if (!passCategory) {
          return false
        }
        if (!keyword) {
          return true
        }
        const title = this.localize(course.title).toLowerCase()
        const desc = this.localize(course.desc).toLowerCase()
        const platform = this.localize(course.platform).toLowerCase()
        return title.includes(keyword) || desc.includes(keyword) || platform.includes(keyword)
      })
    },
    totalPages() {
      return Math.max(1, Math.ceil(this.filteredCourses.length / this.pageSize))
    },
    pagedCourses() {
      const start = (this.currentPage - 1) * this.pageSize
      return this.filteredCourses.slice(start, start + this.pageSize)
    }
  },
  watch: {
    searchKeyword() {
      this.currentPage = 1
    },
    activeCategory() {
      this.currentPage = 1
    }
  },
  methods: {
    localize(value) {
      if (!value || typeof value !== 'object') {
        return value || ''
      }
      return value[this.$i18n.locale] || value['zh-CN'] || ''
    },
    goPage(page) {
      this.currentPage = Math.min(this.totalPages, Math.max(1, page))
    },
    goPrevPage() {
      this.goPage(this.currentPage - 1)
    },
    goNextPage() {
      this.goPage(this.currentPage + 1)
    }
  }
}
</script>

<style scoped>
.external-courses-page {
  position: relative;
  isolation: isolate;
  margin: 22px auto 60px;
  width: min(100%, 1120px);
}

.external-courses-page::before {
  content: '';
  position: fixed;
  inset: 0;
  z-index: -2;
  background-image: var(--external-bg-image);
  background-size: cover;
  background-position: center bottom;
  background-repeat: no-repeat;
  opacity: 0.35;
}

.hero {
  width: min(100%, 920px);
}

.kicker {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: 12px;
  color: rgba(16, 16, 16, 0.62);
}

.hero h1 {
  margin-top: 8px;
  font-size: clamp(2rem, 4.4vw, 3.5rem);
  letter-spacing: -0.03em;
}

.lead {
  margin-top: 12px;
  line-height: 1.72;
  color: rgba(16, 16, 16, 0.72);
}

.quality-tip {
  margin-top: 14px;
  max-width: 1240px;
  font-size: clamp(1.4rem, 3.2vw, 3rem);
  line-height: 1.18;
  letter-spacing: -0.03em;
  color: rgba(16, 16, 16, 0.96);
}

.quality-tip-highlight {
  display: inline-block;
  background: #101010;
  color: #fff;
  padding: 0 10px;
  margin: 0 4px;
  font-weight: 800;
}

.hero-actions {
  margin-top: 22px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  justify-content: flex-start;
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

.search-input {
  min-width: min(460px, 100%);
  min-height: 40px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.18);
  background: rgba(255, 255, 255, 0.84);
  padding: 0 14px;
}

.category-tabs {
  margin-top: 22px;
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
}

.tab-btn {
  border: 1px solid rgba(16, 16, 16, 0.16);
  background: #ffffff;
  border-radius: 999px;
  min-height: 38px;
  padding: 0 14px;
  color: rgba(16, 16, 16, 0.78);
  cursor: pointer;
}

.tab-btn.active {
  background: #101010;
  color: #f7f7f4;
  border-color: #101010;
}

.course-grid {
  margin-top: 18px;
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 14px;
}

.course-card {
  border: 1px solid rgba(16, 16, 16, 0.16);
  border-radius: 16px;
  background: rgba(248, 248, 246, 0.86);
  backdrop-filter: blur(4px);
  box-shadow:
    0 8px 20px rgba(16, 16, 16, 0.08),
    inset 0 1px 0 rgba(255, 255, 255, 0.6);
  padding: 14px;
  display: flex;
  flex-direction: column;
  min-height: 216px;
}

.cover-wrap {
  display: block;
  border-radius: 12px;
  overflow: hidden;
}

.cover-wrap img {
  width: 100%;
  height: 170px;
  object-fit: cover;
  display: block;
  filter: grayscale(12%);
  transition: transform 0.4s ease;
}

.course-card:hover .cover-wrap img {
  transform: scale(1.03);
}

.card-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
  margin-top: 10px;
}

.platform {
  font-size: 12px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(16, 16, 16, 0.62);
}

.tag {
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.2);
  font-size: 12px;
  padding: 2px 10px;
  color: rgba(16, 16, 16, 0.72);
}

.course-card h2 {
  margin-top: 8px;
  font-size: clamp(1.05rem, 2vw, 1.28rem);
  line-height: 1.45;
}

.desc {
  margin-top: 8px;
  color: rgba(16, 16, 16, 0.74);
  line-height: 1.64;
}

.adv-label {
  margin-top: 8px;
  font-size: 11px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  color: rgba(16, 16, 16, 0.56);
}

.adv-text {
  margin-top: 4px;
  color: rgba(16, 16, 16, 0.82);
  font-weight: 600;
  line-height: 1.55;
}

.open-btn {
  margin-top: auto;
  padding-top: 12px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-height: 36px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.2);
  background: rgba(255, 255, 255, 0.88);
  color: rgba(16, 16, 16, 0.86);
  text-decoration: none;
  font-size: 13px;
  font-weight: 600;
  width: fit-content;
  padding: 0 12px;
}

.open-btn:hover {
  opacity: 0.74;
}

.pagination {
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
  justify-content: flex-end;
}

.list-footer {
  margin-top: 12px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}

.page-btn {
  min-height: 34px;
  padding: 0 12px;
  border-radius: 999px;
  border: 1px solid rgba(16, 16, 16, 0.2);
  background: rgba(255, 255, 255, 0.88);
  color: rgba(16, 16, 16, 0.84);
  cursor: pointer;
}

.page-btn.active {
  background: #101010;
  border-color: #101010;
  color: #f7f7f4;
}

.page-btn:disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.empty-state {
  margin-top: 18px;
  border-radius: 14px;
  border: 1px solid rgba(16, 16, 16, 0.14);
  background: rgba(255, 255, 255, 0.78);
  padding: 20px 16px;
}

.empty-state p {
  margin-top: 8px;
  color: rgba(16, 16, 16, 0.68);
}

@media (max-width: 900px) {
  .course-grid {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }
}

@media (max-width: 640px) {
  .course-grid {
    grid-template-columns: 1fr;
  }
}
</style>

