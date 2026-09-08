import mockCourses from '../mock/premiumCourses.json'
import basicCourseBg from '../assets/basic-course-bg.jpg'
import { getStoredAuthToken } from './authService'

const API_DELAY_MS = 280
const DATA_SOURCE = import.meta.env.VITE_TENNIS_DATA_SOURCE || 'api'
const COURSE_LIST_API = import.meta.env.VITE_PREMIUM_COURSE_LIST_API || 'http://47.238.94.176:8081/api/course/list'
const COURSE_SEARCH_API = import.meta.env.VITE_PREMIUM_COURSE_SEARCH_API || 'http://47.238.94.176:8081/api/course/search/keyword'
const COURSE_DETAIL_API_BASE = import.meta.env.VITE_PREMIUM_COURSE_DETAIL_API_BASE || 'http://47.238.94.176:8081/api/course'
const COURSE_ADDED_API = import.meta.env.VITE_PREMIUM_COURSE_ADDED_API || 'http://47.238.94.176:8081/api/course/added'
const API_ASSET_ORIGIN = import.meta.env.VITE_PREMIUM_COURSE_ASSET_ORIGIN || 'http://47.238.94.176:8081'
const DEFAULT_PAGE_SIZE = 6
const DEFAULT_ADDED_PAGE_SIZE = 10

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const shouldUseApi = () => {
  return DATA_SOURCE !== 'mock'
}

const toPositiveInteger = (value, fallback) => {
  const numberValue = Number(value)
  if (!Number.isInteger(numberValue) || numberValue <= 0) return fallback
  return numberValue
}

