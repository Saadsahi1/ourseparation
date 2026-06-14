import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import { loadAgreementBundleForUser } from '@/lib/agreements/serverBundle'
import { renderAgreementPdf } from '@/lib/agreements/agreementPdfRenderer'

export const runtime = 'nodejs'
export const maxDuration = 60

function safeFilename(s) {
  return String(s || 'agreement').replace(/[^a-z0-9_-]+/gi, '_').slice(0, 80)
}

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { id } = await params
    const bundle = await loadAgreementBundleForUser(user, id)

    if (bundle.notFound) {
      return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    }
    if (bundle.forbidden) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

    const pdf = await renderAgreementPdf(bundle)
    const filename = `${safeFilename(`${bundle.agreement?.label || 'agreement'}_${bundle.agreement?.agreement_type || 'separation'}`)}.pdf`

    return new Response(pdf, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-store',
      },
    })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message, code: err.code }, { status: 401 })
    }
    console.error('Agreement PDF export failed:', err)
    return NextResponse.json({ error: 'PDF export failed', details: err.message }, { status: 500 })
  }
}
