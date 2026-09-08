import { getStoredAuthToken } from './authService'

const CHAT_API_BASE_URL = (import.meta.env.VITE_TENNIS_CHAT_API_BASE_URL || 'http://47.238.94.176:8081').replace(
  /\/+$/,
  ''
)
const CHAT_EMPTY_MESSAGE_RE =
  /(暂无(聊天|消息|私信)记录|没有(聊天|消息|私信)记录|聊天记录为空|消息记录为空|no\s+(chat|message|messages|records?)|no\s+conversation|empty|not\s+found)/i

const buildChatUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${CHAT_API_BASE_URL}${normalizedPath}`
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

const isEmptyChatError = (error) => {
  const message = String(error?.message || '').trim()
  if (!message) return false
  return CHAT_EMPTY_MESSAGE_RE.test(message)
}

const normalizeChatList = (data) => {
  if (Array.isArray(data)) return data
  if (Array.isArray(data?.records)) return data.records
  if (Array.isArray(data?.items)) return data.items
  if (Array.isArray(data?.data?.records)) return data.data.records
  if (Array.isArray(data?.data?.items)) return data.data.items
  if (Array.isArray(data?.data)) return data.data
  return []
}

const buildChatHeaders = ({ withJsonBody = false } = {}) => {
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

const requestChatApi = async (path, { method = 'GET', body } = {}) => {
  const response = await fetch(buildChatUrl(path), {
    method,
    headers: buildChatHeaders({ withJsonBody: Boolean(body) }),
    body: body ? JSON.stringify(body) : undefined
  })
  const payload = await parseJsonSafely(response)
  if (!response.ok) {
    throw new Error(resolveErrorMessage(payload, `Request failed with status ${response.status}`))
  }
  if (Number(payload?.code) !== 200) {
    throw new Error(resolveErrorMessage(payload, 'Request failed'))
  }
  return payload?.data
}

export const sendChatMessage = async ({ receiverId, content }) => {
  const normalizedContent = String(content || '').trim()
  if (!receiverId) {
    throw new Error('receiverId is required')
  }
  if (!normalizedContent) {
    throw new Error('content is required')
  }
  return requestChatApi('/api/chat/send', {
    method: 'POST',
    body: {
      receiverId,
      content: normalizedContent
    }
  })
}

export const fetchAllChatMessages = async () => {
  let data = null
  try {
    data = await requestChatApi('/api/chat/all')
  } catch (error) {
    if (isEmptyChatError(error)) {
      return {
        records: [],
        total: 0,
        size: 0,
        current: 1,
        pages: 0
      }
    }
    throw error
  }
  const records = normalizeChatList(data)
  return {
    records,
    total: Number(data?.total || data?.data?.total || records.length || 0),
    size: Number(data?.size || data?.data?.size || records.length || 0),
    current: Number(data?.current || data?.data?.current || 1),
    pages: Number(data?.pages || data?.data?.pages || (records.length ? 1 : 0))
  }
}
