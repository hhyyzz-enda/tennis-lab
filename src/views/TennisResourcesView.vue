<template>
  <section class="resources-page">
    <header class="hero">
      <p class="kicker">{{ $t('page.tennisResources.kicker') }}</p>
      <h1>
        <span class="title-normal">{{ $t('page.tennisResources.titleLead') }}</span>
        <span class="title-highlight">{{ $t('page.tennisResources.titleHighlightMain') }}</span>
        <span class="title-normal">{{ $t('page.tennisResources.titleMiddle') }}</span>
        <span class="title-highlight">{{ $t('page.tennisResources.titleHighlightSub') }}</span>
        <span class="title-normal">{{ $t('page.tennisResources.titleTail') }}</span>
      </h1>
      <p class="lead">{{ $t('page.tennisResources.lead') }}</p>
      <div class="hero-actions">
        <RouterLink class="back-home" to="/">{{ $t('page.tennisResources.backHome') }}</RouterLink>
        <label class="search-wrap">
          <input
            v-model.trim="searchKeyword"
            type="text"
            :placeholder="$t('page.tennisResources.searchPlaceholder')"
          />
        </label>
      </div>
    </header>

    <div v-if="filteredSections.length" class="resource-grid">
      <article
        v-for="section in filteredSections"
        :key="section.key"
        class="resource-card"
        :style="buildCardStyle(section)"
      >
        <div class="card-top">
          <p>{{ section.category }}</p>
          <h2>{{ section.title }}</h2>
          <strong class="guide">{{ section.guide }}</strong>
          <small>{{ section.desc }}</small>
        </div>

        <ul class="site-grid">
          <li v-for="link in section.links" :key="link.url">
            <a :href="link.url" target="_blank" rel="noopener noreferrer">
              <img
                :src="getDisplayIcon(link.url)"
                :alt="`${link.name} ${logoAltSuffix}`"
                loading="lazy"
                @error="onDisplayIconError($event, link.url)"
              />
              <span class="site-meta">
                <b>{{ link.name }}</b>
                <small>{{ getHost(link.url) }}</small>
              </span>
              <em>{{ visitLabel }}</em>
            </a>
            <p>{{ link.desc }}</p>
          </li>
        </ul>
      </article>
    </div>

    <div v-else class="empty-state">
      <h3>{{ $t('page.tennisResources.emptyTitle') }}</h3>
      <p>{{ $t('page.tennisResources.emptyDesc') }}</p>
    </div>

    <button
      v-show="showBackTop"
      type="button"
      class="back-top-btn"
      :aria-label="isZh ? '回到顶部' : 'Back to top'"
      @click="scrollToTop"
    >
      <span aria-hidden="true">↑</span>
    </button>
  </section>
</template>

<script>
import { RouterLink } from 'vue-router'
import officialBg from '../assets/赛事资讯/1.jpg'
import slamsBg from '../assets/赛事资讯/grand-slam.jpeg'
import scoresBg from '../assets/赛事资讯/3.jpg'
import newsGlobalBg from '../assets/赛事资讯/4.jpg'
import newsCnBg from '../assets/赛事资讯/5.jpg'
import statsBg from '../assets/赛事资讯/6.png'
import communityBg from '../assets/赛事资讯/7.png'
import gearBg from '../assets/赛事资讯/8.jpg'
import fallbackSiteIcon from '../assets/website-icon.png'
import fallbackSiteIcon2 from '../assets/website-icon-2.png'

const I18N = (zh, en) => ({ zh, en })

