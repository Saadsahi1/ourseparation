import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'

const noStoreHeaders = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
}

// Returns the user's most-recently-saved values across their past agreements
// and calculations, so that the new agreement editor can suggest them.
export async function GET(req) {
  try {
    const { user } = await requireAuth(req)

    // Latest agreement that has any party2 info filled in
    const latestAgr = await pool.query(
      `SELECT party2_name, party2_dob, party2_occupation, party2_parental_title, party2_email,
              party1_dob, party1_occupation, party1_parental_title,
              marriage_date, cohabitation_date, separation_date,
              marriage_location, signing_city
       FROM agreements
       WHERE user_id = $1 AND (party2_name IS NOT NULL OR signing_city IS NOT NULL)
       ORDER BY updated_at DESC, created_at DESC
       LIMIT 1`,
      [user.id]
    )

    // Latest calculation with incomes
    const latestCalc = await pool.query(
      `SELECT inputs FROM calculations
       WHERE user_id = $1
       ORDER BY created_at DESC LIMIT 1`,
      [user.id]
    )

    let calcIncomes = null
    if (latestCalc.rows.length > 0) {
      const inputs = latestCalc.rows[0].inputs || {}
      calcIncomes = {
        party1_income: inputs.personAIncome || null,
        party2_income: inputs.personBIncome || null,
      }
    }

    return NextResponse.json({
      latestAgreement: latestAgr.rows[0] || null,
      calcIncomes,
    }, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
