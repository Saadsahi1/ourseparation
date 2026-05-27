'use client'
import { useState } from 'react'
import FormField from '../shared/FormField'
import PropertyItemEditor from './PropertyItemEditor'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const ASSET_CATEGORIES = [
  { key: 'real_estate', label: 'Real Estate', subtitle: 'Homes, cottages, investment properties, land', examples: 'Matrimonial home, Cottage, Rental property, Vacant land', docRequired: true },
  { key: 'vehicle', label: 'Vehicles', subtitle: 'Cars, trucks, boats, motorcycles, RVs', examples: 'Car, Truck, Boat, RV, Motorcycle', docRequired: true },
  { key: 'bank_account', label: 'Bank Accounts', subtitle: 'Savings, chequing, GICs, term deposits', examples: 'Chequing account, Savings account, GIC, Term deposit', docRequired: true },
  { key: 'investment', label: 'Investments', subtitle: 'Stocks, bonds, mutual funds, RRSPs, TFSAs', examples: 'RRSP, TFSA, Mutual funds, Brokerage account', docRequired: true },
  { key: 'pension', label: 'Pensions', subtitle: 'Employer pensions, defined benefit plans', examples: 'Defined benefit pension, OMERS, HOOPP, Teachers\' Pension', docRequired: true },
  { key: 'business', label: 'Business Interests', subtitle: 'Ownership in companies, partnerships', examples: 'Sole proprietorship, Corporation shares, Partnership interest', docRequired: true },
  { key: 'personal_property', label: 'Personal Property', subtitle: 'Jewelry, art, collections, furniture', examples: 'Jewelry, Art, Collectibles, Furniture', docRequired: false },
  { key: 'other', label: 'Other Assets', subtitle: 'Anything not in the categories above', examples: '', docRequired: false },
]

const DEBT_CATEGORIES = [
  { key: 'mortgage', label: 'Mortgages', subtitle: 'Home mortgages, secured by real estate', examples: 'First mortgage, Second mortgage, HELOC', docRequired: true },
  { key: 'credit_card', label: 'Credit Card Debt', subtitle: 'Outstanding credit card balances', examples: 'Visa, Mastercard, Amex', docRequired: false },
  { key: 'loan', label: 'Loans', subtitle: 'Personal loans, student loans, car loans', examples: 'Personal loan, Student loan, Car loan', docRequired: true },
  { key: 'line_of_credit', label: 'Lines of Credit', subtitle: 'LOCs, overdraft, business credit', examples: 'Unsecured LOC, Secured LOC', docRequired: true },
  { key: 'tax_debt', label: 'Tax Debt', subtitle: 'Owed to CRA', examples: 'Personal income tax owing, HST owing', docRequired: true },
  { key: 'other_debt', label: 'Other Debts', subtitle: 'Anything not in the categories above', examples: '', docRequired: false },
]

