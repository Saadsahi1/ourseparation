// Authenticated file-serving endpoint. Documents now live in Supabase
// Storage (production) or local /private_uploads (dev). The download URL
// is shaped like:
//   /api/files/income/<agreement_id>/<party>/<year>/<doc_type>/<filename>
//   /api/files/property/<agreement_id>/<item_id>/<filename>
// The agreement_id is always the second path segment, used to verify
// the requester owns the underlying agreement (or is admin) before
// streaming the bytes.

import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import { downloadFile, contentTypeFor } from '@/lib/storage'

export const runtime = 'nodejs'

const noStoreHeaders = {
  'Cache-Control': 'private, no-store',
}

export async function GET(req, { params }) {
  try {
    const { user } = await requireAuth(req)
    const { path: segs } = await params

    if (!Array.isArray(segs) || segs.length < 3) {
      return NextResponse.json({ error: 'Invalid file path' }, { status: 400, headers: noStoreHeaders })
    }

    // segs = [kind, agreementId, ...rest]
    const [kind, agreementId, ...rest] = segs
    if (!['income', 'property'].includes(kind)) {
      return NextResponse.json({ error: 'Unknown file kind' }, { status: 400, headers: noStoreHeaders })
    }
    // Path traversal defense.
    for (const seg of segs) {
      if (!seg || seg.includes('..') || seg.includes('\0')) {
        return NextResponse.json({ error: 'Invalid path' }, { status: 400, headers: noStoreHeaders })
      }
    }

    // Verify the requester owns the agreement (or is admin).
    const ar = await pool.query('SELECT user_id FROM agreements WHERE id = $1', [agreementId])
    if (ar.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    }
    if (ar.rows[0].user_id !== user.id && !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    }

    // Storage-relative path is the full URL path after /api/files/.
    const relPath = segs.join('/')
    const result = await downloadFile(relPath)
    if (!result) {
      return NextResponse.json({ error: 'File not found' }, { status: 404, headers: noStoreHeaders })
    }

    const filename = rest[rest.length - 1] || 'download'
    const headers = {
      'Content-Type': result.contentType || contentTypeFor(filename),
      'Content-Length': String(result.size),
      'Cache-Control': 'private, max-age=60',
      // Inline so PDFs and images render in a tab; users can save via the browser menu.
      'Content-Disposition': `inline; filename="${filename.replace(/"/g, '')}"`,
    }
    return new Response(result.buffer, { status: 200, headers })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    }
    console.error('file serve error:', err.message)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500, headers: noStoreHeaders })
  }
}