const RESOURCE_SECTIONS = [
  {
    key: 'official',
    category: I18N('官方组织', 'Official Bodies'),
    title: I18N('国际组织与巡回赛官网', 'International Organizations & Tours'),
    guide: I18N('先看权威源头：规则、排名、赛历都以这里为准。', 'Start with authoritative sources: rules, rankings, and calendars are most reliable here.'),
    desc: I18N('权威规则、签表、赛历、排名和赛事公告。', 'Authoritative rules, draws, tournament calendars, rankings, and official announcements.'),
    accent: '#8fd0ff',
    accentSoft: 'rgba(143, 208, 255, 0.32)',
    bgImage: officialBg,
    links: [
      { name: 'ATP Tour', url: 'https://www.atptour.com/', desc: I18N('男子职业网球巡回赛官方站。', "Official website of men's professional tennis tour.") },
      { name: 'WTA', url: 'https://www.wtatennis.com/', desc: I18N('女子职业网球巡回赛官方站。', "Official website of women's professional tennis tour.") },
      { name: 'ITF Tennis', url: 'https://www.itftennis.com/', desc: I18N('国际网球联合会官网。', 'Official website of the International Tennis Federation.') },
      { name: 'Davis Cup', url: 'https://www.daviscup.com/', desc: I18N('戴维斯杯官方页面。', 'Official page of the Davis Cup.') },
      { name: 'Billie Jean King Cup', url: 'https://www.billiejeankingcup.com/', desc: I18N('比利简金杯官方页面。', 'Official page of the Billie Jean King Cup.') },
      { name: 'United Cup', url: 'https://www.unitedcup.com/', desc: I18N('联合杯赛事官网。', 'Official website of the United Cup.') }
    ]
  },
  {
    key: 'slams',
    category: I18N('大满贯', 'Grand Slams'),
    title: I18N('四大满贯与重点赛事', 'Grand Slams & Major Events'),
    guide: I18N('看大赛就从这里进：签表、赛果、赛况更新最快。', 'Follow major events from here: draws, results, and updates are fastest.'),
    desc: I18N('获取签表、赛果、现场新闻和票务信息。', 'Get draws, results, on-site news, and ticket information.'),
    accent: '#ffc88e',
    accentSoft: 'rgba(255, 200, 142, 0.3)',
    bgImage: slamsBg,
    links: [
      { name: 'Australian Open', url: 'https://ausopen.com/', desc: I18N('澳网官方站。', 'Official website of the Australian Open.') },
      { name: 'Roland-Garros', url: 'https://www.rolandgarros.com/', desc: I18N('法网官方站。', 'Official website of Roland-Garros.') },
      { name: 'Wimbledon', url: 'https://www.wimbledon.com/', desc: I18N('温网官方站。', 'Official website of Wimbledon.') },
      { name: 'US Open', url: 'https://www.usopen.org/', desc: I18N('美网官方站。', 'Official website of the US Open.') },
      { name: 'Laver Cup', url: 'https://lavercup.com/', desc: I18N('拉沃尔杯官网。', 'Official website of the Laver Cup.') },
      { name: 'ATP Finals', url: 'https://www.nittoatpfinals.com/', desc: I18N('ATP 年终总决赛。', 'Official website of the ATP Finals.') }
    ]
  },
  {
    key: 'scores',
    category: I18N('比分赛程', 'Scores & Schedule'),
    title: I18N('即时比分与赛程追踪', 'Live Scores & Match Tracking'),
    guide: I18N('比赛进行中优先看这一栏：适合边看球边查分。', 'During live matches, check this section first for real-time score tracking.'),
    desc: I18N('适合边看球边跟踪比分、技术统计与对阵。', 'Best for following live scores, stats, and matchups while watching.'),
    accent: '#97f3cb',
    accentSoft: 'rgba(151, 243, 203, 0.3)',
    bgImage: scoresBg,
    links: [
      { name: 'ATP Scores', url: 'https://www.atptour.com/en/scores/current', desc: I18N('ATP 官方即时比分。', 'Official ATP live score page.') },
      { name: 'WTA Scores', url: 'https://www.wtatennis.com/scores', desc: I18N('WTA 官方即时比分。', 'Official WTA live score page.') },
      { name: 'Flashscore Tennis', url: 'https://www.flashscore.com/tennis/', desc: I18N('多赛事实时比分。', 'Real-time scores across multiple events.') },
      { name: 'Tennis24', url: 'https://www.tennis24.com/', desc: I18N('网球专门比分追踪。', 'Dedicated tennis score tracking.') },
      { name: 'Sofascore Tennis', url: 'https://www.sofascore.com/tennis', desc: I18N('可视化统计与实时数据。', 'Visualized stats and live data.') },
      { name: 'Tennis Explorer', url: 'https://www.tennisexplorer.com/', desc: I18N('历史赛果与签表查询。', 'Historical results and draw lookup.') }
    ]
  },
  {
    key: 'news-global',
    category: I18N('国际资讯', 'Global News'),
    title: I18N('国际媒体与深度报道', 'Global Media & In-depth Coverage'),
    guide: I18N('想看球员故事与评论：这一栏更全面。', 'For player stories and commentary, this section is more comprehensive.'),
    desc: I18N('赛场快讯、评论专栏、球员故事与采访。', 'Breaking news, columns, player stories, and interviews.'),
    accent: '#e0b5ff',
    accentSoft: 'rgba(224, 181, 255, 0.3)',
    bgImage: newsGlobalBg,
    links: [
      { name: 'Tennis.com', url: 'https://www.tennis.com/', desc: I18N('综合网球新闻与视频。', 'Comprehensive tennis news and videos.') },
      { name: 'Baseline (Tennis.com)', url: 'https://www.tennis.com/news/', desc: I18N('球员新闻与日常报道。', 'Player updates and daily coverage.') },
      { name: 'Tennis365', url: 'https://www.tennis365.com/', desc: I18N('英媒风格赛事快讯。', 'Fast event coverage in UK media style.') },
      { name: 'Ubitennis', url: 'https://www.ubitennis.net/', desc: I18N('巡回赛资讯与评论。', 'Tour news and commentary.') },
      { name: 'BBC Tennis', url: 'https://www.bbc.com/sport/tennis', desc: I18N('BBC 网球频道。', 'BBC tennis channel.') },
      { name: 'Eurosport Tennis', url: 'https://www.eurosport.com/tennis/', desc: I18N('赛事报道与专题。', 'Event coverage and feature stories.') }
    ]
  },
  {
    key: 'news-cn',
    category: I18N('中文资讯', 'Chinese Sources'),
    title: I18N('中文网球资讯与官方渠道', 'Chinese Tennis News & Official Channels'),
    guide: I18N('中文阅读优先：国内动态、协会信息、热点速览。', 'Prefer Chinese content: domestic updates, association news, and hot topics.'),
    desc: I18N('国内赛事、协会动态、中文热点速览。', 'Domestic events, association updates, and Chinese quick highlights.'),
    accent: '#ffe388',
    accentSoft: 'rgba(255, 227, 136, 0.3)',
    bgImage: newsCnBg,
    links: [
      { name: I18N('中国网球协会', 'China Tennis Association'), url: 'https://tennis.org.cn/', desc: I18N('中国网球协会官方站。', 'Official website of the China Tennis Association.') },
      { name: I18N('中国网球协会资讯', 'CTA News'), url: 'https://tennis.org.cn/news/', desc: I18N('协会新闻与政策动态。', 'Association news and policy updates.') },
      { name: I18N('全网球', 'All Tennis China'), url: 'https://www.alltennis.cn/', desc: I18N('中文网球资讯与社区。', 'Chinese tennis news and community.') },
      { name: I18N('新浪网球', 'Sina Tennis'), url: 'https://tennis.sina.cn/', desc: I18N('新浪体育网球频道。', 'Sina Sports tennis channel.') },
      { name: I18N('央视网球', 'CCTV Tennis'), url: 'https://sports.cctv.com/tennis/', desc: I18N('央视体育网球专题。', 'CCTV Sports tennis section.') },
      { name: I18N('腾讯体育网球', 'Tencent Tennis'), url: 'https://sports.qq.com/tennis/', desc: I18N('腾讯体育网球频道。', 'Tencent Sports tennis channel.') }
    ]
  },
  {
    key: 'stats',
    category: I18N('数据分析', 'Analytics'),
    title: I18N('进阶数据与战术分析', 'Advanced Stats & Tactical Analysis'),
    guide: I18N('做研究、写分析时重点看：数据维度更深。', 'Best for research and writing analysis with deeper data dimensions.'),
    desc: I18N('适合做球员研究、战术拆解和趋势观察。', 'Ideal for player research, tactical breakdowns, and trend tracking.'),
    accent: '#9ad4ff',
    accentSoft: 'rgba(154, 212, 255, 0.3)',
    bgImage: statsBg,
    links: [
      { name: 'Tennis Abstract', url: 'http://tennisabstract.com/', desc: I18N('高阶统计与球员数据。', 'Advanced statistics and player data.') },
      { name: 'Ultimate Tennis Statistics', url: 'https://www.ultimatetennisstatistics.com/', desc: I18N('Open Era 男网统计工具。', "Open Era men's tennis stats tool.") },
      { name: 'Jeff Sackmann GitHub', url: 'https://github.com/JeffSackmann', desc: I18N('公开网球数据仓库。', 'Open tennis data repository.') },
      { name: 'Match Charting Project', url: 'http://www.tennisabstract.com/charting/meta.html', desc: I18N('逐分记录与战术样本。', 'Point-by-point charting and tactical samples.') },
      { name: 'Tennis Channel Stats', url: 'https://www.tennischannel.com/', desc: I18N('赛事内容与相关分析内容。', 'Event content and related analysis.') },
      { name: 'ATP Stats Hub', url: 'https://www.atptour.com/en/stats', desc: I18N('ATP 官方统计入口。', 'Official ATP stats hub.') }
    ]
  },
  {
    key: 'community',
    category: I18N('社区论坛', 'Community'),
    title: I18N('球迷社区与讨论区', 'Fan Communities & Forums'),
    guide: I18N('想交流观点和看球迷反应：从这里开始。', 'Start here to discuss opinions and follow fan reactions.'),
    desc: I18N('交流观点、追踪热点、看球迷讨论。', 'Discuss, follow hot topics, and read fan conversations.'),
    accent: '#ffb7d5',
    accentSoft: 'rgba(255, 183, 213, 0.3)',
    bgImage: communityBg,
    links: [
      { name: 'Reddit r/tennis', url: 'https://www.reddit.com/r/tennis/', desc: I18N('国际活跃球迷社区。', 'Highly active international tennis fan community.') },
      { name: 'Talk Tennis', url: 'https://tt.tennis-warehouse.com/', desc: I18N('老牌英文网球论坛。', 'Long-standing English tennis forum.') },
      { name: 'Tennis Forum', url: 'https://www.tennisforum.com/', desc: I18N('女子网球讨论活跃。', "Active discussions around women's tennis.") },
      { name: 'Menstennisforums', url: 'https://www.menstennisforums.com/', desc: I18N('男子网球讨论区。', "Men's tennis discussion forum.") },
      { name: 'Tennis Warehouse Blog', url: 'https://www.tennis-warehouse.com/learning_center/', desc: I18N('装备与知识文章。', 'Gear and knowledge articles.') },
      { name: I18N('ATP 官方 YouTube', 'ATP Official YouTube'), url: 'https://www.youtube.com/@ATPTour', desc: I18N('赛事集锦与采访视频。', 'Highlights and interview videos.') }
    ]
  },
  {
    key: 'gear',
    category: I18N('装备与训练', 'Gear & Training'),
    title: I18N('球拍、线床与训练资源', 'Rackets, Strings & Training Resources'),
    guide: I18N('买拍/换线前必看：先做参数与口碑对比。', 'Before buying rackets or changing strings, compare specs and reviews first.'),
    desc: I18N('购买前调研、装备参数对比、训练灵感。', 'Pre-purchase research, gear specs comparison, and training ideas.'),
    accent: '#b9f4a5',
    accentSoft: 'rgba(185, 244, 165, 0.3)',
    bgImage: gearBg,
    links: [
      { name: 'Tennis Warehouse', url: 'https://www.tennis-warehouse.com/', desc: I18N('装备评测与购买。', 'Gear reviews and shopping.') },
      { name: 'Tennis Warehouse University', url: 'https://twu.tennis-warehouse.com/', desc: I18N('线床和器材测试数据。', 'String bed and equipment test data.') },
      { name: 'Tennis Nerd', url: 'https://tennisnerd.net/', desc: I18N('球拍与器材测评。', 'Racket and equipment reviews.') },
      { name: 'Racquet Finder', url: 'https://www.tennis-warehouse.com/learning_center/racquet_reviews/', desc: I18N('球拍对比参考。', 'Racket comparison reference.') },
      { name: 'Stringforum', url: 'https://www.stringforum.net/', desc: I18N('球线数据库与反馈。', 'String database and feedback.') },
      { name: 'HEAD Tennis', url: 'https://www.head.com/en/tennis', desc: I18N('品牌器材与技术信息。', 'Brand equipment and technical info.') }
    ]
  }
]

