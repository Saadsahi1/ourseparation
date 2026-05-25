'use client'
import FormField from '../shared/FormField'

export default function ChildrenList({ agreementId, children, onChange, party1Name, party2Name, getChildAge }) {
  const addChild = async () => {
    await onChange('children', { full_name: '', birth_date: null, primary_residence: 'shared' }, { method: 'POST' })
  }

  const updateChild = async (childId, patch) => {
    await onChange('children', patch, { method: 'PUT', pathSuffix: `/${childId}` })
  }

  const removeChild = async (childId) => {
    if (!confirm('Remove this child from the agreement?')) return
    await onChange('children', null, { method: 'DELETE', pathSuffix: `/${childId}` })
  }

  const residenceOptions = [
    { value: 'party1', label: `${party1Name} (primary)` },
    { value: 'party2', label: `${party2Name} (primary)` },
    { value: 'shared', label: 'Shared / Equal' },
  ]

  return (
    <div>
      {(children || []).length === 0 && (
        <p style={{ color: 'var(--s400)', fontStyle: 'italic', marginBottom: '12px' }}>No children added yet.</p>
      )}

      {(children || []).map((c) => (
        <div key={c.id} style={{
          border: '1px solid var(--border)',
          borderRadius: 'var(--rs)',
          padding: '14px',
          marginBottom: '10px',
          background: 'var(--s50)',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1.5fr auto', gap: '10px', alignItems: 'end' }}>
            <FormField
              label="Full Legal Name"
              value={c.full_name || ''}
              onSave={(v) => updateChild(c.id, { full_name: v })}
            />
            <FormField
              label="Date of Birth"
              type="date"
              value={c.birth_date || ''}
              onSave={(v) => updateChild(c.id, { birth_date: v })}
              hint={c.birth_date ? `Age ${getChildAge(c.birth_date)}` : ''}
            />
            <FormField
              label="Primary Residence"
              type="select"
              options={residenceOptions}
              value={c.primary_residence || 'shared'}
              onSave={(v) => updateChild(c.id, { primary_residence: v })}
            />
            <button
              onClick={() => removeChild(c.id)}
              className="btn btn-ghost btn-sm"
              style={{ color: 'var(--danger)', height: '40px' }}
              title="Remove this child"
            >Remove</button>
          </div>
        </div>
      ))}

      <button
        onClick={addChild}
        className="btn btn-outline btn-sm"
        style={{ marginTop: '8px' }}
      >+ Add a Child</button>
    </div>
  )
}
