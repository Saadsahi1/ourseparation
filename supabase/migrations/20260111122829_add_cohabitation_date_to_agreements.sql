/*
  # Add Cohabitation Date to Agreements

  1. Changes
    - Add `cohabitation_date` column to `agreements` table
    - This field is optional and only needed when the cohabitation date differs from the marriage date
  
  2. Notes
    - Field is nullable to maintain backward compatibility
    - Used primarily for common-law relationships or when parties cohabited before marriage
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'cohabitation_date'
  ) THEN
    ALTER TABLE agreements ADD COLUMN cohabitation_date date;
  END IF;
END $$;