export default {
  name: 'TennisResourcesView',
  components: {
    RouterLink
  },
  data() {
    return {
      searchKeyword: '',
      sections: RESOURCE_SECTIONS,
      iconSources: {},
      iconLoadingStarted: {},
      iconResolved: {},
      fallbackByUrl: {},
      showBackTop: false
    }
  },
  mounted() {
    window.addEventListener('scroll', this.handleWindowScroll, { passive: true })
    this.handleWindowScroll()
  },
  beforeUnmount() {
    window.removeEventListener('scroll', this.handleWindowScroll)
  },
  computed: {
    currentLocale() {
      return this.$i18n?.locale || 'zh-CN'
    },
    isZh() {
      return this.currentLocale.startsWith('zh')
    },
    logoAltSuffix() {
      return this.isZh ? '图标' : 'logo'
    },
    visitLabel() {
      return this.isZh ? '访问' : 'Visit'
    },
    localizedSections() {
      return this.sections.map((section) => ({
        ...section,
        category: this.pickI18n(section.category),
        title: this.pickI18n(section.title),
        guide: this.pickI18n(section.guide),
        desc: this.pickI18n(section.desc),
        links: section.links.map((link) => ({
          ...link,
          name: this.pickI18n(link.name),
          desc: this.pickI18n(link.desc)
        }))
      }))
    },
    filteredSections() {
      if (!this.searchKeyword) {
        return this.localizedSections
      }

      const keyword = this.searchKeyword.toLowerCase()
      return this.localizedSections
        .map((section) => ({
          ...section,
          links: section.links.filter(
            (link) =>
              link.name.toLowerCase().includes(keyword) ||
              link.desc.toLowerCase().includes(keyword) ||
              section.title.toLowerCase().includes(keyword) ||
              section.category.toLowerCase().includes(keyword)
          )
        }))
        .filter((section) => section.links.length > 0)
    }
  },
  methods: {
    handleWindowScroll() {
      this.showBackTop = window.scrollY > 260
    },
    scrollToTop() {
      window.scrollTo({ top: 0, behavior: 'smooth' })
    },
    pickFallbackIcon(url) {
      if (!this.fallbackByUrl[url]) {
        const pool = [fallbackSiteIcon, fallbackSiteIcon2]
        this.fallbackByUrl[url] = pool[Math.floor(Math.random() * pool.length)]
      }
      return this.fallbackByUrl[url]
    },
    pickI18n(value) {
      if (typeof value === 'string') {
        return value
      }
      if (!value || typeof value !== 'object') {
        return ''
      }
      return this.isZh ? value.zh : value.en
    },
    getHost(url) {
      try {
        const hostname = new URL(url).hostname
        return hostname.replace(/^www\./, '')
      } catch (error) {
        return url
      }
    },
    getOrigin(url) {
      try {
        return new URL(url).origin
      } catch (error) {
        return ''
      }
    },
    getIconCandidates(url) {
      const origin = this.getOrigin(url)
      const host = this.getHost(url)
      const candidates = []

      if (origin) {
        candidates.push(`${origin}/favicon.ico`)
      }
      if (host) {
        candidates.push(`https://icons.duckduckgo.com/ip3/${host}.ico`)
      }
      candidates.push(`https://www.google.com/s2/favicons?sz=128&domain_url=${encodeURIComponent(url)}`)
      return candidates
    },
    getDisplayIcon(url) {
      if (!this.iconLoadingStarted[url]) {
        this.resolveIconWithTimeout(url)
      }
      return this.iconSources[url] || this.pickFallbackIcon(url)
    },
    resolveIconWithTimeout(url) {
      this.iconLoadingStarted[url] = true
      this.iconSources[url] = this.getIconCandidates(url)[0] || fallbackSiteIcon

      const timeoutId = setTimeout(() => {
        if (!this.iconResolved[url]) {
          this.iconSources[url] = this.pickFallbackIcon(url)
        }
      }, 5000)

      const candidates = this.getIconCandidates(url)
      let index = 0

      const tryNext = () => {
        if (index >= candidates.length) {
          return
        }

        const candidate = candidates[index]
        index += 1
        const preload = new Image()

        preload.onload = () => {
          this.iconResolved[url] = true
          clearTimeout(timeoutId)
          this.iconSources[url] = candidate
        }

        preload.onerror = () => {
          tryNext()
        }

        preload.src = candidate
      }

      tryNext()
    },
    onDisplayIconError(event, url) {
      const img = event?.target
      if (!img) {
        return
      }
      img.onerror = null
      img.src = this.pickFallbackIcon(url)
      if (!this.iconLoadingStarted[url]) {
        this.resolveIconWithTimeout(url)
      }
    },
    buildCardStyle(section) {
      return {
        '--card-accent': section.accent,
        '--card-accent-soft': section.accentSoft,
        '--card-bg-image': `url('${section.bgImage}')`
      }
    }
  }
}
</script>