export default function PropertyItems({ bundle, save, party1Name, party2Name }) {
  const items = bundle.propertyItems || []
  const [expandedKey, setExpandedKey] = useState(null)
  const [editing, setEditing] = useState(null)  // {id, item_type, category} | null
  const [creating, setCreating] = useState(null)  // {item_type, category} | null

  const ownerOptions = [
    { value: 'party1', label: party1Name },
    { value: 'party2', label: party2Name },
    { value: 'joint', label: 'Joint' },
  ]

  const handleEditSave = async (formData) => {
    if (creating) {
      await save('property', { ...formData, item_type: creating.item_type, category: creating.category }, { method: 'POST' })
      setCreating(null)
    } else if (editing) {
      await save('property', formData, { method: 'PUT', pathSuffix: `/${editing.id}` })
      setEditing(null)
    }
  }

  const handleDelete = async (itemId) => {
    if (!confirm('Remove this item?')) return
    await save('property', null, { method: 'DELETE', pathSuffix: `/${itemId}` })
  }

  const renderCategorySection = (cat, itemType) => {
    const matching = items.filter((i) => i.item_type === itemType && i.category === cat.key)
    const isExpanded = expandedKey === `${itemType}-${cat.key}`
    const hasItems = matching.length > 0

    return (
      <div key={`${itemType}-${cat.key}`} style={{
        border: '1px solid var(--border)',
        borderRadius: 'var(--rs)',
        marginBottom: '10px',
        overflow: 'hidden',
        background: '#fff',
      }}>
        <button
          onClick={() => setExpandedKey(isExpanded ? null : `${itemType}-${cat.key}`)}
          style={{
            width: '100%',
            display: 'grid',
            gridTemplateColumns: 'auto 1fr auto auto',
            alignItems: 'center',
            gap: '14px',
            padding: '14px 16px',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            textAlign: 'left',
          }}
        >
          {/* Status circle */}
          <span style={{
            width: '32px', height: '32px', borderRadius: '50%',
            background: hasItems ? '#E7FAF1' : 'var(--s100)',
            color: hasItems ? 'var(--success)' : 'var(--s400)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontWeight: 700, fontSize: '0.95rem',
          }}>
            {hasItems ? '✓' : '0'}
          </span>

          {/* Title + subtitle */}
          <div>
            <div style={{ fontWeight: 600, fontSize: '0.95rem', color: 'var(--s900)' }}>{cat.label}</div>
            <div style={{ fontSize: '0.78rem', color: 'var(--s600)', marginTop: '2px' }}>{cat.subtitle}</div>
          </div>

          {/* Count */}
          <span style={{ fontSize: '0.82rem', color: 'var(--s600)' }}>
            {hasItems ? `${matching.length} item${matching.length === 1 ? '' : 's'}` : '0'}
          </span>

          {/* Chevron */}
          <span style={{ color: 'var(--s400)', fontSize: '0.75rem', transform: isExpanded ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 120ms' }}>
            ▼
          </span>
        </button>

        {isExpanded && (
          <div style={{ borderTop: '1px solid var(--border)', padding: '16px', background: 'var(--s50)' }}>
            {cat.examples && (
              <p style={{ margin: 0, marginBottom: '8px', fontSize: '0.82rem', color: 'var(--s700)' }}>
                <strong>Examples:</strong> {cat.examples}
              </p>
            )}
            {cat.docRequired && (
              <p style={{
                margin: 0, marginBottom: '12px',
                fontSize: '0.82rem', color: '#8A6A00',
              }}>
                <span style={{ marginRight: '4px' }}>⚠</span>
                Supporting documentation required for this category
              </p>
            )}

            {/* Items in this category */}
            {matching.map((item) => (
              <PropertyItemCard
                key={item.id}
                item={item}
                party1Name={party1Name}
                party2Name={party2Name}
                onEdit={() => setEditing(item)}
                onDelete={() => handleDelete(item.id)}
              />
            ))}

            {/* Add button OR inline editor */}
            {(creating?.item_type === itemType && creating?.category === cat.key) ? (
              <PropertyItemEditor
                initialData={{ owner: 'party1', item_type: itemType, category: cat.key }}
                docRequired={cat.docRequired}
                party1Name={party1Name}
                party2Name={party2Name}
                onSave={handleEditSave}
                onCancel={() => setCreating(null)}
                agreementId={bundle.agreement.id}
              />
            ) : (
              <button
                onClick={() => setCreating({ item_type: itemType, category: cat.key })}
                className="btn btn-sm"
                style={{
                  background: 'var(--s900)', color: '#fff', border: 'none',
                  marginTop: '8px',
                }}
              >+ Add {cat.label.replace(/s$/, '')}</button>
            )}
          </div>
        )}
      </div>
    )
  }

  if (editing) {
    return (
      <div style={cardStyle}>
        <PropertyItemEditor
          initialData={editing}
          docRequired={[...ASSET_CATEGORIES, ...DEBT_CATEGORIES].find((c) => c.key === editing.category)?.docRequired}
          party1Name={party1Name}
          party2Name={party2Name}
          onSave={handleEditSave}
          onCancel={() => setEditing(null)}
          agreementId={bundle.agreement.id}
        />
      </div>
    )
  }

  return (
    <>
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Net Family Property Statement</h3>
        <p style={{ marginTop: 0, marginBottom: '20px', color: 'var(--s600)', fontSize: '0.88rem' }}>
          List all assets and debts. Supporting documents are required for most items to verify values at separation.
        </p>

        <h4 style={{ marginTop: 0, marginBottom: '4px', fontSize: '1rem' }}>Assets</h4>
        <p style={{ marginTop: 0, marginBottom: '14px', color: 'var(--s600)', fontSize: '0.82rem' }}>
          List all assets owned by each party. Click on categories below to add items.
        </p>
        {ASSET_CATEGORIES.map((cat) => renderCategorySection(cat, 'asset'))}

        <h4 style={{ marginTop: '28px', marginBottom: '4px', fontSize: '1rem' }}>Debts and Liabilities</h4>
        <p style={{ marginTop: 0, marginBottom: '14px', color: 'var(--s600)', fontSize: '0.82rem' }}>
          List all debts owed by each party. Click on categories below to add items.
        </p>
        {DEBT_CATEGORIES.map((cat) => renderCategorySection(cat, 'debt'))}
      </div>
    </>
  )
}

// ─── Item card (collapsed view of a property item) ──────────────────────────
function PropertyItemCard({ item, party1Name, party2Name, onEdit, onDelete }) {
  const ownerLabel = item.owner === 'party1' ? party1Name : item.owner === 'party2' ? party2Name : 'Joint'
  const ownerColor = item.owner === 'joint' ? 'var(--s700)' : 'var(--v)'
  const typeLabel = item.item_type === 'debt' ? 'Debt' : 'Asset'
  const typeColor = item.item_type === 'debt' ? '#C75C5C' : 'var(--success)'

  return (
    <div style={{
      background: '#fff',
      border: '1px solid var(--border)',
      borderRadius: 'var(--rs)',
      padding: '12px 14px',
      marginBottom: '8px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'flex-start',
      gap: '12px',
    }}>
      <div style={{ flex: 1 }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '6px' }}>
          <Tag label={ownerLabel} color={ownerColor} bg="var(--vx)" />
          <Tag label={typeLabel} color={typeColor} bg={item.item_type === 'debt' ? '#FDEBEB' : '#E7FAF1'} />
          {item.document_url && (
            <Tag label="📄 Document" color="var(--v)" bg="var(--vx)" />
          )}
          {item.is_matrimonial_home && (
            <Tag label="Matrimonial Home" color="var(--v)" bg="var(--vx)" />
          )}
          {item.is_excluded && (
            <Tag label="Excluded Property" color="#7B4F9E" bg="#F4EBFC" />
          )}
        </div>
        <div style={{ fontWeight: 600, fontSize: '0.92rem', color: 'var(--s900)' }}>
          {item.description || '(no description)'}
        </div>
        <div style={{ fontSize: '0.82rem', color: 'var(--s600)', marginTop: '2px' }}>
          At Separation: <strong>${(Number(item.value_at_separation) || 0).toLocaleString('en-CA')}</strong>
          {Number(item.value_at_marriage) > 0 && !item.is_matrimonial_home && (
            <> · At Marriage: ${(Number(item.value_at_marriage) || 0).toLocaleString('en-CA')}</>
          )}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '6px' }}>
        <button onClick={onEdit} className="btn btn-ghost btn-sm" style={{ fontSize: '0.82rem' }}>Edit</button>
        <button onClick={onDelete} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', fontSize: '1rem' }} title="Delete">🗑</button>
      </div>
    </div>
  )
}

function Tag({ label, color, bg }) {
  return (
    <span style={{
      display: 'inline-block',
      padding: '2px 8px',
      borderRadius: '4px',
      background: bg,
      color: color,
      fontSize: '0.72rem',
      fontWeight: 600,
    }}>{label}</span>
  )
}
