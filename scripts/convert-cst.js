// Convert CST table from text format to JSON
// Usage: node scripts/convert-cst.js > cst-2025.json

const cstData = `Income 1 2 3 4 5 6
8000 0 0 0 0 0 0
8100 1 2 2 2 2 2
8200 2 3 4 4 4 4
8300 3 5 6 6 6 6
8400 4 7 8 8 8 8
8500 5 9 9 10 10 10
8600 6 10 11 12 12 12
8700 7 12 13 14 14 14
8800 8 14 15 16 16 16
8900 9 16 17 18 18 18
9000 9 17 19 20 20 20
9100 11 22 23 25 25 25
9200 13 26 28 30 30 30
9300 15 30 33 35 35 35
9400 17 35 38 40 40 40
9500 19 39 42 45 45 45
9600 21 44 47 50 50 50
9700 23 48 52 55 55 55
9800 25 52 56 60 60 60
9900 27 57 61 65 65 65
10000 28 61 66 70 70 70
10100 30 65 70 75 75 75`

const lines = cstData.trim().split('\n').slice(1) // skip header

const tableData = lines.map(line => {
  const parts = line.trim().split(/\s+/)
  const income = parseInt(parts[0])
  const children = parts.slice(1).map(Number)
  return { income, children }
})

const payload = {
  effectiveDate: '2025-05-01',
  tableData,
  cpiAdjustment: 1.024
}

console.log(JSON.stringify(payload, null, 2))
