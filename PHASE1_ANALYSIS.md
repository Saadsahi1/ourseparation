# Phase 1 Analysis: Current vs DivorcePath Calculator

## Key Finding: **Missing Tax Year Data**

Your current calculator only has parameters for: **2023, 2024, 2025**

But the test case is for: **2020** ❌

**This alone makes accurate calculations impossible for any case from 2020 or earlier.**

---

## Detailed Comparison

### 1. **Tax Data Availability**

| Aspect | Current Project | GitHub Repo (DivorcePath) |
|--------|---|---|
| Years Supported | 2023, 2024, 2025 | 2005-2025 (21 years) |
| 2020 Data | ❌ MISSING | ✅ Available |
| 2019 Data | ❌ MISSING | ✅ Available |
| Coverage | 3 years | 21 years |

---

### 2. **Tax Calculation Components**

#### Current Calculator (`lib/calc/ontarioTax.js`)

✅ **Has:**
- Federal tax brackets & rates
- Ontario tax brackets & rates
- Ontario health premium (tiers)
- Ontario surtax (2-tier)
- CPP/EI calculations
- Basic Personal Amount (BPA) phaseout
- Tax credits: CPP, EI, Canada Employment
- Benefits: CWB, CCB, GST/HST, CAI, OCB, OTB

❌ **Missing:**
- **Eligible Dependant Credit** (significant for shared children)
- **Detailed non-refundable tax credit breakdown**
- **Multiple benefit credit types** (GST vs HST distinction)
- **Groceries Essentials Top-up** (new benefit)
- **Proper shared child benefit splitting**
- **Historical tax rates** (2005-2022)

#### GitHub Repo (`Spousal Support/taxCalculator.js`)

✅ **Has:**
- All above + everything missing above
- 21 years of complete tax parameters
- Eligible Dependant credit handling
- Comprehensive deduction tracking
- All benefit types properly separated
- Year-specific calculations

---

### 3. **Test Case: Missing 2020 Tax Parameters**

Your test case requires **2020 tax data**:

```javascript
// Current code for 2020: ❌ FAILS
const params = getTaxParams(2020);  // Returns undefined
```

**What we need from GitHub repo for 2020:**

```json
{
  "fedBrackets": [48535, 97069, 150473, 214368, Infinity],
  "fedRates": [0.15, 0.205, 0.26, 0.29, 0.33],
  "fedBPA": 13816,
  "ontBrackets": [45142, 90287, 150000, 220000, Infinity],
  "ontRates": [0.0505, 0.0915, 0.1116, 0.1216, 0.1316],
  "ontBPA": 10520,
  "ontSurtax1Rate": 0.20,
  "ontSurtax1Threshold": 4697,
  "ontSurtax2Rate": 0.36,
  "ontSurtax2Threshold": 6000,
  // ... plus 40+ more parameters
}
```

---

## 4. **Eligible Dependant Credit Issue**

### DivorcePath shows for test case:
```
Aaron:     Eligible Dependant Credit: $16,452 (federal) + $11,029 (provincial)
Person B:  Eligible Dependant Credit: $16,452 (federal) + $11,029 (provincial)
```

### Current Calculator:
- ❌ **Does NOT calculate Eligible Dependant credit**
- Includes CPP/EI/BPA credits only
- Missing ~$27,481 in annual credits for Aaron alone!

---

## 5. **Ontario Child Benefit Calculation**

### DivorcePath Result:
- Aaron: $0 (disqualifies due to high income)
- Person B: $2,643 (qualifies, lower income)

### Current Calculator Logic:
```javascript
// Line 131: ocb = Math.max(0, numDependents * P.ocbBase - ...)
const ocb = numDependents * 1680 - deduction;
```

**Problem:** Uses `numDependents` parameter, but code doesn't properly:
- Filter by parent's income threshold
- Calculate per-eligible child correctly
- Handle shared custody weighting

---

## 6. **Shared Child Benefit Splitting**

### DivorcePath handles:
- CCB: Allocated based on eligibility + parent's income
- Eligible Dependant: Both parents claim same credit
- OCB: Only low-income parent qualifies