<style scoped>
.resources-page {
  position: relative;
  left: calc(50% - 50vw);
  width: 100vw;
  max-width: 100vw;
  min-height: calc(100vh - 94px);
  margin: 0;
  padding: 24px clamp(22px, 4vw, 52px) 60px;
  border-radius: 0;
  color: rgba(236, 241, 248, 0.96);
  overflow: hidden;
  isolation: isolate;
}

.resources-page::before {
  content: '';
  position: absolute;
  inset: 0;
  background:
    radial-gradient(circle at 14% 12%, rgba(120, 154, 255, 0.24) 0%, rgba(120, 154, 255, 0) 46%),
    radial-gradient(circle at 88% 9%, rgba(255, 170, 188, 0.2) 0%, rgba(255, 170, 188, 0) 44%),
    linear-gradient(150deg, rgba(6, 9, 16, 0.95) 0%, rgba(8, 12, 20, 0.92) 58%, rgba(6, 10, 18, 0.95) 100%);
  backdrop-filter: blur(14px) saturate(125%);
  z-index: 0;
}

.resources-page::after {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(8, 12, 19, 0.12) 0%, rgba(8, 12, 19, 0.32) 100%);
  z-index: 0;
}

.resources-page > * {
  position: relative;
  z-index: 1;
}

