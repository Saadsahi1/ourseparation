'use client'

// Horizontal bar showing the split of parenting time between Party 1 and Party 2.
export default function ParentingTimeMeter({ party1Percent, party2Percent, party1Name, party2Name }) {
  const p1 = Math.max(0, Math.min(100, Number(party1Percent) || 0))
  const p2 = Math.max(0, Math.min(100, Number(party2Percent) || (100 - p1)))

  // Warning if section-9 (shared) — both should be >= 40%
  const isShared = p1 >= 40 && p2 >= 40

  return (
    <div style={{
      background: 'var(--s50)',
      border: '1px solid var(--border)',
      borderRadius: 'var(--rs)',
      padding: '16px',
      marginTop: '16px',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px', fontSize: '0.82rem', fontWeight: 600 }}>
        <span style={{ color: 'var(--v)' }}>{party1Name} — {p1}%</span>
        <span style={{ color: 'var(--success)' }}>{party2Name} — {p2}%</span>
      </div>
      <div style={{
        display: 'flex',
        height: '24px',
        borderRadius: '12px',
        overflow: 'hidden',
        background: 'var(--s100)',
        border: '1px solid var(--border)',
      }}>
        <div style={{
          width: `${p1}%`,
          background: 'var(--v)',
          transition: 'width 200ms',
        }} />
        <div style={{
          width: `${p2}%`,
          background: 'var(--success)',
          transition: 'width 200ms',
        }} />
      </div>
      <p style={{ marginTop: '10px', marginBottom: 0, fontSize: '0.78rem', color: 'var(--s600)' }}>
        {isShared
          ? '🟢 Shared parenting (both parties have 40%+) — Section 9 of the Child Support Guidelines applies.'
          : 'Primary residence arrangement — Section 3 of the Child Support Guidelines applies.'}
      </p>
    </div>
  )
}