### Current Calculator:
```javascript
// Line 56: const share = c.residesWith === 'shared' ? 0.5 : 1
// Then uses this in: const totalKids = under6 + age6to17
```

**Problem:** Weights shared children 0.5, but doesn't properly:
- Allocate benefits to each parent separately
- Apply income-based phase-outs per parent
- Calculate Eligible Dependant credit per parent

---

## 7. **Child Support Calculation**

### Current Implementation:
```javascript
// lib/calc/ssagWith.js, line 12-13
const eligibleFromA = children.filter(c => c.residesWith === 'B' || c.residesWith === 'shared').length
const eligibleFromB = children.filter(c => c.residesWith === 'A' || c.residesWith === 'shared').length
```

✅ **This part is correct!**
- For test case: A has 2 eligible (Child 1 with A + Child 2 shared) ✓
- For test case: B has 2 eligible (Child 2 shared + Child 3 with B) ✓

But depends on **correct table lookup**, which requires:
- ✅ Year-specific CSG tables (have 2006, 2011, 2017, 2025)
- ❌ Proper table selection for 2020 (missing)

---

## Summarized Gaps

| Component | Current | GitHub | Impact |
|-----------|---------|--------|--------|
| Tax years (2005-2022) | ❌ | ✅ | **CRITICAL** |
| Eligible Dependant credit | ❌ | ✅ | **HIGH** |
| Per-parent income thresholds | ❌ | ✅ | **HIGH** |
| Shared child benefit split | ⚠️ Partial | ✅ | **MEDIUM** |
| OCB calculation | ⚠️ Partial | ✅ | **MEDIUM** |
| CCB with phaseout | ✅ | ✅ | ✅ |
| CWB calculation | ✅ | ✅ | ✅ |
| Ontario surtax | ✅ | ✅ | ✅ |
| Health premium | ✅ | ✅ | ✅ |
| CSG table lookup | ✅ | ✅ | ✅ |

---

## Estimated Impact on Test Case

### Current Calculator Output (if it ran):
- ❌ **Can't run for 2020** (no tax params)
- ❌ Missing ~$27K Eligible Dependant credits
- ❌ Incorrect OCB allocation
- ❌ Incorrect benefit distribution between parents

### DivorcePath Correct Output:
- Aaron: $77,457/year net
- Person B: $58,180/year net
- Child Support: Person 2 pays Aaron $1,387/month

### Estimated Current Calculator Output (hypothetically):
- Aaron: ~$85,000+/year (missing deductions)
- Person B: ~$40,000/year (missing benefits)
- Child Support: Same ($1,387/month) — this part is OK

**Error margin: ±$10,000-15,000+ per person**

---

## Phase 1 Recommendation

### **Critical Priority (must fix before any use):**
1. ✅ Copy 21 JSON tax files from GitHub repo (DONE)
2. ⏳ **Update `lib/config/taxParams.js` to include 2005-2022**
3. ⏳ **Add Eligible Dependant credit calculation**

### **High Priority (affects accuracy):**
4. ⏳ **Fix OCB per-parent income thresholds**
5. ⏳ **Improve shared child benefit allocation**
6. ⏳ **Add per-parent benefit phase-outs**

### **Medium Priority (nice to have):**
7. ⏳ **Restructure for better clarity**
8. ⏳ **Add detailed benefit breakdown output**

---

## Next Steps

### **Option 1: Incremental (Recommended for you)**
1. Merge GitHub repo's `Spousal Support/taxCalculator.js` with current code
2. Extract all 21 tax year parameters
3. Update `ontarioTax.js` to support 2005-2025
4. Add Eligible Dependant credit
5. Test against DivorcePath

**Timeline: 1 week**

### **Option 2: Full Integration**
1. Replace `lib/calc/` entirely with GitHub repo logic
2. Adapt for your Next.js API structure
3. Full test suite

**Timeline: 2 weeks**

---

## What I Need to Proceed to Phase 2

1. ✅ **Confirm**: Proceed with Option 1 (incremental merge)?
2. ⏳ **Provide**: 2-3 more test cases (different scenarios)
3. ⏳ **Confirm**: Priority (accuracy vs speed)?

**Ready to start implementing once approved!**