.hero {
  width: min(100%, 1240px);
  margin: 2px auto 0;
}

.kicker {
  text-transform: uppercase;
  letter-spacing: 0.1em;
  font-size: clamp(0.9rem, 1.3vw, 1.1rem);
  font-weight: 600;
  color: rgba(215, 226, 245, 0.75);
}

.hero h1 {
  margin-top: 8px;
  font-size: clamp(2rem, 4.2vw, 3.8rem);
  letter-spacing: -0.03em;
  color: #f4f8ff;
  line-height: 1.12;
  display: flex;
  flex-wrap: wrap;
  gap: 0.18em;
  align-items: baseline;
}

.title-normal {
  color: #f4f8ff;
}

.title-highlight {
  color: #a5d2ff;
  text-shadow: 0 0 16px rgba(113, 180, 255, 0.26);
}

.lead {
  margin-top: 12px;
  max-width: 860px;
  color: rgba(220, 231, 245, 0.9);
  line-height: 1.7;
}

.hero-actions {
  margin-top: 22px;
  display: flex;
  gap: 16px;
  align-items: flex-end;
  flex-wrap: wrap;
}

.back-home {
  display: inline-flex;
  align-items: center;
  min-height: 42px;
  border-radius: 999px;
  padding: 0 16px;
  text-decoration: none;
  font-weight: 600;
  border: 1px solid rgba(225, 236, 255, 0.38);
  color: #edf4ff;
  background: rgba(255, 255, 255, 0.08);
  backdrop-filter: blur(6px);
}

