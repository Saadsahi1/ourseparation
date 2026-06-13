'use client'
import { SPECIAL_CLAUSE_TEMPLATES } from '@/lib/agreements/templateLibrary'
import FormField from '../shared/FormField'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const catalogCardStyle = (added) => ({
  border: `1px solid ${added ? 'var(--v)' : 'var(--border)'}`,
  borderRadius: 'var(--rs)',
  padding: '16px',
  background: added ? 'rgba(99, 102, 241, 0.04)' : '#fff',
  display: 'flex',
  flexDirection: 'column',
  height: '100%',
  boxShadow: 'var(--sh-xs)',
})

const selectedCardStyle = {
  border: '1px solid var(--border)', borderRadius: 'var(--rs)',
  padding: '14px', marginBottom: '10px', background: 'var(--s50)',
}

export default function SpecialClauses({ bundle, save }) {
  const clauses = bundle.specialClauses || []

  // Track which clause types are already added (so the catalog card can
  // show "Already added" instead of the Add button — except for "other"
  // which can be added multiple times).
  const addedTypes = new Set(clauses.map((c) => c.clause_type))

  const addClause = async (clauseType) => {
    const tpl = SPECIAL_CLAUSE_TEMPLATES[clauseType]
    const defaults = tpl?.defaults || {}
    await save('special-clauses', {
      clause_type: clauseType,
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

  return (
    <div>
      {/* Catalog of available clauses */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Special Parenting Clauses</h3>
        <p style={{ marginTop: 0, marginBottom: '20px', color: 'var(--s600)', fontSize: '0.9rem' }}>
          Pick from the clauses below. Each one shows what it does in plain language and what it will say in your agreement. Click <strong>Add to agreement</strong> on the ones you want — you can edit the details after adding.
        </p>

        <div style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
          gap: '14px',
        }}>
          {Object.entries(SPECIAL_CLAUSE_TEMPLATES).map(([key, tpl]) => {
            const added = key !== 'other' && addedTypes.has(key)
            // Render preview from defaults so the user sees the actual clause language
            let preview = ''
            if (key !== 'other') {
              try {
                preview = tpl.template({ ...(tpl.defaults || {}) })
              } catch (e) {}
            }

            return (
              <div key={key} style={catalogCardStyle(added)}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <span style={{ fontSize: '1.4rem' }} aria-hidden>{tpl.icon}</span>
                  <strong style={{ fontSize: '0.95rem' }}>{tpl.label}</strong>
                </div>
                <p style={{ margin: 0, marginBottom: '10px', fontSize: '0.85rem', color: 'var(--s700)', lineHeight: 1.45 }}>
                  {tpl.description}
                </p>
                {preview && (
                  <p style={{
                    margin: 0, marginBottom: '12px',
                    fontSize: '0.78rem', color: 'var(--s600)',
                    background: 'var(--s50)', padding: '8px 10px', borderRadius: 'var(--rs)',
                    border: '1px solid var(--border)', fontStyle: 'italic',
                    lineHeight: 1.4,
                  }}>
                    <span style={{ fontStyle: 'normal', fontWeight: 600, display: 'block', marginBottom: '4px', color: 'var(--s500)', fontSize: '0.72rem', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                      Example clause text
                    </span>
                    {preview}
                  </p>
                )}
                <div style={{ marginTop: 'auto' }}>
                  {added ? (
                    <span style={{
                      display: 'inline-flex', alignItems: 'center', gap: '6px',
                      fontSize: '0.85rem', fontWeight: 600, color: 'var(--v)',
                    }}>✓ Added to agreement</span>
                  ) : (
                    <button
                      onClick={() => addClause(key)}
                      className="btn btn-primary btn-sm"
                    >+ Add to agreement</button>
                  )}
                </div>
              </div>
            )
          })}
        </div>
      </div>

      {/* Your selected clauses (editable) */}
      {clauses.length > 0 && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Your Selected Clauses</h3>
          <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
            Fine-tune the details for each clause you've added. Changes save as you type.
          </p>

          {clauses.map((c) => {
            const tpl = SPECIAL_CLAUSE_TEMPLATES[c.clause_type]
            if (!tpl) return null
            const vars = c.variables || {}
            let preview = ''
            if (tpl.template) {
              try { preview = tpl.template({ ...vars, customText: c.custom_text }) } catch (e) {}
            }

            return (
              <div key={c.id} style={selectedCardStyle}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                  <strong style={{ fontSize: '0.9rem' }}>
                    <span style={{ marginRight: '6px' }} aria-hidden>{tpl.icon}</span>
                    {tpl.label}
                  </strong>
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
      )}
    </div>
  )
}

function prettify(name) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
