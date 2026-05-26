// Section-by-section legal HTML generator for the 9-tab agreement editor.
// Reads from a "bundle" object (the same shape returned by the /bundle endpoint).
// Every party-name reference flows from a single source of truth to avoid contradictions.

import { fmtLegalDate, fmtCAD, getPartyDisplayName, resolveParentalNames, equalizationFromItems, calculateNFPFromItems, aggregateRetroactiveTotals } from './utils'
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
// CSS shared by preview + PDF
// =============================================================================

const BASE_CSS = `
  * { box-sizing: border-box; }
  body { font-family: 'Times New Roman', Times, serif; line-height: 1.5; color: #111; margin: 0; padding: 0; background: #fff; }
  .doc { max-width: 8.5in; margin: 0 auto; padding: 0.75in; background: #fff; }
  h1 { text-align: center; font-size: 16pt; letter-spacing: 0.06em; margin: 0 0 8pt; text-transform: uppercase; }
  h2 { font-size: 11.5pt; font-weight: bold; margin: 18pt 0 8pt; text-transform: uppercase; border-bottom: 1pt solid #999; padding-bottom: 3pt; }
  h3 { font-size: 10.5pt; font-weight: bold; margin: 12pt 0 6pt; font-style: italic; }
  p { margin: 6pt 0; text-align: justify; font-size: 10.5pt; }
  ul { margin: 6pt 0 6pt 24pt; padding: 0; font-size: 10.5pt; }
  li { margin: 3pt 0; }
  table { width: 100%; border-collapse: collapse; margin: 8pt 0; font-size: 9.5pt; }
  th, td { border: 1pt solid #333; padding: 6pt 8pt; text-align: left; vertical-align: top; }
  th { background: #e8e8e8; font-weight: bold; }
  .between { text-align: center; margin: 16pt 0; }
  .notice { background: #fff4e6; border: 1pt solid #f0a500; padding: 10pt 14pt; margin: 12pt 0; font-size: 9.5pt; }
  .sig-table { border: none; }
  .sig-table td { border: none; vertical-align: bottom; padding: 4pt 12pt 4pt 0; }
  .sig-line { border-bottom: 1pt solid #000; height: 32pt; width: 100%; }
  .schedule { page-break-before: always; }
  .footer { font-size: 8.5pt; text-align: center; color: #555; border-top: 1pt solid #ccc; padding-top: 6pt; margin-top: 18pt; }
  .calendar { width: 100%; border-collapse: collapse; font-size: 9pt; }
  .calendar th { background: var(--vx, #eef0ff); }
  .calendar .p1 { background: #d6e7ff; }
  .calendar .p2 { background: #d6fff0; }
  .calendar .t  { background: #fff3cc; }
`

const baseDocument = (title, bodyHtml, footerText) => `
<!DOCTYPE html>
<html lang="en">
<head><meta charset="UTF-8"><title>${title}</title><style>${BASE_CSS}</style></head>
<body><div class="doc">${bodyHtml}<div class="footer">${footerText || ''}</div></div></body>
</html>
`

// =============================================================================
// Helper: resolve party display names for the bundle
// =============================================================================

export function getNamesForBundle(bundle) {
  const a = bundle.agreement
  const owner = bundle.owner || null
  const party1 = getPartyDisplayName(a, 'party1', owner)
  const party2 = getPartyDisplayName(a, 'party2', null)
  const { motherName, fatherName, motherParty, fatherParty } = resolveParentalNames(a, owner)
  return { party1, party2, motherName, fatherName, motherParty, fatherParty, owner }
}

// =============================================================================
// Sections
// =============================================================================

function renderHeader(bundle) {
  const a = bundle.agreement
  const { party1, party2 } = getNamesForBundle(bundle)
  const title = AGREEMENT_TYPE_LABELS[a.agreement_type] || 'SEPARATION AGREEMENT'
  const signingCity = a.signing_city || 'Ontario'
  return `
    <h1>${title}</h1>
    <p style="text-align:center; margin-top:0;"><strong>THIS AGREEMENT</strong> is made as of the ${fmtLegalDate(new Date().toISOString().split('T')[0])}.</p>
    <div class="between">
      <p><strong>BETWEEN:</strong></p>
      <p><strong>${party1}</strong><br/>of the City of ${signingCity}, in the Province of Ontario<br/>(<em>"Party 1"</em>)</p>
      <p>— and —</p>
      <p><strong>${party2}</strong><br/>(<em>"Party 2"</em>)</p>
      <p><em>(collectively, the "parties")</em></p>
    </div>
    <div class="notice">
      <strong>IMPORTANT NOTICE:</strong> This document has been prepared based on information provided by the parties and does not constitute legal advice. The parties are strongly encouraged to seek independent legal advice from a licensed Ontario family law lawyer before signing this Agreement.
    </div>
  `
}

