'use client'
import { useMemo, useEffect, useState } from 'react'
import FormField from '../shared/FormField'
import { lookupChildSupport, selectCSTByDate } from '@/lib/calc/childSupportTables'
import api from '@/lib/apiClient'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const fmtCAD = (n) => `$${Math.round(Number(n) || 0).toLocaleString('en-CA')}`

export default function MonthlySupport({ bundle, save, party1Name, party2Name }) {
  const sc = bundle.supportCalculations || {}
  const a = bundle.agreement
  const children = bundle.children || []
  const numChildren = children.length
  const [prefillSuggestion, setPrefillSuggestion] = useState(null)

  const saveS = (patch) => save('support', patch)

  // Suggest pre-fill from latest calculation if incomes are empty.
  useEffect(() => {
    if (sc.party1_income && sc.party2_income) { setPrefillSuggestion(null); return }
    if (prefillSuggestion !== null) return  // already loaded
    api.get('/api/agreements/prefill').then(async (r) => {
      if (!r?.ok) return
      const d = await r.json()
      if (d?.calcIncomes?.party1_income || d?.calcIncomes?.party2_income) {
        setPrefillSuggestion(d.calcIncomes)
      }
    }).catch(() => {})
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sc.party1_income, sc.party2_income])

  const applyPrefill = () => {
    const patch = {}
    if (prefillSuggestion.party1_income && !sc.party1_income) patch.party1_income = prefillSuggestion.party1_income
    if (prefillSuggestion.party2_income && !sc.party2_income) patch.party2_income = prefillSuggestion.party2_income
    if (Object.keys(patch).length > 0) saveS(patch)
    setPrefillSuggestion(null)
  }

  // Auto-determine arrangement from parenting schedule if not yet set
  const psched = bundle.parentingSchedule
  const arrangement = sc.child_support_arrangement || 'section3'

  // Pull incomes (manual entry, but pre-fill from calculation if linked)
  const p1Income = Number(sc.party1_income) || 0
  const p2Income = Number(sc.party2_income) || 0

  // Compute table amounts
  const tableName = selectCSTByDate(a.separation_date)
  const p1TableAmount = useMemo(() => {
    if (!p1Income || !numChildren) return 0
    return lookupChildSupport(tableName, p1Income, numChildren)
  }, [p1Income, numChildren, tableName])
  const p2TableAmount = useMemo(() => {
    if (!p2Income || !numChildren) return 0
    return lookupChildSupport(tableName, p2Income, numChildren)
  }, [p2Income, numChildren, tableName])

  // For section3, payor = higher-income spouse (or whoever is NOT primary parent)
  const section3Payor = useMemo(() => {
    if (arrangement !== 'section3') return null
    // Compute based on which party has primary residence of most children
    let p1Primary = 0, p2Primary = 0
    for (const c of children) {
      if (c.primary_residence === 'party1') p1Primary++
      else if (c.primary_residence === 'party2') p2Primary++
    }
    if (p1Primary > p2Primary) return 'party2'  // party 2 pays
    if (p2Primary > p1Primary) return 'party1'  // party 1 pays
    // tied or shared — payor is higher-income
    return p1Income >= p2Income ? 'party1' : 'party2'
  }, [arrangement, children, p1Income, p2Income])

  // Section 9: set-off
  const section9Payor = useMemo(() => {
    if (arrangement !== 'section9') return null
    return p1TableAmount >= p2TableAmount ? 'party1' : 'party2'
  }, [arrangement, p1TableAmount, p2TableAmount])

  const computedPayor = arrangement === 'section3' ? section3Payor : section9Payor
  const computedAmount = arrangement === 'section3'
    ? (computedPayor === 'party1' ? p1TableAmount : p2TableAmount)
    : Math.abs(p1TableAmount - p2TableAmount)

  // Sync computed amount to support_calculations when it changes meaningfully.
  // Guard against re-saving the same values (Postgres NUMERIC can come back as
  // a string, and table amounts shouldn't trigger a save by themselves).
  useEffect(() => {
    if (!numChildren) return
    if (!computedPayor || !computedAmount) return
    const samePayor = sc.child_support_payor === computedPayor
    const sameAmount = Math.abs((Number(sc.child_support_amount) || 0) - computedAmount) < 1
    const sameP1Tbl = Math.abs((Number(sc.party1_table_amount) || 0) - p1TableAmount) < 1
    const sameP2Tbl = Math.abs((Number(sc.party2_table_amount) || 0) - p2TableAmount) < 1
    if (samePayor && sameAmount && sameP1Tbl && sameP2Tbl) return
    saveS({
      child_support_payor: computedPayor,
      child_support_amount: computedAmount,
      party1_table_amount: p1TableAmount,
      party2_table_amount: p2TableAmount,
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [computedPayor, computedAmount, p1TableAmount, p2TableAmount,
      sc.child_support_payor, sc.child_support_amount,
      sc.party1_table_amount, sc.party2_table_amount, numChildren])

  const payorName = computedPayor === 'party1' ? party1Name : party2Name
  const recipientName = computedPayor === 'party1' ? party2Name : party1Name

  return (
    <div>
      {numChildren === 0 && (
        <div style={{ ...cardStyle, textAlign: 'center', color: 'var(--s600)' }}>
          <h3 style={{ marginTop: 0 }}>No Children Added</h3>
          <p>Add children in the Info tab before configuring child support.</p>
        </div>
      )}

      {numChildren > 0 && (
        <>
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Annual Incomes</h3>
            <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
              Enter each party's Line 15000 (Total Income) from their most recent tax return.
            </p>

            {prefillSuggestion && (
              <div style={{
                background: 'var(--vx)', border: '1px solid var(--vc)',
                borderRadius: 'var(--rs)', padding: '10px 14px', marginBottom: '14px',
                display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '10px',
              }}>
                <span style={{ fontSize: '0.85rem', color: 'var(--s800)' }}>
                  ✨ Use incomes from your last calculation? ({party1Name} {fmtCAD(prefillSuggestion.party1_income || 0)}, {party2Name} {fmtCAD(prefillSuggestion.party2_income || 0)})
                </span>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => setPrefillSuggestion(null)} className="btn btn-ghost btn-sm">No</button>
                  <button onClick={applyPrefill} className="btn btn-primary btn-sm">Use these</button>
                </div>
              </div>
            )}

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
              <FormField
                label={`${party1Name} — Annual Income`}
                type="number" prefix="$"
                value={sc.party1_income ?? ''}
                onSave={(v) => saveS({ party1_income: Number(v) || 0 })}
              />
              <FormField
                label={`${party2Name} — Annual Income`}
                type="number" prefix="$"
                value={sc.party2_income ?? ''}
                onSave={(v) => saveS({ party2_income: Number(v) || 0 })}
              />
            </div>
          </div>

          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Parenting Arrangement</h3>
            <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
              How is parenting time divided? This determines which section of the Federal Child Support Guidelines applies.
            </p>
            <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
              {[
                { v: 'section3', label: 'Section 3 — Primary Residence' },
                { v: 'section9', label: 'Section 9 — Shared Parenting (both 40%+)' },
              ].map((opt) => {
                const isActive = arrangement === opt.v
                return (
                  <button
                    key={opt.v}
                    onClick={() => saveS({ child_support_arrangement: opt.v })}
                    style={{
                      flex: 1,
                      padding: '14px 18px',
                      border: `2px solid ${isActive ? 'var(--v)' : 'var(--border)'}`,
                      borderRadius: 'var(--rs)',
                      background: isActive ? 'var(--vx)' : '#fff',
                      cursor: 'pointer',
                      textAlign: 'left',
                      fontWeight: isActive ? 600 : 500,
                      color: isActive ? 'var(--v)' : 'var(--s800)',
                    }}
                  >{opt.label}</button>
                )
              })}
            </div>
          </div>

          {arrangement === 'section9' && (
            <div style={cardStyle}>
              <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Section 9(c) Factors</h3>
              <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
                Consider these factors when adjusting from the strict set-off amount.
              </p>
              {[
                { k: 'increased_costs', label: 'Increased costs of shared arrangement (duplication of toys, equipment, clothes)' },
                { k: 'transportation', label: 'Transportation costs between residences' },
                { k: 'duplication_equipment', label: 'Duplication of equipment and necessities' },
                { k: 'conditions_means_needs', label: 'Conditions, means, needs and circumstances of each party and the children' },
              ].map(({ k, label }) => (
                <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.88rem' }}>
                  <input
                    type="checkbox"
                    checked={Boolean(sc.section9_factors?.[k])}
                    onChange={(e) => saveS({ section9_factors: { ...(sc.section9_factors || {}), [k]: e.target.checked } })}
                  />
                  {label}
                </label>
              ))}
              <FormField
                label="Adjustment Notes"
                type="textarea"
                value={sc.section9_adjustment_notes || ''}
                onSave={(v) => saveS({ section9_adjustment_notes: v })}
                placeholder="Explain any adjustments to the strict set-off amount"
              />
            </div>
          )}

          {/* Calculation Result */}
          <div style={{ ...cardStyle, background: 'var(--vx)', border: '1px solid var(--vc)' }}>
            <h3 style={{ marginTop: 0, marginBottom: '10px' }}>Calculated Monthly Child Support</h3>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
              <div style={{ background: '#fff', padding: '14px', borderRadius: 'var(--rs)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--s600)' }}>{party1Name}'s table amount</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--v)' }}>{fmtCAD(p1TableAmount)} / mo</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--s400)' }}>Based on income of {fmtCAD(p1Income)} for {numChildren} child(ren)</div>
              </div>
              <div style={{ background: '#fff', padding: '14px', borderRadius: 'var(--rs)', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '0.78rem', color: 'var(--s600)' }}>{party2Name}'s table amount</div>
                <div style={{ fontSize: '1.25rem', fontWeight: 700, color: 'var(--v)' }}>{fmtCAD(p2TableAmount)} / mo</div>
                <div style={{ fontSize: '0.78rem', color: 'var(--s400)' }}>Based on income of {fmtCAD(p2Income)} for {numChildren} child(ren)</div>
              </div>
            </div>

            {computedPayor && computedAmount > 0 ? (
              <div style={{ fontSize: '1.05rem', color: 'var(--s900)' }}>
                <strong>{payorName}</strong> shall pay <strong>{recipientName}</strong> child support of <strong style={{ color: 'var(--v)' }}>{fmtCAD(computedAmount)} per month</strong>
                {arrangement === 'section9' && (
                  <span style={{ color: 'var(--s600)', fontSize: '0.85rem' }}> (set-off: {fmtCAD(p1TableAmount)} − {fmtCAD(p2TableAmount)} = {fmtCAD(computedAmount)})</span>
                )}
              </div>
            ) : (
              <p style={{ color: 'var(--s600)', margin: 0 }}>Enter incomes for both parties to see the calculation.</p>
            )}

            <p style={{ marginTop: '12px', marginBottom: 0, fontSize: '0.78rem', color: 'var(--s400)' }}>
              Calculation uses {tableName} (Federal Child Support Guidelines).
            </p>
          </div>

          {/* Arrears */}
          <div style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Child Support Arrears</h3>
            <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
              Does either party owe back-support that needs to be paid?
            </p>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '14px' }}>
              <FormField
                label="Owed To"
                type="select"
                options={[
                  { value: '', label: 'No arrears owed' },
                  { value: 'party1', label: party1Name },
                  { value: 'party2', label: party2Name },
                ]}
                value={sc.arrears_owed_to || ''}
                onSave={(v) => saveS({ arrears_owed_to: v || null })}
              />
              <FormField
                label="Arrears Amount"
                type="number" prefix="$"
                value={sc.arrears_amount ?? ''}
                onSave={(v) => saveS({ arrears_amount: Number(v) || null })}
                disabled={!sc.arrears_owed_to}
              />
              <FormField
                label="Pay Within (days)"
                type="number"
                value={sc.arrears_pay_within_days ?? ''}
                onSave={(v) => saveS({ arrears_pay_within_days: parseInt(v, 10) || null })}
                disabled={!sc.arrears_owed_to}
              />
            </div>
          </div>
        </>
      )}
    </div>
  )
}
