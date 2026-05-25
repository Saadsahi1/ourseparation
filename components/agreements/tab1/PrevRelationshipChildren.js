'use client'
import FormField from '../shared/FormField'

export default function PrevRelationshipChildren({ agreementId, items, onChange }) {
  const add = async () => {
    await onChange('prev-children', { party: 'party1', full_name: '' }, { method: 'POST' })
  }
  const update = async (id, patch) => {
    await onChange('prev-children', patch, { method: 'PUT', pathSuffix: `/${id}` })
  }
  const remove = async (id) => {
    if (!confirm('Remove this entry?')) return
    await onChange('prev-children', null, { method: 'DELETE', pathSuffix: `/${id}` })
  }

  return (
    <div>
      {items.length === 0 && (
        <p style={{ color: 'var(--s400)', fontStyle: 'italic', marginBottom: '12px' }}>No previous-relationship children added.</p>
      )}

      {items.map((c) => (
        <div key={c.id} style={{
          border: '1px solid var(--border)', borderRadius: 'var(--rs)',
          padding: '14px', marginBottom: '10px', background: 'var(--s50)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.5fr 1fr auto', gap: '10px', alignItems: 'end' }}>
            <FormField
              label="Which Party's Child"
              type="select"
              options={[{ value: 'party1', label: 'Party 1' }, { value: 'party2', label: 'Party 2' }]}
              value={c.party || 'party1'}
              onSave={(v) => update(c.id, { party: v })}
            />
            <FormField
              label="Full Legal Name"
              value={c.full_name || ''}
              onSave={(v) => update(c.id, { full_name: v })}
            />
            <FormField
              label="Date of Birth"
              type="date"
              value={c.birth_date || ''}
              onSave={(v) => update(c.id, { birth_date: v })}
            />
            <button onClick={() => remove(c.id)} className="btn btn-ghost btn-sm" style={{ color: 'var(--danger)', height: '40px' }}>Remove</button>
          </div>
          <div style={{ display: 'flex', gap: '20px', marginTop: '10px', flexWrap: 'wrap' }}>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={Boolean(c.lived_with_parties)} onChange={(e) => update(c.id, { lived_with_parties: e.target.checked })} />
              Lived with the parties
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={Boolean(c.stood_in_loco_parentis)} onChange={(e) => update(c.id, { stood_in_loco_parentis: e.target.checked })} />
              Stood <em style={{ marginLeft: '2px' }}>in loco parentis</em>
            </label>
            <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem' }}>
              <input type="checkbox" checked={Boolean(c.has_support_obligation)} onChange={(e) => update(c.id, { has_support_obligation: e.target.checked })} />
              Has support obligation
            </label>
          </div>
        </div>
      ))}

      <button onClick={add} className="btn btn-outline btn-sm" style={{ marginTop: '8px' }}>
        + Add Previous-Relationship Child
      </button>
    </div>
  )
}
