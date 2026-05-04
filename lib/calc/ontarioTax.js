import { getTaxParams } from '../config/taxParams'

function calcCPP(gross, P) {
  const contributory = Math.min(gross, P.cppYMPE) - P.cppExemption
  if (contributory <= 0) return { base: 0, total: 0 }
  const total = Math.min(contributory * P.cppRate, P.cppMax)
  const base  = total * P.cppBaseProp
  return { base: Math.round(base * 100) / 100, total: Math.round(total * 100) / 100 }
}

function calcEI(gross, P) {
  return Math.min(gross * P.eiRate, P.eiMax)
}

function calcFedBPA(netIncome, P) {
  if (netIncome <= P.fedBPAThresh) return P.fedBPA
  if (netIncome >= P.fedBPAThresh + P.fedBPARange) return P.fedBPAMin
  return P.fedBPA - ((netIncome - P.fedBPAThresh) / P.fedBPARange) * (P.fedBPA - P.fedBPAMin)
}

function calcFedTax(taxable, P) {
  let tax = 0, prev = 0
  for (let i = 0; i < P.fedBrackets.length; i++) {
    if (taxable <= prev) break
    tax += (Math.min(taxable, P.fedBrackets[i]) - prev) * P.fedRates[i]
    prev = P.fedBrackets[i]
    if (P.fedBrackets[i] === Infinity) break
  }
  return tax
}

// ── Eligible Dependant Credit (for shared/dependent children) ──────────────
// Key for accurate SSAG calculations with children
function calcEligibleDependantCredit(children, parent, P) {
  // Count eligible dependants: children with this parent or shared custody
  const eligibleChildren = children.filter(c => c.residesWith === parent || c.residesWith === 'shared').length
  if (eligibleChildren === 0) return 0

  // Can only claim one spouse/equiv or eligible dependant amount (not both)
  // Assuming we claim for first eligible child
  const creditBase = P.eligibleDependantCredit || 0
  return creditBase * P.fedRates[0] // Convert to credit (at lowest tax bracket)
}

function calcOntTax(taxable, P) {
  let tax = 0, prev = 0
  for (let i = 0; i < P.ontBrackets.length; i++) {
    if (taxable <= prev) break
    tax += (Math.min(taxable, P.ontBrackets[i]) - prev) * P.ontRates[i]
    prev = P.ontBrackets[i]
    if (P.ontBrackets[i] === Infinity) break
  }
  return tax
}

function calcHealthPremium(taxable, P) {
  for (const t of P.ontHealthPremium) {
    if (taxable <= t.max) return t.base + Math.max(0, (taxable - t.sub) * t.rate)
  }
  return 900
}

function calcCCB(afni, children, parent, P) {
  const now = new Date()
  let under6 = 0, age6to17 = 0
  for (const c of children) {
    if (!c.dateOfBirth) continue
    const age = (now - new Date(c.dateOfBirth)) / (365.25 * 24 * 3600 * 1000)
    // For CCB, each parent in shared custody gets full base (not split)
    if (c.residesWith === parent || c.residesWith === 'shared') {
      if (age < 6) under6 += 1
      else if (age < 18) age6to17 += 1
    }
  }
  const base = under6 * P.ccbUnder6 + age6to17 * P.ccbAge6to17
  if (base === 0) return 0
  const totalKids = under6 + age6to17
  const idx = Math.min(Math.ceil(totalKids), 4)
  let reduction = 0
  if (afni > P.ccbT1) {
    reduction += Math.min(afni - P.ccbT1, P.ccbT2 - P.ccbT1) * P.ccbR1[idx]
  }
  if (afni > P.ccbT2) {
    reduction += (afni - P.ccbT2) * P.ccbR2[idx]
  }
  return Math.max(0, base - reduction)
}

