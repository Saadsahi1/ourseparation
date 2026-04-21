/**
 * Income Base Experiment
 *
 * Tests whether DivorceMate uses netIncome or taxableIncome as the base
 * for benefit calculations by comparing deltas for both approaches.
 */

import { calculateTax } from './src/engines/taxEngine.js';
import { calculateBenefitsCredits } from './src/engines/benefitsCreditsEngine.js';

// DivorceMate parity cases
const cases = {
  case1: {
    name: "Case 1: Moderate income, 2 children",
    spousalSupport: 1488, // High scenario monthly
    recipientGrossIncome: 50000,
    children: [
      { age: 4, disabilitySupplementEligible: false },
      { age: 9, disabilitySupplementEligible: false }
    ],
    expectedBenefits: {
      ccb: 10708 / 12,
      gst: 0,
      ocb: 170 / 12,
      otb: 0,
      total: 10878 / 12
    }
  },
  case3: {
    name: "Case 3: Low income, 2 children",
    spousalSupport: 0, // S=0 scenario
    recipientGrossIncome: 25000,
    children: [
      { age: 13, disabilitySupplementEligible: false },
      { age: 5, disabilitySupplementEligible: false }
    ],
    expectedBenefits: {
      ccb: 14744 / 12,
      gst: 1066 / 12,
      ocb: 3452 / 12,
      otb: 1110 / 12,
      total: 20372 / 12
    }
  }
};

console.log('='.repeat(100));
console.log('INCOME BASE EXPERIMENT: netIncome vs taxableIncome');
console.log('='.repeat(100));

