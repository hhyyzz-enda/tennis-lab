import coaches from '../mock/coaches.json'
import coachImage1 from '../assets/教练/player-zheng-manwei.jpg'
import coachImage2 from '../assets/教练/player-qiao-qi.jpg'
import coachImage3 from '../assets/教练/player-liu-ruiying.jpg'

const API_DELAY_MS = 260
const COACH_API_BASE_URL = (
  import.meta.env.VITE_COACH_API_BASE_URL ||
  import.meta.env.VITE_TENNIS_API_BASE_URL ||
  'http://47.238.94.176:8081'
).replace(/\/+$/, '')
const DATA_SOURCE = import.meta.env.VITE_COACH_DATA_SOURCE || import.meta.env.VITE_TENNIS_DATA_SOURCE || 'api'

const wait = (ms) =>
  new Promise((resolve) => {
    setTimeout(resolve, ms)
  })

const shouldUseApi = () => {
  if (DATA_SOURCE === 'api') return true
  if (DATA_SOURCE === 'mock') return false
  return Boolean(COACH_API_BASE_URL)
}

const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${COACH_API_BASE_URL}${normalizedPath}`
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

const getLocaleText = (value, fallback = '') => {
  if (!value) return { 'zh-CN': fallback, 'en-US': fallback }
  if (typeof value === 'string') return { 'zh-CN': value, 'en-US': value }
  return {
    'zh-CN': value['zh-CN'] || value.zh || fallback,
    'en-US': value['en-US'] || value.en || value['zh-CN'] || fallback
  }
}

const getApiOrigin = () => {
  if (!COACH_API_BASE_URL) return ''
  try {
    return new URL(COACH_API_BASE_URL).origin
  } catch (error) {
    return ''
  }
}

const resolveCoachImage = (avatar) => {
  const cleanedAvatar = sanitizeText(avatar)
  if (!cleanedAvatar) return coachImage1
  if (avatar === '__coach_1__') return coachImage1
  if (avatar === '__coach_2__') return coachImage2
  if (avatar === '__coach_3__') return coachImage3
  if (cleanedAvatar === '__coach_1__') return coachImage1
  if (cleanedAvatar === '__coach_2__') return coachImage2
  if (cleanedAvatar === '__coach_3__') return coachImage3
  if (cleanedAvatar.startsWith('/')) {
    const origin = getApiOrigin()
    if (origin) return `${origin}${cleanedAvatar}`
  }
  return cleanedAvatar || coachImage1
}

const trimEndingPunctuation = (text) => String(text || '').trim().replace(/[。；;,.!]+$/g, '')
const normalizeInlineText = (text) => String(text || '').replace(/\s+/g, ' ').trim()
const sanitizeText = (text) => String(text || '').replace(/[`"'“”‘’]/g, '').trim()

const pickFirstValue = (source, keys, fallback = '') => {
  for (const key of keys) {
    const value = source?.[key]
    if (value === undefined || value === null) continue
    if (typeof value === 'string') {
      const trimmed = value.trim()
      if (trimmed) return trimmed
      continue
    }
    return value
  }
  return fallback
}

const normalizeTextArray = (value) => {
  const cleanItem = (item) => String(item || '').trim().replace(/^曾获得[:：]?\s*/u, '')
  if (Array.isArray(value)) return value.map((item) => String(item || '').trim()).filter(Boolean)
  if (typeof value === 'string') {
    return value
      .split(/[、,，;；\n]/)
      .map((item) => cleanItem(item))
      .filter(Boolean)
  }
  return []
}

const buildCoachIntro = (coach) => {
  const baseIntro = getLocaleText(coach.intro)
  const rawFullText = normalizeInlineText(baseIntro['zh-CN'])
  if (rawFullText) {
    return {
      'zh-CN': rawFullText,
      'en-US': normalizeInlineText(baseIntro['en-US']) || rawFullText
    }
  }

  const name = normalizeInlineText(coach.name || '')
  const identity = normalizeInlineText([coach.gender, coach.ethnicity, coach.politicalStatus].filter(Boolean).join(' '))
  const study = normalizeInlineText([coach.major, coach.grade].filter(Boolean).join(' '))
  const certification = normalizeInlineText(coach.certification || '')
  const experience =
    Number.isFinite(Number(coach.experienceYears)) && Number(coach.experienceYears) > 0
      ? `${Number(coach.experienceYears)}年执教经验`
      : ''
  const specialty = normalizeInlineText(coach.specialty || '')
  const positions = Array.isArray(coach.positions) ? coach.positions.filter(Boolean).join('、') : ''
  const awards = Array.isArray(coach.awards) ? coach.awards.filter(Boolean).join(' ') : ''
  const guidance = normalizeInlineText(coach.guidance || coach.technicalGuidance || '高级技术、战术指导')
  const profileSummary = normalizeInlineText([name, identity, study, certification, experience, specialty, positions].filter(Boolean).join(' '))
  const awardsPart = awards ? `曾获得 ${awards}` : ''
  const zhText = normalizeInlineText([profileSummary, awardsPart, guidance].filter(Boolean).join(' '))

  return {
    'zh-CN': zhText,
    'en-US': normalizeInlineText(baseIntro['en-US']) || zhText
  }
}

