'use client'
import { useState, useEffect, useCallback } from 'react'
import api from '@/lib/apiClient'

// Loads the full agreement bundle (agreement + all related rows).
// Provides a unified `save(section, payload)` helper for tabs to use.
export default function useAgreementBundle(agreementId) {
  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle')

  const refresh = useCallback(async () => {
    if (!agreementId) return
    try {
      const res = await api.get(`/api/agreements/${agreementId}/bundle`)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Failed to load (${res.status})`)
      }
      const data = await res.json()
      setBundle(data)
      setError(null)
    } catch (e) {
      setError(e.message)
    } finally {
      setLoading(false)
    }
  }, [agreementId])

  useEffect(() => { refresh() }, [refresh])

  // Generic save helper. Saves to a section endpoint and refreshes the bundle.
  // section: which sub-resource ('agreement', 'children', 'parenting-terms', etc.)
  // method: 'PUT' (default), 'POST', 'DELETE'
  // pathSuffix: optional path after section (e.g. `/${childId}`)
  // body: payload for the request
  const save = useCallback(async (section, body, opts = {}) => {
    if (!agreementId) return null
    const { method = 'PUT', pathSuffix = '' } = opts
    setSaveStatus('saving')
    try {
      const url = section === 'agreement'
        ? `/api/agreements/${agreementId}${pathSuffix}`
        : `/api/agreements/${agreementId}/${section}${pathSuffix}`
      let res
      const m = method.toUpperCase()
      if (m === 'GET') res = await api.get(url)
      else if (m === 'POST') res = await api.post(url, body || {})
      else if (m === 'PUT') res = await api.put(url, body || {})
      else if (m === 'DELETE') res = await api.delete(url)
      else throw new Error(`Unsupported method ${m}`)

      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Save failed (${res.status})`)
      }
      const data = await res.json().catch(() => ({}))
      setSaveStatus('saved')
      refresh()
      setTimeout(() => setSaveStatus('idle'), 1800)
      return data
    } catch (e) {
      console.error('save error:', e)
      setSaveStatus('error')
      setError(e.message)
      return null
    }
  }, [agreementId, refresh])

  return { bundle, loading, error, saveStatus, save, refresh }
}
