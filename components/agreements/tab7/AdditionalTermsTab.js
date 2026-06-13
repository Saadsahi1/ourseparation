'use client'
import { useEffect } from 'react'
import FormField from '../shared/FormField'
import SaveBar from '../shared/SaveBar'
import useDirtyBuffer, { useDirtyRegistry, useRegisterBuffer } from '../shared/useDirtyBuffer'
import {
  LIFE_INSURANCE_TEMPLATES,
  DISCLOSURE_TEMPLATES,
  TAX_PROVISION_TEMPLATES,
  DISPUTE_RESOLUTION_TEMPLATES,
} from '@/lib/agreements/templateLibrary'

const TERM_SECTIONS = [
  {
    key: 'insurance',
    title: 'Life Insurance',
    shortTitle: 'Insurance',
    summary: 'Protects support or payment obligations if a paying party dies before obligations end.',
    fieldPrefix: 'insurance',
    templates: LIFE_INSURANCE_TEMPLATES,
    helpByTemplate: {
      basic_life_insurance: 'Best when one party should keep a fixed amount of coverage while support or financial obligations remain.',
      declining_insurance: 'Best when the required coverage should reduce over time as the financial exposure gets smaller.',
      support_tied_insurance: 'Best when insurance should specifically secure child or spousal support obligations.',
    },
    variableLabels: {
      insured_party: 'Insured Party',
      coverage_amount: 'Coverage Amount',
      beneficiary: 'Beneficiary',
      initial_amount: 'Initial Amount',
      decline_schedule: 'Decline Schedule',
    },
  },
  {
    key: 'disclosure',
    title: 'Financial Disclosure',
    shortTitle: 'Disclosure',
    summary: 'Sets when updated income and financial documents must be exchanged.',
    fieldPrefix: 'disclosure',
    templates: DISCLOSURE_TEMPLATES,
    helpByTemplate: {
      annual_disclosure: 'Best for predictable yearly income updates, especially where support may need review.',
      on_request_disclosure: 'Best when either party should be able to request updated documents when needed.',
      event_triggered_disclosure: 'Best when disclosure should happen after major income, employment, or business changes.',
    },
    variableLabels: {
      disclosure_date: 'Disclosure Date',
      response_days: 'Response Time (days)',
      threshold_percentage: 'Income Change Threshold (%)',
    },
  },
  {
    key: 'tax',
    title: 'Tax Provisions',
    shortTitle: 'Tax',
    summary: 'Addresses child benefits, tax credits, and tax treatment of support payments.',
    fieldPrefix: 'tax',
    templates: TAX_PROVISION_TEMPLATES,
    helpByTemplate: {
      standard_tax_allocation: 'Best when one party will receive the Canada Child Benefit and the agreement should say so clearly.',
      alternating_tax_credits: 'Best when the parties will alternate eligible dependant claims by year.',
      shared_tax_benefits: 'Best for equal shared parenting where tax benefits should be divided between the parties.',
    },
    variableLabels: {
      ccb_party: 'CCB-Receiving Party',
      first_year_party: 'Party Claiming in First Year',
      children_count: 'Number of Children Each Party Claims',
    },
  },
  {
    key: 'dispute',
    title: 'Dispute Resolution',
    shortTitle: 'Disputes',
    summary: 'Creates a path for resolving future disagreements before going back to court.',
    fieldPrefix: 'dispute',
    templates: DISPUTE_RESOLUTION_TEMPLATES,
    helpByTemplate: {
      mandatory_mediation: 'Best as a first step when the parties should try mediation before court.',
      mediation_arbitration: 'Best when the parties want a private process that can lead to a binding decision.',
      parenting_coordinator: 'Best for recurring day-to-day parenting disagreements after the agreement is signed.',
    },
    variableLabels: { selection_days: 'Mediator Selection Window (days)' },
  },
]

const cardStyle = {
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r)',
  padding: '22px',
  marginBottom: '18px',
  boxShadow: 'var(--sh-xs)',
}

const menuCardStyle = {
  display: 'block',
  textDecoration: 'none',
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 'var(--rs)',
  padding: '14px',
  color: 'inherit',
  boxShadow: 'var(--sh-xs)',
}

function prettify(name) {
  return name.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase())
}

function inferType(name) {
  if (name.includes('date')) return 'date'
  if (
    name.includes('amount') ||
    name.includes('days') ||
    name.includes('count') ||
    name.includes('percentage')
  ) return 'number'
  return 'text'
}

