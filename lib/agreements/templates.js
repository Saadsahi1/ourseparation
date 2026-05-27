// Section-by-section legal HTML generator for the 9-tab agreement editor.
// Generates a "Our Separation"-branded document with lilac styling and
// hierarchical numbered headings (1, 1.1, 1.1.1, etc.) for easy cross-reference.

import { fmtLegalDate, fmtCAD, getPartyDisplayName, resolveParentalNames, equalizationFromItems, calculateNFPFromItems, aggregateRetroactiveTotals, getChildAge } from './utils'
import { LOGO_GLYPH_DATA_URL } from './logoDataUrl'
import {
  AGREEMENT_TYPE_LABELS,
  PARENTING_SCHEDULE_TEMPLATES,
  SUMMER_SCHEDULE_TEMPLATES,
  TRANSPORTATION_TEMPLATES,
  HOLIDAY_ARRANGEMENT_TEMPLATES,
  SPECIAL_CLAUSE_TEMPLATES,
  COMMUNICATION_TEMPLATES,
  SPOUSAL_SUPPORT_TEMPLATES,
  SPOUSAL_TERMINATION_TRIGGERS,
  MATRIMONIAL_HOME_TEMPLATES,
  PENSION_DIVISION_TEMPLATES,
  EQUALIZATION_PAYMENT_TEMPLATES,
  LIFE_INSURANCE_TEMPLATES,
  DISCLOSURE_TEMPLATES,
  TAX_PROVISION_TEMPLATES,
  DISPUTE_RESOLUTION_TEMPLATES,
} from './templateLibrary'

// =============================================================================
// THEME — lilac/purple matching the site's --v variable (#5B4FE8)
// =============================================================================

const LILAC = '#5B4FE8'
const LILAC_DARK = '#3D34C8'
const LILAC_LIGHT = '#EEF0FF'
const TEXT = '#1A1A2E'
const TEXT_MUTED = '#5C5C7A'
const BORDER = '#E8E8F2'

// =============================================================================
// CSS for preview + PDF
// =============================================================================

const BASE_CSS = `
  * { box-sizing: border-box; }
  body {
    font-family: -apple-system, 'Inter', 'Helvetica Neue', Helvetica, Arial, sans-serif;
    line-height: 1.65;
    color: ${TEXT};
    margin: 0;
    padding: 0;
    background: #fff;
  }
  .doc {
    max-width: 8.5in;
    margin: 0 auto;
    padding: 0.75in;
    background: #fff;
  }

  /* Brand header */
  .brand {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10pt;
    margin-bottom: 22pt;
  }
  .brand-logo {
    width: 28pt; height: 28pt; border-radius: 6pt;
    background: ${LILAC};
    display: inline-flex; align-items: center; justify-content: center;
    box-shadow: 0 2pt 6pt rgba(91, 79, 232, 0.25);
    overflow: hidden;
  }
  .brand-logo img {
    width: 80%; height: 80%; object-fit: contain;
  }
  .brand-name {
    font-size: 17pt;
    font-weight: 700;
    color: ${TEXT};
    letter-spacing: -0.01em;
  }
  .brand-name span { color: ${LILAC}; }

  /* Document title block */
  .title {
    font-size: 17pt;
    font-weight: 700;
    color: ${LILAC};
    text-align: center;
    margin: 0 0 6pt;
    letter-spacing: 0.01em;
    line-height: 1.25;
  }
  .subtitle {
    text-align: center;
    color: ${TEXT_MUTED};
    font-size: 11pt;
    margin: 0 0 18pt;
  }
  .between-label {
    text-align: center;
    font-weight: 700;
    font-size: 11pt;
    margin: 16pt 0 6pt;
    color: ${TEXT};
    letter-spacing: 0.04em;
  }
  .party-name {
    text-align: center;
    font-size: 16pt;
    font-weight: 700;
    color: ${TEXT};
    margin: 4pt 0 2pt;
  }
  .party-alias {
    text-align: center;
    font-size: 10pt;
    color: ${TEXT_MUTED};
    margin: 0 0 10pt;
  }
  .and-divider {
    text-align: center;
    font-weight: 700;
    font-size: 11pt;
    margin: 12pt 0;
    color: ${TEXT};
    letter-spacing: 0.05em;
  }

  /* Section headings */
  h1.section {
    font-size: 13pt;
    color: ${LILAC};
    text-transform: uppercase;
    letter-spacing: 0.04em;
    margin: 22pt 0 4pt;
    padding-bottom: 6pt;
    border-bottom: 1pt solid ${BORDER};
    font-weight: 700;
  }
  h2.subsection {
    font-size: 11pt;
    font-weight: 600;
    color: ${TEXT};
    margin: 14pt 0 4pt;
  }
  h3.subsubsection {
    font-size: 10.5pt;
    font-weight: 600;
    color: ${TEXT};
    margin: 10pt 0 4pt;
    font-style: italic;
  }

  /* Body text */
  p { margin: 6pt 0; font-size: 10.5pt; text-align: justify; }
  p.clause { margin: 6pt 0; padding-left: 24pt; text-indent: -24pt; }
  p.clause .num {
    display: inline-block;
    min-width: 22pt;
    font-weight: 600;
    color: ${LILAC};
  }
  .indent { padding-left: 28pt; margin: 4pt 0; }
  .indent-2 { padding-left: 52pt; margin: 4pt 0; }
  ul.legal {
    list-style-type: none;
    padding-left: 24pt;
    margin: 6pt 0;
  }
  ul.legal > li {
    margin: 4pt 0;
    position: relative;
    padding-left: 24pt;
    font-size: 10.5pt;
  }
  ul.legal > li > .sub-num {
    position: absolute;
    left: 0; top: 0;
    color: ${TEXT};
    font-weight: 500;
  }

  /* Tables */
  table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 9.5pt; }
  th, td { border: 1pt solid ${BORDER}; padding: 7pt 9pt; text-align: left; vertical-align: top; }
  th { background: ${LILAC_LIGHT}; font-weight: 600; color: ${TEXT}; }
  td.right, th.right { text-align: right; }
  .total-row td { background: ${LILAC_LIGHT}; font-weight: 700; }

  /* Notice / callout */
  .notice {
    background: ${LILAC_LIGHT};
    border-left: 4pt solid ${LILAC};
    padding: 10pt 14pt;
    margin: 14pt 0;
    font-size: 9.5pt;
    color: ${TEXT};
    border-radius: 0 4pt 4pt 0;
  }
  .notice strong { color: ${LILAC_DARK}; }

  /* Signature block */
  .sig-grid {
    margin-top: 24pt;
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 24pt;
  }
  .sig-cell { vertical-align: bottom; }
  .sig-line { border-bottom: 1pt solid ${TEXT}; height: 36pt; }
  .sig-name { font-weight: 700; margin-top: 4pt; }
  .sig-meta { font-size: 8.5pt; color: ${TEXT_MUTED}; margin-top: 4pt; }

  /* Calendar grid */
  .calendar { width: 100%; border-collapse: collapse; font-size: 9pt; margin: 6pt 0; }
  .calendar th { background: ${LILAC_LIGHT}; font-weight: 600; text-align: center; padding: 5pt; }
  .calendar td { text-align: center; padding: 9pt 5pt; font-weight: 600; }
  .calendar .p1 { background: ${LILAC}; color: #fff; }
  .calendar .p2 { background: #fff; color: ${TEXT}; }
  .calendar .t {
    background-image: repeating-linear-gradient(45deg, ${LILAC} 0, ${LILAC} 6pt, #fff 6pt, #fff 12pt);
    color: ${TEXT};
  }

  /* Schedule break */
  .schedule { page-break-before: always; }

  /* Footer */
  .footer {
    font-size: 8.5pt;
    text-align: center;
    color: ${TEXT_MUTED};
    border-top: 1pt solid ${BORDER};
    padding-top: 6pt;
    margin-top: 24pt;
  }

  @media print {
    body { padding: 0; background: white; }
    .doc { margin: 0; padding: 0.6in; box-shadow: none; }
  }
`

