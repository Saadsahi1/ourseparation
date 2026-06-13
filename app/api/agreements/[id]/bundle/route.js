import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import { loadAgreementBundleForUser } from '@/lib/agreements/serverBundle'

const noStoreHeaders = {
  'Cache-Control': 'no-store',
  Pragma: 'no-cache',
  Expires: '0',
}

// Single endpoint that returns the agreement + every related table.
// Used by the tabbed editor on initial load and after each save.
//
// All queries share one Client so the bundle uses ONE database
// connection total, even though it issues ~17 statements. Without
// this, our fresh-Client-per-query default would open 17 connections
// simultaneously and trip Supabase's Session Pooler cap (EMAXCONNSESSION).
export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params

    const bundle = await loadAgreementBundleForUser(user, id)
    if (bundle.notFound) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404, headers: noStoreHeaders })
    }
    if (bundle.forbidden) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    }
    return NextResponse.json(bundle, { headers: noStoreHeaders })
  } catch (err) {
    if (err instanceof AuthError) return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    console.error('Bundle fetch failed:', err.message)
    return NextResponse.json({ error: 'Failed to load agreement bundle', details: err.message }, { status: 500, headers: noStoreHeaders })
  }
}
