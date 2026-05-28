import { Pool } from 'pg'

// Pool tuned for Supabase Transaction Pooler in a Vercel serverless context.
//
// Key facts:
//   - The Transaction Pooler closes connections aggressively between
//     transactions. Reusing a pooled client whose underlying TCP socket
//     was already closed on the pooler side causes node-postgres queries
//     with parameters ($1, $2) to hang forever because the Parse step
//     gets ack'd but Bind/Execute response never returns.
//   - Vercel keeps the Node process alive across invocations, so a
//     pool stored on globalThis persists across requests. If we just
//     hand out connections from a long-lived pool, we eventually serve
//     dead ones.
//
// Mitigation:
//   - Tiny pool (max 1 client per function instance)
//   - 500ms idle timeout so we don't hold dead clients
//   - keepAlive=true to surface dead TCP sockets at the OS layer
//   - Probe every freshly-acquired connection with `SELECT 1` to detect
//     pooler-closed sockets before issuing the real query — node-postgres
//     does NOT do this on its own.
//   - Replace the pool entirely if we get an error event (likely a
//     fatal pool state).

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
    query_timeout: 6000,
    statement_timeout: 6000,
    keepAlive: true,
    keepAliveInitialDelayMillis: 3000,
    family: 4,
    allowExitOnIdle: true,
  })

  pool.on('error', (err) => {
    console.warn('pg pool client error (replacing pool):', err.message)
    try { pool.end().catch(() => {}) } catch {}
    if (globalForPg._pgPool === pool) globalForPg._pgPool = null
  })

  return pool
}

function getPool() {
  if (!globalForPg._pgPool) {
    globalForPg._pgPool = buildPool()
  }
  return globalForPg._pgPool
}

// A thin wrapper that probes the connection before running the real query.
// If the probe fails or times out, we drop the client (forcing a fresh one
// next request) and retry the real query once.
async function safeQuery(text, params) {
  let pool = getPool()
  let client
  try {
    client = await pool.connect()
  } catch (err) {
    // Pool itself is broken; rebuild and retry once
    console.warn('pg connect failed, rebuilding pool:', err.message)
    try { await pool.end() } catch {}
    globalForPg._pgPool = null
    pool = getPool()
    client = await pool.connect()
  }

  try {
    // Probe — single-byte SELECT. If the underlying socket has been closed
    // by the pooler, this fails / times out fast and we recover.
    try {
      await Promise.race([
        client.query('SELECT 1'),
        new Promise((_, reject) => setTimeout(() => reject(new Error('probe timeout')), 2000)),
      ])
    } catch (probeErr) {
      // Discard this client, get a new one
      client.release(probeErr)
      client = await pool.connect()
    }

    const res = await client.query(text, params)
    return res
  } finally {
    if (client) {
      try { client.release() } catch {}
    }
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
