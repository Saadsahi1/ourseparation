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

  // Use cohabitation_date OR marriage_date as start of relationship
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
        taxYear: new Date(sepDate).getFullYear(),
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

  // Rule of 65 check
  const payorDob = payorIsA ? a.party1_dob : a.party2_dob
  const ruleOf65 = checkRuleOf65(payorDob, sepDate, startDate)

  const isWaived = sc.spousal_support_payor === 'none' || sc.spousal_support_template === 'complete_release'
  const enforcesZero = sc.spousal_support_template === 'complete_release'

  return (
    <div>
      {/* SSAG Range Display */}
      <div style={{ ...cardStyle, background: 'var(--vx)', border: '1px solid var(--vc)' }}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>SSAG Range</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Spousal Support Advisory Guidelines — calculated from incomes and relationship length.
          {hasChildren ? ' (with-child formula)' : ' (without-child formula)'}
        </p>

        {!ssag && (
          <p style={{ color: 'var(--s400)', fontStyle: 'italic' }}>
            Enter both incomes (Tab 5) and dates (Tab 1) to see the SSAG range.
          </p>
        )}

        {ssag && (
          <>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', marginBottom: '14px' }}>
              {['low', 'mid', 'high'].map((k) => (
                <div key={k} style={{
                  background: '#fff', padding: '14px', borderRadius: 'var(--rs)', border: '1px solid var(--border)',
                  textAlign: 'center',
                }}>
                  <div style={{ fontSize: '0.78rem', color: 'var(--s600)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: 600 }}>{k}</div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 700, color: 'var(--v)', marginTop: '4px' }}>
                    {fmtCAD(ssag[k]?.monthly || 0)} <span style={{ fontSize: '0.78rem', color: 'var(--s600)' }}>/mo</span>
                  </div>
                </div>
              ))}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', fontSize: '0.85rem' }}>
              <div><strong>Payor:</strong> {ssagPayorName}</div>
              <div><strong>Recipient:</strong> {ssagRecipientName}</div>
              <div><strong>Income difference:</strong> {fmtCAD(ssag.incomeDifference)}</div>
              <div><strong>Duration:</strong> {ssag.supportDurationRange?.low}–{ssag.supportDurationRange?.high} years
                {ruleOf65 && <span style={{ color: 'var(--success)', marginLeft: '6px' }}>(Rule of 65 — indefinite)</span>}
              </div>
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

      {/* Decision: Who Pays */}
      <div style={cardStyle}>
        <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Spousal Support Decision</h3>
        <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
          Who is paying, who is receiving, and how much?
        </p>

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
            label="Monthly Spousal Support Amount"
            type="number" prefix="$"
            value={sc.spousal_support_amount ?? (ssag?.mid?.monthly ?? '')}
            onSave={(v) => saveS({ spousal_support_amount: Number(v) || 0 })}
            hint={ssag ? `SSAG mid is ${fmtCAD(ssag.mid?.monthly || 0)}/mo` : ''}
          />
        )}
      </div>

      {/* Term Template */}
      {sc.spousal_support_payor && (
        <div style={cardStyle}>
          <h3 style={{ marginTop: 0, marginBottom: '4px' }}>Term &amp; Duration</h3>
          <p style={{ marginTop: 0, marginBottom: '16px', color: 'var(--s600)', fontSize: '0.85rem' }}>
            Choose the structure of support — fixed term, time-limited, indefinite reviewable, or with life-insurance security.
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
              <h4 style={{ marginTop: 0, marginBottom: '10px' }}>Termination Triggers</h4>
              {Object.entries(SPOUSAL_TERMINATION_TRIGGERS).map(([k, label]) => {
                const triggers = sc.spousal_support_termination_triggers || []
                const checked = triggers.includes(k)
                return (
                  <label key={k} style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px', fontSize: '0.88rem' }}>
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
          )}
        </div>
      )}
    </div>
  )
}