function renderRecitals(bundle) {
  const a = bundle.agreement
  const { party1, party2 } = getNamesForBundle(bundle)
  const children = bundle.children || []
  const type = a.agreement_type

  let relationship = ''
  if (type === 'separation' || type === 'postnup' || type === 'amendment') {
    relationship = a.marriage_date
      ? `${party1} and ${party2} were married on ${fmtLegalDate(a.marriage_date)}${a.marriage_location ? ` in ${a.marriage_location}` : ''}.`
      : `${party1} and ${party2} cohabited in a conjugal relationship commencing on or about ${fmtLegalDate(a.cohabitation_date)}.`
  } else if (type === 'cohabitation') {
    relationship = `${party1} and ${party2} cohabit in a conjugal relationship commencing on or about ${fmtLegalDate(a.cohabitation_date)}.`
  } else if (type === 'prenup') {
    relationship = `${party1} and ${party2} intend to marry in the near future.`
  }

  const childrenLi = children.length > 0
    ? `<li>The parties have ${children.length} child${children.length === 1 ? '' : 'ren'} of the relationship: ${children.map((c) => `${c.full_name} (born ${fmtLegalDate(c.birth_date)})`).join('; ')}.</li>`
    : `<li>The parties have no children together.</li>`

  const sepLi = (type === 'separation' || type === 'amendment') && a.separation_date
    ? `<li>The parties separated on or about ${fmtLegalDate(a.separation_date)} and have been living separate and apart since that date.</li>`
    : ''

  return `
    <h2>Background and Recitals</h2>
    <p>WHEREAS the parties acknowledge as follows:</p>
    <ul>
      <li><strong>Relationship.</strong> ${relationship}</li>
      ${childrenLi}
      ${sepLi}
      <li><strong>Full Disclosure.</strong> Each party has provided full and honest financial disclosure to the other, including details of all assets, liabilities, and income sources.</li>
      <li><strong>Independent Legal Advice.</strong> Each party has had the opportunity to obtain independent legal advice from a lawyer of their own choosing.</li>
      <li><strong>Voluntary Agreement.</strong> The parties enter into this Agreement voluntarily, without pressure, duress, or undue influence.</li>
      <li><strong>Final Settlement.</strong> The parties intend this Agreement to be a final settlement of all matters arising from their relationship, subject only to variation in accordance with applicable family-law statutes.</li>
    </ul>
  `
}

function renderDefinitions(bundle) {
  const a = bundle.agreement
  const children = bundle.children || []
  const defs = []
  if (children.length > 0) {
    defs.push(`<strong>"children"</strong> means ${children.map((c) => c.full_name).join(', ')}.`)
  }
  if (a.separation_date) {
    defs.push(`<strong>"date of separation"</strong> means ${fmtLegalDate(a.separation_date)}.`)
  }
  const hasHome = (bundle.propertyItems || []).some((p) => p.is_matrimonial_home)
  if (hasHome) {
    defs.push(`<strong>"matrimonial home"</strong> means the residence so identified in this Agreement and in Schedule A.`)
  }
  defs.push(`<strong>"Table"</strong> means the Federal Child Support Guidelines, Schedule I, in force at the time of any required calculation.`)
  defs.push(`<strong>"Section 7 expenses"</strong> means special and extraordinary expenses for the children as defined in section 7 of the Guidelines.`)
  return `
    <h2>Section 1 — Definitions and Interpretation</h2>
    <p>In this Agreement:</p>
    <ul>${defs.map((d) => `<li>${d}</li>`).join('')}</ul>
    <p>References to "Party 1" and "Party 2" include their respective legal representatives, estates, successors, and assigns.</p>
  `
}

