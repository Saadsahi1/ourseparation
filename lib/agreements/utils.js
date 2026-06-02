// Agreement utility functions

import { calculateTax as calculateTaxON } from '@/lib/calc/ontarioTax'
import { calculateWithChildSupport } from '@/lib/calc/ssagWith'

// Format currency
export const fmtCAD = (n) => {
  if (n == null || n === '' || isNaN(n)) return '$0.00'
  return `$${Math.round(n).toLocaleString('en-CA')}.00`
}

// Fallback for any template field that might be missing — keeps the literal
// string "undefined" / "null" out of the rendered document.
export const f = (val, fallback = '____________') => {
  if (val == null) return fallback
  const s = String(val).trim()
  if (s === '' || s === 'undefined' || s === 'null') return fallback
  return s
}

// Format date for legal documents. Returns the fallback if the input
// cannot be parsed — never prints "undefined".
export const fmtLegalDate = (dateStr, fallback = '____________') => {
  if (!dateStr) return fallback
  const date = new Date(dateStr)
  if (isNaN(date.getTime())) return fallback
  const day = date.getDate()
  const month = date.toLocaleString('en-CA', { month: 'long' })
  const year = date.getFullYear()
  // 11th, 12th, 13th are special; otherwise use ordinal of last digit.
  let daySuffix
  if (day >= 11 && day <= 13) {
    daySuffix = 'th'
  } else {
    daySuffix = ['st', 'nd', 'rd'][((day % 10) - 1)] || 'th'
  }
  return `${day}${daySuffix} day of ${month}, ${year}`
}

