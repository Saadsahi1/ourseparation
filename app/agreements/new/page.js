'use client'
import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import api from '@/lib/apiClient'
import { validateStep, fmtInputDate, calculateSSAGRange, HOLIDAYS } from '@/lib/agreements/utils'

const AGREEMENT_TYPES = [
  { id: 'separation', label: 'Separation Agreement', desc: 'For separated spouses in Ontario' },
  { id: 'cohabitation', label: 'Cohabitation Agreement', desc: 'For unmarried couples living together' },
  { id: 'prenup', label: 'Prenuptial Agreement', desc: 'Before marriage (also called Marriage Contract)' },
  { id: 'postnup', label: 'Postnuptial Agreement', desc: 'After marriage to modify property rights' },
  { id: 'amendment', label: 'Amendment Agreement', desc: 'Modify an existing agreement' }
]

const SCHEDULE_TYPES = [
  { id: 'primary', label: 'Primary Care with Reasonable Access' },
  { id: 'weekend', label: 'Every Other Weekend' },
  { id: 'week_on_off', label: 'Week On, Week Off' },
  { id: '2_2_3', label: '2-2-3 Schedule' },
  { id: '5_2_2_5', label: '5-2-2-5 Schedule' },
  { id: 'custom', label: 'Custom Schedule' }
]

function AgreementTypeSelector({ onSelect, loading }) {
  return (
    <div style={{maxWidth:'700px', margin:'0 auto'}}>
      <div style={{marginBottom:'40px', textAlign:'center'}}>
        <h1 style={{marginBottom:'12px'}}>Create an Agreement</h1>
        <p style={{color:'var(--s600)'}}>Select the type of legal agreement you want to generate</p>
      </div>

      <div style={{display:'grid', gap:'16px'}}>
        {AGREEMENT_TYPES.map(type => (
          <button
            key={type.id}
            onClick={() => onSelect(type.id)}
            disabled={loading}
            style={{
              padding:'20px',
              border:'2px solid var(--border)',
              borderRadius:'8px',
              backgroundColor:'white',
              cursor: loading ? 'not-allowed' : 'pointer',
              transition:'all 0.2s',
              textAlign:'left',
              opacity: loading ? 0.6 : 1
            }}
            onMouseEnter={e => !loading && (e.currentTarget.style.borderColor = 'var(--v)', e.currentTarget.style.backgroundColor = 'var(--vx)')}
            onMouseLeave={e => !loading && (e.currentTarget.style.borderColor = 'var(--border)', e.currentTarget.style.backgroundColor = 'white')}
          >
            <div style={{fontSize:'1.1rem', fontWeight:'600', marginBottom:'4px'}}>{type.label}</div>
            <div style={{fontSize:'0.9rem', color:'var(--s600)'}}>{type.desc}</div>
          </button>
        ))}
      </div>
    </div>
  )
}

