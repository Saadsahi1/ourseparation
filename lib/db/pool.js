import { Pool } from 'pg'

const globalForPg = globalThis

if (!globalForPg._pgPool) {
  globalForPg._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 10,
    idleTimeoutMillis: 30000,
    family: 4,
  })
}

export const pool = globalForPg._pgPool
export default pool
