import { fmtLegalDate, fmtCAD, capitalize } from './utils'

// Base agreement template structure
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agreement</title>
  <style>
    body { font-family: 'Calibri', 'Arial', sans-serif; line-height: 1.6; color: #333; margin: 0; padding: 20px; }
    .page { max-width: 850px; margin: 0 auto; page-break-after: always; }
    h1 { text-align: center; font-size: 16px; font-weight: bold; margin-bottom: 20px; text-transform: uppercase; }
    h2 { font-size: 13px; font-weight: bold; margin-top: 20px; margin-bottom: 12px; }
    h3 { font-size: 12px; font-weight: bold; margin-top: 16px; margin-bottom: 8px; }
    p { margin: 8px 0; text-align: justify; }
    table { width: 100%; border-collapse: collapse; margin: 12px 0; }
    th, td { border: 1px solid #999; padding: 8px; text-align: left; }
    th { background-color: #f0f0f0; font-weight: bold; }
    .between { text-align: center; margin: 20px 0; }
    .signature-block { margin-top: 40px; page-break-inside: avoid; }
    .signature-line { margin-top: 40px; border-bottom: 1px solid #000; width: 200px; display: inline-block; }
    .witness-block { margin-left: 0; margin-top: 20px; }
    ul { margin: 8px 0 8px 20px; }
    li { margin: 4px 0; }
    @media print { body { padding: 0; } .page { margin: 0; padding: 20px; } }
  </style>
</head>
<body>
  <div class="page">
    ${content}
  </div>
</body>
</html>
`

// Header for all agreements
const agreementHeader = (type, parties, date) => {
  const typeLabels = {
    'separation': 'SEPARATION AGREEMENT',
    'cohabitation': 'COHABITATION AGREEMENT',
    'prenup': 'PRENUPTIAL AGREEMENT (MARRIAGE CONTRACT)',
    'postnup': 'POSTNUPTIAL AGREEMENT',
    'amendment': 'AMENDMENT AGREEMENT'
  }

  return `
    <h1>${typeLabels[type]}</h1>
    <p><strong>THIS AGREEMENT</strong> is made as of the ${fmtLegalDate(date)}.</p>

    <div class="between">
      <p><strong>BETWEEN:</strong></p>
      <p><strong>${parties.party1Name}</strong><br/>
      ("Party 1" / "${parties.party1Name.split(' ')[0]}")</p>
      <p>— and —</p>
      <p><strong>${parties.party2Name}</strong><br/>
      ("Party 2" / "${parties.party2Name.split(' ')[0]}")</p>
      <p><em>(collectively referred to as the "parties")</em></p>
    </div>
  `
}

// Background section
const backgroundSection = (type, parties, dates, children) => {
  const childrenText = children && children.length > 0
    ? `<li>The parties have the following children of their relationship: ${children.map(c => `${c.name} (born ${c.dateOfBirth})`).join(', ')}.</li>`
    : '<li>The parties have no children together.</li>'

  let relationshipText = ''
  if (type === 'separation') {
    relationshipText = `${parties.party1Name} and ${parties.party2Name} were married on ${fmtLegalDate(dates.marriageDate)} in ${parties.signingCity || 'Ontario'}.`
  } else if (type === 'cohabitation') {
    relationshipText = `${parties.party1Name} and ${parties.party2Name} began cohabiting on ${fmtLegalDate(dates.cohabitationDate)}.`
  } else if (type === 'prenup') {
    relationshipText = `${parties.party1Name} and ${parties.party2Name} intend to marry.`
  } else if (type === 'postnup') {
    relationshipText = `${parties.party1Name} and ${parties.party2Name} were married on ${fmtLegalDate(dates.marriageDate)}.`
  }

  return `
    <h2>BACKGROUND</h2>
    <ul>
      <li>${relationshipText}</li>
      ${childrenText}
      ${type === 'separation' ? `<li>The parties separated on or about ${fmtLegalDate(dates.separationDate)}.</li>` : ''}
      <li>The parties desire to settle all issues arising from their ${type === 'prenup' ? 'anticipated marriage' : 'separation'}, including matters relating to [parenting, child support, spousal support, property division,] on the terms set out herein.</li>
      <li>Each party acknowledges that they have had the opportunity to obtain independent legal advice regarding this Agreement.</li>
    </ul>
  `
}

// Basic definitions section
const definitionsSection = (type, parties, dates, children) => {
  const defs = [
    `"children" means ${children && children.length > 0 ? children.map(c => c.name).join(', ') : 'none'}`
  ]

  if (type === 'separation') {
    defs.push(`"date of separation" means ${fmtLegalDate(dates.separationDate)}`)
  }

  return `
    <h2>DEFINITIONS AND INTERPRETATION</h2>
    <p>In this Agreement:</p>
    <ul>
      ${defs.map(d => `<li>${d}</li>`).join('')}
      <li>References to "Party 1" and "Party 2" include their respective legal representatives, estates, and successors.</li>
    </ul>
  `
}

// Child support section
const childSupportSection = (data) => {
  if (!data || !data.childSupportAmount) return ''

  return `
    <h2>CHILD SUPPORT</h2>
    <h3>Monthly Child Support</h3>
    <p>${data.payorName || 'The payor'} will pay ${data.recipientName || 'the recipient'} child support in the amount of <strong>${fmtCAD(data.childSupportAmount)}</strong> per month, commencing on the first day of the month following the execution of this Agreement, and on the first day of each month thereafter, for the benefit of ${data.childrenNames || 'the children'}.</p>

    ${data.childSupportAmount ? `<h3>Calculation Basis</h3>
    <p>Based on ${data.payorName || 'the payor'}'s annual income of ${fmtCAD(data.payorIncome)} and Federal Child Support Guidelines table amounts for ${data.numChildren} child(ren) in Ontario, the monthly table amount is ${fmtCAD(data.childSupportAmount)}.</p>` : ''}

    ${data.retroactive ? `<h3>Retroactive Child Support</h3>
    <p>${data.payorName || 'The payor'} owes ${data.recipientName || 'the recipient'} retroactive child support in the total amount of <strong>${fmtCAD(data.retroactiveAmount)}</strong> for the benefit of the children, calculated as follows:</p>
    <p>${data.retroactiveBreakdown || 'As set out in supporting documentation.'}</p>` : ''}

    <h3>Section 7 Special Expenses</h3>
    ${data.preAgreedExpenses && data.preAgreedExpenses.length > 0 ? `
    <p>The parties have agreed that the following expenses shall be considered section 7 expenses for which they will contribute in proportion to their incomes without requiring mutual consent each time:</p>
    <ul>
      ${data.preAgreedExpenses.map(e => `<li>${e}</li>`).join('')}
    </ul>
    ` : ''}
    <p>Neither party shall incur any section 7 expense without first obtaining the other party's written consent, except as pre-agreed above.</p>
  `
}

// Spousal support section
const spousalSupportSection = (data) => {
  if (data.agreementType === 'prenup' || data.agreementType === 'cohabitation') return ''
  if (!data.spousalSupport) return ''

  const { spousalSupport } = data

  if (spousalSupport.waived) {
    return `
      <h2>SPOUSAL SUPPORT</h2>
      <p>The parties have reviewed the Spousal Support Advisory Guidelines and agree that no spousal support shall be paid by either party. Each party waives any claim for spousal support.</p>
    `
  }

  return `
    <h2>SPOUSAL SUPPORT</h2>
    <p>${spousalSupport.payorName || 'The payor'} shall pay to ${spousalSupport.recipientName || 'the recipient'} spousal support in the amount of <strong>${fmtCAD(spousalSupport.amount)}</strong> per month.</p>
    <p>Spousal support shall be payable on the first day of each month, commencing on the first day of the month following the execution of this Agreement.</p>

    <h3>Duration</h3>
    <p>${spousalSupport.duration || 'As agreed between the parties.'}</p>

    <h3>Termination</h3>
    <p>Spousal support shall terminate upon:</p>
    <ul>
      ${spousalSupport.terminationTriggers?.map(t => `<li>${t}</li>`).join('') || '<li>Specified in supporting documentation.</li>'}
    </ul>
  `
}

// Property division section
const propertyDivisionSection = (data) => {
  if (!data || data.agreementType === 'prenup') return ''

  return `
    <h2>PROPERTY DIVISION</h2>

    ${data.matrimonialHome ? `<h3>Matrimonial Home</h3>
    <p>The matrimonial home is located at ${data.matrimonialHome.address || '[address to be specified]'}.</p>
    <p>${data.matrimonialHome.disposition || 'The disposition of the matrimonial home shall be as follows: [to be specified]'}</p>` : ''}

    ${data.equalization ? `<h3>Equalization Payment</h3>
    <p>Based on the Net Family Property calculations, ${data.equalization.payorName || 'the party'} with the higher NFP shall pay ${fmtCAD(data.equalization.amount)} to the other party as equalization.</p>
    <p>This amount shall be paid as follows: ${data.equalization.paymentTerms || '[payment terms to be specified]'}</p>` : ''}

    <h3>Other Property</h3>
    <p>Each party shall retain the property in their own names, including all bank accounts, vehicles, investments, and personal property, except as otherwise specified in this Agreement.</p>
  `
}

// Additional terms section
const additionalTermsSection = (data) => {
  return `
    <h2>GENERAL PROVISIONS</h2>

    ${data.lifeInsurance ? `<h3>Life Insurance</h3>
    <p>The payor shall maintain life insurance coverage in the amount of no less than ${fmtCAD(data.lifeInsurance.amount)}, naming the [recipient/children] as beneficiary/beneficiaries.</p>` : ''}

    <h3>Financial Disclosure</h3>
    <p>Each party acknowledges that they have fully disclosed their financial circumstances to the other, and that each party has had the opportunity to obtain independent legal advice regarding this Agreement.</p>

    <h3>Governing Law</h3>
    <p>This Agreement shall be governed by and construed in accordance with the laws of the Province of Ontario and the laws of Canada applicable therein.</p>

    <h3>Entire Agreement</h3>
    <p>This Agreement constitutes the entire agreement between the parties with respect to the subject matter hereof and supersedes all prior negotiations, representations, and understandings.</p>

    <h3>Severability</h3>
    <p>If any provision of this Agreement is found to be invalid or unenforceable, the remaining provisions shall continue in full force and effect.</p>

    <h3>Amendments</h3>
    <p>No amendment to this Agreement shall be binding unless in writing and signed by both parties.</p>
  `
}

// Signature block
const signatureBlock = (parties, signingDate, signingCity) => `
  <div class="signature-block">
    <p><strong>IN WITNESS WHEREOF</strong> the parties have signed this Agreement as of the date first written above.</p>

    <p style="margin-top: 40px;"><strong>SIGNED, SEALED AND DELIVERED</strong></p>
    <p>in the presence of:</p>

    <div style="margin-top: 40px; page-break-inside: avoid;">
      <div style="float: left; width: 48%;">
        <p style="margin-bottom: 50px;">_________________________________</p>
        <p style="margin: 0; font-weight: bold;">${parties.party1Name}</p>
      </div>
      <div style="float: right; width: 48%;">
        <p style="margin-bottom: 50px;">_________________________________</p>
        <p style="margin: 0; font-weight: bold;">Witness</p>
        <p style="margin: 4px 0; font-size: 12px;">Name: ________________________</p>
        <p style="margin: 4px 0; font-size: 12px;">Address: ______________________</p>
      </div>
      <div style="clear: both;"></div>
    </div>

    <div style="margin-top: 60px; page-break-inside: avoid;">
      <div style="float: left; width: 48%;">
        <p style="margin-bottom: 50px;">_________________________________</p>
        <p style="margin: 0; font-weight: bold;">${parties.party2Name}</p>
      </div>
      <div style="float: right; width: 48%;">
        <p style="margin-bottom: 50px;">_________________________________</p>
        <p style="margin: 0; font-weight: bold;">Witness</p>
        <p style="margin: 4px 0; font-size: 12px;">Name: ________________________</p>
        <p style="margin: 4px 0; font-size: 12px;">Address: ______________________</p>
      </div>
      <div style="clear: both;"></div>
    </div>
  </div>

  <p style="margin-top: 40px; font-size: 11px; border-top: 1px solid #999; padding-top: 12px;">
    <strong>IMPORTANT NOTICE:</strong> This document has been prepared based on information provided by the parties. This Agreement does not constitute legal advice. The parties are strongly encouraged to seek independent legal advice from a licensed Ontario family law lawyer before signing this Agreement.
  </p>
`

// Main template generator
export const generateAgreementHTML = (agreementType, interviewData) => {
  const {
    label,
    party1Name = '',
    party1Dob = '',
    party2Name = '',
    party2Dob = '',
    signingCity = '',
    signingDate = new Date().toISOString().split('T')[0],
    cohabitationDate = '',
    separationDate = '',
    marriageDate = '',
    children = [],
    childSupport = {},
    spousalSupport = {},
    property = {},
    additionalTerms = {}
  } = interviewData

  const parties = {
    party1Name: party1Name || 'Party 1',
    party2Name: party2Name || 'Party 2',
    signingCity: signingCity || 'Ontario'
  }

  const dates = {
    marriageDate: marriageDate || separationDate,
    cohabitationDate,
    separationDate,
    signingDate
  }

  // Build content sections
  let content = ''
  content += agreementHeader(agreementType, parties, signingDate)
  content += backgroundSection(agreementType, parties, dates, children)
  content += definitionsSection(agreementType, parties, dates, children)

  // Parenting section (skip for property-only agreements)
  if (['separation', 'cohabitation'].includes(agreementType) && children.length > 0) {
    content += `
      <h2>PARENTING ARRANGEMENTS</h2>
      <h3>Decision-Making Responsibility</h3>
      <p>The parties shall have joint decision-making responsibility for all major decisions affecting the children, including decisions regarding education, health care, and religious upbringing. Both parties shall consult with each other before making any major decision affecting the children.</p>

      <h3>Parenting Schedule</h3>
      <p>The parties have agreed to the following parenting arrangement: [Details to be specified by parties in interview]</p>

      <h3>Special Parenting Clauses</h3>
      <ul>
        <li><strong>Right of First Refusal:</strong> If either party requires childcare, they shall first offer the other parent the opportunity to care for the children before engaging a third party.</li>
        <li><strong>Communication:</strong> Both parties agree to maintain regular communication regarding the children's wellbeing and activities.</li>
      </ul>
    `
  }

  // Child support
  if (['separation', 'cohabitation'].includes(agreementType) && children.length > 0) {
    content += childSupportSection({
      payorName: parties.party1Name,
      recipientName: parties.party2Name,
      childrenNames: children.map(c => c.name).join(', '),
      numChildren: children.length,
      childSupportAmount: childSupport.amount,
      payorIncome: childSupport.payorIncome,
      ...childSupport
    })
  }

  // Spousal support
  content += spousalSupportSection({
    agreementType,
    spousalSupport: {
      payorName: parties.party1Name,
      recipientName: parties.party2Name,
      ...spousalSupport
    }
  })

  // Property division
  if (['separation', 'postnup'].includes(agreementType)) {
    content += propertyDivisionSection({
      agreementType,
      matrimonialHome: property.matrimonialHome,
      equalization: property.equalization,
      ...property
    })
  }

  // Additional terms
  content += additionalTermsSection(additionalTerms)

  // Signature block
  content += signatureBlock(parties, signingDate, signingCity)

  return baseTemplate(content)
}

// Quick preview text (for display before PDF)
export const generatePreviewText = (agreementType, interviewData) => {
  const { party1Name = 'Party 1', party2Name = 'Party 2', children = [] } = interviewData

  let preview = `${agreementType.toUpperCase()} AGREEMENT\n\nParties:\n- ${party1Name}\n- ${party2Name}\n`

  if (children.length > 0) {
    preview += `\nChildren:\n${children.map(c => `- ${c.name} (DOB: ${c.dateOfBirth})`).join('\n')}\n`
  }

  return preview
}
