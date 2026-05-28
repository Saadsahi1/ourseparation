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
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 5000,
    query_timeout: 15000,
    statement_timeout: 15000,
    family: 4,
    // When using Supabase's Transaction Pooler (port 6543), set
    // PG_DISABLE_PREPARED=true to opt out of prepared statements
    // (Transaction Pooler doesn't support them).
    ...(process.env.PG_DISABLE_PREPARED === 'true' ? { allowExitOnIdle: true } : {}),
  })
}

export const pool = globalForPg._pgPool
export default pool
