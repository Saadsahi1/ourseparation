import { NextResponse } from 'next/server'
import { uploadChildSupportTable, getAllChildSupportTables } from '@/lib/db/childSupport'

// GET: Admin dashboard — list all CST versions
export async function GET(req) {
  try {
    const versions = await getAllChildSupportTables()
    return NextResponse.json(versions)
  } catch (err) {
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}

// POST: Admin uploads new CST table
// Body: { effectiveDate: "2025-05-01", tableData: [...], cpiAdjustment: 1.024 }
export async function POST(req) {
  try {
    // TODO: Add auth check (verify req.user.is_admin)
    // For now, this endpoint should be protected at the edge function/middleware level

    const body = await req.json()
    const { effectiveDate, tableData, cpiAdjustment } = body

    if (!effectiveDate || !tableData || !Array.isArray(tableData)) {
      return NextResponse.json(
        { error: 'Missing required fields: effectiveDate, tableData (array)' },
        { status: 400 }
      )
    }

    // Validate table structure
    for (const row of tableData) {
      if (!Number.isInteger(row.income) || !Array.isArray(row.children)) {
        return NextResponse.json(
          { error: 'Each row must have: income (number), children (array)' },
          { status: 400 }
        )
      }
    }

    const result = await uploadChildSupportTable(
      effectiveDate,
      tableData,
      cpiAdjustment || null,
      null // TODO: set to req.user.id once auth is in place
    )

    return NextResponse.json({
      success: true,
      id: result.id,
      effectiveDate: result.effective_date,
      createdAt: result.created_at
    }, { status: 201 })
  } catch (err) {
    if (err.message.includes('already exists')) {
      return NextResponse.json(
        { error: err.message },
        { status: 409 }
      )
    }
    return NextResponse.json(
      { error: err.message },
      { status: 500 }
    )
  }
}