const baseDocument = (title, bodyHtml, footerText) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${title}</title><style>${BASE_CSS}</style></head>
<body><div class="doc">${bodyHtml}<div class="footer">${footerText || ''}</div></div></body>
</html>
`

// =============================================================================
// Helpers
// =============================================================================

export function getNamesForBundle(bundle) {
  const a = bundle.agreement
  const owner = bundle.owner || null
  const party1Full = getPartyDisplayName(a, 'party1', owner)
  const party2Full = getPartyDisplayName(a, 'party2', null)
  // First-name aliases
  const party1Alias = (party1Full || '').split(' ')[0] || 'Party 1'
  const party2Alias = (party2Full || '').split(' ')[0] || 'Party 2'
  const { motherName, fatherName, motherParty, fatherParty } = resolveParentalNames(a, owner)
  return {
    party1: party1Alias, party2: party2Alias,
    party1Full, party2Full,
    motherName, fatherName, motherParty, fatherParty,
    owner,
  }
}

// Render a numbered clause: <p class="clause"><span class="num">1.1</span> text...</p>
function clause(num, text) {
  return `<p class="clause"><span class="num">${num}</span>${text}</p>`
}

// Render a section heading
function section(num, title) {
  return `<h1 class="section">${num}. ${title}</h1>`
}

// Render a subsection heading (no body text, just heading)
function subsection(num, title) {
  return `<h2 class="subsection">${num} ${title}</h2>`
}

// =============================================================================
// HEADER — brand logo, title, between block
// =============================================================================

function renderHeader(bundle) {
  const a = bundle.agreement
  const { party1, party2, party1Full, party2Full } = getNamesForBundle(bundle)
  const type = a.agreement_type || 'separation'
  const typeText = (AGREEMENT_TYPE_LABELS[type] || 'SEPARATION AGREEMENT').replace(/\s+/g, ' ')
  const dateText = a.separation_date
    ? fmtLegalDate(a.separation_date)
    : fmtLegalDate(new Date().toISOString().split('T')[0])

  return `
    <div class="brand">
      <span class="brand-logo"><img src="${LOGO_GLYPH_DATA_URL}" alt="OurSeparation"/></span>
      <span class="brand-name">Our<span>Separation</span></span>
    </div>

    <h1 class="title">THIS IS A ${typeText} DATED ${dateText}</h1>
    <p class="subtitle">Province of Ontario</p>

    <p class="between-label">BETWEEN:</p>
    <p class="party-name">${party1Full}</p>
    <p class="party-alias">(hereinafter referred to as "${party1}")</p>
    <p class="and-divider">AND</p>
    <p class="party-name">${party2Full}</p>
    <p class="party-alias">(hereinafter referred to as "${party2}")</p>
  `
}

// =============================================================================
// SECTION 1 — BACKGROUND
// =============================================================================

function renderBackground(bundle) {
  const a = bundle.agreement
  const { party1, party2, party1Full, party2Full } = getNamesForBundle(bundle)
  const children = bundle.children || []
  const type = a.agreement_type

  // 1.1 — Identity + relationship history
  const age1 = a.party1_dob ? getChildAge(a.party1_dob) : null
  const age2 = a.party2_dob ? getChildAge(a.party2_dob) : null
  let identity = `${party1Full}`
  if (age1 != null) identity += `, age ${age1}, born ${fmtLegalDate(a.party1_dob)}`
  identity += `, and ${party2Full}`
  if (age2 != null) identity += `, age ${age2}, born ${fmtLegalDate(a.party2_dob)}`
  if (type === 'separation' || type === 'amendment' || type === 'postnup') {
    if (a.marriage_date) {
      identity += `, were married on ${fmtLegalDate(a.marriage_date)}`
      if (a.marriage_location) identity += ` in ${a.marriage_location}`
    } else if (a.cohabitation_date) {
      identity += `, cohabited beginning on ${fmtLegalDate(a.cohabitation_date)}`
    }
    if (a.separation_date && (type === 'separation' || type === 'amendment')) {
      identity += `, and separated on ${fmtLegalDate(a.separation_date)}`
    }
  } else if (type === 'cohabitation') {
    identity += `, began cohabiting on ${fmtLegalDate(a.cohabitation_date)}`
  } else if (type === 'prenup') {
    identity += `, intend to marry`
  }
  identity += '.'

  // 1.2 — Children
  let childrenBlock = ''
  if (children.length > 0) {
    const childWord = children.length === 1 ? 'child' : 'children'
    childrenBlock += clause('1.2', `There ${children.length === 1 ? 'is' : 'are'} ${children.length} ${childWord} of the ${type === 'cohabitation' || type === 'prenup' ? 'relationship' : 'marriage'}:`)
    const items = children.map((c, i) => {
      const age = c.birth_date ? getChildAge(c.birth_date) : null
      return `<div class="indent">${String.fromCharCode(97 + i)}) ${c.full_name}${age != null ? `, age ${age}` : ''}${c.birth_date ? `, born ${fmtLegalDate(c.birth_date)}` : ''}</div>`
    }).join('')
    childrenBlock += items
  } else {
    childrenBlock += clause('1.2', `The parties have no children of the ${type === 'cohabitation' || type === 'prenup' ? 'relationship' : 'marriage'}.`)
  }

  // 1.3 — Education / employment
  let employmentBlock = ''
  if (a.party1_occupation || a.party2_occupation) {
    employmentBlock += clause('1.3', `The parties' education/employment information is as follows:`)
    if (a.party1_occupation) employmentBlock += `<div class="indent">${party1} is ${a.party1_occupation}.</div>`
    if (a.party2_occupation) employmentBlock += `<div class="indent">${party2} is ${a.party2_occupation}.</div>`
  }

  // 1.4 — Intent
  let intentBlock = ''
  const intents = []
  if (children.length > 0) {
    intents.push(`a settlement of decision-making responsibility, parenting time, contact, and support with respect to the children, subject to a material change in circumstances and the terms of this Agreement;`)
  }
  if (type === 'separation' || type === 'postnup') {
    intents.push(`a final settlement of spousal support, including any claim for compensatory or contractual support;`)
    intents.push(`a final settlement of:`)
  }
  if (intents.length > 0) {
    const intentNum = a.party1_occupation || a.party2_occupation ? '1.4' : '1.3'
    intentBlock += clause(intentNum, `${party1} and ${party2} each intend this Agreement to be:`)
    intents.forEach((it) => { intentBlock += `<div class="indent">${it}</div>` })
    if (type === 'separation' || type === 'postnup') {
      intentBlock += `<div class="indent-2">their respective rights in or to the property (which includes all assets and debts) of the other and the property held by them jointly;</div>`
    }
  }

  // Acknowledgments — last numbered clause
  const ackNum = intentBlock ? (a.party1_occupation || a.party2_occupation ? '1.5' : '1.4')
    : (a.party1_occupation || a.party2_occupation ? '1.4' : '1.3')
  const acknowledgments = `
    ${clause(ackNum, `Each party acknowledges:`)}
    <ul class="legal">
      <li><span class="sub-num">a)</span> they have provided full and honest financial disclosure to the other;</li>
      <li><span class="sub-num">b)</span> they have had the opportunity to obtain independent legal advice from a lawyer of their own choosing;</li>
      <li><span class="sub-num">c)</span> they enter into this Agreement voluntarily, free from pressure, duress, or undue influence;</li>
      <li><span class="sub-num">d)</span> they understand the nature and consequences of the Agreement.</li>
    </ul>
  `

  return `
    ${section(1, 'Background')}
    ${clause('1.1', identity)}
    ${childrenBlock}
    ${employmentBlock}
    ${intentBlock}
    ${acknowledgments}
  `
}

