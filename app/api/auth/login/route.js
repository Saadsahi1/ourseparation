import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'
import { signAccess, signRefresh } from '@/lib/auth'

export async function POST(req) {
  try {
    const { email, password } = await req.json()
    if (!email || !password) return NextResponse.json({ error: 'Email and password required' }, { status: 400 })

    const result = await pool.query(
      'SELECT id, email, password_hash, first_name, last_name, is_admin FROM users WHERE email = $1',
      [email.toLowerCase()]
    )
    if (result.rows.length === 0) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    const user = result.rows[0]
    const valid = await bcrypt.compare(password, user.password_hash)
    if (!valid) return NextResponse.json({ error: 'Invalid email or password' }, { status: 401 })

    await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id])

    const accessToken = signAccess(user.id)
    const refreshToken = signRefresh(user.id)
    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)',
      [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
    )

    return NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, is_admin: user.is_admin },
      accessToken, refreshToken,
    })
  } catch (err) {
    console.error('Login error:', err)
    return NextResponse.json({ error: 'Login failed' }, { status: 500 })
  }
}
