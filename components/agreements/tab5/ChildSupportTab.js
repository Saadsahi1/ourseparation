'use client'
import { useState } from 'react'
import SubTabs from '../shared/SubTabs'
import MonthlySupport from './MonthlySupport'
import Section7Expenses from './Section7Expenses'
import RetroactiveSupport from './RetroactiveSupport'

const SUB_TABS = [
  { key: 'monthly', label: 'Monthly Support' },
  { key: 'section7', label: 'Section 7 Expenses' },
  { key: 'retroactive', label: 'Retroactive Support' },
]

export default function ChildSupportTab({ bundle, save, party1Name, party2Name }) {
  const [sub, setSub] = useState('monthly')
  return (
    <div>
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />
      {sub === 'monthly' && <MonthlySupport bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />}
      {sub === 'section7' && <Section7Expenses bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />}
      {sub === 'retroactive' && <RetroactiveSupport bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />}
    </div>
  )
}