// =============================================================================
// SECTION 2 — DEFINITIONS AND INTERPRETATION
// =============================================================================

function renderDefinitions(bundle) {
  const a = bundle.agreement
  const children = bundle.children || []
  const hasHome = (bundle.propertyItems || []).some((p) => p.is_matrimonial_home)
  const items = []
  if (children.length > 0) {
    items.push(`<strong>"children"</strong> means ${children.map((c) => c.full_name).join(', ')};`)
  }
  if (a.separation_date) {
    items.push(`<strong>"date of separation"</strong> means ${fmtLegalDate(a.separation_date)};`)
  }
  if (hasHome) {
    items.push(`<strong>"matrimonial home"</strong> means the residence so identified in this Agreement and in Schedule A;`)
  }
  items.push(`<strong>"Table"</strong> means the Federal Child Support Guidelines, Schedule I, in force at the time of any required calculation;`)
  items.push(`<strong>"Section 7 expenses"</strong> means special and extraordinary expenses for the children as defined in section 7 of the Federal Child Support Guidelines.`)

  let body = clause('2.1', 'In this Agreement:')
  body += '<ul class="legal">'
  items.forEach((it, i) => {
    body += `<li><span class="sub-num">${String.fromCharCode(97 + i)})</span> ${it}</li>`
  })
  body += '</ul>'
  body += clause('2.2', 'References to "Party 1" and "Party 2" include their respective legal representatives, estates, successors, and assigns.')
  body += clause('2.3', 'Headings in this Agreement are for convenience only and shall not affect the interpretation of any provision.')

  return `
    ${section(2, 'Definitions and Interpretation')}
    ${body}
  `
}

// =============================================================================
// SECTION 3 — PARENTING ARRANGEMENTS
// =============================================================================

function renderParenting(bundle) {
  const children = bundle.children || []
  if (children.length === 0) return ''

  const { party1, party2, party1Full, party2Full, motherName, fatherName } = getNamesForBundle(bundle)
  const terms = bundle.parentingTerms || {}
  const sched = bundle.parentingSchedule || null
  const holidays = bundle.holidays || []
  const clauses = bundle.specialClauses || []

  let body = ''

  // 3.1 — Best interests
  body += subsection('3.1', 'Best Interests of the Children')
  body += clause('3.1.1', `The parties acknowledge that the best interests of the children shall be the primary consideration in all decisions affecting them. Each party shall foster a positive and supportive relationship between the children and the other party.`)

  // 3.2 — Decision-making
  body += subsection('3.2', 'Decision-Making Responsibility')
  if (terms.legal_custody_type === 'sole_party1') {
    body += clause('3.2.1', `${party1Full} shall have <strong>sole decision-making responsibility</strong> for the children, including all major decisions regarding their education, health care, religion, and extracurricular activities.`)
    body += clause('3.2.2', `${party2Full} shall be kept reasonably informed of all major decisions affecting the children.`)
  } else if (terms.legal_custody_type === 'sole_party2') {
    body += clause('3.2.1', `${party2Full} shall have <strong>sole decision-making responsibility</strong> for the children, including all major decisions regarding their education, health care, religion, and extracurricular activities.`)
    body += clause('3.2.2', `${party1Full} shall be kept reasonably informed of all major decisions affecting the children.`)
  } else {
    body += clause('3.2.1', `The parties shall have <strong>joint decision-making responsibility</strong> for the children. Major decisions shall be made together as follows:`)
    const domains = [
      ['Education', terms.decision_making_education || 'joint'],
      ['Health Care', terms.decision_making_health || 'joint'],
      ['Religion', terms.decision_making_religion || 'joint'],
      ['Extracurricular Activities', terms.decision_making_extracurricular || 'joint'],
    ]
    domains.forEach(([label, val], i) => {
      const text =
        val === 'joint' ? 'jointly by both parties' :
        val === 'consult' ? 'by the primary parent after meaningful consultation with the other' :
        val === 'party1' ? `solely by ${party1Full}` :
        val === 'party2' ? `solely by ${party2Full}` : 'jointly by both parties'
      body += clause(`3.2.${i + 2}`, `<strong>${label}:</strong> ${text}.`)
    })
  }

  // 3.3 — Regular parenting time / schedule
  if (sched?.regular_schedule_template) {
    body += subsection('3.3', 'Parenting Time — Regular Schedule')
    const tpl = PARENTING_SCHEDULE_TEMPLATES[sched.regular_schedule_template]
    if (tpl) {
      const vars = sched.regular_schedule_variables || {}
      const primaryParentName = vars.primaryParent === 'party2' ? party2Full : party1Full
      const otherParentName = vars.primaryParent === 'party2' ? party1Full : party2Full
      body += clause('3.3.1', tpl.template({
        ...vars,
        primaryParentName, otherParentName,
        party1: party1Full, party2: party2Full,
      }))
      if (sched.regular_schedule_template === 'custom_weekly') {
        body += clause('3.3.2', `The detailed 4-week rotating schedule is set out in Schedule B.`)
      }
    }
  }

  // 3.4 — Summer
  if (sched?.summer_schedule_template) {
    body += subsection('3.4', 'Summer Vacation')
    const tpl = SUMMER_SCHEDULE_TEMPLATES[sched.summer_schedule_template]
    if (tpl) {
      body += clause('3.4.1', tpl.template({ ...(sched.summer_schedule_variables || {}), party1: party1Full, party2: party2Full }))
    }
  }

  // 3.5 — Holidays
  if (holidays.length > 0) {
    body += subsection('3.5', 'Holiday and Special Occasion Schedule')
    holidays.forEach((h, i) => {
      const fn = HOLIDAY_ARRANGEMENT_TEMPLATES[h.arrangement]
      if (!fn) return
      const txt = fn({ holidayName: h.holiday_name, motherName, fatherName, party1: party1Full, party2: party2Full })
      body += clause(`3.5.${i + 1}`, txt)
    })
  }

  // 3.6 — Transportation
  if (sched?.transportation_template) {
    body += subsection('3.6', 'Transportation')
    const tpl = TRANSPORTATION_TEMPLATES[sched.transportation_template]
    if (tpl) {
      body += clause('3.6.1', tpl.template({ ...(sched.transportation_variables || {}), party1: party1Full, party2: party2Full }))
    }
  }

  // 3.7 — Communication
  if (terms.communication_template) {
    body += subsection('3.7', 'Communication')
    const tpl = COMMUNICATION_TEMPLATES[terms.communication_template]
    if (tpl) {
      body += clause('3.7.1', tpl.template({ ...(terms.communication_variables || {}), party1: party1Full, party2: party2Full }))
    }
  }

  // 3.8 — Special clauses
  if (clauses.length > 0) {
    body += subsection('3.8', 'Special Parenting Provisions')
    clauses.forEach((c, i) => {
      const tpl = SPECIAL_CLAUSE_TEMPLATES[c.clause_type]
      if (!tpl) return
      const txt = tpl.template({ ...(c.variables || {}), customText: c.custom_text })
      if (txt) body += clause(`3.8.${i + 1}`, txt)
    })
  }

  return `
    ${section(3, 'Parenting Arrangements')}
    ${body}
  `
}

