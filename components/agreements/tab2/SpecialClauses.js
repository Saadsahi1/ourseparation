'use client'
import { useState } from 'react'
import { SPECIAL_CLAUSE_TEMPLATES } from '@/lib/agreements/templateLibrary'
import FormField from '../shared/FormField'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const clauseCardStyle = {
  border: '1px solid var(--border)', borderRadius: 'var(--rs)',
  padding: '14px', marginBottom: '10px', background: 'var(--s50)',
}

export default function SpecialClauses({ bundle, save }) {
  const clauses = bundle.specialClauses || []
  const [selectedType, setSelectedType] = useState('right_first_refusal')

  const addClause = async () => {
    const tpl = SPECIAL_CLAUSE_TEMPLATES[selectedType]
    const defaults = tpl?.defaults || {}
    await save('special-clauses', {
      clause_type: selectedType,
      variables: defaults,
      display_order: clauses.length,
    }, { method: 'POST' })
  }

  const updateClause = async (clauseId, patch) => {
    await save('special-clauses', patch, { method: 'PUT', pathSuffix: `/${clauseId}` })
  }

  const removeClause = async (clauseId) => {
    if (!confirm('Remove this clause?')) return
    await save('special-clauses', null, { method: 'DELETE', pathSuffix: `/${clauseId}` })
  }

  const typeOptions = Object.entries(SPECIAL_CLAUSE_TEMPLATES).map(([k, t]) => ({ value: k, label: t.label }))

  return (
    <div>
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Special Parenting Clauses</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Add optional clauses about right of first refusal, relocation, travel, new partners, social media, or any custom term.
        </p>

        <div style={{ display: 'flex', gap: '8px', alignItems: 'end', marginBottom: '20px' }}>
          <div style={{ flex: 1 }}>
            <FormField
              label="Clause Type"
              type="select"
              options={typeOptions}
              value={selectedType}
              onSave={setSelectedType}
            />
          </div>
          <button onClick={addClause} className="btn btn-primary btn-sm" style={{ height: '40px' }}>+ Add Clause</button>
        </div>

        {clauses.length === 0 && (
          <p style={{ color: 'var(--s400)', fontStyle: 'italic' }}>No special clauses added yet.</p>
        )}

        {clauses.map((c) => {
          const tpl = SPECIAL_CLAUSE_TEMPLATES[c.clause_type]
          if (!tpl) return null
          const vars = c.variables || {}
          let preview = ''
          if (tpl.template) {
            try { preview = tpl.template({ ...vars, customText: c.custom_text }) } catch (e) {}
          }

          return (
            <div key={c.id} style={clauseCardStyle}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                <strong style={{ fontSize: '0.9rem' }}>{tpl.label}</strong>
                <button onClick={() => removeClause(c.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)' }}>Remove</button>
              </div>

              {c.clause_type === 'other' ? (
                <FormField
                  label="Custom Clause Text"
                  type="textarea"
                  rows={4}
                  value={c.custom_text || ''}
                  onSave={(v) => updateClause(c.id, { custom_text: v })}
                />
              ) : (tpl.variables || []).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '10px' }}>
                  {tpl.variables.map((v) => (
                    <FormField
                      key={v}
                      label={prettify(v)}
                      type={v.includes('hours') || v.includes('days') || v.includes('months') || v.includes('distance') ? 'number' : 'text'}
                      value={vars[v] ?? ''}
                      onSave={(newVal) => updateClause(c.id, { variables: { ...vars, [v]: newVal } })}
                    />
                  ))}
                </div>
              ) : null}

              {preview && (
                <p style={{
                  marginTop: '10px', marginBottom: 0,
                  fontSize: '0.85rem', color: 'var(--s800)',
                  background: '#fff', padding: '10px 12px', borderRadius: 'var(--rs)',
                  border: '1px solid var(--border)',
                }}>{preview}</p>
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function prettify(name) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
