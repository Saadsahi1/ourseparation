import { solveSSAG } from './src/engines/ssagWithChildrenSolver.ts';

const inputs = {
  payorGrossIncome: 95000,
  recipientGrossIncome: 40000,
  relationshipYears: 10,
  children: [{ age: 8, disabilitySupplementEligible: false }],
  parentingArrangement: 'sole_recipient',
  payorDeductions: {
    rrspContributions: 0,
    unionDues: 0,
    otherDeductions: 0,
  },
  recipientDeductions: {
    rrspContributions: 0,
    unionDues: 0,
    otherDeductions: 0,
  },
  taxYear: 2025,
};

const result = solveSSAG(inputs);

console.log('\n=== LOW (40%) ===');
console.log('Spousal Support:', result.low.monthlySpousalSupport);
console.log('Actual Share:', (result.low.actualINDIPercent * 100).toFixed(2) + '%');
console.log('Target Share:', (result.low.targetINDIPercent * 100).toFixed(2) + '%');
console.log('Binding Floor:', result.low.bindingFloor);
console.log('Binding Ceiling:', result.low.bindingCeiling);
console.log('Feasible:', result.low.feasible);

console.log('\n=== MID (43%) ===');
console.log('Spousal Support:', result.mid.monthlySpousalSupport);
console.log('Actual Share:', (result.mid.actualINDIPercent * 100).toFixed(2) + '%');
console.log('Target Share:', (result.mid.targetINDIPercent * 100).toFixed(2) + '%');
console.log('Binding Floor:', result.mid.bindingFloor);
console.log('Binding Ceiling:', result.mid.bindingCeiling);
console.log('Feasible:', result.mid.feasible);

console.log('\n=== HIGH (46%) ===');
console.log('Spousal Support:', result.high.monthlySpousalSupport);
console.log('Actual Share:', (result.high.actualINDIPercent * 100).toFixed(2) + '%');
console.log('Target Share:', (result.high.targetINDIPercent * 100).toFixed(2) + '%');
console.log('Binding Floor:', result.high.bindingFloor);
console.log('Binding Ceiling:', result.high.bindingCeiling);
console.log('Feasible:', result.high.feasible);
