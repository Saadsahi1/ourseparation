'use client'

const BASE = ''
const USER_KEY = 'authUser'

function getTokens() {
  if (typeof window === 'undefined') return {}
  return {
    access: localStorage.getItem('accessToken'),
    refresh: localStorage.getItem('refreshToken'),
  }
}

function setTokens(access, refresh) {
  if (access)  localStorage.setItem('accessToken', access)
  if (refresh) localStorage.setItem('refreshToken', refresh)
}

function clearTokens() {
  localStorage.removeItem('accessToken')
  localStorage.removeItem('refreshToken')
}

function getStoredUser() {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(USER_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

function setStoredUser(user) {
  if (typeof window === 'undefined') return
  if (!user) {
    localStorage.removeItem(USER_KEY)
    return
  }
  localStorage.setItem(USER_KEY, JSON.stringify(user))
}

function clearStoredUser() {
  if (typeof window === 'undefined') return
  localStorage.removeItem(USER_KEY)
}

async function refreshAccessToken() {
  const { refresh } = getTokens()
  if (!refresh) throw new Error('No refresh token')
  const res = await fetch(`${BASE}/api/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken: refresh }),
  })
  if (!res.ok) { clearTokens(); throw new Error('Session expired') }
  const data = await res.json()
  setTokens(data.accessToken, null)
  return data.accessToken
}

async function request(path, options = {}, retry = true) {
  const { access } = getTokens()
  const headers = { 'Content-Type': 'application/json', ...options.headers }
  if (access) headers['Authorization'] = `Bearer ${access}`

  const fetchOptions = { ...options, headers }
  if ((fetchOptions.method || 'GET').toUpperCase() === 'GET' && !fetchOptions.cache) {
    fetchOptions.cache = 'no-store'
  }

  const res = await fetch(`${BASE}${path}`, fetchOptions)

  if (res.status === 401 && retry) {
    const data = await res.json().catch(() => ({}))
    if (data.code === 'TOKEN_EXPIRED') {
      try {
        const newToken = await refreshAccessToken()
        return request(path, {
          ...options,
          headers: { ...headers, Authorization: `Bearer ${newToken}` },
        }, false)
      } catch {
        clearTokens()
        clearStoredUser()
        window.location.href = '/login'
        return
      }
    }
  }

  return res
}

export const api = {
  get:    (path) => request(path),
  post:   (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put:    (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: 'DELETE' }),
  setTokens,
  clearTokens,
  getTokens,
  getStoredUser,
  setStoredUser,
  clearStoredUser,
}

export default api
