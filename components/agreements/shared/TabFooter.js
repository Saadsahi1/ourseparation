'use client'
import { useSearchParams, usePathname } from 'next/navigation'
import { TABS } from '../AgreementTabs'

// Footer with Previous / Next buttons. Mirrors the same router.push +
// useSearchParams flow as AgreementTabs so a click here advances the tab
// in the same way as the top strip.
export default function TabFooter({ activeTab, guardNavigation }) {
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const idx = TABS.findIndex((t) => t.key === activeTab)
  if (idx === -1) return null

  const prev = idx > 0 ? TABS[idx - 1] : null
  const next = idx < TABS.length - 1 ? TABS[idx + 1] : null

  const tabHref = (tabKey) => {
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('tab', tabKey)
    return `${pathname}?${params.toString()}`
  }

  const handleClick = (e, tabKey) => {
    if (!tabKey || (guardNavigation && !guardNavigation())) {
      e.preventDefault()
    }
  }

  return (
    <div style={{
      marginTop: '32px',
      padding: '20px 0',
      borderTop: '1px solid var(--border)',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
    }}>
      <div>
        {prev ? (
          <a href={tabHref(prev.key)} onClick={(e) => handleClick(e, prev.key)} className="btn btn-outline">
            ← {prev.label}
          </a>
        ) : <span />}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--s600)' }}>
        Step {idx + 1} of {TABS.length}
      </div>
      <div>
        {next ? (
          <a href={tabHref(next.key)} onClick={(e) => handleClick(e, next.key)} className="btn btn-primary">
            {next.label} →
          </a>
        ) : <span />}
      </div>
    </div>
  )
}
