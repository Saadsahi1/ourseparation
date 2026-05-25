'use client'
import { useState } from 'react'
import FormField from '../shared/FormField'
import { equalizationFromItems } from '@/lib/agreements/utils'

const fmtCAD = (n) => `$${(Number(n) || 0).toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const rowStyle = {
  display: 'grid',
  gridTemplateColumns: '1fr auto',
  padding: '6px 0',
  fontSize: '0.9rem',
  color: 'var(--s800)',
}

export default function NFPSummary({ bundle, save, party1Name, party2Name }) {
  const items = bundle.propertyItems || []
  const division = bundle.propertyDivisionTerms || {}
  const { party1: p1, party2: p2, amount: calcEq, payor: calcPayor } = equalizationFromItems(items)
  const [useCustom, setUseCustom] = useState(division.custom_equalization_amount != null)

  const effectiveAmount = useCustom && division.custom_equalization_amount != null
    ? Number(division.custom_equalization_amount)
    : calcEq

  const payorName = calcPayor === 'party1' ? party1Name : (calcPayor === 'party2' ? party2Name : null)
  const recipientName = calcPayor === 'party1' ? party2Name : (calcPayor === 'party2' ? party1Name : null)

  const sectionTitle = {
    fontSize: '0.85rem', fontWeight: 700, color: 'var(--v)', marginTop: 0, marginBottom: '8px',
    textTransform: 'uppercase', letterSpacing: '0.04em',
  }

  const partyBox = (label, party, name) => (
    <div style={{ border: '1px solid var(--border)', borderRadius: 'var(--rs)', padding: '16px', background: 'var(--s50)' }}>
      <h4 style={sectionTitle}>{label} — {name}</h4>
      <div style={rowStyle}><span>Assets at Separation</span><strong>{fmtCAD(party.assetsSep)}</strong></div>
      <div style={rowStyle}><span>Less: Debts at Separation</span><strong style={{ color: 'var(--danger)' }}>−{fmtCAD(party.debtsSep)}</strong></div>
      <div style={{ borderTop: '1px solid var(--border)', margin: '4px 0' }}/>
      <div style={rowStyle}><span>Net Worth at Separation</span><strong>{fmtCAD(party.assetsSep - party.debtsSep)}</strong></div>
      <div style={rowStyle}><span>Less: Net Worth at Marriage</span><strong style={{ color: 'var(--danger)' }}>−{fmtCAD(party.assetsMar - party.debtsMar)}</strong></div>
      <div style={rowStyle}><span>Less: Excluded Property</span><strong style={{ color: 'var(--danger)' }}>−{fmtCAD(party.excluded)}</strong></div>
      <div style={{ borderTop: '2px solid var(--v)', margin: '6px 0' }}/>
      <div style={{ ...rowStyle, fontWeight: 700, fontSize: '0.98rem', color: 'var(--v)' }}>
        <span>Net Family Property</span><span>{fmtCAD(party.nfp)}</span>
      </div>
    </div>
  )

  return (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Net Family Property &amp; Equalization</h3>
      <p style={{ marginTop: 0, marginBottom: '20px', color: 'var(--s600)', fontSize: '0.85rem' }}>
        Calculated automatically from the assets and debts above per the Ontario Family Law Act.
      </p>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
        {partyBox('Party 1', p1, party1Name)}
        {partyBox('Party 2', p2, party2Name)}
      </div>

      <div style={{
        background: 'var(--vx)', border: '1px solid var(--vc)',
        borderRadius: 'var(--rs)', padding: '16px',
      }}>
        <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--v)', marginBottom: '8px' }}>
          Equalization Calculation
        </div>
        <p style={{ marginTop: 0, marginBottom: '12px', fontSize: '1.1rem', fontWeight: 600 }}>
          {payorName && recipientName
            ? <>{payorName} owes {recipientName} an equalization payment of <span style={{ color: 'var(--v)' }}>{fmtCAD(effectiveAmount)}</span>.</>
            : <>NFPs are equal — no equalization payment owing.</>}
        </p>
        <p style={{ marginTop: 0, marginBottom: '14px', fontSize: '0.82rem', color: 'var(--s600)' }}>
          (Higher NFP − Lower NFP) ÷ 2 = ({fmtCAD(Math.max(p1.nfp, p2.nfp))} − {fmtCAD(Math.min(p1.nfp, p2.nfp))}) ÷ 2 = <strong>{fmtCAD(calcEq)}</strong>
        </p>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.88rem', fontWeight: 500, marginTop: '8px' }}>
          <input
            type="checkbox"
            checked={useCustom}
            onChange={(e) => {
              const v = e.target.checked
              setUseCustom(v)
              if (!v) save('property-division', { custom_equalization_amount: null, custom_equalization_notes: null })
            }}
          />
          Override with custom equalization amount
        </label>

        {useCustom && (
          <div style={{ marginTop: '12px' }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '12px' }}>
              <FormField
                label="Custom Equalization Amount"
                type="number"
                prefix="$"
                value={division.custom_equalization_amount ?? calcEq}
                onSave={(v) => save('property-division', { custom_equalization_amount: Number(v) || 0 })}
              />
              <FormField
                label="Notes / Justification"
                value={division.custom_equalization_notes || ''}
                onSave={(v) => save('property-division', { custom_equalization_notes: v })}
                placeholder="e.g. adjusted to account for post-separation contributions"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
