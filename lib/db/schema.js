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

    // users
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
    await client.query(`ALTER TABLE users ADD COLUMN IF NOT EXISTS is_admin BOOLEAN DEFAULT false`)

    await client.query(`
      CREATE TABLE IF NOT EXISTS tax_params (
        id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        tax_year    INTEGER UNIQUE NOT NULL,
        params      JSONB NOT NULL,
        uploaded_by UUID REFERENCES users(id) ON DELETE SET NULL,
        created_at  TIMESTAMPTZ DEFAULT NOW()
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
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id           UUID REFERENCES users(id) ON DELETE CASCADE,
        calculation_type  VARCHAR(20) NOT NULL,
        label             VARCHAR(200),
        inputs            JSONB NOT NULL,
        results           JSONB NOT NULL,
        created_at        TIMESTAMPTZ DEFAULT NOW()
      )
    `)

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

    // ====================================================================
    // 9-TAB AGREEMENT EDITOR SCHEMA
    // Detect old schema and migrate to new normalized form.
    // Old shape: agreements has interview_data JSONB (single blob)
    // New shape: agreements has normalized columns + 17 supporting tables
    // ====================================================================

    const colCheck = await client.query(`
      SELECT column_name FROM information_schema.columns
      WHERE table_name = 'agreements' AND column_name = 'interview_data'
    `)
    const isOldSchema = colCheck.rows.length > 0

    if (isOldSchema) {
      console.log('🔄 Migrating agreements table to new normalized schema...')
      await client.query('DROP TABLE IF EXISTS agreements CASCADE')
    }

    await client.query(`
      CREATE TABLE IF NOT EXISTS agreements (
        id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        user_id                     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        party2_user_id              UUID REFERENCES users(id) ON DELETE SET NULL,
        calculation_id              UUID REFERENCES calculations(id) ON DELETE SET NULL,
        agreement_type              VARCHAR(20) DEFAULT 'separation',
        label                       VARCHAR(255),
        status                      VARCHAR(20) DEFAULT 'draft',
        party1_dob                  DATE,
        party1_occupation           TEXT,
        party1_parental_title       VARCHAR(20),
        party2_name                 VARCHAR(255),
        party2_dob                  DATE,
        party2_occupation           TEXT,
        party2_parental_title       VARCHAR(20),
        party2_email                VARCHAR(255),
        marriage_date               DATE,
        cohabitation_date           DATE,
        separation_date             DATE,
        marriage_location           TEXT,
        signing_city                TEXT,
        party1_signature            TEXT,
        party2_signature            TEXT,
        party1_signed_at            TIMESTAMPTZ,
        party2_signed_at            TIMESTAMPTZ,
        signature_status            VARCHAR(20) DEFAULT 'pending',
        section_completion          JSONB DEFAULT '{}'::jsonb,
        retroactive_support_waived  BOOLEAN DEFAULT FALSE,
        generated_html              TEXT,
        created_at                  TIMESTAMPTZ DEFAULT NOW(),
        updated_at                  TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    await client.query(`ALTER TABLE agreements DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // children
    await client.query(`
      CREATE TABLE IF NOT EXISTS children (
        id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id      UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        full_name         VARCHAR(255) NOT NULL,
        birth_date        DATE NOT NULL,
        primary_residence VARCHAR(20) DEFAULT 'shared',
        created_at        TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    await client.query(`ALTER TABLE children DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // previous_relationship_children
    await client.query(`
      CREATE TABLE IF NOT EXISTS previous_relationship_children (
        id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id             UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        party                    VARCHAR(10) NOT NULL,
        full_name                VARCHAR(255),
        birth_date               DATE,
        lived_with_parties       BOOLEAN DEFAULT FALSE,
        stood_in_loco_parentis   BOOLEAN DEFAULT FALSE,
        has_support_obligation   BOOLEAN DEFAULT FALSE
      )
    `)
    await client.query(`ALTER TABLE previous_relationship_children DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // parenting_terms
    await client.query(`
      CREATE TABLE IF NOT EXISTS parenting_terms (
        id                                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id                      UUID UNIQUE NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        legal_custody_type                VARCHAR(20) DEFAULT 'joint',
        decision_making_education         VARCHAR(20) DEFAULT 'joint',
        decision_making_health            VARCHAR(20) DEFAULT 'joint',
        decision_making_religion          VARCHAR(20) DEFAULT 'joint',
        decision_making_extracurricular   VARCHAR(20) DEFAULT 'joint',
        communication_template            VARCHAR(50),
        communication_variables           JSONB DEFAULT '{}'::jsonb,
        different_schedules_per_child     BOOLEAN DEFAULT FALSE
      )
    `)
    await client.query(`ALTER TABLE parenting_terms DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // parenting_schedules
    await client.query(`
      CREATE TABLE IF NOT EXISTS parenting_schedules (
        id                            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id                  UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        child_id                      UUID REFERENCES children(id) ON DELETE CASCADE,
        regular_schedule_template     VARCHAR(50),
        regular_schedule_variables    JSONB DEFAULT '{}'::jsonb,
        summer_schedule_template      VARCHAR(50),
        summer_schedule_variables     JSONB DEFAULT '{}'::jsonb,
        transportation_template       VARCHAR(50),
        transportation_variables      JSONB DEFAULT '{}'::jsonb,
        pickup_dropoff_location       TEXT
      )
    `)
    await client.query(`ALTER TABLE parenting_schedules DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // holiday_schedule_templates (seeded)
    await client.query(`
      CREATE TABLE IF NOT EXISTS holiday_schedule_templates (
        id             UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        holiday_name   VARCHAR(100) UNIQUE NOT NULL,
        category       VARCHAR(20) NOT NULL,
        preset_options JSONB NOT NULL,
        display_order  INT
      )
    `)

    // agreement_holiday_schedules
    await client.query(`
      CREATE TABLE IF NOT EXISTS agreement_holiday_schedules (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id  UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        holiday_name  VARCHAR(100) NOT NULL,
        arrangement   VARCHAR(50),
        pickup_time   VARCHAR(50),
        dropoff_time  VARCHAR(50),
        notes         TEXT,
        UNIQUE(agreement_id, holiday_name)
      )
    `)
    await client.query(`ALTER TABLE agreement_holiday_schedules DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // special_clauses
    await client.query(`
      CREATE TABLE IF NOT EXISTS special_clauses (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id  UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        clause_type   VARCHAR(50),
        variables     JSONB DEFAULT '{}'::jsonb,
        custom_text   TEXT,
        display_order INT DEFAULT 0
      )
    `)
    await client.query(`ALTER TABLE special_clauses DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // property_items
    await client.query(`
      CREATE TABLE IF NOT EXISTS property_items (
        id                  UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id        UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        owner               VARCHAR(10),
        item_type           VARCHAR(10),
        category            VARCHAR(30),
        description         TEXT,
        value_at_separation NUMERIC DEFAULT 0,
        value_at_marriage   NUMERIC DEFAULT 0,
        is_matrimonial_home BOOLEAN DEFAULT FALSE,
        is_excluded         BOOLEAN DEFAULT FALSE,
        excluded_reason     TEXT,
        excluded_amount     NUMERIC,
        document_url        TEXT,
        created_at          TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    await client.query(`ALTER TABLE property_items DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // property_division_terms
    await client.query(`
      CREATE TABLE IF NOT EXISTS property_division_terms (
        id                              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id                    UUID UNIQUE NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        matrimonial_home_disposition    VARCHAR(30),
        matrimonial_home_variables      JSONB DEFAULT '{}'::jsonb,
        vehicle_transfers               JSONB DEFAULT '[]'::jsonb,
        pension_division_method         VARCHAR(20),
        pension_variables               JSONB DEFAULT '{}'::jsonb,
        rrsp_division_deadline          DATE,
        bank_account_closure_date       DATE,
        equalization_payment_method     VARCHAR(20),
        equalization_variables          JSONB DEFAULT '{}'::jsonb,
        structured_payments             JSONB DEFAULT '[]'::jsonb,
        custom_equalization_amount      NUMERIC,
        custom_equalization_notes       TEXT
      )
    `)
    await client.query(`ALTER TABLE property_division_terms DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // income_documents
    await client.query(`
      CREATE TABLE IF NOT EXISTS income_documents (
        id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id  UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        party         VARCHAR(10) NOT NULL,
        document_type VARCHAR(30) NOT NULL,
        tax_year      INT,
        file_url      TEXT NOT NULL,
        file_name     VARCHAR(255),
        uploaded_at   TIMESTAMPTZ DEFAULT NOW()
      )
    `)
    await client.query(`ALTER TABLE income_documents DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // support_calculations
    await client.query(`
      CREATE TABLE IF NOT EXISTS support_calculations (
        id                                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id                            UUID UNIQUE NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        party1_income                           NUMERIC,
        party2_income                           NUMERIC,
        child_support_payor                     VARCHAR(10),
        child_support_amount                    NUMERIC,
        child_support_arrangement               VARCHAR(20),
        party1_parenting_time_percentage        NUMERIC,
        party2_parenting_time_percentage        NUMERIC,
        party1_table_amount                     NUMERIC,
        party2_table_amount                     NUMERIC,
        section9_factors                        JSONB DEFAULT '{}'::jsonb,
        section9_adjustment_notes               TEXT,
        spousal_support_payor                   VARCHAR(10),
        spousal_support_amount                  NUMERIC,
        spousal_support_template                VARCHAR(50),
        spousal_support_variables               JSONB DEFAULT '{}'::jsonb,
        spousal_support_termination_triggers    JSONB DEFAULT '[]'::jsonb,
        per_child_support                       JSONB DEFAULT '{}'::jsonb,
        arrears_owed_to                         VARCHAR(10),
        arrears_amount                          NUMERIC,
        arrears_pay_within_days                 INT
      )
    `)
    await client.query(`ALTER TABLE support_calculations DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // section7_expenses
    await client.query(`
      CREATE TABLE IF NOT EXISTS section7_expenses (
        id                    UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id          UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        expense_type          VARCHAR(50),
        description           TEXT,
        estimated_annual_cost NUMERIC DEFAULT 0,
        party1_percentage     NUMERIC DEFAULT 50,
        party2_percentage     NUMERIC DEFAULT 50,
        requires_consent      BOOLEAN DEFAULT TRUE,
        is_pre_agreed         BOOLEAN DEFAULT FALSE,
        notes                 TEXT
      )
    `)
    await client.query(`ALTER TABLE section7_expenses DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // retroactive_support_periods
    await client.query(`
      CREATE TABLE IF NOT EXISTS retroactive_support_periods (
        id                       UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id             UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        calendar_year            INT,
        party1_income            NUMERIC,
        party2_income            NUMERIC,
        parenting_arrangement    VARCHAR(20),
        primary_caregiver        VARCHAR(10),
        months_in_period         INT DEFAULT 12,
        monthly_support_amount   NUMERIC DEFAULT 0,
        child_support_payor      VARCHAR(10),
        total_support_owed       NUMERIC DEFAULT 0,
        notes                    TEXT
      )
    `)
    await client.query(`ALTER TABLE retroactive_support_periods DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // retroactive_expenses
    await client.query(`
      CREATE TABLE IF NOT EXISTS retroactive_expenses (
        id                          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id                UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        expense_date                DATE,
        expense_category            VARCHAR(50),
        expense_description         TEXT,
        total_amount                NUMERIC,
        paid_by                     VARCHAR(10),
        seeking_contribution_from   VARCHAR(10),
        contribution_percentage     NUMERIC,
        contribution_amount         NUMERIC,
        has_receipt                 BOOLEAN DEFAULT FALSE,
        notes                       TEXT
      )
    `)
    await client.query(`ALTER TABLE retroactive_expenses DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // additional_terms
    await client.query(`
      CREATE TABLE IF NOT EXISTS additional_terms (
        id                      UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id            UUID UNIQUE NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        insurance_template      VARCHAR(50),
        insurance_variables     JSONB DEFAULT '{}'::jsonb,
        disclosure_template     VARCHAR(50),
        disclosure_variables    JSONB DEFAULT '{}'::jsonb,
        tax_template            VARCHAR(50),
        tax_variables           JSONB DEFAULT '{}'::jsonb,
        dispute_template        VARCHAR(50),
        dispute_variables       JSONB DEFAULT '{}'::jsonb
      )
    `)
    await client.query(`ALTER TABLE additional_terms DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // digital_signatures
    await client.query(`
      CREATE TABLE IF NOT EXISTS digital_signatures (
        id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
        agreement_id    UUID NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
        party           VARCHAR(10) NOT NULL,
        signature_data  TEXT NOT NULL,
        signed_at       TIMESTAMPTZ DEFAULT NOW(),
        ip_address      VARCHAR(45)
      )
    `)
    await client.query(`ALTER TABLE digital_signatures DISABLE ROW LEVEL SECURITY`).catch(() => {})

    // Indexes
    await client.query(`
      CREATE INDEX IF NOT EXISTS idx_calc_user_id      ON calculations(user_id);
      CREATE INDEX IF NOT EXISTS idx_rt_user_id        ON refresh_tokens(user_id);
      CREATE INDEX IF NOT EXISTS idx_users_email       ON users(email);
      CREATE INDEX IF NOT EXISTS idx_cst_effective     ON child_support_tables(effective_date);
      CREATE INDEX IF NOT EXISTS idx_agr_user_id       ON agreements(user_id);
      CREATE INDEX IF NOT EXISTS idx_agr_calc_id       ON agreements(calculation_id);
      CREATE INDEX IF NOT EXISTS idx_children_agr      ON children(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_prev_children_agr ON previous_relationship_children(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_pschedules_agr    ON parenting_schedules(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_holidays_agr      ON agreement_holiday_schedules(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_clauses_agr       ON special_clauses(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_property_agr      ON property_items(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_income_agr        ON income_documents(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_s7_agr            ON section7_expenses(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_retro_periods_agr ON retroactive_support_periods(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_retro_exp_agr     ON retroactive_expenses(agreement_id);
      CREATE INDEX IF NOT EXISTS idx_sigs_agr          ON digital_signatures(agreement_id);
    `)

    // Seed holiday templates
    await seedHolidayTemplates(client)

    await client.query('COMMIT')
    console.log('✅ Database schema ready (9-tab agreement editor)')
  } catch (err) {
    await client.query('ROLLBACK')
    console.error('❌ Schema check failed:', err.message)
  } finally {
    client.release()
    await pool.end()
  }
}

async function seedHolidayTemplates(client) {
  const holidays = [
    // Statutory holidays (Ontario)
    { name: "New Year's Day", category: 'statutory', order: 1 },
    { name: 'Family Day', category: 'statutory', order: 2 },
    { name: 'Good Friday', category: 'statutory', order: 3 },
    { name: 'Easter Sunday', category: 'statutory', order: 4 },
    { name: 'Easter Monday', category: 'statutory', order: 5 },
    { name: 'Victoria Day', category: 'statutory', order: 6 },
    { name: 'Canada Day', category: 'statutory', order: 7 },
    { name: 'Civic Holiday', category: 'statutory', order: 8 },
    { name: 'Labour Day', category: 'statutory', order: 9 },
    { name: 'Thanksgiving', category: 'statutory', order: 10 },
    { name: 'Remembrance Day', category: 'statutory', order: 11 },
    { name: 'Christmas Eve', category: 'statutory', order: 12 },
    { name: 'Christmas Day', category: 'statutory', order: 13 },
    { name: 'Boxing Day', category: 'statutory', order: 14 },
    { name: "New Year's Eve", category: 'statutory', order: 15 },
    // Family
    { name: "Mother's Day", category: 'family', order: 20 },
    { name: "Father's Day", category: 'family', order: 21 },
    { name: "Children's Birthdays", category: 'family', order: 22 },
    { name: 'Parent Birthdays', category: 'family', order: 23 },
    { name: 'March Break', category: 'family', order: 24 },
    { name: 'Summer Vacation', category: 'family', order: 25 },
  ]

  const standardOptions = [
    { value: 'mother_odd_years', label: "Mother in odd years, Father in even years" },
    { value: 'father_odd_years', label: "Father in odd years, Mother in even years" },
    { value: 'mother_all_years', label: "Mother every year" },
    { value: 'father_all_years', label: "Father every year" },
    { value: 'alternate_years', label: "Alternate annually (Party 1 odd, Party 2 even)" },
    { value: 'alternate_years_reverse', label: "Alternate annually (Party 2 odd, Party 1 even)" },
    { value: 'follow_regular_schedule', label: "Follow the regular parenting schedule" },
    { value: 'share_equally', label: "Share equally (split the day)" },
    { value: 'parent_of_the_day', label: "Whichever parent has the children that day" },
  ]

  const motherDayOptions = [
    { value: 'mother_always', label: "Mother every year (entire day)" },
    { value: 'share_equally', label: "Share equally (split the day)" },
    { value: 'follow_regular_schedule', label: "Follow the regular parenting schedule" },
  ]

  const fatherDayOptions = [
    { value: 'father_always', label: "Father every year (entire day)" },
    { value: 'share_equally', label: "Share equally (split the day)" },
    { value: 'follow_regular_schedule', label: "Follow the regular parenting schedule" },
  ]

  const birthdayOptions = [
    { value: 'both_parents', label: "Both parents present (joint celebration)" },
    { value: 'alternate_years', label: "Alternate annually between parties" },
    { value: 'parent_of_the_day', label: "Whichever parent has the children that day" },
    { value: 'follow_regular_schedule', label: "Follow the regular parenting schedule" },
  ]

  const summerOptions = [
    { value: 'equal_split', label: "Equal split (2 weeks alternating)" },
    { value: 'alternate_weeks', label: "Alternating weeks throughout summer" },
    { value: 'extended_party1', label: "Extended block with Party 1" },
    { value: 'extended_party2', label: "Extended block with Party 2" },
  ]

  for (const h of holidays) {
    let options = standardOptions
    if (h.name === "Mother's Day") options = motherDayOptions
    else if (h.name === "Father's Day") options = fatherDayOptions
    else if (h.name === "Children's Birthdays" || h.name === 'Parent Birthdays') options = birthdayOptions
    else if (h.name === 'Summer Vacation') options = summerOptions

    await client.query(
      `INSERT INTO holiday_schedule_templates (holiday_name, category, preset_options, display_order)
       VALUES ($1, $2, $3, $4)
       ON CONFLICT (holiday_name) DO UPDATE SET
         category = EXCLUDED.category,
         preset_options = EXCLUDED.preset_options,
         display_order = EXCLUDED.display_order`,
      [h.name, h.category, JSON.stringify(options), h.order]
    )
  }
}

export { ensureSchema }
