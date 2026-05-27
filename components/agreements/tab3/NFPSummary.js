'use client'
import { useState, useEffect } from 'react'
import FormField from '../shared/FormField'
import { equalizationFromItems } from '@/lib/agreements/utils'

const fmtCAD = (n) => `$${(Number(n) || 0).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

export default function NFPSummary({ bundle, save, party1Name, party2Name }) {
  const items = bundle.propertyItems || []
  const division = bundle.propertyDivisionTerms || {}
  const { party1: p1, party2: p2, amount: calcEq, payor: calcPayor } = equalizationFromItems(items)
  const [useCustom, setUseCustom] = useState(division.custom_equalization_amount != null)
  const [customAmount, setCustomAmount] = useState(division.custom_equalization_amount ?? '')
  const [customNotes, setCustomNotes] = useState(division.custom_equalization_notes || '')
  const [savingCustom, setSavingCustom] = useState(false)

  useEffect(() => {
    setUseCustom(division.custom_equalization_amount != null)
    setCustomAmount(division.custom_equalization_amount ?? '')
    setCustomNotes(division.custom_equalization_notes || '')
  }, [division.custom_equalization_amount, division.custom_equalization_notes])

  const finalAmount = useCustom && division.custom_equalization_amount != null
    ? Number(division.custom_equalization_amount)
    : calcEq

  const payorName = calcPayor === 'party1' ? party1Name : (calcPayor === 'party2' ? party2Name : null)
  const recipientName = calcPayor === 'party1' ? party2Name : (calcPayor === 'party2' ? party1Name : null)

  // For per-party total assets / total debts breakdown
  const totals = (party) => {
    let totalAssets = 0, totalDebts = 0
    for (const i of items) {
      if (i.owner !== party) continue
      const v = parseFloat(i.value_at_separation) || 0
      if (i.item_type === 'asset') totalAssets += v
      else totalDebts += v
    }
    return { totalAssets, totalDebts }
  }
  const t1 = totals('party1')
  const t2 = totals('party2')

  // Adjust assets/debts to include half of joint items (simple split)
  const jointAssets = items.filter((i) => i.owner === 'joint' && i.item_type === 'asset')
    .reduce((s, i) => s + (parseFloat(i.value_at_separation) || 0), 0)
  const jointDebts = items.filter((i) => i.owner === 'joint' && i.item_type === 'debt')
    .reduce((s, i) => s + (parseFloat(i.value_at_separation) || 0), 0)
  const t1Total = { totalAssets: t1.totalAssets + jointAssets / 2, totalDebts: t1.totalDebts + jointDebts / 2 }
  const t2Total = { totalAssets: t2.totalAssets + jointAssets / 2, totalDebts: t2.totalDebts + jointDebts / 2 }

  const saveCustom = async () => {
    setSavingCustom(true)
    try {
      await save('property-division', {
        custom_equalization_amount: Number(customAmount) || 0,
        custom_equalization_notes: customNotes || null,
      })
    } finally {
      setSavingCustom(false)
    }
  }

  const turnOffCustom = async () => {
    setUseCustom(false)
    await save('property-division', { custom_equalization_amount: null, custom_equalization_notes: null })
  }

  const partyBox = (label, party, totals, p, bg, borderColor, labelColor) => (
    <div style={{
      background: bg, border: `1px solid ${borderColor}`,
      borderRadius: 'var(--rs)', padding: '18px',
    }}>
      <h4 style={{ marginTop: 0, marginBottom: '12px', color: labelColor, fontSize: '0.95rem' }}>{label}</h4>
      <Row left="Total Assets:" right={fmtCAD(totals.totalAssets)} />
      <Row left="Total Debts:" right={fmtCAD(totals.totalDebts)} />
      <div style={{ height: '1px', background: borderColor, margin: '6px 0' }} />
      <Row left="Net Worth at Separation:" right={fmtCAD(totals.totalAssets - totals.totalDebts)} accent={labelColor} />
      <Row left="Less: Excluded Property:" right={`(${fmtCAD(p.excluded)})`} accent={labelColor} />
      <Row left="Less: Net Worth at Marriage:" right={`(${fmtCAD(Math.max(0, p.assetsMar - p.debtsMar))})`} accent={labelColor} />
      <div style={{ height: '2px', background: labelColor, margin: '8px 0' }} />
      <Row left="Net Family Property:" right={fmtCAD(p.nfp)} bold accent={labelColor} />
    </div>
  )

  return (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, marginBottom: '20px' }}>Net Family Property Calculation</h3>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '20px' }}>
        {partyBox(party1Name, 'party1', t1Total, p1, 'var(--vx)', 'var(--vc)', 'var(--v)')}
        {partyBox(party2Name, 'party2', t2Total, p2, '#E7FAF1', '#A8E5C7', '#1A8F62')}
      </div>

      {/* Equalization Payment — dark theme */}
      <div style={{
        background: '#1F2235',
        color: '#fff',
        borderRadius: 'var(--r)',
        padding: '24px',
      }}>
        <h3 style={{ marginTop: 0, marginBottom: '14px', color: '#fff' }}>Equalization Payment</h3>

        <div style={{
          background: 'rgba(255,255,255,0.05)',
          borderRadius: 'var(--rs)',
          padding: '16px',
          marginBottom: '16px',
        }}>
          <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
            Calculated Equalization Payment:
          </div>
          <div style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '6px' }}>
            {fmtCAD(calcEq)}
          </div>
          {payorName && recipientName ? (
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
              {payorName} must pay {recipientName} {fmtCAD(calcEq)} based on NFP calculation
            </div>
          ) : (
            <div style={{ fontSize: '0.85rem', color: 'rgba(255,255,255,0.8)' }}>
              NFPs are equal — no equalization payment owing.
            </div>
          )}
        </div>

        <label style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer', fontSize: '0.92rem', fontWeight: 500, marginBottom: '14px' }}>
          <input
            type="checkbox"
            checked={useCustom}
            onChange={(e) => {
              const v = e.target.checked
              setUseCustom(v)
              if (!v) turnOffCustom()
            }}
            style={{ width: '16px', height: '16px', accentColor: 'var(--v)' }}
          />
          Override with custom agreed amount
        </label>

        {useCustom && (
          <div style={{
            background: 'rgba(255,255,255,0.05)',
            borderRadius: 'var(--rs)',
            padding: '16px',
          }}>
            <div style={{ marginBottom: '12px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
                Agreed Equalization Amount
              </label>
              <div style={{ display: 'flex', alignItems: 'center', background: 'rgba(255,255,255,0.1)', borderRadius: 'var(--rs)', padding: '0 12px' }}>
                <span style={{ color: 'rgba(255,255,255,0.7)' }}>$</span>
                <input
                  type="number"
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  style={{
                    flex: 1, padding: '10px 8px', background: 'transparent',
                    border: 'none', color: '#fff', fontSize: '0.95rem', outline: 'none',
                  }}
                  placeholder="0.00"
                />
              </div>
            </div>

            <div style={{ marginBottom: '14px' }}>
              <label style={{ display: 'block', fontSize: '0.82rem', color: 'rgba(255,255,255,0.7)', marginBottom: '4px' }}>
                Reason for Custom Amount
              </label>
              <textarea
                value={customNotes}
                onChange={(e) => setCustomNotes(e.target.value)}
                placeholder="e.g., Based on division of other assets, mutual agreement, offsetting debts, etc."
                style={{
                  width: '100%', minHeight: '70px', resize: 'vertical',
                  padding: '10px 12px',
                  background: 'rgba(255,255,255,0.1)', color: '#fff',
                  border: 'none', borderRadius: 'var(--rs)',
                  fontSize: '0.88rem', fontFamily: 'inherit', outline: 'none',
                }}
              />
            </div>

            <button
              onClick={saveCustom}
              disabled={savingCustom}
              className="btn btn-primary btn-sm"
              style={{ marginBottom: '14px' }}
            >
              {savingCustom ? 'Saving…' : '💾 Save Custom Amount'}
            </button>

            <div style={{
              background: 'var(--v)', borderRadius: 'var(--rs)', padding: '14px 16px',
            }}>
              <div style={{ fontSize: '0.78rem', color: 'rgba(255,255,255,0.85)', marginBottom: '2px' }}>
                Final Agreed Amount:
              </div>
              <div style={{ fontSize: '1.5rem', fontWeight: 700 }}>
                {fmtCAD(finalAmount)}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

function Row({ left, right, bold, accent }) {
  return (
    <div style={{
      display: 'flex', justifyContent: 'space-between',
      padding: '4px 0',
      fontSize: bold ? '1rem' : '0.88rem',
      fontWeight: bold ? 700 : 500,
      color: accent || 'var(--s900)',
    }}>
      <span>{left}</span>
      <span style={{ fontVariantNumeric: 'tabular-nums' }}>{right}</span>
    </div>
  )
}
