import { Pool } from 'pg'

const globalForPg = globalThis
const poolMax = parseInt(process.env.PG_POOL_MAX || '3', 10)
const poolMin = parseInt(process.env.PG_POOL_MIN || '0', 10)

if (!globalForPg._pgPool) {
  globalForPg._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: Number.isFinite(poolMax) ? poolMax : 3,
    min: Number.isFinite(poolMin) ? poolMin : 0,
    idleTimeoutMillis: 10000,
    connectionTimeoutMillis: 5000,
    query_timeout: 15000,
    statement_timeout: 15000,
    family: 4,
  })
}

export const pool = globalForPg._pgPool
export default pool
