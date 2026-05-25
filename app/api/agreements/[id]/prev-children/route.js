import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner } from '@/lib/agreements/apiHelpers'

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const r = await pool.query(
      'SELECT * FROM previous_relationship_children WHERE agreement_id = $1',
      [id]
    )
    return NextResponse.json({ items: r.rows }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

export async function POST(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const body = await req.json()
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const r = await pool.query(
      `INSERT INTO previous_relationship_children
       (agreement_id, party, full_name, birth_date, lived_with_parties, stood_in_loco_parentis, has_support_obligation)
       VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
      [
        id,
        body.party || 'party1',
        body.full_name || null,
        body.birth_date || null,
        Boolean(body.lived_with_parties),
        Boolean(body.stood_in_loco_parentis),
        Boolean(body.has_support_obligation),
      ]
    )
    return NextResponse.json(r.rows[0], { status: 201, headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
