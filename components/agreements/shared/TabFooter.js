'use client'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import { TABS } from '../AgreementTabs'

// Footer with Previous / Next buttons. Mirrors the same router.push +
// useSearchParams flow as AgreementTabs so a click here advances the tab
// in the same way as the top strip.
export default function TabFooter({ activeTab, guardNavigation }) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const idx = TABS.findIndex((t) => t.key === activeTab)
  if (idx === -1) return null

  const prev = idx > 0 ? TABS[idx - 1] : null
  const next = idx < TABS.length - 1 ? TABS[idx + 1] : null

  const go = (tabKey) => {
    if (!tabKey) return
    if (guardNavigation && !guardNavigation()) return
    const params = new URLSearchParams(searchParams?.toString() || '')
    params.set('tab', tabKey)
    // Push with the full pathname so Next.js treats this as the same route
    // segment and the editor's useSearchParams hook fires. Scroll to top
    // after the navigation commits so the user lands at the new tab's
    // header rather than the previous tab's footer position.
    router.push(`${pathname}?${params.toString()}`, { scroll: false })
    requestAnimationFrame(() => {
      window.scrollTo({ top: 0, behavior: 'auto' })
    })
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
          <button type="button" onClick={() => go(prev.key)} className="btn btn-outline">
            ← {prev.label}
          </button>
        ) : <span />}
      </div>
      <div style={{ fontSize: '0.82rem', color: 'var(--s600)' }}>
        Step {idx + 1} of {TABS.length}
      </div>
      <div>
        {next ? (
          <button type="button" onClick={() => go(next.key)} className="btn btn-primary">
            {next.label} →
          </button>
        ) : <span />}
      </div>
    </div>
  )
}
