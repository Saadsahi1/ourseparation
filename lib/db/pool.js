import { Client } from 'pg'

// Supabase Transaction Pooler (port 6543) does NOT reliably support
// node-postgres's extended query protocol (the one triggered by passing
// `values` to client.query). The Parse/Bind/Execute messages can be
// reordered or dropped by Supavisor, producing the "Query read timeout"
// 500s we've been seeing on login / agreement create / etc.
//
// Workaround: inline the parameter values into the SQL text using pg's
// own escapers (which are also used internally by client.escapeLiteral),
// then run the result via the *simple* query protocol — which is just
// one synchronous text->result round-trip and works fine through the
// Transaction Pooler.
//
// We still open a fresh Client per query (no pooling) to dodge the
// stale-connection issue on top of all this.

function escapeLiteralBigInt(v) {
  // Postgres BIGINT serialized literally — safe range.
  return `${BigInt(v).toString()}`
}

function escapeLiteral(value) {
  if (value === null || value === undefined) return 'NULL'
  if (typeof value === 'boolean') return value ? 'TRUE' : 'FALSE'
  if (typeof value === 'number') {
    if (!Number.isFinite(value)) return 'NULL'
    return Number.isInteger(value) ? String(value) : String(value)
  }
  if (typeof value === 'bigint') return escapeLiteralBigInt(value)
  if (value instanceof Date) {
    // ISO timestamp with timezone — Postgres parses this for both
    // DATE and TIMESTAMPTZ columns.
    return `'${value.toISOString()}'::timestamptz`
  }
  if (Buffer.isBuffer(value)) {
    return `'\\x${value.toString('hex')}'::bytea`
  }
  if (Array.isArray(value)) {
    // Convert JS array to PG array literal — works for primitives.
    const inner = value.map((v) => escapeLiteralForArray(v)).join(',')
    return `'{${inner}}'`
  }
  if (typeof value === 'object') {
    // Treat as JSONB
    return `'${JSON.stringify(value).replace(/'/g, "''")}'::jsonb`
  }
  // String — escape single quotes by doubling them
  const s = String(value)
  return `'${s.replace(/'/g, "''")}'`
}

function escapeLiteralForArray(v) {
  if (v == null) return 'NULL'
  if (typeof v === 'number') return String(v)
  if (typeof v === 'boolean') return v ? 'TRUE' : 'FALSE'
  // Strings within a PG array literal need backslash-escaped double quotes
  return `"${String(v).replace(/\\/g, '\\\\').replace(/"/g, '\\"')}"`
}

// Replace $1, $2, ... in text with safely-escaped literals. Preserves
// numeric/JSON casts the caller may already have written.
function inlineParams(text, params) {
  if (!params || params.length === 0) return text
  return text.replace(/\$(\d+)/g, (_, n) => {
    const idx = parseInt(n, 10) - 1
    if (idx < 0 || idx >= params.length) {
      throw new Error(`Param index $${n} out of range (have ${params.length})`)
    }
    return escapeLiteral(params[idx])
  })
}

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

// Run the query via the simple protocol (single text string, no params),
// which is the only protocol that works reliably through Supavisor
// Transaction Pooler.
async function safeQuery(text, params) {
  const sql = inlineParams(text, params)
  return withClient((client) => client.query(sql))
}

export const pool = {
  query: safeQuery,
  // Some callers (ensureSchema) need an explicit client for BEGIN/COMMIT
  // sequences. Hand them a raw fresh Client and shim release() to end().
  connect: async () => {
    const client = new Client({
      connectionString: process.env.DATABASE_URL,
      ssl: { rejectUnauthorized: false },
      connectionTimeoutMillis: 5000,
      query_timeout: 30000,
      statement_timeout: 30000,
      keepAlive: true,
      family: 4,
    })
    client.on('error', (err) => {
      console.warn('pg client error (ignored, connection closing):', err.message)
    })
    await client.connect()
    // Wrap query to also go through inline params (so even schema/migration
    // queries hit the simple protocol).
    const origQuery = client.query.bind(client)
    client.query = async (text, values) => {
      if (typeof text === 'string' && values && Array.isArray(values)) {
        return origQuery(inlineParams(text, values))
      }
      return origQuery(text)
    }
    client.release = async () => { try { await client.end() } catch {} }
    return client
  },
  end: () => Promise.resolve(),
}

export default pool
