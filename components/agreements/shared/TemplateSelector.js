'use client'
import { useState, useEffect } from 'react'
import FormField from './FormField'

// Generic dropdown-based template picker.
// Once a template is selected, render variable inputs based on the template's `variables` array.
// Also renders a live "preview" of the resulting clause text below.
//
// props:
//   templates: object { key: { label, variables, template, defaults } }
//   value: { template: key, variables: {...} }
//   onChange: (next) => void
//   substitutionContext: extra vars merged into template() — e.g. { party1, party2 }
//   variableLabels: optional { varName: 'Human Label' }
//   variableTypes: optional { varName: 'date' | 'number' | 'text' }
//   variableOptions: optional { varName: [{value, label}] }
export default function TemplateSelector({
  templates, value, onChange, substitutionContext = {},
  variableLabels = {}, variableTypes = {}, variableOptions = {},
  emptyLabel = 'Select a template…',
}) {
  const tplKey = value?.template || ''
  const vars = value?.variables || {}
  const tpl = templates[tplKey]

  const handleTemplateChange = (newKey) => {
    const t = templates[newKey]
    const defaults = t?.defaults || {}
    onChange({ template: newKey || null, variables: defaults })
  }

  const handleVarChange = (varName, newVal) => {
    onChange({ template: tplKey, variables: { ...vars, [varName]: newVal } })
  }

  // Render preview text from the function template (or string with {{var}})
  let preview = ''
  if (tpl && typeof tpl.template === 'function') {
    try {
      preview = tpl.template({ ...substitutionContext, ...vars })
    } catch (err) {
      preview = ''
    }
  }

  const templateOptions = Object.entries(templates).map(([k, t]) => ({ value: k, label: t.label }))

  return (
    <div>
      <FormField
        label="Template"
        type="select"
        value={tplKey}
        options={templateOptions}
        onSave={handleTemplateChange}
        placeholder={emptyLabel}
      />

      {tpl && (tpl.variables || []).length > 0 && (
        <div style={{
          background: 'var(--s50)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rs)',
          padding: '14px',
          marginBottom: '14px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {tpl.variables.map((v) => {
              const opts = variableOptions[v]
              const type = variableTypes[v] || (v.includes('date') ? 'date' : (v.includes('amount') || v.includes('Income') || v.includes('hours') || v.includes('days') || v.includes('months') || v.includes('count') || v.includes('percentage')) ? 'number' : 'text')
              return (
                <FormField
                  key={v}
                  label={variableLabels[v] || prettify(v)}
                  type={opts ? 'select' : type}
                  options={opts}
                  value={vars[v] ?? ''}
                  onSave={(newVal) => handleVarChange(v, newVal)}
                />
              )
            })}
          </div>
        </div>
      )}

      {preview && (
        <div style={{
          background: 'var(--vx)',
          border: '1px solid var(--vc)',
          borderRadius: 'var(--rs)',
          padding: '12px 14px',
          marginBottom: '14px',
        }}>
          <div style={{ fontSize: '0.72rem', fontWeight: 700, color: 'var(--v)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
            Clause Preview
          </div>
          <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--s800)', lineHeight: 1.55 }}>{preview}</p>
        </div>
      )}
    </div>
  )
}

function prettify(name) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}