// =============================================================================
// SECTION 4 — CHILD SUPPORT
// =============================================================================

function renderChildSupport(bundle) {
  const children = bundle.children || []
  if (children.length === 0) return ''

  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const sc = bundle.supportCalculations || {}
  const section7 = bundle.section7Expenses || []
  const periods = bundle.retroactivePeriods || []
  const retroExpenses = bundle.retroactiveExpenses || []
  const a = bundle.agreement

  if (!sc.child_support_payor) return ''

  const payor = sc.child_support_payor === 'party1' ? party1Full : (sc.child_support_payor === 'party2' ? party2Full : null)
  const recipient = sc.child_support_payor === 'party1' ? party2Full : (sc.child_support_payor === 'party2' ? party1Full : null)
  const amount = Number(sc.child_support_amount) || 0
  const arrangement = sc.child_support_arrangement || 'section3'

  let body = ''

  // 4.1 — Monthly support
  body += subsection('4.1', 'Monthly Child Support')
  if (sc.child_support_payor === 'none') {
    body += clause('4.1.1', `The parties acknowledge their respective incomes and parenting arrangements and agree that no monthly child support is payable at this time. Either party may seek child support at any time in accordance with the Federal Child Support Guidelines.`)
  } else if (amount > 0 && payor && recipient) {
    body += clause('4.1.1', `${payor} shall pay ${recipient} child support in the amount of <strong>${fmtCAD(amount)} per month</strong>, payable on the first day of each month, commencing on the first day of the month following the execution of this Agreement, for the benefit of the children.`)
    body += clause('4.1.2', `Payment shall be by direct deposit or electronic transfer to ${recipient}'s designated account.`)
    body += clause('4.1.3', `This amount is calculated in accordance with the Federal Child Support Guidelines, ${arrangement === 'section3' ? 'Section 3 (primary residence arrangement)' : 'Section 9 (shared parenting set-off)'}, based on the parties' incomes as set out in Schedule A.`)
  }

  // 4.2 — Annual income disclosure
  body += subsection('4.2', 'Annual Income Disclosure')
  body += clause('4.2.1', `Each party shall provide to the other, on or before June 1st of each year, a copy of their most recent Notice of Assessment and T1 General Income Tax Return so that child support and section 7 contributions may be reviewed and adjusted if necessary.`)

  // 4.3 — Section 7 special expenses
  if (section7.length > 0) {
    body += subsection('4.3', 'Section 7 Special and Extraordinary Expenses')
    const preAgreed = section7.filter((e) => e.is_pre_agreed)
    const consent = section7.filter((e) => !e.is_pre_agreed)

    if (preAgreed.length > 0) {
      body += clause('4.3.1', `The following expenses are pre-agreed section 7 special expenses to be shared in proportion to the parties' incomes, without further consent required for each occurrence:`)
      body += '<ul class="legal">'
      preAgreed.forEach((e, i) => {
        body += `<li><span class="sub-num">${String.fromCharCode(97 + i)})</span> ${e.description || e.expense_type} — estimated ${fmtCAD(e.estimated_annual_cost)} per year (${e.party1_percentage}% / ${e.party2_percentage}%)</li>`
      })
      body += '</ul>'
    }
    if (consent.length > 0) {
      const num = preAgreed.length > 0 ? '4.3.2' : '4.3.1'
      body += clause(num, `For the following expenses, the party incurring the expense shall obtain the other party's written consent before each occurrence:`)
      body += '<ul class="legal">'
      consent.forEach((e, i) => {
        body += `<li><span class="sub-num">${String.fromCharCode(97 + i)})</span> ${e.description || e.expense_type}</li>`
      })
      body += '</ul>'
    }
  }

  // 4.4 — Retroactive support
  if (a.retroactive_support_waived) {
    body += subsection('4.4', 'Retroactive Child Support')
    body += clause('4.4.1', `The parties acknowledge and agree that no retroactive child support is owed by either party, and each party releases the other from any claim for retroactive child support up to the date of this Agreement.`)
  } else if (periods.length > 0) {
    body += subsection('4.4', 'Retroactive Child Support')
    const totals = aggregateRetroactiveTotals(periods)
    const owingName = totals.netDirection === 'party1_owes_party2' ? party1Full : party2Full
    const receiveName = totals.netDirection === 'party1_owes_party2' ? party2Full : party1Full
    body += clause('4.4.1', `The parties have reviewed past periods and agreed that ${owingName} owes ${receiveName} retroactive child support in the net amount of <strong>${fmtCAD(totals.netAmount)}</strong>, as detailed in Schedule A.`)
  }

  if (retroExpenses.length > 0) {
    body += subsection('4.5', 'Retroactive Section 7 Expenses')
    body += clause('4.5.1', `The parties have reviewed past special expenses. The contributions owing are as set out in Schedule A.`)
  }

  // Tax note (always at end of child support section)
  body += subsection('4.6', 'Tax Treatment')
  body += clause('4.6.1', `The parties acknowledge that child support payments are not deductible to the payor and not taxable to the recipient under the Income Tax Act (Canada).`)

  return `
    ${section(4, 'Child Support')}
    ${body}
  `
}

