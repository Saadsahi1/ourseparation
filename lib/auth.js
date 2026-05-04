import jwt from 'jsonwebtoken'
import pool from './db/pool'

const SECRET = process.env.JWT_SECRET

function getJwtSecret() {
  if (!SECRET) {
    const err = new Error('JWT_SECRET is not configured')
    err.code = 'AUTH_MISCONFIGURED'
    throw err
  }
  return SECRET
}

export function signAccess(userId) {
  return jwt.sign({ userId, type: 'access' }, getJwtSecret(), { expiresIn: '7d' })
}

export function signRefresh(userId) {
  return jwt.sign({ userId, type: 'refresh' }, getJwtSecret(), { expiresIn: '30d' })
}

export function verifyToken(token) {
  return jwt.verify(token, getJwtSecret())
}

// Call this in any API route that needs auth
// Returns { user } or throws with a 401 response
export async function requireAuth(request) {
  const authHeader = request.headers.get('authorization')
  if (!authHeader?.startsWith('Bearer ')) {
    throw new AuthError('No token provided')
  }

  const token = authHeader.split(' ')[1]
  let decoded
  try {
    decoded = verifyToken(token)
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      throw new AuthError('Token expired', 'TOKEN_EXPIRED')
    }
    throw new AuthError('Invalid token')
  }

  if (decoded.type !== 'access') throw new AuthError('Invalid token type')

  const result = await pool.query(
    'SELECT id, email, first_name, last_name, is_admin FROM users WHERE id = $1',
    [decoded.userId]
  )
  if (result.rows.length === 0) throw new AuthError('User not found')

  return { user: result.rows[0] }
}

export async function requireAdmin(request) {
  const { user } = await requireAuth(request)
  if (!user.is_admin) throw new AuthError('Admin access required', 'FORBIDDEN')
  return { user }
}

export class AuthError extends Error {
  constructor(message, code) {
    super(message)
    this.code = code
    this.status = 401
  }
}
