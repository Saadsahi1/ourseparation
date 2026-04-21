# Ontario SSAG Calculator - Technical Documentation

## ⚠️ VERIFICATION STATUS: IN PROGRESS

**DO NOT USE FOR LEGAL AGREEMENTS**

This calculator is currently undergoing validation testing. It is NOT ready for production use.

See [VERIFICATION_REPORT.md](./VERIFICATION_REPORT.md) for detailed audit results.

---

## Overview

This calculator implements the Spousal Support Advisory Guidelines (SSAG) "with child support" formula for Ontario, Canada.

### Supported Tax Year & Benefit Period

- **Tax Year:** 2024
- **Benefit Period:** July 2025 - June 2026
- **Province:** Ontario only
- **Child Support Table:** Ontario 2025

### Calculation Method

The calculator uses the **INDI (Individual Net Disposable Income) method** to determine spousal support:

1. Calculate child support first (Ontario table)
2. Calculate taxes for both parties (federal + Ontario + CPP + EI + health premium)
3. Calculate Canada Child Benefit (CCB)
4. Calculate INDI for each party (net income after taxes, support, and benefits)
5. Iteratively solve for spousal support amount where recipient INDI = target % of combined INDI

**SSAG Targets:**
- Low range: 40% recipient INDI
- Mid range: 43% recipient INDI
- High range: 46% recipient INDI

---

## What Is Validated

### ✅ Currently Passing Validation

**CCB Engine:**
- Maximum benefit amounts for children under 6 and 6-17
- Disability supplement ($3,411/year)
- Zero income edge cases
- Income at threshold edge cases

**Verification Mode:**
- Detailed iteration trace
- Tax parameter documentation
- CCB parameter documentation
- Solver convergence tracking

### ❌ NOT Validated - Do Not Trust

**CCB Engine:**
- Income phase-out reductions (FAILING - 41.7% error rate)
- Shared custody allocation (minor rounding errors)

**Tax Engine:**
- No validation tests run yet
- Unverified: federal tax, Ontario tax, CPP, EI, health premium
- Unverified: spousal support deductibility/taxability
- Unverified: RRSP and union dues deductions

**SSAG Solver:**
- No validation that 40%/43%/46% targets are achieved
- No validation of order of operations
- No validation of tax treatment in iterations
- No validation of convergence accuracy

---

## Known Limitations

### V1 Scope (Current)

**Supported:**
- Sole custody (primary residence with recipient)
- Table child support (Section 3)
- Periodic spousal support (monthly)
- Ontario only

**NOT Supported:**
- Shared parenting (Section 9 set-off) - **DISABLED**
- Split custody - **NOT IMPLEMENTED**
- Non-taxable/non-deductible spousal support - **NOT IMPLEMENTED**
- Lump-sum spousal support - **NOT IMPLEMENTED**
- Other provinces - **NOT IMPLEMENTED**
- Section 7 special expenses - **NOT INTEGRATED**
- Other tax credits (GST/HST, Trillium, etc.) - **NOT INCLUDED**

### What Is NOT Included in Calculations

**Tax Credits Not Included:**
- GST/HST credit
- Ontario Trillium Benefit
- Ontario Sales Tax Credit
- Climate Action Incentive
- Canada Workers Benefit

**Income Types Not Supported:**
- Self-employment income (different CPP/EI treatment)
- Investment income / capital gains
- Rental income
- Pension income
- Other income sources

**Deductions Not Supported:**
- Childcare expenses
- Support payments to others
- Moving expenses
- Carrying charges
- Professional fees (beyond union dues)

---

## Verification Process

### Reference Test Sources

All expected values are sourced from official calculators and documented:

**CCB References:**
- Source: CRA CCB Calculator
- URL: https://www.canada.ca/en/revenue-agency/services/child-family-benefits/child-family-benefits-calculator.html
- Period: July 2025 - June 2026
- Test Cases: 12 scenarios covering various incomes and family sizes

**Tax References:**
- Source: TaxTips.ca 2024 Calculator
- URL: https://www.taxtips.ca/calculators/canadian-tax/canadian-tax-calculator.htm
- Year: 2024
- Test Cases: 10 scenarios across income brackets

### Test Tolerances

**Defined Tolerances (NOT Arbitrary):**
- CCB: ±$0.50 to ±$5.00 per month depending on complexity
- Federal/Ontario Tax: ±$10 to ±$50 depending on income level
- CPP/EI: ±$1 to ±$2 (known rounding in calculators)
- Net Income: ±$20 to ±$100 depending on income level
- INDI Percentage: ±0.1% (e.g., 40.0% ± 0.1% = 39.9% to 40.1%)

