'use client'

// Horizontal tab-strip sub-nav.
// tabs: [{key, label, status?}]
//
// Designed so users can immediately see there are multiple sub-sections to
// click through. Each tab shows a number badge ("1 of 4") and is styled as
// a button with hover, so it doesn't blend into the page like the older
// pill-on-grey variant did.
export default function SubTabs({ tabs, active, onChange }) {
  return (
    <div style={{ marginBottom: '20px' }}>
      <div style={{
        fontSize: '0.72rem',
        fontWeight: 700,
        color: 'var(--s600)',
        textTransform: 'uppercase',
        letterSpacing: '0.06em',
        marginBottom: '8px',
      }}>
        Sub-sections — click to switch ({tabs.length} total)
      </div>
      <div style={{
        display: 'flex',
        gap: '8px',
        padding: '6px',
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--rs)',
        flexWrap: 'wrap',
        boxShadow: 'var(--sh-xs)',
      }}>
        {tabs.map((t, i) => {
          const isActive = active === t.key
          return (
            <button
              key={t.key}
              onClick={() => onChange(t.key)}
              style={{
                padding: '10px 16px',
                background: isActive ? 'var(--v)' : 'var(--s50)',
                border: isActive ? '1px solid var(--v)' : '1px solid var(--border)',
                borderRadius: 'var(--rs)',
                color: isActive ? '#fff' : 'var(--s800)',
                fontWeight: isActive ? 700 : 600,
                fontSize: '0.88rem',
                cursor: 'pointer',
                transition: 'all 120ms',
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--vx)'
                  e.currentTarget.style.borderColor = 'var(--vc)'
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.background = 'var(--s50)'
                  e.currentTarget.style.borderColor = 'var(--border)'
                }
              }}
            >
              <span style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: '20px',
                height: '20px',
                borderRadius: '50%',
                fontSize: '0.72rem',
                fontWeight: 700,
                background: isActive ? 'rgba(255,255,255,0.25)' : 'var(--vx)',
                color: isActive ? '#fff' : 'var(--v)',
              }}>{i + 1}</span>
              {t.label}
            </button>
          )
        })}
      </div>
    </div>
  )
}
