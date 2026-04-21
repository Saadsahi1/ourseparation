import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'

export async function GET(req) {
  try {
    const { user } = await requireAuth(req)
    return NextResponse.json({ user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, is_admin: user.is_admin } })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message, code: err.code }, { status: 401 })
    return NextResponse.json({ error: 'Server error' }, { status: 500 })
  }
}
