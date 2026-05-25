'use client'
import FormField from '../shared/FormField'
import TemplateSelector from '../shared/TemplateSelector'
import { COMMUNICATION_TEMPLATES } from '@/lib/agreements/templateLibrary'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

export default function DecisionMaking({ bundle, save, party1Name, party2Name }) {
  const t = bundle.parentingTerms || {}

  const custodyOptions = [
    { value: 'joint', label: 'Joint Decision-Making (Recommended)' },
    { value: 'sole_party1', label: `Sole Decision-Making — ${party1Name}` },
    { value: 'sole_party2', label: `Sole Decision-Making — ${party2Name}` },
  ]

  // When sole_partyX is selected, the per-domain options are locked to that party.
  const isSoleParty1 = t.legal_custody_type === 'sole_party1'
  const isSoleParty2 = t.legal_custody_type === 'sole_party2'
  const locked = isSoleParty1 || isSoleParty2

  const domainOptions = [
    { value: 'joint', label: 'Joint — both parties decide together' },
    { value: 'consult', label: 'Consult — primary parent decides after consulting other' },
    { value: 'party1', label: `${party1Name} decides` },
    { value: 'party2', label: `${party2Name} decides` },
  ]

  const lockedValue = isSoleParty1 ? 'party1' : isSoleParty2 ? 'party2' : null

  const saveTerms = (patch) => save('parenting-terms', patch)

  const handleCustodyChange = (v) => {
    const patch = { legal_custody_type: v }
    if (v === 'sole_party1') {
      patch.decision_making_education = 'party1'
      patch.decision_making_health = 'party1'
      patch.decision_making_religion = 'party1'
      patch.decision_making_extracurricular = 'party1'
    } else if (v === 'sole_party2') {
      patch.decision_making_education = 'party2'
      patch.decision_making_health = 'party2'
      patch.decision_making_religion = 'party2'
      patch.decision_making_extracurricular = 'party2'
    }
    saveTerms(patch)
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
          value={t.legal_custody_type || 'joint'}
          onSave={handleCustodyChange}
        />

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '14px', marginTop: '12px' }}>
          <FormField
            label="Education"
            type="select"
            options={domainOptions}
            value={locked ? lockedValue : (t.decision_making_education || 'joint')}
            onSave={(v) => saveTerms({ decision_making_education: v })}
            disabled={locked}
            hint={locked ? 'Locked by Sole arrangement above' : undefined}
          />
          <FormField
            label="Health Care"
            type="select"
            options={domainOptions}
            value={locked ? lockedValue : (t.decision_making_health || 'joint')}
            onSave={(v) => saveTerms({ decision_making_health: v })}
            disabled={locked}
            hint={locked ? 'Locked by Sole arrangement above' : undefined}
          />
          <FormField
            label="Religion"
            type="select"
            options={domainOptions}
            value={locked ? lockedValue : (t.decision_making_religion || 'joint')}
            onSave={(v) => saveTerms({ decision_making_religion: v })}
            disabled={locked}
            hint={locked ? 'Locked by Sole arrangement above' : undefined}
          />
          <FormField
            label="Extracurricular"
            type="select"
            options={domainOptions}
            value={locked ? lockedValue : (t.decision_making_extracurricular || 'joint')}
            onSave={(v) => saveTerms({ decision_making_extracurricular: v })}
            disabled={locked}
            hint={locked ? 'Locked by Sole arrangement above' : undefined}
          />
        </div>

        {(bundle.children?.length || 0) > 1 && (
          <div style={{ marginTop: '16px' }}>
            <FormField
              type="checkbox"
              value={t.different_schedules_per_child}
              hint="Different parenting schedules for each child"
              onSave={(v) => saveTerms({ different_schedules_per_child: v })}
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
          value={{ template: t.communication_template, variables: t.communication_variables || {} }}
          onChange={({ template, variables }) => saveTerms({
            communication_template: template,
            communication_variables: variables,
          })}
          substitutionContext={{ party1: party1Name, party2: party2Name }}
          variableLabels={{
            appName: 'App Name (e.g. OurFamilyWizard)',
            emailAddress: 'Email Address',
            urgentResponseTime: 'Urgent Response Time (e.g. 4 hours)',
          }}
        />
      </div>
    </div>
  )
}