const normalizeCoach = (coach) => {
  const profile = coach?.profile || coach?.userProfile || coach?.user?.profile || {}
  const source = { ...profile, ...coach }

  const normalized = {
    id: pickFirstValue(source, ['id', 'coachId', 'uuid'], ''),
    userId: pickFirstValue(source, ['userId', 'uid'], coach?.user?.id ?? ''),
    createTime: pickFirstValue(source, ['createTime', 'createdAt'], ''),
    updateTime: pickFirstValue(source, ['updateTime', 'updatedAt'], ''),
    status: pickFirstValue(source, ['status', 'coachStatus'], ''),
    rating: pickFirstValue(source, ['rating', 'score'], ''),
    hourlyRate: pickFirstValue(source, ['hourlyRate', 'price', 'fee'], ''),
    name: pickFirstValue(source, ['name', 'coachName', 'fullName', 'nickname'], coach?.user?.nickname || ''),
    avatar: resolveCoachImage(pickFirstValue(source, ['avatar', 'avatarUrl', 'headImg', 'headImgUrl'], '')),
    phone: pickFirstValue(source, ['phone', 'mobile', 'mobilePhone', 'contactInfo', 'contact'], ''),
    email: pickFirstValue(source, ['email', 'mail'], ''),
    major: pickFirstValue(source, ['major', 'profession', 'discipline'], ''),
    specialty: pickFirstValue(source, ['specialty', 'speciality', 'expertise', 'goodAt'], ''),
    certification: pickFirstValue(source, ['certification', 'certificate', 'qualification'], ''),
    experienceYears: pickFirstValue(source, ['experienceYears', 'yearsOfExperience'], ''),
    grade: pickFirstValue(source, ['grade', 'classGrade', 'year'], ''),
    gender: pickFirstValue(source, ['gender', 'sex'], ''),
    ethnicity: pickFirstValue(source, ['ethnicity', 'nation'], ''),
    politicalStatus: pickFirstValue(source, ['politicalStatus', 'politicsStatus', 'politicStatus'], ''),
    positions: normalizeTextArray(pickFirstValue(source, ['positions', 'positionList', 'posts', 'position', 'post'], [])),
    awards: normalizeTextArray(
      pickFirstValue(
        source,
        [
          'awards',
          'award',
          'awardList',
          'honors',
          'honourList',
          'honorList',
          'certificates',
          'achievements',
          'achievementList',
          'achievement',
          'prizes'
        ],
        []
      )
    )
  }

  const introSource = pickFirstValue(
    source,
    [
      'fullInfo',
      'resume',
      'detail',
      'detailInfo',
      'coachInfo',
      'coachDetail',
      'profile',
      'profileDesc',
      'intro',
      'introduction',
      'description',
      'desc',
      'content',
      'bio'
    ],
    ''
  )
  const introInput = { ...normalized, intro: introSource }

  return {
    ...normalized,
    intro: buildCoachIntro(introInput),
    contact: normalized.phone || pickFirstValue(source, ['contactInfo', 'contact'], normalized.email) || normalized.email
  }
}

const extractList = (payload) => {
  if (Array.isArray(payload)) return payload
  if (Array.isArray(payload?.records)) return payload.records
  if (Array.isArray(payload?.items)) return payload.items
  if (Array.isArray(payload?.data?.records)) return payload.data.records
  if (Array.isArray(payload?.data?.items)) return payload.data.items
  if (Array.isArray(payload?.data)) return payload.data
  return []
}

const extractDetail = (payload) => {
  if (payload?.data) return payload.data
  return payload
}

export const fetchCoaches = async () => {
  if (shouldUseApi()) {
    const payload = await fetchApiJson('/api/coach/list')
    return extractList(payload).map((coach) => normalizeCoach(coach))
  }

  await wait(API_DELAY_MS)
  return coaches.map((coach) => normalizeCoach(coach))
}

export const fetchCoachById = async (id) => {
  if (shouldUseApi()) {
    const payload = await fetchApiJson(`/api/coach/${encodeURIComponent(id)}`)
    const detail = extractDetail(payload)
    return detail ? normalizeCoach(detail) : null
  }

  await wait(API_DELAY_MS)
  const matched = coaches.find((coach) => String(coach.id) === String(id))
  return matched ? normalizeCoach(matched) : null
}
