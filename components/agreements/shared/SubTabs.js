'use client'

// Horizontal pill-style sub-tab nav.
// tabs: [{key, label, status?}]
export default function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={{
      display: 'flex',
      gap: '6px',
      marginBottom: '24px',
      padding: '4px',
      background: 'var(--s50)',
      borderRadius: 'var(--rs)',
      flexWrap: 'wrap',
    }}>
      {tabs.map((t) => {
        const isActive = active === t.key
        return (
          <button
            key={t.key}
            onClick={() => onChange(t.key)}
            style={{
              padding: '8px 14px',
              background: isActive ? '#fff' : 'transparent',
              border: 'none',
              borderRadius: 'var(--rs)',
              color: isActive ? 'var(--v)' : 'var(--s600)',
              fontWeight: isActive ? 600 : 500,
              fontSize: '0.85rem',
              cursor: 'pointer',
              boxShadow: isActive ? 'var(--sh-xs)' : 'none',
              transition: 'all 120ms',
            }}
          >{t.label}</button>
        )
      })}
    </div>
  )
}
