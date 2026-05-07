'use client'
import { Fragment, useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import api from '@/lib/apiClient'
import './calculator.css'

const fmtCAD = n => n == null ? '—' : `$${Math.abs(Math.round(n)).toLocaleString('en-CA')}`

const STEPS_W  = ['Mode','People','Dates','Results']
const STEPS_WC = ['Mode','People','Dates','Children','Results']

function CalculatorContent() {
  const { user, loading: al } = useAuth()
  const router = useRouter()
  const [mode, setMode]   = useState(null)
  const [step, setStep]   = useState(0)
  const [loading, setLoading] = useState(false)
  const [apiErr, setApiErr]   = useState('')
  const [results, setResults] = useState(null)
  const [savedId, setSavedId] = useState(null)

  const [people, setPeople] = useState({ personAName:'', personAIncome:'', personBName:'', personBIncome:'' })
  const [dates,  setDates]  = useState({ cohabitationDate:'', separationDate:'' })
  const [label, setLabel]   = useState('')
  const [children, setChildren] = useState([{ name:'', dateOfBirth:'', residesWith:'B' }])

  useEffect(() => {
    if (!al && !user) {
      router.push('/login')
    }
  }, [user, al, router])

  if (al) return <div className="loading-screen"><div className="spinner"/></div>
  if (!user) return <div className="loading-screen"><div className="spinner"/></div>

  const steps = mode === 'with' ? STEPS_WC : STEPS_W
  const next = () => setStep(s => s + 1)
  const prev = () => setStep(s => s - 1)

  const addChild    = () => setChildren(c => [...c, { name:'', dateOfBirth:'', residesWith:'B' }])
  const removeChild = i => setChildren(c => c.filter((_,idx)=>idx!==i))
  const setChild    = (i,k,v) => setChildren(c => c.map((ch,idx)=>idx===i?{...ch,[k]:v}:ch))

  const calculate = async () => {
    if (loading) return // Prevent duplicate submissions
    setLoading(true); setApiErr('')
    try {
      const isWith = mode === 'with'
      const endpoint = isWith ? '/api/calculations/with' : '/api/calculations/without'
      // Use current tax year for calculations
      const autoTaxYear = new Date().getFullYear()
      const payload = {
        personAIncome: +people.personAIncome, personBIncome: +people.personBIncome,
        cohabitationDate: dates.cohabitationDate, separationDate: dates.separationDate,
        personAName: people.personAName, personBName: people.personBName,
        label: label || `${people.personAName||'Person A'} & ${people.personBName||'Person B'}`,
        ...(isWith && { children, taxYear: autoTaxYear }),
      }
      const res  = await api.post(endpoint, payload)
      const data = await res.json()
      if (!res.ok) { setApiErr(data.error || 'Calculation failed'); setLoading(false); return }
      setResults(data.results); setSavedId(data.id); next(); setLoading(false)
    } catch (err) {
      setApiErr('Network error — please try again.')
      setLoading(false)
    }
  }

  const reset = () => { setMode(null); setStep(0); setResults(null); setSavedId(null); setApiErr('') }

  const durText = () => {
    if (!dates.cohabitationDate || !dates.separationDate) return null
    const yrs = (new Date(dates.separationDate) - new Date(dates.cohabitationDate)) / (365.25*24*3600*1000)
    if (yrs <= 0) return <span className="dur-err">⚠ Separation must be after cohabitation</span>
    const y = Math.floor(yrs), m = Math.round((yrs-y)*12)
    return <span>Duration: <strong>{y} year{y!==1?'s':''}{m>0?`, ${m} month${m!==1?'s':''}`:''}  </strong></span>
  }

  const nameA = people.personAName || 'Person A'
  const nameB = people.personBName || 'Person B'

  return (
    <div className="page-wrap">
      <Nav />
      <main className="calc-main">

        {/* Step indicator */}
        {mode && (
          <div className="steps-indicator">
            {steps.map((lbl,i) => (
              <Fragment key={lbl}>
                {i > 0 && <div className={`step-connector ${i<=step?'done':''}`} />}
                <div className="step-item">
                  <div className={`step-circle ${i<step?'done':i===step?'active':''}`}>
                    {i < step ? '✓' : i+1}
                  </div>
                  <span className={`step-label ${i===step?'active':''}`}>{lbl}</span>
                </div>
              </Fragment>
            ))}
          </div>
        )}

        {/* STEP 0 — Mode */}
        {step === 0 && (
          <div className="calc-step fade-up">
            <div className="step-head"><h2>What type of calculation do you need?</h2><p>This determines which formula is used. With children is more complex because child support affects taxes.</p></div>
            <div className="mode-grid">
              <button className="mode-card" onClick={()=>{setMode('without');next()}}>
                <div className="mode-icon">👤</div>
                <h3>Without child support</h3>
                <p>No children, or children are adults. Uses the simpler pre-tax SSAG formula.</p>
                <span className="mode-tag">Faster · Simpler</span>
              </button>
              <button className="mode-card mode-featured" onClick={()=>{setMode('with');next()}}>
                <div className="mode-icon">👨‍👩‍👧‍👦</div>
                <h3>With child support</h3>
                <p>Children under 18. Runs full Ontario T1 tax returns including CCB, GST/HST, CAI and more.</p>
                <span className="mode-tag mode-tag-v">Full tax engine · NDI method</span>
              </button>
            </div>
            <div className="disclaimer" style={{marginTop:'1.5rem'}}>
              <strong>Important:</strong> These calculations are for informational purposes only. Results do not constitute legal advice. Always consult a qualified Ontario family lawyer.
            </div>
          </div>
        )}

        {/* STEP 1 — People */}
        {step === 1 && (
          <div className="calc-step fade-up">
            <div className="step-head"><h2>Enter income information</h2><p>Use Line 15000 from the most recent Notice of Assessment. The higher earner is typically the payor.</p></div>
            <div className="calc-card">
              <div className="people-grid">
                <PersonBlock label="A" role="Person A" hint="Typically higher earner"
                  name={people.personAName} income={people.personAIncome}
                  onName={v=>setPeople(p=>({...p,personAName:v}))}
                  onIncome={v=>setPeople(p=>({...p,personAIncome:v}))} />
                <div className="vs"><div className="vs-circle">VS</div></div>
                <PersonBlock label="B" role="Person B" hint="Typically recipient"
                  name={people.personBName} income={people.personBIncome}
                  onName={v=>setPeople(p=>({...p,personBName:v}))}
                  onIncome={v=>setPeople(p=>({...p,personBIncome:v}))} />
              </div>
              {people.personAIncome && people.personBIncome && (
                <div className="income-bar">
                  <span>Difference: <strong>{fmtCAD(Math.abs(+people.personAIncome - +people.personBIncome))}</strong></span>
                  <span>Likely payor: <strong>{+people.personAIncome >= +people.personBIncome ? nameA : nameB}</strong></span>
                </div>
              )}
            </div>
            <div className="step-footer">
              <button className="btn btn-outline" onClick={prev}>← Back</button>
              <button className="btn btn-primary" disabled={!people.personAIncome||!people.personBIncome} onClick={next}>Continue →</button>
            </div>
          </div>
        )}

        {/* STEP 2 — Dates */}
        {step === 2 && (
          <div className="calc-step fade-up">
            <div className="step-head"><h2>Relationship dates</h2><p>Use the date you began living together — not the wedding date. Duration determines the support range.</p></div>
            <div className="calc-card">
              <div className="dates-grid">
                <div className="form-group">
                  <label className="form-label">Date of cohabitation (moved in together)</label>
                  <input type="date" className="form-input" value={dates.cohabitationDate}
                    onChange={e=>setDates(d=>({...d,cohabitationDate:e.target.value}))} />
                  <span className="form-hint">When you began living together as a couple</span>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of separation</label>
                  <input type="date" className="form-input" value={dates.separationDate}
                    onChange={e=>setDates(d=>({...d,separationDate:e.target.value}))} />
                  <span className="form-hint">The date you ceased to cohabit</span>
                </div>
              </div>
              {(dates.cohabitationDate||dates.separationDate) && (
                <div className="duration-note" style={{marginTop:'1rem'}}>{durText()}</div>
              )}
              <div className="form-group" style={{marginTop:'1.25rem'}}>
                <label className="form-label">Calculation label (optional)</label>
                <input type="text" className="form-input" placeholder="e.g. Initial estimate, Scenario 1"
                  value={label} onChange={e=>setLabel(e.target.value)} />
              </div>
            </div>
            <div className="step-footer">
              <button className="btn btn-outline" onClick={prev}>← Back</button>
              <button className="btn btn-primary"
                disabled={!dates.cohabitationDate||!dates.separationDate||new Date(dates.separationDate)<=new Date(dates.cohabitationDate)}
                onClick={mode==='with'?next:calculate}>
                {mode==='with'?'Continue →':(loading?<><span className="btn-spinner"/>Calculating…</>:'Calculate →')}
              </button>
            </div>
          </div>
        )}

        {/* STEP 3 — Children (with mode only) */}
        {step === 3 && mode === 'with' && (
          <div className="calc-step fade-up">
            <div className="step-head"><h2>Children</h2><p>Add each child under 18 and their parenting arrangement. This determines child support table amounts.</p></div>
            <div className="calc-card">
              {children.map((ch,i) => (
                <div key={i} className="child-block">
                  <div className="child-block-hdr">
                    <span className="child-num">Child {i+1}</span>
                    {children.length>1 && <button className="btn btn-ghost btn-sm" onClick={()=>removeChild(i)}>Remove</button>}
                  </div>
                  <div className="child-fields">
                    <div className="form-group">
                      <label className="form-label">Name (optional)</label>
                      <input type="text" className="form-input" placeholder="Child's name"
                        value={ch.name} onChange={e=>setChild(i,'name',e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Date of birth</label>
                      <input type="date" className="form-input"
                        value={ch.dateOfBirth} onChange={e=>setChild(i,'dateOfBirth',e.target.value)} />
                    </div>
                    <div className="form-group">
                      <label className="form-label">Parenting arrangement</label>
                      <select className="form-input" value={ch.residesWith} onChange={e=>setChild(i,'residesWith',e.target.value)}>
                        <option value="A">Primary care — {nameA}</option>
                        <option value="B">Primary care — {nameB}</option>
                        <option value="shared">Shared (≥40% each)</option>
                      </select>
                    </div>
                  </div>
                  {i < children.length-1 && <div className="child-divider"/>}
                </div>
              ))}
              <button className="btn btn-outline btn-sm" style={{marginTop:'1rem'}} onClick={addChild}>+ Add another child</button>
            </div>
            {apiErr && <div className="calc-err">{apiErr}</div>}
            <div className="step-footer">
              <button className="btn btn-outline" onClick={prev}>← Back</button>
              <button className="btn btn-primary" disabled={loading||children.some(c=>!c.dateOfBirth)} onClick={calculate}>
                {loading ? <><span className="btn-spinner"/>Calculating…</> : 'Calculate →'}
              </button>
            </div>
          </div>
        )}

        {/* RESULTS */}
        {results && step === steps.length-1 && (
          <div className="calc-step fade-up">
            <div className="step-head">
              <h2>Spousal Support Range</h2>
              <p>{results.payorIsA ? `${nameA} → ${nameB}` : `${nameB} → ${nameA}`} · <strong>{results.durationYears} years</strong></p>
            </div>

            <div className="result-grid fade-up-2">
              {['high','mid','low'].map(t => (
                <div key={t} className={`result-card ${t}`}>
                  <div className="result-label">{t.toUpperCase()}</div>
                  <div className="result-amount">{fmtCAD(results[t].monthly)}</div>
                  <div className="result-period">per month</div>
                  <div className="result-monthly">{fmtCAD(results[t].annual)} / year</div>
                </div>
              ))}
            </div>

            {results.supportDurationRange && (
              <div className="duration-note fade-up-2">
                <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
                SSAG suggested support duration: <strong>{results.supportDurationRange.low}–{results.supportDurationRange.high} years</strong>
              </div>
            )}

            {mode==='with' && results.childSupport && (
              <div className="calc-card" style={{marginTop:'1.25rem'}}>
                <div className="cs-title">Child Support — {results.childSupport.tableName}</div>
                <div className="cs-rows">
                  <div className="cs-row"><span>{nameA} s.3 support</span><strong>{fmtCAD(results.childSupport.s3_A_pays_monthly)}/mo</strong></div>
                  <div className="cs-row"><span>{nameB} s.3 support</span><strong>{fmtCAD(results.childSupport.s3_B_pays_monthly)}/mo</strong></div>
                  {results.childSupport.s9_monthly>0 && <div className="cs-row"><span>s.9 shared care</span><strong>{fmtCAD(results.childSupport.s9_monthly)}/mo</strong></div>}
                </div>
              </div>
            )}

            {mode==='with' && results.taxA && results.taxB && (
              <div className="calc-card" style={{marginTop:'1.25rem'}}>
                <div className="cs-title">Net Disposable Income Breakdown (at mid-range)</div>
                <p className="detail-note-sm">Full Ontario T1 + ON428 simulation including CCB, GST/HST, CAI, OTB, OCB, LIFT credit.</p>
                <div className="tax-grid">
                  {[[nameA, results.taxA],[nameB, results.taxB]].map(([name, tax]) => (
                    <div key={name} className="tax-col">
                      <div className="tax-name">{name}</div>
                      <table className="dt">
                        <tbody>
                          <tr className="dt-section"><td colSpan={2}>Income</td></tr>
                          <tr><th>Gross income</th><td>{fmtCAD(tax.grossIncome)}</td></tr>
                          {tax.supportReceived > 0 && <tr><th>Spousal support received</th><td>+{fmtCAD(tax.supportReceived)}</td></tr>}
                          {tax.supportPaid > 0 && <tr><th>Spousal support paid</th><td>-{fmtCAD(tax.supportPaid)}</td></tr>}
                          <tr><th>Net income (Line 23600)</th><td>{fmtCAD(tax.netIncome)}</td></tr>
                          <tr className="dt-section"><td colSpan={2}>Taxes & Deductions</td></tr>
                          <tr><th>Federal income tax</th><td>({fmtCAD(tax.fedTaxPayable)})</td></tr>
                          <tr><th>Ontario income tax</th><td>({fmtCAD(tax.ontTaxPayable)})</td></tr>
                          <tr><th>CPP contributions</th><td>({fmtCAD(tax.cpp?.total)})</td></tr>
                          <tr><th>EI premiums</th><td>({fmtCAD(tax.ei)})</td></tr>
                          <tr className="dt-section"><td colSpan={2}>Benefits & Credits</td></tr>
                          {tax.benefits.ccb > 0 && <tr><th>Canada Child Benefit</th><td>+{fmtCAD(tax.benefits.ccb)}</td></tr>}
                          {tax.benefits.gst > 0 && <tr><th>GST/HST credit</th><td>+{fmtCAD(tax.benefits.gst)}</td></tr>}
                          {tax.benefits.cai > 0 && <tr><th>Climate Action Incentive</th><td>+{fmtCAD(tax.benefits.cai)}</td></tr>}
                          {tax.benefits.ocb > 0 && <tr><th>Ontario Child Benefit</th><td>+{fmtCAD(tax.benefits.ocb)}</td></tr>}
                          {tax.benefits.otb > 0 && <tr><th>Ontario Trillium Benefit</th><td>+{fmtCAD(tax.benefits.otb)}</td></tr>}
                          {tax.benefits.cwb > 0 && <tr><th>Canada Workers Benefit</th><td>+{fmtCAD(tax.benefits.cwb)}</td></tr>}
                          <tr className="dt-total"><th>Net Disposable Income</th><td>{fmtCAD(tax.netDisposableIncome)}</td></tr>
                        </tbody>
                      </table>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="disclaimer" style={{marginTop:'1.25rem'}}>
              <strong>Reminder:</strong> These figures are SSAG estimates. Actual court-ordered support depends on special expenses, imputed income, lifestyle, and other factors. This is not legal advice.
            </div>

            <div className="res-actions">
              <button className="btn btn-outline" onClick={reset}>New calculation</button>
              {savedId && <Link href={`/calculations/${savedId}`} className="btn btn-primary">View full report →</Link>}
              <Link href="/dashboard" className="btn btn-ghost">← Dashboard</Link>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function PersonBlock({ label, role, hint, name, income, onName, onIncome }) {
  return (
    <div className="person-block">
      <div className="person-hdr">
        <div className={`person-av av-${label.toLowerCase()}`}>{label}</div>
        <div><div className="person-role">{role}</div><div className="person-hint">{hint}</div></div>
      </div>
      <div className="form-group">
        <label className="form-label">Name (optional)</label>
        <input type="text" className="form-input" placeholder={role} value={name} onChange={e=>onName(e.target.value)} />
      </div>
      <div className="form-group">
        <label className="form-label">Line 15000 Annual Income</label>
        <div className="pfx-wrap"><span className="pfx">$</span>
          <input type="number" className="form-input" placeholder="e.g. 125000" min="0" step="1000"
            value={income} onChange={e=>onIncome(e.target.value)} />
        </div>
      </div>
    </div>
  )
}

export default function CalculatorPage() {
  return <AuthProvider><CalculatorContent /></AuthProvider>
}
