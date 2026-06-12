'use client'
import { useState } from 'react'
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

  const removeHoliday = async (holiday_name) => {
    if (!confirm(`Remove "${holiday_name}" from this agreement?`)) return
    await save('holidays', null, { method: 'DELETE', pathSuffix: `?holiday_name=${encodeURIComponent(holiday_name)}` })
  }

  const categories = [
    { key: 'statutory', label: 'Statutory Holidays' },
    { key: 'religious', label: 'Religious Holidays' },
    { key: 'family', label: 'Family / Personal' },
  ]

  // Default to the first arrangement option from any template so the picker
  // has a sensible starting value. (Religious presets work for most generic
  // holidays.)
  const defaultOpts = (templates.find((t) => t.category === 'religious') || templates[0])?.preset_options || []

  // Treat any saved arrangement whose holiday_name doesn't match a known
  // template as a user-added custom holiday.
  const knownNames = new Set(templates.map((t) => t.holiday_name))
  const customHolidays = arrangements.filter((a) => !knownNames.has(a.holiday_name))

  return (
    <div>
      <div style={{
        background: 'var(--vx)', border: '1px solid var(--vc)',
        borderRadius: 'var(--rs)', padding: '12px 16px', marginBottom: '20px', fontSize: '0.85rem', color: 'var(--s800)',
      }}>
        💡 Pick an arrangement for at least 5 holidays to mark this section complete. Leave others blank if they don't apply. If a holiday or religious observance you celebrate isn't listed below, add it as a custom holiday at the bottom of this page.
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

      {/* Custom holidays — religious observances or anything else not in the preset list */}
      <CustomHolidaysCard
        customHolidays={customHolidays}
        defaultOpts={defaultOpts}
        motherName={motherName}
        fatherName={fatherName}
        party1Name={party1Name}
        party2Name={party2Name}
        onSave={saveHoliday}
        onRemove={removeHoliday}
      />
    </div>
  )
}

function CustomHolidaysCard({ customHolidays, defaultOpts, motherName, fatherName, party1Name, party2Name, onSave, onRemove }) {
  const [newName, setNewName] = useState('')

  const opts = defaultOpts.map((o) => ({ value: o.value, label: o.label }))

  const handleAdd = async () => {
    const name = newName.trim()
    if (!name) return
    // Default arrangement = first preset option so the row has a value the
    // template renderer can pick up immediately.
    const firstArrangement = opts[0]?.value || 'alternating_yearly'
    await onSave(name, { arrangement: firstArrangement })
    setNewName('')
  }

  return (
    <div style={cardStyle}>
      <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Other Holidays & Religious Observances</h3>
      <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
        Add any holiday or religious observance not listed above (for example: Diwali, Eid, Lunar New Year, Vaisakhi, a family birthday). It will appear in the agreement with the arrangement you pick.
      </p>

      {customHolidays.length > 0 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginBottom: '16px' }}>
          {customHolidays.map((arr) => {
            const previewFn = HOLIDAY_ARRANGEMENT_TEMPLATES[arr.arrangement]
            const previewText = previewFn ? previewFn({
              holidayName: arr.holiday_name,
              motherName, fatherName,
              party1: party1Name, party2: party2Name,
            }) : ''
            return (
              <div key={arr.holiday_name} style={{
                border: '1px solid var(--border)', borderRadius: 'var(--rs)',
                padding: '12px 14px', background: 'var(--s50)',
              }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1.4fr 2fr auto', gap: '12px', alignItems: 'start' }}>
                  <div style={{ fontWeight: 600, fontSize: '0.9rem', paddingTop: '10px' }}>{arr.holiday_name}</div>
                  <FormField
                    type="select"
                    options={opts}
                    value={arr.arrangement || ''}
                    placeholder="No specific arrangement"
                    onSave={(v) => onSave(arr.holiday_name, { arrangement: v })}
                  />
                  <button
                    onClick={() => onRemove(arr.holiday_name)}
                    className="btn btn-ghost btn-sm"
                    style={{ color: 'var(--danger)', marginTop: '6px' }}
                  >Remove</button>
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
      )}

      <div style={{
        display: 'grid', gridTemplateColumns: '1fr auto', gap: '10px', alignItems: 'end',
        border: '1px dashed var(--border)', borderRadius: 'var(--rs)', padding: '12px',
      }}>
        <FormField
          label="Holiday or Observance Name"
          value={newName}
          placeholder="e.g. Diwali, Eid al-Fitr, Lunar New Year"
          onSave={setNewName}
        />
        <button
          onClick={handleAdd}
          disabled={!newName.trim()}
          className="btn btn-primary btn-sm"
          style={{ height: '40px' }}
        >+ Add Holiday</button>
      </div>
    </div>
  )
}
