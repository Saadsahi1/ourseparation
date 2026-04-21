import { NextResponse } from 'next/server'
import { requireAdmin, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

export async function DELETE(req, { params }) {
  try {
    await requireAdmin(req)
    await pool.query('DELETE FROM users WHERE id = $1', [params.id])
    return NextResponse.json({ message: 'User deleted' })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 })
  }
}
