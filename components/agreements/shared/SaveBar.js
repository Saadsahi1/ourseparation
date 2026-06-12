'use client'
import { useState } from 'react'

// SaveBar
// -------
// Sticky strip rendered at the top of any tab that uses buffered field
// edits. Reads a `useDirtyRegistry()` and exposes:
//
//   - while dirty:  "● Unsaved changes" + [Discard] + [Save Page]
//   - mid-save:     "Saving..." (Save button busy)
//   - just saved:   "✓ Saved" (auto-fades after a moment)
//   - idle clean:   nothing rendered
//
// Tabs render this above their content:
//
//   <SaveBar registry={registry} />
//   ...tab content...
export default function SaveBar({ registry, label = 'Save Page' }) {
  const [recentlySaved, setRecentlySaved] = useState(false)

  if (!registry) return null
  const { isDirty, isSaving, flushAll, discardAll } = registry

  const handleSave = async () => {
    await flushAll()
    setRecentlySaved(true)
    // Auto-clear the "Saved" message after a beat so the bar disappears
    // again until the next edit.
    setTimeout(() => setRecentlySaved(false), 1800)
  }

  const handleDiscard = () => {
    if (!confirm('Discard your changes on this tab?')) return
    discardAll()
  }

  // Nothing to show — clean idle state.
  if (!isDirty && !recentlySaved) return null

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 5,
      background: isDirty ? '#FFF8E1' : '#E7FAF1',
      border: '1px solid',
      borderColor: isDirty ? '#F0A500' : '#A8E5C7',
      borderRadius: 'var(--rs)',
      padding: '10px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      boxShadow: 'var(--sh-xs)',
    }}>
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: isDirty ? '#8A6A00' : '#1A8F62', display: 'flex', alignItems: 'center', gap: '8px' }}>
        {isDirty ? (
          <>
            <span style={{
              display: 'inline-block', width: '10px', height: '10px',
              background: '#F0A500', borderRadius: '50%',
            }} />
            Unsaved changes on this tab
          </>
        ) : (
          <>
            <span style={{ fontWeight: 700 }}>✓</span> Saved
          </>
        )}
      </div>
      {isDirty && (
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isSaving}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--s600)' }}
          >
            Discard
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="btn btn-primary btn-sm"
          >
            {isSaving ? 'Saving…' : label}
          </button>
        </div>
      )}
    </div>
  )
}
