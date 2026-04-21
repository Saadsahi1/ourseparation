// Standalone migration script — run manually if needed:
// node lib/db/migrate.js
//
// In normal use, schema.js handles this automatically on server startup.

require('dotenv').config({ path: '.env.local' })
const { Pool } = require('pg')

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false },
})

async function migrate() {
  const client = await pool.connect()
  try {
    await client.query('BEGIN')

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

    await client.query(`
      CREATE TABLE IF NOT EXISTS refresh_tokens (
        id         UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id    UUID REFERENCES users(id) ON DELETE CASCADE,
        token      TEXT NOT NULL,
        expires_at TIMESTAMPTZ NOT NULL,
        created_at TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE TABLE IF NOT EXISTS calculations (
        id               UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id          UUID REFERENCES users(id) ON DELETE CASCADE,
        calculation_type VARCHAR(20) NOT NULL,
        label            VARCHAR(200),
        inputs           JSONB NOT NULL,
        results          JSONB NOT NULL,
        created_at       TIMESTAMPTZ DEFAULT NOW()
      )
    `)

    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_calc_user_id ON calculations(user_id);
      CREATE INDEX IF NOT EXISTS idx_rt_user_id   ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_email  ON users(email);
    `)

    await client.query('COMMIT')
    console.log('✅ Migration complete — tables ready in Supabase')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Migration failed:', err.message)
    process.exit(1)
  } finally {
    client.release()
    await pool.end()
  }
}

migrate()
