'use client'
import { useEffect, useState } from 'react'
import SubTabs from '../shared/SubTabs'
import TemplateSelector from '../shared/TemplateSelector'
import SaveBar from '../shared/SaveBar'
import useDirtyBuffer, { useDirtyRegistry, useRegisterBuffer } from '../shared/useDirtyBuffer'
import {
  LIFE_INSURANCE_TEMPLATES,
  DISCLOSURE_TEMPLATES,
  TAX_PROVISION_TEMPLATES,
  DISPUTE_RESOLUTION_TEMPLATES,
} from '@/lib/agreements/templateLibrary'

const SUB_TABS = [
  { key: 'insurance', label: 'Life Insurance' },
  { key: 'disclosure', label: 'Financial Disclosure' },
  { key: 'tax', label: 'Tax Provisions' },
  { key: 'dispute', label: 'Dispute Resolution' },
]

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

export default function AdditionalTermsTab({ bundle, save, party1Name, party2Name, registerDirty, registerFooterSave }) {
  const [sub, setSub] = useState('insurance')

  // All four sub-tabs PUT to the same /additional-terms endpoint, so one
  // buffer covers the whole tab. Save Page commits everything in one
  // round-trip.
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

  // Compute insured name from selected party
  const insurancePartyValue = t.insurance_variables?.insured_party
  const insuredName = insurancePartyValue === 'party2' ? party2Name : (insurancePartyValue === 'party1' ? party1Name : '[Insured Party]')

  const ccbPartyValue = t.tax_variables?.ccb_party
  const ccbPartyName = ccbPartyValue === 'party2' ? party2Name : (ccbPartyValue === 'party1' ? party1Name : '[CCB Party]')

  const firstYearPartyValue = t.tax_variables?.first_year_party
  const firstYearPartyName = firstYearPartyValue === 'party2' ? party2Name : (firstYearPartyValue === 'party1' ? party1Name : '[First-Year Party]')

  return (
    <div>
      <SaveBar registry={registry} />
      <SubTabs tabs={SUB_TABS} active={sub} onChange={setSub} />

      {sub === 'insurance' && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Life Insurance</h3>
          <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
            Securing support obligations with life insurance.
          </p>
          <TemplateSelector
            templates={LIFE_INSURANCE_TEMPLATES}
            value={{ template: t.insurance_template, variables: t.insurance_variables || {} }}
            onChange={({ template, variables }) => saveT({ insurance_template: template, insurance_variables: variables })}
            substitutionContext={{ ...subContext, insuredName }}
            variableLabels={{
              insured_party: 'Insured Party',
              coverage_amount: 'Coverage Amount',
              beneficiary: 'Beneficiary',
              initial_amount: 'Initial Amount',
              decline_schedule: 'Decline Schedule',
            }}
            variableOptions={{
              insured_party: [{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }],
            }}
          />
        </div>
      )}

      {sub === 'disclosure' && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Financial Disclosure</h3>
          <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
            How often will the parties exchange updated financial information?
          </p>
          <TemplateSelector
            templates={DISCLOSURE_TEMPLATES}
            value={{ template: t.disclosure_template, variables: t.disclosure_variables || {} }}
            onChange={({ template, variables }) => saveT({ disclosure_template: template, disclosure_variables: variables })}
            substitutionContext={subContext}
            variableLabels={{
              disclosure_date: 'Disclosure Date (e.g. June 1st)',
              response_days: 'Response Time (days)',
              threshold_percentage: 'Income Change Threshold (%)',
            }}
          />
        </div>
      )}

      {sub === 'tax' && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Tax Provisions</h3>
          <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
            CRA-related provisions: Canada Child Benefit, eligible dependant credits, support tax treatment.
          </p>
          <TemplateSelector
            templates={TAX_PROVISION_TEMPLATES}
            value={{ template: t.tax_template, variables: t.tax_variables || {} }}
            onChange={({ template, variables }) => saveT({ tax_template: template, tax_variables: variables })}
            substitutionContext={{ ...subContext, ccbPartyName, firstYearPartyName }}
            variableLabels={{
              ccb_party: 'CCB-Receiving Party',
              first_year_party: 'Party Claiming in First Year',
              children_count: 'Number of Children Each Party Claims',
            }}
            variableOptions={{
              ccb_party: [{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }],
              first_year_party: [{ value: 'party1', label: party1Name }, { value: 'party2', label: party2Name }],
            }}
          />
        </div>
      )}

      {sub === 'dispute' && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Dispute Resolution</h3>
          <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
            How will future disagreements be resolved without going to court?
          </p>
          <TemplateSelector
            templates={DISPUTE_RESOLUTION_TEMPLATES}
            value={{ template: t.dispute_template, variables: t.dispute_variables || {} }}
            onChange={({ template, variables }) => saveT({ dispute_template: template, dispute_variables: variables })}
            substitutionContext={subContext}
            variableLabels={{ selection_days: 'Mediator Selection Window (days)' }}
          />
        </div>
      )}
    </div>
  )
}
