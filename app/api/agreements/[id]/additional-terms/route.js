import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner, upsertSingleton } from '@/lib/agreements/apiHelpers'

const FIELDS = [
  'insurance_template', 'insurance_variables',
  'disclosure_template', 'disclosure_variables',
  'tax_template', 'tax_variables',
  'dispute_template', 'dispute_variables',
]
const JSONB_FIELDS = ['insurance_variables', 'disclosure_variables', 'tax_variables', 'dispute_variables']

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    const r = await pool.query('SELECT * FROM additional_terms WHERE agreement_id = $1', [id])
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
    const row = await upsertSingleton(pool, 'additional_terms', id, FIELDS, body, JSONB_FIELDS)
    return NextResponse.json(row, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
