# Child Support Table (CST) Management

## Overview

The calculator pulls child support amounts from your Supabase database, effective today or the most recent table before today. **When Ottawa publishes a new table, you just insert one new row—code never changes.**

## Architecture

- **Schema**: `child_support_tables(id, effective_date, table_data, cpi_adjustment, uploaded_by, created_at)`
- **Query**: `WHERE effective_date <= CURRENT_DATE ORDER BY effective_date DESC LIMIT 1`
- **No hardcoded years or tax years**

## How to Upload a New CST Table

### 1. Get the table from Justice Canada
Visit: https://justice.gc.ca/eng/fl-df/chile-enfant/csg-tpe.asp

Download the current Federal Child Support Guidelines table (if different from your stored version).

### 2. Format as JSON
Convert the table to this structure:
```json
{
  "effectiveDate": "2025-05-01",
  "tableData": [
    { "income": 8000, "children": [0, 0, 0, 0, 0, 0] },
    { "income": 8100, "children": [1, 2, 2, 2, 2, 2] },
    { "income": 8200, "children": [2, 3, 4, 4, 4, 4] },
    ...
    { "income": 10100, "children": [30, 65, 70, 75, 75, 75] }
  ],
  "cpiAdjustment": 1.024
}
```

**Note**: `children[0]` = amount for 1 child, `children[1]` = 2 children, etc.

### 3. Upload via API

#### Option A: Admin Dashboard (TODO)
Build a form that POSTs to `/api/admin/child-support-upload`

#### Option B: Direct API call
```bash
curl -X POST http://localhost:3000/api/admin/child-support-upload \
  -H "Content-Type: application/json" \
  -d @cst-table.json
```

#### Option C: Supabase Studio
Insert directly into `child_support_tables`:
- `effective_date`: DATE (e.g., '2025-05-01')
- `table_data`: JSONB (paste the `tableData` array from above)
- `cpi_adjustment`: NUMERIC (e.g., 1.024)

## How the Calculator Uses It

### With Year Selection

In your calculator page:

```javascript
// app/calculator/page.js
import { lookupChildSupport } from '@/lib/db/childSupport'
import { useState, useEffect } from 'react'

export default function Calculator() {
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())
  const [cstTable, setCstTable] = useState(null)
  const [availableYears, setAvailableYears] = useState([])

  useEffect(() => {
    // Fetch CST table for selected year
    fetch(`/api/child-support-table?year=${selectedYear}`)
      .then(r => r.json())
      .then(data => {
        setCstTable(data.table)
      })
      .catch(err => console.error('CST load failed:', err))
  }, [selectedYear])

  // Later, when calculating for income $50,000 with 2 children:
  if (cstTable) {
    const amount = lookupChildSupport(cstTable, 50000, 2)
    console.log(`Child support for ${selectedYear}: $${amount}`)
  }

  return (
    <div>
      <label>
        Calculate for year:
        <select value={selectedYear} onChange={(e) => setSelectedYear(e.target.value)}>
          <option value={2025}>2025</option>
          <option value={2011}>2011</option>
          <option value={2006}>2006</option>
        </select>
      </label>

      {/* Rest of calculator UI */}
      {cstTable && (
        <div>
          <input type="number" placeholder="Annual income" />
          <input type="number" placeholder="Number of children" />
          {/* Calculate button */}
        </div>
      )}
    </div>
  )
}
```

### Without Year Selection (Current Year Only)

For backwards compatibility, you can still fetch the current year's table:

```javascript
useEffect(() => {
  // Fetch current year's table (no year param needed)
  fetch('/api/child-support-table')
    .then(r => r.json())
    .then(data => setCstTable(data.table))
    .catch(err => console.error('CST load failed:', err))
}, [])
```

Or server-side:
```javascript
import { getCurrentChildSupportTable, lookupChildSupport } from '@/lib/db/childSupport'

export async function calculateSupport(income, numChildren) {
  const table = await getCurrentChildSupportTable()
  if (!table) throw new Error('CST table not loaded')
  return lookupChildSupport(table, income, numChildren)
}
```

## Quarterly Update Check

### Manual check (when you remember)
```bash
node lib/cst-check.js
```

This pings the DOJ URL and tries to detect version changes.

### Automated (via cron job)
Option A: **Vercel Cron** (if hosting on Vercel)
```javascript
// app/api/cron/check-cst/route.js
import { checkCSTUpdate } from '@/lib/cst-check'

export async function GET(req) {
  // Verify cron token
  if (req.headers.get('authorization') !== `Bearer ${process.env.CRON_SECRET}`) {
    return new Response('Unauthorized', { status: 401 })
  }

  const result = await checkCSTUpdate()
  return Response.json(result)
}
```

Then in `vercel.json`:
```json
{
  "crons": [{
    "path": "/api/cron/check-cst",
    "schedule": "0 9 * * 1" // Every Monday at 9am
  }]
}
```

Option B: **External cron service** (e.g., cronjob.org, GitHub Actions)
Schedule a weekly job that calls: `curl https://yourapp.com/api/cron/check-cst`

Option C: **Manual reminder** (simplest)
- Set calendar reminder for May 1st and Dec 1st (when updates are typically released)
- When reminded, run `node lib/cst-check.js`
- If update found, upload takes ~30 min

## How Year Resolution Works

When you request CST for a specific year, the system finds the most recent CST table **on or before** that year's May 1st.

**Examples** (if you have 2006, 2011, 2025 tables):
- Request year 2025 → uses 2025 CST
- Request year 2015 → uses 2011 CST (most recent before 2015-05-01)
- Request year 2010 → uses 2006 CST (most recent before 2010-05-01)
- Request year 2005 → no table found (error)

This way you can support historical CST calculations without needing every single year's table.

## Troubleshooting

### Calculator shows "CST table not loaded"
→ No row in `child_support_tables` where `effective_date <= today`
→ Upload a table via the admin API

### Income lookup returns `null`
→ Income is below the table's minimum range (usually $8000)
→ Verify table has correct income thresholds

### `effective_date` conflict error
→ A table with that date already exists
→ Either update the existing row (DELETE + INSERT) or use a different date

## Schema

```sql
CREATE TABLE child_support_tables (
  id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  effective_date DATE UNIQUE NOT NULL,
  table_data     JSONB NOT NULL,
  cpi_adjustment NUMERIC(5, 3),
  uploaded_by    UUID REFERENCES users(id) ON DELETE SET NULL,
  created_at     TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX idx_cst_effective ON child_support_tables(effective_date);
```
