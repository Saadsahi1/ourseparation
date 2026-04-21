'use client'
import { useState, useEffect, use, useRef } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AuthProvider, useAuth } from '@/components/AuthProvider'
import Nav from '@/components/Nav'
import api from '@/lib/apiClient'
import './detail.css'

const fmtCAD = n => n == null ? '—' : `$${Math.abs(Math.round(n)).toLocaleString('en-CA')}`
const fmtDate = d => { try { return new Date(d).toLocaleDateString('en-CA',{month:'long',day:'numeric',year:'numeric'}) } catch { return d } }
const safeFilename = value => (value || 'calculation_report').replace(/[^a-z0-9_-]+/gi, '_')

function BenefitRows({ benefits }) {
  const rows = [
    ['Canada Child Benefit', benefits?.ccb],
    ['GST/HST credit', benefits?.gst],
    ['Climate Action Incentive', benefits?.cai],
    ['Ontario Child Benefit', benefits?.ocb],
    ['Ontario Trillium Benefit', benefits?.otb],
    ['Canada Workers Benefit', benefits?.cwb],
  ].filter(([, value]) => value > 0)

  if (rows.length === 0) return <tr><td>No benefits applied</td><td>—</td></tr>

  return rows.map(([label, value]) => (
    <tr key={label}>
      <td>{label}</td>
      <td>+{fmtCAD(value)}</td>
    </tr>
  ))
}