for (const [key, testCase] of Object.entries(cases)) {
  console.log(`\n${testCase.name}`);
  console.log('-'.repeat(100));

  const annualSpousalSupport = testCase.spousalSupport * 12;
  const grossIncomeWithSupport = testCase.recipientGrossIncome + annualSpousalSupport;

  // Calculate tax to get both income bases
  const taxResult = calculateTax({
    grossIncome: grossIncomeWithSupport,
    rrspContributions: 0,
    unionDues: 0,
    childCareCosts: 0,
    otherDeductions: 0,
    spousalSupportPaid: 0,
    spousalSupportReceived: annualSpousalSupport,
  }, 2025);

  console.log(`\nGross Income (with support): $${grossIncomeWithSupport.toLocaleString()}`);
  console.log(`Taxable Income: $${taxResult.taxableIncome.toLocaleString()}`);
  console.log(`Net Income (Line 236): $${taxResult.netIncome.toLocaleString()}`);
  console.log(`Income Base Difference: $${(taxResult.taxableIncome - taxResult.netIncome).toLocaleString()}`);

  // Test 1: Using netIncome
  console.log(`\n${'TEST 1: Using netIncome'.padEnd(50, ' ')}`);
  const benefitsNetIncome = calculateBenefitsCredits({
    taxYear: 2025,
    grossIncome: grossIncomeWithSupport,
    taxableIncome: taxResult.taxableIncome,
    netIncome: taxResult.netIncome,
    uccb: 0,
    children: testCase.children,
    spousalSupportPaid: 0,
    spousalSupportReceived: annualSpousalSupport,
    context: {
      benefitsPeriodIdGST: '2024-07-2025-06',
      benefitsPeriodIdON: '2024-07-2025-06',
      benefitsPeriodIdCWB: '2025',
      benefitsPeriodIdCCB: '2024-07-2025-06',
      familyStatusForBenefits: 'single',
      incomeBaseForBenefits: 'netIncome',
    }
  });

  const ccbMonthly1 = benefitsNetIncome.ccb / 12;
  const gstMonthly1 = benefitsNetIncome.gstCredit / 12;
  const ocbMonthly1 = benefitsNetIncome.ontarioChildBenefit / 12;
  const otbMonthly1 = benefitsNetIncome.ontarioTrilliumBenefit / 12;
  const totalMonthly1 = benefitsNetIncome.totalBenefits / 12;

  console.log(`CCB:   $${ccbMonthly1.toFixed(2).padStart(10)} | Expected: $${testCase.expectedBenefits.ccb.toFixed(2).padStart(10)} | Delta: $${(ccbMonthly1 - testCase.expectedBenefits.ccb).toFixed(2)}`);
  console.log(`GST:   $${gstMonthly1.toFixed(2).padStart(10)} | Expected: $${testCase.expectedBenefits.gst.toFixed(2).padStart(10)} | Delta: $${(gstMonthly1 - testCase.expectedBenefits.gst).toFixed(2)}`);
  console.log(`OCB:   $${ocbMonthly1.toFixed(2).padStart(10)} | Expected: $${testCase.expectedBenefits.ocb.toFixed(2).padStart(10)} | Delta: $${(ocbMonthly1 - testCase.expectedBenefits.ocb).toFixed(2)}`);
  console.log(`OTB:   $${otbMonthly1.toFixed(2).padStart(10)} | Expected: $${testCase.expectedBenefits.otb.toFixed(2).padStart(10)} | Delta: $${(otbMonthly1 - testCase.expectedBenefits.otb).toFixed(2)}`);
  console.log(`TOTAL: $${totalMonthly1.toFixed(2).padStart(10)} | Expected: $${testCase.expectedBenefits.total.toFixed(2).padStart(10)} | Delta: $${(totalMonthly1 - testCase.expectedBenefits.total).toFixed(2)}`);

  const totalDelta1 = Math.abs(totalMonthly1 - testCase.expectedBenefits.total);

  // Test 2: Using taxableIncome
  console.log(`\n${'TEST 2: Using taxableIncome'.padEnd(50, ' ')}`);
  const benefitsTaxableIncome = calculateBenefitsCredits({
    taxYear: 2025,
    grossIncome: grossIncomeWithSupport,
    taxableIncome: taxResult.taxableIncome,
    netIncome: taxResult.netIncome,
    uccb: 0,
    children: testCase.children,
    spousalSupportPaid: 0,
    spousalSupportReceived: annualSpousalSupport,
    context: {
      benefitsPeriodIdGST: '2024-07-2025-06',
      benefitsPeriodIdON: '2024-07-2025-06',
      benefitsPeriodIdCWB: '2025',
      benefitsPeriodIdCCB: '2024-07-2025-06',
      familyStatusForBenefits: 'single',
      incomeBaseForBenefits: 'taxableIncome',
    }
  });

  const ccbMonthly2 = benefitsTaxableIncome.ccb / 12;
  const gstMonthly2 = benefitsTaxableIncome.gstCredit / 12;
  const ocbMonthly2 = benefitsTaxableIncome.ontarioChildBenefit / 12;
  const otbMonthly2 = benefitsTaxableIncome.ontarioTrilliumBenefit / 12;
  const totalMonthly2 = benefitsTaxableIncome.totalBenefits / 12;

  console.log(`CCB:   $${ccbMonthly2.toFixed(2).padStart(10)} | Expected: $${testCase.expectedBenefits.ccb.toFixed(2).padStart(10)} | Delta: $${(ccbMonthly2 - testCase.expectedBenefits.ccb).toFixed(2)}`);
  console.log(`GST:   $${gstMonthly2.toFixed(2).padStart(10)} | Expected: $${testCase.expectedBenefits.gst.toFixed(2).padStart(10)} | Delta: $${(gstMonthly2 - testCase.expectedBenefits.gst).toFixed(2)}`);
  console.log(`OCB:   $${ocbMonthly2.toFixed(2).padStart(10)} | Expected: $${testCase.expectedBenefits.ocb.toFixed(2).padStart(10)} | Delta: $${(ocbMonthly2 - testCase.expectedBenefits.ocb).toFixed(2)}`);
  console.log(`OTB:   $${otbMonthly2.toFixed(2).padStart(10)} | Expected: $${testCase.expectedBenefits.otb.toFixed(2).padStart(10)} | Delta: $${(otbMonthly2 - testCase.expectedBenefits.otb).toFixed(2)}`);
  console.log(`TOTAL: $${totalMonthly2.toFixed(2).padStart(10)} | Expected: $${testCase.expectedBenefits.total.toFixed(2).padStart(10)} | Delta: $${(totalMonthly2 - testCase.expectedBenefits.total).toFixed(2)}`);

  const totalDelta2 = Math.abs(totalMonthly2 - testCase.expectedBenefits.total);

  // Comparison
  console.log(`\n${'COMPARISON'.padEnd(50, ' ')}`);
  console.log(`Total Delta with netIncome:      $${totalDelta1.toFixed(2)}`);
  console.log(`Total Delta with taxableIncome:  $${totalDelta2.toFixed(2)}`);

  if (totalDelta1 < totalDelta2) {
    console.log(`✅ netIncome produces smaller delta (better match)`);
  } else if (totalDelta2 < totalDelta1) {
    console.log(`✅ taxableIncome produces smaller delta (better match)`);
  } else {
    console.log(`⚖️  Both produce same delta`);
  }
}

console.log('\n' + '='.repeat(100));
console.log('EXPERIMENT COMPLETE');
console.log('='.repeat(100));
