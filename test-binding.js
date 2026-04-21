// Quick test to see what share we get at S=0
import { calculateTax } from './src/engines/taxEngine.ts';
import { calculateCCB } from './src/engines/ccbEngine.ts';
import { calculateINDI, calculateINDIPercentage } from './src/engines/indiEngine.ts';
import { calculateChildSupport } from './src/engines/childSupportEngine.ts';

const payorGrossIncome = 100000;
const recipientGrossIncome = 50000;
const children = [{ age: 8, disabilitySupplementEligible: false }];

// Calculate child support first
const childSupport = calculateChildSupport({
  payorIncome: payorGrossIncome,
  recipientIncome: recipientGrossIncome,
  children,
  parentingArrangement: 'sole_recipient',
});

console.log('\n=== CHILD SUPPORT ===');
console.log('Monthly:', childSupport.monthlyAmount);

// Calculate at S=0
const payorTax = calculateTax({
  grossIncome: payorGrossIncome,
  spousalSupportPaid: 0,
  spousalSupportReceived: 0,
  rrspContributions: 0,
  unionDues: 0,
  otherDeductions: 0,
  taxYear: 2025,
});

const recipientTax = calculateTax({
  grossIncome: recipientGrossIncome,
  spousalSupportPaid: 0,
  spousalSupportReceived: 0,
  rrspContributions: 0,
  unionDues: 0,
  otherDeductions: 0,
  taxYear: 2025,
});

const ccb = calculateCCB({
  adjustedFamilyNetIncome: recipientTax.taxableIncome,
  children,
  custodyType: 'sole',
});

console.log('\n=== CCB ===');
console.log('Monthly:', ccb.totalMonthlyBenefit);

const payorINDI = calculateINDI({
  grossIncome: payorGrossIncome,
  taxResult: payorTax,
  ccbAllocated: 0,
  childSupportPaid: childSupport.monthlyAmount,
  childSupportReceived: 0,
  spousalSupportPaid: 0,
  spousalSupportReceived: 0,
});

const recipientINDI = calculateINDI({
  grossIncome: recipientGrossIncome,
  taxResult: recipientTax,
  ccbAllocated: ccb.totalMonthlyBenefit,
  childSupportPaid: 0,
  childSupportReceived: childSupport.monthlyAmount,
  spousalSupportPaid: 0,
  spousalSupportReceived: 0,
});

const combinedINDI = payorINDI.netDisposableIncome + recipientINDI.netDisposableIncome;
const share = calculateINDIPercentage(recipientINDI.netDisposableIncome, combinedINDI);

console.log('\n=== INDI AT S=0 ===');
console.log('Payor INDI:', payorINDI.netDisposableIncome.toFixed(2));
console.log('Recipient INDI:', recipientINDI.netDisposableIncome.toFixed(2));
console.log('Combined INDI:', combinedINDI.toFixed(2));
console.log('Recipient Share:', (share * 100).toFixed(2) + '%');
console.log('');
console.log('Target 40%:', share >= 0.40 ? 'BINDING FLOOR (already met)' : 'OK to solve');
console.log('Target 43%:', share >= 0.43 ? 'BINDING FLOOR (already met)' : 'OK to solve');
console.log('Target 46%:', share >= 0.46 ? 'BINDING FLOOR (already met)' : 'OK to solve');
