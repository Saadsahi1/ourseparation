// Diagnostic: report row counts in every table so we can see what data exists
// without exposing any user content. Safe to expose temporarily.

import { NextResponse } from 'next/server'
import pool from '@/lib/db/pool'

export const runtime = 'nodejs'

export async function GET() {
  try {
    const r = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public' ORDER BY table_name
    `)
    const tables = r.rows.map((t) => t.table_name)
    const counts = {}
    for (const t of tables) {
      try {
        const c = await pool.query(`SELECT COUNT(*)::int AS n FROM "${t}"`)
        counts[t] = c.rows[0].n
      } catch (err) {
        counts[t] = `error: ${err.message}`
      }
    }
    return NextResponse.json({ tables: counts })
  } catch (err) {
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
