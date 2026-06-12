'use client'
import { useEffect } from 'react'
import FormField from '../shared/FormField'
import ChildrenList from './ChildrenList'
import PrevRelationshipChildren from './PrevRelationshipChildren'
import SaveBar from '../shared/SaveBar'
import { getChildAge } from '@/lib/agreements/utils'
import {
  ONTARIO_CITIES,
  OCCUPATION_OPTIONS,
  PARENTAL_TITLE_OPTIONS,
} from '@/lib/agreements/selectOptions'
import useDirtyBuffer, { useDirtyRegistry, useRegisterBuffer } from '../shared/useDirtyBuffer'

const cardStyle = {
  background: '#fff',
  border: '1px solid var(--border)',
  borderRadius: 'var(--r)',
  padding: '24px',
  marginBottom: '20px',
  boxShadow: 'var(--sh-xs)',
}

const sectionHeading = {
  fontSize: '0.95rem',
  fontWeight: 600,
  color: 'var(--s900)',
  marginTop: 0,
  marginBottom: '4px',
}

const sectionSub = {
  fontSize: '0.82rem',
  color: 'var(--s600)',
  marginTop: 0,
  marginBottom: '16px',
}

// InfoTab — buffered field edits.
// All FormField changes now flow through a useDirtyBuffer that maps to a
// single 'agreement' PUT. The user types freely; nothing hits the network
// until they click "Save Page" (rendered by the <SaveBar>).
// List operations (Children, Prev-Relationship Children) keep saving
// immediately per the design.
export default function InfoTab({ bundle, save, saveNow, user, registerDirty }) {
  const a = bundle.agreement

  // One buffer for the whole tab's worth of agreement-level fields.
  const buf = useDirtyBuffer({
    serverValues: a,
    onFlush: (patch) => (saveNow || save)('agreement', patch, { method: 'PUT' }),
  })

  // Register with a tab-level registry so the SaveBar can flush/discard.
  const registry = useDirtyRegistry()
  useRegisterBuffer(registry, buf)
  // Bubble dirty state up so the editor page can intercept navigation away.
  useEffect(() => {
    if (registerDirty) registerDirty(registry.isDirty)
  }, [registry.isDirty, registerDirty])

  const v = (k) => buf.getValue(k)
  const set = (k) => (val) => buf.setValue(k, val)

  // Display name for the children-list cards (uses the in-progress buffer
  // values so the labels update live as the user types).
  const party1FirstName = v('party1_first_name') || user?.first_name || ''
  const party1LastName  = v('party1_last_name')  || user?.last_name  || ''
  const party1FullName  = [party1FirstName, party1LastName].filter(Boolean).join(' ') || user?.email || 'Party 1'

  const party2FirstName = v('party2_first_name') || ''
  const party2LastName  = v('party2_last_name')  || ''
  const party2FullName  = [party2FirstName, party2LastName].filter(Boolean).join(' ') || a.party2_name || 'Party 2'

  return (
    <div>
      <SaveBar registry={registry} />

      {/* Party 1 */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Party 1 — You</h3>
        <p style={sectionSub}>Defaults to the name on your account. Edit if your legal name on this agreement differs.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <FormField label="First Name"
            value={v('party1_first_name') ?? ''}
            onSave={set('party1_first_name')}
            placeholder={user?.first_name || ''} />
          <FormField label="Last Name"
            value={v('party1_last_name') ?? ''}
            onSave={set('party1_last_name')}
            placeholder={user?.last_name || ''} />
          <FormField label="Date of Birth" type="date"
            value={v('party1_dob') ?? ''} onSave={set('party1_dob')} />
          <FormField label="Occupation" type="autocomplete" datalistOptions={OCCUPATION_OPTIONS}
            value={v('party1_occupation') ?? ''} onSave={set('party1_occupation')}
            placeholder="Choose or type…" />
          <FormField label="Parental Title" type="select" options={PARENTAL_TITLE_OPTIONS}
            value={v('party1_parental_title') ?? ''}
            onSave={set('party1_parental_title')} />
        </div>
      </div>

      {/* Party 2 */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Party 2 — The Other Party</h3>
        <p style={sectionSub}>Enter information about your spouse / partner. They'll be invited later to sign.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <FormField label="First Name" required
            value={v('party2_first_name') ?? ''}
            onSave={set('party2_first_name')} />
          <FormField label="Last Name" required
            value={v('party2_last_name') ?? ''}
            onSave={set('party2_last_name')} />
          <FormField label="Date of Birth" type="date"
            value={v('party2_dob') ?? ''} onSave={set('party2_dob')} />
          <FormField label="Occupation" type="autocomplete" datalistOptions={OCCUPATION_OPTIONS}
            value={v('party2_occupation') ?? ''} onSave={set('party2_occupation')}
            placeholder="Choose or type…" />
          <FormField label="Parental Title" type="select" options={PARENTAL_TITLE_OPTIONS}
            value={v('party2_parental_title') ?? ''}
            onSave={set('party2_parental_title')} />
          <FormField label="Email Address (for invitation)" type="email"
            value={v('party2_email') ?? ''} onSave={set('party2_email')}
            placeholder="other.party@example.com" />
        </div>
      </div>

      {/* Relationship */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Relationship Information</h3>
        <p style={sectionSub}>Key dates and location for your agreement.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <FormField label="Date of Marriage" type="date"
            value={v('marriage_date') ?? ''} onSave={set('marriage_date')}
            hint="Leave blank if common-law" />
          <FormField label="Date of Cohabitation (if different)" type="date"
            value={v('cohabitation_date') ?? ''} onSave={set('cohabitation_date')} />
          <FormField label="Date of Separation" type="date" required
            value={v('separation_date') ?? ''} onSave={set('separation_date')}
            hint="Required to mark this section complete" />
          <FormField label="Place of Marriage / Relationship" type="autocomplete"
            datalistOptions={ONTARIO_CITIES}
            value={v('marriage_location') ?? ''} onSave={set('marriage_location')}
            placeholder="Choose an Ontario city or type" />
          <FormField label="Signing City" type="autocomplete"
            datalistOptions={ONTARIO_CITIES}
            value={v('signing_city') ?? ''} onSave={set('signing_city')}
            placeholder="Where will the agreement be signed?" />
        </div>
      </div>

      {/* Children — saves immediately (list operation) */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Children of the Relationship</h3>
        <p style={sectionSub}>Add the biological or adopted children you share with Party 2.</p>
        <ChildrenList
          agreementId={a.id}
          children={bundle.children || []}
          onChange={save}
          party1Name={party1FullName}
          party2Name={party2FullName}
          getChildAge={getChildAge}
        />
      </div>

      {/* Previous-relationship children — saves immediately */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Children from Previous Relationships</h3>
        <p style={sectionSub}>Optional — for situations involving step-parent relationships or in loco parentis claims.</p>
        <PrevRelationshipChildren
          agreementId={a.id}
          items={bundle.previousChildren || []}
          onChange={save}
        />
      </div>
    </div>
  )
}

