import { NextResponse } from 'next/server'
import { getChildSupportTable } from '@/lib/db/childSupport'

// GET: Retrieve CST table for a specific year
// Query params: ?year=2025
// If no year provided, uses current year
// Example: /api/child-support-table?year=2011
export async function GET(req) {
  try {
    const { searchParams } = new URL(req.url)
    const year = searchParams.get('year')

    const tableData = await getChildSupportTable(year)

    if (!tableData) {
      const requestedYear = year || new Date().getFullYear()
      return NextResponse.json(
        { error: `No CST table found for year ${requestedYear}. Available tables may be for different years.` },
        { status: 404 }
      )
    }

    return NextResponse.json({
      table: tableData,
      year: year || new Date().getFullYear()
    })
  } catch (err) {
    console.error('Error fetching CST table:', err)
    return NextResponse.json(
      { error: 'Failed to load CST table' },
      { status: 500 }
    )
  }
}
