import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner, upsertSingleton } from '@/lib/agreements/apiHelpers'

const FIELDS = [
  'matrimonial_home_disposition', 'matrimonial_home_variables',
  'vehicle_transfers',
  'pension_division_method', 'pension_variables',
  'rrsp_division_deadline', 'bank_account_closure_date',
  'equalization_payment_method', 'equalization_variables',
  'structured_payments',
  'custom_equalization_amount', 'custom_equalization_notes',
]
const JSONB_FIELDS = [
  'matrimonial_home_variables', 'vehicle_transfers',
  'pension_variables', 'equalization_variables', 'structured_payments',
]

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    const r = await pool.query('SELECT * FROM property_division_terms WHERE agreement_id = $1', [id])
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

    const row = await upsertSingleton(pool, 'property_division_terms', id, FIELDS, body, JSONB_FIELDS)
    return NextResponse.json(row, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
