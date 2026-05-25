import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner } from '@/lib/agreements/apiHelpers'

// Upsert a single holiday arrangement.
// Body: { holiday_name, arrangement, pickup_time?, dropoff_time?, notes? }
export async function PUT(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const body = await req.json()
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    if (!body.holiday_name) {
      return NextResponse.json({ error: 'holiday_name required' }, { status: 400, headers: noStoreHeaders })
    }

    const r = await pool.query(
      `INSERT INTO agreement_holiday_schedules (agreement_id, holiday_name, arrangement, pickup_time, dropoff_time, notes)
       VALUES ($1, $2, $3, $4, $5, $6)
       ON CONFLICT (agreement_id, holiday_name) DO UPDATE SET
         arrangement = EXCLUDED.arrangement,
         pickup_time = EXCLUDED.pickup_time,
         dropoff_time = EXCLUDED.dropoff_time,
         notes = EXCLUDED.notes
       RETURNING *`,
      [
        id,
        body.holiday_name,
        body.arrangement || null,
        body.pickup_time || null,
        body.dropoff_time || null,
        body.notes || null,
      ]
    )
    return NextResponse.json(r.rows[0], { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

// Delete a single holiday arrangement (when user picks "no arrangement").
export async function DELETE(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const url = new URL(req.url)
    const holidayName = url.searchParams.get('holiday_name')
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    if (!holidayName) {
      return NextResponse.json({ error: 'holiday_name query param required' }, { status: 400, headers: noStoreHeaders })
    }
    await pool.query('DELETE FROM agreement_holiday_schedules WHERE agreement_id = $1 AND holiday_name = $2', [id, holidayName])
    return NextResponse.json({ deleted: true }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
