'use client'
import { useState, useMemo } from 'react'
import FormField from '../shared/FormField'
import { SECTION7_CATEGORIES } from '@/lib/agreements/templateLibrary'
import { calculateSection7Split } from '@/lib/agreements/utils'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const itemStyle = {
  border: '1px solid var(--border)', borderRadius: 'var(--rs)',
  padding: '14px', marginBottom: '10px', background: 'var(--s50)',
}

export default function Section7Expenses({ bundle, save, party1Name, party2Name }) {
  const expenses = bundle.section7Expenses || []
  const sc = bundle.supportCalculations || {}
  const { party1Percent, party2Percent } = calculateSection7Split(sc.party1_income, sc.party2_income)
  const [showAdd, setShowAdd] = useState(false)
  const [newExp, setNewExp] = useState({ expense_type: 'childcare', description: '', estimated_annual_cost: 0, is_pre_agreed: false })

  const addExpense = async () => {
    await save('section7', {
      ...newExp,
      party1_percentage: party1Percent,
      party2_percentage: party2Percent,
      requires_consent: !newExp.is_pre_agreed,
    }, { method: 'POST' })
    setNewExp({ expense_type: 'childcare', description: '', estimated_annual_cost: 0, is_pre_agreed: false })
    setShowAdd(false)
  }

  const updateExpense = async (expId, patch) => {
    await save('section7', patch, { method: 'PUT', pathSuffix: `/${expId}` })
  }

  const removeExpense = async (expId) => {
    if (!confirm('Remove this expense?')) return
    await save('section7', null, { method: 'DELETE', pathSuffix: `/${expId}` })
  }

  const categoryOptions = Object.entries(SECTION7_CATEGORIES).map(([k, v]) => ({ value: k, label: v.label }))
  const suggestions = SECTION7_CATEGORIES[newExp.expense_type]?.suggestions || []

  const preAgreed = expenses.filter((e) => e.is_pre_agreed)
  const others = expenses.filter((e) => !e.is_pre_agreed)

  return (
    <div>
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Section 7 Special Expenses</h3>
        <p style={{ marginTop: 0, marginBottom: '12px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Add ongoing special expenses (childcare, medical, extracurricular, post-secondary education, etc.).
          Costs are split in proportion to each party's gross income per the Federal Child Support Guidelines.
        </p>

        {/* Income split visualization */}
        <div style={{
          background: 'var(--vx)', border: '1px solid var(--vc)',
          borderRadius: 'var(--rs)', padding: '12px 16px', marginBottom: '16px',
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px', fontSize: '0.82rem', fontWeight: 600 }}>
            <span>{party1Name} — {party1Percent}%</span>
            <span>{party2Name} — {party2Percent}%</span>
          </div>
          <div style={{
            display: 'flex', height: '14px', borderRadius: '7px', overflow: 'hidden',
            background: 'var(--s100)', border: '1px solid var(--border)',
          }}>
            <div style={{ width: `${party1Percent}%`, background: 'var(--v)' }} />
            <div style={{ width: `${party2Percent}%`, background: 'var(--success)' }} />
          </div>
          <p style={{ marginTop: '6px', marginBottom: 0, fontSize: '0.78rem', color: 'var(--s600)' }}>
            Income-proportional split based on Tab 5 incomes.
          </p>
        </div>

        {!showAdd && (
          <button onClick={() => setShowAdd(true)} className="btn btn-primary btn-sm">+ Add Expense</button>
        )}

        {showAdd && (
          <div style={{ ...itemStyle, background: '#fff', border: '2px solid var(--v)' }}>
            <h4 style={{ marginTop: 0, marginBottom: '10px' }}>New Section 7 Expense</h4>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr', gap: '10px' }}>
              <FormField label="Category" type="select" options={categoryOptions}
                value={newExp.expense_type}
                onSave={(v) => setNewExp({ ...newExp, expense_type: v })}
              />
              <FormField label="Description" value={newExp.description}
                onSave={(v) => setNewExp({ ...newExp, description: v })}
                hint={suggestions.length > 0 ? `Suggestions: ${suggestions.slice(0, 3).join(', ')}...` : ''}
              />
              <FormField label="Estimated Annual Cost" type="number" prefix="$"
                value={newExp.estimated_annual_cost}
                onSave={(v) => setNewExp({ ...newExp, estimated_annual_cost: Number(v) || 0 })}
              />
            </div>
            <FormField
              type="checkbox"
              value={newExp.is_pre_agreed}
              onSave={(v) => setNewExp({ ...newExp, is_pre_agreed: v })}
              hint="Pre-agreed expense (no consent needed for each occurrence)"
            />
            <div style={{ display: 'flex', gap: '8px', marginTop: '12px' }}>
              <button onClick={addExpense} className="btn btn-primary btn-sm" disabled={!newExp.description}>Add</button>
              <button onClick={() => setShowAdd(false)} className="btn btn-ghost btn-sm">Cancel</button>
            </div>
          </div>
        )}
      </div>

      {/* Pre-agreed expenses */}
      {preAgreed.length > 0 && (
        <div style={cardStyle}>
          <h4 style={{ marginTop: 0, marginBottom: '12px' }}>Pre-Agreed Expenses ({preAgreed.length})</h4>
          {preAgreed.map((e) => renderExpenseRow(e, updateExpense, removeExpense, party1Name, party2Name))}
        </div>
      )}

      {/* Consent-required expenses */}
      {others.length > 0 && (
        <div style={cardStyle}>
          <h4 style={{ marginTop: 0, marginBottom: '12px' }}>Expenses Requiring Consent ({others.length})</h4>
          {others.map((e) => renderExpenseRow(e, updateExpense, removeExpense, party1Name, party2Name))}
        </div>
      )}

      {expenses.length === 0 && (
        <div style={cardStyle}>
          <p style={{ color: 'var(--s400)', fontStyle: 'italic', margin: 0 }}>No section 7 expenses added yet.</p>
        </div>
      )}
    </div>
  )
}

function renderExpenseRow(e, update, remove, party1Name, party2Name) {
  const cat = SECTION7_CATEGORIES[e.expense_type]?.label || e.expense_type
  return (
    <div key={e.id} style={{
      border: '1px solid var(--border)', borderRadius: 'var(--rs)',
      padding: '12px', marginBottom: '8px', background: 'var(--s50)',
    }}>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 2fr 1fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
        <FormField label="Category" value={cat} disabled />
        <FormField label="Description" value={e.description || ''}
          onSave={(v) => update(e.id, { description: v })} />
        <FormField label="Annual Cost" type="number" prefix="$"
          value={e.estimated_annual_cost ?? 0}
          onSave={(v) => update(e.id, { estimated_annual_cost: Number(v) || 0 })} />
        <FormField label={`${party1Name} %`} type="number"
          value={e.party1_percentage ?? 50}
          onSave={(v) => update(e.id, { party1_percentage: Number(v) || 0, party2_percentage: 100 - (Number(v) || 0) })} />
        <FormField label={`${party2Name} %`} type="number"
          value={e.party2_percentage ?? 50}
          onSave={(v) => update(e.id, { party2_percentage: Number(v) || 0, party1_percentage: 100 - (Number(v) || 0) })} />
        <button onClick={() => remove(e.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', height: '40px' }}>×</button>
      </div>
    </div>
  )
}