function buildPreview(tpl, substitutionContext, vars) {
  if (!tpl || typeof tpl.template !== 'function') return ''
  try {
    return tpl.template({ ...substitutionContext, ...vars })
  } catch {
    return ''
  }
}

function TermSection({
  section,
  value,
  variables,
  onChange,
  substitutionContext,
  variableOptions,
}) {
  const selected = value || ''
  const selectedTpl = section.templates[selected]
  const preview = buildPreview(selectedTpl, substitutionContext, variables)

  const chooseTemplate = (templateKey) => {
    if (!templateKey) {
      onChange({ template: null, variables: {} })
      return
    }
    const tpl = section.templates[templateKey]
    onChange({ template: templateKey, variables: tpl?.defaults || {} })
  }

  const changeVariable = (name, nextValue) => {
    onChange({ template: selected || null, variables: { ...variables, [name]: nextValue } })
  }

  return (
    <section id={`additional-${section.key}`} style={cardStyle}>
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: '14px', flexWrap: 'wrap' }}>
        <div>
          <h3 style={{ marginTop: 0, marginBottom: '4px' }}>{section.title}</h3>
          <p style={{ margin: 0, color: 'var(--s600)', fontSize: '0.87rem', lineHeight: 1.45 }}>
            {section.summary}
          </p>
        </div>
        <span style={{
          fontSize: '0.72rem',
          fontWeight: 700,
          color: selected ? 'var(--v)' : 'var(--s500)',
          background: selected ? 'var(--vx)' : 'var(--s50)',
          border: `1px solid ${selected ? 'var(--vc)' : 'var(--border)'}`,
          borderRadius: '999px',
          padding: '5px 9px',
          whiteSpace: 'nowrap',
        }}>
          {selected ? 'Included' : 'Optional'}
        </span>
      </div>

      <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', marginTop: '16px' }}>
        <button
          type="button"
          onClick={() => chooseTemplate(null)}
          className={selected ? 'btn btn-outline btn-sm' : 'btn btn-primary btn-sm'}
        >
          Not included
        </button>
        {Object.entries(section.templates).map(([key, tpl]) => (
          <button
            key={key}
            type="button"
            onClick={() => chooseTemplate(key)}
            className={selected === key ? 'btn btn-primary btn-sm' : 'btn btn-outline btn-sm'}
            style={{ maxWidth: '100%', whiteSpace: 'normal', textAlign: 'left' }}
          >
            {tpl.label}
          </button>
        ))}
      </div>

      {selectedTpl && (selectedTpl.variables || []).length > 0 && (
        <div style={{
          background: 'var(--s50)',
          border: '1px solid var(--border)',
          borderRadius: 'var(--rs)',
          padding: '14px',
          marginTop: '14px',
        }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '8px' }}>
            {selectedTpl.variables.map((name) => {
              const opts = variableOptions?.[name]
              return (
                <FormField
                  key={name}
                  label={section.variableLabels[name] || prettify(name)}
                  type={opts ? 'select' : inferType(name)}
                  options={opts}
                  value={variables[name] ?? ''}
                  onSave={(nextValue) => changeVariable(name, nextValue)}
                />
              )
            })}
          </div>
        </div>
      )}

      <div style={{
        background: selectedTpl ? 'var(--vx)' : 'var(--s50)',
        border: `1px solid ${selectedTpl ? 'var(--vc)' : 'var(--border)'}`,
        borderRadius: 'var(--rs)',
        padding: '13px 14px',
        marginTop: '14px',
      }}>
        <div style={{ fontSize: '0.72rem', fontWeight: 700, color: selectedTpl ? 'var(--v)' : 'var(--s500)', marginBottom: '6px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>
          Agreement Detail
        </div>
        <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--s800)', lineHeight: 1.55 }}>
          {selectedTpl
            ? (section.helpByTemplate[selected] || 'This option adds the selected clause to the agreement.')
            : 'No clause from this area will be added unless an option is selected.'}
        </p>
        {preview && (
          <p style={{ margin: '10px 0 0', fontSize: '0.84rem', color: 'var(--s700)', lineHeight: 1.55 }}>
            {preview}
          </p>
        )}
      </div>
    </section>
  )
}

