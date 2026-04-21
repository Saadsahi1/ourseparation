import { calculateTax } from './src/engines/taxEngine.ts';
import { calculateBenefitsCredits } from './src/engines/benefitsCreditsEngine.ts';
import { calculateCCB } from './src/engines/ccbEngine.ts';

// Simulate recipient (Aaron) income scenario in Low SSAG (spousal support = $1,951/month = $23,412 annual)
const recipientGrossIncome = 25000;
const spousalSupportReceived = 1951 * 12; // $23,412 annual

console.log('=== RECIPIENT (Aaron) - Low SSAG Scenario ===');
console.log('Gross Income:', recipientGrossIncome);
console.log('Spousal Support Received (annual):', spousalSupportReceived);

// Calculate taxes
const taxResult = calculateTax({
  grossIncome: recipientGrossIncome,
  spousalSupportPaid: 0,
  spousalSupportReceived: spousalSupportReceived,
  rrspContributions: 0,
  unionDues: 0,
  otherDeductions: 0,
  taxYear: 2025,
});

console.log('\n=== TAX CALCULATION ===');
console.log('Taxable Income (Line 26000):', taxResult.taxableIncome);
console.log('Net Income (Line 23600):', taxResult.netIncome);
console.log('Federal Tax:', taxResult.federalTax);
console.log('Provincial Tax:', taxResult.provincialTax);

// Calculate benefits using net income
const benefitsResult = calculateBenefitsCredits({
  taxYear: 2025,
  grossIncome: recipientGrossIncome,
  taxableIncome: taxResult.taxableIncome,
  netIncome: taxResult.netIncome,
  uccb: 0,
  children: [{ age: 4, disabilitySupplementEligible: false }],
  spousalSupportPaid: 0,
  spousalSupportReceived: spousalSupportReceived,
});

console.log('\n=== BENEFITS CALCULATION ===');
console.log('CCB (annual):', benefitsResult.ccb);
console.log('GST (annual):', benefitsResult.gstCredit);
console.log('OCB (annual):', benefitsResult.ontarioChildBenefit);
console.log('OTB (annual):', benefitsResult.ontarioTrilliumBenefit);
console.log('Total (annual):', benefitsResult.totalBenefits);

console.log('\nCCB (monthly):', benefitsResult.ccb / 12);
console.log('GST (monthly):', benefitsResult.gstCredit / 12);
console.log('OCB (monthly):', benefitsResult.ontarioChildBenefit / 12);
console.log('OTB (monthly):', benefitsResult.ontarioTrilliumBenefit / 12);
console.log('Total (monthly):', benefitsResult.totalBenefits / 12);

console.log('\n=== DIVORCEMATE TARGET (Low scenario) ===');
console.log('Net Income (Line 23600): 48,202');
console.log('CCB (annual): 7,247');
console.log('GST (annual): 748');
console.log('OCB (annual): 0');
console.log('OTB (annual): 237');
console.log('Total (annual): 8,232');
console.log('Total (monthly): 686');

// Also test CCB directly
console.log('\n=== DIRECT CCB TEST ===');
const ccbDirect = calculateCCB({
  adjustedFamilyNetIncome: taxResult.netIncome,
  children: [{ age: 4, isDisabled: false }],
  custodyType: 'sole',
}, '2024-07-2025-06');
console.log('CCB (annual via direct call):', ccbDirect.totalAnnualBenefit);
console.log('CCB (monthly via direct call):', ccbDirect.totalAnnualBenefit / 12);
