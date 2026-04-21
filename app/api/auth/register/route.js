import { NextResponse } from 'next/server'
import bcrypt from 'bcryptjs'
import pool from '@/lib/db/pool'
import { signAccess, signRefresh } from '@/lib/auth'

export async function POST(req) {
  try {
    const { email, password, firstName, lastName } = await req.json()

    if (!email || !password || !firstName || !lastName) {
      return NextResponse.json({ error: 'All fields required' }, { status: 400 })
    }
    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email required' }, { status: 400 })
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/\d/.test(password)) {
      return NextResponse.json({ error: 'Password must be 8+ chars with uppercase, lowercase, and number' }, { status: 400 })
    }

    const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()])
    if (existing.rows.length > 0) {
      return NextResponse.json({ error: 'An account with this email already exists' }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, first_name, last_name) VALUES ($1,$2,$3,$4) RETURNING id, email, first_name, last_name, is_admin',
      [email.toLowerCase(), passwordHash, firstName.trim(), lastName.trim()]
    )
    const user = result.rows[0]
    const accessToken = signAccess(user.id)
    const refreshToken = signRefresh(user.id)

    await pool.query(
      'INSERT INTO refresh_tokens (user_id, token, expires_at) VALUES ($1,$2,$3)',
      [user.id, refreshToken, new Date(Date.now() + 30 * 24 * 60 * 60 * 1000)]
    )

    return NextResponse.json({
      user: { id: user.id, email: user.email, firstName: user.first_name, lastName: user.last_name, is_admin: user.is_admin },
      accessToken,
      refreshToken,
    }, { status: 201 })
  } catch (err) {
    console.error('Register error:', err)
    return NextResponse.json({ error: 'Registration failed' }, { status: 500 })
  }
}
