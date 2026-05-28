// Lists the email of the user that owns each calculation/agreement,
// so we can diagnose when data exists in the DB but isn't visible
// to the currently-logged-in user (typically due to a re-registered
// account having a different user_id).

import { NextResponse } from 'next/server'
import pool from '@/lib/db/pool'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const usersR = await pool.query('SELECT id, email, created_at FROM users ORDER BY created_at')
    const calcsR = await pool.query(`
      SELECT c.id, c.label, c.calculation_type, c.created_at, u.email
      FROM calculations c
      LEFT JOIN users u ON u.id = c.user_id
      ORDER BY c.created_at DESC
    `)
    const agreementsR = await pool.query(`
      SELECT a.id, a.label, a.agreement_type, a.created_at, u.email
      FROM agreements a
      LEFT JOIN users u ON u.id = a.user_id
      ORDER BY a.created_at DESC
    `)
    return NextResponse.json({
      users: usersR.rows,
      calculations: calcsR.rows,
      agreements: agreementsR.rows,
    })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
