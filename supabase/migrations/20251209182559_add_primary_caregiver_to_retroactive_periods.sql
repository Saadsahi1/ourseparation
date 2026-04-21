/*
  # Add Primary Caregiver to Retroactive Support Periods

  1. Changes to Existing Tables
    - `retroactive_support_periods`
      - Add `primary_caregiver` (text, nullable) - Identifies which party had primary care during this period ('party1' | 'party2')
      - This field is used for Section 3 arrangements to determine who receives support
      - For Section 9 (shared parenting), this field remains null

  2. Notes
    - For Section 3 (Primary Care) arrangements, the primary caregiver is the recipient of support
    - The non-primary caregiver is the payor
    - For Section 9 (Shared Parenting), this field is not applicable as both parents share care
*/

-- Add primary_caregiver column to retroactive_support_periods table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'retroactive_support_periods' AND column_name = 'primary_caregiver'
  ) THEN
    ALTER TABLE retroactive_support_periods 
    ADD COLUMN primary_caregiver text CHECK (primary_caregiver IN ('party1', 'party2') OR primary_caregiver IS NULL);
  END IF;
END $$;