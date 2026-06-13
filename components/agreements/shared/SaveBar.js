'use client'
import { useState } from 'react'

// SaveBar
// -------
// Sticky strip rendered at the top of any tab that uses buffered field
// edits. The strip is ALWAYS visible so users know where to save — when
// there's nothing to save, the Save Page button stays shadowed/disabled.
//
// States:
//   - dirty + ready:   amber strip, Save Page enabled
//   - dirty + invalid: amber strip, Save Page disabled (validation hint shown)
//   - saving:          Save button busy
//   - just saved:      green "Saved" strip
//   - idle clean:      neutral strip with disabled Save Page button
//
// Tabs render this above their content:
//
//   <SaveBar registry={registry} />
//   <SaveBar registry={registry} canSave={hasRequiredFields} invalidHint="Add Party 2's name to save" />
export default function SaveBar({ registry, label = 'Save Page', canSave = true, invalidHint = '' }) {
  const [recentlySaved, setRecentlySaved] = useState(false)

  if (!registry) return null
  const { isDirty, isSaving, flushAll, discardAll } = registry

  const handleSave = async () => {
    if (!canSave) return
    await flushAll()
    setRecentlySaved(true)
    setTimeout(() => setRecentlySaved(false), 1800)
  }

  const handleDiscard = () => {
    if (!confirm('Discard your changes on this tab?')) return
    discardAll()
  }

  const showSaved = !isDirty && recentlySaved
  const buttonDisabled = !isDirty || !canSave || isSaving

  // Visual state
  let bg = 'var(--s50)'
  let border = 'var(--border)'
  let labelColor = 'var(--s600)'
  let dotColor = 'var(--s300)'
  let message = 'No unsaved changes'

  if (showSaved) {
    bg = '#E7FAF1'; border = '#A8E5C7'; labelColor = '#1A8F62'
    message = '✓ Saved'
  } else if (isDirty && !canSave) {
    bg = '#FFF8E1'; border = '#F0A500'; labelColor = '#8A6A00'; dotColor = '#F0A500'
    message = invalidHint || 'Fill in required fields to save'
  } else if (isDirty) {
    bg = '#FFF8E1'; border = '#F0A500'; labelColor = '#8A6A00'; dotColor = '#F0A500'
    message = 'Unsaved changes on this tab'
  }

  return (
    <div style={{
      position: 'sticky',
      top: 0,
      zIndex: 5,
      background: bg,
      border: '1px solid',
      borderColor: border,
      borderRadius: 'var(--rs)',
      padding: '10px 16px',
      marginBottom: '16px',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      boxShadow: 'var(--sh-xs)',
      transition: 'background 150ms, border-color 150ms',
    }}>
      <div style={{ fontSize: '0.88rem', fontWeight: 600, color: labelColor, display: 'flex', alignItems: 'center', gap: '8px' }}>
        {!showSaved && (
          <span style={{
            display: 'inline-block', width: '10px', height: '10px',
            background: dotColor, borderRadius: '50%',
          }} />
        )}
        {message}
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        {isDirty && (
          <button
            type="button"
            onClick={handleDiscard}
            disabled={isSaving}
            className="btn btn-ghost btn-sm"
            style={{ color: 'var(--s600)' }}
          >
            Discard
          </button>
        )}
        <button
          type="button"
          onClick={handleSave}
          disabled={buttonDisabled}
          className="btn btn-primary btn-sm"
          style={{
            opacity: buttonDisabled ? 0.5 : 1,
            cursor: buttonDisabled ? 'not-allowed' : 'pointer',
            boxShadow: buttonDisabled ? 'none' : 'var(--sh-xs)',
          }}
          title={buttonDisabled && !canSave ? (invalidHint || 'Fill in required fields first') : ''}
        >
          {isSaving ? 'Saving…' : label}
        </button>
      </div>
    </div>
  )
}