.back-home:hover {
  opacity: 0.82;
}

.search-wrap {
  display: grid;
  gap: 8px;
  min-width: min(500px, 100%);
}

.search-wrap span {
  font-size: 12px;
  letter-spacing: 0.06em;
  text-transform: uppercase;
  color: rgba(220, 230, 244, 0.75);
}

.search-wrap input {
  height: 44px;
  border-radius: 12px;
  border: 1px solid rgba(196, 214, 241, 0.28);
  color: #edf3ff;
  background: rgba(5, 8, 14, 0.5);
  padding: 0 14px;
  font-size: 14px;
}

.search-wrap input::placeholder {
  color: rgba(202, 217, 240, 0.62);
}

.search-wrap input:focus {
  outline: 2px solid rgba(174, 203, 247, 0.58);
  outline-offset: 1px;
}

.hint {
  margin-top: 10px;
  font-size: 13px;
  color: rgba(212, 224, 241, 0.72);
}

.resource-grid {
  margin-top: 34px;
  width: min(100%, 1240px);
  margin-left: auto;
  margin-right: auto;
  display: grid;
  grid-template-columns: repeat(12, minmax(0, 1fr));
  column-gap: 40px;
  row-gap: 50px;
}

.resource-card {
  position: relative;
  overflow: hidden;
  grid-column: span 6;
  border-radius: 22px;
  padding: 26px 24px;
  min-height: 520px;
  background: linear-gradient(165deg, rgba(17, 22, 32, 0.64) 0%, rgba(12, 16, 24, 0.72) 100%);
  border: 1px solid color-mix(in srgb, var(--card-accent) 55%, rgba(214, 230, 252, 0.28));
  box-shadow:
    inset 0 1px 0 rgba(255, 255, 255, 0.1),
    0 10px 24px rgba(5, 8, 14, 0.36),
    0 0 0 1px rgba(255, 255, 255, 0.03),
    0 0 30px color-mix(in srgb, var(--card-accent) 22%, transparent);
}

