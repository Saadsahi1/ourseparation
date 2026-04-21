/*
  # Add child support arrangement type field

  1. Changes
    - Add `child_support_arrangement` column to `support_calculations` table
      - Values: 'section3' (primary care) or 'section9' (shared parenting)
      - Default: 'section3'
    
  2. Notes
    - Section 3: Standard child support when one parent has primary care
    - Section 9: Shared parenting arrangement (each parent has child 40%+ of time)
    - This affects calculation method and agreement wording
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'child_support_arrangement'
  ) THEN
    ALTER TABLE support_calculations 
    ADD COLUMN child_support_arrangement text DEFAULT 'section3' 
    CHECK (child_support_arrangement IN ('section3', 'section9'));
  END IF;
END $$;