function renderParenting(bundle) {
  const children = bundle.children || []
  if (children.length === 0) return ''

  const { party1, party2, motherName, fatherName } = getNamesForBundle(bundle)
  const terms = bundle.parentingTerms || {}
  const sched = bundle.parentingSchedule || null
  const holidays = bundle.holidays || []
  const clauses = bundle.specialClauses || []

  // Decision-Making
  const domain = (val, label) => {
    const v = val || 'joint'
    const text =
      v === 'joint' ? 'jointly by both parties' :
      v === 'consult' ? 'by the primary parent after meaningful consultation with the other' :
      v === 'party1' ? `solely by ${party1}` :
      v === 'party2' ? `solely by ${party2}` : 'jointly by both parties'
    return `<li><strong>${label}:</strong> Decisions about ${label.toLowerCase()} shall be made ${text}.</li>`
  }

  let decisionHtml = ''
  if (terms.legal_custody_type === 'sole_party1') {
    decisionHtml = `<p>${party1} shall have <strong>sole decision-making responsibility</strong> for the children, including all major decisions regarding their education, health care, religion, and extracurricular activities. ${party2} shall be kept reasonably informed of all major decisions.</p>`
  } else if (terms.legal_custody_type === 'sole_party2') {
    decisionHtml = `<p>${party2} shall have <strong>sole decision-making responsibility</strong> for the children, including all major decisions regarding their education, health care, religion, and extracurricular activities. ${party1} shall be kept reasonably informed of all major decisions.</p>`
  } else {
    decisionHtml = `<p>The parties shall have <strong>joint decision-making responsibility</strong> for the children. Specifically:</p>
      <ul>
        ${domain(terms.decision_making_education, 'Education')}
        ${domain(terms.decision_making_health, 'Health Care')}
        ${domain(terms.decision_making_religion, 'Religion')}
        ${domain(terms.decision_making_extracurricular, 'Extracurricular Activities')}
      </ul>`
  }

  // Schedule
  let scheduleHtml = ''
  if (sched?.regular_schedule_template) {
    const tpl = PARENTING_SCHEDULE_TEMPLATES[sched.regular_schedule_template]
    if (tpl) {
      const vars = sched.regular_schedule_variables || {}
      const primaryParentName = vars.primaryParent === 'party2' ? party2 : party1
      const otherParentName = vars.primaryParent === 'party2' ? party1 : party2
      scheduleHtml = `<h3>Parenting Time — Regular Schedule</h3><p>${tpl.template({
        ...vars,
        primaryParentName, otherParentName,
        party1, party2,
      })}</p>`
    }
  }

  if (sched?.summer_schedule_template) {
    const tpl = SUMMER_SCHEDULE_TEMPLATES[sched.summer_schedule_template]
    if (tpl) {
      scheduleHtml += `<h3>Summer Vacation</h3><p>${tpl.template({ ...(sched.summer_schedule_variables || {}), party1, party2 })}</p>`
    }
  }

  if (sched?.transportation_template) {
    const tpl = TRANSPORTATION_TEMPLATES[sched.transportation_template]
    if (tpl) {
      scheduleHtml += `<h3>Transportation</h3><p>${tpl.template({ ...(sched.transportation_variables || {}), party1, party2 })}</p>`
    }
  }

  // Holidays
  let holidaysHtml = ''
  if (holidays.length > 0) {
    holidaysHtml = `<h3>Holiday and Special Occasion Schedule</h3><ul>`
    for (const h of holidays) {
      const fn = HOLIDAY_ARRANGEMENT_TEMPLATES[h.arrangement]
      if (!fn) continue
      const txt = fn({ holidayName: h.holiday_name, motherName, fatherName, party1, party2 })
      holidaysHtml += `<li>${txt}</li>`
    }
    holidaysHtml += '</ul>'
  }

  // Special clauses
  let clausesHtml = ''
  if (clauses.length > 0) {
    clausesHtml = `<h3>Special Parenting Clauses</h3><ul>`
    for (const c of clauses) {
      const tpl = SPECIAL_CLAUSE_TEMPLATES[c.clause_type]
      if (!tpl) continue
      const txt = tpl.template({ ...(c.variables || {}), customText: c.custom_text })
      if (txt) clausesHtml += `<li>${txt}</li>`
    }
    clausesHtml += '</ul>'
  }

  // Communication
  let commHtml = ''
  if (terms.communication_template) {
    const tpl = COMMUNICATION_TEMPLATES[terms.communication_template]
    if (tpl) {
      commHtml = `<h3>Communication</h3><p>${tpl.template({ ...(terms.communication_variables || {}), party1, party2 })}</p>`
    }
  }

  return `
    <h2>Section 2 — Parenting Arrangements</h2>
    <h3>Best Interests of the Children</h3>
    <p>The parties acknowledge that the best interests of the children shall be the primary consideration in all decisions affecting them.</p>

    <h3>Decision-Making Responsibility</h3>
    ${decisionHtml}

    ${scheduleHtml}
    ${holidaysHtml}
    ${clausesHtml}
    ${commHtml}
  `
}

