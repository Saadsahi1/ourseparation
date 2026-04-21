// Quarterly check for CST table updates from DOJ Canada
// Run this manually or via cron: node lib/cst-check.js

import https from 'https'

const DOJ_CST_URL = 'https://justice.gc.ca/eng/fl-df/chile-enfant/csg-tpe.asp'

export async function checkCSTUpdate() {
  try {
    console.log('📋 Checking DOJ Canada for CST table updates...')

    const response = await fetchURL(DOJ_CST_URL)
    const html = response

    // Look for version markers in the page
    // DOJ typically indicates the effective date in the page title or header
    // Common patterns: "Effective 2025-05-01" or "May 1, 2025"
    const datePatterns = [
      /Effective\s+(\d{4}-\d{2}-\d{2})/i,
      /(May|Jan|June)\s+\d{1,2},\s+20\d{2}/i,
      /(\d{4}-\d{2}-\d{2})/,
    ]

    let foundDate = null
    for (const pattern of datePatterns) {
      const match = html.match(pattern)
      if (match) {
        foundDate = match[1]
        break
      }
    }

    if (foundDate) {
      console.log(`✅ Found CST update info: ${foundDate}`)
      console.log(`
⚠️  ACTION NEEDED:
  1. Download the new CST table from: ${DOJ_CST_URL}
  2. Convert to JSON format: [{ income, children: [...] }, ...]
  3. Upload via admin panel or API
  4. This takes ~30 minutes

POST /api/admin/child-support-upload with:
{
  "effectiveDate": "2025-05-01",
  "tableData": [...],
  "cpiAdjustment": 1.024
}
      `)
      return { updateFound: true, date: foundDate }
    } else {
      console.log('✅ No new CST update detected (check manually if uncertain)')
      return { updateFound: false }
    }
  } catch (err) {
    console.error('❌ Error checking for CST updates:', err.message)
    return { error: err.message }
  }
}

function fetchURL(url) {
  return new Promise((resolve, reject) => {
    https.get(url, (res) => {
      let data = ''
      res.on('data', chunk => { data += chunk })
      res.on('end', () => resolve(data))
    }).on('error', reject)
  })
}

// Run if called directly: node lib/cst-check.js
if (import.meta.url === `file://${process.argv[1]}`) {
  checkCSTUpdate().then(result => {
    console.log(JSON.stringify(result, null, 2))
    process.exit(result.error ? 1 : 0)
  })
}

export default checkCSTUpdate
