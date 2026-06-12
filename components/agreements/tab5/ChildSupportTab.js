'use client'
import { useEffect, useState } from 'react'
import SubTabs from '../shared/SubTabs'
import MonthlySupport from './MonthlySupport'
import Section7Expenses from './Section7Expenses'
import RetroactiveSupport from './RetroactiveSupport'

const SUB_TABS = [
  { key: 'monthly', label: 'Monthly Support' },
  { key: 'section7', label: 'Section 7 Expenses' },
  { key: 'retroactive', label: 'Retroactive Support' },
]

// Tab 5 keeps the existing immediate-save behaviour intentionally:
//
//   - MonthlySupport has a derived-value useEffect (table amounts + computed
//     payor + amount) that syncs to support_calculations every time the
//     user-typed incomes change. Buffering this would mean the user can't
//     see the calculated SSAG / table amount until they click Save Page,
//     which defeats the point of the calculator.
//   - Section 7 expenses and Retroactive support are list-style sub-tabs
//     where the immediate-save model is already correct.
//
// We still notify the editor page that this tab has no pending buffered
// edits so the navigation guard doesn't fire when leaving it.
export default function ChildSupportTab({ bundle, save, party1Name, party2Name, registerDirty }) {
  const [sub, setSub] = useState('monthly')

  useEffect(() => {
    if (registerDirty) registerDirty(false)
  }, [registerDirty])

  return (
    <div>
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />
      {sub === 'monthly' && <MonthlySupport bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />}
      {sub === 'section7' && <Section7Expenses bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />}
      {sub === 'retroactive' && <RetroactiveSupport bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />}
    </div>
  )
}
