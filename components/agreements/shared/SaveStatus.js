'use client'

// Inline save status indicator.
// status: 'idle' | 'saving' | 'saved' | 'error'
export default function SaveStatus({ status, error }) {
  if (!status || status === 'idle') return null

  const map = {
    saving: { text: 'Saving…', color: 'var(--s600)', bg: 'var(--s50)' },
    saved: { text: '✓ Saved', color: 'var(--success)', bg: '#E7FAF1' },
    error: { text: error || '⚠ Save failed', color: 'var(--danger)', bg: '#FDEBEB' },
  }
  const s = map[status]
  if (!s) return null

  return (
    <span style={{
      display: 'inline-block',
      padding: '4px 10px',
      borderRadius: '999px',
      fontSize: '0.75rem',
      fontWeight: 600,
      color: s.color,
      background: s.bg,
    }}>{s.text}</span>
  )
}
