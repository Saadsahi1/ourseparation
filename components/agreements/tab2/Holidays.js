'use client'
import { HOLIDAY_ARRANGEMENT_TEMPLATES } from '@/lib/agreements/templateLibrary'
import { resolveParentalNames } from '@/lib/agreements/utils'
import FormField from '../shared/FormField'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

export default function Holidays({ bundle, save, party1Name, party2Name, user }) {
  const a = bundle.agreement
  const templates = bundle.holidayTemplates || []
  const arrangements = bundle.holidays || []

  const { motherName, fatherName } = resolveParentalNames(a, user)

  const findArrangement = (name) => arrangements.find((h) => h.holiday_name === name)

  const saveHoliday = (holiday_name, patch) => {
    return save('holidays', { holiday_name, ...patch }, { method: 'PUT' })
  }

  const categories = [
    { key: 'statutory', label: 'Statutory Holidays' },
    { key: 'religious', label: 'Religious Holidays' },
    { key: 'family', label: 'Family / Personal' },
  ]

  return (
    <div>
      <div style={{
        background: 'var(--vx)', border: '1px solid var(--vc)',
        borderRadius: 'var(--rs)', padding: '12px 16px', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--s800)',
      }}>
        💡 Pick an arrangement for at least 5 holidays to mark this section complete. Leave others blank if they don't apply.
      </div>

      {categories.map(({ key, label }) => {
        const items = templates.filter((t) => t.category === key)
        if (items.length === 0) return null
        return (
          <div key={key} style={cardStyle}>
            <h3 style={{ marginTop: 0, marginBottom: '16px' }}>{label}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {items.map((h) => {
                const arr = findArrangement(h.holiday_name)
                const opts = (h.preset_options || []).map((o) => ({ value: o.value, label: o.label }))
                const previewFn = HOLIDAY_ARRANGEMENT_TEMPLATES[arr?.arrangement]
                const previewText = previewFn ? previewFn({
                  holidayName: h.holiday_name,
                  motherName, fatherName,
                  party1: party1Name, party2: party2Name,
                }) : ''

                return (
                  <div key={h.holiday_name} style={{
                    border: '1px solid var(--border)', borderRadius: 'var(--rs)',
                    padding: '12px 14px', background: 'var(--s50)',
                  }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 2fr', gap: '12px', alignItems: 'start' }}>
                      <div style={{ fontWeight: 600, fontSize: '0.9rem', paddingTop: '10px' }}>{h.holiday_name}</div>
                      <FormField
                        type="select"
                        options={opts}
                        value={arr?.arrangement || ''}
                        placeholder="No specific arrangement"
                        onSave={(v) => saveHoliday(h.holiday_name, { arrangement: v })}
                      />
                    </div>
                    {previewText && (
                      <p style={{
                        margin: '6px 0 0 0', fontSize: '0.82rem',
                        color: 'var(--s600)', fontStyle: 'italic', paddingLeft: '4px',
                      }}>{previewText}</p>
                    )}
                  </div>
                )
              })}
            </div>
          </div>
        )
      })}
    </div>
  )
}