function DetailContent({ id }) {
  const { user, loading: al } = useAuth()
  const router = useRouter()
  const [calc, setCalc] = useState(null)
  const [loading, setLoading] = useState(true)
  const [notFound, setNotFound] = useState(false)
  const contentRef = useRef(null)
  const pdfReportRef = useRef(null)

  useEffect(() => {
    if (al) return
    if (!user) { router.push('/login'); return }

    let mounted = true
    const fetchCalc = async () => {
      try {
        const res = await api.get(`/api/calculations/${id}`)
        if (!mounted) return

        if (res?.ok) {
          const data = await res.json()
          if (mounted) {
            if (data?.notFound) {
              setCalc(null)
              setNotFound(true)
            } else if (data?.id && data?.inputs && data?.results) {
              setCalc(data)
              setNotFound(false)
            } else {
              setNotFound(true)
            }
            setLoading(false)
          }
        } else {
          if (mounted) {
            setLoading(false)
            router.push('/dashboard')
          }
        }
      } catch (err) {
        if (mounted) {
          setLoading(false)
          router.push('/dashboard')
        }
      }
    }
    fetchCalc()
    return () => { mounted = false }
  }, [id, user, al, router])

  if (al || loading) return <div className="loading-screen"><div className="spinner"/></div>
  if (notFound || !calc) {
    return (
      <div className="page-wrap">
        <Nav />
        <main className="detail-main" style={{ padding: '40px', textAlign: 'center' }}>
          <h2>Calculation not found</h2>
          <p>This calculation was deleted or is no longer available.</p>
          <Link href="/dashboard" className="btn btn-primary">← Back to dashboard</Link>
        </main>
      </div>
    )
  }

  const { inputs, results } = calc
  const nameA = inputs.personAName || 'Person A'
  const nameB = inputs.personBName || 'Person B'

  const downloadPDF = async () => {
    if (!pdfReportRef.current) return
    try {
      const { default: html2pdf } = await import('html2pdf.js')
      const filename = `${safeFilename(calc.label || `${nameA}_${nameB}`)}_spousal_support_report.pdf`
      document.body.classList.add('pdf-exporting')
      document.documentElement.classList.add('pdf-exporting')
      await new Promise(resolve => requestAnimationFrame(() => resolve()))

      const options = {
        margin: [20, 20, 20, 20],
        filename,
        image: { type: 'png', quality: 1 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: '#ffffff',
          windowHeight: pdfReportRef.current.scrollHeight,
          windowWidth: pdfReportRef.current.scrollWidth,
          logging: false,
          removeContainer: true,
          foreignObjectRendering: false,
        },
        jsPDF: {
          orientation: 'portrait',
          unit: 'mm',
          format: 'a4',
          compress: true
        },
        pagebreak: { mode: ['css', 'legacy'] }
      }

      await html2pdf().set(options).from(pdfReportRef.current).save()
    } catch (err) {
      console.error('Failed to generate PDF:', err)
      alert('Failed to generate PDF. Please try again.')
    } finally {
      document.body.classList.remove('pdf-exporting')
      document.documentElement.classList.remove('pdf-exporting')
    }
  }
  const payorName = results.payorIsA ? nameA : nameB
  const recName   = results.payorIsA ? nameB : nameA
  const isWith = calc.calculation_type === 'with_child'
  const taxPairs = [
    { label: nameA, tax: results.taxA, isPayor: results.payorIsA },
    { label: nameB, tax: results.taxB, isPayor: !results.payorIsA },
  ]

  return (
    <div className="page-wrap">
      <Nav />
      <main className="detail-main" ref={contentRef}>
        <section className="report-masthead fade-up">
          <div>
            <div className="report-kicker">Official Calculation Report</div>
            <h1 className="report-title">OurSeparation Support Calculation</h1>
            <p className="report-subtitle">
              Ontario SSAG planning summary for {calc.label || `${nameA} and ${nameB}`}
            </p>
          </div>
          <div className="report-stamp">
            <div className="report-stamp-label">Prepared</div>
            <div className="report-stamp-value">{fmtDate(calc.created_at)}</div>
          </div>
        </section>

        <section className="report-summary-grid fade-up">
          <div className="report-summary-card">
            <span className="report-summary-label">Parties</span>
            <strong>{nameA} and {nameB}</strong>
          </div>
          <div className="report-summary-card">
            <span className="report-summary-label">Support Type</span>
            <strong>{isWith ? 'With child support' : 'Without child support'}</strong>
          </div>
          <div className="report-summary-card">
            <span className="report-summary-label">Relationship Length</span>
            <strong>{results.durationYears} years</strong>
          </div>
          <div className="report-summary-card">
            <span className="report-summary-label">Likely Payor</span>
            <strong>{payorName}</strong>
          </div>
        </section>

        <div className="detail-hdr fade-up">
          <div>
            <div className="detail-meta">
              <span className={`badge ${isWith ? 'badge-violet' : 'badge-soft'}`}>{isWith ? 'With child support' : 'Without child support'}</span>
              <span className="detail-date">Calculated {fmtDate(calc.created_at)}</span>
            </div>
            <h1>{calc.label || `${nameA} & ${nameB}`}</h1>
            <p className="detail-sub">{payorName} → {recName} · {results.durationYears}-year relationship</p>
          </div>
          <button className="btn btn-outline btn-sm" onClick={downloadPDF}>Download PDF</button>
        </div>

        {/* Support range */}
        <section className="detail-section fade-up-2">
          <h2 className="section-h2">Spousal Support Range</h2>
          <div className="result-grid">
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
            <div className="duration-note" style={{marginTop:'1rem'}}>
              <svg width="14" height="14" viewBox="0 0 14 14" fill="none"><circle cx="7" cy="7" r="6" stroke="currentColor" strokeWidth="1.3"/><path d="M7 4v3.5l2 1.5" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round"/></svg>
              SSAG suggested support duration: <strong>{results.supportDurationRange.low}–{results.supportDurationRange.high} years</strong>
            </div>
          )}
        </section>

        {/* Inputs */}
        <section className="detail-section fade-up-3">
          <h2 className="section-h2">Inputs</h2>
          <div className="detail-card">
            <table className="dt">
              <tbody>
                <tr><th>{nameA} income (Line 15000)</th><td>{fmtCAD(inputs.personAIncome)}</td></tr>
                <tr><th>{nameB} income (Line 15000)</th><td>{fmtCAD(inputs.personBIncome)}</td></tr>
                <tr><th>Income difference</th><td>{fmtCAD(Math.abs(inputs.personAIncome - inputs.personBIncome))}</td></tr>
                <tr><th>Date of cohabitation</th><td>{fmtDate(inputs.cohabitationDate)}</td></tr>
                <tr><th>Date of separation</th><td>{fmtDate(inputs.separationDate)}</td></tr>
                <tr><th>Relationship duration</th><td>{results.durationYears} years</td></tr>
                {isWith && <tr><th>Tax year</th><td>{inputs.taxYear || 2023}</td></tr>}
                <tr><th>Payor</th><td>{payorName} ({fmtCAD(results.payorIncome)}/yr)</td></tr>
                <tr><th>Recipient</th><td>{recName} ({fmtCAD(results.recipientIncome)}/yr)</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Child support */}
        {isWith && results.childSupport && (
          <section className="detail-section fade-up-3">
            <h2 className="section-h2">Child Support</h2>
            <div className="detail-card">
              <div className="dt-note">Table: <strong>{results.childSupport.tableName}</strong> — auto-selected based on separation date of {fmtDate(inputs.separationDate)}</div>
              <table className="dt">
                <tbody>
                  <tr><th>{nameA} s.3 support (monthly)</th><td>{fmtCAD(results.childSupport.s3_A_pays_monthly)}</td></tr>
                  <tr><th>{nameB} s.3 support (monthly)</th><td>{fmtCAD(results.childSupport.s3_B_pays_monthly)}</td></tr>
                  {results.childSupport.s9_monthly > 0 && <tr><th>s.9 shared care (monthly)</th><td>{fmtCAD(results.childSupport.s9_monthly)}</td></tr>}
                  <tr className="dt-total"><th>Net child support from {payorName}</th><td>{fmtCAD(Math.abs(results.childSupport.netChildSupportFromA))}/mo</td></tr>
                </tbody>
              </table>
            </div>
            {inputs.children?.length > 0 && (
              <div className="detail-card" style={{marginTop:'1rem'}}>
                <table className="dt">
                  <thead><tr><th>Name</th><th>Date of birth</th><th>Lives with</th></tr></thead>
                  <tbody>
                    {inputs.children.map((ch,i)=>(
                      <tr key={i}>
                        <td style={{textAlign:'left',fontWeight:400,color:'var(--s900)'}}>{ch.name||`Child ${i+1}`}</td>
                        <td style={{textAlign:'left',fontWeight:400,color:'var(--s900)'}}>{fmtDate(ch.dateOfBirth)}</td>
                        <td style={{textAlign:'left',fontWeight:400,color:'var(--s900)'}}>{ch.residesWith==='A'?`Primary — ${nameA}`:ch.residesWith==='B'?`Primary — ${nameB}`:'Shared'}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </section>
        )}

        {/* Tax breakdown */}
        {isWith && results.taxA && results.taxB && (
          <section className="detail-section fade-up-4">
            <h2 className="section-h2">Net Disposable Income Breakdown (at mid-range)</h2>
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
          </section>
        )}

        <div className="disclaimer fade-up-4">
          <strong>Legal Disclaimer:</strong> These calculations are based on the SSAG and Federal Child Support Guidelines as applied to Ontario. Results are estimates for informational purposes only. They do not constitute legal advice and should not be relied upon as a substitute for advice from a qualified family law lawyer. Actual support obligations are determined by a court or formal agreement.
        </div>

        <div className="detail-actions">
          <Link href="/dashboard" className="btn btn-outline">← Dashboard</Link>
          <Link href="/calculator" className="btn btn-primary">New calculation</Link>
        </div>

        {/* PDF-ONLY PROFESSIONAL REPORT */}
        <div className="pdf-professional-report" ref={pdfReportRef} aria-hidden="true">
          <section className="pdf-sheet pdf-memo-sheet">
            <div className="pdf-memo-header">
              <div>
                <div className="pdf-memo-brand">OurSeparation</div>
                <h1 className="pdf-memo-title">Spousal Support Calculation Report</h1>
                <div className="pdf-memo-subtitle">{calc.label || `${nameA} and ${nameB}`}</div>
              </div>
              <div className="pdf-memo-meta">
                <div><span>Date</span><strong>{fmtDate(calc.created_at)}</strong></div>
                <div><span>Jurisdiction</span><strong>Ontario, Canada</strong></div>
                <div><span>Support Type</span><strong>{isWith ? 'With child support' : 'Without child support'}</strong></div>
              </div>
            </div>

            <div className="pdf-memo-grid">
              <div className="pdf-memo-panel">
                <div className="pdf-memo-panel-title">Calculation Summary</div>
                <table className="pdf-data-table">
                  <tbody>
                    <tr><td>Payor</td><td>{payorName}</td></tr>
                    <tr><td>Recipient</td><td>{recName}</td></tr>
                    <tr><td>Payor income</td><td>{fmtCAD(results.payorIncome)}</td></tr>
                    <tr><td>Recipient income</td><td>{fmtCAD(results.recipientIncome)}</td></tr>
                    <tr><td>Relationship duration</td><td>{results.durationYears} years</td></tr>
                    <tr><td>Tax year</td><td>{inputs.taxYear || 2025}</td></tr>
                    <tr><td>Date of cohabitation</td><td>{fmtDate(inputs.cohabitationDate)}</td></tr>
                    <tr><td>Date of separation</td><td>{fmtDate(inputs.separationDate)}</td></tr>
                  </tbody>
                </table>
              </div>

              <div className="pdf-memo-panel">
                <div className="pdf-memo-panel-title">Spousal Support Range</div>
                <div className="pdf-support-grid-pro">
                  {['high','mid','low'].map(t => (
                    <div key={t} className={`pdf-support-card pdf-support-${t}`}>
                      <div className="pdf-support-card-label">{t.toUpperCase()}</div>
                      <div className="pdf-support-card-amount">{fmtCAD(results[t].monthly)}</div>
                      <div className="pdf-support-card-period">per month</div>
                      <div className="pdf-support-card-annual">{fmtCAD(results[t].annual)} annually</div>
                    </div>
                  ))}
                </div>
                {results.supportDurationRange && (
                  <div className="pdf-callout">
                    Suggested duration: {results.supportDurationRange.low} to {results.supportDurationRange.high} years.
                  </div>
                )}
              </div>
            </div>

            {isWith && results.childSupport && (
              <div className="pdf-memo-panel pdf-memo-panel-full">
                <div className="pdf-memo-panel-title">Child Support</div>
                <table className="pdf-data-table">
                  <tbody>
                    <tr><td>Table used</td><td>{results.childSupport.tableName}</td></tr>
                    <tr><td>{nameA} monthly table amount</td><td>{fmtCAD(results.childSupport.s3_A_pays_monthly)}</td></tr>
                    <tr><td>{nameB} monthly table amount</td><td>{fmtCAD(results.childSupport.s3_B_pays_monthly)}</td></tr>
                    {results.childSupport.s9_monthly > 0 && <tr><td>Shared care adjustment</td><td>{fmtCAD(results.childSupport.s9_monthly)}</td></tr>}
                    <tr className="pdf-table-total"><td>Net child support from {payorName}</td><td>{fmtCAD(Math.abs(results.childSupport.netChildSupportFromA))} per month</td></tr>
                  </tbody>
                </table>
                {inputs.children?.length > 0 && (
                  <>
                    <div className="pdf-memo-subtitle-row">Children</div>
                    <table className="pdf-data-table">
                      <thead>
                        <tr>
                          <th>Name</th>
                          <th>Date of Birth</th>
                          <th>Parenting</th>
                        </tr>
                      </thead>
                      <tbody>
                        {inputs.children.map((ch, i) => (
                          <tr key={i}>
                            <td>{ch.name || `Child ${i + 1}`}</td>
                            <td>{fmtDate(ch.dateOfBirth)}</td>
                            <td>{ch.residesWith === 'A' ? `Primary with ${nameA}` : ch.residesWith === 'B' ? `Primary with ${nameB}` : 'Shared parenting'}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </>
                )}
              </div>
            )}
          </section>

          {isWith && results.taxA && results.taxB && (
            <section className="pdf-sheet pdf-page-break pdf-memo-sheet">
              <div className="pdf-memo-header pdf-memo-header-compact">
                <div>
                  <div className="pdf-memo-brand">OurSeparation</div>
                  <h2 className="pdf-memo-section-title">Net Disposable Income Breakdown</h2>
                </div>
                <div className="pdf-memo-note">Prepared at the mid-range support amount.</div>
              </div>

              <div className="pdf-income-grid pdf-income-grid-two">
                {taxPairs.map(({ label, tax, isPayor }) => (
                  <div key={label} className="pdf-income-card">
                    <div className="pdf-income-card-header">
                      <span>{label}</span>
                      <em>{isPayor ? 'Payor' : 'Recipient'}</em>
                    </div>

                    <div className="pdf-memo-subtitle-row">Income</div>
                    <table className="pdf-data-table">
                      <tbody>
                        <tr><td>Gross income</td><td>{fmtCAD(tax.grossIncome)}</td></tr>
                        {tax.supportPaid > 0 && <tr><td>Spousal support paid</td><td>-{fmtCAD(tax.supportPaid)}</td></tr>}
                        {tax.supportReceived > 0 && <tr><td>Spousal support received</td><td>+{fmtCAD(tax.supportReceived)}</td></tr>}
                        <tr><td>Net income (Line 23600)</td><td>{fmtCAD(tax.netIncome)}</td></tr>
                      </tbody>
                    </table>

                    <div className="pdf-memo-subtitle-row">Taxes and Deductions</div>
                    <table className="pdf-data-table">
                      <tbody>
                        <tr><td>Federal income tax</td><td>({fmtCAD(tax.fedTaxPayable)})</td></tr>
                        <tr><td>Ontario income tax</td><td>({fmtCAD(tax.ontTaxPayable)})</td></tr>
                        <tr><td>CPP contributions</td><td>({fmtCAD(tax.cpp?.total)})</td></tr>
                        <tr><td>EI premiums</td><td>({fmtCAD(tax.ei)})</td></tr>
                      </tbody>
                    </table>

                    <div className="pdf-memo-subtitle-row">Benefits and Credits</div>
                    <table className="pdf-data-table">
                      <tbody>
                        <BenefitRows benefits={tax.benefits} />
                        <tr className="pdf-table-total"><td>Net disposable income</td><td>{fmtCAD(tax.netDisposableIncome)}</td></tr>
                      </tbody>
                    </table>
                  </div>
                ))}
              </div>

              <div className="pdf-disclaimer-inline">
                <strong>Legal disclaimer.</strong> This report is for informational and settlement-planning purposes only. It is not legal advice and should not be relied on as a substitute for advice from a qualified Ontario family lawyer. Actual support obligations may differ depending on evidence, judicial discretion, imputed income, special expenses, parenting arrangements, and other case-specific facts.
              </div>

              <div className="pdf-footer-note">
                <span>Prepared {fmtDate(calc.created_at)}</span>
                <span>{nameA} and {nameB}</span>
              </div>
            </section>
          )}

          {!isWith && (
            <section className="pdf-sheet pdf-page-break pdf-memo-sheet">
              <div className="pdf-memo-header pdf-memo-header-compact">
                <div>
                  <div className="pdf-memo-brand">OurSeparation</div>
                  <h2 className="pdf-memo-section-title">Legal Disclaimer</h2>
                </div>
              </div>

              <div className="pdf-disclaimer-inline">
                <strong>Legal disclaimer.</strong> This report is for informational and settlement-planning purposes only. It is not legal advice and should not be relied on as a substitute for advice from a qualified Ontario family lawyer. Actual support obligations may differ depending on evidence, judicial discretion, imputed income, special expenses, parenting arrangements, and other case-specific facts.
              </div>
            </section>
          )}
        </div>
      </main>
    </div>
  )
}

export default function DetailPage({ params }) {
  const { id } = use(params)
  return <AuthProvider><DetailContent id={id} /></AuthProvider>
}
