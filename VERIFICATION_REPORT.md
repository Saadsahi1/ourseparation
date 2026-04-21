# SSAG Calculator Verification Report

**Date:** December 23, 2025
**Version:** 1.0.0
**Status:** IN PROGRESS - Verification Phase

## Executive Summary

This document provides an audit-style breakdown of the SSAG calculator validation process. It documents what has been validated, what has failed, and what corrections are needed before the calculator can be considered accurate for legal use.

**CRITICAL:** This calculator is NOT yet validated for production use. Do not use for legal agreements until all reference tests pass.

## Test Results Summary

### CCB Engine Validation

**Test Run:** December 23, 2025
**Reference Source:** CRA CCB Calculator (July 2025 - June 2026)
**Total Cases:** 12
**Passed:** 7 (58.3%)
**Failed:** 5 (41.7%)

#### Passed Cases
✅ CCB001 - Low income, single child under 6
✅ CCB002 - Low income, single child 6-17
✅ CCB003 - Two children at threshold
✅ CCB008 - Child with disability supplement
✅ CCB012 - Two young children under 6
✅ Edge case: Zero AFNI
✅ Edge case: AFNI at threshold

#### Failed Cases
❌ CCB004 - Single child, AFNI above threshold (reduction incorrect)
❌ CCB005 - Two children, moderate AFNI ($253.29 error)
❌ CCB006 - Three children, higher AFNI ($1,029.78 error)
❌ CCB007 - Four children, high AFNI ($1,634.58 error)
❌ CCB009 - Shared custody ($1.01 rounding error)
❌ CCB010 - AFNI approaching phase 2
❌ CCB011 - AFNI above phase 2 threshold ($39.36 error)

### Root Cause Analysis

**Issue:** CCB reduction formula is incorrect for cases above income threshold.

**Current Implementation:** The reduction is calculated per child, which is incorrect.

**Correct Implementation:** Per CRA documentation, the CCB reduction should be:
1. Calculate total maximum family benefit
2. Apply reduction to FAMILY total based on excess income
3. Reduction formula: `(AFNI - threshold) × reduction_rate_for_family_size`

**Error Pattern:**
- Errors increase with number of children
- Errors increase with income above threshold
- This confirms the reduction rate is being misapplied

### Tax Engine Validation

**Status:** NOT YET RUN
**Next Step:** Run tax reference tests after CCB is fixed

### SSAG Solver Validation

**Status:** NOT YET RUN
**Dependencies:** Requires CCB and Tax engines to be validated first

## Known Limitations

### Currently Validated
- ✅ CCB for low-income families (below threshold)
- ✅ CCB maximum amounts by age
- ✅ Disability supplement
- ✅ Basic custody allocation

### NOT Validated
- ❌ CCB income phase-out calculations
- ❌ Tax calculations (any income level)
- ❌ Spousal support tax deductibility
- ❌ INDI calculations
- ❌ SSAG 40%/43%/46% targets
- ❌ Shared parenting arrangements
- ❌ Solver convergence accuracy

## Verification Mode

### Implementation Status
✅ Verification mode added to SSAG solver
✅ Captures iteration trace with:
- Test spousal support amounts
- Tax calculations at each iteration
- CCB calculations
- INDI calculations
- Convergence status

### Output Format
When `verificationMode: true`, solver returns:
```typescript
{
  low: SSAGScenario,
  mid: SSAGScenario,
  high: SSAGScenario,
  verification: {
    low: VerificationBreakdown,
    mid: VerificationBreakdown,
    high: VerificationBreakdown
  }
}
```

Each `VerificationBreakdown` includes:
- Tax year and benefit period
- All tax parameters used (brackets, rates, thresholds)
- CCB parameters (max amounts, reduction rates)
- Child support calculation details
- Complete solver trace (all iterations)

## Required Fixes

### Priority 1: CCB Engine
**Issue:** Reduction formula incorrect
**Fix Required:** Implement correct CRA reduction formula
**Blocking:** All SSAG calculations

### Priority 2: Tax Engine Validation
**Issue:** Not yet validated against reference cases
**Fix Required:** Run tax_reference_cases.json tests
**Blocking:** INDI and SSAG calculations

### Priority 3: Common SSAG Errors
**Tests Needed:**
1. ❌ Order of operations (child support before spousal)
2. ❌ Tax treatment (deductibility/taxability)
3. ❌ CCB allocation (sole vs shared)

### Priority 4: INDI Target Validation
**Tests Needed:**
- ❌ Recipient INDI reaches 40% ± 0.1%
- ❌ Recipient INDI reaches 43% ± 0.1%
- ❌ Recipient INDI reaches 46% ± 0.1%

## Compliance Statement

**DO NOT USE THIS CALCULATOR FOR LEGAL AGREEMENTS** until:
1. All CCB reference tests pass (12/12)
2. All tax reference tests pass (10/10)
3. All SSAG integration tests pass
4. Common error tests pass
5. This verification report is updated to show 100% pass rate

## Next Steps

1. Fix CCB reduction formula
2. Re-run CCB reference tests (must achieve 100%)
3. Run tax reference tests
4. Fix any tax calculation errors
5. Run SSAG integration tests
6. Document final accuracy report

## Contact

For questions about this verification process or to report discrepancies:
- Review CRA documentation
- Consult with tax professional
- Do NOT adjust expected values to make tests pass

---

**Last Updated:** December 23, 2025
**Report Version:** 1.0.0
**Next Review:** After CCB fixes implemented
