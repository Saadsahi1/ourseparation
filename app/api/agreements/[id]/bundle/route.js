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
//
// All queries share one Client so the bundle uses ONE database
// connection total, even though it issues ~17 statements. Without
// this, our fresh-Client-per-query default would open 17 connections
// simultaneously and trip Supabase's Session Pooler cap (EMAXCONNSESSION).
export async function GET(req, { params }) {
  let client
  try {
    const { user } = await requireAuth(req)
    const { id } = await params

    client = await pool.connect()

    const ar = await client.query('SELECT * FROM agreements WHERE id = $1', [id])
    if (ar.rows.length === 0) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404, headers: noStoreHeaders })
    }
    const agreement = ar.rows[0]
    if (agreement.user_id !== user.id && !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    }

    // Run all the related-row queries sequentially on this one client.
    // node-postgres queues them on a single connection so they execute
    // in order without contention.
    const childrenR           = await client.query('SELECT * FROM children WHERE agreement_id = $1 ORDER BY birth_date', [id])
    const prevChildrenR       = await client.query('SELECT * FROM previous_relationship_children WHERE agreement_id = $1', [id])
    const parentingTermsR     = await client.query('SELECT * FROM parenting_terms WHERE agreement_id = $1', [id])
    const parentingSchedulesR = await client.query('SELECT * FROM parenting_schedules WHERE agreement_id = $1', [id])
    const holidaysR           = await client.query('SELECT * FROM agreement_holiday_schedules WHERE agreement_id = $1', [id])
    const specialClausesR     = await client.query('SELECT * FROM special_clauses WHERE agreement_id = $1 ORDER BY display_order, id', [id])
    const propertyItemsR      = await client.query('SELECT * FROM property_items WHERE agreement_id = $1 ORDER BY category, id', [id])
    const propertyDivR        = await client.query('SELECT * FROM property_division_terms WHERE agreement_id = $1', [id])
    const incomeDocsR         = await client.query('SELECT * FROM income_documents WHERE agreement_id = $1 ORDER BY tax_year DESC, party', [id])
    const supportR            = await client.query('SELECT * FROM support_calculations WHERE agreement_id = $1', [id])
    const section7R           = await client.query('SELECT * FROM section7_expenses WHERE agreement_id = $1 ORDER BY expense_type', [id])
    const retroPeriodsR       = await client.query('SELECT * FROM retroactive_support_periods WHERE agreement_id = $1 ORDER BY calendar_year', [id])
    const retroExpensesR      = await client.query('SELECT * FROM retroactive_expenses WHERE agreement_id = $1 ORDER BY expense_date', [id])
    const additionalR         = await client.query('SELECT * FROM additional_terms WHERE agreement_id = $1', [id])
    const signaturesR         = await client.query('SELECT * FROM digital_signatures WHERE agreement_id = $1', [id])
    const holidayTemplatesR   = await client.query('SELECT holiday_name, category, preset_options, display_order FROM holiday_schedule_templates ORDER BY display_order')
    const userR               = await client.query('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [agreement.user_id])

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
  } finally {
    if (client) {
      try { await client.release() } catch {}
    }
  }
}