**Rounding Note:** Different calculators use different rounding methods. Tolerances account for legitimate rounding differences, NOT calculation errors.

### Verification Mode

Enable detailed audit output:

```typescript
const result = solveSSAG({
  payorGrossIncome: 100000,
  recipientGrossIncome: 45000,
  // ... other inputs
  verificationMode: true
});

// Access verification data
console.log(JSON.stringify(result.verification.mid, null, 2));
```

Verification output includes:
- All tax brackets and rates used
- CCB thresholds and reduction rates
- Complete solver iteration trace
- Tax calculations at each iteration
- CCB calculations
- INDI breakdown at each iteration
- Convergence status

---

## Test Files

### Reference Tests (Must Pass 100%)

1. **`ccbEngine.reference.test.ts`**
   - Validates CCB against CRA calculator
   - Status: 58.3% passing (FAILING)
   - Required: 100% before production

2. **`taxEngine.reference.test.ts`**
   - Validates tax calculations against TaxTips.ca
   - Status: Not yet run
   - Required: 100% before production

3. **`ssagIntegration.test.ts`**
   - Validates SSAG targets achieved
   - Tests order of operations
   - Tests tax treatment
   - Status: Not yet run
   - Required: 100% before production

### Running Tests

```bash
# Run all tests
npm test

# Run specific reference tests
npm test ccbEngine.reference.test.ts
npm test taxEngine.reference.test.ts
npm test ssagIntegration.test.ts

# Run with detailed output
npm test -- --reporter=verbose
```

---

## Integration Example

```typescript
import { solveSSAG } from './engines/ssagWithChildrenSolver';

const result = solveSSAG({
  payorGrossIncome: 100000,
  recipientGrossIncome: 45000,
  relationshipYears: 10,
  children: [
    { age: 8, disabilitySupplementEligible: false }
  ],
  parentingArrangement: 'sole_recipient',
  payorDeductions: {
    rrspContributions: 5000,
    unionDues: 500,
    otherDeductions: 0
  },
  recipientDeductions: {
    rrspContributions: 0,
    unionDues: 0,
    otherDeductions: 0
  },
  taxYear: 2024,
  verificationMode: false // Set true for audit trail
});

// Access results
console.log('Low range:', result.low.monthlySpousalSupport);
console.log('Mid range:', result.mid.monthlySpousalSupport);
console.log('High range:', result.high.monthlySpousalSupport);

// Check convergence
console.log('Converged:', result.mid.converged);
console.log('Iterations:', result.mid.iterations);
console.log('Recipient INDI %:', (result.mid.actualINDIPercent * 100).toFixed(1) + '%');
```

---

## Error Handling

### DO NOT Suppress Errors

If calculations fail or don't converge:
1. DO NOT return a default value
2. DO NOT guess
3. DO show error to user
4. DO capture verification data
5. DO report issue for investigation

### Common Issues

**Non-Convergence:**
- Solver may not converge if income difference is very small
- Solver may not converge if one party has much higher deductions
- Check verification trace to see iteration behavior

**Unexpected Results:**
- Enable verification mode
- Export verification JSON
- Compare against manual calculation
- Check reference test cases

---

## Maintenance

### Updating for New Tax Year

When updating for a new tax year (e.g., 2025):

1. Update tax brackets in `taxEngine.ts`
2. Update CPP/EI rates and maximums
3. Update Ontario health premium tiers
4. Create new tax reference cases for new year
5. Update CCB amounts and thresholds for new benefit period
6. Create new CCB reference cases
7. Run ALL reference tests
8. Update this README with new year
9. Update VERIFICATION_REPORT.md

**DO NOT skip steps or assume "close enough."**

### Provincial Support

To add support for another province:
1. Create new provincial tax engine
2. Create new reference test cases
3. Update child support tables if different
4. Validate health premium (province-specific)
5. Run full reference test suite
6. Document limitations and differences

---

## Contact & Support

**For Bugs or Discrepancies:**
1. Check VERIFICATION_REPORT.md for known issues
2. Run verification mode and export trace
3. Compare against official calculators (links in this README)
4. Do NOT adjust expected values to make tests pass

**For Tax/Legal Questions:**
- Consult with family law lawyer
- Consult with accountant
- Review CRA documentation
- This calculator is NOT legal advice

---

## License & Disclaimer

This calculator is provided for informational purposes only. It is not legal advice and should not be relied upon for legal agreements until fully validated.

**WARRANTY:** NONE. Use at your own risk.

**LIABILITY:** Users are responsible for verifying all calculations against official sources before using in legal agreements.

---

**Last Updated:** December 23, 2025
**Version:** 1.0.0-alpha (NOT PRODUCTION READY)
**Next Review:** After all reference tests pass