.resource-card::before {
  content: '';
  position: absolute;
  inset: 0;
  background: linear-gradient(145deg, color-mix(in srgb, var(--card-accent) 42%, transparent) 0%, transparent 58%);
  opacity: 0.5;
  z-index: 0;
}

.resource-card::after {
  content: '';
  position: absolute;
  inset: 0;
  background-image:
    linear-gradient(180deg, rgba(8, 11, 18, 0.36) 0%, rgba(8, 11, 18, 0.58) 100%),
    var(--card-bg-image);
  background-size: cover;
  background-position: center 42%;
  opacity: 0.74;
  z-index: 0;
  pointer-events: none;
}

.card-top,
.site-grid {
  position: relative;
  z-index: 1;
}

.resource-card:nth-child(1),
.resource-card:nth-child(5) {
  grid-column: span 7;
}

.resource-card:nth-child(2),
.resource-card:nth-child(6) {
  grid-column: span 5;
  margin-top: 42px;
}

.resource-card:nth-child(3),
.resource-card:nth-child(7) {
  margin-top: 30px;
}

.resource-card:nth-child(4),
.resource-card:nth-child(8) {
  margin-top: 54px;
}

.card-top p {
  text-transform: uppercase;
  letter-spacing: 0.08em;
  font-size: 12px;
  color: var(--card-accent);
}

.card-top h2 {
  margin-top: 8px;
  font-size: clamp(1.3rem, 2vw, 1.8rem);
  letter-spacing: -0.02em;
  color: #f4f8ff;
}

