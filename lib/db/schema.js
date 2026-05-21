// lib/db/schema.js
// Runs on every server start via instrumentation.js
// Uses CREATE TABLE IF NOT EXISTS — completely safe to re-run.
// If tables already exist, this is a no-op.

import { Pool } from 'pg'

async function ensureSchema() {
  if (!process.env.DATABASE_URL) {
    console.warn('⚠️  DATABASE_URL not set — skipping schema check')
    return
  }

  // Use a one-off pool here so we don't interfere with the app pool
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false },
    max: 1,
    family: 4,
  })

  let client
  try {
    client = await pool.connect()
  } catch (err) {
    console.warn('⚠️  Could not connect to database — skipping schema check:', err.message)
    await pool.end()
    return
  }

  try {
    await client.query('BEGIN')

    // users table
    await client.query(`
      CREATE TABLE IF NOT EXISTS users (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        email         VARCHAR(255) UNIQUE NOT NULL,
        password_hash VARCHAR(255) NOT NULL,
        first_name    VARCHAR(100),
        last_name     VARCHAR(100),
        created_at    TIMESTAMPTZ DEFAULT NOW(),
        last_login    TIMESTAMPTZ
      )
    `)
    // Add is_admin column if it doesn't exist (safe to re-run)
    await client.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false
    `)

    // tax_params table — admin-uploaded annual tax parameters
    await client.query(`
      CREATE TABLE IF NOT EXISTS tax_params (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tax_year    INTEGER UNIQUE NOT NULL,
        params      JSONB NOT NULL,
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // refresh tokens — one row per active session
    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
        token      TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // saved calculations
    await client.query(`
      CREATE TABLE IF NOT EXISTS calculations (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
        calculation_type  VARCHAR(20) NOT NULL,
        label             VARCHAR(200),
        inputs            JSONB NOT NULL,
        results           JSONB NOT NULL,
        created_at        TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Disable RLS on calculations table (auth handled in API layer)
    await client.query(`ALTER TABLE calculations DISABLE ROW LEVEL SECURITY`)

    // child_support_tables — Federal Child Support Guidelines (effective_date, not year)
    await client.query(`
      CREATE TABLE IF NOT EXISTS child_support_tables (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        effective_date DATE UNIQUE NOT NULL,
        table_data     JSONB NOT NULL,
        cpi_adjustment NUMERIC(5, 3),
        uploaded_by    UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at     TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // agreements — Ontario family law agreements (separation, cohabitation, prenup, etc.)
    await client.query(`
      CREATE TABLE IF NOT EXISTS agreements (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        calculation_id   UUID REFERENCES calculations(id) ON DELETE SET NULL,
        agreement_type   VARCHAR(50) NOT NULL,
        label            VARCHAR(255),
        status           VARCHAR(20) DEFAULT 'draft',
        interview_data   JSONB NOT NULL,
        generated_html   TEXT,
        created_at       TIMESTAMPTZ DEFAULT NOW(),
        updated_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    // Disable RLS on agreements table (auth handled in API layer)
    await client.query(`ALTER TABLE agreements DISABLE ROW LEVEL SECURITY`)

    // indexes — IF NOT EXISTS keeps this idempotent
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_calc_user_id    ON calculations(user_id);
      CREATE INDEX IF NOT EXISTS idx_rt_user_id      ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_email     ON users(email);
      CREATE INDEX IF NOT EXISTS idx_cst_effective   ON child_support_tables(effective_date);
      CREATE INDEX IF NOT EXISTS idx_agr_user_id     ON agreements(user_id);
      CREATE INDEX IF NOT EXISTS idx_agr_calc_id     ON agreements(calculation_id);
    `)

    await client.query('COMMIT')
    console.log('✅ Database schema ready')
  } catch (err) {
    await client.query('ROLLBACK')
    // Log but don't crash the app — it will fail naturally on first DB call
    console.error('❌ Schema check failed:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

export { ensureSchema }
