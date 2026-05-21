'use client'
import { useState, useEffect } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import api from '@/lib/apiClient'

const AGREEMENT_TYPES = [
  { id: 'separation', label: 'Separation Agreement', desc: 'For separated spouses in Ontario' },
  { id: 'cohabitation', label: 'Cohabitation Agreement', desc: 'For unmarried couples living together' },
  { id: 'prenup', label: 'Prenuptial Agreement', desc: 'Before marriage (also called Marriage Contract)' },
  { id: 'postnup', label: 'Postnuptial Agreement', desc: 'After marriage to modify property rights' },
  { id: 'amendment', label: 'Amendment Agreement', desc: 'Modify an existing agreement' }
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
  const [formData, setFormData] = useState({})

  const calcIdParam = searchParams.get('from_calculation')

  useEffect(() => {
    if (!authLoading && !user) { router.push('/login'); return }
    if (calcIdParam && user) {
      setCalculationId(calcIdParam)
      // Fetch calculation data to pre-fill
      api.get(`/api/calculations/${calcIdParam}`)
        .then(r => r?.ok ? r.json() : null)
        .then(d => {
          if (d?.inputs) {
            setPrefillData(d.inputs)
          }
        })
        .catch(() => {})
    }
  }, [user, authLoading, router, calcIdParam])

  const handleTypeSelect = (type) => {
    setAgreementType(type)
    setCurrentStep(1)
  }

  const handleBack = () => {
    if (currentStep === 1) {
      setAgreementType(null)
      setCurrentStep(0)
    } else {
      setCurrentStep(c => c - 1)
    }
  }

  const handleContinue = async () => {
    if (currentStep === 8) {
      // Create the agreement
      setLoading(true)
      try {
        const res = await api.post('/api/agreements', {
          agreement_type: agreementType,
          label: formData.label || 'Untitled Agreement',
          calculation_id: calculationId,
          interview_data: formData
        })
        if (res.ok) {
          const data = await res.json()
          router.push(`/agreements/${data.id}`)
        } else {
          alert('Failed to create agreement')
          setLoading(false)
        }
      } catch (err) {
        alert('Error creating agreement')
        setLoading(false)
      }
    } else {
      setCurrentStep(c => c + 1)
    }
  }

  const updateFormData = (key, value) => {
    setFormData(f => ({...f, [key]: value}))
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
          canContinue={currentStep <= 1}
          loading={loading}
        >
          <div style={{marginBottom:'20px', padding:'16px', backgroundColor:'var(--vx)', borderRadius:'8px'}}>
            <p style={{margin:'0', fontSize:'0.9rem', color:'var(--s600)'}}>
              Agreement type: <strong>{AGREEMENT_TYPES.find(t => t.id === agreementType)?.label}</strong>
            </p>
          </div>

          <div style={{marginBottom:'24px'}}>
            <label style={{display:'block', marginBottom:'8px', fontWeight:'500'}}>Agreement Name (optional)</label>
            <input
              type="text"
              placeholder="e.g. Initial Draft, Final Agreement"
              value={formData.label || ''}
              onChange={e => updateFormData('label', e.target.value)}
              style={{
                width:'100%',
                padding:'10px 12px',
                border:'1px solid var(--border)',
                borderRadius:'6px',
                fontSize:'0.95rem',
                fontFamily:'inherit'
              }}
            />
          </div>

          <p style={{color:'var(--s600)', fontSize:'0.9rem'}}>
            Complete this agreement interview step by step. Data will be automatically saved as you progress.
          </p>
        </InterviewStep>
      </main>
    </div>
  )
}

export default function AgreementNewPage() {
  return <AuthProvider><InterviewContent /></AuthProvider>
}