function renderChildSupport(bundle) {
  const children = bundle.children || []
  if (children.length === 0) return ''

  const { party1, party2 } = getNamesForBundle(bundle)
  const sc = bundle.supportCalculations || {}
  const section7 = bundle.section7Expenses || []
  const periods = bundle.retroactivePeriods || []
  const retroExpenses = bundle.retroactiveExpenses || []
  const a = bundle.agreement

  if (!sc.child_support_payor) return ''

  const payor = sc.child_support_payor === 'party1' ? party1 : (sc.child_support_payor === 'party2' ? party2 : null)
  const recipient = sc.child_support_payor === 'party1' ? party2 : (sc.child_support_payor === 'party2' ? party1 : null)
  const amount = Number(sc.child_support_amount) || 0
  const arrangement = sc.child_support_arrangement || 'section3'

  let monthlyHtml = ''
  if (amount > 0 && payor && recipient) {
    monthlyHtml = `
      <h3>Monthly Child Support</h3>
      <p>${payor} shall pay ${recipient} child support in the amount of <strong>${fmtCAD(amount)} per month</strong>, payable on the first day of each month, commencing on the first day of the month following the execution of this Agreement, for the benefit of the children.</p>
      <p>This amount is calculated in accordance with the Federal Child Support Guidelines, ${arrangement === 'section3' ? 'Section 3 (primary residence arrangement)' : 'Section 9 (shared parenting set-off)'}, based on the parties' incomes as reflected in Schedule A.</p>
    `
  } else if (sc.child_support_payor === 'none') {
    monthlyHtml = `<h3>Monthly Child Support</h3><p>The parties acknowledge their respective incomes and parenting arrangements and agree that no monthly child support is payable at this time. Either party may seek child support at any time in accordance with the Federal Child Support Guidelines.</p>`
  }

  // Section 7
  let s7Html = ''
  const preAgreed = section7.filter((e) => e.is_pre_agreed)
  const consent = section7.filter((e) => !e.is_pre_agreed)
  if (section7.length > 0) {
    s7Html = `<h3>Section 7 Special Expenses</h3>`
    if (preAgreed.length > 0) {
      s7Html += `<p>The parties have pre-agreed that the following expenses are section 7 special expenses to be shared in proportion to their incomes, without further consent required for each occurrence:</p>
        <ul>${preAgreed.map((e) => `<li>${e.description || e.expense_type} — estimated ${fmtCAD(e.estimated_annual_cost)} / year (${e.party1_percentage}% / ${e.party2_percentage}%)</li>`).join('')}</ul>`
    }
    if (consent.length > 0) {
      s7Html += `<p>For the following expenses, the incurring party shall obtain the other party's written consent before each occurrence:</p>
        <ul>${consent.map((e) => `<li>${e.description || e.expense_type}</li>`).join('')}</ul>`
    }
  }

  // Retroactive
  let retroHtml = ''
  if (a.retroactive_support_waived) {
    retroHtml = `<h3>Retroactive Child Support</h3><p>The parties acknowledge and agree that no retroactive child support is owed by either party, and each party releases the other from any claim for retroactive child support up to the date of this Agreement.</p>`
  } else if (periods.length > 0) {
    const totals = aggregateRetroactiveTotals(periods)
    const owingName = totals.netDirection === 'party1_owes_party2' ? party1 : party2
    const receiveName = totals.netDirection === 'party1_owes_party2' ? party2 : party1
    retroHtml = `<h3>Retroactive Child Support</h3>
      <p>The parties have reviewed past periods and agreed that ${owingName} owes ${receiveName} retroactive child support in the net amount of <strong>${fmtCAD(totals.netAmount)}</strong>, as detailed in Schedule A.</p>`
  }

  // Retroactive section 7 expenses
  if (retroExpenses.length > 0) {
    retroHtml += `<h3>Past Section 7 Expenses</h3>
      <p>The parties have reviewed past special expenses. The contributions owing are as set out in Schedule A.</p>`
  }

  return `
    <h2>Section 3 — Child Support</h2>
    ${monthlyHtml}
    ${s7Html}
    ${retroHtml}
    <h3>Annual Income Disclosure</h3>
    <p>Each party shall provide the other, on or before June 1st of each year, a copy of their most recent Notice of Assessment and T1 General Income Tax Return so that child support and section 7 contributions may be reviewed and adjusted if necessary.</p>
  `
}

function renderSpousalSupport(bundle) {
  const sc = bundle.supportCalculations || {}
  if (!sc.spousal_support_payor) return ''

  const { party1, party2 } = getNamesForBundle(bundle)
  const payor = sc.spousal_support_payor === 'party1' ? party1 : (sc.spousal_support_payor === 'party2' ? party2 : null)
  const recipient = sc.spousal_support_payor === 'party1' ? party2 : (sc.spousal_support_payor === 'party2' ? party1 : null)
  const tplKey = sc.spousal_support_template
  const tpl = tplKey ? SPOUSAL_SUPPORT_TEMPLATES[tplKey] : null

  let body = ''
  if (sc.spousal_support_payor === 'none' || tplKey === 'complete_release') {
    body = `<p>${SPOUSAL_SUPPORT_TEMPLATES.complete_release.template({ party1, party2 })}</p>`
  } else if (tpl) {
    body = `<p>${tpl.template({
      ...(sc.spousal_support_variables || {}),
      amount: sc.spousal_support_amount,
      party1, party2,
      payorName: payor, recipientName: recipient,
    })}</p>`
  } else if (Number(sc.spousal_support_amount) > 0 && payor && recipient) {
    body = `<p>${payor} shall pay ${recipient} spousal support of ${fmtCAD(sc.spousal_support_amount)} per month, on the first day of each month, commencing on the first day of the month following the execution of this Agreement.</p>`
  }

  // Termination triggers
  let termHtml = ''
  const triggers = sc.spousal_support_termination_triggers || []
  if (triggers.length > 0 && tplKey !== 'complete_release' && sc.spousal_support_payor !== 'none') {
    termHtml = `<h3>Termination</h3>
      <p>Spousal support shall terminate upon the earliest occurrence of:</p>
      <ul>${triggers.map((t) => `<li>${SPOUSAL_TERMINATION_TRIGGERS[t] || t}</li>`).join('')}</ul>`
  }

  // Tax note
  const taxNote = (sc.spousal_support_payor !== 'none' && tplKey !== 'complete_release')
    ? `<p><em>The parties acknowledge that spousal support payments are deductible to the payor and included in the income of the recipient under the Income Tax Act (Canada).</em></p>`
    : ''

  return `
    <h2>Section 4 — Spousal Support</h2>
    ${body}
    ${termHtml}
    ${taxNote}
  `
}

