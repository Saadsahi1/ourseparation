import { Pool } from 'pg'

const globalForPg = globalThis

if (!globalForPg._pgPool) {
  globalForPg._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    min: 2,
    idleTimeoutMillis: 30000,
    connectionTimeoutMillis: 10000,
    query_timeout: 30000,  // 30 second query timeout
    statement_timeout: 30000,
    family: 4,
  })
}

export const pool = globalForPg._pgPool
export default pool
