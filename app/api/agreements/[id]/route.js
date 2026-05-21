import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = params

    console.log('GET /api/agreements/[id] - user:', user.id, 'agreement:', id)

    const result = await pool.query(
      `SELECT id, agreement_type, label, status, interview_data, generated_html, calculation_id, created_at, updated_at
       FROM agreements
       WHERE id = $1 AND user_id = $2`,
      [id, user.id]
    )

    console.log('Query result:', result.rows.length, 'rows')

    if (result.rows.length === 0) {
      console.log('Agreement not found - checking if exists for any user...')
      const allResult = await pool.query('SELECT user_id FROM agreements WHERE id = $1', [id])
      if (allResult.rows.length > 0) {
        console.log('Agreement exists but belongs to different user:', allResult.rows[0].user_id)
      } else {
        console.log('Agreement does not exist in database')
      }
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }

    console.log('Found agreement:', result.rows[0].id)
    return NextResponse.json({ agreement: result.rows[0] })
  } catch (err) {
    if (err instanceof AuthError) {
      console.error('Auth error in GET /api/agreements/[id]:', err.message)
      return NextResponse.json({ error: err.message }, { status: 401 })
    }
    console.error('Failed to fetch agreement:', err.message, err.code)
    return NextResponse.json({ error: 'Failed to fetch agreement: ' + err.message }, { status: 500 })
  }
}

export async function PUT(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = params
    const { label, interview_data, generated_html, status } = await req.json()

    // Verify ownership
    const checkResult = await pool.query('SELECT user_id FROM agreements WHERE id = $1', [id])
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }
    if (checkResult.rows[0].user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    const result = await pool.query(
      `UPDATE agreements
       SET label = COALESCE($1, label),
           interview_data = COALESCE($2, interview_data),
           generated_html = COALESCE($3, generated_html),
           status = COALESCE($4, status),
           updated_at = NOW()
       WHERE id = $5
       RETURNING id, agreement_type, label, status, created_at, updated_at`,
      [label, interview_data, generated_html, status, id]
    )

    return NextResponse.json({ agreement: result.rows[0] })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    console.error('Failed to update agreement:', err.message)
    return NextResponse.json({ error: 'Failed to update agreement' }, { status: 500 })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = params

    // Verify ownership
    const checkResult = await pool.query('SELECT user_id FROM agreements WHERE id = $1', [id])
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }
    if (checkResult.rows[0].user_id !== user.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 })
    }

    await pool.query('DELETE FROM agreements WHERE id = $1', [id])
    return NextResponse.json({ success: true })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    console.error('Failed to delete agreement:', err.message)
    return NextResponse.json({ error: 'Failed to delete agreement' }, { status: 500 })
  }
}
