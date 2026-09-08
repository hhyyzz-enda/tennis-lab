const AUTH_API_BASE_URL = (import.meta.env.VITE_TENNIS_AUTH_API_BASE_URL || 'http://47.238.94.176:8081').replace(
  /\/+$/,
  ''
)
const AUTH_STORAGE_KEY = 'tennisLabAuth'

const buildAuthUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${AUTH_API_BASE_URL}${normalizedPath}`
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

const parseAuthStorage = () => {
  if (typeof window === 'undefined') return null
  const rawAuth = window.localStorage.getItem(AUTH_STORAGE_KEY)
  if (!rawAuth) return null
  try {
    return JSON.parse(rawAuth)
  } catch {
    return null
  }
}

export const getStoredAuthToken = () => {
  const authPayload = parseAuthStorage()
  const token = String(authPayload?.token || authPayload?.data?.token || '').trim()
  return token
}

const buildAuthHeaders = ({ withJsonBody = false } = {}) => {
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

const unwrapBusinessPayload = (payload) => {
  if (!payload || typeof payload !== 'object' || !Object.prototype.hasOwnProperty.call(payload, 'code')) {
    return payload
  }

  const businessCode = Number(payload.code)
  if (businessCode !== 200) {
    throw new Error(resolveErrorMessage(payload, 'Request failed'))
  }

  return Object.prototype.hasOwnProperty.call(payload, 'data') ? payload.data : payload
}

const postAuthJson = async (path, body) => {
  const response = await fetch(buildAuthUrl(path), {
    method: 'POST',
    headers: buildAuthHeaders({ withJsonBody: true }),
    body: JSON.stringify(body)
  })

  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`
    throw new Error(resolveErrorMessage(payload, fallbackMessage))
  }

  return unwrapBusinessPayload(payload)
}

const putAuthJson = async (path, body) => {
  const response = await fetch(buildAuthUrl(path), {
    method: 'PUT',
    headers: buildAuthHeaders({ withJsonBody: true }),
    body: JSON.stringify(body)
  })

  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`
    throw new Error(resolveErrorMessage(payload, fallbackMessage))
  }

  return unwrapBusinessPayload(payload)
}

const getAuthJson = async (path) => {
  const response = await fetch(buildAuthUrl(path), {
    method: 'GET',
    headers: buildAuthHeaders()
  })

  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    const fallbackMessage = `Request failed with status ${response.status}`
    throw new Error(resolveErrorMessage(payload, fallbackMessage))
  }

  return unwrapBusinessPayload(payload)
}

export const registerUser = (registerPayload) => postAuthJson('/api/user/register', registerPayload)

export const loginUser = (loginPayload) => postAuthJson('/api/user/login', loginPayload)

export const sendEmailCode = (payload) => postAuthJson('/api/user/send-email-code', payload)

export const loginByEmailCode = (payload) => postAuthJson('/api/user/login-by-email', payload)

export const getUserInfo = () => getAuthJson('/api/user/info')

export const updateUserInfo = (payload) => putAuthJson('/api/user/update', payload)

export const updateUserPassword = (payload) => putAuthJson('/api/user/password', payload)
