import { Pool } from 'pg'

// pg pool tuned for Supabase Transaction Pooler in Vercel's serverless runtime.
//
// Strategy: don't probe every request — too expensive. Instead, run the query
// directly and, if it fails with a typical "dead connection" symptom
// (timeout, ECONNRESET, ETIMEDOUT, terminating connection, etc.), discard the
// pool and retry once with a fresh one. In the steady state every query is a
// single round-trip with no overhead.

const globalForPg = globalThis
const poolMax = parseInt(process.env.PG_POOL_MAX || '1', 10)
const poolMin = parseInt(process.env.PG_POOL_MIN || '0', 10)

function buildPool() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: Number.isFinite(poolMax) ? poolMax : 1,
    min: Number.isFinite(poolMin) ? poolMin : 0,
    idleTimeoutMillis: 500,
    connectionTimeoutMillis: 5000,
    query_timeout: 5000,
    statement_timeout: 5000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 3000,
    family: 4,
    allowExitOnIdle: true,
  })

  pool.on('error', (err) => {
    console.warn('pg pool client error (will rebuild pool):', err.message)
    if (globalForPg._pgPool === pool) globalForPg._pgPool = null
    try { pool.end().catch(() => {}) } catch {}
  })

  return pool
}

function getPool() {
  if (!globalForPg._pgPool) {
    globalForPg._pgPool = buildPool()
  }
  return globalForPg._pgPool
}

function isStaleConnectionError(err) {
  if (!err) return false
  const msg = String(err.message || '').toLowerCase()
  const code = err.code || ''
  return (
    msg.includes('timeout') ||
    msg.includes('terminating connection') ||
    msg.includes('connection terminated') ||
    msg.includes('client has encountered a connection error') ||
    msg.includes('econnreset') ||
    msg.includes('etimedout') ||
    msg.includes('socket') ||
    code === 'ECONNRESET' ||
    code === 'ETIMEDOUT' ||
    code === 'EPIPE'
  )
}

async function runOnce(text, params) {
  const pool = getPool()
  return pool.query(text, params)
}

// Resilient query: tries once; if it fails with a connection symptom, rebuilds
// the pool and retries once. Real query/auth errors propagate as-is.
async function safeQuery(text, params) {
  try {
    return await runOnce(text, params)
  } catch (err) {
    if (!isStaleConnectionError(err)) throw err
    console.warn('pg query failed with stale connection — rebuilding pool and retrying once:', err.message)
    const dead = globalForPg._pgPool
    globalForPg._pgPool = null
    try { dead && (await dead.end()) } catch {}
    return runOnce(text, params)
  }
}

// Public API matching the pg.Pool surface used elsewhere.
export const pool = {
  query: safeQuery,
  connect: () => getPool().connect(),
  end: () => {
    const p = globalForPg._pgPool
    globalForPg._pgPool = null
    return p ? p.end() : Promise.resolve()
  },
}

export default pool
