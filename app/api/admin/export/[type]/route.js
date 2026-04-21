import { NextResponse } from 'next/server'
import { requireAdmin, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

const csvEscape = (str) => {
  if (!str) return ''
  if (typeof str !== 'string') str = String(str)
  if (str.includes(',') || str.includes('"') || str.includes('\n')) {
    return `"${str.replace(/"/g, '""')}"` 
  }
  return str
}

export async function GET(req, { params }) {
  try {
    await requireAdmin(req)
    const { type } = params

    let csv = ''
    let data = []

    if (type === 'users') {
      const result = await pool.query(`
        SELECT 
          u.id, u.email, u.first_name, u.last_name, u.created_at, u.last_login,
          COUNT(c.id) as calculation_count
        FROM users u
        LEFT JOIN calculations c ON u.id = c.user_id
        GROUP BY u.id
        ORDER BY u.created_at DESC
      `)
      data = result.rows
      csv = 'ID,Email,First Name,Last Name,Joined,Last Login,Calculation Count\n'
      csv += data.map(u => 
        `${csvEscape(u.id)},${csvEscape(u.email)},${csvEscape(u.first_name)},${csvEscape(u.last_name)},${csvEscape(u.created_at)},${csvEscape(u.last_login)},${u.calculation_count}`
      ).join('\n')
    } else if (type === 'reports') {
      const result = await pool.query(`
        SELECT 
          c.id, c.calculation_type, c.label, c.created_at,
          u.email as user_email
        FROM calculations c
        LEFT JOIN users u ON c.user_id = u.id
        ORDER BY c.created_at DESC
      `)
      data = result.rows
      csv = 'ID,User Email,Calculation Name,Type,Created\n'
      csv += data.map(r => 
        `${csvEscape(r.id)},${csvEscape(r.user_email)},${csvEscape(r.label)},${csvEscape(r.calculation_type)},${csvEscape(r.created_at)}`
      ).join('\n')
    } else {
      return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    return new NextResponse(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="${type}_export.csv"`
      }
    })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401 })
    console.error(err)
    return NextResponse.json({ error: 'Failed to export data' }, { status: 500 })
  }
}
