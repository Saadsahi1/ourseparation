import pool from '@/lib/db/pool'

export async function loadAgreementBundleForUser(user, agreementId) {
  const client = await pool.connect()
  try {
    const ar = await client.query('SELECT * FROM agreements WHERE id = $1', [agreementId])
    if (ar.rows.length === 0) return { notFound: true }

    const agreement = ar.rows[0]
    if (agreement.user_id !== user.id && !user.is_admin) return { forbidden: true }

    const childrenR           = await client.query('SELECT * FROM children WHERE agreement_id = $1 ORDER BY birth_date', [agreementId])
    const prevChildrenR       = await client.query('SELECT * FROM previous_relationship_children WHERE agreement_id = $1', [agreementId])
    const parentingTermsR     = await client.query('SELECT * FROM parenting_terms WHERE agreement_id = $1', [agreementId])
    const parentingSchedulesR = await client.query('SELECT * FROM parenting_schedules WHERE agreement_id = $1', [agreementId])
    const holidaysR           = await client.query('SELECT * FROM agreement_holiday_schedules WHERE agreement_id = $1', [agreementId])
    const specialClausesR     = await client.query('SELECT * FROM special_clauses WHERE agreement_id = $1 ORDER BY display_order, id', [agreementId])
    const propertyItemsR      = await client.query('SELECT * FROM property_items WHERE agreement_id = $1 ORDER BY category, id', [agreementId])
    const propertyDivR        = await client.query('SELECT * FROM property_division_terms WHERE agreement_id = $1', [agreementId])
    const incomeDocsR         = await client.query('SELECT * FROM income_documents WHERE agreement_id = $1 ORDER BY tax_year DESC, party', [agreementId])
    const supportR            = await client.query('SELECT * FROM support_calculations WHERE agreement_id = $1', [agreementId])
    const section7R           = await client.query('SELECT * FROM section7_expenses WHERE agreement_id = $1 ORDER BY expense_type', [agreementId])
    const retroPeriodsR       = await client.query('SELECT * FROM retroactive_support_periods WHERE agreement_id = $1 ORDER BY calendar_year', [agreementId])
    const retroExpensesR      = await client.query('SELECT * FROM retroactive_expenses WHERE agreement_id = $1 ORDER BY expense_date', [agreementId])
    const additionalR         = await client.query('SELECT * FROM additional_terms WHERE agreement_id = $1', [agreementId])
    const signaturesR         = await client.query('SELECT * FROM digital_signatures WHERE agreement_id = $1', [agreementId])
    const holidayTemplatesR   = await client.query('SELECT holiday_name, category, preset_options, display_order FROM holiday_schedule_templates ORDER BY display_order')
    const userR               = await client.query('SELECT id, email, first_name, last_name FROM users WHERE id = $1', [agreement.user_id])

    return {
      agreement,
      owner: userR.rows[0] || null,
      children: childrenR.rows,
      previousChildren: prevChildrenR.rows,
      parentingTerms: parentingTermsR.rows[0] || null,
      parentingSchedules: parentingSchedulesR.rows,
      parentingSchedule: parentingSchedulesR.rows.find((s) => !s.child_id) || null,
      holidays: holidaysR.rows,
      holidayTemplates: holidayTemplatesR.rows,
      specialClauses: specialClausesR.rows,
      propertyItems: propertyItemsR.rows,
      propertyDivisionTerms: propertyDivR.rows[0] || null,
      incomeDocuments: incomeDocsR.rows,
      supportCalculations: supportR.rows[0] || null,
      section7Expenses: section7R.rows,
      retroactivePeriods: retroPeriodsR.rows,
      retroactiveExpenses: retroExpensesR.rows,
      additionalTerms: additionalR.rows[0] || null,
      signatures: signaturesR.rows,
    }
  } finally {
    client.release()
  }
}