// =============================================================================
// SECTION 5 — SPOUSAL SUPPORT
// =============================================================================

function renderSpousalSupport(bundle) {
  const sc = bundle.supportCalculations || {}
  if (!sc.spousal_support_payor) return ''

  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const payor = sc.spousal_support_payor === 'party1' ? party1Full : (sc.spousal_support_payor === 'party2' ? party2Full : null)
  const recipient = sc.spousal_support_payor === 'party1' ? party2Full : (sc.spousal_support_payor === 'party2' ? party1Full : null)
  const tplKey = sc.spousal_support_template
  const tpl = tplKey ? SPOUSAL_SUPPORT_TEMPLATES[tplKey] : null

  let body = ''

  if (sc.spousal_support_payor === 'none' || tplKey === 'complete_release') {
    body += subsection('5.1', 'Mutual Release of Spousal Support')
    body += clause('5.1.1', `${party1Full} and ${party2Full} each release and forever discharge the other from any claim for spousal support, whether under the Divorce Act, the Family Law Act, or any other applicable legislation.`)
    body += clause('5.1.2', `Each party acknowledges they are aware of their rights under the Spousal Support Advisory Guidelines and the Family Law Act, and waives those rights with full knowledge of the consequences.`)
  } else if (tpl) {
    body += subsection('5.1', 'Spousal Support Obligation')
    body += clause('5.1.1', tpl.template({
      ...(sc.spousal_support_variables || {}),
      amount: sc.spousal_support_amount,
      party1: party1Full, party2: party2Full,
      payorName: payor, recipientName: recipient,
    }))

    // Termination triggers
    const triggers = sc.spousal_support_termination_triggers || []
    if (triggers.length > 0) {
      body += subsection('5.2', 'Termination of Support')
      body += clause('5.2.1', `Spousal support shall terminate upon the earliest occurrence of:`)
      body += '<ul class="legal">'
      triggers.forEach((t, i) => {
        body += `<li><span class="sub-num">${String.fromCharCode(97 + i)})</span> ${SPOUSAL_TERMINATION_TRIGGERS[t] || t}</li>`
      })
      body += '</ul>'
    }

    body += subsection(triggers.length > 0 ? '5.3' : '5.2', 'Tax Treatment')
    body += clause(triggers.length > 0 ? '5.3.1' : '5.2.1', `Spousal support payments under this Agreement are deductible to the payor and included in the income of the recipient pursuant to the Income Tax Act (Canada).`)
  }

  return `
    ${section(5, 'Spousal Support')}
    ${body}
  `
}

// =============================================================================
// SECTION 6 — PROPERTY DIVISION
// =============================================================================

function renderProperty(bundle) {
  const a = bundle.agreement
  if (a.agreement_type === 'prenup' || a.agreement_type === 'cohabitation') return ''

  const items = bundle.propertyItems || []
  const division = bundle.propertyDivisionTerms || {}
  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const { amount: calcEq, payor: calcPayor } = equalizationFromItems(items)
  const effectiveAmount = division.custom_equalization_amount != null
    ? Number(division.custom_equalization_amount) : calcEq
  const payorName = calcPayor === 'party1' ? party1Full : (calcPayor === 'party2' ? party2Full : null)
  const recipientName = calcPayor === 'party1' ? party2Full : (calcPayor === 'party2' ? party1Full : null)
  const subCtx = { party1: party1Full, party2: party2Full, payorName, recipientName, amount: effectiveAmount }

  let body = ''

  // 6.1 — NFP
  body += subsection('6.1', 'Net Family Property')
  body += clause('6.1.1', `The parties have exchanged itemized statements of their assets, debts, and exclusions as detailed in Schedule A, calculated in accordance with the Family Law Act, R.S.O. 1990, c. F.3.`)

  // 6.2 — Equalization
  body += subsection('6.2', 'Equalization Payment')
  if (effectiveAmount > 0 && payorName) {
    body += clause('6.2.1', `Based on the calculations in Schedule A, <strong>${payorName}</strong> shall pay <strong>${recipientName}</strong> an equalization payment of <strong>${fmtCAD(effectiveAmount)}</strong>.`)
    if (division.equalization_payment_method) {
      const tpl = EQUALIZATION_PAYMENT_TEMPLATES[division.equalization_payment_method]
      if (tpl) {
        body += clause('6.2.2', tpl.template({
          ...(division.equalization_variables || {}),
          ...subCtx,
        }))
      }
    }
    if (division.custom_equalization_notes) {
      body += clause('6.2.3', `<em>${division.custom_equalization_notes}</em>`)
    }
  } else {
    body += clause('6.2.1', `The parties' Net Family Property values are equal, and no equalization payment is owing.`)
  }

  // 6.3 — Matrimonial home
  if (division.matrimonial_home_disposition) {
    body += subsection('6.3', 'Matrimonial Home')
    const tpl = MATRIMONIAL_HOME_TEMPLATES[division.matrimonial_home_disposition]
    if (tpl) {
      body += clause('6.3.1', tpl.template({ ...(division.matrimonial_home_variables || {}), ...subCtx }))
    }
  }

  // 6.4 — Pensions
  if (division.pension_division_method) {
    body += subsection('6.4', 'Pension Division')
    const tpl = PENSION_DIVISION_TEMPLATES[division.pension_division_method]
    if (tpl) {
      body += clause('6.4.1', tpl.template({ ...(division.pension_variables || {}), ...subCtx }))
    }
  }

  // 6.5 — Vehicles
  const transfers = Array.isArray(division.vehicle_transfers) ? division.vehicle_transfers : []
  if (transfers.length > 0) {
    body += subsection('6.5', 'Vehicle Transfers')
    transfers.forEach((t, i) => {
      const fromName = t.from === 'party2' ? party2Full : party1Full
      const toName = t.to === 'party2' ? party2Full : party1Full
      body += clause(`6.5.${i + 1}`, `${fromName} shall transfer the ${t.description || 'vehicle'} to ${toName}${t.payment_amount > 0 ? ` for consideration of ${fmtCAD(t.payment_amount)}` : ''}.`)
    })
  }

  // 6.6 — RRSPs/TFSAs & bank accounts
  if (division.rrsp_division_deadline || division.bank_account_closure_date) {
    body += subsection('6.6', 'RRSPs, TFSAs and Bank Accounts')
    if (division.rrsp_division_deadline) {
      body += clause('6.6.1', `RRSP and TFSA division shall be completed on or before ${fmtLegalDate(division.rrsp_division_deadline)}.`)
    }
    if (division.bank_account_closure_date) {
      body += clause(division.rrsp_division_deadline ? '6.6.2' : '6.6.1', `Joint bank accounts shall be closed or reorganized on or before ${fmtLegalDate(division.bank_account_closure_date)}.`)
    }
  }

  // 6.7 — Other property
  body += subsection('6.7', 'Other Property')
  body += clause('6.7.1', `Each party shall retain full ownership of all property registered in their own name, except as otherwise specified in this Agreement or Schedule A. The parties release any claim to such other property.`)

  return `
    ${section(6, 'Property Division and Equalization')}
    ${body}
  `
}

