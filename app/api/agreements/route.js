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
      'SELECT id, agreement_type, label, status, created_at FROM agreements WHERE user_id = $1 ORDER BY created_at DESC',
      [user.id]
    )
    return NextResponse.json({ agreements: result.rows }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    console.error('Failed to fetch agreements:', err.message)
    return NextResponse.json({ error: 'Failed to fetch agreements', details: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

export async function POST(req) {
  try {
    const { user } = await requireAuth(req)
    const { agreement_type, label, calculation_id, interview_data } = await req.json()

    if (!agreement_type || !interview_data) {
      return NextResponse.json({ error: 'agreement_type and interview_data required' }, { status: 400, headers: noStoreHeaders })
    }

    if (!user?.id) {
      console.error('User auth failed - no user.id')
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401, headers: noStoreHeaders })
    }

    console.log('Creating agreement for user:', user.id, 'type:', agreement_type)

    const result = await pool.query(
      `INSERT INTO agreements (user_id, calculation_id, agreement_type, label, interview_data, created_at, updated_at)
       VALUES ($1, $2, $3, $4, $5, NOW(), NOW())
       RETURNING id, agreement_type, label, status, interview_data, created_at, updated_at`,
      [user.id, calculation_id || null, agreement_type, label || 'Untitled Agreement', JSON.stringify(interview_data)]
    )

    if (!result.rows || result.rows.length === 0) {
      console.error('Insert returned no rows')
      return NextResponse.json({ error: 'Failed to create agreement' }, { status: 500, headers: noStoreHeaders })
    }

    console.log('Agreement created:', result.rows[0].id)
    return NextResponse.json(result.rows[0], { status: 201, headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) {
      console.error('Auth error:', err.message)
      return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    }
    console.error('Failed to create agreement:', err.message, err.code)
    return NextResponse.json({ error: 'Failed to create agreement', details: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
