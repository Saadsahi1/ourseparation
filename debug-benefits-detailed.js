/**
 * Detailed benefit calculation debug for Case 1
 *
 * Goal: Understand what net income produces DivorceMate's expected benefits
 */

console.log('=== CASE 1: Trying to match expected benefits ===\n');
console.log('Expected at High scenario:');
console.log('- CCB: $10,708/year = $892.33/month');
console.log('- GST: $0');
console.log('- OCB: $170/year = $14.17/month');
console.log('- OTB: $0');
console.log('- Total: $10,878/year = $906.50/month\n');

// Try net income of $64,500 (calculated earlier)
const netIncome = 64500;
console.log(`Testing at net income: $${netIncome}\n`);

// GST 2025 official parameters
const gstAdult = 533;
const gstChild = 184;
const gstMax = gstAdult + (gstChild * 2);
const gstThreshold = 45521;
const gstPhaseout = Math.max(0, (netIncome - gstThreshold) * 0.05);
const gst = Math.max(0, gstMax - gstPhaseout);
console.log(`GST Calculation:`);
console.log(`  Max: $${gstMax} ($${gstAdult} adult + $${gstChild}*2 children)`);
console.log(`  Threshold: $${gstThreshold}`);
console.log(`  Phaseout: $${gstPhaseout.toFixed(2)}`);
console.log(`  Result: $${gst.toFixed(2)} (Expected: $0) ${gst === 0 ? '✓' : '✗'}\n`);

// OCB 2025 official parameters
const ocbPerChild = 1727;
const ocbMax = ocbPerChild * 2;
const ocbThreshold = 26364;
const ocbPhaseout = Math.max(0, (netIncome - ocbThreshold) * 0.057);
const ocb = Math.max(0, ocbMax - ocbPhaseout);
console.log(`OCB Calculation:`);
console.log(`  Max: $${ocbMax} ($${ocbPerChild}*2 children)`);
console.log(`  Threshold: $${ocbThreshold}`);
console.log(`  Phaseout: $${ocbPhaseout.toFixed(2)}`);
console.log(`  Result: $${ocb.toFixed(2)} (Expected: $170) ${Math.abs(ocb - 170) < 5 ? '✓' : '✗'}\n`);

// OTB 2025 official parameters
const otbPerPerson = 371;
const otbMax = otbPerPerson * 3; // 1 adult + 2 children
const otbThreshold = 35632;
const otbPhaseout = Math.max(0, (netIncome - otbThreshold) * 0.04);
const otb = Math.max(0, otbMax - otbPhaseout);
console.log(`OTB Calculation:`);
console.log(`  Max: $${otbMax} ($${otbPerPerson}*3 people)`);
console.log(`  Threshold: $${otbThreshold}`);
console.log(`  Phaseout: $${otbPhaseout.toFixed(2)}`);
console.log(`  Result: $${otb.toFixed(2)} (Expected: $0) ${otb === 0 ? '✓' : '✗'}\n`);

const totalNonCCB = gst + ocb + otb;
console.log(`Total non-CCB benefits: $${totalNonCCB.toFixed(2)}`);
console.log(`Plus CCB $10,708 = Total $${(totalNonCCB + 10708).toFixed(2)}`);
console.log(`Expected total: $10,878`);
console.log(`Delta: $${Math.abs((totalNonCCB + 10708) - 10878).toFixed(2)}\n`);

// The problem is clear: our totals don't match!
// Let me try to reverse-engineer the correct net income

console.log('=== REVERSE ENGINEERING ===\n');
console.log('Working backwards from OCB = $170:\n');

// If OCB = $170 and max is $3,454 (using NEW parameters)
// Then phaseout = $3,454 - $170 = $3,284
// With 5.7% phaseout rate: (netIncome - $26,364) = $3,284 / 0.057 = $57,614.04
// So netIncome = $26,364 + $57,614.04 = $83,978.04

const reverseNetIncome = 26364 + ((ocbMax - 170) / 0.057);
console.log(`If OCB = $170 with max $${ocbMax}:`);
console.log(`  Phaseout needed: $${(ocbMax - 170).toFixed(2)}`);
console.log(`  Income above threshold: $${((ocbMax - 170) / 0.057).toFixed(2)}`);
console.log(`  Implied net income: $${reverseNetIncome.toFixed(2)}\n`);

// Test GST at this income
const gstAtReverse = Math.max(0, gstMax - ((reverseNetIncome - gstThreshold) * 0.05));
console.log(`GST at $${reverseNetIncome.toFixed(2)}: $${gstAtReverse.toFixed(2)}`);

// Test OTB at this income
const otbAtReverse = Math.max(0, otbMax - ((reverseNetIncome - otbThreshold) * 0.04));
console.log(`OTB at $${reverseNetIncome.toFixed(2)}: $${otbAtReverse.toFixed(2)}`);

// Aha! The issue is that DivorceMate might be using DIFFERENT OCB parameters!
// Let me try the OLD parameters
console.log('\n=== TRYING OLD (2024 INFLATED) PARAMETERS ===\n');

const ocbPerChildOld = 1638;
const ocbMaxOld = ocbPerChildOld * 2;
const ocbThresholdOld = 25675;
const ocbPhaseoutOld = Math.max(0, (netIncome - ocbThresholdOld) * 0.08);
const ocbOld = Math.max(0, ocbMaxOld - ocbPhaseoutOld);

console.log(`OCB with OLD parameters at $${netIncome}:`);
console.log(`  Max: $${ocbMaxOld} ($${ocbPerChildOld}*2)`);
console.log(`  Threshold: $${ocbThresholdOld}`);
console.log(`  Phaseout (8%): $${ocbPhaseoutOld.toFixed(2)}`);
console.log(`  Result: $${ocbOld.toFixed(2)} (Expected: $170) ${Math.abs(ocbOld - 170) < 5 ? '✓' : '✗'}\n`);
