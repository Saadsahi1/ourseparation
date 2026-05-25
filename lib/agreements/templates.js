import { fmtLegalDate, fmtCAD, capitalize } from './utils'

// Base agreement template structure with enhanced styling
const baseTemplate = (content) => `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Agreement</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: 'Times New Roman', Times, serif;
      line-height: 1.5;
      color: #1a1a1a;
      margin: 0;
      padding: 0;
      background-color: #fff;
    }
    .page {
      max-width: 8.5in;
      height: 11in;
      margin: 0 auto;
      padding: 0.5in;
      background-color: white;
      page-break-after: always;
      box-shadow: 0 0 0.1in rgba(0,0,0,0.1);
    }
    h1 {
      text-align: center;
      font-size: 14pt;
      font-weight: bold;
      margin-bottom: 12pt;
      text-transform: uppercase;
      letter-spacing: 0.5pt;
      line-height: 1.2;
    }
    h2 {
      font-size: 11pt;
      font-weight: bold;
      margin-top: 12pt;
      margin-bottom: 8pt;
      border-bottom: 1px solid #999;
      padding-bottom: 4pt;
    }
    h3 {
      font-size: 10pt;
      font-weight: bold;
      margin-top: 10pt;
      margin-bottom: 6pt;
      font-style: italic;
    }
    p {
      margin: 6pt 0;
      text-align: justify;
      font-size: 10pt;
    }
    table {
      width: 100%;
      border-collapse: collapse;
      margin: 8pt 0;
      font-size: 9pt;
    }
    th, td {
      border: 1pt solid #333;
      padding: 6pt;
      text-align: left;
      vertical-align: top;
    }
    th {
      background-color: #e8e8e8;
      font-weight: bold;
      color: #000;
    }
    .between {
      text-align: center;
      margin: 12pt 0;
      font-size: 10pt;
    }
    .signature-block {
      margin-top: 24pt;
      page-break-inside: avoid;
    }
    .signature-line {
      margin-top: 36pt;
      border-bottom: 1pt solid #000;
      width: 180pt;
      display: inline-block;
      height: 0;
    }
    .witness-block {
      margin-left: 0;
      margin-top: 12pt;
    }
    ul {
      margin: 6pt 0 6pt 20pt;
      font-size: 10pt;
    }
    li {
      margin: 3pt 0;
    }
    strong { font-weight: bold; }
    em { font-style: italic; }
    .clause-number { font-weight: bold; }
    .party-name { text-decoration: underline; }
    .schedule { page-break-before: always; }
    @media print {
      body { padding: 0; background: white; }
      .page { margin: 0; padding: 0.5in; box-shadow: none; }
    }
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

// Background section with comprehensive recitals
const backgroundSection = (type, parties, dates, children) => {
  const childrenText = children && children.length > 0
    ? `<li>The parties have the following children of their relationship: ${children.map(c => `${c.name} (born ${c.dateOfBirth})`).join(', ')}.</li>`
    : '<li>The parties have no children together.</li>'

  let relationshipText = ''
  if (type === 'separation') {
    relationshipText = `${parties.party1Name} and ${parties.party2Name} were married on ${fmtLegalDate(dates.marriageDate)} in ${parties.signingCity || 'Ontario'}.`
  } else if (type === 'cohabitation') {
    relationshipText = `${parties.party1Name} and ${parties.party2Name} commenced cohabiting on ${fmtLegalDate(dates.cohabitationDate)} and have lived together as spouses in a conjugal relationship since that date.`
  } else if (type === 'prenup') {
    relationshipText = `${parties.party1Name} and ${parties.party2Name} intend to marry in the near future.`
  } else if (type === 'postnup') {
    relationshipText = `${parties.party1Name} and ${parties.party2Name} were married on ${fmtLegalDate(dates.marriageDate)}.`
  }

  return `
    <h2>BACKGROUND AND RECITALS</h2>
    <p>WHEREAS the parties acknowledge and agree as follows:</p>
    <ul>
      <li><strong>Relationship:</strong> ${relationshipText}</li>
      ${childrenText}
      ${type === 'separation' ? `<li><strong>Separation:</strong> The parties separated on or about ${fmtLegalDate(dates.separationDate)} and have been living separate and apart since that date.</li>` : ''}
      <li><strong>Full Financial Disclosure:</strong> Each party has provided complete and honest financial disclosure to the other party, including disclosure of all assets, liabilities, income sources, and financial obligations.</li>
      <li><strong>Legal Advice:</strong> Each party has had the opportunity to obtain independent legal advice from a lawyer of their choice regarding the terms of this Agreement and their rights and obligations under Ontario family law.</li>
      <li><strong>Voluntary Agreement:</strong> The parties enter into this Agreement voluntarily, without pressure, duress, or undue influence, having fully considered the financial and legal implications.</li>
      <li><strong>Settlement Intent:</strong> The parties wish to settle all issues arising from their relationship on the terms set out herein, including all matters relating to parenting, child support, spousal support, property division, and other financial obligations.</li>
      <li><strong>Finality:</strong> The parties intend this Agreement to be a final settlement of all issues arising from their relationship, subject only to variation under the applicable family law statutes in cases of material change in circumstances.</li>
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

