/*
  # Add Party 2 Preliminary Information

  1. Changes
    - Add `party2_preliminary_name` column to agreements table
    - Add `party2_preliminary_dob` column to agreements table
    - Add `party2_preliminary_occupation` column to agreements table
    
  2. Purpose
    - Allows Party 1 to enter Party 2's information before Party 2 creates an account
    - When Party 2 joins, they can override this information in their profile
    - The agreement preview uses preliminary data if Party 2 hasn't joined yet
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'party2_preliminary_name'
  ) THEN
    ALTER TABLE agreements ADD COLUMN party2_preliminary_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'party2_preliminary_dob'
  ) THEN
    ALTER TABLE agreements ADD COLUMN party2_preliminary_dob date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'party2_preliminary_occupation'
  ) THEN
    ALTER TABLE agreements ADD COLUMN party2_preliminary_occupation text;
  END IF;
END $$;