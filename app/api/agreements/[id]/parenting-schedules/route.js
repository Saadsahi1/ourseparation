import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner } from '@/lib/agreements/apiHelpers'

const FIELDS = [
  'regular_schedule_template', 'regular_schedule_variables',
  'summer_schedule_template', 'summer_schedule_variables',
  'transportation_template', 'transportation_variables',
  'pickup_dropoff_location',
]
const JSONB_FIELDS = ['regular_schedule_variables', 'summer_schedule_variables', 'transportation_variables']

// Upsert the parenting schedule row (one per agreement, or one per child if child_id provided).
export async function PUT(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const body = await req.json()
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const childId = body.child_id || null

    // Check if schedule exists for this (agreement_id, child_id) combo
    const existing = childId
      ? await pool.query('SELECT id FROM parenting_schedules WHERE agreement_id = $1 AND child_id = $2', [id, childId])
      : await pool.query('SELECT id FROM parenting_schedules WHERE agreement_id = $1 AND child_id IS NULL', [id])

    if (existing.rows.length === 0) {
      const cols = ['agreement_id', 'child_id']
      const vals = [id, childId]
      const placeholders = ['$1', '$2']
      let i = 3
      for (const f of FIELDS) {
        if (Object.prototype.hasOwnProperty.call(body, f)) {
          cols.push(f)
          if (JSONB_FIELDS.includes(f) && body[f] && typeof body[f] === 'object') {
            vals.push(JSON.stringify(body[f]))
          } else {
            vals.push(body[f])
          }
          placeholders.push(`$${i}`)
          i++
        }
      }
      const sql = `INSERT INTO parenting_schedules (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`
      const r = await pool.query(sql, vals)
      return NextResponse.json(r.rows[0], { headers: noStoreHeaders })
    }

    // UPDATE existing
    const sets = []
    const vals = []
    let i = 1
    for (const f of FIELDS) {
      if (Object.prototype.hasOwnProperty.call(body, f)) {
        sets.push(`${f} = $${i}`)
        if (JSONB_FIELDS.includes(f) && body[f] && typeof body[f] === 'object') {
          vals.push(JSON.stringify(body[f]))
        } else {
          vals.push(body[f])
        }
        i++
      }
    }
    if (sets.length === 0) {
      const r = await pool.query('SELECT * FROM parenting_schedules WHERE id = $1', [existing.rows[0].id])
      return NextResponse.json(r.rows[0], { headers: noStoreHeaders })
    }
    vals.push(existing.rows[0].id)
    const sql = `UPDATE parenting_schedules SET ${sets.join(', ')} WHERE id = $${i} RETURNING *`
    const r = await pool.query(sql, vals)
    return NextResponse.json(r.rows[0], { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
