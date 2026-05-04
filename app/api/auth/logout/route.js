import { NextResponse } from 'next/server'
import pool from '@/lib/db/pool'
import { requireAuth, AuthError } from '@/lib/auth'

export const runtime = 'nodejs'

export async function POST(req) {
  try {
    const { user } = await requireAuth(req)
    const { refreshToken } = await req.json()
    if (refreshToken) {
      await pool.query('DELETE FROM refresh_tokens WHERE token = $1 AND user_id = $2', [refreshToken, user.id])
    }
    return NextResponse.json({ message: 'Logged out' })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    if (err?.code === 'AUTH_MISCONFIGURED') {
      return NextResponse.json({ error: 'Authentication is not configured on the server' }, { status: 500 })
    }
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
