import { Pool } from 'pg'

const globalForPg = globalThis

if (!globalForPg._pgPool) {
  globalForPg._pgPool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 5,  // Reduce from 10 to 5 to prevent exhaustion
    min: 1,
    idleTimeoutMillis: 10000,  // Release idle connections faster
    connectionTimeoutMillis: 5000,  // Fail fast if can't get connection
    family: 4,
  })
}

export const pool = globalForPg._pgPool
export default pool
