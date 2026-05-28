'use client'
import { useState, useEffect, useId } from 'react'

const baseLabelStyle = {
  display: 'block',
  fontSize: '0.78rem',
  fontWeight: 600,
  color: 'var(--s600)',
  marginBottom: '6px',
  letterSpacing: '0.02em',
  textTransform: 'uppercase',
}

const baseInputStyle = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--border)',
  borderRadius: 'var(--rs)',
  fontSize: '0.92rem',
  color: 'var(--s900)',
  background: '#fff',
  fontFamily: 'inherit',
  outline: 'none',
  transition: 'border-color 120ms',
}

// Postgres DATE columns serialize back through JSON as ISO strings
// like "2026-05-15T00:00:00.000Z". HTML <input type="date"> needs the
// pure "YYYY-MM-DD" form, otherwise it renders empty. Normalize here.
function normalizeDateValue(v) {
  if (v == null || v === '') return ''
  if (typeof v !== 'string') {
    try { return new Date(v).toISOString().slice(0, 10) } catch { return '' }
  }
  // already YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(v)) return v
  // ISO 8601 (e.g. "2026-05-15T00:00:00.000Z")
  if (/^\d{4}-\d{2}-\d{2}T/.test(v)) return v.slice(0, 10)
  // fall back to Date parsing
  const d = new Date(v)
  return isNaN(d.getTime()) ? '' : d.toISOString().slice(0, 10)
}

// Debounced-blur input. Tracks local state, calls onSave on blur with the value.
// type 'autocomplete' renders a free-text input bound to a <datalist> of options,
// letting users pick a suggestion OR type a custom value.
export default function FormField({
  label, value, onSave, type = 'text', placeholder, options, rows, hint,
  disabled, prefix, required, min, max, step, width, datalistOptions,
}) {
  const initialValue = type === 'date' ? normalizeDateValue(value) : (value ?? '')
  const [localValue, setLocalValue] = useState(initialValue)
  const listId = useId()

  useEffect(() => {
    setLocalValue(type === 'date' ? normalizeDateValue(value) : (value ?? ''))
  }, [value, type])

  const commit = () => {
    if (localValue !== (value ?? '')) {
      onSave && onSave(localValue === '' ? null : localValue)
    }
  }

  const inputStyle = {
    ...baseInputStyle,
    background: disabled ? 'var(--s50)' : '#fff',
    color: disabled ? 'var(--s400)' : 'var(--s900)',
    paddingLeft: prefix ? '28px' : '12px',
  }

  return (
    <div style={{ marginBottom: '14px', width: width || '100%' }}>
      {label ? (
        <label style={baseLabelStyle}>
          {label}{required && <span style={{ color: 'var(--danger)', marginLeft: '4px' }}>*</span>}
        </label>
      ) : null}
      <div style={{ position: 'relative' }}>
        {prefix && (
          <span style={{
            position: 'absolute', left: '10px', top: '50%', transform: 'translateY(-50%)',
            color: 'var(--s400)', fontSize: '0.92rem', pointerEvents: 'none',
          }}>{prefix}</span>
        )}

        {type === 'select' ? (
          <select
            value={localValue}
            onChange={(e) => { setLocalValue(e.target.value); onSave && onSave(e.target.value === '' ? null : e.target.value) }}
            disabled={disabled}
            style={inputStyle}
          >
            <option value="">{placeholder || 'Select…'}</option>
            {options?.map((o) => (
              <option key={o.value} value={o.value}>{o.label}</option>
            ))}
          </select>
        ) : type === 'textarea' ? (
          <textarea
            value={localValue}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={commit}
            placeholder={placeholder}
            disabled={disabled}
            rows={rows || 3}
            style={{ ...inputStyle, resize: 'vertical', minHeight: '80px' }}
          />
        ) : type === 'checkbox' ? (
          <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', cursor: 'pointer' }}>
            <input
              type="checkbox"
              checked={Boolean(localValue)}
              onChange={(e) => { setLocalValue(e.target.checked); onSave && onSave(e.target.checked) }}
              disabled={disabled}
            />
            {hint && <span style={{ fontSize: '0.9rem', color: 'var(--s800)' }}>{hint}</span>}
          </label>
        ) : type === 'autocomplete' ? (
          <>
            <input
              type="text"
              list={listId}
              value={localValue}
              onChange={(e) => setLocalValue(e.target.value)}
              onBlur={commit}
              placeholder={placeholder || 'Type or choose…'}
              disabled={disabled}
              style={inputStyle}
            />
            <datalist id={listId}>
              {(datalistOptions || []).map((o) => (
                <option key={typeof o === 'string' ? o : o.value} value={typeof o === 'string' ? o : (o.value || o.label)}>
                  {typeof o === 'string' ? o : o.label}
                </option>
              ))}
            </datalist>
          </>
        ) : (
          <input
            type={type}
            value={localValue}
            min={min} max={max} step={step}
            onChange={(e) => setLocalValue(e.target.value)}
            onBlur={commit}
            placeholder={placeholder}
            disabled={disabled}
            style={inputStyle}
          />
        )}
      </div>
      {hint && type !== 'checkbox' && (
        <p style={{ fontSize: '0.78rem', color: 'var(--s400)', marginTop: '4px', marginBottom: 0 }}>{hint}</p>
      )}
    </div>
  )
}
