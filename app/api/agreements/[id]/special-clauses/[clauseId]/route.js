import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner, buildUpdateSQL } from '@/lib/agreements/apiHelpers'

const FIELDS = ['clause_type', 'variables', 'custom_text', 'display_order']
const JSONB_FIELDS = ['variables']

export async function PUT(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id, clauseId } = await params
    const body = await req.json()
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const upd = buildUpdateSQL('special_clauses', FIELDS, body,
      [{ field: 'id', val: clauseId }, { field: 'agreement_id', val: id }], JSONB_FIELDS)
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
    const { id, clauseId } = await params
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    await pool.query('DELETE FROM special_clauses WHERE id = $1 AND agreement_id = $2', [clauseId, id])
    return NextResponse.json({ deleted: true }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
