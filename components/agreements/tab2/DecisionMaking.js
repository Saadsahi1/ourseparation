'use client'
import FormField from '../shared/FormField'
import TemplateSelector from '../shared/TemplateSelector'
import { COMMUNICATION_TEMPLATES } from '@/lib/agreements/templateLibrary'
import useDirtyBuffer, { useRegisterBuffer } from '../shared/useDirtyBuffer'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

// DecisionMaking — buffered field edits.
// All fields target the `parenting-terms` PUT endpoint. The buffer flushes on
// Save Page. List-style sub-tabs (Holidays, SpecialClauses) keep their
// immediate-save behavior — they're not driven by this buffer.
export default function DecisionMaking({ bundle, save, party1Name, party2Name, registry }) {
  const t = bundle.parentingTerms || {}

  const buf = useDirtyBuffer({
    serverValues: t,
    onFlush: (patch) => save('parenting-terms', patch),
    label: 'parenting-terms',
  })
  useRegisterBuffer(registry, buf)

  const v = (k, fallback) => {
    const val = buf.getValue(k)
    return val ?? fallback
  }

  const custodyOptions = [
    { value: 'joint', label: 'Joint Decision-Making (Recommended)' },
    { value: 'sole_party1', label: `Sole Decision-Making — ${party1Name}` },
    { value: 'sole_party2', label: `Sole Decision-Making — ${party2Name}` },
  ]

  const custodyValue = v('legal_custody_type', 'joint')
  const isSoleParty1 = custodyValue === 'sole_party1'
  const isSoleParty2 = custodyValue === 'sole_party2'
  const locked = isSoleParty1 || isSoleParty2

  const domainOptions = [
    { value: 'joint', label: 'Joint — both parties decide together' },
    { value: 'consult', label: 'Consult — primary parent decides after consulting other' },
    { value: 'party1', label: `${party1Name} decides` },
    { value: 'party2', label: `${party2Name} decides` },
  ]

  const lockedValue = isSoleParty1 ? 'party1' : isSoleParty2 ? 'party2' : null

  // Choosing a Sole arrangement cascades into the four per-domain fields.
  const handleCustodyChange = (newVal) => {
    buf.setValue('legal_custody_type', newVal)
    if (newVal === 'sole_party1') {
      buf.setValue('decision_making_education', 'party1')
      buf.setValue('decision_making_health', 'party1')
      buf.setValue('decision_making_religion', 'party1')
      buf.setValue('decision_making_extracurricular', 'party1')
    } else if (newVal === 'sole_party2') {
      buf.setValue('decision_making_education', 'party2')
      buf.setValue('decision_making_health', 'party2')
      buf.setValue('decision_making_religion', 'party2')
      buf.setValue('decision_making_extracurricular', 'party2')
    }
  }

  return (
    <div>
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Decision-Making Responsibility</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Choose how major decisions about the children are made. Sole arrangements lock the per-domain choices to one party.
        </p>
        <FormField
          label="Legal Decision-Making Type"
          type="select"
          options={custodyOptions}
          value={custodyValue}
          onSave={handleCustodyChange}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '12px' }}>
          <FormField label="Education" type="select" options={domainOptions}
            value={locked ? lockedValue : v('decision_making_education', 'joint')}
            onSave={(val) => buf.setValue('decision_making_education', val)}
            disabled={locked}
            hint={locked ? 'Locked by Sole arrangement above' : undefined} />
          <FormField label="Health Care" type="select" options={domainOptions}
            value={locked ? lockedValue : v('decision_making_health', 'joint')}
            onSave={(val) => buf.setValue('decision_making_health', val)}
            disabled={locked}
            hint={locked ? 'Locked by Sole arrangement above' : undefined} />
          <FormField label="Religion" type="select" options={domainOptions}
            value={locked ? lockedValue : v('decision_making_religion', 'joint')}
            onSave={(val) => buf.setValue('decision_making_religion', val)}
            disabled={locked}
            hint={locked ? 'Locked by Sole arrangement above' : undefined} />
          <FormField label="Extracurricular" type="select" options={domainOptions}
            value={locked ? lockedValue : v('decision_making_extracurricular', 'joint')}
            onSave={(val) => buf.setValue('decision_making_extracurricular', val)}
            disabled={locked}
            hint={locked ? 'Locked by Sole arrangement above' : undefined} />
        </div>

        {(bundle.children?.length || 0) > 1 && (
          <div style={{ marginTop: '16px' }}>
            <FormField
              type="checkbox"
              value={Boolean(v('different_schedules_per_child', false))}
              hint="Different parenting schedules for each child"
              onSave={(val) => buf.setValue('different_schedules_per_child', val)}
            />
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Communication Method</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          How will you and the other party communicate about the children?
        </p>
        <TemplateSelector
          templates={COMMUNICATION_TEMPLATES}
          value={{ template: v('communication_template'), variables: v('communication_variables', {}) }}
          onChange={({ template, variables }) => {
            buf.setValue('communication_template', template)
            buf.setValue('communication_variables', variables)
          }}
          substitutionContext={{ party1: party1Name, party2: party2Name }}
          variableLabels={{
            emailAddress: 'Email Address',
            urgentResponseTime: 'Urgent Response Time (e.g. 4 hours)',
          }}
        />
      </div>
    </div>
  )
}
