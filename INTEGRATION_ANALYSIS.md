# Integration Analysis: DivorcePath-Accurate Calculator

## Executive Summary

You have **two separate calculator implementations**:

1. **Current Project** (`/Users/saadsahi/Desktop/our-sep-next`)
   - Next.js + React frontend
   - Custom SSAG calculation (`lib/calc/ssagWith.js`, `lib/calc/ssagWithout.js`)
   - Local tax calculator (`lib/calc/ontarioTax.js`)
   - Already integrated into your web app

2. **GitHub Repo** (`https://github.com/druryaa/Spousalsupportcalc.git`)
   - Standalone Node.js API server with detailedUI.html
   - More comprehensive tax calculations (`Spousal Support/taxCalculator.js`)
   - Better child support handling (`Child Support/index.cjs`)
   - **Not yet integrated into Next.js project**

---

## Key Differences

### 1. **Tax Calculations**
| Aspect | Current Project | GitHub Repo |
|--------|---|---|
| Tax Engine | `ontarioTax.js` (~basic) | `taxCalculator.js` (~150KB compiled) |
| Deductions | CPP/EI only | CPP/EI + multiple credits |
| Benefits | CCB, GST/HST | CCB, GST/HST, LIFT, Ontario Child Benefit, Trillium |
| Ontario Features | Basic | Surtax tiers, Health Premium, Tax Reduction |
| Years Supported | 2023 mainly | 2005-2025 (21 JSON data files) |

### 2. **Child Support Calculations**
| Aspect | Current Project | GitHub Repo |
|--------|---|---|
| Tables | In `childSupportTables.js` | CSV-based in `Child Support/data/` |
| Years | Single table | Year-specific (2006, 2011, 2017, 2025) |
| Notional CS | Basic | Comprehensive with 4 scenarios |
| Accuracy | Simpler logic | Exact Federal CSG implementation |

### 3. **Architecture**
| Current Project | GitHub Repo |
|---|---|
| Frontend: React/Next.js | Frontend: Plain HTML + JS |
| Backend: API routes | Backend: Express.js server |
| Single monolithic app | Separate API + UI design |
| Database: Supabase | No database needed |

---

## What Makes GitHub Repo More "DivorcePath-Accurate"

### 1. **Comprehensive Tax Data**
- 21 years of tax parameters (2005-2025)
- Exact tax brackets, rates, credits for each year
- Ontario-specific surtax calculations (two tiers)
- Health Premium calculations
- LIFT credit, Ontario Child Benefit, Trillium Benefit

### 2. **Accurate Child Support**
- Federal CSG tables (year-specific)
- Correct notional support scenarios:
  - All children in shared care → both parents get notional
  - All children with one parent → only that parent gets notional
  - Split care → each parent gets notional for their children
  - Mixed (some shared, some with one parent) → complex calculation
- Set-off methodology per CSG s.9

### 3. **INDI Solver**
- Binary search that iterates to achieve exact target NDI percentages
- Accurate treatment of child support in INDI calculations
- Correct tax effect calculations

### 4. **3 Support Levels**
- Low: 60/40 NDI split
- Mid: 57/43 NDI split  
- High: 54/46 NDI split
- Each level's own INDI calculation

---

## Integration Options

### **Option A: Replace Calculator Entirely (RECOMMENDED)**
✅ **Pros:**
- Single source of truth (GitHub repo is DivorcePath-accurate)
- All tax data for 21 years
- Better child support handling
- Cleaner separation of API/UI

❌ **Cons:**
- Major refactor
- Need to update API routes
- Database schema changes (if storing results)
- Testing needed

**Timeline:** 2-3 weeks

**Approach:**
1. Copy `apiServerDetailed.js` → `app/api/calculate/route.js` (as API route)
2. Replace `lib/calc/` with API call approach
3. Update frontend to consume new API response structure
4. Migrate tax/child support data loading

---

### **Option B: Keep Frontend, Replace Calculation Engine (PREFERRED FOR YOU)**
✅ **Pros:**
- Keep existing Next.js/React UI
- Integrate accurate calculation logic from GitHub repo
- Minimal DB schema changes
- Use existing DB for user management

❌ **Cons:**
- Moderate refactor
- Need to adapt `apiServerDetailed.js` functions into `lib/calc/`

**Timeline:** 1-2 weeks

**Approach:**
1. Merge `taxCalculator.js` logic into `lib/calc/ontarioTax.js`
2. Copy `Child Support/index.cjs` calculation logic into `lib/calc/childSupportTables.js`
3. Update `ssagWith.js` and `ssagWithout.js` to use new calculation functions
4. Add 21 years of tax data JSON files to `lib/calc/`

---

### **Option C: Dual System (Not Recommended)**
- Keep current calculator AND add GitHub calculator as alternate
- Let users choose "DivorcePath Mode"
- Confusing UX, maintenance nightmare

---

## Recommended Path Forward

### **Phase 1: Analysis (2-3 days)**
1. ✅ Diff the two calculators line-by-line
2. Identify all DivorcePath-specific logic
3. Document exact differences in calculation results
4. Create test cases from DivorcePath output

### **Phase 2: Integration (1 week)**
1. Copy/merge `Child Support/index.cjs` logic into modular functions
2. Expand `ontarioTax.js` with full 21-year tax data
3. Update `ssagWith.js`/`ssagWithout.js` to use new logic
4. Add comprehensive unit tests

### **Phase 3: Testing (3-5 days)**
1. Test against known DivorcePath results
2. Compare low/mid/high support levels
3. Test all care arrangements
4. Test edge cases (high income, shared care, etc.)

### **Phase 4: Deployment (1 day)**
1. Update API endpoints to return enhanced tax details
2. Update UI to display additional tax fields if desired
3. Deprecate old calculator (keep as fallback)

---

## Technical Debt Assessment

### Current Project Issues:
- ❌ Missing 20 years of tax data
- ❌ Simplified child support logic
- ❌ Limited tax credits (missing LIFT, Ontario benefits)
- ❌ No surtax tier handling
- ❌ No Ontario Health Premium

### GitHub Repo Strengths:
- ✅ Complete tax database (2005-2025)
- ✅ Full CSG implementation
- ✅ Comprehensive credit handling
- ✅ Year-specific data files
- ✅ Proven in standalone calculator

---

## File Organization After Integration

```
lib/calc/
├── ontarioTax.js                    # Expanded with full 2005-2025 logic
├── childSupportTables.js            # Updated with index.cjs logic
├── ssagWith.js                      # Refactored to use new logic
├── ssagWithout.js                   # Minimal changes needed
└── data/
    ├── tax-data-2005.json           # Copy from GitHub repo
    ├── tax-data-2006.json           # (21 files total)
    └── ...
    └── tax-data-2025.json

# Plus existing files unchanged:
├── apiClient.js
├── auth.js
└── config/taxParams.js
```

---

## What I Need From You

Before proceeding, provide:

1. **Test Cases**: 3-5 example scenarios where current calculator differs from DivorcePath (actual/expected values)
2. **Priority**: Which is more important?
   - Accurate calculations
   - Keeping existing UI/UX intact
3. **Timeline**: When do you need this accurate?
4. **Database**: Do you store calculation results? Need migration?

---

## Next Steps (What To Approve)

**DO NOT PUSH YET** — waiting for your guidance on:

1. Which integration option (A, B, or C)?
2. Confirmation on test scenarios
3. Go/no-go for Phase 1 deep dive

Once approved, I can:
- Create detailed line-by-line comparison
- Build isolated test suite
- Implement with zero breaking changes
- Provide rollback plan

