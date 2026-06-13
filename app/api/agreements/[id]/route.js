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
  'party1_first_name', 'party1_last_name',
  'party1_dob', 'party1_occupation', 'party1_parental_title',
  'party2_first_name', 'party2_last_name',
  'party2_name',  // legacy display column — written from first+last on save
  'party2_dob', 'party2_occupation', 'party2_parental_title', 'party2_email',
  'marriage_date', 'cohabitation_date', 'separation_date',
  'marriage_location', 'signing_city',
  'retroactive_support_waived',
  'section_completion',
]

// Fields that map to a Postgres DATE column. Empty strings will throw
// "invalid input syntax for type date" — coerce them to NULL on the way in.
const DATE_FIELDS = new Set(['party1_dob', 'party2_dob', 'marriage_date', 'cohabitation_date', 'separation_date'])

// Join first + last with a single space (handles either missing). Returns
// null when both are empty so we don't write empty strings to the DB.
function joinName(first, last) {
  const f = (first || '').trim()
  const l = (last || '').trim()
  if (!f && !l) return null
  return [f, l].filter(Boolean).join(' ')
}

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

    // Whenever first or last name changes for Party 2, recompute the legacy
    // party2_name display column. Renderers and template code haven't all
    // been moved to read first/last directly, so this keeps the document
    // and admin views consistent.
    if (Object.prototype.hasOwnProperty.call(body, 'party2_first_name')
        || Object.prototype.hasOwnProperty.call(body, 'party2_last_name')) {
      // Read existing values so we can recompute even if only one of the
      // pair was sent in this patch.
      const cur = await pool.query(
        'SELECT party2_first_name, party2_last_name FROM agreements WHERE id = $1',
        [id]
      )
      const row = cur.rows[0] || {}
      const f = Object.prototype.hasOwnProperty.call(body, 'party2_first_name')
        ? body.party2_first_name : row.party2_first_name
      const l = Object.prototype.hasOwnProperty.call(body, 'party2_last_name')
        ? body.party2_last_name : row.party2_last_name
      body.party2_name = joinName(f, l)
    }

    const sets = []
    const vals = []
    let i = 1
    for (const f of AGREEMENT_FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, f)) {
        sets.push(`${f} = $${i}`)
        let v = body[f]
        // Empty-string → NULL for date columns and email (avoids Postgres
        // "invalid input syntax" and "duplicate key value" on unique-email
        // constraint when the user clears the field).
        if (DATE_FIELDS.has(f) && v === '') v = null
        if (f === 'party2_email' && v === '') v = null
        if (f === 'section_completion' && v !== null && typeof v === 'object') {
          vals.push(JSON.stringify(v))
        } else {
          vals.push(v)
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
    console.error('Failed to update agreement:', err.message, err.detail || '', err.hint || '')
    return NextResponse.json({
      error: 'Failed to update agreement',
      details: err.message,
      column: err.column,
      constraint: err.constraint,
    }, { status: 500, headers: noStoreHeaders })
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
