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

  /* Schedule break — each schedule starts on a fresh page in PDF.
     Padding-top removed since the new page already provides whitespace,
     and any extra height risks pushing the title onto the next page. */
  .schedule { page-break-before: always; break-before: page; }
  /* Keep important blocks together — avoid splitting them across pages */
  .calc-box,
  .eq-card,
  .warning-callout,
  .declaration,
  .party-bar-lilac,
  .party-bar-green,
  .sig-grid,
  .notice,
  .sched-title + .sched-subtitle,
  table tr {
    page-break-inside: avoid;
    break-inside: avoid;
  }
  /* Headings should stick with the content that follows them */
  h1.section, h2.subsection, h3.subsubsection,
  .sched-title, .sched-subtitle, .doc-group-title, .assets-heading {
    page-break-after: avoid;
    break-after: avoid;
  }

  /* Schedule title block (replaces the section-style heading inside schedules) */
  .sched-title {
    text-align: center;
    font-size: 18pt;
    font-weight: 700;
    color: ${LILAC};
    margin-top: 12pt;
    margin-bottom: 4pt;
    letter-spacing: 0.04em;
  }
  .sched-subtitle {
    text-align: center;
    font-size: 13pt;
    font-weight: 700;
    margin-top: 0;
    margin-bottom: 10pt;
    color: ${TEXT};
    letter-spacing: 0.02em;
  }
  .sched-intro {
    text-align: center;
    font-style: italic;
    color: ${TEXT_MUTED};
    font-size: 10pt;
    margin-bottom: 14pt;
  }
  .sched-footer {
    text-align: center;
    color: ${TEXT_MUTED};
    font-size: 9pt;
    font-style: italic;
    margin-top: 18pt;
  }

  /* Per-party header bar — lilac for party 1, green for party 2 */
  .party-bar-lilac {
    background: ${LILAC_LIGHT};
    border-left: 4pt solid ${LILAC};
    color: ${LILAC_DARK};
    font-weight: 700;
    padding: 10pt 14pt;
    border-radius: 4pt;
    margin-top: 14pt;
    margin-bottom: 10pt;
    text-transform: uppercase;
    font-size: 11pt;
    letter-spacing: 0.04em;
  }
  .party-bar-green {
    background: #E7FAF1;
    border-left: 4pt solid #1A8F62;
    color: #146E4C;
    font-weight: 700;
    padding: 10pt 14pt;
    border-radius: 4pt;
    margin-top: 14pt;
    margin-bottom: 10pt;
    text-transform: uppercase;
    font-size: 11pt;
    letter-spacing: 0.04em;
  }

  /* Asset section heading inside a party block */
  .assets-heading {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    margin: 12pt 0 6pt;
    color: ${TEXT};
    letter-spacing: 0.04em;
  }

  /* Pill tags inline with descriptions */
  .tag-excluded {
    display: inline-block;
    color: #7B4F9E;
    font-size: 8.5pt;
    font-weight: 600;
    margin-left: 4pt;
  }
  .tag-mhome {
    display: inline-block;
    color: #B07A1A;
    font-size: 8.5pt;
    font-weight: 600;
    margin-left: 4pt;
  }

  /* Yellow warning callout */
  .warning-callout {
    background: #FFF8E1;
    border: 1pt solid #F0A500;
    border-radius: 6pt;
    padding: 12pt 16pt;
    margin: 14pt 0;
    font-size: 10pt;
    color: #8A6A00;
  }
  .warning-callout .title {
    display: flex;
    align-items: center;
    gap: 6pt;
    font-weight: 700;
    margin-bottom: 4pt;
    color: #8A6A00;
  }
  .warning-callout .title::before { content: "⚠"; font-size: 12pt; }

  /* Dark-filled calculation summary box */
  .calc-box {
    border-radius: 6pt;
    padding: 14pt 18pt;
    margin: 8pt 0 16pt;
    color: #fff;
  }
  .calc-box.lilac { background: #2A2080; }
  .calc-box.green { background: #1F5A3F; }
  .calc-box .title {
    font-size: 10pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.05em;
    margin-bottom: 8pt;
    color: rgba(255,255,255,0.95);
  }
  .calc-box .row {
    display: flex; justify-content: space-between;
    font-size: 9.5pt;
    padding: 2pt 0;
    color: rgba(255,255,255,0.92);
  }
  .calc-box .row.divider {
    border-top: 1pt solid rgba(255,255,255,0.25);
    margin-top: 6pt; padding-top: 6pt;
  }
  .calc-box .row.total {
    font-size: 12pt;
    font-weight: 700;
    color: #fff;
    margin-top: 4pt;
  }

  /* Equalization Payment Summary card */
  .eq-card {
    background: linear-gradient(135deg, ${LILAC} 0%, ${LILAC_DARK} 100%);
    color: #fff;
    border-radius: 8pt;
    padding: 22pt 24pt;
    margin-top: 22pt;
  }
  .eq-card .title {
    text-align: center;
    font-size: 13pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: 16pt;
  }
  .eq-card .row {
    display: flex; justify-content: space-between;
    padding: 4pt 0;
    font-size: 10.5pt;
  }
  .eq-card .row.bold { font-weight: 700; font-size: 12pt; }
  .eq-card .row.divider { border-top: 1pt solid rgba(255,255,255,0.35); margin-top: 6pt; padding-top: 6pt; }
  .eq-card .agreed-inset {
    background: rgba(255,255,255,0.08);
    border: 1pt solid rgba(255,210,90,0.6);
    border-radius: 6pt;
    padding: 12pt 14pt;
    margin-top: 14pt;
    text-align: center;
  }
  .eq-card .agreed-inset .label {
    color: #FFD25A;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.06em;
    font-size: 9.5pt;
    margin-bottom: 6pt;
  }
  .eq-card .agreed-inset .body {
    color: #fff;
    font-size: 10pt;
    line-height: 1.5;
  }

  /* Declaration box */
  .declaration {
    background: #F8F8FC;
    border: 1pt solid ${BORDER};
    border-radius: 6pt;
    padding: 14pt 16pt;
    margin-top: 22pt;
    font-size: 9.5pt;
    color: ${TEXT};
  }
  .declaration .title { font-weight: 700; margin-bottom: 6pt; }

  /* Schedule B calendar */
  .schedb-calendar { width: 100%; border-collapse: separate; border-spacing: 0; margin: 8pt 0; }
  .schedb-calendar thead th {
    background: ${LILAC};
    color: #fff;
    font-weight: 700;
    padding: 8pt 4pt;
    text-align: center;
    font-size: 10pt;
    text-transform: uppercase;
    border: 1pt solid ${LILAC_DARK};
  }
  .schedb-calendar td {
    height: 56pt;
    width: 14.28%;
    text-align: center;
    vertical-align: top;
    padding: 6pt 4pt;
    border: 1pt solid ${BORDER};
    background: #fff;
    font-size: 9pt;
    position: relative;
  }
  .schedb-calendar td.p1 { background: #DDE4FA; color: ${TEXT}; }
  .schedb-calendar td.p2 { background: #DCF5E8; color: ${TEXT}; }
  .schedb-calendar td.t  { background: linear-gradient(180deg, #DDE4FA 50%, #DCF5E8 50%); }
  .schedb-calendar td .date { font-size: 8pt; color: ${TEXT_MUTED}; }
  .schedb-calendar td .who { font-size: 10pt; font-weight: 700; margin-top: 8pt; }
  .schedb-calendar td.transition-day::after {
    content: ""; position: absolute; left: 6pt; right: 6pt; top: 18pt;
    height: 2pt; background: #F0A500; border-radius: 1pt;
  }

  .legend {
    display: flex; justify-content: center; gap: 18pt;
    margin-top: 10pt; font-size: 9pt; color: ${TEXT};
  }
  .legend .swatch { display: inline-block; width: 14pt; height: 14pt; border-radius: 3pt; margin-right: 5pt; vertical-align: middle; }
  .legend .swatch.p1 { background: #DDE4FA; border: 1pt solid ${LILAC}; }
  .legend .swatch.p2 { background: #DCF5E8; border: 1pt solid #1A8F62; }
  .legend .swatch.t  { background: #F0A500; height: 4pt; margin-bottom: 4pt; }

  /* Schedule C document groups */
  .doc-group-title {
    color: ${LILAC};
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.04em;
    font-size: 10pt;
    margin-top: 16pt;
    margin-bottom: 6pt;
  }
  .doc-list { padding-left: 22pt; margin: 0; }
  .doc-list li { margin: 4pt 0; font-size: 10pt; }
  .doc-list li .label { font-weight: 600; color: ${TEXT}; }
  .doc-list li .file { color: ${TEXT_MUTED}; }

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
  const division = bundle.propertyDivisionTerms || {}
  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const p1 = calculateNFPFromItems(items, 'party1')
  const p2 = calculateNFPFromItems(items, 'party2')
  const eq = equalizationFromItems(items)
  const payorName = eq.payor === 'party1' ? party1Full : (eq.payor === 'party2' ? party2Full : null)
  const recipientName = eq.payor === 'party1' ? party2Full : (eq.payor === 'party2' ? party1Full : null)

  // Custom (agreed) equalization amount, if user overrode the calculated one
  const calcEq = eq.amount
  const agreedEq = division.custom_equalization_amount != null ? Number(division.custom_equalization_amount) : null
  const hasAgreedOverride = agreedEq != null && Math.round(agreedEq * 100) !== Math.round(calcEq * 100)

  // Joint items are counted at half value for each party in the summary cards
  const jointAssets = items.filter((i) => i.owner === 'joint' && i.item_type === 'asset')
    .reduce((s, i) => s + (parseFloat(i.value_at_separation) || 0), 0)
  const jointDebts = items.filter((i) => i.owner === 'joint' && i.item_type === 'debt')
    .reduce((s, i) => s + (parseFloat(i.value_at_separation) || 0), 0)

  const totalAssetsForParty = (party) => {
    const own = items.filter((i) => i.owner === party && i.item_type === 'asset')
      .reduce((s, i) => s + (parseFloat(i.value_at_separation) || 0), 0)
    return own + jointAssets / 2
  }
  const totalDebtsForParty = (party) => {
    const own = items.filter((i) => i.owner === party && i.item_type === 'debt')
      .reduce((s, i) => s + (parseFloat(i.value_at_separation) || 0), 0)
    return own + jointDebts / 2
  }
  const valueAtMarriageForParty = (party) => {
    // Sum value_at_marriage for assets (excluding matrimonial home which is excluded at marriage)
    // less debts at marriage
    const own = items.filter((i) => i.owner === party)
    let assetsM = 0, debtsM = 0
    for (const i of own) {
      const v = parseFloat(i.value_at_marriage) || 0
      if (i.item_type === 'asset' && !i.is_matrimonial_home) assetsM += v
      else if (i.item_type === 'debt') debtsM += v
    }
    return Math.max(0, assetsM - debtsM)
  }

  const totalDebts = items.filter((i) => i.item_type === 'debt').length
  const noDebtsWarning = totalDebts === 0 ? `
    <div class="warning-callout">
      <div class="title">Incomplete Property Disclosure</div>
      No debts have been listed. While possible, it is uncommon for parties to have no debts whatsoever.
      Please ensure all assets and debts have been properly disclosed.
    </div>
  ` : ''

  const renderAssetsTable = (party) => {
    const own = items.filter((i) => (i.owner === party || i.owner === 'joint') && i.item_type === 'asset')
    if (own.length === 0) {
      return `<p style="color:${TEXT_MUTED}; font-style:italic; font-size:10pt;">No assets disclosed.</p>`
    }
    const rows = own.map((i) => `
      <tr>
        <td>${i.description || '—'}${i.is_excluded ? '<span class="tag-excluded">(Excluded Property)</span>' : ''}${i.is_matrimonial_home ? '<span class="tag-mhome">(Matrimonial Home)</span>' : ''}</td>
        <td class="right">${i.is_matrimonial_home ? fmtCAD(0) : fmtCAD(i.value_at_marriage)}</td>
        <td class="right">${fmtCAD(i.value_at_separation)}</td>
      </tr>
    `).join('')
    const totalMar = own.reduce((s, i) => s + (i.is_matrimonial_home ? 0 : (parseFloat(i.value_at_marriage) || 0)), 0)
    const totalSep = own.reduce((s, i) => s + (parseFloat(i.value_at_separation) || 0), 0)
    return `
      <table>
        <thead><tr>
          <th>Description</th>
          <th class="right">Value at Marriage</th>
          <th class="right">Value at Separation</th>
        </tr></thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td>Total Assets</td>
            <td class="right">${fmtCAD(totalMar)}</td>
            <td class="right">${fmtCAD(totalSep)}</td>
          </tr>
        </tbody>
      </table>
    `
  }

  const renderDebtsTable = (party) => {
    const own = items.filter((i) => (i.owner === party || i.owner === 'joint') && i.item_type === 'debt')
    if (own.length === 0) return ''
    const rows = own.map((i) => `
      <tr>
        <td>${i.description || '—'}</td>
        <td class="right">${fmtCAD(i.value_at_marriage)}</td>
        <td class="right">${fmtCAD(i.value_at_separation)}</td>
      </tr>
    `).join('')
    const totalMar = own.reduce((s, i) => s + (parseFloat(i.value_at_marriage) || 0), 0)
    const totalSep = own.reduce((s, i) => s + (parseFloat(i.value_at_separation) || 0), 0)
    return `
      <div class="assets-heading">Debts at Date of Separation</div>
      <table>
        <thead><tr>
          <th>Description</th>
          <th class="right">Value at Marriage</th>
          <th class="right">Value at Separation</th>
        </tr></thead>
        <tbody>
          ${rows}
          <tr class="total-row">
            <td>Total Debts</td>
            <td class="right">${fmtCAD(totalMar)}</td>
            <td class="right">${fmtCAD(totalSep)}</td>
          </tr>
        </tbody>
      </table>
    `
  }

  const partyBlock = (party, name, p, accent) => {
    const totalAssets = totalAssetsForParty(party)
    const totalDebtsAtSep = totalDebtsForParty(party)
    const netWorthSep = totalAssets - totalDebtsAtSep
    const netWorthMar = valueAtMarriageForParty(party)
    const excluded = p.excluded
    const nfp = Math.max(0, netWorthSep - netWorthMar - excluded)
    return `
      <div class="party-bar-${accent}">Net Family Property Statement for ${name}</div>
      <div class="assets-heading">Assets at Date of Separation</div>
      ${renderAssetsTable(party)}
      ${renderDebtsTable(party)}
      <div class="calc-box ${accent}">
        <div class="title">Net Family Property Calculation</div>
        <div class="row"><span>Net Worth at Separation (Assets − Debts):</span><span>${fmtCAD(netWorthSep)}</span></div>
        <div class="row"><span>Less: Net Worth at Date of Marriage:</span><span>(${fmtCAD(netWorthMar)})</span></div>
        ${excluded > 0 ? `<div class="row"><span>Less: Excluded Property:</span><span>(${fmtCAD(excluded)})</span></div>` : ''}
        <div class="row total divider"><span>NET FAMILY PROPERTY:</span><span>${fmtCAD(nfp)}</span></div>
      </div>
    `
  }

  // Equalization Payment Summary card
  const eqCard = `
    <div class="eq-card">
      <div class="title">Equalization Payment Summary</div>
      <div class="row"><span>${party1Full}'s Net Family Property:</span><span>${fmtCAD(p1.nfp)}</span></div>
      <div class="row"><span>${party2Full}'s Net Family Property:</span><span>${fmtCAD(p2.nfp)}</span></div>
      <div class="row bold divider"><span>Calculated Equalization Payment:</span><span>${fmtCAD(calcEq)}</span></div>
      ${hasAgreedOverride ? `
        <div class="agreed-inset">
          <div class="label">Agreed Equalization Payment</div>
          <div class="body">Despite the Equalization Calculation being <strong>${fmtCAD(calcEq)}</strong>, the parties have agreed that <strong>${payorName || 'the payor'}</strong> shall pay to <strong>${recipientName || 'the recipient'}</strong> the sum of <strong>${fmtCAD(agreedEq)}</strong>.${division.custom_equalization_notes ? `<br/><br/><em>${division.custom_equalization_notes}</em>` : ''}
          </div>
        </div>
      ` : (payorName ? `
        <div style="text-align:center; margin-top: 14pt; font-size: 10.5pt;">
          <strong>${payorName}</strong> shall pay <strong>${recipientName}</strong> an equalization payment of <strong>${fmtCAD(calcEq)}</strong>.
        </div>
      ` : `
        <div style="text-align:center; margin-top: 14pt; font-size: 10.5pt;">
          The parties' Net Family Property values are equal — no equalization payment is owing.
        </div>
      `)}
    </div>
  `

  return `
    <div class="schedule">
      <div class="sched-title">SCHEDULE &ldquo;A&rdquo;</div>
      <div class="sched-subtitle">NET FAMILY PROPERTY STATEMENT</div>
      <p class="sched-intro">As required under the Family Law Act (Ontario), the parties have prepared the following Net Family Property Statements showing their respective assets, debts, and excluded property.</p>
      ${noDebtsWarning}
      ${partyBlock('party1', party1Full, p1, 'lilac')}
      ${partyBlock('party2', party2Full, p2, 'green')}
      ${eqCard}
      <div class="declaration">
        <div class="title">Declaration:</div>
        We, ${party1Full} and ${party2Full}, declare that the information contained in this Net Family Property Statement is true, complete, and accurate to the best of our knowledge. We understand that this statement is prepared for the purposes of negotiating and finalizing our separation agreement, and that any material misrepresentation may render the agreement voidable.
      </div>
    </div>
  `
}

export function renderScheduleB_Parenting(bundle) {
  const sched = bundle.parentingSchedule
  if (!sched?.regular_schedule_template) return ''
  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const agreement = bundle.agreement

  const weeks = sched.regular_schedule_variables?.weeks
    || generateDefaultGrid(sched.regular_schedule_template, sched.regular_schedule_variables)

  // Determine starting Sunday for the 4-week calendar.
  // The schedule grid is indexed Sun=0..Sat=6. We want to start at the next
  // Sunday on or after separation_date (or today if no separation date).
  const startBase = agreement?.separation_date ? new Date(agreement.separation_date) : new Date()
  const startSunday = new Date(startBase)
  // Move forward to the next Sunday
  const dow = startSunday.getDay()
  if (dow !== 0) startSunday.setDate(startSunday.getDate() + (7 - dow))

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat']

  const partyFirstName = (full) => (full || '').split(' ')[0]
  const p1First = partyFirstName(party1Full)
  const p2First = partyFirstName(party2Full)

  let grid = `<table class="schedb-calendar">
    <thead><tr>${days.map((d) => `<th>${d}</th>`).join('')}</tr></thead><tbody>`

  for (let w = 0; w < 4; w++) {
    grid += `<tr>`
    for (let d = 0; d < 7; d++) {
      const cellDate = new Date(startSunday)
      cellDate.setDate(startSunday.getDate() + w * 7 + d)
      const dateStr = `${cellDate.getMonth() + 1}/${cellDate.getDate()}`
      const val = weeks[w][d]
      const cls = val === 'party1' ? 'p1' : val === 'party2' ? 'p2' : val === 'transition' ? 't transition-day' : ''
      const who = val === 'party1' ? p1First : val === 'party2' ? p2First : (val === 'transition' ? '↔' : '—')
      grid += `<td class="${cls}">
        <div class="date">${dateStr}</div>
        <div class="who">${who}</div>
      </td>`
    }
    grid += `</tr>`
  }
  grid += `</tbody></table>`

  // Format starting date as "Monday, Month D, YYYY" (calendar shows Monday as the "starting" day)
  const startingMonday = new Date(startSunday)
  startingMonday.setDate(startSunday.getDate() + 1)
  const startingMondayStr = startingMonday.toLocaleDateString('en-CA', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  })

  const signingDate = agreement?.separation_date || new Date().toISOString().split('T')[0]
  const signingDateStr = new Date(signingDate).toLocaleDateString('en-CA', {
    year: 'numeric', month: 'long', day: 'numeric',
  })

  return `
    <div class="schedule">
      <div class="sched-title">SCHEDULE &ldquo;B&rdquo;</div>
      <div class="sched-subtitle">4-WEEK PARENTING SCHEDULE</div>
      <p class="sched-intro">Starting: ${startingMondayStr}</p>
      ${grid}
      <div class="legend">
        <span><span class="swatch p1"></span>${party1Full}</span>
        <span><span class="swatch p2"></span>${party2Full}</span>
        <span><span class="swatch t"></span>Transition Day</span>
      </div>
      <div class="warning-callout" style="margin-top:18pt;">
        <div class="title">Important Notes:</div>
        <ul style="margin: 4pt 0 0 18pt; padding: 0; color: #6A4F00;">
          <li>This schedule repeats on a 2-week cycle</li>
          <li>Holiday schedules override this regular schedule when applicable</li>
          <li>Exchange times and locations as specified in the agreement must be followed</li>
          <li>Both parents should communicate about any necessary schedule changes in advance</li>
          <li>Refer to Section 3 of the agreement for holiday and special occasion arrangements</li>
        </ul>
      </div>
      <p class="sched-footer">This schedule is attached to and forms part of the Separation Agreement dated ${signingDateStr}</p>
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
  const incomeDocs = bundle.incomeDocuments || []
  const items = bundle.propertyItems || []
  const { party1Full, party2Full } = getNamesForBundle(bundle)

  // Property valuation docs (items with a document_url attached)
  const propertyDocs = items.filter((i) => i.document_url)

  if (incomeDocs.length === 0 && propertyDocs.length === 0) return ''

  const stripFilename = (url) => {
    if (!url) return ''
    const parts = url.split('/')
    const last = parts[parts.length - 1] || ''
    return last.replace(/^\d+-/, '') // strip timestamp prefix
  }

  // Property valuation docs grouped
  let propertyDocsHtml = ''
  if (propertyDocs.length > 0) {
    propertyDocsHtml = `
      <div class="doc-group-title">Property Valuation Documentation</div>
      <ol class="doc-list">
        ${propertyDocs.map((i) => `
          <li>
            <span class="label">${i.description || i.category} — Proof of Value:</span>
            <span class="file"> ${stripFilename(i.document_url)}</span>
          </li>
        `).join('')}
      </ol>
    `
  }

  // Income docs grouped per party
  let incomeDocsHtml = ''
  if (incomeDocs.length > 0) {
    const byParty = { party1: [], party2: [] }
    for (const d of incomeDocs) byParty[d.party]?.push(d)

    const partySection = (party, name) => {
      const ds = byParty[party] || []
      if (ds.length === 0) return ''
      return `
        <div class="doc-group-title">Income Documentation — ${name}</div>
        <ol class="doc-list">
          ${ds.map((d) => `
            <li>
              <span class="label">${d.tax_year} ${d.document_type === 'tax_return' ? 'T1 General Tax Return' : 'Notice of Assessment'}:</span>
              <span class="file"> ${d.file_name || stripFilename(d.file_url)}</span>
            </li>
          `).join('')}
        </ol>
      `
    }

    incomeDocsHtml = `
      ${partySection('party1', party1Full)}
      ${partySection('party2', party2Full)}
    `
  }

  return `
    <div class="schedule">
      <div class="sched-title">SCHEDULE &ldquo;C&rdquo;</div>
      <div class="sched-subtitle">DISCLOSURE OF DOCUMENTS</div>
      <p class="sched-intro">The following documents were provided by the parties in connection with the preparation of this Agreement:</p>
      ${propertyDocsHtml}
      ${incomeDocsHtml}
    </div>
  `
}

export function renderScheduleD_SSAG(bundle) {
  const sc = bundle.supportCalculations || {}
  if (!sc.spousal_support_payor || sc.spousal_support_payor === 'none') return ''
  const { party1Full, party2Full } = getNamesForBundle(bundle)
  const payor = sc.spousal_support_payor === 'party1' ? party1Full : party2Full
  const recipient = sc.spousal_support_payor === 'party1' ? party2Full : party1Full
  const termLabel = sc.spousal_support_template ? (SPOUSAL_SUPPORT_TEMPLATES[sc.spousal_support_template]?.label || sc.spousal_support_template) : null
  return `
    <div class="schedule">
      <div class="sched-title">SCHEDULE &ldquo;D&rdquo;</div>
      <div class="sched-subtitle">SPOUSAL SUPPORT ADVISORY GUIDELINES (SSAG)</div>
      <p class="sched-intro">The parties acknowledge they have considered the Spousal Support Advisory Guidelines when agreeing on the quantum and duration of spousal support.</p>
      <div class="calc-box lilac">
        <div class="title">Agreed Spousal Support</div>
        <div class="row"><span>Payor:</span><span>${payor}</span></div>
        <div class="row"><span>Recipient:</span><span>${recipient}</span></div>
        <div class="row"><span>Monthly Amount:</span><span>${fmtCAD(sc.spousal_support_amount || 0)}</span></div>
        ${termLabel ? `<div class="row"><span>Term Structure:</span><span>${termLabel}</span></div>` : ''}
      </div>
      <p style="font-size: 10pt;">The parties confirm that this amount and duration reflect their consideration of the SSAG range based on their incomes, ages, and length of relationship.</p>
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
