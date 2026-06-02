'use client'
import { useState, useEffect, useCallback, useRef } from 'react'
import api from '@/lib/apiClient'

// Loads the full agreement bundle (agreement + all related rows).
// Provides a unified `save(section, payload, opts)` helper for tabs.
//
// Performance design — autosave latency:
//   Old behavior: every save() called refresh() synchronously, which
//   refetches a 17-query bundle. Rapid typing (5 fields blurring in 2
//   seconds) triggered 5 sequential 1.4s refreshes — the editor felt
//   sluggish.
//   New behavior: optimistic merge for known shapes + debounced refresh.
//   The local bundle state is patched IMMEDIATELY from the save response,
//   and a single full bundle refresh is scheduled 800 ms after the LAST
//   save. Bursts of rapid edits collapse to one network round-trip for
//   reconciliation. The user sees their change immediately; cross-tab
//   completion indicators update on the same debounce.
export default function useAgreementBundle(agreementId) {
  const [bundle, setBundle] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [saveStatus, setSaveStatus] = useState('idle')

  // Holds the pending debounced-refresh timer ID, if any.
  const refreshTimer = useRef(null)
  // Tracks whether the component is still mounted, so we don't setState
  // after unmount.
  const mounted = useRef(true)
  useEffect(() => () => {
    mounted.current = false
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
  }, [])

  const refresh = useCallback(async () => {
    if (!agreementId) return
    try {
      const res = await api.get(`/api/agreements/${agreementId}/bundle`)
      if (!res.ok) {
        const j = await res.json().catch(() => ({}))
        throw new Error(j.error || `Failed to load (${res.status})`)
      }
      const data = await res.json()
      if (!mounted.current) return
      setBundle(data)
      setError(null)
    } catch (e) {
      if (mounted.current) setError(e.message)
    } finally {
      if (mounted.current) setLoading(false)
    }
  }, [agreementId])

  useEffect(() => { refresh() }, [refresh])

  // Schedule a single full-bundle refresh; resets any pending timer.
  const scheduleRefresh = useCallback((delayMs = 800) => {
    if (refreshTimer.current) clearTimeout(refreshTimer.current)
    refreshTimer.current = setTimeout(() => {
      refreshTimer.current = null
      refresh()
    }, delayMs)
  }, [refresh])

  // Apply an optimistic patch to the local bundle so the user sees their
  // change immediately. Returns the merged bundle or null if we don't know
  // how to merge this particular (section, method) combo — in which case
  // we just rely on the debounced refresh to reconcile.
  const optimisticMerge = (prev, section, body, opts, responseData) => {
    if (!prev) return prev
    const method = (opts.method || 'PUT').toUpperCase()
    const pathSuffix = opts.pathSuffix || ''
    const childIdMatch = pathSuffix.match(/^\/([^/]+)$/)
    const childId = childIdMatch?.[1]

    // PUT /api/agreements/[id] -> top-level agreement row
    if (section === 'agreement' && method === 'PUT') {
      const patched = responseData && responseData.id ? responseData : { ...prev.agreement, ...(body || {}) }
      return { ...prev, agreement: { ...prev.agreement, ...patched } }
    }

    // List-shaped sub-resources (POST appends, PUT/[id] replaces, DELETE/[id] removes)
    const listKeyByEndpoint = {
      'children':           'children',
      'prev-children':      'previousChildren',
      'special-clauses':    'specialClauses',
      'property':           'propertyItems',
      'section7':           'section7Expenses',
      'retroactive':        'retroactivePeriods',  // also retroactiveExpenses but kind=expense is harder
      'income-docs':        'incomeDocuments',
    }
    const listKey = listKeyByEndpoint[section]
    if (listKey) {
      const list = Array.isArray(prev[listKey]) ? prev[listKey] : []
      if (method === 'POST' && responseData?.id) {
        return { ...prev, [listKey]: [...list, responseData] }
      }
      if (method === 'PUT' && childId && responseData?.id) {
        return { ...prev, [listKey]: list.map((it) => (it.id === childId ? { ...it, ...responseData } : it)) }
      }
      if (method === 'DELETE' && childId) {
        return { ...prev, [listKey]: list.filter((it) => it.id !== childId) }
      }
    }

    // Singleton sub-resources (always PUT — replaces the entire row).
    const singletonKeyByEndpoint = {
      'parenting-terms':     'parentingTerms',
      'parenting-schedules': 'parentingSchedule',
      'property-division':   'propertyDivisionTerms',
      'support':             'supportCalculations',
      'additional-terms':    'additionalTerms',
    }
    const sKey = singletonKeyByEndpoint[section]
    if (sKey && method === 'PUT' && responseData) {
      return { ...prev, [sKey]: { ...(prev[sKey] || {}), ...responseData } }
    }

    // Holiday upsert returns the row; merge into the holidays array.
    if (section === 'holidays' && method === 'PUT' && responseData?.holiday_name) {
      const list = Array.isArray(prev.holidays) ? prev.holidays : []
      const idx = list.findIndex((h) => h.holiday_name === responseData.holiday_name)
      const next = idx >= 0
        ? list.map((h, i) => (i === idx ? responseData : h))
        : [...list, responseData]
      return { ...prev, holidays: next }
    }

    return null  // unknown shape — fall back to scheduled refresh
  }

  // Generic save helper. Saves to a section endpoint and applies an
  // optimistic patch + schedules a single debounced refresh.
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

      // Optimistic merge into local bundle so the UI updates instantly.
      setBundle((prev) => optimisticMerge(prev, section, body, opts, data) || prev)
      setSaveStatus('saved')
      // Reconcile with server state on a debounce so rapid saves don't
      // each trigger their own 17-query refresh.
      scheduleRefresh(800)
      setTimeout(() => mounted.current && setSaveStatus('idle'), 1800)
      return data
    } catch (e) {
      console.error('save error:', e)
      if (mounted.current) {
        setSaveStatus('error')
        setError(e.message)
      }
      return null
    }
  }, [agreementId, scheduleRefresh])

  return { bundle, loading, error, saveStatus, save, refresh }
}