function renderProperty(bundle) {
  const a = bundle.agreement
  if (a.agreement_type === 'prenup' || a.agreement_type === 'cohabitation') return ''

  const items = bundle.propertyItems || []
  const division = bundle.propertyDivisionTerms || {}
  const { party1, party2 } = getNamesForBundle(bundle)
  const { amount: calcEq, payor: calcPayor } = equalizationFromItems(items)
  const effectiveAmount = division.custom_equalization_amount != null
    ? Number(division.custom_equalization_amount) : calcEq
  const payorName = calcPayor === 'party1' ? party1 : (calcPayor === 'party2' ? party2 : null)
  const recipientName = calcPayor === 'party1' ? party2 : (calcPayor === 'party2' ? party1 : null)
  const subCtx = { party1, party2, payorName, recipientName, amount: effectiveAmount }

  let eqHtml = ''
  if (effectiveAmount > 0 && payorName) {
    const tpl = EQUALIZATION_PAYMENT_TEMPLATES[division.equalization_payment_method]
    eqHtml = tpl ? tpl.template({ ...(division.equalization_variables || {}), ...subCtx, monthly_amount: division.equalization_variables?.monthly_amount, num_months: division.equalization_variables?.num_months, start_date: division.equalization_variables?.start_date, due_date: division.equalization_variables?.due_date }) :
      `${payorName} shall pay ${recipientName} the equalization payment of ${fmtCAD(effectiveAmount)} on terms agreed between the parties.`
  }

  let homeHtml = ''
  if (division.matrimonial_home_disposition) {
    const tpl = MATRIMONIAL_HOME_TEMPLATES[division.matrimonial_home_disposition]
    if (tpl) homeHtml = `<h3>Matrimonial Home</h3><p>${tpl.template({ ...(division.matrimonial_home_variables || {}), ...subCtx })}</p>`
  }

  let pensionHtml = ''
  if (division.pension_division_method) {
    const tpl = PENSION_DIVISION_TEMPLATES[division.pension_division_method]
    if (tpl) pensionHtml = `<h3>Pension Division</h3><p>${tpl.template({ ...(division.pension_variables || {}), ...subCtx })}</p>`
  }

  let vehicleHtml = ''
  const transfers = Array.isArray(division.vehicle_transfers) ? division.vehicle_transfers : []
  if (transfers.length > 0) {
    vehicleHtml = `<h3>Vehicles</h3><ul>${transfers.map((t) => {
      const fromName = t.from === 'party2' ? party2 : party1
      const toName = t.to === 'party2' ? party2 : party1
      return `<li>${fromName} shall transfer the ${t.description || 'vehicle'} to ${toName}${t.payment_amount > 0 ? ` for consideration of ${fmtCAD(t.payment_amount)}` : ''}.</li>`
    }).join('')}</ul>`
  }

  let bankRrspHtml = ''
  if (division.rrsp_division_deadline || division.bank_account_closure_date) {
    bankRrspHtml = `<h3>RRSPs, TFSAs &amp; Bank Accounts</h3><ul>`
    if (division.rrsp_division_deadline) {
      bankRrspHtml += `<li>RRSP/TFSA division shall be completed on or before ${fmtLegalDate(division.rrsp_division_deadline)}.</li>`
    }
    if (division.bank_account_closure_date) {
      bankRrspHtml += `<li>Joint bank accounts shall be closed or reorganized on or before ${fmtLegalDate(division.bank_account_closure_date)}.</li>`
    }
    bankRrspHtml += '</ul>'
  }

  return `
    <h2>Section 5 — Property Division and Equalization</h2>
    <h3>Net Family Property and Equalization</h3>
    <p>The parties have exchanged itemized statements of their assets, debts, and exclusions as detailed in Schedule A. Based on those calculations:</p>
    ${effectiveAmount > 0 && payorName ? `<p><strong>${payorName}</strong> shall pay <strong>${recipientName}</strong> an equalization payment of <strong>${fmtCAD(effectiveAmount)}</strong>.</p>${eqHtml ? `<p>${eqHtml}</p>` : ''}` : '<p>The parties&rsquo; Net Family Property values are equal, and no equalization payment is owing.</p>'}
    ${division.custom_equalization_notes ? `<p><em>${division.custom_equalization_notes}</em></p>` : ''}

    ${homeHtml}
    ${pensionHtml}
    ${vehicleHtml}
    ${bankRrspHtml}

    <h3>Other Property</h3>
    <p>Each party shall retain full ownership of all property registered in their own name, except as otherwise specified in this Agreement or Schedule A.</p>
  `
}

