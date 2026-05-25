'use client'
import { useState } from 'react'
import FormField from '../shared/FormField'
import { lookupChildSupport, selectCSTByDate } from '@/lib/calc/childSupportTables'
import { aggregateRetroactiveTotals } from '@/lib/agreements/utils'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const fmtCAD = (n) => `$${Math.round(Number(n) || 0).toLocaleString('en-CA')}`

export default function RetroactiveSupport({ bundle, save, party1Name, party2Name }) {
  const a = bundle.agreement
  const periods = bundle.retroactivePeriods || []
  const expenses = bundle.retroactiveExpenses || []
  const numChildren = (bundle.children || []).length

  const waived = Boolean(a.retroactive_support_waived)

  const totals = aggregateRetroactiveTotals(periods)

  const addPeriod = async () => {
    await save('retroactive', {
      kind: 'period',
      calendar_year: new Date().getFullYear() - 1,
      months_in_period: 12,
      parenting_arrangement: 'section3',
    }, { method: 'POST' })
  }

  const updatePeriod = async (rowId, patch) => {
    // Recalculate totals when income/months change
    const allPatch = { kind: 'period', ...patch }
    await save('retroactive', allPatch, { method: 'PUT', pathSuffix: `/${rowId}` })
  }

  const removePeriod = async (rowId) => {
    if (!confirm('Remove this period?')) return
    await save('retroactive', null, { method: 'DELETE', pathSuffix: `/${rowId}?kind=period` })
  }

  const addExpense = async () => {
    await save('retroactive', {
      kind: 'expense',
      expense_date: new Date().toISOString().split('T')[0],
      contribution_percentage: 50,
    }, { method: 'POST' })
  }

  const updateExpense = async (rowId, patch) => {
    await save('retroactive', { kind: 'expense', ...patch }, { method: 'PUT', pathSuffix: `/${rowId}` })
  }

  const removeExpense = async (rowId) => {
    if (!confirm('Remove this expense?')) return
    await save('retroactive', null, { method: 'DELETE', pathSuffix: `/${rowId}?kind=expense` })
  }

  const computePeriodFromInputs = (period) => {
    if (period.parenting_arrangement === 'section3') {
      // Determine who pays based on primary_caregiver
      const payorParty = period.primary_caregiver === 'party1' ? 'party2' : 'party1'
      const payorIncome = payorParty === 'party1' ? Number(period.party1_income) : Number(period.party2_income)
      if (!payorIncome || !numChildren) return { payor: payorParty, monthly: 0, total: 0 }
      const tableName = selectCSTByDate(a.separation_date)
      const monthly = lookupChildSupport(tableName, payorIncome, numChildren)
      const total = monthly * (Number(period.months_in_period) || 12)
      return { payor: payorParty, monthly, total }
    }
    // Section 9: set-off
    const tableName = selectCSTByDate(a.separation_date)
    const p1 = lookupChildSupport(tableName, Number(period.party1_income) || 0, numChildren)
    const p2 = lookupChildSupport(tableName, Number(period.party2_income) || 0, numChildren)
    const monthly = Math.abs(p1 - p2)
    const payor = p1 >= p2 ? 'party1' : 'party2'
    const total = monthly * (Number(period.months_in_period) || 12)
    return { payor, monthly, total }
  }

  return (
    <div>
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Retroactive Monthly Support</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Calculate child support owed for past periods.
        </p>

        <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', marginBottom: '16px', fontSize: '0.92rem' }}>
          <input
            type="checkbox"
            checked={waived}
            onChange={(e) => save('agreement', { retroactive_support_waived: e.target.checked })}
          />
          The parties agree there is no retroactive child support owed (waiver)
        </label>

        {!waived && (
          <>
            {periods.map((p) => {
              const calc = computePeriodFromInputs(p)
              const payorName = calc.payor === 'party1' ? party1Name : party2Name
              return (
                <div key={p.id} style={{
                  border: '1px solid var(--border)', borderRadius: 'var(--rs)',
                  padding: '14px', marginBottom: '10px', background: 'var(--s50)',
                }}>
                  <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 1fr 120px 120px auto', gap: '10px', alignItems: 'end' }}>
                    <FormField label="Year" type="number"
                      value={p.calendar_year ?? ''}
                      onSave={(v) => updatePeriod(p.id, { calendar_year: parseInt(v, 10) || null })} />
                    <FormField label={`${party1Name} Income`} type="number" prefix="$"
                      value={p.party1_income ?? ''}
                      onSave={(v) => updatePeriod(p.id, { party1_income: Number(v) || 0 })} />
                    <FormField label={`${party2Name} Income`} type="number" prefix="$"
                      value={p.party2_income ?? ''}
                      onSave={(v) => updatePeriod(p.id, { party2_income: Number(v) || 0 })} />
                    <FormField label="Months" type="number" min={1} max={12}
                      value={p.months_in_period ?? 12}
                      onSave={(v) => updatePeriod(p.id, { months_in_period: parseInt(v, 10) || 12 })} />
                    <FormField label="Arrangement" type="select"
                      options={[
                        { value: 'section3', label: 'Section 3' },
                        { value: 'section9', label: 'Section 9' },
                      ]}
                      value={p.parenting_arrangement || 'section3'}
                      onSave={(v) => updatePeriod(p.id, { parenting_arrangement: v })} />
                    <button onClick={() => removePeriod(p.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', height: '40px' }}>×</button>
                  </div>
                  {p.parenting_arrangement === 'section3' && (
                    <div style={{ marginTop: '8px' }}>
                      <FormField label="Primary Caregiver" type="select"
                        options={[{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }]}
                        value={p.primary_caregiver || ''}
                        onSave={(v) => updatePeriod(p.id, { primary_caregiver: v })} />
                    </div>
                  )}
                  <p style={{ margin: '8px 0 0 0', fontSize: '0.85rem', color: 'var(--s800)' }}>
                    {calc.monthly > 0
                      ? <><strong>{payorName}</strong> owed <strong>{fmtCAD(calc.monthly)}/mo</strong> = <strong>{fmtCAD(calc.total)}</strong> for this period</>
                      : <span style={{ color: 'var(--s400)' }}>Enter income to calculate</span>
                    }
                  </p>
                </div>
              )
            })}

            <button onClick={addPeriod} className="btn btn-outline btn-sm">+ Add Retroactive Period</button>

            {periods.length > 0 && (
              <div style={{
                background: 'var(--vx)', border: '1px solid var(--vc)',
                borderRadius: 'var(--rs)', padding: '14px', marginTop: '16px',
              }}>
                <div style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--v)', marginBottom: '8px', textTransform: 'uppercase' }}>
                  Net Retroactive Owed
                </div>
                <p style={{ margin: 0, fontSize: '1.05rem' }}>
                  {totals.netAmount > 0
                    ? <><strong>{totals.netDirection === 'party1_owes_party2' ? party1Name : party2Name}</strong> owes <strong>{totals.netDirection === 'party1_owes_party2' ? party2Name : party1Name}</strong> a net of <strong style={{ color: 'var(--v)' }}>{fmtCAD(totals.netAmount)}</strong></>
                    : 'Net retroactive owed is zero (or amounts cancel out).'}
                </p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Retroactive expenses */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Retroactive Section 7 Expenses</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Past special expenses for which one party is seeking contribution from the other.
        </p>

        {expenses.map((e) => (
          <div key={e.id} style={{
            border: '1px solid var(--border)', borderRadius: 'var(--rs)',
            padding: '12px', marginBottom: '8px', background: 'var(--s50)',
            display: 'grid', gridTemplateColumns: '110px 1fr 2fr 100px 100px 100px auto', gap: '10px', alignItems: 'end',
          }}>
            <FormField label="Date" type="date" value={e.expense_date || ''} onSave={(v) => updateExpense(e.id, { expense_date: v })} />
            <FormField label="Category" value={e.expense_category || ''} onSave={(v) => updateExpense(e.id, { expense_category: v })} />
            <FormField label="Description" value={e.expense_description || ''} onSave={(v) => updateExpense(e.id, { expense_description: v })} />
            <FormField label="Total" type="number" prefix="$" value={e.total_amount ?? 0} onSave={(v) => updateExpense(e.id, { total_amount: Number(v) || 0 })} />
            <FormField label="Paid By" type="select"
              options={[{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }]}
              value={e.paid_by || 'party1'} onSave={(v) => updateExpense(e.id, { paid_by: v })} />
            <FormField label="Share %" type="number"
              value={e.contribution_percentage ?? 50}
              onSave={(v) => {
                const pct = Number(v) || 0
                const amt = (Number(e.total_amount) || 0) * pct / 100
                updateExpense(e.id, { contribution_percentage: pct, contribution_amount: amt })
              }} />
            <button onClick={() => removeExpense(e.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', height: '40px' }}>×</button>
          </div>
        ))}

        <button onClick={addExpense} className="btn btn-outline btn-sm">+ Add Retroactive Expense</button>
      </div>
    </div>
  )
}
