'use client'
import { useMemo, useState } from 'react'
import { useRouter, useParams, useSearchParams } from 'next/navigation'
import FormField from '../shared/FormField'
import TemplateSelector from '../shared/TemplateSelector'
import SSAGBreakdown from './SSAGBreakdown'
import { calculateWithoutChildSupport } from '@/lib/calc/ssagWithout'
import { calculateWithChildSupport } from '@/lib/calc/ssagWith'
import {
  SPOUSAL_SUPPORT_TEMPLATES,
  SPOUSAL_TERMINATION_TRIGGERS,
} from '@/lib/agreements/templateLibrary'
import { checkRuleOf65 } from '@/lib/agreements/utils'

const cardStyle = {
  background: '#fff', border: '1px solid var(--border)', borderRadius: 'var(--r)',
  padding: '24px', marginBottom: '20px', boxShadow: 'var(--sh-xs)',
}

const sectionHeading = {
  marginTop: 0, marginBottom: '14px', fontSize: '1rem', fontWeight: 600, color: 'var(--s900)',
}

const fmtCAD = (n) => `$${Math.round(Number(n) || 0).toLocaleString('en-CA')}`

// Tab 6: Spousal Support — results-only.
// All calculator inputs (incomes, dates, children, residence) live in their
// dedicated tabs (Tab 1: Info, Tab 5: Child Support). This tab pulls those
// values, runs the SSAG formula, and SHOWS the result. The only things the
// user picks here are the agreement-level decisions: who pays, how much,
// what term structure, and termination triggers.
export default function SpousalSupportTab({ bundle, save, party1Name, party2Name, user }) {
  const sc = bundle.supportCalculations || {}
  const a = bundle.agreement
  const children = bundle.children || []
  const hasChildren = children.length > 0
  const [showBreakdown, setShowBreakdown] = useState(false)
  const router = useRouter()
  const params = useParams()
  const searchParams = useSearchParams()

  const saveS = (patch) => save('support', patch)

  const goToTab = (tab) => {
    const sp = new URLSearchParams(searchParams.toString())
    sp.set('tab', tab)
    router.push(`?${sp.toString()}`, { scroll: false })
  }

  const p1Income = Number(sc.party1_income) || 0
  const p2Income = Number(sc.party2_income) || 0
  const startDate = a.cohabitation_date || a.marriage_date
  const sepDate = a.separation_date

  const ssagWithout = useMemo(() => {
    if (!p1Income || !p2Income || !startDate || !sepDate) return null
    return calculateWithoutChildSupport({
      personAIncome: p1Income, personBIncome: p2Income,
      cohabitationDate: startDate, separationDate: sepDate,
    })
  }, [p1Income, p2Income, startDate, sepDate])

  const ssagWith = useMemo(() => {
    if (!hasChildren) return null
    if (!p1Income || !p2Income || !startDate || !sepDate) return null
    try {
      return calculateWithChildSupport({
        personAIncome: p1Income, personBIncome: p2Income,
        cohabitationDate: startDate, separationDate: sepDate,
        children: children.map((c) => ({
          name: c.full_name,
          dateOfBirth: c.birth_date,
          residesWith: c.primary_residence === 'party1' ? 'A' : c.primary_residence === 'party2' ? 'B' : 'shared',
        })),
        taxYear: sepDate ? new Date(sepDate).getFullYear() : new Date().getFullYear(),
      })
    } catch (e) {
      console.warn('SSAG with-child calc failed:', e.message)
      return null
    }
  }, [hasChildren, p1Income, p2Income, startDate, sepDate, children])

  const ssag = hasChildren ? ssagWith : ssagWithout
  const payorIsA = ssag?.payorIsA
  const ssagPayorName = payorIsA ? party1Name : party2Name
  const ssagRecipientName = payorIsA ? party2Name : party1Name

  const payorDob = payorIsA ? a.party1_dob : a.party2_dob
  const ruleOf65 = checkRuleOf65(payorDob, sepDate, startDate)

  const isWaived = sc.spousal_support_payor === 'none' || sc.spousal_support_template === 'complete_release'
  const yearsRelationship = startDate && sepDate
    ? Math.round(((new Date(sepDate) - new Date(startDate)) / (365.25 * 24 * 60 * 60 * 1000)) * 10) / 10
    : null

  // Quick "Use SSAG amount" buttons
  const setAmount = (amount) => saveS({ spousal_support_amount: amount, spousal_support_payor: payorIsA ? 'party1' : 'party2' })

  // Detect missing inputs so we can guide the user back to the right tab.
  const missingInputs = []
  if (!p1Income || !p2Income) missingInputs.push({ what: 'Annual gross incomes', goTo: 'child_support', tabLabel: 'Child Support' })
  if (!startDate) missingInputs.push({ what: 'Cohabitation / marriage date', goTo: 'info', tabLabel: 'Info' })
  if (!sepDate) missingInputs.push({ what: 'Separation date', goTo: 'info', tabLabel: 'Info' })

  return (
    <div>
      {/* PULLED-FROM-AGREEMENT INPUT SUMMARY (read-only) */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Spousal Support Calculator</h3>
        <p style={{ marginTop: 0, marginBottom: '20px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Calculated automatically from the data you've entered on the other tabs using the
          {' '}{hasChildren ? <strong>with-child SSAG formula</strong> : <strong>without-child SSAG formula</strong>}.
        </p>

        <div style={{
          background: 'var(--s50)', border: '1px solid var(--border)',
          borderRadius: 'var(--rs)', padding: '14px 16px',
          fontSize: '0.85rem', color: 'var(--s700)',
          display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px',
        }}>
          <div>
            <strong style={{ color: 'var(--s900)' }}>{party1Name}'s income:</strong><br/>
            {p1Income ? fmtCAD(p1Income) + '/yr' : <span style={{ color: 'var(--danger)' }}>Not set</span>}
          </div>
          <div>
            <strong style={{ color: 'var(--s900)' }}>{party2Name}'s income:</strong><br/>
            {p2Income ? fmtCAD(p2Income) + '/yr' : <span style={{ color: 'var(--danger)' }}>Not set</span>}
          </div>
          <div>
            <strong style={{ color: 'var(--s900)' }}>Relationship start:</strong><br/>
            {startDate ? new Date(startDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : <span style={{ color: 'var(--danger)' }}>Not set</span>}
          </div>
          <div>
            <strong style={{ color: 'var(--s900)' }}>Separation:</strong><br/>
            {sepDate ? new Date(sepDate).toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' }) : <span style={{ color: 'var(--danger)' }}>Not set</span>}
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <strong style={{ color: 'var(--s900)' }}>Children:</strong>{' '}
            {children.length} {children.length === 1 ? 'child' : 'children'}
            {hasChildren && <span style={{ color: 'var(--s600)' }}> — using with-child SSAG (incorporates child support, taxes, and benefits)</span>}
          </div>
        </div>

        {missingInputs.length > 0 && (
          <div style={{
            marginTop: '14px',
            background: '#FFF8E1', border: '1px solid #F0A500',
            borderRadius: 'var(--rs)', padding: '12px 16px',
            fontSize: '0.85rem', color: '#8A6A00',
          }}>
            <strong>Missing inputs for the SSAG calculation:</strong>
            <ul style={{ margin: '6px 0 0 18px', padding: 0 }}>
              {missingInputs.map((m, i) => (
                <li key={i}>
                  {m.what} —{' '}
                  <a
                    href="#"
                    onClick={(e) => { e.preventDefault(); goToTab(m.goTo) }}
                    style={{ color: 'var(--v)', fontWeight: 600 }}
                  >enter on the {m.tabLabel} tab →</a>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* SSAG RANGE RESULT */}
      <div style={{ ...cardStyle, background: 'var(--vx)', border: '1px solid var(--vc)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>SSAG Range</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Spousal Support Advisory Guidelines range. Choose the low / mid / high amount that fits your circumstances.
        </p>

        {!ssag && (
          <p style={{ color: 'var(--s400)', fontStyle: 'italic' }}>
            Complete the inputs above (incomes + dates) to see the SSAG range.
          </p>
        )}

        {ssag && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginBottom: '14px' }}>
              {['low', 'mid', 'high'].map((k) => (
                <button
                  key={k}
                  onClick={() => setAmount(ssag[k]?.monthly || 0)}
                  style={{
                    background: '#fff',
                    padding: '14px',
                    borderRadius: 'var(--rs)',
                    border: '1px solid var(--border)',
                    textAlign: 'center',
                    cursor: 'pointer',
                    transition: 'all 120ms',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.borderColor = 'var(--v)'; e.currentTarget.style.transform = 'translateY(-1px)' }}
                  onMouseLeave={(e) => { e.currentTarget.style.borderColor = 'var(--border)'; e.currentTarget.style.transform = 'translateY(0)' }}
                >
                  <div style={{ fontSize: '0.78rem', color: 'var(--s600)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 700 }}>{k}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--v)', marginTop: '4px' }}>
                    {fmtCAD(ssag[k]?.monthly || 0)} <span style={{ fontSize: '0.78rem', color: 'var(--s600)' }}>/mo</span>
                  </div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--s400)', marginTop: '4px' }}>Click to use</div>
                </button>
              ))}
            </div>

            <div style={{
              display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '8px',
              fontSize: '0.85rem', background: '#fff', padding: '12px 14px', borderRadius: 'var(--rs)',
            }}>
              <div><strong>Payor:</strong> {ssagPayorName}</div>
              <div><strong>Recipient:</strong> {ssagRecipientName}</div>
              <div><strong>Income gap:</strong> {fmtCAD(ssag.incomeDifference)}</div>
              <div><strong>Duration:</strong> {ssag.supportDurationRange?.low}–{ssag.supportDurationRange?.high} years
                {ruleOf65 && <span style={{ color: 'var(--success)', marginLeft: '6px', fontWeight: 600 }}>(Rule of 65 — indefinite)</span>}
              </div>
              {yearsRelationship != null && <div><strong>Years of relationship:</strong> {yearsRelationship}</div>}
            </div>

            <button
              onClick={() => setShowBreakdown(!showBreakdown)}
              className="btn btn-outline btn-sm"
              style={{ marginTop: '14px' }}
            >{showBreakdown ? '▼ Hide' : '▶ Show'} Detailed SSAG Breakdown</button>

            {showBreakdown && (
              <SSAGBreakdown
                ssag={ssag}
                payorName={ssagPayorName}
                recipientName={ssagRecipientName}
                hasChildren={hasChildren}
              />
            )}
          </>
        )}
      </div>

      {/* DECISION */}
      <div style={cardStyle}>
        <h4 style={sectionHeading}>Decision</h4>
        <p style={{ marginTop: 0, marginBottom: '14px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Who is paying, who is receiving, and how much?
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>
          <FormField
            label="Spousal Support Payor"
            type="select"
            options={[
              { value: 'none', label: 'No spousal support (mutual waiver)' },
              { value: 'party1', label: party1Name },
              { value: 'party2', label: party2Name },
            ]}
            value={sc.spousal_support_payor || ''}
            onSave={(v) => saveS({
              spousal_support_payor: v,
              ...(v === 'none' ? { spousal_support_amount: 0, spousal_support_template: 'complete_release' } : {}),
            })}
          />
          {!isWaived && sc.spousal_support_payor && (
            <FormField
              label="Monthly Amount"
              type="number" prefix="$"
              value={sc.spousal_support_amount ?? ''}
              onSave={(v) => saveS({ spousal_support_amount: Number(v) || 0 })}
              hint={ssag ? `SSAG mid is ${fmtCAD(ssag.mid?.monthly || 0)}/mo` : ''}
            />
          )}
        </div>
      </div>

      {/* TERM TEMPLATE */}
      {sc.spousal_support_payor && (
        <div style={cardStyle}>
          <h4 style={sectionHeading}>Term &amp; Duration</h4>
          <p style={{ marginTop: 0, marginBottom: '14px', color: 'var(--s600)', fontSize: '0.85rem' }}>
            Choose the structure of support: complete release, fixed term, time-limited, indefinite reviewable, or with life-insurance security.
          </p>

          <TemplateSelector
            templates={SPOUSAL_SUPPORT_TEMPLATES}
            value={{ template: sc.spousal_support_template, variables: sc.spousal_support_variables || {} }}
            onChange={({ template, variables }) => {
              const patch = {
                spousal_support_template: template,
                spousal_support_variables: variables,
              }
              if (SPOUSAL_SUPPORT_TEMPLATES[template]?.enforcesZeroAmount) {
                patch.spousal_support_amount = 0
              }
              saveS(patch)
            }}
            substitutionContext={{
              party1: party1Name,
              party2: party2Name,
              payorName: sc.spousal_support_payor === 'party1' ? party1Name : party2Name,
              recipientName: sc.spousal_support_payor === 'party1' ? party2Name : party1Name,
            }}
            variableLabels={{
              amount: 'Monthly Amount',
              start_date: 'Start Date',
              end_date: 'End Date',
              review_date: 'Review Date',
              term_months: 'Term (months)',
              review_frequency: 'Review Frequency',
              insurance_amount: 'Insurance Coverage Amount',
              policy_type: 'Policy Type (Term/Whole/etc.)',
            }}
            variableOptions={{
              review_frequency: [
                { value: 'annually', label: 'Annually' },
                { value: 'every 2 years', label: 'Every 2 years' },
                { value: 'every 3 years', label: 'Every 3 years' },
              ],
            }}
          />

          {sc.spousal_support_template === 'indefinite_reviewable' && (
            <div style={{ marginTop: '16px' }}>
              <h5 style={{ marginTop: 0, marginBottom: '8px', fontSize: '0.88rem' }}>Termination Triggers</h5>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '6px' }}>
                {Object.entries(SPOUSAL_TERMINATION_TRIGGERS).map(([k, label]) => {
                  const triggers = sc.spousal_support_termination_triggers || []
                  const checked = triggers.includes(k)
                  return (
                    <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', cursor: 'pointer' }}>
                      <input
                        type="checkbox"
                        checked={checked}
                        onChange={(e) => {
                          const newTriggers = e.target.checked
                            ? [...triggers, k]
                            : triggers.filter((t) => t !== k)
                          saveS({ spousal_support_termination_triggers: newTriggers })
                        }}
                      />
                      {label}
                    </label>
                  )
                })}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
