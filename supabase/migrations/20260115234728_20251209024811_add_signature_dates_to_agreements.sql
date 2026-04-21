/*
  # Add Signature Dates to Agreements

  1. Changes
    - Add `party1_signed_at` (timestamptz) to agreements table
    - Add `party2_signed_at` (timestamptz) to agreements table
    - Add `agreement_date` (date) to agreements table for the official date of the agreement
  
  2. Notes
    - party1_signed_at: When the first party signs the agreement
    - party2_signed_at: When the second party signs the agreement
    - agreement_date: The official date of the agreement (typically when party2 signs)
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'party1_signed_at'
  ) THEN
    ALTER TABLE agreements ADD COLUMN party1_signed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'party2_signed_at'
  ) THEN
    ALTER TABLE agreements ADD COLUMN party2_signed_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'agreement_date'
  ) THEN
    ALTER TABLE agreements ADD COLUMN agreement_date date;
  END IF;
END $$;