// Convert a person's name to Title Case ("aaron drury" -> "Aaron Drury",
// "MARY-JANE O'BRIEN" -> "Mary-Jane O'Brien"). Preserves apostrophes,
// hyphens, and Mc/Mac prefixes.
export const toTitleCase = (name) => {
  if (!name) return ''
  return String(name)
    .toLowerCase()
    .replace(/\b([a-z])/g, (m) => m.toUpperCase())
    .replace(/(^|\s|[-'])(mc)([a-z])/gi, (_, lead, mc, c) => `${lead}Mc${c.toUpperCase()}`)
    .replace(/(^|\s|[-'])(mac)([a-z])/gi, (_, lead, mac, c) => `${lead}Mac${c.toUpperCase()}`)
}

// Format date for input
export const fmtInputDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  return date.toISOString().split('T')[0]
}

// Validate interview data at each step
export const validateStep = (step, data) => {
  const errors = []

  if (step === 1) {
    // Party information
    if (!data.party1Name) errors.push('Party 1 name is required')
    if (!data.party1Dob) errors.push('Party 1 date of birth is required')
    if (!data.party2Name) errors.push('Party 2 name is required')
    if (!data.party2Dob) errors.push('Party 2 date of birth is required')
    if (!data.signingCity) errors.push('Signing city is required')
  }

  if (step === 2) {
    // Children
    if (data.agreementType !== 'prenup') {
      const children = data.children || []
      if (children.some(c => !c.name || !c.dateOfBirth)) {
        errors.push('All children must have name and date of birth')
      }
    }
  }

  if (step === 4) {
    // Child support
    if (data.agreementType !== 'prenup' && data.agreementType !== 'cohabitation') {
      if (!data.childSupportAmount) errors.push('Child support amount is required')
    }
  }

  return errors
}

// Calculate SSAG range for spousal support display
export const calculateSSAGRange = (incomeA, incomeB, durationYears, withChildren, childData = {}) => {
  if (!incomeA || !incomeB || !durationYears) return null

  try {
    const higher = Math.max(incomeA, incomeB)
    const lower = Math.min(incomeA, incomeB)
    const difference = higher - lower

    if (!withChildren) {
      // Without-children formula
      const low = (0.015 * durationYears * difference) / 12
      const mid = (0.0175 * durationYears * difference) / 12
      const high = (0.02 * durationYears * difference) / 12
      const durationLow = durationYears * 0.5
      const durationHigh = durationYears >= 20 ? 'Indefinite' : durationYears

      return { low, mid, high, durationLow, durationHigh }
    } else {
      // With-children - simplified (full SSAG would need NDI calculations)
      // Return basic range for user reference
      const estimatedLow = (0.015 * durationYears * difference) / 12
      const estimatedMid = (0.0175 * durationYears * difference) / 12
      const estimatedHigh = (0.02 * durationYears * difference) / 12

      return {
        low: estimatedLow,
        mid: estimatedMid,
        high: estimatedHigh,
        durationLow: durationYears * 0.5,
        durationHigh: 'Variable',
        note: 'With-child SSAG ranges vary. Consult a lawyer for precise calculation.'
      }
    }
  } catch (err) {
    console.error('Error calculating SSAG:', err)
    return null
  }
}

// Calculate Net Family Property
export const calculateNFP = (assetsAtSep = {}, debtsAtSep = {}, assetsAtMarriage = {}, debtsAtMarriage = {}, excluded = {}) => {
  const assetsTotalSep = Object.values(assetsAtSep).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
  const debtsTotalSep = Object.values(debtsAtSep).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
  const assetsTotalMarriage = Object.values(assetsAtMarriage).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
  const debtsTotalMarriage = Object.values(debtsAtMarriage).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)
  const excludedTotal = Object.values(excluded).reduce((sum, v) => sum + (parseFloat(v) || 0), 0)

  const nfpSep = assetsTotalSep - debtsTotalSep
  const nfpMarriage = assetsTotalMarriage - debtsTotalMarriage

  return Math.max(0, nfpSep - nfpMarriage - excludedTotal)
}

// Calculate equalization
export const calculateEqualization = (nfpParty1, nfpParty2) => {
  const higher = Math.max(nfpParty1, nfpParty2)
  const lower = Math.min(nfpParty1, nfpParty2)
  const equalization = (higher - lower) / 2

  return {
    equalization,
    payorHigher: nfpParty1 > nfpParty2,
    party1NFP: nfpParty1,
    party2NFP: nfpParty2
  }
}

// Calculate child age
export const getChildAge = (dateOfBirthStr) => {
  if (!dateOfBirthStr) return 0
  const dob = new Date(dateOfBirthStr)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}

// Get parenting schedule description
export const getScheduleDescription = (scheduleType, customSchedule = {}) => {
  const descriptions = {
    'primary': 'Primary care with reasonable access',
    'weekend': 'Every other weekend (Friday 6pm - Sunday 6pm) plus one weeknight',
    'week_on_off': 'Week on, week off exchange',
    '2_2_3': '2-2-3 rotating schedule',
    '5_2_2_5': '5-2-2-5 rotating schedule',
    'custom': 'Custom 4-week schedule as detailed'
  }
  return descriptions[scheduleType] || 'Not specified'
}

// Generate parenting calendar grid
export const generateParentingCalendar = (schedule) => {
  // Simple 4-week calendar representation
  const weeks = [
    Array(7).fill(0),
    Array(7).fill(0),
    Array(7).fill(0),
    Array(7).fill(0)
  ]
  return weeks
}

// Helper to capitalize first letter
export const capitalize = (str) => str ? str.charAt(0).toUpperCase() + str.slice(1) : ''

// Generate HTML for NFP schedule
export const generateNFPSchedule = (party1Name, nfp1, party2Name, nfp2, assetsCat = [], debtsCat = []) => {
  return `
    <h3>Net Family Property Calculation — Party 1 (${party1Name})</h3>
    <table style="width:100%; border-collapse:collapse; margin-bottom:24px;">
      <tr style="background:#f5f5f5;">
        <th style="padding:8px; text-align:left; border:1px solid #ddd;">Asset/Debt</th>
        <th style="padding:8px; text-align:right; border:1px solid #ddd;">Value at Separation</th>
        <th style="padding:8px; text-align:right; border:1px solid #ddd;">Value at Marriage</th>
      </tr>
      ${assetsCat.map(a => `
        <tr style="border:1px solid #ddd;">
          <td style="padding:8px;">${a.description || 'Asset'}</td>
          <td style="padding:8px; text-align:right;">$${(a.valueSep || 0).toLocaleString()}</td>
          <td style="padding:8px; text-align:right;">$${(a.valueMarriage || 0).toLocaleString()}</td>
        </tr>
      `).join('')}
      ${debtsCat.map(d => `
        <tr style="border:1px solid #ddd;">
          <td style="padding:8px;">${d.description || 'Debt'} (−)</td>
          <td style="padding:8px; text-align:right;">$${(d.valueSep || 0).toLocaleString()}</td>
          <td style="padding:8px; text-align:right;">$${(d.valueMarriage || 0).toLocaleString()}</td>
        </tr>
      `).join('')}
    </table>
    <p><strong>Party 1 Net Family Property: ${fmtCAD(nfp1)}</strong></p>

    <h3>Net Family Property Calculation — Party 2 (${party2Name})</h3>
    <p><strong>Party 2 Net Family Property: ${fmtCAD(nfp2)}</strong></p>
  `
}

// Format legal names and titles
export const getPartyTitle = (name) => name ? `"${name}"` : '"Party"'

// Validate child support calculation
export const validateChildSupport = (section, income1, income2, numChildren) => {
  if (!income1 || !income2 || !numChildren) return { valid: false, error: 'Missing income or child count' }
  if (numChildren < 1 || numChildren > 10) return { valid: false, error: 'Invalid number of children (1-10)' }
  return { valid: true }
}

// Holiday enum
export const HOLIDAYS = [
  'New Year\'s Day',
  'Family Day',
  'Good Friday',
  'Easter Sunday',
  'Easter Monday',
  'Victoria Day',
  'Canada Day',
  'Civic Holiday',
  'Labour Day',
  'Thanksgiving',
  'Halloween',
  'Remembrance Day',
  'Christmas Eve',
  'Christmas Day',
  'Boxing Day',
  'New Year\'s Eve',
  'Mother\'s Day',
  'Father\'s Day',
  'Children\'s Birthdays',
  'Parent Birthdays',
  'March Break',
  'Summer Vacation'
]

// Termination triggers
export const TERMINATION_TRIGGERS = [
  'Cohabitation by recipient for 90+ consecutive days',
  'Remarriage of recipient',
  'Death of either party',
  'Specific date',
  'Material change in circumstances',
  'Youngest child finishing high school'
]

// =============================================================================
// 9-Tab Editor helpers
// =============================================================================

// Resolve display name for a party position from an agreement record + user record.
// agreement: the agreements row. user: the logged-in user (used for party1 first/last name).
// Names are always returned in Title Case so input casing ("aaron drury",
// "AARON DRURY", etc.) doesn't leak into the legal document.
export const getPartyDisplayName = (agreement, position, user) => {
  let raw
  if (position === 'party1') {
    if (user && (user.first_name || user.last_name)) {
      raw = [user.first_name, user.last_name].filter(Boolean).join(' ')
    }
    if (!raw) raw = 'Party 1'
  } else {
    raw = agreement?.party2_name || 'Party 2'
  }
  return toTitleCase(raw)
}

// Resolve who is the "mother" / "father" based on parental_title fields.
// Returns { motherName, fatherName, motherParty, fatherParty } — falls back to
// party1/party2 labels when neither party has explicitly set the title.
export const resolveParentalNames = (agreement, user) => {
  const party1Name = getPartyDisplayName(agreement, 'party1', user)
  const party2Name = getPartyDisplayName(agreement, 'party2', user)

  const result = { motherName: null, fatherName: null, motherParty: null, fatherParty: null }

  if (agreement?.party1_parental_title === 'mother') {
    result.motherName = party1Name
    result.motherParty = 'party1'
  } else if (agreement?.party2_parental_title === 'mother') {
    result.motherName = party2Name
    result.motherParty = 'party2'
  }

  if (agreement?.party1_parental_title === 'father') {
    result.fatherName = party1Name
    result.fatherParty = 'party1'
  } else if (agreement?.party2_parental_title === 'father') {
    result.fatherName = party2Name
    result.fatherParty = 'party2'
  }

  // Fallback labels when titles not set
  result.motherName = result.motherName || 'The Mother'
  result.fatherName = result.fatherName || 'The Father'

  return result
}

// Substitute template variables. Use to fill {{varName}} placeholders in clauses.
export const substituteTemplateVars = (template, vars = {}) => {
  if (typeof template === 'function') {
    return template(vars)
  }
  if (typeof template !== 'string') return ''
  return template.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `[${key}]`)
}

// Section completion calculator — given an agreement bundle, compute the
// section_completion JSONB shape from the live data.
export const computeSectionCompletion = (bundle) => {
  const c = {}
  const a = bundle?.agreement || {}
  c.info = Boolean(a.separation_date)

  const pTerms = bundle?.parentingTerms || {}
  const pSched = bundle?.parentingSchedule || {}
  const holidays = bundle?.holidays || []
  const clauses = bundle?.specialClauses || []
  c.parenting = {
    decision: Boolean(pTerms.legal_custody_type),
    schedule: Boolean(pSched.regular_schedule_template),
    holiday: holidays.length >= 5,
    special: clauses.length > 0,
  }

  const propItems = bundle?.propertyItems || []
  const propDiv = bundle?.propertyDivisionTerms || null
  c.property = {
    assets: propItems.length > 0,
    division: Boolean(propDiv),
  }

  const docs = bundle?.incomeDocuments || []
  c.income = docs.some((d) => d.document_type === 'tax_return')

  const sc = bundle?.supportCalculations || {}
  const s7 = bundle?.section7Expenses || []
  c.child_support = {
    monthly: sc.child_support_amount != null || sc.child_support_payor === 'none',
    section7: s7.length > 0,
    retroactive: a.retroactive_support_waived || (bundle?.retroactivePeriods || []).length > 0,
  }

  c.spousal_support = Boolean(sc.spousal_support_payor)

  const addl = bundle?.additionalTerms || {}
  c.additional = Boolean(
    addl.insurance_template || addl.disclosure_template ||
    addl.tax_template || addl.dispute_template
  )

  return c
}

// Section 7 income-proportional split
export const calculateSection7Split = (party1Income, party2Income) => {
  const p1 = Number(party1Income) || 0
  const p2 = Number(party2Income) || 0
  const total = p1 + p2
  if (total === 0) return { party1Percent: 50, party2Percent: 50 }
  return {
    party1Percent: Math.round((p1 / total) * 1000) / 10,
    party2Percent: Math.round((p2 / total) * 1000) / 10,
  }
}

// Rule of 65: indefinite spousal support
export const checkRuleOf65 = (payorDob, separationDate, marriageDate) => {
  if (!payorDob || !separationDate || !marriageDate) return false
  const dob = new Date(payorDob)
  const sep = new Date(separationDate)
  const mar = new Date(marriageDate)
  const age = (sep - dob) / (365.25 * 24 * 60 * 60 * 1000)
  const years = (sep - mar) / (365.25 * 24 * 60 * 60 * 1000)
  return age + years >= 65
}

// Retroactive period total
export const calculateRetroactivePeriodTotal = (period) => {
  const months = Number(period.months_in_period) || 12
  const monthly = Number(period.monthly_support_amount) || 0
  return Math.round(months * monthly * 100) / 100
}

// Aggregate per-party totals from retroactive periods (signed by direction)
export const aggregateRetroactiveTotals = (periods = []) => {
  let owedByParty1 = 0
  let owedByParty2 = 0
  for (const p of periods) {
    const total = calculateRetroactivePeriodTotal(p)
    if (p.child_support_payor === 'party1') owedByParty1 += total
    else if (p.child_support_payor === 'party2') owedByParty2 += total
  }
  const netDirection = owedByParty1 > owedByParty2 ? 'party1_owes_party2' : 'party2_owes_party1'
  const netAmount = Math.abs(owedByParty1 - owedByParty2)
  return { owedByParty1, owedByParty2, netDirection, netAmount }
}

// NFP from raw property_items rows (new schema)
export const calculateNFPFromItems = (items = [], party) => {
  const owned = items.filter((i) => i.owner === party)
  let assetsSep = 0, debtsSep = 0, assetsMar = 0, debtsMar = 0, excluded = 0
  for (const i of owned) {
    const vSep = parseFloat(i.value_at_separation) || 0
    const vMar = parseFloat(i.value_at_marriage) || 0
    if (i.item_type === 'asset') {
      assetsSep += vSep
      // Matrimonial home is excluded from marriage-date side per FLA s.4(1)(b)
      if (!i.is_matrimonial_home) assetsMar += vMar
    } else if (i.item_type === 'debt') {
      debtsSep += vSep
      debtsMar += vMar
    }
    if (i.is_excluded) excluded += parseFloat(i.excluded_amount) || 0
  }
  const nfp = Math.max(0, (assetsSep - debtsSep) - (assetsMar - debtsMar) - excluded)
  return { nfp, assetsSep, debtsSep, assetsMar, debtsMar, excluded }
}

// Compute equalization from itemized property
export const equalizationFromItems = (items = []) => {
  const p1 = calculateNFPFromItems(items, 'party1')
  const p2 = calculateNFPFromItems(items, 'party2')
  const higher = Math.max(p1.nfp, p2.nfp)
  const lower = Math.min(p1.nfp, p2.nfp)
  const amount = (higher - lower) / 2
  const payor = p1.nfp > p2.nfp ? 'party1' : (p2.nfp > p1.nfp ? 'party2' : null)
  return { party1: p1, party2: p2, amount, payor }
}
