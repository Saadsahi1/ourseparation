export function calcDurationYears(cohabitationDate, separationDate) {
  const start = new Date(cohabitationDate)
  const end = new Date(separationDate)
  return Math.max(0, (end - start) / (1000 * 60 * 60 * 24 * 365.25))
}

export function calculateWithoutChildSupport({ personAIncome, personBIncome, cohabitationDate, separationDate }) {
  const incomeA = parseFloat(personAIncome)
  const incomeB = parseFloat(personBIncome)
  const payorIsA = incomeA >= incomeB
  const payorIncome = Math.max(incomeA, incomeB)
  const recipientIncome = Math.min(incomeA, incomeB)
  const duration = calcDurationYears(cohabitationDate, separationDate)
  const durationYears = Math.round(duration * 10) / 10
  const incomeDifference = payorIncome - recipientIncome

  if (incomeDifference <= 0) {
    return {
      payorIsA, payorIncome, recipientIncome, durationYears, incomeDifference: 0,
      supportDurationRange: { low: 0, high: 0 },
      high: { annual: 0, monthly: 0 },
      mid: { annual: 0, monthly: 0 },
      low: { annual: 0, monthly: 0 },
      note: 'No spousal support — incomes are equal.',
    }
  }

  const highAnnual = incomeDifference * 0.20
  const midAnnual = incomeDifference * 0.175
  const lowAnnual = incomeDifference * 0.15

  return {
    payorIsA, payorIncome, recipientIncome, durationYears, incomeDifference,
    supportDurationRange: {
      low: Math.round(durationYears * 0.5 * 10) / 10,
      high: Math.round(durationYears * 1.0 * 10) / 10,
    },
    high: { annual: Math.round(highAnnual), monthly: Math.round(highAnnual / 12) },
    mid: { annual: Math.round(midAnnual), monthly: Math.round(midAnnual / 12) },
    low: { annual: Math.round(lowAnnual), monthly: Math.round(lowAnnual / 12) },
  }
}
