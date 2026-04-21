# DivorcePath Test Case #1

## Input Parameters
```
Person A (Aaron):         $125,000/year
Person B:                 $25,000/year
Marriage Duration:        10 years (Dec 31, 2010 → Dec 31, 2020)
Separation Date:          Dec 31, 2020
Children (3 total):
  - Child 1: Age 12, Parent A (Aaron)
  - Child 2: Age 10, Shared care (both parents)
  - Child 3: Age 8, Parent B
```

---

## DivorcePath Results (Expected Output)

### Child Support (CSG s.3)
| Metric | Aaron | Person 2 |
|--------|-------|----------|
| Guideline Income | $125,000 | $25,000 |
| Eligible Children* | 2 | 2 |
| Table Amount (Monthly) | $1,829 | $442 |
| **Net Child Support (Monthly)** | **-$1,387** | **+$1,387** |
| **Net Child Support (Annual)** | **-$16,644** | **+$16,644** |

*Eligible children calculation:
- Aaron: Child 1 (with A) + Child 2 (shared) = 2
- Person B: Child 2 (shared) + Child 3 (with B) = 2

---

### Taxes & Deductions (Annual)
#### Aaron
| Item | Amount |
|------|--------|
| Line 15000 Income | $125,000 |
| Federal Tax | $18,802 |
| Ontario Provincial Tax | $10,254 |
| Ontario Surtax | $948 |
| Ontario Health Premium | $750 |
| CPP Contributions | (included in $5,770) |
| EI Premiums | (included in $5,770) |
| **Total Taxes & Deductions** | **$34,825** |
| **After-Tax Income** | **$90,175** |

#### Person B
| Item | Amount |
|------|--------|
| Line 15000 Income | $25,000 |
| Federal Tax | -$2,869 (credit/refund) |
| Ontario Provincial Tax | $287 |
| CPP Contributions | (included in $1,687) |
| EI Premiums | (included in $1,687) |
| **Total Taxes & Deductions** | **-$895** |
| **After-Tax Income** | **$25,895** |

---

### Tax Credits & Benefits (Annual)

#### Aaron
```
Federal Credits:
  - Basic Personal Amount: $16,452
  - CPP: $3,519
  - EI: $1,123
  - Canada Employment: $1,500
  - Eligible Dependant: $16,452

Federal Benefits:
  - Canada Child Benefit: $3,926

Provincial Credits:
  - Basic Personal Amount: $12,989
  - CPP: $3,519
  - EI: $1,123
  - Eligible Dependant: $11,029

Provincial Benefits:
  - Ontario Child Benefit: $0 (doesn't qualify due to high income)
  - Ontario Sales Tax Credit: $0
```

#### Person B
```
Federal Credits:
  - Basic Personal Amount: $16,452
  - CPP: $1,064
  - EI: $408
  - Eligible Dependant: $16,452

Federal Benefits:
  - Canada Child Benefit: $10,325
  - Canada Workers Benefit: $2,869
  - GST/HST Credit: $1,241
  - Groceries Essentials Top-up: $487

Provincial Credits:
  - Basic Personal Amount: $12,989
  - CPP: $1,064
  - EI: $408
  - Eligible Dependant: $11,029

Provincial Benefits:
  - Ontario Child Benefit: $2,643
  - Ontario Sales Tax Credit: $945
  
Total Benefits: $3,588 (provincial) + $15,022 (federal) = $18,610
```

---

### Net Cash Flow Analysis (Monthly)
| Party | Child Support | Taxes | CPP/EI | Benefits | **Net Monthly** | **Net Annual** |
|-------|---|---|---|---|---|---|
| **Aaron** | -$1,387 | -$2,902 | -$481 | +$327 | **$6,455** | **$77,457** |
| **Person B** | +$1,387 | +$75 | -$141 | +$1,303 | **$4,848** | **$58,180** |
| **Combined** | $0 | -$2,827 | -$622 | +$1,630 | **$11,303** | **$135,637** |

---

## Key Observations

### 1. **Eligible Children Calculation** ✅
- Shared child counts for BOTH parents in their table amount calculation
- Aaron pays for 2 kids (Child 1 alone + Child 2 shared)
- Person B pays for 2 kids (Child 2 shared + Child 3 alone)
- This is CSG s.3 combined/eligible children approach

### 2. **Tax Complexity** 🎯
- Ontario Surtax: $948 (only Aaron qualifies due to higher income)
- Ontario Health Premium: $750 (Aaron only)
- Eligible Dependant Credit: Both claim despite shared child (allowed)
- Child benefits shared appropriately by income level

### 3. **Low-Income Benefits** 📊
- Person B receives significant benefits: $18,610/year
  - Canada Child Benefit: $10,325
  - Canada Workers Benefit: $2,869
  - GST/HST Credit + Groceries: $1,728
  - Ontario benefits: $3,588
- Aaron receives minimal: $3,926 (CCB only)

### 4. **Spousal Support** ❓
- **NOT SHOWN in this output** — this is child support only
- For "with-child-support" formula, we need to calculate:
  - Low range (60/40 NDI split)
  - Mid range (57/43 NDI split)
  - High range (54/46 NDI split)

---

## What We Need to Calculate Next

To match DivorcePath exactly, our calculator must:

1. ✅ **Identify eligible children per parent** (CSG s.3)
   - Child with parent A → counts for A
   - Child with parent B → counts for B
   - Shared child → counts for BOTH

2. ✅ **Look up correct CSG table amount** per year
   - 2020 tables
   - For each parent's eligible child count
   - Based on guideline income

3. ✅ **Calculate net child support** (set-off)
   - Aaron owes $1,829/mo
   - Person B owes $442/mo
   - Net: Aaron pays Person B $1,387/mo

4. ✅ **Calculate accurate taxes including:**
   - Federal + Ontario provincial tax
   - Ontario Surtax tiers (if applicable)
   - Ontario Health Premium
   - All applicable credits (Dependant, CPP, EI, etc.)
   - All applicable benefits (CCB, CWEB, GST/HST, Ontario benefits)

5. ✅ **Calculate INDI for spousal support** (next phase)
   - Aaron's INDI = after-tax income - child support
   - Person B's INDI = after-tax income + child support + benefits
   - Solve for spousal support to hit 60/40, 57/43, 54/46 splits

---

## Validation Checklist

When we integrate the new calculator, it must produce:

- [ ] Child Support: Aaron $1,387/month net payment
- [ ] Aaron's Federal Tax: $18,802
- [ ] Aaron's Ontario Provincial Tax: $10,254
- [ ] Aaron's Ontario Surtax: $948
- [ ] Aaron's Ontario Health Premium: $750
- [ ] Person B's Federal Tax: -$2,869 (refund)
- [ ] Person B's Ontario Tax: $287
- [ ] Person B's Total Benefits: $18,610
- [ ] Aaron's Net After-Tax: $77,457/year
- [ ] Person B's Net After-Tax: $58,180/year

---

## Questions for Next Phase

1. Does the new calculator handle Ontario Surtax?
2. Does it handle Eligible Dependant credit correctly with shared children?
3. Does it calculate Canada Workers Benefit ($2,869 for Person B)?
4. Does it include Ontario Child Benefit ($2,643 for Person B)?
5. Does it include Groceries Essentials Top-up ($487 for Person B)?

