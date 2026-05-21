import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

const noStoreHeaders = {
  'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
  Pragma: 'no-cache',
  Expires: '0',
}

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params

    console.log('GET agreement:', id, 'for user:', user.id)

    let query = `SELECT id, agreement_type, label, status, interview_data, generated_html, calculation_id, created_at, updated_at FROM agreements WHERE id = $1`
    const queryParams = [id]

    if (!user.is_admin) {
      query += ' AND user_id = $2'
      queryParams.push(user.id)
    }

    const result = await pool.query(query, queryParams)

    if (result.rows.length === 0) {
      console.log('Agreement not found:', id)
      return NextResponse.json({ error: 'Agreement not found', notFound: true }, { status: 404, headers: noStoreHeaders })
    }

    return NextResponse.json(result.rows[0], { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    }
    console.error('Failed to fetch agreement:', err.message)
    return NextResponse.json({ error: 'Failed to fetch agreement', details: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

export async function PUT(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const { label, interview_data, generated_html, status } = await req.json()

    const checkResult = await pool.query('SELECT user_id FROM agreements WHERE id = $1', [id])
    if (checkResult.rows.length === 0) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404, headers: noStoreHeaders })
    }
    if (checkResult.rows[0].user_id !== user.id && !user.is_admin) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403, headers: noStoreHeaders })
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
      [label, interview_data ? JSON.stringify(interview_data) : null, generated_html, status, id]
    )

    return NextResponse.json(result.rows[0], { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    console.error('Failed to update agreement:', err.message)
    return NextResponse.json({ error: 'Failed to update agreement', details: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params

    let query = 'DELETE FROM agreements WHERE id = $1'
    const queryParams = [id]

    if (!user.is_admin) {
      query += ' AND user_id = $2'
      queryParams.push(user.id)
    }

    const result = await pool.query(query + ' RETURNING id', queryParams)
    if (result.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    }
    return NextResponse.json({ message: 'Deleted' }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    console.error('Failed to delete agreement:', err.message)
    return NextResponse.json({ error: 'Failed to delete agreement' }, { status: 500, headers: noStoreHeaders })
  }
}
