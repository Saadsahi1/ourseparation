import { NextResponse } from 'next/server'
import { requireAdmin, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

export async function GET(req) {
  try {
    await requireAdmin(req)
    const [userRes, calcRes, withChildRes, withoutChildRes, activeRes] = await Promise.all([
      pool.query('SELECT COUNT(*) as count FROM users'),
      pool.query('SELECT COUNT(*) as count FROM calculations'),
      pool.query("SELECT COUNT(*) as count FROM calculations WHERE calculation_type = 'with_child'"),
      pool.query("SELECT COUNT(*) as count FROM calculations WHERE calculation_type = 'without_child'"),
      pool.query("SELECT COUNT(DISTINCT user_id) as count FROM calculations WHERE created_at > NOW() - INTERVAL '30 days'")
    ])
    return NextResponse.json({
      totalUsers: parseInt(userRes.rows[0].count),
      totalReports: parseInt(calcRes.rows[0].count),
      withChild: parseInt(withChildRes.rows[0].count),
      withoutChild: parseInt(withoutChildRes.rows[0].count),
      activeThisMonth: parseInt(activeRes.rows[0].count)
    })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to fetch stats' }, { status: 500 })
  }
}
