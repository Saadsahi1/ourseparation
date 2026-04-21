import { NextResponse } from 'next/server'
import pool from '@/lib/db/pool'
import { verifyToken, signAccess } from '@/lib/auth'

export async function POST(req) {
  try {
    const { refreshToken } = await req.json()
    if (!refreshToken) return NextResponse.json({ error: 'Refresh token required' }, { status: 401 })

    const decoded = verifyToken(refreshToken)
    if (decoded.type !== 'refresh') return NextResponse.json({ error: 'Invalid token' }, { status: 401 })

    const stored = await pool.query(
      'SELECT id FROM refresh_tokens WHERE token = $1 AND user_id = $2 AND expires_at > NOW()',
      [refreshToken, decoded.userId]
    )
    if (stored.rows.length === 0) return NextResponse.json({ error: 'Token revoked or expired' }, { status: 401 })

    return NextResponse.json({ accessToken: signAccess(decoded.userId) })
  } catch {
    return NextResponse.json({ error: 'Invalid refresh token' }, { status: 401 })
  }
}