export default function AdditionalTermsTab({ bundle, save, party1Name, party2Name, registerDirty, registerFooterSave }) {
  const registry = useDirtyRegistry()
  useEffect(() => {
    if (registerDirty) registerDirty(registry.isDirty)
  }, [registry.isDirty, registerDirty])
  useEffect(() => {
    if (registerFooterSave) registerFooterSave({ registry })
  }, [registry, registerFooterSave])

  const buf = useDirtyBuffer({
    serverValues: bundle.additionalTerms || {},
    onFlush: (patch) => save('additional-terms', patch),
    label: 'additional-terms',
  })
  useRegisterBuffer(registry, buf)
  const t = buf.values

  const saveT = (patch) => {
    for (const [k, v] of Object.entries(patch)) buf.setValue(k, v)
  }

  const subContext = {
    party1: party1Name,
    party2: party2Name,
  }

  const insurancePartyValue = t.insurance_variables?.insured_party
  const insuredName = insurancePartyValue === 'party2' ? party2Name : (insurancePartyValue === 'party1' ? party1Name : '[Insured Party]')

  const ccbPartyValue = t.tax_variables?.ccb_party
  const ccbPartyName = ccbPartyValue === 'party2' ? party2Name : (ccbPartyValue === 'party1' ? party1Name : '[CCB Party]')

  const firstYearPartyValue = t.tax_variables?.first_year_party
  const firstYearPartyName = firstYearPartyValue === 'party2' ? party2Name : (firstYearPartyValue === 'party1' ? party1Name : '[First-Year Party]')

  const sectionContext = {
    insurance: { ...subContext, insuredName },
    disclosure: subContext,
    tax: { ...subContext, ccbPartyName, firstYearPartyName },
    dispute: subContext,
  }

  const sectionVariableOptions = {
    insurance: {
      insured_party: [{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }],
    },
    tax: {
      ccb_party: [{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }],
      first_year_party: [{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }],
    },
  }

  const selectedCount = TERM_SECTIONS.filter((section) => t[`${section.fieldPrefix}_template`]).length

  return (
    <div>
      <SaveBar registry={registry} />

      <div style={{
        background: '#fff',
        border: '1px solid var(--border)',
        borderRadius: 'var(--r)',
        padding: '20px',
        marginBottom: '18px',
        boxShadow: 'var(--sh-xs)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '14px', alignItems: 'flex-start', flexWrap: 'wrap', marginBottom: '14px' }}>
          <div>
            <h3 style={{ margin: 0, marginBottom: '4px' }}>Additional Terms Menu</h3>
            <p style={{ margin: 0, color: 'var(--s600)', fontSize: '0.87rem', lineHeight: 1.45 }}>
              Review each optional area, choose the clause that fits, and save the page when finished.
            </p>
          </div>
          <span style={{
            fontSize: '0.78rem',
            fontWeight: 700,
            color: 'var(--v)',
            background: 'var(--vx)',
            border: '1px solid var(--vc)',
            borderRadius: '999px',
            padding: '6px 10px',
            whiteSpace: 'nowrap',
          }}>
            {selectedCount} of 4 selected
          </span>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(190px, 1fr))', gap: '10px' }}>
          {TERM_SECTIONS.map((section) => {
            const selected = t[`${section.fieldPrefix}_template`]
            const selectedLabel = selected ? section.templates[selected]?.label : 'Not included'
            return (
              <a key={section.key} href={`#additional-${section.key}`} style={menuCardStyle}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '8px', marginBottom: '6px' }}>
                  <strong style={{ color: 'var(--s900)', fontSize: '0.92rem' }}>{section.title}</strong>
                  <span style={{ width: '8px', height: '8px', borderRadius: '50%', background: selected ? 'var(--v)' : 'var(--s300)', flex: '0 0 auto' }} />
                </div>
                <div style={{ color: 'var(--s500)', fontSize: '0.78rem', lineHeight: 1.35 }}>{selectedLabel}</div>
              </a>
            )
          })}
        </div>
      </div>

      {TERM_SECTIONS.map((section) => {
        const templateKey = `${section.fieldPrefix}_template`
        const variablesKey = `${section.fieldPrefix}_variables`
        return (
          <TermSection
            key={section.key}
            section={section}
            value={t[templateKey]}
            variables={t[variablesKey] || {}}
            onChange={({ template, variables }) => saveT({ [templateKey]: template, [variablesKey]: variables })}
            substitutionContext={sectionContext[section.key]}
            variableOptions={sectionVariableOptions[section.key]}
          />
        )
      })}
    </div>
  )
}
