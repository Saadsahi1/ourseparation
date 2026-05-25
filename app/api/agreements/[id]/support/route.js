import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner, upsertSingleton } from '@/lib/agreements/apiHelpers'

const FIELDS = [
  'party1_income', 'party2_income',
  'child_support_payor', 'child_support_amount', 'child_support_arrangement',
  'party1_parenting_time_percentage', 'party2_parenting_time_percentage',
  'party1_table_amount', 'party2_table_amount',
  'section9_factors', 'section9_adjustment_notes',
  'spousal_support_payor', 'spousal_support_amount',
  'spousal_support_template', 'spousal_support_variables',
  'spousal_support_termination_triggers',
  'per_child_support',
  'arrears_owed_to', 'arrears_amount', 'arrears_pay_within_days',
]
const JSONB_FIELDS = [
  'section9_factors', 'spousal_support_variables',
  'spousal_support_termination_triggers', 'per_child_support',
]

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    const r = await pool.query('SELECT * FROM support_calculations WHERE agreement_id = $1', [id])
    return NextResponse.json(r.rows[0] || null, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

export async function PUT(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const body = await req.json()
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const row = await upsertSingleton(pool, 'support_calculations', id, FIELDS, body, JSONB_FIELDS)
    return NextResponse.json(row, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
