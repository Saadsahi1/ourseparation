import { NextResponse } from 'next/server'
import pool from '@/lib/db/pool'

export async function GET() {
  try {
    const result = await pool.query('SELECT NOW() as time, current_database() as db')
    return NextResponse.json({
      status: 'ok',
      database: 'connected',
      db: result.rows[0].db,
      time: result.rows[0].time,
    })
  } catch (err) {
    return NextResponse.json({
      status: 'error',
      database: 'unreachable',
      error: err.message,
    }, { status: 503 })
  }
}
