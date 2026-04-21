/**
 * Test benefit calculations at different income levels to verify formulas
 */

// DivorceMate Case 1 expectations:
// At High scenario (recipient income ~$67k including $17.9k SS):
// - CCB: $10,708/year
// - GST: $0
// - OCB: $170/year
// - OTB: $0
// - Total: $10,878/year

console.log('=== Testing Benefit Formulas ===\n');

// Test at $50k (recipient base, S=0)
console.log('Income: $50,000 (recipient base, S=0)');
const income50k = 50000;
const numChildren = 2;

// GST 2024-2025
const gstAdult = 519;
const gstChild = 179;
const gstMax50k = gstAdult + (gstChild * numChildren);
const gstThreshold = 43561;
const gst50k = Math.max(0, gstMax50k - Math.max(0, (income50k - gstThreshold) * 0.05));
console.log(`  GST: $${gst50k.toFixed(2)} (max $${gstMax50k}, threshold $${gstThreshold})`);

// OCB DivorceMate-compatible
const ocbPerChild = 1638;
const ocbMax50k = ocbPerChild * numChildren;
const ocbThreshold = 25675;
const ocb50k = Math.max(0, ocbMax50k - Math.max(0, (income50k - ocbThreshold) * 0.08));
console.log(`  OCB: $${ocb50k.toFixed(2)} (max $${ocbMax50k}, phaseout ${((income50k - ocbThreshold) * 0.08).toFixed(2)})`);

// OTB 2024-2025
const otbPerPerson = 360;
const otbMax50k = otbPerPerson * 3; // 1 adult + 2 kids
const otbThreshold = 34661;
const otb50k = Math.max(0, otbMax50k - Math.max(0, (income50k - otbThreshold) * 0.04));
console.log(`  OTB: $${otb50k.toFixed(2)} (max $${otbMax50k}, threshold $${otbThreshold})`);

console.log(`  Total (excl CCB): $${(gst50k + ocb50k + otb50k).toFixed(2)}\n`);

// Test at $67,856 (recipient at High SS)
console.log('Income: $67,856 (recipient base + High SS)');
const income68k = 67856;

const gstMax68k = gstAdult + (gstChild * numChildren);
const gst68k = Math.max(0, gstMax68k - Math.max(0, (income68k - gstThreshold) * 0.05));
console.log(`  GST: $${gst68k.toFixed(2)} (expected $0)`);

const ocbMax68k = ocbPerChild * numChildren;
const ocb68k = Math.max(0, ocbMax68k - Math.max(0, (income68k - ocbThreshold) * 0.08));
console.log(`  OCB: $${ocb68k.toFixed(2)} (expected $170)`);

const otbMax68k = otbPerPerson * 3;
const otb68k = Math.max(0, otbMax68k - Math.max(0, (income68k - otbThreshold) * 0.04));
console.log(`  OTB: $${otb68k.toFixed(2)} (expected $0)`);

console.log(`  Total (excl CCB): $${(gst68k + ocb68k + otb68k).toFixed(2)} (expected $170)`);

// Check if formulas match
console.log('\n=== Formula Verification ===');
if (Math.abs(gst68k - 0) < 5 && Math.abs(ocb68k - 170) < 5 && Math.abs(otb68k - 0) < 5) {
  console.log('✓ Formulas match DivorceMate at $67,856 income');
} else {
  console.log('✗ Formulas DO NOT match DivorceMate');
  console.log(`  GST delta: $${(gst68k - 0).toFixed(2)}`);
  console.log(`  OCB delta: $${(ocb68k - 170).toFixed(2)}`);
  console.log(`  OTB delta: $${(otb68k - 0).toFixed(2)}`);
}
