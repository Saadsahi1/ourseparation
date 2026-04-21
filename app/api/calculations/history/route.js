import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

const noStoreHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET(req) {
  try {
    const { user } = await requireAuth(req)
    const result = await pool.query(
      `SELECT id, calculation_type, label, created_at,
              inputs->>'cohabitationDate' as cohabitation_date,
              inputs->>'separationDate' as separation_date
       FROM calculations WHERE user_id = $1 ORDER BY created_at DESC LIMIT 50`,
      [user.id]
    )
    return NextResponse.json({ calculations: result.rows }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    }
    return NextResponse.json({ error: 'Failed to fetch calculations' }, { status: 500, headers: noStoreHeaders })
  }
}