function renderGeneralProvisions(bundle) {
  const t = bundle.additionalTerms || {}
  const { party1, party2 } = getNamesForBundle(bundle)

  // Determine insured name from variables
  const insurancePartyValue = t.insurance_variables?.insured_party
  const insuredName = insurancePartyValue === 'party2' ? party2 : (insurancePartyValue === 'party1' ? party1 : null)

  let insuranceHtml = ''
  if (t.insurance_template && insuredName) {
    const tpl = LIFE_INSURANCE_TEMPLATES[t.insurance_template]
    if (tpl) {
      insuranceHtml = `<h3>Life Insurance</h3><p>${tpl.template({ ...(t.insurance_variables || {}), insuredName, party1, party2 })}</p>`
    }
  }

  let disclosureHtml = ''
  if (t.disclosure_template) {
    const tpl = DISCLOSURE_TEMPLATES[t.disclosure_template]
    if (tpl) {
      disclosureHtml = `<h3>Financial Disclosure</h3><p>${tpl.template({ ...(t.disclosure_variables || {}) })}</p>`
    }
  }

  let taxHtml = ''
  if (t.tax_template) {
    const tpl = TAX_PROVISION_TEMPLATES[t.tax_template]
    if (tpl) {
      const ccbName = t.tax_variables?.ccb_party === 'party2' ? party2 : party1
      const firstName = t.tax_variables?.first_year_party === 'party2' ? party2 : party1
      taxHtml = `<h3>Canada Child Benefit &amp; Tax Credits</h3><p>${tpl.template({ ...(t.tax_variables || {}), ccbPartyName: ccbName, firstYearPartyName: firstName, party1, party2 })}</p>`
    }
  }

  let disputeHtml = ''
  if (t.dispute_template) {
    const tpl = DISPUTE_RESOLUTION_TEMPLATES[t.dispute_template]
    if (tpl) {
      disputeHtml = `<h3>Dispute Resolution</h3><p>${tpl.template({ ...(t.dispute_variables || {}) })}</p>`
    }
  }

  return `
    <h2>Section 6 — General Provisions</h2>
    ${insuranceHtml}
    ${disclosureHtml}
    ${taxHtml}
    ${disputeHtml}

    <h3>Independent Legal Advice</h3>
    <p>Each party acknowledges that they have had the opportunity to obtain independent legal advice from a lawyer of their own choosing regarding this Agreement.</p>

    <h3>Entire Agreement</h3>
    <p>This Agreement, including all schedules, constitutes the entire agreement between the parties with respect to its subject matter. It supersedes all prior negotiations, representations, and agreements.</p>

    <h3>Governing Law</h3>
    <p>This Agreement shall be governed by and construed in accordance with the laws of the Province of Ontario and the laws of Canada applicable therein.</p>

    <h3>Severability</h3>
    <p>If any provision of this Agreement is held invalid or unenforceable, the remainder shall continue in full force and effect.</p>

    <h3>Amendments</h3>
    <p>No amendment to this Agreement shall be binding unless made in writing and signed by both parties.</p>
  `
}

function renderSignatureBlock(bundle) {
  const a = bundle.agreement
  const { party1, party2 } = getNamesForBundle(bundle)
  const sig1Html = a.party1_signature
    ? `<img src="${a.party1_signature}" alt="signature" style="max-height:40pt;max-width:200pt;"/>`
    : `<div class="sig-line"></div>`
  const sig2Html = a.party2_signature
    ? `<img src="${a.party2_signature}" alt="signature" style="max-height:40pt;max-width:200pt;"/>`
    : `<div class="sig-line"></div>`

  return `
    <h2>Signatures</h2>
    <p><strong>IN WITNESS WHEREOF</strong> the parties have signed this Agreement.</p>
    <p>SIGNED, SEALED AND DELIVERED in the presence of:</p>
    <table class="sig-table">
      <tr>
        <td style="width:50%;">
          ${sig1Html}
          <div style="border-top:1pt solid #000; padding-top:3pt;"><strong>${party1}</strong></div>
          <div style="font-size:9pt; color:#555;">Date: ${a.party1_signed_at ? fmtLegalDate(a.party1_signed_at) : '__________'}</div>
        </td>
        <td style="width:50%;">
          ${sig2Html}
          <div style="border-top:1pt solid #000; padding-top:3pt;"><strong>${party2}</strong></div>
          <div style="font-size:9pt; color:#555;">Date: ${a.party2_signed_at ? fmtLegalDate(a.party2_signed_at) : '__________'}</div>
        </td>
      </tr>
      <tr>
        <td style="padding-top:24pt;">
          <div class="sig-line"></div>
          <div><strong>Witness for Party 1</strong></div>
          <div style="font-size:9pt;">Name: __________________________</div>
          <div style="font-size:9pt;">Address: __________________________</div>
        </td>
        <td style="padding-top:24pt;">
          <div class="sig-line"></div>
          <div><strong>Witness for Party 2</strong></div>
          <div style="font-size:9pt;">Name: __________________________</div>
          <div style="font-size:9pt;">Address: __________________________</div>
        </td>
      </tr>
    </table>
  `
}

