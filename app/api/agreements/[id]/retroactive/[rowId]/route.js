import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner, buildUpdateSQL } from '@/lib/agreements/apiHelpers'

const PERIOD_FIELDS = [
  'calendar_year', 'party1_income', 'party2_income',
  'parenting_arrangement', 'primary_caregiver',
  'months_in_period', 'monthly_support_amount',
  'child_support_payor', 'total_support_owed', 'notes',
]
const EXPENSE_FIELDS = [
  'expense_date', 'expense_category', 'expense_description',
  'total_amount', 'paid_by', 'seeking_contribution_from',
  'contribution_percentage', 'contribution_amount', 'has_receipt', 'notes',
]

export async function PUT(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id, rowId } = await params
    const body = await req.json()
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const table = body.kind === 'expense' ? 'retroactive_expenses' : 'retroactive_support_periods'
    const fields = body.kind === 'expense' ? EXPENSE_FIELDS : PERIOD_FIELDS
    const upd = buildUpdateSQL(table, fields, body,
      [{ field: 'id', val: rowId }, { field: 'agreement_id', val: id }])
    if (!upd) return NextResponse.json({ error: 'Nothing to update' }, { status: 400, headers: noStoreHeaders })
    const r = await pool.query(upd.sql, upd.vals)
    return NextResponse.json(r.rows[0] || null, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id, rowId } = await params
    const url = new URL(req.url)
    const kind = url.searchParams.get('kind') || 'period'
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    const table = kind === 'expense' ? 'retroactive_expenses' : 'retroactive_support_periods'
    await pool.query(`DELETE FROM ${table} WHERE id = $1 AND agreement_id = $2`, [rowId, id])
    return NextResponse.json({ deleted: true }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