export function calculateTax({
  grossIncome = 0,
  supportReceived = 0,
  supportPaid = 0,
  children = [],
  parent = 'A',
  familyNetIncome = 0,
  numDependents = 0,
  taxYear = 2025,
  claimEligibleDependant = true,
}) {
  const P = getTaxParams(taxYear)

  const totalIncome = grossIncome + supportReceived
  const netIncome   = Math.max(0, totalIncome - supportPaid)
  const taxable     = netIncome
  const cpp = calcCPP(grossIncome, P)
  const ei  = calcEI(grossIncome, P)

  // ── Federal ──
  const fedTax      = calcFedTax(taxable, P)
  const fedBPA      = calcFedBPA(netIncome, P)
  const fedEligibleDependant = claimEligibleDependant ? calcEligibleDependantCredit(children, parent, P) : 0
  const fedCredits  = (fedBPA + cpp.base + ei + P.canadaEmploymentAmount + fedEligibleDependant) * P.fedRates[0]
  const fedPayable  = Math.max(0, fedTax - fedCredits)

  // ── Ontario ──
  const ontTax         = calcOntTax(taxable, P)
  const ontEligibleDependant = claimEligibleDependant ? calcEligibleDependantCredit(children, parent, P) / P.fedRates[0] * P.ontRates[0] : 0 // Scale to Ontario rate
  const ontCredits     = (P.ontBPA + cpp.base + ei + ontEligibleDependant) * P.ontRates[0]
  const ontAfterCred   = Math.max(0, ontTax - ontCredits)
  const ontSurtax      =
    Math.max(0, (ontAfterCred - P.ontSurtax1Threshold) * P.ontSurtax1Rate) +
    Math.max(0, (ontAfterCred - P.ontSurtax2Threshold) * P.ontSurtax2Rate)
  const myKids         = children.filter(c => c.residesWith === parent || c.residesWith === 'shared')
  const taxReduction   = Math.min(P.ontTaxReductionBase + myKids.length * P.ontTaxReductionPerChild, ontAfterCred)
  const liftCredit     = Math.max(0,
    Math.min(grossIncome * P.ontRates[0], P.ontLiftMax) -
    Math.max(0, netIncome - P.ontLiftThreshold) * P.ontLiftRate
  )
  const hp             = calcHealthPremium(taxable, P)
  const ontPayable     = Math.max(0, ontAfterCred + ontSurtax - taxReduction - liftCredit) + hp

  const totalTax        = fedPayable + ontPayable
  const totalDeductions = totalTax + cpp.total + ei

  // ── Benefits ──
  const cwb = Math.max(0,
    Math.min((Math.max(0, grossIncome - P.cwbPhaseInBase) * P.cwbPhaseInRate), P.cwbMaxBenefit) -
    Math.max(0, netIncome - P.cwbPhaseOutBase) * P.cwbPhaseOutRate
  )
  const ccb = calcCCB(familyNetIncome, children, parent, P)
  const eligKids = children.filter(c => c.residesWith === parent || c.residesWith === 'shared').length
  const gst = Math.max(0,
    P.gstBase + P.gstSpouse + Math.min(eligKids, 6) * P.gstPerChild -
    Math.max(0, familyNetIncome - P.gstPhaseOutBase) * P.gstPhaseOutRate
  )
  const cai = P.caiFirstAdult + Math.min(numDependents, 3) * P.caiPerDependent

  // ── OCB (Ontario Child Benefit) - PER PARENT INCOME THRESHOLD ──
  // Only qualifies if parent's INCOME (not net) is below threshold
  // This is DivorcePath-accurate calculation
  const ocb = Math.max(0, numDependents * P.ocbBase - Math.max(0, grossIncome - P.ocbThreshold) * P.ocbRate)

  const otb = Math.max(0,
    P.otbSalesTaxBase + numDependents * P.otbSalesTaxBase + P.otbEnergyBase + P.otbEnergyPropertyTax -
    Math.max(0, netIncome - P.otbThresholdWithDep) * P.otbPhaseOutRate
  )
  const totalBenefits = cwb + ccb + gst + cai + ocb + otb

  return {
    grossIncome, supportReceived, supportPaid, totalIncome, netIncome, taxable,
    cpp, ei: Math.round(ei),
    fedTaxPayable:  Math.round(fedPayable),
    ontTaxPayable:  Math.round(ontPayable),
    totalTax:       Math.round(totalTax),
    totalDeductions:Math.round(totalDeductions),
    benefits: {
      cwb: Math.round(cwb), ccb: Math.round(ccb), gst: Math.round(gst),
      cai: Math.round(cai), ocb: Math.round(ocb), otb: Math.round(otb),
      total: Math.round(totalBenefits),
    },
    netDisposableIncome: Math.round(totalIncome - totalDeductions + totalBenefits),
  }
}
