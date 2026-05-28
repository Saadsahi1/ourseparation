import { Client } from 'pg'

// No connection pooling — Supabase Transaction Pooler closes upstream
// connections in ways node-postgres can't reliably detect, so any reused
// connection risks hanging on parameterized queries (the source of the
// recurring "Query read timeout" 500s on /api/agreements POST and other
// write endpoints).
//
// Pattern: open a fresh Client per query, connect, run the query, close.
// Costs ~80ms of connection setup per query (TCP + TLS + auth), which is
// acceptable for our traffic and far preferable to intermittent timeouts.
// Supabase's Transaction Pooler is built to handle this — its whole
// purpose is to absorb many short-lived connections from serverless apps.

async function withClient(fn) {
  const client = new Client({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    connectionTimeoutMillis: 5000,
    query_timeout: 12000,
    statement_timeout: 12000,
    keepAlive: true,
    family: 4,
  })

  // Catch async errors so they don't crash the function instance.
  client.on('error', (err) => {
    console.warn('pg client error (ignored, connection closing):', err.message)
  })

  await client.connect()
  try {
    return await fn(client)
  } finally {
    try { await client.end() } catch {}
  }
}

async function safeQuery(text, params) {
  return withClient((client) => client.query(text, params))
}

// Expose a pg.Pool-shaped surface so existing code (pool.query / pool.connect)
// keeps working without modification.
export const pool = {
  query: safeQuery,
  // For the few endpoints that need a real "client" for transactions (e.g.
  // ensureSchema), hand them a fresh Client that will be released by them.
  // Caller is responsible for calling release()/end().
  connect: async () => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      query_timeout: 12000,
      statement_timeout: 12000,
      keepAlive: true,
      family: 4,
    })
    client.on('error', (err) => {
      console.warn('pg client error (ignored, connection closing):', err.message)
    })
    await client.connect()
    // Pool-shaped release() method: simply ends the client connection.
    client.release = async () => { try { await client.end() } catch {} }
    return client
  },
  end: () => Promise.resolve(),
}

export default pool
