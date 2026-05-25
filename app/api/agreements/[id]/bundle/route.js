import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

const noStoreHeaders = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
}

// Single endpoint that returns the agreement + every related table.
// Used by the tabbed editor on initial load and after each save.
export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params

    const ar = await pool.query('SELECT * FROM agreements WHERE id = $1', [id])
    if (ar.rows.length === 0) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404, headers: noStoreHeaders })
    }
    const agreement = ar.rows[0]
    if (agreement.user_id !== user.id && !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    }

    // Load related rows in parallel.
    const [
      childrenR, prevChildrenR, parentingTermsR, parentingSchedulesR,
      holidaysR, specialClausesR, propertyItemsR, propertyDivR,
      incomeDocsR, supportR, section7R, retroPeriodsR, retroExpensesR,
      additionalR, signaturesR, holidayTemplatesR, userR,
    ] = await Promise.all([
      pool.query('SELECT * FROM children WHERE agreement_id = $1 ORDER BY birth_date', [id]),
      pool.query('SELECT * FROM previous_relationship_children WHERE agreement_id = $1', [id]),
      pool.query('SELECT * FROM parenting_terms WHERE agreement_id = $1', [id]),
      pool.query('SELECT * FROM parenting_schedules WHERE agreement_id = $1', [id]),
      pool.query('SELECT * FROM agreement_holiday_schedules WHERE agreement_id = $1', [id]),
      pool.query('SELECT * FROM special_clauses WHERE agreement_id = $1 ORDER BY display_order, id', [id]),
      pool.query('SELECT * FROM property_items WHERE agreement_id = $1 ORDER BY category, id', [id]),
      pool.query('SELECT * FROM property_division_terms WHERE agreement_id = $1', [id]),
      pool.query('SELECT * FROM income_documents WHERE agreement_id = $1 ORDER BY tax_year DESC, party', [id]),
      pool.query('SELECT * FROM support_calculations WHERE agreement_id = $1', [id]),
      pool.query('SELECT * FROM section7_expenses WHERE agreement_id = $1 ORDER BY expense_type', [id]),
      pool.query('SELECT * FROM retroactive_support_periods WHERE agreement_id = $1 ORDER BY calendar_year', [id]),
      pool.query('SELECT * FROM retroactive_expenses WHERE agreement_id = $1 ORDER BY expense_date', [id]),
      pool.query('SELECT * FROM additional_terms WHERE agreement_id = $1', [id]),
      pool.query('SELECT * FROM digital_signatures WHERE agreement_id = $1', [id]),
      pool.query('SELECT holiday_name, category, preset_options, display_order FROM holiday_schedule_templates ORDER BY display_order'),
      pool.query('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [agreement.user_id]),
    ])

    return NextResponse.json({
      agreement,
      owner: userR.rows[0] || null,
      children: childrenR.rows,
      previousChildren: prevChildrenR.rows,
      parentingTerms: parentingTermsR.rows[0] || null,
      parentingSchedules: parentingSchedulesR.rows,
      parentingSchedule: parentingSchedulesR.rows.find((s) => !s.child_id) || null,
      holidays: holidaysR.rows,
      holidayTemplates: holidayTemplatesR.rows,
      specialClauses: specialClausesR.rows,
      propertyItems: propertyItemsR.rows,
      propertyDivisionTerms: propertyDivR.rows[0] || null,
      incomeDocuments: incomeDocsR.rows,
      supportCalculations: supportR.rows[0] || null,
      section7Expenses: section7R.rows,
      retroactivePeriods: retroPeriodsR.rows,
      retroactiveExpenses: retroExpensesR.rows,
      additionalTerms: additionalR.rows[0] || null,
      signatures: signaturesR.rows,
    }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    console.error('Bundle fetch failed:', err.message)
    return NextResponse.json({ error: 'Failed to load agreement bundle', details: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
