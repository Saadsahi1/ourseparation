// One-shot diagnostic + repair: forces ensureSchema() to run again,
// then lists all tables in the public schema so we can verify the
// 9-tab editor tables exist. Safe to re-run — uses CREATE TABLE IF NOT EXISTS.

import { NextResponse } from 'next/server'
import pool from '@/lib/db/pool'
import { ensureSchema } from '@/lib/db/schema'

export const runtime = 'nodejs'

const noStoreHeaders = {
  'Cache-Control': 'no-store',
}

export async function GET() {
  const result = { ranSchema: false, tables: [], error: null }
  try {
    await ensureSchema()
    result.ranSchema = true
  } catch (err) {
    result.error = `schema migration error: ${err.message}`
  }

  try {
    const r = await pool.query(`
      SELECT table_name FROM information_schema.tables
      WHERE table_schema = 'public'
      ORDER BY table_name
    `)
    result.tables = r.rows.map((row) => row.table_name)
  } catch (err) {
    result.error = (result.error ? result.error + '; ' : '') + `tables query error: ${err.message}`
  }

  // Also check whether the "old schema" sentinel column exists on agreements
  try {
    const r = await pool.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'agreements'
      ORDER BY ordinal_position
    `)
    result.agreementsColumns = r.rows.map((row) => row.column_name)
  } catch (err) {
    result.error = (result.error ? result.error + '; ' : '') + `agreements columns query error: ${err.message}`
  }

  return NextResponse.json(result, { headers: noStoreHeaders })
}
