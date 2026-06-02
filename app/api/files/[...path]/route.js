// Authenticated file-serving endpoint for documents that used to be public
// under /uploads/... — now they live in private_uploads/ (outside Next.js's
// static-asset folder) and are streamed only to the user who owns the
// underlying agreement (or an admin).
//
// URL pattern:
//   /api/files/income/<agreement_id>/<party>/<year>/<doc_type>/<filename>
//   /api/files/property/<agreement_id>/<item_id>/<filename>
// The agreement_id is always the second path segment.

import { NextResponse } from 'next/server'
import { requireAuth, AuthError } from '@/lib/auth'
import pool from '@/lib/db/pool'
import fs from 'fs/promises'
import path from 'path'

export const runtime = 'nodejs'

const ROOT = path.join(process.cwd(), 'private_uploads')

const noStoreHeaders = {
  'Cache-Control': 'private, no-store',
}

function safeJoin(rootDir, ...segments) {
  // Defensive: reject any segment containing '..' or absolute paths.
  for (const seg of segments) {
    if (!seg || seg.includes('..') || seg.includes('\0') || path.isAbsolute(seg)) {
      return null
    }
  }
  const resolved = path.resolve(rootDir, ...segments)
  // Final check that the resolved path is still under rootDir.
  if (!resolved.startsWith(rootDir + path.sep) && resolved !== rootDir) return null
  return resolved
}

function contentTypeFor(filename) {
  const ext = path.extname(filename).toLowerCase()
  switch (ext) {
    case '.pdf':  return 'application/pdf'
    case '.png':  return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.gif':  return 'image/gif'
    case '.heic': return 'image/heic'
    case '.txt':  return 'text/plain; charset=utf-8'
    default:      return 'application/octet-stream'
  }
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

    // Verify the requester owns the agreement (or is admin).
    const ar = await pool.query('SELECT user_id FROM agreements WHERE id = $1', [agreementId])
    if (ar.rows.length === 0) {
      return NextResponse.json({ error: 'Not found' }, { status: 404, headers: noStoreHeaders })
    }
    if (ar.rows[0].user_id !== user.id && !user.is_admin) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403, headers: noStoreHeaders })
    }

    const fullPath = safeJoin(ROOT, kind, agreementId, ...rest)
    if (!fullPath) {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400, headers: noStoreHeaders })
    }

    let stat
    try {
      stat = await fs.stat(fullPath)
    } catch {
      return NextResponse.json({ error: 'File not found' }, { status: 404, headers: noStoreHeaders })
    }
    if (!stat.isFile()) {
      return NextResponse.json({ error: 'Not a file' }, { status: 400, headers: noStoreHeaders })
    }

    const data = await fs.readFile(fullPath)
    const filename = rest[rest.length - 1] || 'download'
    const headers = {
      'Content-Type': contentTypeFor(filename),
      'Content-Length': String(stat.size),
      'Cache-Control': 'private, max-age=60',
      // Inline so browsers render PDFs/images in a tab; users can save via menu.
      'Content-Disposition': `inline; filename="${filename.replace(/"/g, '')}"`,
    }
    return new Response(data, { status: 200, headers })
  } catch (err) {
    if (err instanceof AuthError) {
      return NextResponse.json({ error: err.message }, { status: 401, headers: noStoreHeaders })
    }
    console.error('file serve error:', err.message)
    return NextResponse.json({ error: 'Failed to serve file' }, { status: 500, headers: noStoreHeaders })
  }
}
