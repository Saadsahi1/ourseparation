// Agreement utility functions

import { calculateTax as calculateTaxON } from '@/lib/calc/ontarioTax'
import { calculateWithChildSupport } from '@/lib/calc/ssagWith'

// Format currency
export const fmtCAD = (n) => {
  if (n == null || n === '' || isNaN(n)) return '$0.00'
  return `$${Math.round(n).toLocaleString('en-CA')}.00`
}

// Format date for legal documents
export const fmtLegalDate = (dateStr) => {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const day = date.getDate()
  const month = date.toLocaleString('en-CA', { month: 'long' })
  const year = date.getFullYear()
  const daySuffix = ['st', 'nd', 'rd'][([1, 2, 3].indexOf(day % 10))] || 'th'
  return `${day}${daySuffix} day of ${month}, ${year}`
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
