'use client'
import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import api from '@/lib/apiClient'

const Ctx = createContext(null)

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const { access } = api.getTokens()
    if (!access) { setLoading(false); return }
    api.get('/api/auth/me')
      .then(r => r?.ok ? r.json() : null)
      .then(d => { if (d?.user) setUser(d.user) })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback(async (email, password) => {
    const res = await api.post('/api/auth/login', { email, password })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Login failed')
    api.setTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
    return data.user
  }, [])

  const register = useCallback(async (email, password, firstName, lastName) => {
    const res = await api.post('/api/auth/register', { email, password, firstName, lastName })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Registration failed')
    api.setTokens(data.accessToken, data.refreshToken)
    setUser(data.user)
    return data.user
  }, [])

  const logout = useCallback(async () => {
    const { refresh } = api.getTokens()
    await api.post('/api/auth/logout', { refreshToken: refresh }).catch(() => {})
    api.clearTokens()
    setUser(null)
    router.push('/')
  }, [router])

  return (
    <Ctx.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </Ctx.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useAuth must be inside AuthProvider')
  return ctx
}
