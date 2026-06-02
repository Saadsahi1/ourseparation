// Document storage abstraction. In production, files live in a private
// Supabase Storage bucket. In local development (or anywhere the Supabase
// env vars aren't set), files fall back to the project-root /private_uploads
// directory so the same code path works for `npm run dev`.
//
// Why we need this: Vercel's serverless functions have an ephemeral, mostly
// read-only filesystem (only /tmp is writable, and even that is wiped
// between cold starts). Writing uploaded documents to /var/task or
// /private_uploads on Vercel fails with ENOENT, which is exactly the
// upload error users were hitting.

import fs from 'fs/promises'
import path from 'path'

// Hard cap per-file upload. Vercel's serverless request-body limit is
// 4.5 MB; we keep the limit at 4 MB so the multipart envelope and form
// fields fit comfortably under the wire limit.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY
const BUCKET = process.env.SUPABASE_STORAGE_BUCKET || 'agreement-files'

const useSupabase = Boolean(SUPABASE_URL && SUPABASE_SERVICE_KEY)
const LOCAL_ROOT = path.join(process.cwd(), 'private_uploads')

// Track whether we've already created the bucket so we don't ping the
// Storage API on every upload. Module-level lasts for the life of the
// function instance.
let bucketReady = false

function urlEncodePath(p) {
  // Encode each segment so spaces / unicode names are valid, but keep "/" as
  // a separator.
  return p.split('/').map(encodeURIComponent).join('/')
}

async function ensureBucket() {
  if (!useSupabase || bucketReady) return
  // POST is idempotent-ish: 200 on create, 400 on duplicate name. Either
  // way we can proceed.
  try {
    await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ id: BUCKET, name: BUCKET, public: false }),
    })
  } catch { /* ignore */ }
  bucketReady = true
}

// Upload a file (provided as a Blob/File or Buffer) to the storage layer.
// relPath is the path WITHIN the bucket / private_uploads root, e.g.
// "income/<agreement_id>/<party>/<year>/<doc_type>/<filename>".
// Throws if the file exceeds MAX_UPLOAD_BYTES.
export async function uploadFile(relPath, fileLike, contentType = 'application/octet-stream') {
  const size = fileLike?.size ?? fileLike?.byteLength ?? 0
  if (size > MAX_UPLOAD_BYTES) {
    const limitMB = (MAX_UPLOAD_BYTES / 1024 / 1024).toFixed(1)
    throw new Error(`File is too large. Maximum size is ${limitMB} MB.`)
  }

  if (useSupabase) {
    await ensureBucket()
    const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${urlEncodePath(relPath)}`
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${SUPABASE_SERVICE_KEY}`,
        'Content-Type': contentType,
        'x-upsert': 'true',
        'Cache-Control': '3600',
      },
      body: fileLike,
    })
    if (!res.ok) {
      const text = await res.text().catch(() => '')
      throw new Error(`Storage upload failed (${res.status}): ${text || res.statusText}`)
    }
    return
  }

  // Local FS fallback
  const full = path.join(LOCAL_ROOT, relPath)
  await fs.mkdir(path.dirname(full), { recursive: true })
  const buf = Buffer.isBuffer(fileLike) ? fileLike : Buffer.from(await fileLike.arrayBuffer())
  await fs.writeFile(full, buf)
}

// Fetch a file from the storage layer. Returns { buffer, contentType } or
// null if the file doesn't exist.
export async function downloadFile(relPath) {
  if (useSupabase) {
    const url = `${SUPABASE_URL}/storage/v1/object/${BUCKET}/${urlEncodePath(relPath)}`
    const res = await fetch(url, {
      headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
    })
    if (res.status === 404) return null
    if (!res.ok) {
      throw new Error(`Storage fetch failed (${res.status}): ${await res.text().catch(() => '')}`)
    }
    const buffer = Buffer.from(await res.arrayBuffer())
    return {
      buffer,
      contentType: res.headers.get('content-type') || 'application/octet-stream',
      size: buffer.length,
    }
  }

  // Local FS fallback
  const full = path.join(LOCAL_ROOT, relPath)
  try {
    const buffer = await fs.readFile(full)
    return { buffer, contentType: null, size: buffer.length }
  } catch (e) {
    if (e.code === 'ENOENT') return null
    throw e
  }
}

// Delete a file from the storage layer. Silently ignores "not found" errors.
export async function deleteFile(relPath) {
  if (useSupabase) {
    try {
      await fetch(`${SUPABASE_URL}/storage/v1/object/${BUCKET}/${urlEncodePath(relPath)}`, {
        method: 'DELETE',
        headers: { Authorization: `Bearer ${SUPABASE_SERVICE_KEY}` },
      })
    } catch { /* ignore */ }
    return
  }
  try {
    await fs.unlink(path.join(LOCAL_ROOT, relPath))
  } catch { /* ignore */ }
}

// Best-effort content-type guess based on filename extension. Used by the
// download path when the storage backend doesn't return a useful header.
export function contentTypeFor(filename) {
  const ext = path.extname(filename || '').toLowerCase()
  switch (ext) {
    case '.pdf':  return 'application/pdf'
    case '.png':  return 'image/png'
    case '.jpg':
    case '.jpeg': return 'image/jpeg'
    case '.webp': return 'image/webp'
    case '.gif':  return 'image/gif'
    case '.heic': return 'image/heic'
    case '.txt':  return 'text/plain; charset=utf-8'
    case '.csv':  return 'text/csv'
    case '.doc':  return 'application/msword'
    case '.docx': return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
    case '.xls':  return 'application/vnd.ms-excel'
    case '.xlsx': return 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    default:      return 'application/octet-stream'
  }
}
