// This file is a Next.js convention — it runs ONCE when the server starts.
// Perfect place to ensure the database schema exists.
// See: https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation

export async function register() {
  // Only run on the Node.js server, not in the browser bundle
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { ensureSchema } = await import('./lib/db/schema')
    await ensureSchema()
    // Tax params are loaded statically from lib/config/taxParams.js via getTaxParams()
  }
}
