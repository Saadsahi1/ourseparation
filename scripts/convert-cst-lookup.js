// Convert CST from lookup format to array format for database upload
// Usage: node scripts/convert-cst-lookup.js 2006 cst.json > cst-2006-converted.json

import fs from 'fs'
import path from 'path'

const inputFile = process.argv[2]
if (!inputFile) {
  console.error('Usage: node convert-cst-lookup.js <input-json-file>')
  process.exit(1)
}

try {
  const data = JSON.parse(fs.readFileSync(inputFile, 'utf8'))

  // Extract year from filename or use 2006 as default
  const match = inputFile.match(/(\d{4})/)
  const year = match ? parseInt(match[1]) : 2006
  const effectiveDate = `${year}-05-01`

  // Convert lookup format to array format
  const tableData = Object.entries(data.lookup)
    .map(([income, values]) => ({
      income: parseInt(income),
      children: [values.c1, values.c2, values.c3, values.c4, values.c5, values.c6]
    }))
    .sort((a, b) => a.income - b.income)

  const output = {
    effectiveDate,
    tableData,
    cpiAdjustment: 1.0 // Adjust if you have the actual CPI adjustment
  }

  console.log(JSON.stringify(output, null, 2))
} catch (err) {
  console.error('Error:', err.message)
  process.exit(1)
}
