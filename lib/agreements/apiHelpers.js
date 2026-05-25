// Server-side helpers shared across agreement API routes.
import pool from '@/lib/db/pool'

export const noStoreHeaders = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
}

// Verify the user owns the agreement (or is admin).
// Returns { ok: true } | { notFound: true } | { forbidden: true }
export async function checkAgreementOwner(user, agreementId) {
  const r = await pool.query('SELECT user_id FROM agreements WHERE id = $1', [agreementId])
  if (r.rows.length === 0) return { notFound: true }
  if (r.rows[0].user_id !== user.id && !user.is_admin) return { forbidden: true }
  return { ok: true }
}

// Build a dynamic UPDATE SQL statement from a whitelist of fields and a body.
// whereClauses: [{ field, val }] — all combined with AND
// jsonbFields: list of field names that should be JSON-stringified
// Returns { sql, vals } or null if nothing to update.
export function buildUpdateSQL(table, fields, body, whereClauses, jsonbFields = []) {
  const sets = []
  const vals = []
  let i = 1
  for (const f of fields) {
    if (Object.prototype.hasOwnProperty.call(body, f)) {
      sets.push(`${f} = $${i}`)
      if (jsonbFields.includes(f) && body[f] != null && typeof body[f] === 'object') {
        vals.push(JSON.stringify(body[f]))
      } else {
        vals.push(body[f])
      }
      i++
    }
  }
  if (sets.length === 0) return null
  const whereParts = []
  for (const w of whereClauses) {
    whereParts.push(`${w.field} = $${i}`)
    vals.push(w.val)
    i++
  }
  const sql = `UPDATE ${table} SET ${sets.join(', ')} WHERE ${whereParts.join(' AND ')} RETURNING *`
  return { sql, vals }
}

// Upsert helper: writes either insert or update for "one-per-agreement" tables.
// jsonbFields: list of field names that should be JSON-stringified
export async function upsertSingleton(pool, table, agreementId, fields, body, jsonbFields = []) {
  const existing = await pool.query(`SELECT id FROM ${table} WHERE agreement_id = $1`, [agreementId])
  if (existing.rows.length === 0) {
    // INSERT
    const cols = ['agreement_id']
    const vals = [agreementId]
    const placeholders = ['$1']
    let i = 2
    for (const f of fields) {
      if (Object.prototype.hasOwnProperty.call(body, f)) {
        cols.push(f)
        if (jsonbFields.includes(f) && body[f] != null && typeof body[f] === 'object') {
          vals.push(JSON.stringify(body[f]))
        } else {
          vals.push(body[f])
        }
        placeholders.push(`$${i}`)
        i++
      }
    }
    const sql = `INSERT INTO ${table} (${cols.join(', ')}) VALUES (${placeholders.join(', ')}) RETURNING *`
    const r = await pool.query(sql, vals)
    return r.rows[0]
  } else {
    const upd = buildUpdateSQL(table, fields, body, [{ field: 'agreement_id', val: agreementId }], jsonbFields)
    if (!upd) {
      const r = await pool.query(`SELECT * FROM ${table} WHERE agreement_id = $1`, [agreementId])
      return r.rows[0]
    }
    const r = await pool.query(upd.sql, upd.vals)
    return r.rows[0]
  }
}
