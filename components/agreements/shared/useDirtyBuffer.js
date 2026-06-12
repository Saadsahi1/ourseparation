'use client'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

// useDirtyBuffer
// --------------
// Buffers field edits in local state instead of saving them on every blur.
// Used to implement explicit per-tab "Save Page" buttons: typing into a
// FormField updates the buffer immediately; the server only sees the change
// when the user clicks Save.
//
// Usage in a tab component:
//
//     const buf = useDirtyBuffer({
//       serverValues: bundle.agreement,
//       onFlush: (patch) => save('agreement', patch, { method: 'PUT' }),
//     })
//
//     <FormField
//       value={buf.getValue('party1_first_name')}
//       onSave={(v) => buf.setValue('party1_first_name', v)}
//     />
//
// And in the tab's "Save Page" / "Discard" controls:
//
//     <SaveBar registry={...} />
//
// The buffer is single-target: every key written through setValue gets sent
// to the same onFlush callback. Tabs that talk to multiple endpoints create
// multiple buffers (one per endpoint) and pass them all to the SaveBar.
//
// Sync rule: when serverValues prop updates AND buffer is NOT dirty, the
// buffer adopts the new server state. While dirty, prop updates are ignored
// so an in-flight bundle refresh can't clobber a user's in-progress typing.
export default function useDirtyBuffer({ serverValues, onFlush, label }) {
  const [localOverrides, setLocalOverrides] = useState({})
  const [isDirty, setIsDirty] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const dirtyKeysRef = useRef(new Set())
  const onFlushRef = useRef(onFlush)
  useEffect(() => { onFlushRef.current = onFlush }, [onFlush])

  // When server state changes and we have no pending edits, accept it.
  // This lets a successful save -> bundle refresh propagate naturally.
  // While dirty we deliberately ignore server updates so the user's typing
  // can't be clobbered.
  const serverRef = useRef(serverValues || {})
  useEffect(() => {
    serverRef.current = serverValues || {}
  }, [serverValues])

  const getValue = useCallback((key) => {
    if (dirtyKeysRef.current.has(key)) return localOverrides[key]
    return serverValues?.[key]
  }, [localOverrides, serverValues])

  const setValue = useCallback((key, value) => {
    setLocalOverrides((prev) => ({ ...prev, [key]: value }))
    dirtyKeysRef.current.add(key)
    setIsDirty(true)
  }, [])

  const reset = useCallback(() => {
    setLocalOverrides({})
    dirtyKeysRef.current.clear()
    setIsDirty(false)
  }, [])

  const flush = useCallback(async () => {
    if (!isDirty || !onFlushRef.current) return { saved: false }
    const patch = {}
    for (const k of dirtyKeysRef.current) patch[k] = localOverrides[k]
    setIsSaving(true)
    try {
      await onFlushRef.current(patch)
      // Accept what we just saved as the new server baseline.
      serverRef.current = { ...serverRef.current, ...patch }
      setLocalOverrides({})
      dirtyKeysRef.current.clear()
      setIsDirty(false)
      return { saved: true, patch }
    } finally {
      setIsSaving(false)
    }
  }, [isDirty, localOverrides])

  // Merged view: server state + dirty overrides. Convenient when a
  // component is already shaped around `data.field` reads — replace `data`
  // with `buf.values` for instant UI feedback on buffered edits.
  const values = useMemo(() => {
    const base = serverValues || {}
    const merged = { ...base }
    for (const k of dirtyKeysRef.current) merged[k] = localOverrides[k]
    return merged
  }, [serverValues, localOverrides])

  return useMemo(
    () => ({ getValue, setValue, reset, flush, isDirty, isSaving, label, values }),
    [getValue, setValue, reset, flush, isDirty, isSaving, label, values]
  )
}

// useDirtyRegistry
// ----------------
// A tab-level container for multiple buffers. Each buffer registers itself
// (call .register(buf)) and the registry exposes combined isDirty/isSaving
// state, plus flushAll() and discardAll() helpers used by the SaveBar.
//
// Tabs that need multiple endpoints (e.g. Tab 5 with singleton support fields
// AND per-row Section 7 expense edits) create one buffer per logical target
// and pass them all into a single registry.
export function useDirtyRegistry() {
  const [bufs, setBufs] = useState([])

  const register = useCallback((buf) => {
    setBufs((prev) => prev.includes(buf) ? prev : [...prev, buf])
    return () => setBufs((prev) => prev.filter((b) => b !== buf))
  }, [])

  const isDirty = bufs.some((b) => b.isDirty)
  const isSaving = bufs.some((b) => b.isSaving)

  const flushAll = useCallback(async () => {
    const results = []
    for (const b of bufs) {
      if (b.isDirty) results.push(await b.flush())
    }
    return results
  }, [bufs])

  const discardAll = useCallback(() => {
    for (const b of bufs) b.reset()
  }, [bufs])

  return useMemo(
    () => ({ register, bufs, isDirty, isSaving, flushAll, discardAll }),
    [register, bufs, isDirty, isSaving, flushAll, discardAll]
  )
}

// Tiny helper that wires a buffer into a registry on mount.
export function useRegisterBuffer(registry, buffer) {
  useEffect(() => {
    if (!registry || !buffer) return
    return registry.register(buffer)
  }, [registry, buffer])
}
