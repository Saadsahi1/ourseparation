import { Pool } from 'pg'

// Pool sized for the Supabase Session Pooler (cap of 15 connections on free tier).
// Each serverless function instance holds only one connection and releases
// it almost immediately when idle, so total cluster-wide connections stay
// well below the cap even with many concurrent invocations.

const globalForPg = globalThis
const poolMax = parseInt(process.env.PG_POOL_MAX || '1', 10)
const poolMin = parseInt(process.env.PG_POOL_MIN || '0', 10)

if (!globalForPg._pgPool) {
  globalForPg._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: Number.isFinite(poolMax) ? poolMax : 1,
    min: Number.isFinite(poolMin) ? poolMin : 0,
    // Drop idle connections almost immediately so the Supabase pooler
    // can reclaim them.
    idleTimeoutMillis: 500,
    connectionTimeoutMillis: 5000,
    // Fail individual queries quickly so a dead connection doesn't
    // stall an entire request for 15s. The next request will get a
    // fresh connection from the pool.
    query_timeout: 7000,
    statement_timeout: 7000,
    // Detect TCP connections that Supabase's pooler has closed on its
    // side but kept alive on ours.
    keepAlive: true,
    keepAliveInitialDelayMillis: 3000,
    family: 4,
    allowExitOnIdle: true,
  })

  // Don't crash the server if a pooled client errors out — just remove it.
  globalForPg._pgPool.on('error', (err) => {
    console.warn('pg pool client error (will be discarded):', err.message)
  })
}

export const pool = globalForPg._pgPool
export default pool
