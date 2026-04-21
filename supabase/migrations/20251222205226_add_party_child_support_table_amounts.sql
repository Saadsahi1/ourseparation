/*
  # Add Party Child Support Table Amounts

  1. Changes
    - Add `party1_child_support_table_amount` column to `support_calculations` table
    - Add `party2_child_support_table_amount` column to `support_calculations` table

  2. Purpose
    - Store each party's full table amount for accurate SSAG spousal support calculations
    - Required for shared custody (Section 9) cases where both parties pay their table amount
    - Enables correct INDI (Individual Net Disposable Income) calculations

  3. Notes
    - In shared custody, both parties pay their table amount for SSAG purposes
    - Example: Party1 ($150k) pays $1,327/month, Party2 ($25k) pays $184/month
    - Net offset is $1,143/month but SSAG uses both full amounts in calculation
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'party1_child_support_table_amount'
  ) THEN
    ALTER TABLE support_calculations ADD COLUMN party1_child_support_table_amount numeric(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'party2_child_support_table_amount'
  ) THEN
    ALTER TABLE support_calculations ADD COLUMN party2_child_support_table_amount numeric(12,2) DEFAULT 0;
  END IF;
END $$;