.guide {
  display: block;
  margin-top: 8px;
  color: rgba(237, 244, 255, 0.94);
  font-size: 14px;
  line-height: 1.55;
}

.card-top small {
  display: block;
  margin-top: 6px;
  color: rgba(210, 224, 244, 0.74);
}

.site-grid {
  margin: 18px 0 0;
  padding: 0;
  list-style: none;
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 10px;
}

li {
  border: 1px solid rgba(194, 214, 240, 0.2);
  border-radius: 14px;
  padding: 10px 10px 8px;
  background: rgba(10, 13, 22, 0.58);
  backdrop-filter: blur(8px);
}

li a {
  display: flex;
  align-items: center;
  gap: 10px;
  text-decoration: none;
  color: #ecf3ff;
  font-weight: 600;
}

li a img {
  width: 34px;
  height: 34px;
  border-radius: 10px;
  border: 1px solid rgba(193, 212, 239, 0.26);
  background: rgba(255, 255, 255, 0.92);
  flex-shrink: 0;
}

.site-meta {
  display: grid;
  gap: 2px;
  min-width: 0;
}

.site-meta b {
  font-size: 14px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

.site-meta small {
  color: rgba(193, 210, 234, 0.86);
  font-size: 12px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}

li a em {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  margin-left: auto;
  font-style: normal;
  font-size: 12px;
  border: 1px solid color-mix(in srgb, var(--card-accent) 62%, rgba(207, 223, 245, 0.32));
  color: var(--card-accent);
  border-radius: 999px;
  padding: 2px 10px;
  background: rgba(8, 11, 18, 0.4);
  white-space: nowrap;
  writing-mode: horizontal-tb;
  text-orientation: mixed;
  flex-shrink: 0;
}

li a:hover {
  opacity: 0.72;
}

li p {
  margin-top: 8px;
  color: rgba(210, 225, 245, 0.84);
  line-height: 1.5;
  font-size: 13px;
}

.empty-state {
  margin-top: 28px;
  width: min(100%, 1240px);
  margin-left: auto;
  margin-right: auto;
  border-radius: 20px;
  background: rgba(8, 11, 20, 0.66);
  border: 1px solid rgba(194, 214, 240, 0.24);
  padding: 30px 24px;
}

.empty-state h3 {
  font-size: 1.2rem;
}

.empty-state p {
  margin-top: 8px;
  color: rgba(210, 223, 241, 0.8);
}

.back-top-btn {
  position: fixed;
  right: clamp(16px, 2.6vw, 34px);
  bottom: clamp(18px, 3vw, 36px);
  width: 44px;
  height: 44px;
  border-radius: 999px;
  border: 1px solid rgba(183, 214, 255, 0.42);
  background: rgba(13, 19, 30, 0.76);
  color: #d8e9ff;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  backdrop-filter: blur(10px) saturate(120%);
  box-shadow:
    0 8px 18px rgba(0, 0, 0, 0.28),
    inset 0 1px 0 rgba(255, 255, 255, 0.14);
  transition: transform 0.2s ease, opacity 0.2s ease, border-color 0.2s ease;
  z-index: 20;
}

.back-top-btn:hover {
  transform: translateY(-2px);
  border-color: rgba(160, 210, 255, 0.65);
}

.back-top-btn span {
  font-size: 18px;
  line-height: 1;
}

@media (max-width: 900px) {
  .search-wrap {
    min-width: 100%;
  }

  .resource-grid {
    grid-template-columns: 1fr;
  }

  .site-grid {
    grid-template-columns: 1fr;
  }

  .resource-card,
  .resource-card:nth-child(1),
  .resource-card:nth-child(2),
  .resource-card:nth-child(3),
  .resource-card:nth-child(4),
  .resource-card:nth-child(5),
  .resource-card:nth-child(6),
  .resource-card:nth-child(7),
  .resource-card:nth-child(8) {
    grid-column: span 1;
    margin-top: 0;
  }
}
</style>

