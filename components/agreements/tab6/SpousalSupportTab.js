'use client'
import { useMemo, useState } from 'react'
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

export default function SpousalSupportTab({ bundle, save, party1Name, party2Name, user }) {
  const sc = bundle.supportCalculations || {}
  const a = bundle.agreement
  const children = bundle.children || []
  const hasChildren = children.length > 0
  const [showBreakdown, setShowBreakdown] = useState(false)

  const saveS = (patch) => save('support', patch)

  const p1Income = Number(sc.party1_income) || 0
  const p2Income = Number(sc.party2_income) || 0
  const startDate = a.cohabitation_date || a.marriage_date
  const sepDate = a.separation_date

  // Tax year: pulled from spousal_support_variables.tax_year if set,
  // otherwise defaults to the calendar year of the separation date.
  const defaultTaxYear = sepDate ? new Date(sepDate).getFullYear() : new Date().getFullYear()
  const storedTaxYear = sc.spousal_support_variables?.tax_year
  const taxYear = storedTaxYear ? Number(storedTaxYear) : defaultTaxYear

  // Build a year-picker option list spanning the supported range.
  const taxYearOptions = useMemo(() => {
    const years = []
    for (let y = new Date().getFullYear(); y >= 2017; y--) years.push({ value: y, label: String(y) })
    return years
  }, [])

  const setTaxYear = (y) => {
    const existing = sc.spousal_support_variables || {}
    saveS({ spousal_support_variables: { ...existing, tax_year: Number(y) || defaultTaxYear } })
  }

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
        taxYear,
      })
    } catch (e) {
      console.warn('SSAG with-child calc failed:', e.message)
      return null
    }
  }, [hasChildren, p1Income, p2Income, startDate, sepDate, children, taxYear])

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

  return (
    <div>
      {/* INPUTS — all on one page */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Spousal Support Calculator</h3>
        <p style={{ marginTop: 0, marginBottom: '20px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Calculated automatically using the Spousal Support Advisory Guidelines ({hasChildren ? 'with-child formula' : 'without-child formula'}). Edit incomes below or on the Child Support tab.
        </p>

        <h4 style={sectionHeading}>Inputs</h4>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '14px' }}>
          <FormField
            label={`${party1Name} — Annual Gross Income`}
            type="number" prefix="$"
            value={sc.party1_income ?? ''}
            onSave={(v) => saveS({ party1_income: Number(v) || 0 })}
            hint="Line 15000 from the most recent Notice of Assessment"
          />
          <FormField
            label={`${party2Name} — Annual Gross Income`}
            type="number" prefix="$"
            value={sc.party2_income ?? ''}
            onSave={(v) => saveS({ party2_income: Number(v) || 0 })}
            hint="Line 15000 from the most recent Notice of Assessment"
          />
        </div>

        {hasChildren && (
          <div style={{ marginTop: '14px' }}>
            <FormField
              label="Tax Year (for INDI / benefits)"
              type="select"
              value={taxYear}
              onSave={setTaxYear}
              options={taxYearOptions}
              hint={`Defaults to the year of separation (${defaultTaxYear}). Affects tax rates and CCB used in the with-child calculation.`}
            />
          </div>
        )}

        <div style={{
          background: 'var(--s50)', border: '1px solid var(--border)',
          borderRadius: 'var(--rs)', padding: '12px 16px',
          marginTop: '10px',
          fontSize: '0.85rem', color: 'var(--s700)',
          display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '10px',
        }}>
          <div><strong style={{ color: 'var(--s900)' }}>Relationship start:</strong><br/>{startDate ? new Date(startDate).toLocaleDateString('en-CA') : 'Not set — edit on Info tab'}</div>
          <div><strong style={{ color: 'var(--s900)' }}>Separation:</strong><br/>{sepDate ? new Date(sepDate).toLocaleDateString('en-CA') : 'Not set'}</div>
          <div><strong style={{ color: 'var(--s900)' }}>Children:</strong><br/>{children.length} {children.length === 1 ? 'child' : 'children'}{hasChildren ? ' (with-child SSAG)' : ' (without-child SSAG)'}</div>
        </div>

        {/* Per-child residence — only meaningful when there are children */}
        {hasChildren && (
          <div style={{ marginTop: '18px' }}>
            <h5 style={{ marginTop: 0, marginBottom: '8px', fontSize: '0.88rem', fontWeight: 600, color: 'var(--s900)' }}>
              Per-child residence (used by SSAG with-child formula)
            </h5>
            <p style={{ marginTop: 0, marginBottom: '10px', fontSize: '0.82rem', color: 'var(--s600)' }}>
              Saved here; also reflected on the Info tab. Affects the tax-credit allocation used in the calculation.
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {children.map((c) => (
                <div key={c.id} style={{
                  display: 'grid', gridTemplateColumns: '1fr 200px', gap: '12px', alignItems: 'center',
                  padding: '8px 12px', background: '#fff',
                  border: '1px solid var(--border)', borderRadius: 'var(--rs)',
                }}>
                  <div style={{ fontWeight: 500, fontSize: '0.9rem' }}>
                    {c.full_name || '(unnamed child)'}
                    {c.birth_date && (
                      <span style={{ color: 'var(--s600)', fontSize: '0.8rem', marginLeft: '8px' }}>
                        born {new Date(c.birth_date).toLocaleDateString('en-CA')}
                      </span>
                    )}
                  </div>
                  <FormField
                    type="select"
                    value={c.primary_residence || 'shared'}
                    options={[
                      { value: 'party1', label: `Lives with ${party1Name}` },
                      { value: 'party2', label: `Lives with ${party2Name}` },
                      { value: 'shared', label: 'Shared / 50-50' },
                    ]}
                    onSave={(v) => save('children', { primary_residence: v }, { method: 'PUT', pathSuffix: `/${c.id}` })}
                  />
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* SSAG RANGE RESULT */}
      <div style={{ ...cardStyle, background: 'var(--vx)', border: '1px solid var(--vc)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>SSAG Range</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Spousal Support Advisory Guidelines range. Choose the low/mid/high amount that fits your circumstances.
        </p>

        {!ssag && (
          <p style={{ color: 'var(--s400)', fontStyle: 'italic' }}>
            Enter both incomes above and ensure dates are set on the Info tab to see the SSAG range.
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
