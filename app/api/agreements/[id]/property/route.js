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

    const r = await pool.query('SELECT * FROM property_items WHERE agreement_id = $1 ORDER BY category', [id])
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
      `INSERT INTO property_items
       (agreement_id, owner, item_type, category, description,
        value_at_separation, value_at_marriage,
        is_matrimonial_home, is_excluded, excluded_reason, excluded_amount)
       VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11) RETURNING *`,
      [
        id,
        body.owner || 'party1',
        body.item_type || 'asset',
        body.category || 'other',
        body.description || '',
        body.value_at_separation ?? 0,
        body.value_at_marriage ?? 0,
        Boolean(body.is_matrimonial_home),
        Boolean(body.is_excluded),
        body.excluded_reason || null,
        body.excluded_amount ?? null,
      ]
    )
    return NextResponse.json(r.rows[0], { status: 201, headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