function FormField({ label, type = 'text', value, onChange, required = false, placeholder = '', min, max }) {
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
        min={min}
        max={max}
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

function InterviewStep({ stepNum, totalSteps, title, children, onBack, onContinue, canContinue, loading }) {
  return (
    <div style={{maxWidth:'700px', margin:'0 auto'}}>
      <div style={{marginBottom:'40px'}}>
        <div style={{fontSize:'0.875rem', color:'var(--s600)', marginBottom:'16px'}}>
          Step {stepNum} of {totalSteps}
        </div>
        <div style={{width:'100%', height:'4px', backgroundColor:'var(--border)', borderRadius:'4px', overflow:'hidden'}}>
          <div style={{width:`${(stepNum/totalSteps)*100}%`, height:'100%', backgroundColor:'var(--v)', transition:'width 0.3s'}}></div>
        </div>
      </div>

      <div style={{marginBottom:'40px'}}>
        <h1 style={{marginBottom:'12px'}}>{title}</h1>
      </div>

      <div style={{marginBottom:'40px', backgroundColor:'white', padding:'30px', borderRadius:'8px', border:'1px solid var(--border)'}}>
        {children}
      </div>

      <div style={{display:'flex', gap:'12px', justifyContent:'space-between'}}>
        <button onClick={onBack} className="btn btn-outline">← Back</button>
        <button onClick={onContinue} disabled={!canContinue || loading} className="btn btn-primary">
          {loading ? 'Saving...' : (stepNum === totalSteps ? 'Create Agreement' : 'Continue →')}
        </button>
      </div>
    </div>
  )
}

function InterviewContent() {
  const { user, loading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentStep, setCurrentStep] = useState(0)
  const [agreementType, setAgreementType] = useState(null)
  const [calculationId, setCalculationId] = useState(null)
  const [prefillData, setPrefillData] = useState(null)
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState([])
  const [formData, setFormData] = useState({
    label: '',
    party1Name: '',
    party1Dob: '',
    party1Occupation: '',
    party1Residence: '',
    party2Name: '',
    party2Dob: '',
    party2Occupation: '',
    party2Residence: '',
    signingCity: '',
    signingDate: new Date().toISOString().split('T')[0],
    marriageDate: '',
    separationDate: '',
    cohabitationDate: '',
    children: [],
    decisionMaking: [],
    parenting_schedule: 'primary',
    holidays: [],
    childSupportIncomeA: '',
    childSupportIncomeB: '',
    childSupportAmount: '',
    childSupportRetroactive: false,
    spousalSupportAmount: '',
    spousalSupportDuration: '',
    spousalSupportTermination: '',
    propertyMatrimonialHome: '',
    propertyEqualization: '',
    lifeInsurance: false,
    lifeInsuranceAmount: '',
    disputeResolution: 'negotiation'
  })

  const calcIdParam = searchParams.get('from_calculation')

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (calcIdParam && user) {
      setCalculationId(calcIdParam)
      api.get(`/api/calculations/${calcIdParam}`)
        .then(r => r?.ok ? r.json() : null)
        .then(d => {
          if (d?.inputs) {
            setPrefillData(d.inputs)
            setFormData(f => ({
              ...f,
              party1Name: d.inputs.personAName || '',
              party2Name: d.inputs.personBName || '',
              party1Dob: d.inputs.personADob ? fmtInputDate(d.inputs.personADob) : '',
              party2Dob: d.inputs.personBDob ? fmtInputDate(d.inputs.personBDob) : '',
              children: d.inputs.children || [],
              childSupportIncomeA: d.inputs.incomePerson1 || '',
              childSupportIncomeB: d.inputs.incomePerson2 || ''
            }))
          }
        })
        .catch(() => {})
    }
  }, [user, authLoading, router, calcIdParam])

  const handleTypeSelect = (type) => {
    setAgreementType(type)
    setCurrentStep(1)
    setErrors([])
  }

  const handleBack = () => {
    if (currentStep === 1) {
      setAgreementType(null)
      setCurrentStep(0)
    } else {
      setCurrentStep(c => c - 1)
    }
    setErrors([])
  }

  const validateCurrentStep = () => {
    const newErrors = validateStep(currentStep, { ...formData, agreementType })
    setErrors(newErrors)
    return newErrors.length === 0
  }

  const handleContinue = async () => {
    if (!validateCurrentStep()) return

    if (currentStep === 8) {
      setLoading(true)
      try {
        console.log('Creating agreement with:', { agreementType, calculationId, formDataKeys: Object.keys(formData) })
        const res = await api.post('/api/agreements', {
          agreement_type: agreementType,
          label: formData.label || 'Untitled Agreement',
          calculation_id: calculationId,
          interview_data: formData
        })

        if (!res.ok) {
          const errorData = await res.json().catch(() => ({}))
          console.error('API error:', res.status, errorData)
          alert(`Failed to create agreement: ${errorData.error || res.statusText}`)
          setLoading(false)
          return
        }

        const data = await res.json()
        console.log('Agreement created with ID:', data.id)

        if (!data.id) {
          alert('No agreement ID returned from server')
          setLoading(false)
          return
        }

        router.push(`/agreements/${data.id}`)
      } catch (err) {
        console.error('Error creating agreement:', err)
        alert(`Error creating agreement: ${err.message}`)
        setLoading(false)
      }
    } else {
      setCurrentStep(c => c + 1)
      setErrors([])
    }
  }

  const updateFormData = (key, value) => {
    setFormData(f => ({...f, [key]: value}))
  }

  const addChild = () => {
    setFormData(f => ({
      ...f,
      children: [...(f.children || []), { name: '', dateOfBirth: '', residence: '' }]
    }))
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

  if (authLoading) return <div className="loading-screen"><div className="spinner" /></div>

  if (!agreementType) {
    return (
      <div className="page-wrap">
        <Nav />
        <main style={{padding:'60px 40px'}}>
          <AgreementTypeSelector onSelect={handleTypeSelect} loading={false} />
        </main>
      </div>
    )
  }

  const STEPS = [
    { title: 'Agreement Type', content: null },
    { title: 'Party Information', content: 'step1' },
    { title: 'Children', content: 'step2' },
    { title: 'Parenting Arrangements', content: 'step3' },
    { title: 'Child Support', content: 'step4' },
    { title: 'Spousal Support', content: 'step5' },
    { title: 'Property Division', content: 'step6' },
    { title: 'Additional Terms', content: 'step7' },
    { title: 'Review & Signatures', content: 'step8' }
  ]

  const renderStep = () => {
    if (currentStep === 1) {
      return (
        <>
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

          {agreementType === 'separation' && (
            <>
              <FormField label="Date of Marriage" type="date" value={formData.marriageDate} onChange={e => updateFormData('marriageDate', e.target.value)} required />
              <FormField label="Date of Separation" type="date" value={formData.separationDate} onChange={e => updateFormData('separationDate', e.target.value)} required />
            </>
          )}
          {agreementType === 'cohabitation' && (
            <FormField label="Date Cohabitation Began" type="date" value={formData.cohabitationDate} onChange={e => updateFormData('cohabitationDate', e.target.value)} required />
          )}
          {agreementType === 'prenup' && (
            <FormField label="Intended Date of Marriage" type="date" value={formData.marriageDate} onChange={e => updateFormData('marriageDate', e.target.value)} required />
          )}
          {agreementType === 'postnup' && (
            <FormField label="Date of Marriage" type="date" value={formData.marriageDate} onChange={e => updateFormData('marriageDate', e.target.value)} required />
          )}
        </>
      )
    }

    if (currentStep === 2) {
      if (agreementType === 'prenup' || agreementType === 'cohabitation') {
        return <p style={{color:'var(--s600)'}}>This agreement type does not include children provisions. Click Continue to proceed.</p>
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
        return <p style={{color:'var(--s600)'}}>No children to arrange parenting for. Click Continue to proceed.</p>
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
                fontSize:'0.95rem',
                fontFamily:'inherit'
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
      if (agreementType === 'prenup' || agreementType === 'cohabitation') {
        return <p style={{color:'var(--s600)'}}>This agreement type does not include child support. Click Continue to proceed.</p>
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
      if (agreementType === 'prenup') {
        return <p style={{color:'var(--s600)'}}>Prenuptial agreements typically don't address spousal support. Click Continue to proceed.</p>
      }

      return (
        <>
          <div style={{marginBottom:'24px', padding:'16px', backgroundColor:'var(--vc)', borderRadius:'6px'}}>
            <p style={{margin:'0', fontSize:'0.9rem'}}>
              <strong>Spousal Support Advisory Guidelines (SSAG)</strong><br/>
              SSAG provides formulas for support ranging from no support to indefinite support, depending on income difference and duration of relationship.
            </p>
          </div>
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
      if (agreementType === 'prenup' || agreementType === 'cohabitation') {
        return <p style={{color:'var(--s600)'}}>This agreement type does not include property division. Click Continue to proceed.</p>
      }

      return (
        <>
          <FormField label="Matrimonial Home Address" value={formData.propertyMatrimonialHome} onChange={e => updateFormData('propertyMatrimonialHome', e.target.value)} placeholder="Leave blank if no matrimonial home" />
          <FormField label="Equalization Payment Amount (if applicable)" type="number" value={formData.propertyEqualization} onChange={e => updateFormData('propertyEqualization', e.target.value)} placeholder="Leave blank if no equalization" />
          <div style={{padding:'16px', backgroundColor:'var(--vx)', borderRadius:'6px', marginBottom:'20px'}}>
            <p style={{margin:'0', fontSize:'0.9rem', color:'var(--s600)'}}>
              <strong>Note:</strong> The agreement will include a Net Family Property (NFP) calculation schedule based on the information you provide. Both parties should independently verify asset and debt values.
            </p>
          </div>
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

    if (currentStep === 8) {
      return (
        <>
          <div style={{padding:'16px', backgroundColor:'var(--vx)', borderRadius:'6px', marginBottom:'24px'}}>
            <h3 style={{marginTop:'0', marginBottom:'12px'}}>Review Your Agreement</h3>
            <p style={{margin:'8px 0', color:'var(--s600)', fontSize:'0.9rem'}}>
              <strong>Party 1:</strong> {formData.party1Name}
            </p>
            <p style={{margin:'8px 0', color:'var(--s600)', fontSize:'0.9rem'}}>
              <strong>Party 2:</strong> {formData.party2Name}
            </p>
            <p style={{margin:'8px 0', color:'var(--s600)', fontSize:'0.9rem'}}>
              <strong>Agreement Type:</strong> {AGREEMENT_TYPES.find(t => t.id === agreementType)?.label}
            </p>
            {formData.children && formData.children.length > 0 && (
              <p style={{margin:'8px 0', color:'var(--s600)', fontSize:'0.9rem'}}>
                <strong>Children:</strong> {formData.children.map(c => c.name).join(', ')}
              </p>
            )}
          </div>

          <FormField label="Signing Date" type="date" value={formData.signingDate} onChange={e => updateFormData('signingDate', e.target.value)} required />

          <div style={{padding:'16px', backgroundColor:'var(--vc)', borderRadius:'6px'}}>
            <p style={{margin:'0', fontSize:'0.85rem', color:'var(--s600)'}}>
              ⚠️ <strong>Legal Disclaimer:</strong> This tool generates a draft agreement. Both parties should have this reviewed by independent lawyers before signing. This is not a substitute for legal advice.
            </p>
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
        <InterviewStep
          stepNum={currentStep}
          totalSteps={STEPS.length - 1}
          title={STEPS[currentStep].title}
          onBack={handleBack}
          onContinue={handleContinue}
          canContinue={true}
          loading={loading}
        >
          {currentStep === 0 ? (
            <AgreementTypeSelector onSelect={handleTypeSelect} loading={false} />
          ) : (
            <>
              {errors.length > 0 && (
                <div style={{padding:'12px 16px', backgroundColor:'#fef2f2', border:'1px solid #fecaca', borderRadius:'6px', marginBottom:'20px'}}>
                  <p style={{margin:'0', color:'#991b1b', fontSize:'0.9rem', fontWeight:'500'}}>Please correct the following:</p>
                  <ul style={{margin:'8px 0 0 0', paddingLeft:'20px', color:'#991b1b', fontSize:'0.9rem'}}>
                    {errors.map((e, i) => <li key={i}>{e}</li>)}
                  </ul>
                </div>
              )}
              {renderStep()}
            </>
          )}
        </InterviewStep>
      </main>
    </div>
  )
}

export default function AgreementNewPage() {
  return (
    <AuthProvider>
      <Suspense fallback={<div className="loading-screen"><div className="spinner" /></div>}>
        <InterviewContent />
      </Suspense>
    </AuthProvider>
  )
}
