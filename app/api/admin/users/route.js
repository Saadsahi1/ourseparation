import { NextResponse } from 'next/server'
import { requireAdmin, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

export async function GET(req) {
  try {
    await requireAdmin(req)
    const result = await pool.query(`
      SELECT 
        u.id, u.email, u.first_name, u.last_name, u.created_at, u.last_login,
        COUNT(c.id) as calculation_count
      FROM users u
      LEFT JOIN calculations c ON u.id = c.user_id
      GROUP BY u.id
      ORDER BY u.created_at DESC
    `)
    return NextResponse.json({ users: result.rows })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 })
  }
}
