/*
  # Add Spousal Support Release and Fixed Termination Date

  1. Changes
    - Add `is_complete_release` (boolean) - Indicates if parties are signing a complete mutual release of spousal support
    - Add `fixed_termination_date` (date) - Date on which spousal support payments will terminate
    
  2. Purpose
    - Allow parties to waive all spousal support rights
    - Allow parties to set a fixed termination date for support obligations
    - These options provide more flexibility in spousal support arrangements
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spousal_support_terms' AND column_name = 'is_complete_release'
  ) THEN
    ALTER TABLE spousal_support_terms ADD COLUMN is_complete_release boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'spousal_support_terms' AND column_name = 'fixed_termination_date'
  ) THEN
    ALTER TABLE spousal_support_terms ADD COLUMN fixed_termination_date date;
  END IF;
END $$;