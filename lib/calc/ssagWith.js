import { calculateTax } from './ontarioTax'
import { selectCSTByDate, lookupChildSupport } from './childSupportTables'
import { calcDurationYears } from './ssagWithout'

// ─── Child support (DivorePath-compatible combined-eligible approach) ─────────
// Each parent's eligible children = children primarily with OTHER parent + shared.
// Table CS per parent is looked up for that count, then net set-off determines
// who pays whom.  This matches the CSG s.3/s.9 combined approach used in practice.
function calcChildSupport(incomeA, incomeB, children, separationDate) {
  const tableName = selectCSTByDate(separationDate)

  const eligibleFromA = children.filter(c => c.residesWith === 'B' || c.residesWith === 'shared').length
  const eligibleFromB = children.filter(c => c.residesWith === 'A' || c.residesWith === 'shared').length

  const tableCSA = eligibleFromA > 0 ? lookupChildSupport(tableName, incomeA, eligibleFromA) : 0
  const tableCSB = eligibleFromB > 0 ? lookupChildSupport(tableName, incomeB, eligibleFromB) : 0

  // Positive = A pays B net; negative = B pays A net
  const netChildSupportFromA = tableCSA - tableCSB

  return {
    tableName,
    s3_A_pays_monthly: tableCSA,
    s3_B_pays_monthly: tableCSB,
    s9_monthly: 0,
    netChildSupportFromA,
  }
}

// ─── INDI binary solver ───────────────────────────────────────────────────────
// Finds annual spousal support so that recipient's share of combined INDI
// equals targetRatio (0.40 low / 0.43 mid / 0.46 high — SSAG fixed targets).
//
// INDI formula (SSAG with-children):
//   Payor INDI    = after-tax NDI (taxes computed on gross − SS) − SS paid − payor's table CS × 12
//   Recipient INDI= after-tax NDI (taxes computed on gross + SS) − recipient's table CS × 12
//
// Note: calculateTax returns netDisposableIncome = totalIncome − deductions + benefits,
// where totalIncome already includes supportReceived.  So for the recipient, SS is
// already baked into NDI — we must NOT add it again.
function solve(payorIncome, recipientIncome, childSupport, children, payorParent, recipientParent, targetRatio, taxYear) {
  const netChildSupportAnnualFromA = childSupport.netChildSupportFromA * 12
  const childSupportAdjustmentForParent = (parent) => {
    if (parent === 'A') return -netChildSupportAnnualFromA
    return netChildSupportAnnualFromA
  }

  const payorCSAdjustmentAnnual = childSupportAdjustmentForParent(payorParent)
  const recCSAdjustmentAnnual = childSupportAdjustmentForParent(recipientParent)

  const payorKids = children.filter(c => c.residesWith === payorParent    || c.residesWith === 'shared').length
  const recKids   = children.filter(c => c.residesWith === recipientParent || c.residesWith === 'shared').length

  let low = 0, high = payorIncome * 0.5, best = 0, bestDiff = Infinity

  for (let i = 0; i < 80; i++) {
    const ss = (low + high) / 2
    // For CCB phase-out: each parent uses their own net income (not combined)
    const payorNetForCCB = payorIncome - ss       // payor's own net after support paid
    const recNetForCCB = recipientIncome + ss     // recipient's own net after support received

    const payorTax = calculateTax({
      grossIncome: payorIncome, supportPaid: ss,
      children, parent: payorParent,
      familyNetIncome: payorNetForCCB, numDependents: payorKids, taxYear,
      claimEligibleDependant: false,  // lower-income recipient claims EDC
    })
    const recTax = calculateTax({
      grossIncome: recipientIncome, supportReceived: ss,
      children, parent: recipientParent,
      familyNetIncome: recNetForCCB, numDependents: recKids, taxYear,
      claimEligibleDependant: true,   // lower-income recipient claims EDC
    })

    // payorTax.netDisposableIncome includes tax effects, but not the actual cash transfer.
    // Add the net child-support adjustment for the parent, then subtract spousal support paid.
    const payorINDI = payorTax.netDisposableIncome - ss + payorCSAdjustmentAnnual

    // recTax.netDisposableIncome already includes spousal support received in totalIncome.
    // Add the net child-support adjustment for the recipient parent.
    const recINDI = recTax.netDisposableIncome + recCSAdjustmentAnnual

    const combined = payorINDI + recINDI
    if (combined <= 0) { low = ss; continue }

    const diff = (recINDI / combined) - targetRatio
    if (Math.abs(diff) < Math.abs(bestDiff)) { bestDiff = diff; best = ss }
    if (Math.abs(diff) < 0.001) break
    diff < 0 ? (low = ss) : (high = ss)
  }
  return Math.round(Math.max(0, best))
}

