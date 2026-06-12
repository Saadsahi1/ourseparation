'use client'
import { useState, useEffect } from 'react'
import SubTabs from '../shared/SubTabs'
import SaveBar from '../shared/SaveBar'
import PropertyItems from './PropertyItems'
import NFPSummary from './NFPSummary'
import PropertyDivision from './PropertyDivision'
import InviteOtherPartyBanner from '../shared/InviteOtherPartyBanner'
import { useDirtyRegistry } from '../shared/useDirtyBuffer'

const SUB_TABS = [
  { key: 'assets', label: 'Assets, Debts & NFP' },
  { key: 'division', label: 'Division Details' },
]

// PropertyTab — Save Page applies to the Division Details sub-tab only.
// The Assets list (PropertyItems) and the NFP Summary keep their existing
// immediate-save behavior: adding/removing items is a discrete user action
// that should persist instantly. Division-details field edits flow through
// the registry so the user can iterate without each blur producing a save.
export default function PropertyTab({ bundle, save, party1Name, party2Name, registerDirty }) {
  const [sub, setSub] = useState('assets')

  const registry = useDirtyRegistry()
  useEffect(() => {
    if (registerDirty) registerDirty(registry.isDirty)
  }, [registry.isDirty, registerDirty])

  return (
    <div>
      <InviteOtherPartyBanner agreement={bundle.agreement} />
      <SaveBar registry={registry} />
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />
      {sub === 'assets' && (
        <>
          <PropertyItems bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />
          <NFPSummary bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} />
        </>
      )}
      {sub === 'division' && (
        <PropertyDivision bundle={bundle} save={save} party1Name={party1Name} party2Name={party2Name} registry={registry} />
      )}
    </div>
  )
}
