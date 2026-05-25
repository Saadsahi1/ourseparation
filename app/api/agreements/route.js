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
      `SELECT id, agreement_type, label, status, section_completion, created_at, updated_at
       FROM agreements WHERE user_id = $1
       ORDER BY updated_at DESC, created_at DESC`,
      [user.id]
    )
    return NextResponse.json({ agreements: result.rows }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    console.error('Failed to fetch agreements:', err.message)
    return NextResponse.json({ error: 'Failed to fetch agreements', details: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

// Create a skeleton agreement. Only requires agreement_type; optional label and calculation_id.
export async function POST(req) {
  try {
    const { user } = await requireAuth(req)
    const body = await req.json().catch(() => ({}))
    const { agreement_type = 'separation', label, calculation_id } = body

    if (!user?.id) {
      return NextResponse.json({ error: 'User authentication failed' }, { status: 401, headers: noStoreHeaders })
    }

    const result = await pool.query(
      `INSERT INTO agreements (user_id, calculation_id, agreement_type, label, status, section_completion, created_at, updated_at)
       VALUES ($1, $2, $3, $4, 'draft', '{}'::jsonb, NOW(), NOW())
       RETURNING id, agreement_type, label, status, created_at, updated_at`,
      [user.id, calculation_id || null, agreement_type, label || 'Untitled Agreement']
    )

    return NextResponse.json(result.rows[0], { status: 201, headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    }
    console.error('Failed to create agreement:', err.message, err.code)
    return NextResponse.json({ error: 'Failed to create agreement', details: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
