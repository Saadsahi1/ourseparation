import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

export async function GET(req) {
  try {
    const { user } = await requireAuth(req)
    console.log('GET /api/agreements - user:', user.id)

    const result = await pool.query(
      'SELECT id, agreement_type, label, status, created_at FROM agreements WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )

    console.log('Found', result.rows.length, 'agreements for user', user.id)
    return NextResponse.json({ agreements: result.rows })
  } catch (err) {
    if (err instanceof AuthError) {
      console.error('Auth error in GET /api/agreements:', err.message)
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    console.error('Failed to fetch agreements:', err.message, err.code)
    return NextResponse.json({ error: 'Failed to fetch agreements: ' + err.message }, { status: 500 })
  }
}

export async function POST(req) {
  try {
    const { user } = await requireAuth(req)
    const { agreement_type, label, calculation_id, interview_data } = await req.json()

    if (!agreement_type || !interview_data) {
      return NextResponse.json({ error: 'agreement_type and interview_data required' }, { status: 400 })
    }

    if (!user?.id) {
      console.error('User auth failed - no user.id')
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401 })
    }

    console.log('Creating agreement for user:', user.id, 'type:', agreement_type)

    const result = await pool.query(
      `INSERT INTO agreements (user_id, calculation_id, agreement_type, label, interview_data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, agreement_type, label, status, created_at`,
      [user.id, calculation_id || null, agreement_type, label || 'Untitled Agreement', interview_data]
    )

    if (!result.rows || result.rows.length === 0) {
      console.error('Insert returned no rows')
      return NextResponse.json({ error: 'Failed to create agreement' }, { status: 500 })
    }

    console.log('Agreement created:', result.rows[0].id)
    return NextResponse.json({ agreement: result.rows[0], id: result.rows[0].id }, { status: 201 })
  } catch (err) {
    if (err instanceof AuthError) {
      console.error('Auth error:', err.message)
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    console.error('Failed to create agreement:', err.message, err.code)
    return NextResponse.json({ error: 'Failed to create agreement: ' + err.message }, { status: 500 })
  }
}
