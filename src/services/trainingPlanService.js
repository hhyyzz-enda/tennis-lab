import { getStoredAuthToken } from './authService'

const AI_API_BASE_URL = (import.meta.env.VITE_TENNIS_AI_API_BASE_URL || 'http://47.238.94.176:8081/api').replace(
  /\/+$/,
  ''
)

const buildAiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${AI_API_BASE_URL}${normalizedPath}`
}

const parseJsonSafely = async (response) => {
  const text = await response.text()
  if (!text) return null
  try {
    return JSON.parse(text)
  } catch {
    return { message: text }
  }
}

const resolveErrorMessage = (payload, fallbackMessage) => {
  if (!payload || typeof payload !== 'object') return fallbackMessage
  return payload.message || payload.msg || payload.error || fallbackMessage
}

const buildHeaders = ({ contentType = '' } = {}) => {
  const headers = {
    Accept: 'application/json'
  }
  if (contentType) {
    headers['Content-Type'] = contentType
  }

  const token = getStoredAuthToken()
  if (token) {
    const normalizedToken = token.replace(/^Bearer\s+/i, '').trim()
    headers.satoken = `Bearer ${normalizedToken}`
  }
  return headers
}

const unwrapBusinessPayload = (payload) => {
  if (!payload || typeof payload !== 'object') {
    return payload
  }
  if (!Object.prototype.hasOwnProperty.call(payload, 'code')) {
    return payload
  }

  const businessCode = Number(payload.code)
  if (businessCode !== 200) {
    throw new Error(resolveErrorMessage(payload, '请求失败'))
  }
  return Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload
}

const postForm = async (path, formBody) => {
  const response = await fetch(buildAiUrl(path), {
    method: 'POST',
    headers: buildHeaders({ contentType: 'application/x-www-form-urlencoded;charset=UTF-8' }),
    body: formBody.toString()
  })
  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    const fallbackMessage = `请求失败（${response.status}）`
    throw new Error(resolveErrorMessage(payload, fallbackMessage))
  }
  return unwrapBusinessPayload(payload)
}

const getJson = async (path, query = {}) => {
  const searchParams = new URLSearchParams()
  Object.entries(query).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== '') {
      searchParams.append(key, String(value))
    }
  })
  const queryString = searchParams.toString()
  const requestPath = queryString ? `${path}?${queryString}` : path

  const response = await fetch(buildAiUrl(requestPath), {
    method: 'GET',
    headers: buildHeaders()
  })
  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    const fallbackMessage = `请求失败（${response.status}）`
    throw new Error(resolveErrorMessage(payload, fallbackMessage))
  }
  return unwrapBusinessPayload(payload)
}

export const generateTrainingPlan = (requirements) => {
  const normalizedRequirements = String(requirements || '').trim()
  if (!normalizedRequirements) {
    throw new Error('requirements 参数不能为空')
  }

  const formBody = new URLSearchParams({ requirements: normalizedRequirements })
  return postForm('/ai/training-plan', formBody)
}

export const fetchTrainingPlans = ({ page = 1, size = 10 } = {}) => {
  return getJson('/ai/training-plans', { page, size })
}
