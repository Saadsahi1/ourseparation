'use client'
import FormField from '../shared/FormField'
import ChildrenList from './ChildrenList'
import PrevRelationshipChildren from './PrevRelationshipChildren'
import { getChildAge } from '@/lib/agreements/utils'

const PARENTAL_TITLE_OPTIONS = [
  { value: 'mother', label: 'Mother' },
  { value: 'father', label: 'Father' },
  { value: 'parent', label: 'Parent (neutral)' },
]

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

export default function InfoTab({ bundle, save, user }) {
  const a = bundle.agreement
  const saveAgreement = (patch) => save('agreement', patch)

  const party1FullName = [user?.first_name, user?.last_name].filter(Boolean).join(' ') || user?.email || 'Party 1'

  return (
    <div>
      {/* Party 1 */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Party 1 — You</h3>
        <p style={sectionSub}>Your information from your account. Update other details below.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <FormField label="Full Legal Name" value={party1FullName} disabled />
          <FormField label="Date of Birth" type="date" value={a.party1_dob || ''} onSave={(v) => saveAgreement({ party1_dob: v })} />
          <FormField label="Occupation" value={a.party1_occupation || ''} onSave={(v) => saveAgreement({ party1_occupation: v })} placeholder="e.g. Software Engineer" />
          <FormField label="Parental Title" type="select" options={PARENTAL_TITLE_OPTIONS}
            value={a.party1_parental_title || ''}
            onSave={(v) => saveAgreement({ party1_parental_title: v })} />
        </div>
      </div>

      {/* Party 2 */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Party 2 — The Other Party</h3>
        <p style={sectionSub}>Enter information about your spouse / partner. They'll be invited later to sign.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <FormField label="Full Legal Name" required value={a.party2_name || ''} onSave={(v) => saveAgreement({ party2_name: v })} />
          <FormField label="Date of Birth" type="date" value={a.party2_dob || ''} onSave={(v) => saveAgreement({ party2_dob: v })} />
          <FormField label="Occupation" value={a.party2_occupation || ''} onSave={(v) => saveAgreement({ party2_occupation: v })} placeholder="e.g. Teacher" />
          <FormField label="Parental Title" type="select" options={PARENTAL_TITLE_OPTIONS}
            value={a.party2_parental_title || ''}
            onSave={(v) => saveAgreement({ party2_parental_title: v })} />
          <FormField label="Email Address (for invitation)" type="email" value={a.party2_email || ''} onSave={(v) => saveAgreement({ party2_email: v })} placeholder="other.party@example.com" />
        </div>
      </div>

      {/* Relationship */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Relationship Information</h3>
        <p style={sectionSub}>Key dates and location for your agreement.</p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '14px' }}>
          <FormField label="Date of Marriage" type="date" value={a.marriage_date || ''} onSave={(v) => saveAgreement({ marriage_date: v })} hint="Leave blank if common-law" />
          <FormField label="Date of Cohabitation (if different)" type="date" value={a.cohabitation_date || ''} onSave={(v) => saveAgreement({ cohabitation_date: v })} />
          <FormField label="Date of Separation" type="date" required value={a.separation_date || ''} onSave={(v) => saveAgreement({ separation_date: v })} hint="Required to mark this section complete" />
          <FormField label="Place of Marriage / Relationship" value={a.marriage_location || ''} onSave={(v) => saveAgreement({ marriage_location: v })} placeholder="e.g. Toronto, ON" />
          <FormField label="Signing City" value={a.signing_city || ''} onSave={(v) => saveAgreement({ signing_city: v })} placeholder="City where the agreement is signed" />
        </div>
      </div>

      {/* Children */}
      <div style={cardStyle}>
        <h3 style={sectionHeading}>Children of the Relationship</h3>
        <p style={sectionSub}>Add the biological or adopted children you share with Party 2.</p>
        <ChildrenList
          agreementId={a.id}
          children={bundle.children || []}
          onChange={save}
          party1Name={party1FullName}
          party2Name={a.party2_name || 'Party 2'}
          getChildAge={getChildAge}
        />
      </div>

      {/* Previous-relationship children */}
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
