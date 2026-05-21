import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

export async function GET(req) {
  try {
    const { user } = await requireAuth(req)
    const result = await pool.query(
      'SELECT id, agreement_type, label, status, created_at FROM agreements WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )
    return NextResponse.json({ agreements: result.rows })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    console.error('Failed to fetch agreements:', err.message)
    return NextResponse.json({ error: 'Failed to fetch agreements' }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { user } = await requireAuth(req)
    const { agreement_type, label, calculation_id, interview_data } = await req.json()

    if (!agreement_type || !interview_data) {
      return NextResponse.json({ error: 'agreement_type and interview_data required' }, { status: 400 })
    }

    const result = await pool.query(
      `INSERT INTO agreements (user_id, calculation_id, agreement_type, label, interview_data)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id, agreement_type, label, status, created_at`,
      [user.id, calculation_id || null, agreement_type, label || 'Untitled Agreement', interview_data]
    )

    return NextResponse.json({ agreement: result.rows[0], id: result.rows[0].id }, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    console.error('Failed to create agreement:', err.message)
    return NextResponse.json({ error: 'Failed to create agreement' }, { status: 500 })
  }
}
