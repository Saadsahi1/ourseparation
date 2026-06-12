'use client'
import { useRouter, useSearchParams } from 'next/navigation'
import { TABS } from '../AgreementTabs'

// Sticky-ish footer with Previous / Next buttons so users always have an
// obvious prompt to move forward through the tabs. Shown at the bottom of
// each tab's content area in the editor.
export default function TabFooter({ activeTab, guardNavigation }) {
  const router = useRouter()
  const searchParams = useSearchParams()

  const idx = TABS.findIndex((t) => t.key === activeTab)
  if (idx === -1) return null

  const prev = idx > 0 ? TABS[idx - 1] : null
  const next = idx < TABS.length - 1 ? TABS[idx + 1] : null

  const go = (tabKey) => {
    if (!tabKey) return
    if (guardNavigation && !guardNavigation()) return
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabKey)
    router.push(`?${params.toString()}`, { scroll: false })
    if (typeof window !== 'undefined') {
      window.scrollTo({ top: 0, behavior: 'smooth' })
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
          <button onClick={() => go(prev.key)} className="btn btn-outline">
            ← {prev.label}
          </button>
        ) : <span />}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--s600)' }}>
        Step {idx + 1} of {TABS.length}
      </div>
      <div>
        {next ? (
          <button onClick={() => go(next.key)} className="btn btn-primary">
            {next.label} →
          </button>
        ) : <span />}
      </div>
    </div>
  )
}