const toAssetUrl = (path) => {
  if (!path || typeof path !== 'string') return ''
  const cleanedPath = normalizeImageEntry(path)
  if (!cleanedPath) return ''
  if (/^https?:\/\//i.test(cleanedPath)) return cleanedPath
  const normalized = cleanedPath.startsWith('/') ? cleanedPath : `/${cleanedPath}`
  return `${API_ASSET_ORIGIN}${normalized}`
}

const normalizeImageEntry = (value) => {
  if (typeof value !== 'string') return ''
  const trimmed = value.trim().replace(/^["'`\s]+|["'`\s]+$/g, '')
  return trimmed
}

const parseImages = (images) => {
  if (!images) return []
  if (Array.isArray(images)) {
    return images
      .map((item) => normalizeImageEntry(item))
      .filter(Boolean)
  }
  if (typeof images !== 'string') return []
  const normalizedInput = normalizeImageEntry(images)
  if (!normalizedInput) return []
  try {
    const parsed = JSON.parse(normalizedInput)
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((item) => normalizeImageEntry(item))
      .filter(Boolean)
  } catch (error) {
    return normalizedInput ? [normalizedInput] : []
  }
}

const getLocaleText = (value, fallback = '') => {
  if (!value) return { 'zh-CN': fallback, 'en-US': fallback }
  if (typeof value === 'string') return { 'zh-CN': value, 'en-US': value }
  return {
    'zh-CN': value['zh-CN'] || value.zh || fallback,
    'en-US': value['en-US'] || value.en || value['zh-CN'] || fallback
  }
}

const normalizeCourse = (course) => {
  const id = course.id || ''
  const intro = getLocaleText(course.intro || course.description)
  const fallbackPoints = [
    getLocaleText({ 'zh-CN': '建立稳定的准备姿态与节奏', 'en-US': 'Build stable ready position and rhythm' }),
    getLocaleText({ 'zh-CN': '掌握关键发力与重心转换逻辑', 'en-US': 'Master key force transfer and balance shift logic' }),
    getLocaleText({ 'zh-CN': '形成可复盘的训练执行标准', 'en-US': 'Form repeatable execution standards for review' })
  ]
  const fallbackModules = [
    {
      id: `${id || 'course'}-module-1`,
      title: getLocaleText({ 'zh-CN': '模块 1：动作准备', 'en-US': 'Module 1: Movement Preparation' }),
      desc: getLocaleText({ 'zh-CN': '建立基础姿态、站位与节奏认知。', 'en-US': 'Build baseline posture, positioning, and rhythm awareness.' })
    },
    {
      id: `${id || 'course'}-module-2`,
      title: getLocaleText({ 'zh-CN': '模块 2：核心执行', 'en-US': 'Module 2: Core Execution' }),
      desc: getLocaleText({ 'zh-CN': '围绕核心动作链路进行分段训练。', 'en-US': 'Train in segments around the core movement chain.' })
    },
    {
      id: `${id || 'course'}-module-3`,
      title: getLocaleText({ 'zh-CN': '模块 3：对抗迁移', 'en-US': 'Module 3: Match Transfer' }),
      desc: getLocaleText({ 'zh-CN': '将动作能力迁移到实战回合场景。', 'en-US': 'Transfer movement ability into practical rally scenarios.' })
    }
  ]

  return {
    id,
    type: course.type || 'general',
    title: getLocaleText(course.title),
    intro,
    cover: course.cover === '__basic_course_bg__' ? basicCourseBg : course.cover || '',
    level: course.level || 'L1',
    videoUrl: course.videoUrl || '',
    videoMockFile: course.videoMockFile || `${id || 'course'}-demo.mp4`,
    durationMinutes: Number(course.durationMinutes || 0),
    teacher: course.teacher || '',
    publishedAt: course.publishedAt || '',
    overview: getLocaleText(course.overview || course.intro || course.description),
    suitableFor: getLocaleText(course.suitableFor, '基础与进阶学习者'),
    keyPoints: (course.keyPoints || []).length
      ? (course.keyPoints || []).map((point) => getLocaleText(point))
      : fallbackPoints,
    modules: (course.modules || []).length
      ? (course.modules || []).map((module, index) => ({
        id: module.id || `${id || 'course'}-module-${index + 1}`,
        title: getLocaleText(module.title, `模块 ${index + 1}`),
        desc: getLocaleText(module.desc, '课程模块说明')
      }))
      : fallbackModules
  }
}

const normalizeBackendCourse = (course) => {
  const id = String(course.id || '')
  const description = course.description || ''
  const images = parseImages(course.images)
  const difficulty = toPositiveInteger(course.difficultyLevel, 1)
  const requirements = course.requirements || '无特殊要求'
  const materials = course.materials || '网球拍、网球'
  const location = course.location || '网球训练场'
  const createDate = typeof course.createTime === 'string' ? course.createTime.split('T')[0] : ''

  return {
    id,
    type: course.courseType ? `type-${course.courseType}` : 'general',
    title: getLocaleText(course.title, '未命名课程'),
    intro: getLocaleText(description, '课程介绍待补充'),
    cover: toAssetUrl(images[0]) || basicCourseBg,
    level: `L${Math.min(5, Math.max(1, difficulty))}`,
    videoUrl: toAssetUrl(course.videoUrl),
    videoMockFile: `${id || 'course'}-demo.mp4`,
    durationMinutes: Number(course.durationMinutes || 0),
    teacher: course.coachId ? `Coach #${course.coachId}` : '',
    publishedAt: createDate,
    overview: getLocaleText(description, '课程介绍待补充'),
    suitableFor: getLocaleText(requirements),
    keyPoints: [
      getLocaleText({ 'zh-CN': `训练地点：${location}`, 'en-US': `Location: ${location}` }),
      getLocaleText({ 'zh-CN': `训练要求：${requirements}`, 'en-US': `Requirements: ${requirements}` }),
      getLocaleText({ 'zh-CN': `所需器材：${materials}`, 'en-US': `Materials: ${materials}` })
    ],
    modules: [
      {
        id: `${id || 'course'}-module-1`,
        title: getLocaleText({ 'zh-CN': '模块 1：动作讲解', 'en-US': 'Module 1: Technique Explanation' }),
        desc: getLocaleText({ 'zh-CN': '教练演示动作要领并纠正常见错误。', 'en-US': 'Coach demonstrates key techniques and common fixes.' })
      },
      {
        id: `${id || 'course'}-module-2`,
        title: getLocaleText({ 'zh-CN': '模块 2：专项训练', 'en-US': 'Module 2: Focused Drills' }),
        desc: getLocaleText({ 'zh-CN': '根据课程主题进行节奏与稳定性训练。', 'en-US': 'Practice rhythm and consistency drills based on the topic.' })
      },
      {
        id: `${id || 'course'}-module-3`,
        title: getLocaleText({ 'zh-CN': '模块 3：实战应用', 'en-US': 'Module 3: Match Application' }),
        desc: getLocaleText({ 'zh-CN': '把训练动作迁移到对抗场景中。', 'en-US': 'Transfer trained movements into match situations.' })
      }
    ]
  }
}

const fetchApiJson = async (url, query = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const queryString = searchParams.toString()
  const requestUrl = queryString ? `${url}?${queryString}` : url

  const response = await fetch(requestUrl, {
    headers: buildApiHeaders()
  })
  if (!response.ok) {
    throw new Error(`API request failed: ${response.status}`)
  }
  return response.json()
}

const parseApiJsonSafely = async (response) => {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return null
  }
}

const buildApiHeaders = ({ withJsonBody = false } = {}) => {
  const headers = {
    Accept: 'application/json'
  }
  if (withJsonBody) {
    headers['Content-Type'] = 'application/json'
  }
  const token = getStoredAuthToken()
  if (token) {
    const normalizedToken = token.replace(/^Bearer\s+/i, '').trim()
    headers.satoken = `Bearer ${normalizedToken}`
  }
  return headers
}

const postApiJson = async (url, body = {}) => {
  const response = await fetch(url, {
    method: 'POST',
    headers: buildApiHeaders({ withJsonBody: true }),
    body: JSON.stringify(body)
  })
  const payload = await parseApiJsonSafely(response)
  if (!response.ok) {
    throw new Error(payload?.message || `API request failed: ${response.status}`)
  }
  return payload
}

const fetchCourseListFromApi = async (page, size) => {
  const payload = await fetchApiJson(COURSE_LIST_API, {
    page: toPositiveInteger(page, 1),
    size: toPositiveInteger(size, DEFAULT_PAGE_SIZE)
  })

  if (!payload || typeof payload !== 'object') {
    throw new Error('Course list response is invalid')
  }

  if (Number(payload?.code) !== 200) {
    throw new Error(payload?.message || 'Course list request failed')
  }

  const listData = payload?.data
  if (!listData || typeof listData !== 'object') {
    return {
      records: [],
      total: 0,
      size: toPositiveInteger(size, DEFAULT_PAGE_SIZE),
      current: toPositiveInteger(page, 1),
      pages: 0
    }
  }

  return {
    records: Array.isArray(listData.records) ? listData.records : [],
    total: Number(listData.total || 0),
    size: Number(listData.size || toPositiveInteger(size, DEFAULT_PAGE_SIZE)),
    current: Number(listData.current || toPositiveInteger(page, 1)),
    pages: Number(listData.pages || 0)
  }
}

const fetchCourseSearchFromApi = async (keyword) => {
  const payload = await postApiJson(COURSE_SEARCH_API, { keyword })

  if (Number(payload?.code) !== 200) {
    throw new Error(payload?.message || 'Course search request failed')
  }

  const listData = payload?.data
  if (!listData || typeof listData !== 'object') {
    return {
      records: [],
      total: 0,
      size: DEFAULT_PAGE_SIZE,
      current: 1,
      pages: 0
    }
  }

  return {
    records: Array.isArray(listData.records) ? listData.records : [],
    total: Number(listData.total || 0),
    size: Number(listData.size || DEFAULT_PAGE_SIZE),
    current: Number(listData.current || 1),
    pages: Number(listData.pages || 0)
  }
}

const fetchCourseDetailFromApi = async (id) => {
  const detailUrl = `${COURSE_DETAIL_API_BASE}/${encodeURIComponent(String(id))}`
  const payload = await fetchApiJson(detailUrl)
  if (Number(payload?.code) !== 200) {
    throw new Error(payload?.message || 'Course detail request failed')
  }
  return payload?.data || null
}

const addCourseToMyCoursesByApi = async (id) => {
  const addUrl = `${COURSE_DETAIL_API_BASE}/${encodeURIComponent(String(id))}/add`
  const payload = await postApiJson(addUrl)
  if (Number(payload?.code) !== 200) {
    throw new Error(payload?.message || 'Course add request failed')
  }
  return payload?.data ?? null
}

const fetchAddedCoursesFromApi = async (page, size) => {
  const payload = await fetchApiJson(COURSE_ADDED_API, {
    page: toPositiveInteger(page, 1),
    size: toPositiveInteger(size, DEFAULT_ADDED_PAGE_SIZE)
  })
  if (Number(payload?.code) !== 200) {
    throw new Error(payload?.message || 'Added courses request failed')
  }

  const listData = payload?.data
  if (!listData || typeof listData !== 'object') {
    return {
      records: [],
      total: 0,
      size: toPositiveInteger(size, DEFAULT_ADDED_PAGE_SIZE),
      current: toPositiveInteger(page, 1),
      pages: 0
    }
  }

  return {
    records: Array.isArray(listData.records) ? listData.records : [],
    total: Number(listData.total || 0),
    size: Number(listData.size || toPositiveInteger(size, DEFAULT_ADDED_PAGE_SIZE)),
    current: Number(listData.current || toPositiveInteger(page, 1)),
    pages: Number(listData.pages || 0)
  }
}

export const fetchPremiumCourseTypes = async () => {
  return [
    { code: 'all', name: { 'zh-CN': '全部课程', 'en-US': 'All Courses' } }
  ]
}

export const fetchPremiumCourses = async (params = {}) => {
  const {
    type = 'all',
    page = 1,
    size = DEFAULT_PAGE_SIZE,
    keyword = ''
  } = params
  const currentPage = toPositiveInteger(page, 1)
  const pageSize = toPositiveInteger(size, DEFAULT_PAGE_SIZE)
  const normalizedKeyword = typeof keyword === 'string' ? keyword.trim() : ''

  if (shouldUseApi()) {
    const apiData = normalizedKeyword
      ? await fetchCourseSearchFromApi(normalizedKeyword)
      : await fetchCourseListFromApi(currentPage, pageSize)
    const rawRecords = Array.isArray(apiData.records) ? apiData.records : []
    const mappedRecords = rawRecords.map((course) => normalizeBackendCourse(course))
    const filteredRecords = type === 'all'
      ? mappedRecords
      : mappedRecords.filter((course) => course.type === type)

    return {
      records: filteredRecords,
      total: Number(apiData.total || filteredRecords.length || 0),
      size: Number(apiData.size || pageSize),
      current: Number(apiData.current || currentPage),
      pages: Number(apiData.pages || (filteredRecords.length ? 1 : 0))
    }
  }

  await wait(API_DELAY_MS)
  const list = mockCourses.map((course) => normalizeCourse(course))
  const typeFilteredList = type === 'all' ? list : list.filter((course) => course.type === type)
  const keywordFilteredList = normalizedKeyword
    ? typeFilteredList.filter((course) => {
      const title = `${course.title?.['zh-CN'] || ''} ${course.title?.['en-US'] || ''}`
      const intro = `${course.intro?.['zh-CN'] || ''} ${course.intro?.['en-US'] || ''}`
      return `${title} ${intro}`.toLowerCase().includes(normalizedKeyword.toLowerCase())
    })
    : typeFilteredList
  const filteredList = keywordFilteredList
  const total = filteredList.length
  const pages = total ? Math.ceil(total / pageSize) : 0
  const start = (currentPage - 1) * pageSize
  const records = filteredList.slice(start, start + pageSize)

  return {
    records,
    total,
    size: pageSize,
    current: currentPage,
    pages
  }
}

export const fetchPremiumCourseById = async (id) => {
  if (!id) return null
  if (shouldUseApi()) {
    const detail = await fetchCourseDetailFromApi(id)
    return detail ? normalizeBackendCourse(detail) : null
  }

  await wait(API_DELAY_MS)
  const matched = mockCourses.find((course) => String(course.id) === String(id))
  return matched ? normalizeCourse(matched) : null
}

export const addPremiumCourseToMyCourses = async (id) => {
  if (!id) {
    throw new Error('Course id is required')
  }
  if (shouldUseApi()) {
    return addCourseToMyCoursesByApi(id)
  }
  await wait(API_DELAY_MS)
  return null
}

export const fetchAddedPremiumCourses = async (params = {}) => {
  const {
    page = 1,
    size = DEFAULT_ADDED_PAGE_SIZE
  } = params
  const currentPage = toPositiveInteger(page, 1)
  const pageSize = toPositiveInteger(size, DEFAULT_ADDED_PAGE_SIZE)

  if (shouldUseApi()) {
    const apiData = await fetchAddedCoursesFromApi(currentPage, pageSize)
    return {
      records: (Array.isArray(apiData.records) ? apiData.records : []).map((course) => normalizeBackendCourse(course)),
      total: Number(apiData.total || 0),
      size: Number(apiData.size || pageSize),
      current: Number(apiData.current || currentPage),
      pages: Number(apiData.pages || 0)
    }
  }

  await wait(API_DELAY_MS)
  return {
    records: [],
    total: 0,
    size: pageSize,
    current: currentPage,
    pages: 0
  }
}

