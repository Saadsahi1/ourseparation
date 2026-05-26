'use client'
import { useEffect, useState } from 'react'
import api from '@/lib/apiClient'

// Shows a one-time banner offering to pre-fill the current agreement with the
// user's most-recently-saved values from past agreements / calculations.
//
// props:
//   agreement: current agreement row
//   currentSupportCalc: support_calculations row (or null)
//   onApply: ({ agreementPatch, supportPatch }) => Promise<void>
//   storageKey: localStorage key prefix to remember dismissal per agreement
export default function PrefillBanner({ agreement, currentSupportCalc, onApply }) {
  const [data, setData] = useState(null)
  const [dismissed, setDismissed] = useState(false)
  const [applying, setApplying] = useState(false)

  useEffect(() => {
    api.get('/api/agreements/prefill').then(async (r) => {
      if (r?.ok) setData(await r.json())
    }).catch(() => {})
  }, [])

  if (!data || dismissed) return null

  const prev = data.latestAgreement
  const incomes = data.calcIncomes

  // Determine which fields we could pre-fill on the agreement
  const agrPatch = {}
  if (prev) {
    if (!agreement.party2_name && prev.party2_name) agrPatch.party2_name = prev.party2_name
    if (!agreement.party2_dob && prev.party2_dob) agrPatch.party2_dob = prev.party2_dob
    if (!agreement.party2_occupation && prev.party2_occupation) agrPatch.party2_occupation = prev.party2_occupation
    if (!agreement.party2_parental_title && prev.party2_parental_title) agrPatch.party2_parental_title = prev.party2_parental_title
    if (!agreement.party2_email && prev.party2_email) agrPatch.party2_email = prev.party2_email
    if (!agreement.party1_dob && prev.party1_dob) agrPatch.party1_dob = prev.party1_dob
    if (!agreement.party1_occupation && prev.party1_occupation) agrPatch.party1_occupation = prev.party1_occupation
    if (!agreement.party1_parental_title && prev.party1_parental_title) agrPatch.party1_parental_title = prev.party1_parental_title
    if (!agreement.marriage_date && prev.marriage_date) agrPatch.marriage_date = prev.marriage_date
    if (!agreement.cohabitation_date && prev.cohabitation_date) agrPatch.cohabitation_date = prev.cohabitation_date
    if (!agreement.separation_date && prev.separation_date) agrPatch.separation_date = prev.separation_date
    if (!agreement.marriage_location && prev.marriage_location) agrPatch.marriage_location = prev.marriage_location
    if (!agreement.signing_city && prev.signing_city) agrPatch.signing_city = prev.signing_city
  }

  const supportPatch = {}
  if (incomes) {
    if (!currentSupportCalc?.party1_income && incomes.party1_income) {
      supportPatch.party1_income = incomes.party1_income
    }
    if (!currentSupportCalc?.party2_income && incomes.party2_income) {
      supportPatch.party2_income = incomes.party2_income
    }
  }

  const fieldsCount = Object.keys(agrPatch).length + Object.keys(supportPatch).length
  if (fieldsCount === 0) return null

  const apply = async () => {
    setApplying(true)
    try {
      await onApply({ agreementPatch: agrPatch, supportPatch })
      setDismissed(true)
    } finally {
      setApplying(false)
    }
  }

  return (
    <div style={{
      background: 'var(--vx)',
      border: '1px solid var(--vc)',
      borderRadius: 'var(--rs)',
      padding: '14px 18px',
      marginBottom: '16px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      gap: '12px',
      flexWrap: 'wrap',
    }}>
      <div>
        <div style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--v)', marginBottom: '2px' }}>
          ✨ We found {fieldsCount} field{fieldsCount === 1 ? '' : 's'} we can pre-fill from your previous data
        </div>
        <div style={{ fontSize: '0.78rem', color: 'var(--s600)' }}>
          {Object.keys(agrPatch).length > 0 && `Party / date / city info from your last agreement. `}
          {Object.keys(supportPatch).length > 0 && `Incomes from your last calculation.`}
        </div>
      </div>
      <div style={{ display: 'flex', gap: '8px' }}>
        <button onClick={() => setDismissed(true)} className="btn btn-ghost btn-sm" disabled={applying}>Skip</button>
        <button onClick={apply} className="btn btn-primary btn-sm" disabled={applying}>
          {applying ? 'Filling in…' : 'Pre-fill these fields'}
        </button>
      </div>
    </div>
  )
}
