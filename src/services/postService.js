import { getStoredAuthToken } from './authService'

const POST_API_BASE_URL = (
  import.meta.env.VITE_POST_API_BASE_URL ||
  import.meta.env.VITE_TENNIS_API_BASE_URL ||
  'http://47.238.94.176:8081'
).replace(/\/+$/, '')

const buildApiUrl = (path) => {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  return `${POST_API_BASE_URL}${normalizedPath}`
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

const buildHeaders = ({ withJsonBody = false } = {}) => {
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

const normalizePost = (post) => {
  const tags = String(post?.tags || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean)

  return {
    id: String(post?.id || ''),
    title: String(post?.title || ''),
    content: String(post?.content || ''),
    tags,
    viewCount: Number(post?.viewCount || 0),
    likeCount: Number(post?.likeCount || 0),
    commentCount: Number(post?.commentCount || 0),
    createTime: String(post?.createTime || '')
  }
}

export const fetchForumPosts = async () => {
  const response = await fetch(buildApiUrl('/api/post/list'), {
    method: 'GET',
    headers: buildHeaders()
  })
  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(resolveErrorMessage(payload, `请求失败（${response.status}）`))
  }

  if (Number(payload?.code) !== 200) {
    throw new Error(resolveErrorMessage(payload, '帖子列表加载失败'))
  }

  const records = Array.isArray(payload?.data?.records) ? payload.data.records : []
  return records
    .map((item) => normalizePost(item))
    .sort((a, b) => new Date(b.createTime).getTime() - new Date(a.createTime).getTime())
}

export const fetchForumPostById = async (id) => {
  const targetId = String(id || '').trim()
  if (!targetId) return null
  const posts = await fetchForumPosts()
  return posts.find((post) => String(post.id) === targetId) || null
}

export const publishForumPost = async ({ title, content, tags }) => {
  const response = await fetch(buildApiUrl('/api/post/publish'), {
    method: 'POST',
    headers: buildHeaders({ withJsonBody: true }),
    body: JSON.stringify({
      title: String(title || '').trim(),
      content: String(content || '').trim(),
      tags: String(tags || '').trim()
    })
  })

  const payload = await parseJsonSafely(response)

  if (!response.ok) {
    throw new Error(resolveErrorMessage(payload, `发布失败（${response.status}）`))
  }

  if (payload && typeof payload === 'object' && Object.prototype.hasOwnProperty.call(payload, 'code')) {
    if (Number(payload.code) !== 200) {
      throw new Error(resolveErrorMessage(payload, '发布失败，请稍后重试'))
    }
  }

  return payload
}
