import { calculateTax } from './src/engines/taxEngine.js';

const result = calculateTax({
  grossIncome: 50000,
  rrspContributions: 0,
  unionDues: 0,
  childCareCosts: 0,
  otherDeductions: 0,
  spousalSupportPaid: 0,
  spousalSupportReceived: 0,
}, 2025);

console.log('Tax calculation result:', JSON.stringify(result, null, 2));