// =============================================================================
// Schedules
// =============================================================================

export function renderScheduleA_NFP(bundle) {
  const items = bundle.propertyItems || []
  const { party1, party2 } = getNamesForBundle(bundle)
  const p1 = calculateNFPFromItems(items, 'party1')
  const p2 = calculateNFPFromItems(items, 'party2')
  const eq = equalizationFromItems(items)
  const payorName = eq.payor === 'party1' ? party1 : (eq.payor === 'party2' ? party2 : null)
  const recipientName = eq.payor === 'party1' ? party2 : (eq.payor === 'party2' ? party1 : null)

  const renderItemsTable = (party, name) => {
    const owned = items.filter((i) => i.owner === party)
    if (owned.length === 0) return `<p><em>No items owned in ${name}'s name.</em></p>`
    const rows = owned.map((i) => `
      <tr>
        <td>${i.item_type === 'debt' ? '(Debt) ' : ''}${i.category}${i.is_matrimonial_home ? ' — Matrimonial Home' : ''}</td>
        <td>${i.description || '—'}</td>
        <td style="text-align:right;">${fmtCAD(i.value_at_separation)}</td>
        <td style="text-align:right;">${i.is_matrimonial_home ? '<em>excluded</em>' : fmtCAD(i.value_at_marriage)}</td>
        <td style="text-align:right;">${i.is_excluded ? fmtCAD(i.excluded_amount) : '—'}</td>
      </tr>
    `).join('')
    return `<table>
      <thead><tr>
        <th>Category</th><th>Description</th>
        <th>Value @ Separation</th><th>Value @ Marriage</th><th>Excluded</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`
  }

  const partyBlock = (party, name, p) => `
    <h3>${name}</h3>
    ${renderItemsTable(party, name)}
    <table style="margin-top:8pt;">
      <tbody>
        <tr><td>Assets at Separation</td><td style="text-align:right;">${fmtCAD(p.assetsSep)}</td></tr>
        <tr><td>Less: Debts at Separation</td><td style="text-align:right;">−${fmtCAD(p.debtsSep)}</td></tr>
        <tr><td><strong>Net Worth at Separation</strong></td><td style="text-align:right;"><strong>${fmtCAD(p.assetsSep - p.debtsSep)}</strong></td></tr>
        <tr><td>Less: Net Worth at Marriage</td><td style="text-align:right;">−${fmtCAD(p.assetsMar - p.debtsMar)}</td></tr>
        <tr><td>Less: Excluded Property</td><td style="text-align:right;">−${fmtCAD(p.excluded)}</td></tr>
        <tr style="background:#eef0ff;"><td><strong>Net Family Property</strong></td><td style="text-align:right;"><strong>${fmtCAD(p.nfp)}</strong></td></tr>
      </tbody>
    </table>
  `

  return `
    <div class="schedule">
    <h1>Schedule A — Net Family Property Statement</h1>
    ${partyBlock('party1', party1, p1)}
    ${partyBlock('party2', party2, p2)}
    <h3>Equalization Calculation</h3>
    <table>
      <tbody>
        <tr><td>${party1} NFP</td><td style="text-align:right;">${fmtCAD(p1.nfp)}</td></tr>
        <tr><td>${party2} NFP</td><td style="text-align:right;">${fmtCAD(p2.nfp)}</td></tr>
        <tr><td>Difference</td><td style="text-align:right;">${fmtCAD(Math.abs(p1.nfp - p2.nfp))}</td></tr>
        <tr style="background:#eef0ff;"><td><strong>Equalization Payment (½ of difference)</strong></td><td style="text-align:right;"><strong>${fmtCAD(eq.amount)}</strong></td></tr>
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
  const { party1, party2 } = getNamesForBundle(bundle)

  // Render a simple 4-week schedule grid. Custom_weekly stores 4×7 grid in variables.weeks
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

  return `
    <div class="schedule">
    <h1>Schedule B — Parenting Schedule</h1>
    <p><strong>Schedule type:</strong> ${tpl?.label || sched.regular_schedule_template}</p>
    ${grid}
    <p style="font-size:9pt;"><strong>Legend:</strong> P1 = ${party1}, P2 = ${party2}, ↔ = transition day.</p>
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
    // P1: M T (0,1), P2: W Th (2,3), F S S alternate
    for (let w = 0; w < 4; w++) {
      weeks[w][1] = 'party1'; weeks[w][2] = 'party1'  // Mon, Tue
      weeks[w][3] = 'party2'; weeks[w][4] = 'party2'  // Wed, Thu
      const fri = w % 2 === 0 ? 'party1' : 'party2'
      weeks[w][5] = fri; weeks[w][6] = fri; weeks[w][0] = fri
    }
  } else if (tplKey === '5-2-2-5') {
    // 5 days party1, 2 days party2, 2 days party1, 5 days party2 — over 2 weeks repeating
    const pattern = ['party1','party1','party1','party1','party1','party2','party2', 'party1','party1','party2','party2','party2','party2','party2']
    for (let w = 0; w < 4; w++) for (let d = 0; d < 7; d++) weeks[w][d] = pattern[((w*7)+d) % 14]
  }
  return weeks
}

