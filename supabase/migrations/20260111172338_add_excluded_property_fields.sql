/*
  # Add Excluded Property Fields

  1. Changes
    - Add `is_excluded_property` boolean field to `property_items` table
    - Add `exclusion_reason` text field to `property_items` table
  
  2. Purpose
    - Allow users to mark certain assets as excluded property (gifts, inheritances, etc.)
    - Track the reason for exclusion for documentation purposes
    - Excluded property is deducted from NFP calculations per Ontario family law
  
  3. Notes
    - Only assets (not debts or date_of_marriage_assets) can be excluded
    - Common exclusion reasons: gift, inheritance, life insurance proceeds, property excluded by domestic contract
*/

-- Add is_excluded_property field with default false
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_items' AND column_name = 'is_excluded_property'
  ) THEN
    ALTER TABLE property_items ADD COLUMN is_excluded_property boolean DEFAULT false NOT NULL;
  END IF;
END $$;

-- Add exclusion_reason field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_items' AND column_name = 'exclusion_reason'
  ) THEN
    ALTER TABLE property_items ADD COLUMN exclusion_reason text;
  END IF;
END $$;