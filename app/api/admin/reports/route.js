import { NextResponse } from 'next/server'
import { requireAdmin, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

export async function GET(req) {
  try {
    await requireAdmin(req)
    const result = await pool.query(`
      SELECT 
        c.id, c.calculation_type, c.label, c.created_at,
        u.email as user_email
      FROM calculations c
      LEFT JOIN users u ON c.user_id = u.id
      ORDER BY c.created_at DESC
      LIMIT 500
    `)
    return NextResponse.json({ reports: result.rows })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch reports' }, { status: 500 })
  }
}