export function renderScheduleC_FinancialDisclosure(bundle) {
  const docs = bundle.incomeDocuments || []
  if (docs.length === 0) return ''
  const { party1, party2 } = getNamesForBundle(bundle)
  const rows = docs.map((d) => {
    const partyName = d.party === 'party1' ? party1 : party2
    const typeLabel = d.document_type === 'tax_return' ? 'T1 Tax Return' : 'Notice of Assessment'
    return `<tr><td>${partyName}</td><td>${d.tax_year}</td><td>${typeLabel}</td><td>${d.file_name || '—'}</td></tr>`
  }).join('')
  return `
    <div class="schedule">
    <h1>Schedule C — Financial Disclosure Documents</h1>
    <p>The parties have exchanged the following financial documents:</p>
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
  const { party1, party2 } = getNamesForBundle(bundle)
  const payor = sc.spousal_support_payor === 'party1' ? party1 : party2
  const recipient = sc.spousal_support_payor === 'party1' ? party2 : party1
  return `
    <div class="schedule">
    <h1>Schedule D — Spousal Support Advisory Guidelines (SSAG)</h1>
    <p>The parties acknowledge they have considered the Spousal Support Advisory Guidelines. The agreed quantum of spousal support is ${fmtCAD(sc.spousal_support_amount || 0)} per month, payable by ${payor} to ${recipient}.</p>
    <p>The parties confirm that this amount and duration are within / outside the SSAG range based on their incomes, ages, and length of relationship, and that they have considered the relevant factors in agreeing to the quantum and duration above.</p>
    ${sc.spousal_support_template ? `<p>Term structure: ${SPOUSAL_SUPPORT_TEMPLATES[sc.spousal_support_template]?.label || sc.spousal_support_template}.</p>` : ''}
    </div>
  `
}

// =============================================================================
// Public API
// =============================================================================

// Generate the full agreement HTML document (Sections 1-6 + Signatures).
export function generateFullAgreementHTML(bundle) {
  const { party1, party2 } = getNamesForBundle(bundle)
  const body = [
    renderHeader(bundle),
    renderRecitals(bundle),
    renderDefinitions(bundle),
    renderParenting(bundle),
    renderChildSupport(bundle),
    renderSpousalSupport(bundle),
    renderProperty(bundle),
    renderGeneralProvisions(bundle),
    renderSignatureBlock(bundle),
  ].filter(Boolean).join('\n')

  const footer = `CONFIDENTIAL — ${party1} and ${party2} ${AGREEMENT_TYPE_LABELS[bundle.agreement.agreement_type] || 'Agreement'}`
  return baseDocument('Agreement', body, footer)
}

// Schedules as separate documents (one per call)
export function generateScheduleHTML(bundle, scheduleKey) {
  const { party1, party2 } = getNamesForBundle(bundle)
  const footer = `CONFIDENTIAL — ${party1} and ${party2} ${AGREEMENT_TYPE_LABELS[bundle.agreement.agreement_type] || 'Agreement'}`
  let body = ''
  if (scheduleKey === 'A') body = renderScheduleA_NFP(bundle)
  else if (scheduleKey === 'B') body = renderScheduleB_Parenting(bundle)
  else if (scheduleKey === 'C') body = renderScheduleC_FinancialDisclosure(bundle)
  else if (scheduleKey === 'D') body = renderScheduleD_SSAG(bundle)
  return baseDocument(`Schedule ${scheduleKey}`, body, footer)
}

// Generate the agreement + ALL schedules in one PDF.
export function generateFullAgreementWithSchedulesHTML(bundle) {
  const { party1, party2 } = getNamesForBundle(bundle)
  const body = [
    renderHeader(bundle),
    renderRecitals(bundle),
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
  const footer = `CONFIDENTIAL — ${party1} and ${party2} ${AGREEMENT_TYPE_LABELS[bundle.agreement.agreement_type] || 'Agreement'}`
  return baseDocument('Agreement with Schedules', body, footer)
}

// Backwards-compat wrapper for legacy detail page (interview_data JSON shape).
// No longer used by the new editor, but kept for any straggling callers.
export const generateAgreementHTML = (agreementType, interviewData) => {
  return `<html><body><p>Legacy format — open via the tabbed editor instead.</p></body></html>`
}

export const generatePreviewText = () => ''