// Child support section with comprehensive clauses
const childSupportSection = (data) => {
  if (!data || !data.childSupportAmount) return ''

  return `
    <h2>CHILD SUPPORT</h2>

    <h3>Obligation to Pay</h3>
    <p>${data.payorName || 'The payor'} shall pay child support to ${data.recipientName || 'the recipient'} for the benefit of the following child(ren): ${data.childrenNames || 'the children'}, in accordance with the terms of this section.</p>

    <h3>Amount and Payment Terms</h3>
    <p>${data.payorName || 'The payor'} shall pay monthly child support in the amount of <strong>${fmtCAD(data.childSupportAmount)}</strong> per month. This amount shall be paid on or before the ${data.paymentDay || '1st'} day of each month, commencing on ${data.commencingDate || 'the first day of the month following execution of this Agreement'}, and continuing on the same day of each month thereafter.</p>

    <p>Payment shall be made by direct deposit, electronic transfer, or certified cheque to: ${data.recipientName || 'the recipient'} [account details to be provided].</p>

    <h3>Basis of Calculation</h3>
    <p>The child support amount of ${fmtCAD(data.childSupportAmount)} per month is calculated based on:</p>
    <ul>
      <li>${data.payorName || 'The payor'}'s annual income of ${fmtCAD(data.payorIncome || 0)}</li>
      <li>Federal Child Support Guidelines, O. Reg. 391/97 table amounts for Ontario</li>
      <li>${data.numChildren || 1} child(ren) for whom support is being paid</li>
    </ul>

    ${data.retroactive ? `<h3>Retroactive Child Support</h3>
    <p>${data.payorName || 'The payor'} acknowledges an obligation to pay retroactive child support in the total amount of <strong>${fmtCAD(data.retroactiveAmount || 0)}</strong> for the period commencing ${data.retroactiveStartDate || '[date]'} through ${new Date().toLocaleDateString('en-CA')}. This amount shall be paid as follows: ${data.retroactivePaymentTerms || 'in full within 30 days of execution of this Agreement.'}</p>` : ''}

    <h3>Section 7 Special Expenses</h3>
    ${data.preAgreedExpenses && data.preAgreedExpenses.length > 0 ? `
    <p>The parties agree that the following expenses are <em>section 7 special expenses</em> within the meaning of the Federal Child Support Guidelines, and the parties shall share these expenses in proportion to their incomes, without requiring consent for each expenditure:</p>
    <ul>
      ${data.preAgreedExpenses.map(e => `<li>${e}</li>`).join('')}
    </ul>
    <p>For other section 7 expenses (such as medical or dental expenses not covered by insurance, post-secondary education expenses, extraordinary extracurricular activities, or health-related expenses), neither party shall incur an expense exceeding ${fmtCAD(data.section7Threshold || 500)} without first obtaining the other party's written consent.</p>
    ` : `<p>Unless otherwise agreed in writing, the parties shall share any section 7 special expenses (including expenses for medical, dental, health-related, educational, and extraordinary extracurricular activities) in proportion to their incomes, provided the incurring party obtains the other party's written consent before incurring the expense.</p>`}

    <h3>Income Changes and Variation</h3>
    <p>If either party's income changes by more than 10% in any 12-month period, or if circumstances materially change (including changes in parenting time, the number of children, or other factors affecting child support), either party may request a variation of this support amount. The parties agree to exchange updated financial information annually, and to negotiate in good faith regarding any required adjustments.</p>

    <h3>Tax Considerations</h3>
    <p>The parties acknowledge that child support payments are not tax-deductible to the payor and not taxable income to the recipient under Canadian tax law.</p>
  `
}

// Spousal support section with comprehensive clauses
const spousalSupportSection = (data) => {
  if (data.agreementType === 'prenup' || data.agreementType === 'cohabitation') return ''
  if (!data.spousalSupport) return ''

  const { spousalSupport } = data

  if (spousalSupport.waived) {
    return `
      <h2>SPOUSAL SUPPORT</h2>
      <h3>Waiver of Spousal Support</h3>
      <p>The parties have carefully considered their respective needs, means, and circumstances. Having reviewed the Spousal Support Advisory Guidelines (2023), the parties agree that <strong>no spousal support</strong> shall be paid by either party to the other.</p>
      <p>Each party expressly waives any and all claims for spousal support, whether under the <em>Divorce Act</em>, the <em>Family Law Act</em>, or any other applicable legislation. This waiver applies both now and in the future, and each party acknowledges that they are releasing their right to seek spousal support.</p>
      <p>Each party has had the opportunity to obtain independent legal advice regarding the tax implications and enforceability of this waiver.</p>
    `
  }

  return `
    <h2>SPOUSAL SUPPORT</h2>

    <h3>Obligation to Pay</h3>
    <p>${spousalSupport.payorName || 'The payor'} shall pay spousal support to ${spousalSupport.recipientName || 'the recipient'} in accordance with the terms of this section.</p>

    <h3>Amount and Payment Terms</h3>
    <p>${spousalSupport.payorName || 'The payor'} shall pay monthly spousal support in the amount of <strong>${fmtCAD(spousalSupport.amount || 0)}</strong> per month. This amount shall be paid on or before the ${spousalSupport.paymentDay || '1st'} day of each month, commencing on ${spousalSupport.commencingDate || 'the first day of the month following execution of this Agreement'}.</p>

    <p>Payment shall be made by direct deposit or electronic transfer to: ${spousalSupport.recipientName || 'the recipient'} [account details to be provided].</p>

    <h3>Calculation and SSAG Guidelines</h3>
    <p>The parties acknowledge they have considered the Spousal Support Advisory Guidelines (SSAG). The agreed amount of ${fmtCAD(spousalSupport.amount || 0)} per month falls within / is outside the SSAG range as follows: ${spousalSupport.ssagRationale || '[SSAG considerations]'}</p>

    <h3>Duration of Support</h3>
    <p>Spousal support shall be payable for the following duration:</p>
    <p>${spousalSupport.duration || 'As agreed between the parties.'}</p>

    <h3>Termination Events</h3>
    <p>Spousal support shall automatically terminate upon the earliest occurrence of the following events:</p>
    <ul>
      <li>The death of either party</li>
      <li>The remarriage of ${spousalSupport.recipientName || 'the recipient'}</li>
      <li>${spousalSupport.recipientName || 'The recipient'} cohabiting in a conjugal relationship for a continuous period of 12 months or more</li>
      ${spousalSupport.terminationTriggers?.map(t => `<li>${t}</li>`).join('') || '<li>The end date specified above</li>'}
    </ul>

    <h3>Tax Treatment</h3>
    <p>The parties acknowledge that spousal support payments are deductible to the payor and taxable to the recipient under the <em>Income Tax Act</em> (Canada). Each party has consulted or had the opportunity to consult with a tax advisor regarding the tax implications of this arrangement.</p>

    <h3>Variation and Review</h3>
    <p>Either party may seek a variation of spousal support if there is a material change in circumstances, including but not limited to significant income changes, retirement, loss of employment, or other major life changes. The parties agree to negotiate in good faith regarding any requested variations before pursuing formal legal remedies.</p>
  `
}

// Property division section with comprehensive clauses
const propertyDivisionSection = (data) => {
  if (!data || data.agreementType === 'prenup') return ''

  return `
    <h2>PROPERTY DIVISION</h2>

    <h3>Principles of Property Division</h3>
    <p>Pursuant to the <em>Family Law Act</em>, R.S.O. 1990, c. F.3, the parties recognize that property acquired during the matrimonial/cohabitation relationship is subject to equalization of net family property. The parties have agreed to resolve property issues as set out in this section.</p>

    ${data.matrimonialHome ? `
    <h3>Matrimonial Home</h3>
    <p><strong>Address:</strong> ${data.matrimonialHome.address || '[address to be specified]'}</p>
    <p><strong>Legal Description:</strong> ${data.matrimonialHome.legalDescription || '[legal description to be inserted]'}</p>
    <p><strong>Current Market Value:</strong> ${data.matrimonialHome.value ? fmtCAD(data.matrimonialHome.value) : '[to be determined]'}</p>

    <h3>Disposition of Matrimonial Home</h3>
    <p>${data.matrimonialHome.disposition || 'The disposition of the matrimonial home shall be as follows:'}</p>
    ${data.matrimonialHome.disposition === 'sale' ? `
    <ul>
      <li>The matrimonial home shall be listed for sale within ${data.matrimonialHome.saleTimeline || '90 days'} of the execution of this Agreement, in a manner mutually agreed by the parties.</li>
      <li>The net proceeds of sale (after realtor commissions, legal fees, and outstanding mortgage) shall be divided ${data.matrimonialHome.proceedsSplit || 'equally'}.</li>
      <li>Either party may occupy the home during the marketing and sale period, with costs (mortgage, property tax, utilities, insurance) divided ${data.matrimonialHome.costSplit || 'equally'}}.</li>
    </ul>
    ` : data.matrimonialHome.disposition === 'one-party' ? `
    <p>${data.matrimonialHome.retainingParty || 'One party'} shall retain full ownership of the matrimonial home. The retaining party shall be solely responsible for all costs, including mortgage payments, property tax, insurance, and maintenance. The other party's interest in the home shall be released by ${data.matrimonialHome.releaseDate || 'execution of a release document.'}</p>
    ` : `<p>${data.matrimonialHome.disposition}</p>`}` : ''}

    ${data.equalization ? `
    <h3>Equalization of Net Family Property</h3>
    <p>The parties acknowledge that they have exchanged financial disclosure regarding their assets, liabilities, and net family property values as of the date of separation (${data.separationDate || '[date]'}) and as of the date of this Agreement (${new Date().toLocaleDateString('en-CA')}).</p>

    <p><strong>Net Family Property Calculation:</strong></p>
    <ul>
      <li>${data.equalization.payorName || 'Party 1'}'s NFP as of ${data.separationDate || '[date]'}: ${fmtCAD(data.equalization.payorNFP || 0)}</li>
      <li>${data.equalization.recipientName || 'Party 2'}'s NFP as of ${data.separationDate || '[date]'}: ${fmtCAD(data.equalization.recipientNFP || 0)}</li>
      <li>Difference: ${fmtCAD(data.equalization.amount || 0)}</li>
    </ul>

    <h3>Equalization Payment</h3>
    <p>To equalize net family property, ${data.equalization.payorName || 'the party with the higher NFP'} shall pay to ${data.equalization.recipientName || 'the other party'} the amount of <strong>${fmtCAD(data.equalization.amount || 0)}</strong>.</p>
    <p><strong>Payment Terms:</strong> ${data.equalization.paymentTerms || 'This amount shall be paid in full within 30 days of the execution of this Agreement by direct deposit or certified cheque.'}</p>
    ` : ''}

    <h3>Other Property and Debts</h3>
    <p>Each party shall retain full ownership and responsibility for all property and debts in their own name, including but not limited to:</p>
    <ul>
      <li>Bank accounts, savings accounts, and cash on hand</li>
      <li>Registered Retirement Savings Accounts (RRSPs) and Registered Retirement Income Funds (RRIFs)</li>
      <li>Tax-Free Savings Accounts (TFSAs)</li>
      <li>Motor vehicles, including cars, motorcycles, and recreational vehicles</li>
      <li>Investments, stocks, bonds, mutual funds, and other securities</li>
      <li>Business interests and partnership interests</li>
      <li>Pension plans and locked-in accounts</li>
      <li>Personal property, including furniture, jewelry, art, and collections</li>
      <li>All outstanding debts, mortgages, loans, and credit card balances</li>
    </ul>

    <p>Each party shall execute any documents necessary to transfer assets or remove their name from liability, including bank account transfers, deed transfers, or mortgage assumption agreements, within 30 days of this Agreement's execution.</p>
  `
}

// Additional terms section with comprehensive legal provisions
const additionalTermsSection = (data) => {
  return `
    <h2>GENERAL PROVISIONS</h2>

    <h3>Financial Disclosure</h3>
    <p>Each party represents that they have:</p>
    <ul>
      <li>Fully and honestly disclosed their financial situation, including all assets, liabilities, income sources, and financial obligations</li>
      <li>Provided copies of the most recent income tax returns, Notices of Assessment, and other relevant financial documents</li>
      <li>Had the opportunity to obtain independent legal advice regarding this Agreement</li>
      <li>Understood the tax implications of the arrangements set out herein</li>
      <li>Not been subjected to any pressure, duress, or undue influence in entering this Agreement</li>
    </ul>

    ${data.lifeInsurance ? `<h3>Life Insurance</h3>
    <p>${data.lifeInsurance.payorName || 'The payor'} shall obtain and maintain life insurance coverage in the amount of no less than ${fmtCAD(data.lifeInsurance.amount || 0)}, with ${data.lifeInsurance.beneficiary || 'the recipient and/or the children'} named as irrevocable beneficiary/beneficiaries.</p>
    <p>The insured party shall provide the other party with proof of coverage within 30 days of this Agreement's execution, and annually thereafter. Life insurance proceeds shall be used to satisfy any outstanding support obligations or other payments due under this Agreement.</p>` : ''}

    <h3>Dispute Resolution and Mediation</h3>
    <p>Prior to initiating any legal proceedings regarding disputes arising from this Agreement, the parties agree to attempt to resolve the dispute through:</p>
    <ul>
      <li>Good faith negotiation between the parties</li>
      <li>Mediation with a mutually agreed mediator, with costs shared equally</li>
      <li>If mediation is unsuccessful, either party may pursue legal remedies</li>
    </ul>

    <h3>Governing Law and Jurisdiction</h3>
    <p>This Agreement shall be governed by and construed in accordance with the laws of the Province of Ontario and the laws of Canada applicable therein, without regard to conflicts of law principles. The parties submit to the exclusive jurisdiction of the courts of Ontario.</p>

    <h3>Legal Status and Enforceability</h3>
    <p>The parties acknowledge and agree that:</p>
    <ul>
      <li>This Agreement is a legally binding contract between them</li>
      <li>This Agreement shall be enforceable as a contract or as a domestic contract under the <em>Family Law Act</em>, R.S.O. 1990, c. F.3</li>
      <li>Either party may seek a court order to enforce compliance with this Agreement</li>
      <li>For support obligations, the recipient may enforce this Agreement through the Family Responsibility Office</li>
    </ul>

    <h3>Entire Agreement</h3>
    <p>This Agreement, including all schedules and attachments, constitutes the entire agreement between the parties with respect to the subject matter hereof. It supersedes and replaces all prior negotiations, representations, conversations, and agreements, whether written or oral.</p>

    <h3>Severability</h3>
    <p>If any provision of this Agreement is found to be invalid, unenforceable, or contrary to public policy by a court of competent jurisdiction, that provision shall be severed, and the remaining provisions shall continue in full force and effect. The parties agree to negotiate a replacement provision that achieves, to the extent possible, the original intent of the severed provision.</p>

    <h3>Amendments and Modifications</h3>
    <p>No amendment, modification, or waiver of this Agreement shall be valid or binding unless:</p>
    <ul>
      <li>It is in writing</li>
      <li>It is signed by both parties</li>
      <li>It specifically references this Agreement</li>
      <li>It is executed with the same formality as this Agreement (including witnesses, if required)</li>
    </ul>

    <h3>Waiver</h3>
    <p>The waiver by either party of a breach of any provision of this Agreement shall not constitute a waiver of any subsequent breach of the same or any other provision.</p>

    <h3>Further Assurances</h3>
    <p>Each party agrees to execute and deliver any documents and to take any actions that may be necessary or desirable to give effect to the terms and conditions of this Agreement, including transfers of property, releases of liens, assumption of debts, and other legal documentation.</p>

    <h3>Counterparts</h3>
    <p>This Agreement may be executed in multiple counterparts, each of which shall be deemed an original and all of which together shall constitute one and the same instrument. Execution by electronic means (including PDF signature) shall be as valid as execution by original signature.</p>

    <h3>Survival of Obligations</h3>
    <p>All obligations and covenants under this Agreement shall survive its execution and shall remain binding on the parties, their estates, successors, and permitted assigns, except as expressly limited herein.</p>
  `
}

// Signature block with professional formatting
const signatureBlock = (parties, signingDate, signingCity) => `
  <div class="signature-block">
    <h2 style="border: none; margin-bottom: 12pt;">SIGNATURES</h2>

    <p style="margin-top: 12pt;"><strong>IN WITNESS WHEREOF</strong> the parties have signed this Agreement as of the date first written above, in the City of ${signingCity || 'Ontario'}, Ontario.</p>

    <table style="margin-top: 18pt; border: none;">
      <tr>
        <td style="border: none; width: 48%; vertical-align: bottom; padding-right: 12pt;">
          <div style="margin-bottom: 48pt; height: 1pt; border-bottom: 1pt solid #000; width: 100%;"></div>
          <p style="margin: 0; font-weight: bold; text-align: center;">${parties.party1Name}</p>
          <p style="margin: 0; font-size: 9pt; text-align: center;">Date: ____________________</p>
        </td>
        <td style="border: none; width: 48%; vertical-align: bottom; padding-left: 12pt;">
          <div style="margin-bottom: 48pt; height: 1pt; border-bottom: 1pt solid #000; width: 100%;"></div>
          <p style="margin: 0; font-weight: bold; text-align: center;">${parties.party2Name}</p>
          <p style="margin: 0; font-size: 9pt; text-align: center;">Date: ____________________</p>
        </td>
      </tr>
    </table>

    <table style="margin-top: 24pt; border: none;">
      <tr>
        <td style="border: none; width: 48%; vertical-align: bottom; padding-right: 12pt;">
          <p style="margin: 0; margin-bottom: 4pt; font-weight: bold; font-size: 9pt;">Witness for Party 1:</p>
          <div style="margin-bottom: 36pt; height: 1pt; border-bottom: 1pt solid #000; width: 100%;"></div>
          <p style="margin: 0; font-size: 9pt;">Name: __________________________</p>
          <p style="margin: 4pt 0 0 0; font-size: 9pt;">Address: __________________________</p>
        </td>
        <td style="border: none; width: 48%; vertical-align: bottom; padding-left: 12pt;">
          <p style="margin: 0; margin-bottom: 4pt; font-weight: bold; font-size: 9pt;">Witness for Party 2:</p>
          <div style="margin-bottom: 36pt; height: 1pt; border-bottom: 1pt solid #000; width: 100%;"></div>
          <p style="margin: 0; font-size: 9pt;">Name: __________________________</p>
          <p style="margin: 4pt 0 0 0; font-size: 9pt;">Address: __________________________</p>
        </td>
      </tr>
    </table>
  </div>

  <p style="margin-top: 18pt; font-size: 8pt; border-top: 2pt solid #999; padding-top: 12pt; text-align: center;">
    <strong>IMPORTANT LEGAL NOTICE</strong><br/><br/>
    This document has been prepared based on information provided by the parties and is intended to be a legally binding agreement under Ontario law. This agreement does not constitute legal advice. <strong>The parties are strongly encouraged to seek independent legal advice from a licensed Ontario family law lawyer before signing this Agreement.</strong> Independent legal advice (ILA) significantly strengthens enforceability and reduces the risk of future disputes.
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

      <h3>Best Interests of the Child</h3>
      <p>The parties acknowledge that the primary consideration in all matters affecting the children is the best interests of the child(ren). The parties are committed to fostering a positive and supportive relationship between the children and both parents, and to making decisions that prioritize the children's physical, emotional, educational, and social well-being.</p>

      <h3>Decision-Making Responsibility</h3>
      <p>The parties shall have <strong>joint decision-making responsibility</strong> for all major decisions affecting the child(ren), including but not limited to:</p>
      <ul>
        <li>Education, including choice of school, special education services, and extracurricular activities</li>
        <li>Health care, including medical and dental treatment (except routine/emergency care)</li>
        <li>Religious upbringing and cultural activities</li>
        <li>Psychological or counseling services</li>
        <li>Major activities, travel, and lifestyle changes</li>
      </ul>
      <p>Before making any major decision, the parent proposing the decision shall consult with the other parent and shall make a good faith effort to reach agreement. If the parties cannot agree on a major decision, either party may seek mediation or a court order.</p>

      <h3>Routine Parenting Decisions</h3>
      <p>Each parent shall have the authority to make routine day-to-day decisions regarding the child(ren) while they are in that parent's care, including decisions regarding meals, activities, homework, bedtime, clothing, and discipline (provided such discipline is appropriate and does not constitute abuse).</p>

      <h3>Parenting Schedule</h3>
      <p>The parties have agreed to the following parenting time arrangement(s): [Details to be specified by parties in interview]</p>
      <p>The parenting schedule is intended to be flexible and shall be adapted as the child(ren) grow and circumstances change. The parties agree to accommodate reasonable requests for schedule variations when possible.</p>

      <h3>Holidays and Special Occasions</h3>
      <p>Parenting time over holidays and special occasions shall be as follows: [Holiday schedule to be specified]</p>
      <ul>
        <li>Summer vacation shall be divided as agreed, with notice of intended dates provided by [date each year]</li>
        <li>March break and other school breaks shall be alternated or shared as agreed</li>
        <li>Birthday celebrations shall allow both parents to participate, unless otherwise agreed</li>
      </ul>

      <h3>Right of First Refusal</h3>
      <p>If either party is unable to care for the child(ren) for any period and requires third-party childcare or care by a relative, that party shall first offer the other parent the opportunity to provide care. The other parent shall have 24 hours to accept or decline the offer, after which the offering parent may arrange alternative childcare.</p>

      <h3>Communication and Information Sharing</h3>
      <p>The parties agree to:</p>
      <ul>
        <li>Maintain regular, respectful communication regarding the child(ren)'s well-being, activities, and needs</li>
        <li>Share information about school activities, health matters, and important developments in a timely manner</li>
        <li>Provide each other with copies of school reports, medical records, and other important documents</li>
        <li>Not speak negatively about the other parent in front of the children</li>
        <li>Encourage the child(ren) to maintain a positive relationship with the other parent</li>
      </ul>

      <h3>Parental Conduct and Child Protection</h3>
      <p>Each party agrees to:</p>
      <ul>
        <li>Protect the child(ren) from exposure to parental conflict</li>
        <li>Not subject the child(ren) to physical punishment or psychological harm</li>
        <li>Ensure the child(ren)'s safety in the home environment</li>
        <li>Refrain from using the child(ren) as messengers or intermediaries between the parties</li>
        <li>Report any concerns about the other parent's care or conduct through appropriate channels</li>
      </ul>

      <h3>Telephone and Electronic Communication</h3>
      <p>The child(ren) shall have reasonable access to communicate with the other parent by telephone, email, video call, or other means, even during periods when the child(ren) is in the other parent's care. Such communication shall be reasonable in frequency and duration, and shall not interfere with the other parent's parenting time or the child(ren)'s activities.</p>

      <h3>Relocation</h3>
      <p>Neither party shall relocate the child(ren) from their current residence without the prior written consent of the other party or a court order. Any proposed relocation must consider the child(ren)'s best interests and the impact on the other parent's relationship with the child(ren).</p>
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
