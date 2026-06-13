'use client'
import { useState, useEffect } from 'react'
import { useRouter, useSearchParams, usePathname } from 'next/navigation'
import CompletionBadge from './shared/CompletionBadge'

const TABS = [
  { key: 'info',            label: 'Info',            icon: '👤', completionKey: 'info' },
  { key: 'parenting',       label: 'Parenting',       icon: '👶', completionKey: 'parenting' },
  { key: 'property',        label: 'Property',        icon: '🏠', completionKey: 'property' },
  { key: 'income',          label: 'Income Docs',     icon: '📄', completionKey: 'income' },
  { key: 'child_support',   label: 'Child Support',   icon: '💵', completionKey: 'child_support' },
  { key: 'spousal_support', label: 'Spousal Support', icon: '❤',  completionKey: 'spousal_support' },
  { key: 'additional',      label: 'Additional Terms',icon: '✓',  completionKey: 'additional' },
  { key: 'preview',         label: 'Agreement',       icon: '📜', completionKey: null },
  { key: 'signatures',      label: 'Signatures',      icon: '✎',  completionKey: null },
]

// Compute completion status of a tab from agreement.section_completion JSONB.
function computeStatus(tab, completion) {
  if (!tab.completionKey) return 'not_started'
  const val = completion?.[tab.completionKey]
  if (val == null) return 'not_started'
  if (typeof val === 'boolean') return val ? 'complete' : 'not_started'
  if (typeof val === 'object') {
    const vals = Object.values(val)
    if (vals.every(Boolean)) return 'complete'
    if (vals.some(Boolean)) return 'in_progress'
    return 'not_started'
  }
  return 'not_started'
}

export default function AgreementTabs({ activeTab, completion, agreementLabel, onLabelChange, guardNavigation }) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const pathname = usePathname()
  const [editingLabel, setEditingLabel] = useState(false)
  const [tempLabel, setTempLabel] = useState(agreementLabel || 'Untitled Agreement')

  useEffect(() => { setTempLabel(agreementLabel || 'Untitled Agreement') }, [agreementLabel])

  const tabHref = (tabKey) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set('tab', tabKey)
    return `${pathname}?${params.toString()}`
  }

  // guardNavigation: when the current tab has buffered edits, ask the user
  // to confirm before discarding them. Editor page supplies this; if it
  // returns false, navigation is aborted.
  const handleTabClick = (e, tabKey) => {
    if (tabKey === activeTab) {
      e.preventDefault()
      return
    }
    if (guardNavigation && !guardNavigation()) e.preventDefault()
  }

  const navigateBackToList = () => {
    if (guardNavigation && !guardNavigation()) return
    router.push('/agreements')
  }

  return (
    <div style={{
      background: '#fff',
      borderBottom: '1px solid var(--border)',
      position: 'sticky', top: 0, zIndex: 10,
    }}>
      {/* Top bar with label */}
      <div style={{
        maxWidth: '1300px', margin: '0 auto', padding: '14px 24px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button
            type="button"
            onClick={navigateBackToList}
            className="btn btn-ghost btn-sm"
            style={{ fontSize: '0.85rem' }}
          >← Back</button>
          {editingLabel ? (
            <input
              type="text"
              value={tempLabel}
              onChange={(e) => setTempLabel(e.target.value)}
              onBlur={() => {
                setEditingLabel(false)
                if (tempLabel !== agreementLabel) onLabelChange && onLabelChange(tempLabel)
              }}
              onKeyDown={(e) => { if (e.key === 'Enter') e.target.blur() }}
              autoFocus
              style={{
                fontSize: '1.1rem', fontWeight: 600, padding: '6px 10px',
                border: '1px solid var(--v)', borderRadius: 'var(--rs)', outline: 'none',
                minWidth: '280px',
              }}
            />
          ) : (
            <h2
              onClick={() => setEditingLabel(true)}
              style={{
                margin: 0, fontSize: '1.1rem', fontWeight: 600, color: 'var(--s900)',
                cursor: 'text', padding: '6px 10px', borderRadius: 'var(--rs)',
              }}
              title="Click to rename"
            >{agreementLabel || 'Untitled Agreement'}</h2>
          )}
        </div>
      </div>

      {/* Tab strip */}
      <div style={{ maxWidth: '1300px', margin: '0 auto', overflowX: 'auto' }}>
        <div style={{
          display: 'flex',
          gap: '4px',
          padding: '0 24px',
          minWidth: 'max-content',
        }}>
          {TABS.map((t) => {
            const isActive = activeTab === t.key
            const status = computeStatus(t, completion)
            return (
              <a
                key={t.key}
                href={tabHref(t.key)}
                onClick={(e) => handleTabClick(e, t.key)}
                style={{
                  padding: '12px 16px',
                  background: isActive ? 'var(--vx)' : 'transparent',
                  borderTop: 'none', borderLeft: 'none', borderRight: 'none',
                  borderBottom: isActive ? '2px solid var(--v)' : '2px solid transparent',
                  color: isActive ? 'var(--v)' : 'var(--s600)',
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px',
                  whiteSpace: 'nowrap',
                  textDecoration: 'none',
                  transition: 'all 120ms',
                }}
              >
                <CompletionBadge status={status} />
                <span style={{ marginRight: '2px' }}>{t.icon}</span>
                {t.label}
              </a>
            )
          })}
        </div>
      </div>
    </div>
  )
}

export { TABS }
