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

    let query = 'SELECT * FROM calculations WHERE id = $1'
    const queryParams = [id]

    if (!user.is_admin) {
      query += ' AND user_id = $2'
      queryParams.push(user.id)
    }

    const result = await pool.query(query, queryParams)

    if (result.rows.length === 0) {
      return NextResponse.json({ notFound: true }, { headers: noStoreHeaders })
    }

    return NextResponse.json(result.rows[0], { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    }
    return NextResponse.json({ error: 'Failed to fetch', details: err.message }, { status: 500, headers: noStoreHeaders })
  }
}

export async function DELETE(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params

    let query = 'DELETE FROM calculations WHERE id = $1'
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
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    }
    return NextResponse.json({ error: 'Failed to delete' }, { status: 500, headers: noStoreHeaders })
  }
}
