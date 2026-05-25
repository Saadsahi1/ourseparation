'use client'
import { useState } from 'react'
import FormField from '../shared/FormField'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const ASSET_CATEGORIES = [
  { value: 'real_estate', label: 'Real Estate' },
  { value: 'vehicle', label: 'Vehicle' },
  { value: 'bank_account', label: 'Bank Account' },
  { value: 'investment', label: 'Investment (Stocks/Bonds/Mutual Funds)' },
  { value: 'pension', label: 'Pension' },
  { value: 'business', label: 'Business Interest' },
  { value: 'personal_property', label: 'Personal Property (jewelry, art, etc.)' },
  { value: 'other', label: 'Other Asset' },
]

const DEBT_CATEGORIES = [
  { value: 'mortgage', label: 'Mortgage' },
  { value: 'credit_card', label: 'Credit Card' },
  { value: 'loan', label: 'Loan' },
  { value: 'line_of_credit', label: 'Line of Credit' },
  { value: 'tax_debt', label: 'Tax Debt' },
  { value: 'other_debt', label: 'Other Debt' },
]

export default function PropertyItems({ bundle, save, party1Name, party2Name }) {
  const items = bundle.propertyItems || []
  const [showAdd, setShowAdd] = useState(false)

  const ownerOptions = [
    { value: 'party1', label: party1Name },
    { value: 'party2', label: party2Name },
    { value: 'joint', label: 'Joint' },
  ]

  const addItem = async (template) => {
    await save('property', template, { method: 'POST' })
  }
  const updateItem = async (itemId, patch) => {
    await save('property', patch, { method: 'PUT', pathSuffix: `/${itemId}` })
  }
  const removeItem = async (itemId) => {
    if (!confirm('Remove this property item?')) return
    await save('property', null, { method: 'DELETE', pathSuffix: `/${itemId}` })
  }

  // Group items by category for display
  const grouped = {}
  for (const i of items) {
    const key = i.item_type === 'debt' ? `debt_${i.category || 'other'}` : `asset_${i.category || 'other'}`
    if (!grouped[key]) grouped[key] = []
    grouped[key].push(i)
  }

  return (
    <div style={cardStyle}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
        <h3 style={{ margin: 0 }}>Assets and Debts</h3>
        <div style={{ display: 'flex', gap: '8px' }}>
          <button className="btn btn-outline btn-sm" onClick={() => addItem({ item_type: 'asset', category: 'other' })}>+ Add Asset</button>
          <button className="btn btn-outline btn-sm" onClick={() => addItem({ item_type: 'debt', category: 'other_debt' })}>+ Add Debt</button>
        </div>
      </div>
      <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
        Enter every asset and debt owned by either party. Values at separation are mandatory; values at marriage allow accurate Net Family Property calculation.
      </p>

      {items.length === 0 && (
        <p style={{ color: 'var(--s400)', fontStyle: 'italic' }}>No property items added yet.</p>
      )}

      {items.map((i) => {
        const cats = i.item_type === 'debt' ? DEBT_CATEGORIES : ASSET_CATEGORIES
        return (
          <div key={i.id} style={{
            border: '1px solid var(--border)', borderRadius: 'var(--rs)',
            padding: '14px', marginBottom: '10px', background: 'var(--s50)',
          }}>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr 1.4fr 1fr 1fr auto', gap: '10px', alignItems: 'end' }}>
              <FormField label="Owner" type="select" options={ownerOptions} value={i.owner} onSave={(v) => updateItem(i.id, { owner: v })} />
              <FormField label="Category" type="select" options={cats} value={i.category} onSave={(v) => updateItem(i.id, { category: v })} />
              <FormField label="Description" value={i.description || ''} onSave={(v) => updateItem(i.id, { description: v })} placeholder="e.g. RBC chequing acct" />
              <FormField label="Value @ Separation" type="number" prefix="$" value={i.value_at_separation || 0} onSave={(v) => updateItem(i.id, { value_at_separation: Number(v) || 0 })} />
              <FormField label="Value @ Marriage" type="number" prefix="$" value={i.value_at_marriage || 0} onSave={(v) => updateItem(i.id, { value_at_marriage: Number(v) || 0 })} />
              <button onClick={() => removeItem(i.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', height: '40px' }}>Remove</button>
            </div>

            <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap', fontSize: '0.84rem' }}>
              {i.item_type === 'asset' && i.category === 'real_estate' && (
                <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                  <input type="checkbox" checked={Boolean(i.is_matrimonial_home)} onChange={(e) => updateItem(i.id, { is_matrimonial_home: e.target.checked })} />
                  Matrimonial home <em style={{ color: 'var(--s600)', fontSize: '0.78rem' }}>(value at marriage excluded per FLA s.4)</em>
                </label>
              )}
              <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <input type="checkbox" checked={Boolean(i.is_excluded)} onChange={(e) => updateItem(i.id, { is_excluded: e.target.checked })} />
                Excluded property (gift, inheritance, etc.)
              </label>
            </div>

            {i.is_excluded && (
              <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: '10px', marginTop: '10px' }}>
                <FormField label="Excluded Reason" value={i.excluded_reason || ''} onSave={(v) => updateItem(i.id, { excluded_reason: v })} placeholder="e.g. inheritance from late father" />
                <FormField label="Excluded Amount" type="number" prefix="$" value={i.excluded_amount ?? ''} onSave={(v) => updateItem(i.id, { excluded_amount: Number(v) || null })} />
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
