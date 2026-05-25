import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

const noStoreHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

async function ensureOwner(user, id) {
  const r = await pool.query('SELECT user_id FROM agreements WHERE id = $1', [id])
  if (r.rows.length === 0) return { notFound: true }
  if (r.rows[0].user_id !== user.id && !user.is_admin) return { forbidden: true }
  return { ok: true }
}

const AGREEMENT_FIELDS = [
  'agreement_type', 'label', 'status',
  'party1_dob', 'party1_occupation', 'party1_parental_title',
  'party2_name', 'party2_dob', 'party2_occupation', 'party2_parental_title', 'party2_email',
  'marriage_date', 'cohabitation_date', 'separation_date',
  'marriage_location', 'signing_city',
  'retroactive_support_waived',
  'section_completion',
]

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params

    const r = await pool.query('SELECT * FROM agreements WHERE id = $1', [id])
    if (r.rows.length === 0) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404, headers: noStoreHeaders })
    }
    const agreement = r.rows[0]
    if (agreement.user_id !== user.id && !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    }
    return NextResponse.json(agreement, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    }
    console.error('Failed to fetch agreement:', err.message)
    return NextResponse.json({ error: 'Failed to fetch agreement', details: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

export async function PUT(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const body = await req.json().catch(() => ({}))

    const check = await ensureOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Agreement not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const sets = []
    const vals = []
    let i = 1
    for (const f of AGREEMENT_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, f)) {
        sets.push(`${f} = $${i}`)
        if (f === 'section_completion' && body[f] !== null && typeof body[f] === 'object') {
          vals.push(JSON.stringify(body[f]))
        } else {
          vals.push(body[f])
        }
        i++
      }
    }
    if (sets.length === 0) {
      const r = await pool.query('SELECT * FROM agreements WHERE id = $1', [id])
      return NextResponse.json(r.rows[0], { headers: noStoreHeaders })
    }
    sets.push(`updated_at = NOW()`)
    vals.push(id)

    const sql = `UPDATE agreements SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`
    const r = await pool.query(sql, vals)
    return NextResponse.json(r.rows[0], { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    console.error('Failed to update agreement:', err.message)
    return NextResponse.json({ error: 'Failed to update agreement', details: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params

    const check = await ensureOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Agreement not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    await pool.query('DELETE FROM agreements WHERE id = $1', [id])
    return NextResponse.json({ message: 'Deleted' }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    console.error('Failed to delete agreement:', err.message)
    return NextResponse.json({ error: 'Failed to delete agreement' }, { status: 500, headers: noStoreHeaders })
  }
}
