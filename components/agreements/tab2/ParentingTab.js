'use client'
import { useState, useEffect } from 'react'
import SubTabs from '../shared/SubTabs'
import SaveBar from '../shared/SaveBar'
import DecisionMaking from './DecisionMaking'
import Schedule from './Schedule'
import Holidays from './Holidays'
import SpecialClauses from './SpecialClauses'
import { useDirtyRegistry } from '../shared/useDirtyBuffer'

const SUB_TABS = [
  { key: 'decision', label: 'Decision-Making' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'holiday', label: 'Holidays' },
  { key: 'special', label: 'Special Clauses' },
]

export default function ParentingTab({ bundle, save, user, party1Name, party2Name, registerDirty }) {
  const [sub, setSub] = useState('decision')

  // Tab-level dirty registry. DecisionMaking and Schedule sub-tabs register
  // their per-section buffers here so a single SaveBar at the top of the
  // tab can flush everything at once. Holidays + SpecialClauses keep
  // saving immediately (list-style ops, per design).
  const registry = useDirtyRegistry()
  useEffect(() => {
    if (registerDirty) registerDirty(registry.isDirty)
  }, [registry.isDirty, registerDirty])

  if ((bundle.children || []).length === 0) {
    return (
      <div style={{
        background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
        padding: '48px', textAlign: 'center', color: 'var(--s600)',
      }}>
        <h3 style={{ margin: 0, color: 'var(--s900)' }}>No Children Added Yet</h3>
        <p style={{ marginTop: '8px' }}>Add children in the Info tab to configure parenting arrangements.</p>
      </div>
    )
  }

  return (
    <div>
      <SaveBar registry={registry} />
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />
      {sub === 'decision' && (
        <DecisionMaking bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} registry={registry} />
      )}
      {sub === 'schedule' && (
        <Schedule bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} registry={registry} />
      )}
      {sub === 'holiday' && (
        <Holidays bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} user={user} />
      )}
      {sub === 'special' && (
        <SpecialClauses bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />
      )}
    </div>
  )
}
