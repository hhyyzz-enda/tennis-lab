import courses from '../mock/tennisAiCourses.json'

const API_DELAY_MS = 320
const API_BASE_URL = (import.meta.env.VITE_TENNIS_API_BASE_URL || '').replace(/\/+$/, '')
const DATA_SOURCE = import.meta.env.VITE_TENNIS_DATA_SOURCE || 'mock'

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const getLocaleText = (value, fallback = '') => {
  if (!value) return { 'zh-CN': fallback, 'en-US': fallback }
  if (typeof value === 'string') return { 'zh-CN': value, 'en-US': value }
  return {
    'zh-CN': value['zh-CN'] || value.zh || fallback,
    'en-US': value['en-US'] || value.en || value['zh-CN'] || fallback
  }
}

const normalizeAnalysis = (analysis) => {
  if (!analysis) return null
  return {
    component: analysis.component || 'JointForceAnalysis',
    dataFile: analysis.dataFile || '',
    dataUrl: analysis.dataUrl || analysis.jsonUrl || '',
    csvUrl: analysis.csvUrl || '',
    jointConfig: (analysis.jointConfig || []).map((joint) => ({ ...joint })),
    syncThreshold: analysis.syncThreshold,
    maxBarValue: analysis.maxBarValue,
    playSpeed: analysis.playSpeed,
    autoPlay: analysis.autoPlay
  }
}

const normalizeCourse = (course) => ({
  id: course.id || course.courseId || '',
  slug: course.slug || '',
  title: getLocaleText(course.title),
  subtitle: getLocaleText(course.subtitle),
  level: course.level || 'L1',
  durationMinutes: Number(course.durationMinutes || 0),
  cover: course.cover || course.coverUrl || '',
  overview: getLocaleText(course.overview || course.description),
  keyPoints: (course.keyPoints || []).map((point) => getLocaleText(point)),
  analysis: normalizeAnalysis(course.analysis || course.aiAnalysis)
})

const hasLocaleContent = (value) => Boolean(value && (value['zh-CN'] || value['en-US']))

const mergeAnalysis = (primary, fallback) => {
  if (!primary) return fallback || null
  if (!fallback) return primary
  return {
    ...fallback,
    ...primary,
    jointConfig: primary.jointConfig?.length ? primary.jointConfig : fallback.jointConfig
  }
}

const mergeCourseWithFallback = (primary, fallback) => {
  if (!fallback) return primary
  return {
    ...fallback,
    ...primary,
    title: hasLocaleContent(primary.title) ? primary.title : fallback.title,
    subtitle: hasLocaleContent(primary.subtitle) ? primary.subtitle : fallback.subtitle,
    overview: hasLocaleContent(primary.overview) ? primary.overview : fallback.overview,
    keyPoints: primary.keyPoints?.length ? primary.keyPoints : fallback.keyPoints,
    analysis: mergeAnalysis(primary.analysis, fallback.analysis)
  }
}

const normalizedMockCourses = courses.map((course) => normalizeCourse(course))
const mockCourseBySlug = new Map(normalizedMockCourses.map((course) => [course.slug, course]))

const shouldUseApi = () => {
  if (DATA_SOURCE === 'api') return true
  if (DATA_SOURCE === 'mock') return false
  return Boolean(API_BASE_URL)
}

const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${API_BASE_URL}${normalizedPath}`
}

const fetchApiJson = async (path) => {
  const response = await fetch(buildApiUrl(path), {
    headers: {
      Accept: 'application/json'
    }
  })
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  return response.json()
}

const extractCourseList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const extractCourseDetail = (payload) => {
  if (payload?.data) return payload.data
  return payload
}

const cloneCourse = (course) => ({
  ...normalizeCourse(course)
})

const normalizeWithMockFallback = (course, slugHint = '') => {
  const normalized = normalizeCourse(course)
  const fallback = mockCourseBySlug.get(normalized.slug || slugHint || '')
  return mergeCourseWithFallback(normalized, fallback)
}

export const fetchTennisAiCourses = async () => {
  if (shouldUseApi()) {
    try {
      const payload = await fetchApiJson('/api/v1/tennis-ai/courses')
      return extractCourseList(payload).map((course) => normalizeWithMockFallback(course))
    } catch (error) {
      await wait(API_DELAY_MS)
      return normalizedMockCourses.map((course) => ({ ...course }))
    }
  }
  await wait(API_DELAY_MS)
  return normalizedMockCourses.map((course) => ({ ...course }))
}

export const fetchTennisAiCourseBySlug = async (slug) => {
  if (shouldUseApi()) {
    try {
      const payload = await fetchApiJson(`/api/v1/tennis-ai/courses/${encodeURIComponent(slug)}`)
      const matched = extractCourseDetail(payload)
      if (matched) return normalizeWithMockFallback(matched, slug)
    } catch (error) {
      // Fallback to local mock detail when API detail is unavailable.
    }
    return mockCourseBySlug.get(slug) || null
  }
  await wait(API_DELAY_MS)
  return mockCourseBySlug.get(slug) || null
}
