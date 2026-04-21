/**
 * Debug script to test benefit calculations at known DivorceMate income levels
 */

// Import benefit calculation functions (simulated - we'll calculate manually)

// Case 1: Expected recipient net income at High scenario
// From DivorceMate, recipient has these expected benefits at High:
// - CCB: $10,708/year
// - GST: $0
// - OCB: $170/year
// - OTB: $0
// - Total: $10,878/year = $906.50/month

// Let's reverse-engineer what net income produces these benefits

console.log('=== CASE 1 BENEFIT ANALYSIS ===\n');

// We know CCB should be $10,708/year for 2 children (ages 4, 9)
// This gives us a clue about the net income level

// GST = $0 means net income is high enough to phase it out completely
// GST max for 1 adult + 2 children: $349 + $184*2 = $717
// Threshold: $44,738
// Phase out at 5%: So $717 phases out at income of $44,738 + ($717/0.05) = $44,738 + $14,340 = $59,078

// If GST = $0, net income must be > $59,078

// OCB = $170/year
// OCB max for 2 children: $1,638 * 2 = $3,276
// Threshold: $25,675
// Phase out at 8%: (netIncome - $25,675) * 0.08 = phaseout

// If remaining benefit is $170:
// $3,276 - phaseout = $170
// phaseout = $3,106
// (netIncome - $25,675) = $3,106 / 0.08 = $38,825
// netIncome = $64,500

console.log('OCB Analysis:');
console.log('Max benefit (2 children): $3,276');
console.log('Expected benefit: $170');
console.log('Phaseout needed: $3,106');
console.log('Implied net income: $64,500\n');

// But wait - if net income is $64,500, then GST should be:
const netIncome = 64500;
const gstMax = 349 + (184 * 2);
const gstThreshold = 44738;
const gstPhaseout = (netIncome - gstThreshold) * 0.05;
const gst = Math.max(0, gstMax - gstPhaseout);
console.log(`GST at net income $${netIncome}: $${gst.toFixed(2)}`);
console.log(`(Max: $${gstMax}, Phaseout: $${gstPhaseout.toFixed(2)})\n`);

// Hmm, that gives GST = $0, which matches!

// Let me verify OCB at this income:
const ocbMax = 1638 * 2;
const ocbThreshold = 25675;
const ocbPhaseout = (netIncome - ocbThreshold) * 0.08;
const ocb = Math.max(0, ocbMax - ocbPhaseout);
console.log(`OCB at net income $${netIncome}: $${ocb.toFixed(2)}`);
console.log(`(Max: $${ocbMax}, Phaseout: $${ocbPhaseout.toFixed(2)})\n`);

// That gives OCB = $169.20, very close to $170!

// OTB at this income:
const otbAdult = 370;
const otbChild = 123;
const otbMax = otbAdult + (otbChild * 2);
const otbThreshold = 25675;
const otbPhaseout = (netIncome - otbThreshold) * 0.04;
const otb = Math.max(0, otbMax - otbPhaseout);
console.log(`OTB at net income $${netIncome}: $${otb.toFixed(2)}`);
console.log(`(Max: $${otbMax}, Phaseout: $${otbPhaseout.toFixed(2)})\n`);

// CWB - probably $0 at this income level
console.log('CWB: $0 (income too high)\n');

const totalBenefits = gst + ocb + otb;
console.log(`Total non-CCB benefits: $${totalBenefits.toFixed(2)}`);
console.log(`Plus CCB of $10,708 = $${(totalBenefits + 10708).toFixed(2)}`);
console.log(`Expected total: $10,878\n`);

// The issue is clear: our calculations are producing reasonable results!
// So the problem must be that we're calculating benefits at the WRONG income level.

console.log('\n=== CASE 3 BENEFIT ANALYSIS (S=0 scenario) ===\n');

// Case 3: Recipient gross $25k, receives child support $1,072/month = $12,864/year
// Expected benefits at S=0:
// - CCB: $14,744/year
// - GST: $1,066/year
// - OCB: $3,452/year
// - OTB: $1,110/year
// - Total: $20,372/year

// Let's figure out what net income produces these benefits
// Recipient starts with $25k gross, receives $12,864 child support
// After taxes on $25k, net would be roughly $23k
// Plus child support (not taxed): $12,864
// Total income for benefit purposes: ~$35,864

const case3NetIncome = 35864; // Estimate

console.log(`Estimated net income: $${case3NetIncome}\n`);

// GST calculation
const gst3 = 349 + (184 * 2);
const gstThreshold3 = 44738;
if (case3NetIncome <= gstThreshold3) {
  console.log(`GST at net income $${case3NetIncome}: $${gst3} (below threshold)`);
} else {
  const phaseout = (case3NetIncome - gstThreshold3) * 0.05;
  console.log(`GST: $${Math.max(0, gst3 - phaseout).toFixed(2)}`);
}
console.log(`Expected: $1,066\n`);

// OCB calculation
const ocb3Max = 1638 * 2;
const ocb3Threshold = 25675;
if (case3NetIncome <= ocb3Threshold) {
  console.log(`OCB at net income $${case3NetIncome}: $${ocb3Max} (below threshold)`);
} else {
  const phaseout = (case3NetIncome - ocb3Threshold) * 0.08;
  console.log(`OCB: $${Math.max(0, ocb3Max - phaseout).toFixed(2)}`);
}
console.log(`Expected: $3,452\n`);

// OTB calculation
const otb3Max = 370 + (123 * 2);
const otb3Threshold = 25675;
if (case3NetIncome <= otb3Threshold) {
  console.log(`OTB at net income $${case3NetIncome}: $${otb3Max} (below threshold)`);
} else {
  const phaseout = (case3NetIncome - otb3Threshold) * 0.04;
  console.log(`OTB: $${Math.max(0, otb3Max - phaseout).toFixed(2)}`);
}
console.log(`Expected: $1,110\n`);