// ─── Main export ──────────────────────────────────────────────────────────────
export function calculateWithChildSupport({ personAIncome, personBIncome, cohabitationDate, separationDate, children = [], taxYear = 2023 }) {
  const incomeA = parseFloat(personAIncome)
  const incomeB = parseFloat(personBIncome)
  const payorIsA      = incomeA >= incomeB
  const payorIncome   = payorIsA ? incomeA : incomeB
  const recipientIncome = payorIsA ? incomeB : incomeA
  const payorParent     = payorIsA ? 'A' : 'B'
  const recipientParent = payorIsA ? 'B' : 'A'

  const duration     = calcDurationYears(cohabitationDate, separationDate)
  const durationYears = Math.round(duration * 10) / 10
  const childSupport  = calcChildSupport(incomeA, incomeB, children, separationDate)

  // SSAG with-children fixed INDI targets: low=40%, mid=43%, high=46%
  const highAnnual = solve(payorIncome, recipientIncome, childSupport, children, payorParent, recipientParent, 0.46, taxYear)
  const midAnnual  = solve(payorIncome, recipientIncome, childSupport, children, payorParent, recipientParent, 0.43, taxYear)
  const lowAnnual  = solve(payorIncome, recipientIncome, childSupport, children, payorParent, recipientParent, 0.40, taxYear)

  // Tax breakdowns at mid-range spousal support (for display)
  const kidsA = children.filter(c => c.residesWith === 'A' || c.residesWith === 'shared').length
  const kidsB = children.filter(c => c.residesWith === 'B' || c.residesWith === 'shared').length
  // For CCB phase-out: each parent uses their own net income (not combined)
  const payorNetForCCB = (payorIsA ? incomeA : incomeB) - midAnnual
  const recNetForCCB   = (payorIsA ? incomeB : incomeA) + midAnnual

  const taxA = calculateTax({
    grossIncome: incomeA,
    supportPaid:      payorIsA  ? midAnnual : 0,
    supportReceived:  payorIsA  ? 0 : midAnnual,
    children, parent: 'A', familyNetIncome: payorIsA ? payorNetForCCB : recNetForCCB, numDependents: kidsA, taxYear,
    claimEligibleDependant: !payorIsA,  // lower-income recipient claims EDC
  })
  const taxB = calculateTax({
    grossIncome: incomeB,
    supportPaid:      !payorIsA ? midAnnual : 0,
    supportReceived:  !payorIsA ? 0 : midAnnual,
    children, parent: 'B', familyNetIncome: payorIsA ? recNetForCCB : payorNetForCCB, numDependents: kidsB, taxYear,
    claimEligibleDependant: payorIsA,   // lower-income recipient claims EDC
  })

  return {
    payorIsA, payorIncome, recipientIncome, durationYears,
    supportDurationRange: {
      low:  Math.round(durationYears * 0.5 * 10) / 10,
      high: durationYears,
    },
    childSupport, taxA, taxB,
    high: { annual: highAnnual, monthly: Math.round(highAnnual / 12) },
    mid:  { annual: midAnnual,  monthly: Math.round(midAnnual  / 12) },
    low:  { annual: lowAnnual,  monthly: Math.round(lowAnnual  / 12) },
  }
}