// =============================================================================
// SECTION 7 — GENERAL PROVISIONS
// =============================================================================

function renderGeneralProvisions(bundle) {
  const t = bundle.additionalTerms || {}
  const { party1Full, party2Full } = getNamesForBundle(bundle)

  let body = ''
  let n = 1

  // 7.X — Life insurance
  const insurancePartyValue = t.insurance_variables?.insured_party
  const insuredName = insurancePartyValue === 'party2' ? party2Full : (insurancePartyValue === 'party1' ? party1Full : null)
  if (t.insurance_template && insuredName) {
    const tpl = LIFE_INSURANCE_TEMPLATES[t.insurance_template]
    if (tpl) {
      body += subsection(`7.${n}`, 'Life Insurance')
      body += clause(`7.${n}.1`, tpl.template({ ...(t.insurance_variables || {}), insuredName, party1: party1Full, party2: party2Full }))
      n++
    }
  }

  // 7.X — Financial disclosure
  if (t.disclosure_template) {
    const tpl = DISCLOSURE_TEMPLATES[t.disclosure_template]
    if (tpl) {
      body += subsection(`7.${n}`, 'Financial Disclosure')
      body += clause(`7.${n}.1`, tpl.template({ ...(t.disclosure_variables || {}) }))
      n++
    }
  }

  // 7.X — Tax provisions
  if (t.tax_template) {
    const tpl = TAX_PROVISION_TEMPLATES[t.tax_template]
    if (tpl) {
      const ccbName = t.tax_variables?.ccb_party === 'party2' ? party2Full : party1Full
      const firstName = t.tax_variables?.first_year_party === 'party2' ? party2Full : party1Full
      body += subsection(`7.${n}`, 'Canada Child Benefit and Tax Credits')
      body += clause(`7.${n}.1`, tpl.template({ ...(t.tax_variables || {}), ccbPartyName: ccbName, firstYearPartyName: firstName, party1: party1Full, party2: party2Full }))
      n++
    }
  }

  // 7.X — Dispute resolution
  if (t.dispute_template) {
    const tpl = DISPUTE_RESOLUTION_TEMPLATES[t.dispute_template]
    if (tpl) {
      body += subsection(`7.${n}`, 'Dispute Resolution')
      body += clause(`7.${n}.1`, tpl.template({ ...(t.dispute_variables || {}) }))
      n++
    }
  }

  // Standard closing clauses (always)
  body += subsection(`7.${n}`, 'Independent Legal Advice')
  body += clause(`7.${n}.1`, `Each party acknowledges that they have had the opportunity to obtain independent legal advice from a lawyer of their own choosing regarding this Agreement.`); n++

  body += subsection(`7.${n}`, 'Entire Agreement')
  body += clause(`7.${n}.1`, `This Agreement, including all schedules, constitutes the entire agreement between the parties with respect to its subject matter and supersedes all prior negotiations, representations, and agreements.`); n++

  body += subsection(`7.${n}`, 'Governing Law')
  body += clause(`7.${n}.1`, `This Agreement shall be governed by and construed in accordance with the laws of the Province of Ontario and the laws of Canada applicable therein.`); n++

  body += subsection(`7.${n}`, 'Severability')
  body += clause(`7.${n}.1`, `If any provision of this Agreement is held invalid or unenforceable, the remainder shall continue in full force and effect.`); n++

  body += subsection(`7.${n}`, 'Amendments')
  body += clause(`7.${n}.1`, `No amendment to this Agreement shall be binding unless made in writing and signed by both parties.`); n++

  return `
    ${section(7, 'General Provisions')}
    ${body}
  `
}

// =============================================================================
// SECTION 8 — SIGNATURES
// =============================================================================

function renderSignatureBlock(bundle) {
  const a = bundle.agreement
  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const sig1Html = a.party1_signature
    ? `<img src="${a.party1_signature}" alt="signature" style="max-height:42pt;max-width:240pt;"/>`
    : `<div class="sig-line"></div>`
  const sig2Html = a.party2_signature
    ? `<img src="${a.party2_signature}" alt="signature" style="max-height:42pt;max-width:240pt;"/>`
    : `<div class="sig-line"></div>`

  return `
    ${section(8, 'Signatures')}
    ${clause('8.1', `<strong>IN WITNESS WHEREOF</strong> the parties have signed this Agreement.`)}
    ${clause('8.2', `SIGNED, SEALED AND DELIVERED in the presence of:`)}

    <div class="sig-grid">
      <div class="sig-cell">
        ${sig1Html}
        <div style="border-top:1pt solid ${TEXT}; padding-top:4pt;"></div>
        <div class="sig-name">${party1Full}</div>
        <div class="sig-meta">Date: ${a.party1_signed_at ? fmtLegalDate(a.party1_signed_at) : '__________'}</div>
      </div>
      <div class="sig-cell">
        ${sig2Html}
        <div style="border-top:1pt solid ${TEXT}; padding-top:4pt;"></div>
        <div class="sig-name">${party2Full}</div>
        <div class="sig-meta">Date: ${a.party2_signed_at ? fmtLegalDate(a.party2_signed_at) : '__________'}</div>
      </div>

      <div class="sig-cell">
        <div class="sig-line"></div>
        <div class="sig-name">Witness for ${party1Full}</div>
        <div class="sig-meta">Name: __________________________</div>
        <div class="sig-meta">Address: __________________________</div>
      </div>
      <div class="sig-cell">
        <div class="sig-line"></div>
        <div class="sig-name">Witness for ${party2Full}</div>
        <div class="sig-meta">Name: __________________________</div>
        <div class="sig-meta">Address: __________________________</div>
      </div>
    </div>

    <div class="notice" style="margin-top:24pt;">
      <strong>IMPORTANT LEGAL NOTICE.</strong> This document has been prepared based on information provided by the parties and does not constitute legal advice. The parties are strongly encouraged to obtain independent legal advice from a licensed Ontario family law lawyer before signing this Agreement.
    </div>
  `
}

