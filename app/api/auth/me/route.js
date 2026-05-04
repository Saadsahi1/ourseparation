import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'

export const runtime = 'nodejs'

export async function GET(req) {
  try {
    const { user } = await requireAuth(req)
    return NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, is_admin: user.is_admin } })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message, code: err.code }, { status: 401 })
    if (err?.code === 'AUTH_MISCONFIGURED') {
      return NextResponse.json({ error: 'Authentication is not configured on the server' }, { status: 500 })
    }
    console.error('GET /me error:', err.message, err.stack)
    return NextResponse.json({ error: err.message || 'Server error', details: process.env.NODE_ENV === 'development' ? err.message : undefined }, { status: 500 })
  }
}
