'use client'
import { useState } from 'react'
import SubTabs from '../shared/SubTabs'
import DecisionMaking from './DecisionMaking'
import Schedule from './Schedule'
import Holidays from './Holidays'
import SpecialClauses from './SpecialClauses'

const SUB_TABS = [
  { key: 'decision', label: 'Decision-Making' },
  { key: 'schedule', label: 'Schedule' },
  { key: 'holiday', label: 'Holidays' },
  { key: 'special', label: 'Special Clauses' },
]

export default function ParentingTab({ bundle, save, user, party1Name, party2Name }) {
  const [sub, setSub] = useState('decision')

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
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />
      {sub === 'decision' && <DecisionMaking bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />}
      {sub === 'schedule' && <Schedule bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />}
      {sub === 'holiday' && <Holidays bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} user={user} />}
      {sub === 'special' && <SpecialClauses bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />}
    </div>
  )
}
