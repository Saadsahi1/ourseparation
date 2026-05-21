'use client'
import { useState, useEffect } from 'react'
import { useRouter, useParams } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import api from '@/lib/apiClient'
import { validateStep, fmtInputDate, HOLIDAYS } from '@/lib/agreements/utils'

const AGREEMENT_TYPES = [
  { id: 'separation', label: 'Separation Agreement' },
  { id: 'cohabitation', label: 'Cohabitation Agreement' },
  { id: 'prenup', label: 'Prenuptial Agreement' },
  { id: 'postnup', label: 'Postnuptial Agreement' },
  { id: 'amendment', label: 'Amendment Agreement' }
]

const SCHEDULE_TYPES = [
  { id: 'primary', label: 'Primary Care with Reasonable Access' },
  { id: 'weekend', label: 'Every Other Weekend' },
  { id: 'week_on_off', label: 'Week On, Week Off' },
  { id: '2_2_3', label: '2-2-3 Schedule' },
  { id: '5_2_2_5', label: '5-2-2-5 Schedule' },
  { id: 'custom', label: 'Custom Schedule' }
]

function FormField({ label, type = 'text', value, onChange, required = false, placeholder = '' }) {
  return (
    <div style={{marginBottom:'20px'}}>
      <label style={{display:'block', marginBottom:'8px', fontWeight:'500', fontSize:'0.95rem'}}>
        {label}{required && <span style={{color:'#ef4444'}}> *</span>}
      </label>
      <input
        type={type}
        value={value || ''}
        onChange={onChange}
        required={required}
        placeholder={placeholder}
        style={{
          width:'100%',
          padding:'10px 12px',
          border:'1px solid var(--border)',
          borderRadius:'6px',
          fontSize:'0.95rem',
          fontFamily:'inherit',
          boxSizing:'border-box'
        }}
      />
    </div>
  )
}

function AgreementEditContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const [agreement, setAgreement] = useState(null)
  const [currentStep, setCurrentStep] = useState(1)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [errors, setErrors] = useState([])
  const [formData, setFormData] = useState({})

  const agreementId = params?.id

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (!user || !agreementId) return

    api.get(`/api/agreements/${agreementId}`)
      .then(r => r?.ok ? r.json() : null)
      .then(d => {
        if (!d?.agreement) {
          alert('Agreement not found')
          router.push('/agreements')
          return
        }
        setAgreement(d.agreement)
        setFormData(d.agreement.interview_data || {})
      })
      .catch(err => {
        console.error('Error fetching agreement:', err)
        router.push('/agreements')
      })
      .finally(() => setLoading(false))
  }, [user, authLoading, router, agreementId])

  const updateFormData = (key, value) => {
    setFormData(f => ({...f, [key]: value}))
  }

  const updateChild = (index, field, value) => {
    setFormData(f => {
      const children = [...f.children]
      children[index] = { ...children[index], [field]: value }
      return { ...f, children }
    })
  }

  const removeChild = (index) => {
    setFormData(f => ({
      ...f,
      children: f.children.filter((_, i) => i !== index)
    }))
  }

  const addChild = () => {
    setFormData(f => ({
      ...f,
      children: [...(f.children || []), { name: '', dateOfBirth: '', residence: '' }]
    }))
  }

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1)
    } else {
      router.push(`/agreements/${agreementId}`)
    }
    setErrors([])
  }

  const validateCurrentStep = () => {
    const newErrors = validateStep(currentStep, { ...formData, agreementType: agreement.agreement_type })
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleSave = async () => {
    if (!validateCurrentStep()) return

    setSaving(true)
    try {
      const res = await api.put(`/api/agreements/${agreementId}`, {
        interview_data: formData
      })
      if (res.ok) {
        router.push(`/agreements/${agreementId}`)
      } else {
        alert('Failed to save agreement')
        setSaving(false)
      }
    } catch (err) {
      alert('Error saving agreement')
      setSaving(false)
    }
  }

  if (authLoading || loading) {
    return (
      <div className="page-wrap">
        <Nav />
        <main style={{padding:'40px'}}><div className="loading-screen"><div className="spinner" /></div></main>
      </div>
    )
  }

  if (!agreement) {
    return (
      <div className="page-wrap">
        <Nav />
        <main style={{padding:'40px 60px'}}>
          <p style={{color:'var(--s600)'}}>Agreement not found</p>
        </main>
      </div>
    )
  }

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <>
          <FormField label="Agreement Name" value={formData.label} onChange={e => updateFormData('label', e.target.value)} />
          <FormField label="Party 1 Full Name" value={formData.party1Name} onChange={e => updateFormData('party1Name', e.target.value)} required />
          <FormField label="Party 1 Date of Birth" type="date" value={formData.party1Dob} onChange={e => updateFormData('party1Dob', e.target.value)} required />
          <FormField label="Party 1 Occupation" value={formData.party1Occupation} onChange={e => updateFormData('party1Occupation', e.target.value)} />
          <FormField label="Party 1 Residence" value={formData.party1Residence} onChange={e => updateFormData('party1Residence', e.target.value)} placeholder="City, Province" />

          <hr style={{margin:'30px 0', border:'none', borderTop:'1px solid var(--border)'}} />

          <FormField label="Party 2 Full Name" value={formData.party2Name} onChange={e => updateFormData('party2Name', e.target.value)} required />
          <FormField label="Party 2 Date of Birth" type="date" value={formData.party2Dob} onChange={e => updateFormData('party2Dob', e.target.value)} required />
          <FormField label="Party 2 Occupation" value={formData.party2Occupation} onChange={e => updateFormData('party2Occupation', e.target.value)} />
          <FormField label="Party 2 Residence" value={formData.party2Residence} onChange={e => updateFormData('party2Residence', e.target.value)} placeholder="City, Province" />

          <hr style={{margin:'30px 0', border:'none', borderTop:'1px solid var(--border)'}} />

          <FormField label="City of Signing" value={formData.signingCity} onChange={e => updateFormData('signingCity', e.target.value)} required />
          <FormField label="Signing Date" type="date" value={formData.signingDate} onChange={e => updateFormData('signingDate', e.target.value)} required />

          {agreement.agreement_type === 'separation' && (
            <>
              <FormField label="Date of Marriage" type="date" value={formData.marriageDate} onChange={e => updateFormData('marriageDate', e.target.value)} required />
              <FormField label="Date of Separation" type="date" value={formData.separationDate} onChange={e => updateFormData('separationDate', e.target.value)} required />
            </>
          )}
          {agreement.agreement_type === 'cohabitation' && (
            <FormField label="Date Cohabitation Began" type="date" value={formData.cohabitationDate} onChange={e => updateFormData('cohabitationDate', e.target.value)} required />
          )}
          {agreement.agreement_type === 'prenup' && (
            <FormField label="Intended Date of Marriage" type="date" value={formData.marriageDate} onChange={e => updateFormData('marriageDate', e.target.value)} required />
          )}
          {agreement.agreement_type === 'postnup' && (
            <FormField label="Date of Marriage" type="date" value={formData.marriageDate} onChange={e => updateFormData('marriageDate', e.target.value)} required />
          )}
        </>
      )
    }

    if (currentStep === 2) {
      if (agreement.agreement_type === 'prenup' || agreement.agreement_type === 'cohabitation') {
        return <p style={{color:'var(--s600)'}}>This agreement type does not include children provisions.</p>
      }

      return (
        <>
          <div style={{marginBottom:'24px'}}>
            <h3 style={{marginBottom:'16px'}}>Children of the Relationship</h3>
            {formData.children && formData.children.length > 0 ? (
              formData.children.map((child, i) => (
                <div key={i} style={{padding:'16px', backgroundColor:'var(--vx)', borderRadius:'6px', marginBottom:'16px'}}>
                  <div style={{display:'grid', gridTemplateColumns:'1fr 1fr 1fr auto', gap:'12px', alignItems:'flex-end'}}>
                    <FormField label="Child Name" value={child.name || ''} onChange={e => updateChild(i, 'name', e.target.value)} required />
                    <FormField label="Date of Birth" type="date" value={child.dateOfBirth || ''} onChange={e => updateChild(i, 'dateOfBirth', e.target.value)} required />
                    <FormField label="Residence" value={child.residence || ''} onChange={e => updateChild(i, 'residence', e.target.value)} placeholder="City, Province" />
                    <button onClick={() => removeChild(i)} className="btn btn-ghost btn-sm" style={{color:'#ef4444'}}>Remove</button>
                  </div>
                </div>
              ))
            ) : (
              <p style={{color:'var(--s600)'}}>No children added yet.</p>
            )}
            <button onClick={addChild} className="btn btn-outline" style={{marginTop:'12px'}}>+ Add Child</button>
          </div>
        </>
      )
    }

    if (currentStep === 3) {
      if (!formData.children || formData.children.length === 0) {
        return <p style={{color:'var(--s600)'}}>No children to arrange parenting for.</p>
      }

      return (
        <>
          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block', marginBottom:'12px', fontWeight:'500'}}>Primary Decision-Making Authority</label>
            <div style={{display:'grid', gap:'10px'}}>
              {['Sole to Party 1', 'Sole to Party 2', 'Joint'].map(option => (
                <label key={option} style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer'}}>
                  <input
                    type="checkbox"
                    checked={formData.decisionMaking?.includes(option)}
                    onChange={e => {
                      if (e.target.checked) {
                        updateFormData('decisionMaking', [...(formData.decisionMaking || []), option])
                      } else {
                        updateFormData('decisionMaking', (formData.decisionMaking || []).filter(x => x !== option))
                      }
                    }}
                  />
                  {option}
                </label>
              ))}
            </div>
          </div>

          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block', marginBottom:'12px', fontWeight:'500'}}>Parenting Schedule</label>
            <select
              value={formData.parenting_schedule}
              onChange={e => updateFormData('parenting_schedule', e.target.value)}
              style={{
                width:'100%',
                padding:'10px 12px',
                border:'1px solid var(--border)',
                borderRadius:'6px',
                fontSize:'0.95rem'
              }}
            >
              {SCHEDULE_TYPES.map(s => <option key={s.id} value={s.id}>{s.label}</option>)}
            </select>
          </div>

          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block', marginBottom:'12px', fontWeight:'500'}}>Holiday Access</label>
            <div style={{display:'grid', gridTemplateColumns:'1fr 1fr', gap:'10px', maxHeight:'300px', overflowY:'auto'}}>
              {HOLIDAYS.map(holiday => (
                <label key={holiday} style={{display:'flex', alignItems:'center', gap:'8px', cursor:'pointer', fontSize:'0.9rem'}}>
                  <input
                    type="checkbox"
                    checked={formData.holidays?.includes(holiday)}
                    onChange={e => {
                      if (e.target.checked) {
                        updateFormData('holidays', [...(formData.holidays || []), holiday])
                      } else {
                        updateFormData('holidays', (formData.holidays || []).filter(x => x !== holiday))
                      }
                    }}
                  />
                  {holiday}
                </label>
              ))}
            </div>
          </div>
        </>
      )
    }

    if (currentStep === 4) {
      if (agreement.agreement_type === 'prenup' || agreement.agreement_type === 'cohabitation') {
        return <p style={{color:'var(--s600)'}}>This agreement type does not include child support.</p>
      }

      return (
        <>
          <FormField label="Party 1 Annual Income" type="number" value={formData.childSupportIncomeA} onChange={e => updateFormData('childSupportIncomeA', e.target.value)} required />
          <FormField label="Party 2 Annual Income" type="number" value={formData.childSupportIncomeB} onChange={e => updateFormData('childSupportIncomeB', e.target.value)} required />
          <FormField label="Child Support Amount (Monthly)" type="number" value={formData.childSupportAmount} onChange={e => updateFormData('childSupportAmount', e.target.value)} required />
          <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', marginBottom:'20px'}}>
            <input
              type="checkbox"
              checked={formData.childSupportRetroactive}
              onChange={e => updateFormData('childSupportRetroactive', e.target.checked)}
            />
            <span>Include retroactive support from separation date</span>
          </label>
        </>
      )
    }

    if (currentStep === 5) {
      if (agreement.agreement_type === 'prenup') {
        return <p style={{color:'var(--s600)'}}>Prenuptial agreements typically don't address spousal support.</p>
      }

      return (
        <>
          <FormField label="Agreed Spousal Support Amount (Monthly)" type="number" value={formData.spousalSupportAmount} onChange={e => updateFormData('spousalSupportAmount', e.target.value)} placeholder="Leave blank if no support" />
          <FormField label="Duration (months, or 'Indefinite')" value={formData.spousalSupportDuration} onChange={e => updateFormData('spousalSupportDuration', e.target.value)} placeholder="e.g. 60, Indefinite" />
          <div style={{marginBottom:'20px'}}>
            <label style={{display:'block', marginBottom:'12px', fontWeight:'500'}}>Termination Trigger</label>
            <select
              value={formData.spousalSupportTermination}
              onChange={e => updateFormData('spousalSupportTermination', e.target.value)}
              style={{
                width:'100%',
                padding:'10px 12px',
                border:'1px solid var(--border)',
                borderRadius:'6px',
                fontSize:'0.95rem'
              }}
            >
              <option value="">Select termination event...</option>
              <option value="remarriage">Remarriage of recipient</option>
              <option value="cohabitation">Cohabitation 90+ consecutive days</option>
              <option value="date">Specific date</option>
              <option value="indefinite">No termination (indefinite)</option>
            </select>
          </div>
        </>
      )
    }

    if (currentStep === 6) {
      if (agreement.agreement_type === 'prenup' || agreement.agreement_type === 'cohabitation') {
        return <p style={{color:'var(--s600)'}}>This agreement type does not include property division.</p>
      }

      return (
        <>
          <FormField label="Matrimonial Home Address" value={formData.propertyMatrimonialHome} onChange={e => updateFormData('propertyMatrimonialHome', e.target.value)} placeholder="Leave blank if no matrimonial home" />
          <FormField label="Equalization Payment Amount (if applicable)" type="number" value={formData.propertyEqualization} onChange={e => updateFormData('propertyEqualization', e.target.value)} placeholder="Leave blank if no equalization" />
        </>
      )
    }

    if (currentStep === 7) {
      return (
        <>
          <div style={{marginBottom:'24px'}}>
            <label style={{display:'flex', alignItems:'center', gap:'10px', cursor:'pointer', marginBottom:'12px'}}>
              <input
                type="checkbox"
                checked={formData.lifeInsurance}
                onChange={e => updateFormData('lifeInsurance', e.target.checked)}
              />
              <span>Include life insurance provision</span>
            </label>
            {formData.lifeInsurance && (
              <FormField label="Required Life Insurance Amount" type="number" value={formData.lifeInsuranceAmount} onChange={e => updateFormData('lifeInsuranceAmount', e.target.value)} required />
            )}
          </div>

          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block', marginBottom:'12px', fontWeight:'500'}}>Dispute Resolution Method</label>
            <select
              value={formData.disputeResolution}
              onChange={e => updateFormData('disputeResolution', e.target.value)}
              style={{
                width:'100%',
                padding:'10px 12px',
                border:'1px solid var(--border)',
                borderRadius:'6px',
                fontSize:'0.95rem'
              }}
            >
              <option value="negotiation">Direct negotiation between parties</option>
              <option value="mediation">Mediation</option>
              <option value="arbitration">Arbitration</option>
              <option value="court">Court proceedings</option>
            </select>
          </div>
        </>
      )
    }

    return null
  }

  return (
    <div className="page-wrap">
      <Nav />
      <main style={{padding:'60px 40px'}}>
        <div style={{maxWidth:'700px', margin:'0 auto'}}>
          <div style={{marginBottom:'40px'}}>
            <h1 style={{marginBottom:'12px'}}>Edit Agreement</h1>
            <p style={{color:'var(--s600)'}}>
              Step {currentStep} of 7 · {AGREEMENT_TYPES.find(t => t.id === agreement.agreement_type)?.label}
            </p>
          </div>

          {errors.length > 0 && (
            <div style={{padding:'12px 16px', backgroundColor:'#fef2f2', border:'1px solid #fecaca', borderRadius:'6px', marginBottom:'20px'}}>
              <p style={{margin:'0', color:'#991b1b', fontSize:'0.9rem', fontWeight:'500'}}>Please correct the following:</p>
              <ul style={{margin:'8px 0 0 0', paddingLeft:'20px', color:'#991b1b', fontSize:'0.9rem'}}>
                {errors.map((e, i) => <li key={i}>{e}</li>)}
              </ul>
            </div>
          )}

          <div style={{marginBottom:'40px', backgroundColor:'white', padding:'30px', borderRadius:'8px', border:'1px solid var(--border)'}}>
            {renderStep()}
          </div>

          <div style={{display:'flex', gap:'12px', justifyContent:'space-between'}}>
            <button onClick={handleBack} className="btn btn-outline">← Back</button>
            <div style={{display:'flex', gap:'12px'}}>
              <button onClick={() => router.push(`/agreements/${agreementId}`)} className="btn btn-outline">
                Cancel
              </button>
              {currentStep === 7 ? (
                <button onClick={handleSave} disabled={saving} className="btn btn-primary">
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              ) : (
                <button onClick={() => { if (validateCurrentStep()) setCurrentStep(currentStep + 1) }} className="btn btn-primary">
                  Continue →
                </button>
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  )
}

export default function AgreementEditPage() {
  return <AuthProvider><AgreementEditContent /></AuthProvider>
}