// =============================================================================
// SCHEDULES
// =============================================================================

export function renderScheduleA_NFP(bundle) {
  const items = bundle.propertyItems || []
  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const p1 = calculateNFPFromItems(items, 'party1')
  const p2 = calculateNFPFromItems(items, 'party2')
  const eq = equalizationFromItems(items)
  const payorName = eq.payor === 'party1' ? party1Full : (eq.payor === 'party2' ? party2Full : null)
  const recipientName = eq.payor === 'party1' ? party2Full : (eq.payor === 'party2' ? party1Full : null)

  const renderItemsTable = (party, name) => {
    const owned = items.filter((i) => i.owner === party)
    if (owned.length === 0) return `<p><em>No items owned in ${name}'s name.</em></p>`
    const rows = owned.map((i) => `
      <tr>
        <td>${i.item_type === 'debt' ? '(Debt) ' : ''}${i.category}${i.is_matrimonial_home ? ' — Matrimonial Home' : ''}</td>
        <td>${i.description || '—'}</td>
        <td class="right">${fmtCAD(i.value_at_separation)}</td>
        <td class="right">${i.is_matrimonial_home ? '<em>excluded</em>' : fmtCAD(i.value_at_marriage)}</td>
        <td class="right">${i.is_excluded ? fmtCAD(i.excluded_amount) : '—'}</td>
      </tr>
    `).join('')
    return `<table>
      <thead><tr>
        <th>Category</th><th>Description</th>
        <th class="right">Value @ Separation</th>
        <th class="right">Value @ Marriage</th>
        <th class="right">Excluded</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`
  }

  const partyBlock = (party, name, p, prefix) => `
    ${subsection(prefix, name)}
    ${renderItemsTable(party, name)}
    <table style="margin-top:8pt;">
      <tbody>
        <tr><td>Assets at Separation</td><td class="right">${fmtCAD(p.assetsSep)}</td></tr>
        <tr><td>Less: Debts at Separation</td><td class="right">−${fmtCAD(p.debtsSep)}</td></tr>
        <tr><td><strong>Net Worth at Separation</strong></td><td class="right"><strong>${fmtCAD(p.assetsSep - p.debtsSep)}</strong></td></tr>
        <tr><td>Less: Net Worth at Marriage</td><td class="right">−${fmtCAD(p.assetsMar - p.debtsMar)}</td></tr>
        <tr><td>Less: Excluded Property</td><td class="right">−${fmtCAD(p.excluded)}</td></tr>
        <tr class="total-row"><td>Net Family Property</td><td class="right">${fmtCAD(p.nfp)}</td></tr>
      </tbody>
    </table>
  `

  return `
    <div class="schedule">
    <h1 class="section">Schedule A — Net Family Property Statement</h1>
    ${partyBlock('party1', party1Full, p1, 'A.1')}
    ${partyBlock('party2', party2Full, p2, 'A.2')}
    ${subsection('A.3', 'Equalization Calculation')}
    <table>
      <tbody>
        <tr><td>${party1Full} NFP</td><td class="right">${fmtCAD(p1.nfp)}</td></tr>
        <tr><td>${party2Full} NFP</td><td class="right">${fmtCAD(p2.nfp)}</td></tr>
        <tr><td>Difference</td><td class="right">${fmtCAD(Math.abs(p1.nfp - p2.nfp))}</td></tr>
        <tr class="total-row"><td>Equalization Payment (½ of difference)</td><td class="right">${fmtCAD(eq.amount)}</td></tr>
      </tbody>
    </table>
    ${payorName ? `<p>${payorName} pays ${recipientName} an equalization payment of <strong>${fmtCAD(eq.amount)}</strong>.</p>` : '<p>NFPs are equal — no equalization owing.</p>'}
    </div>
  `
}

export function renderScheduleB_Parenting(bundle) {
  const sched = bundle.parentingSchedule
  if (!sched?.regular_schedule_template) return ''
  const tpl = PARENTING_SCHEDULE_TEMPLATES[sched.regular_schedule_template]
  const { party1Full, party2Full } = getNamesForBundle(bundle)

  const weeks = sched.regular_schedule_variables?.weeks
    || generateDefaultGrid(sched.regular_schedule_template, sched.regular_schedule_variables)

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const cellClass = (v) => v === 'party1' ? 'p1' : v === 'party2' ? 'p2' : v === 'transition' ? 't' : ''
  const cellLabel = (v) => v === 'party1' ? 'P1' : v === 'party2' ? 'P2' : v === 'transition' ? '↔' : '—'

  let grid = `<table class="calendar"><thead><tr><th></th>${days.map((d) => `<th>${d}</th>`).join('')}</tr></thead><tbody>`
  for (let w = 0; w < weeks.length; w++) {
    grid += `<tr><th>Week ${w + 1}</th>`
    for (let d = 0; d < 7; d++) {
      const val = weeks[w][d]
      grid += `<td class="${cellClass(val)}">${cellLabel(val)}</td>`
    }
    grid += '</tr>'
  }
  grid += '</tbody></table>'

  // Transition details if any
  let transitionDetails = ''
  const tDays = []
  for (let w = 0; w < weeks.length; w++) {
    for (let d = 0; d < 7; d++) {
      if (weeks[w][d] === 'transition') tDays.push({ w, d })
    }
  }
  if (tDays.length > 0 && sched.regular_schedule_variables?.transitions) {
    transitionDetails = `${subsection('B.2', 'Transition Times and Locations')}<table><thead><tr><th>Week</th><th>Day</th><th>Pickup Time</th><th>Pickup Location</th><th>Dropoff Time</th><th>Dropoff Location</th></tr></thead><tbody>`
    tDays.forEach(({ w, d }) => {
      const td = sched.regular_schedule_variables.transitions?.[`${w}-${d}`] || {}
      transitionDetails += `<tr><td>${w + 1}</td><td>${days[d]}</td><td>${td.pickup_time || '—'}</td><td>${td.pickup_location || '—'}</td><td>${td.dropoff_time || '—'}</td><td>${td.dropoff_location || '—'}</td></tr>`
    })
    transitionDetails += '</tbody></table>'
  }

  return `
    <div class="schedule">
    <h1 class="section">Schedule B — Parenting Schedule</h1>
    ${subsection('B.1', tpl?.label || sched.regular_schedule_template)}
    ${grid}
    <p style="font-size:9pt;"><strong>Legend:</strong> P1 = ${party1Full}, P2 = ${party2Full}, ↔ = transition day.</p>
    ${transitionDetails}
    </div>
  `
}

