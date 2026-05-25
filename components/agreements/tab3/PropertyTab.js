'use client'
import { useState } from 'react'
import SubTabs from '../shared/SubTabs'
import PropertyItems from './PropertyItems'
import NFPSummary from './NFPSummary'
import PropertyDivision from './PropertyDivision'

const SUB_TABS = [
  { key: 'assets', label: 'Assets, Debts & NFP' },
  { key: 'division', label: 'Division Details' },
]

export default function PropertyTab({ bundle, save, party1Name, party2Name }) {
  const [sub, setSub] = useState('assets')

  return (
    <div>
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />
      {sub === 'assets' && (
        <>
          <PropertyItems bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />
          <NFPSummary bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />
        </>
      )}
      {sub === 'division' && (
        <PropertyDivision bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />
      )}
    </div>
  )
}
