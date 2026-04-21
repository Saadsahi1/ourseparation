import pool from './pool.js'

// Load CST table for a specific year (or current if no year provided)
// Year should be an integer like 2025, 2011, 2006
export async function getChildSupportTable(year) {
  try {
    const query_year = year ? parseInt(year) : new Date().getFullYear()
    const effective_date = `${query_year}-05-01`

    const res = await pool.query(`
      SELECT table_data, effective_date
      FROM child_support_tables
      WHERE effective_date <= $1::date
      ORDER BY effective_date DESC
      LIMIT 1
    `, [effective_date])

    return res.rows[0] ? res.rows[0].table_data : null
  } catch (err) {
    console.error('❌ Error loading CST table:', err.message)
    return null
  }
}

// Backwards compatibility alias
export async function getCurrentChildSupportTable() {
  return getChildSupportTable()
}

// Get all CST versions (for admin dashboard)
export async function getAllChildSupportTables() {
  try {
    const res = await pool.query(`
      SELECT id, effective_date, cpi_adjustment, uploaded_by, created_at
      FROM child_support_tables
      ORDER BY effective_date DESC
    `)
    return res.rows
  } catch (err) {
    console.error('❌ Error fetching CST versions:', err.message)
    return []
  }
}

// Upload new CST table
export async function uploadChildSupportTable(effectiveDate, tableData, cpiAdjustment, uploadedBy) {
  try {
    const res = await pool.query(`
      INSERT INTO child_support_tables (effective_date, table_data, cpi_adjustment, uploaded_by)
      VALUES ($1, $2, $3, $4)
      RETURNING id, effective_date, created_at
    `, [effectiveDate, JSON.stringify(tableData), cpiAdjustment, uploadedBy])
    return res.rows[0]
  } catch (err) {
    if (err.code === '23505') {
      throw new Error(`CST table already exists for ${effectiveDate}`)
    }
    throw err
  }
}

// Get child support amount for given income and num children
export function lookupChildSupport(tableData, income, numChildren) {
  if (!tableData || !Array.isArray(tableData)) return null

  // Find the row where income <= table entry
  let result = null
  for (const row of tableData) {
    if (row.income <= income) {
      result = row
    } else {
      break
    }
  }

  if (!result || !result.children || numChildren < 1 || numChildren > result.children.length) {
    return null
  }

  return result.children[numChildren - 1]
}