function generateDefaultGrid(tplKey, vars = {}) {
  const weeks = [Array(7).fill(null), Array(7).fill(null), Array(7).fill(null), Array(7).fill(null)]
  const primary = vars.primaryParent === 'party2' ? 'party2' : 'party1'
  const other = primary === 'party1' ? 'party2' : 'party1'
  if (tplKey === 'primary_residence_only') {
    for (let w = 0; w < 4; w++) for (let d = 0; d < 7; d++) weeks[w][d] = primary
  } else if (tplKey === 'every_other_weekend') {
    for (let w = 0; w < 4; w++) {
      for (let d = 0; d < 7; d++) weeks[w][d] = primary
      if (w % 2 === 1) { weeks[w][5] = other; weeks[w][6] = other; if (w + 1 < 4) weeks[w + 1][0] = other }
    }
  } else if (tplKey === 'week_on_week_off') {
    for (let w = 0; w < 4; w++) for (let d = 0; d < 7; d++) weeks[w][d] = w % 2 === 0 ? 'party1' : 'party2'
  } else if (tplKey === '2-2-3') {
    for (let w = 0; w < 4; w++) {
      weeks[w][1] = 'party1'; weeks[w][2] = 'party1'
      weeks[w][3] = 'party2'; weeks[w][4] = 'party2'
      const fri = w % 2 === 0 ? 'party1' : 'party2'
      weeks[w][5] = fri; weeks[w][6] = fri; weeks[w][0] = fri
    }
  } else if (tplKey === '5-2-2-5') {
    const pattern = ['party1','party1','party1','party1','party1','party2','party2', 'party1','party1','party2','party2','party2','party2','party2']
    for (let w = 0; w < 4; w++) for (let d = 0; d < 7; d++) weeks[w][d] = pattern[((w*7)+d) % 14]
  }
  return weeks
}

export function renderScheduleC_FinancialDisclosure(bundle) {
  const docs = bundle.incomeDocuments || []
  if (docs.length === 0) return ''
  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const rows = docs.map((d) => {
    const partyName = d.party === 'party1' ? party1Full : party2Full
    const typeLabel = d.document_type === 'tax_return' ? 'T1 Tax Return' : 'Notice of Assessment'
    return `<tr><td>${partyName}</td><td>${d.tax_year}</td><td>${typeLabel}</td><td>${d.file_name || '—'}</td></tr>`
  }).join('')
  return `
    <div class="schedule">
    <h1 class="section">Schedule C — Financial Disclosure Documents</h1>
    <p>The parties have exchanged the following financial documents in support of this Agreement:</p>
    <table>
      <thead><tr><th>Party</th><th>Tax Year</th><th>Document Type</th><th>Filename</th></tr></thead>
      <tbody>${rows}</tbody>
    </table>
    </div>
  `
}

export function renderScheduleD_SSAG(bundle) {
  const sc = bundle.supportCalculations || {}
  if (!sc.spousal_support_payor || sc.spousal_support_payor === 'none') return ''
  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const payor = sc.spousal_support_payor === 'party1' ? party1Full : party2Full
  const recipient = sc.spousal_support_payor === 'party1' ? party2Full : party1Full
  return `
    <div class="schedule">
    <h1 class="section">Schedule D — Spousal Support Advisory Guidelines (SSAG)</h1>
    ${clause('D.1', `The parties acknowledge they have considered the Spousal Support Advisory Guidelines. The agreed quantum of spousal support is <strong>${fmtCAD(sc.spousal_support_amount || 0)} per month</strong>, payable by ${payor} to ${recipient}.`)}
    ${clause('D.2', `The parties confirm that this amount and duration are within / outside the SSAG range based on their incomes, ages, and length of relationship, and that they have considered the relevant factors in agreeing to the quantum and duration above.`)}
    ${sc.spousal_support_template ? clause('D.3', `Term structure: <strong>${SPOUSAL_SUPPORT_TEMPLATES[sc.spousal_support_template]?.label || sc.spousal_support_template}</strong>.`) : ''}
    </div>
  `
}

// =============================================================================
// PUBLIC API
// =============================================================================

export function generateFullAgreementHTML(bundle) {
  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const body = [
    renderHeader(bundle),
    renderBackground(bundle),
    renderDefinitions(bundle),
    renderParenting(bundle),
    renderChildSupport(bundle),
    renderSpousalSupport(bundle),
    renderProperty(bundle),
    renderGeneralProvisions(bundle),
    renderSignatureBlock(bundle),
  ].filter(Boolean).join('\n')

  const footer = `CONFIDENTIAL — ${party1Full} and ${party2Full} · ${AGREEMENT_TYPE_LABELS[bundle.agreement.agreement_type] || 'Agreement'}`
  return baseDocument('Agreement', body, footer)
}

export function generateScheduleHTML(bundle, scheduleKey) {
  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const footer = `CONFIDENTIAL — ${party1Full} and ${party2Full} · ${AGREEMENT_TYPE_LABELS[bundle.agreement.agreement_type] || 'Agreement'}`
  let body = ''
  if (scheduleKey === 'A') body = renderScheduleA_NFP(bundle)
  else if (scheduleKey === 'B') body = renderScheduleB_Parenting(bundle)
  else if (scheduleKey === 'C') body = renderScheduleC_FinancialDisclosure(bundle)
  else if (scheduleKey === 'D') body = renderScheduleD_SSAG(bundle)
  return baseDocument(`Schedule ${scheduleKey}`, body, footer)
}

export function generateFullAgreementWithSchedulesHTML(bundle) {
  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const body = [
    renderHeader(bundle),
    renderBackground(bundle),
    renderDefinitions(bundle),
    renderParenting(bundle),
    renderChildSupport(bundle),
    renderSpousalSupport(bundle),
    renderProperty(bundle),
    renderGeneralProvisions(bundle),
    renderSignatureBlock(bundle),
    renderScheduleA_NFP(bundle),
    renderScheduleB_Parenting(bundle),
    renderScheduleC_FinancialDisclosure(bundle),
    renderScheduleD_SSAG(bundle),
  ].filter(Boolean).join('\n')
  const footer = `CONFIDENTIAL — ${party1Full} and ${party2Full} · ${AGREEMENT_TYPE_LABELS[bundle.agreement.agreement_type] || 'Agreement'}`
  return baseDocument('Agreement with Schedules', body, footer)
}

// Backwards-compat (no longer used by editor)
export const generateAgreementHTML = () =>
  `<html><body><p>Open via the tabbed editor instead.</p></body></html>`
export const generatePreviewText = () => ''
