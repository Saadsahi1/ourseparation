import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { noStoreHeaders, checkAgreementOwner } from '@/lib/agreements/apiHelpers'

// Submit a signature for the current user's party.
// Body: { party: 'party1' | 'party2', signature_data: base64 }
export async function POST(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const body = await req.json()
    const check = await checkAgreementOwner(user, id)
    if (check.notFound) return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    if (check.forbidden) return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })

    const party = body.party === 'party2' ? 'party2' : 'party1'
    const sigData = body.signature_data
    if (!sigData) return NextResponse.json({ error: 'signature_data required' }, { status: 400, headers: noStoreHeaders })

    const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || req.headers.get('x-real-ip') || null

    // Insert into audit log
    await pool.query(
      'INSERT INTO digital_signatures (agreement_id, party, signature_data, ip_address) VALUES ($1, $2, $3, $4)',
      [id, party, sigData, ip]
    )

    // Update agreement row with the latest signature
    const tsCol = party === 'party1' ? 'party1_signed_at' : 'party2_signed_at'
    const sigCol = party === 'party1' ? 'party1_signature' : 'party2_signature'
    const otherSigCol = party === 'party1' ? 'party2_signature' : 'party1_signature'

    const r = await pool.query(
      `UPDATE agreements SET ${sigCol} = $1, ${tsCol} = NOW(),
       signature_status = CASE
         WHEN ${otherSigCol} IS NOT NULL THEN 'complete'
         ELSE '${party}_signed'
       END,
       updated_at = NOW()
       WHERE id = $2 RETURNING signature_status, party1_signed_at, party2_signed_at`,
      [sigData, id]
    )
    return NextResponse.json(r.rows[0], { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    return NextResponse.json({ error: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
