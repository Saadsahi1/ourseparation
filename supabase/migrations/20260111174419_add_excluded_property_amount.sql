/*
  # Add Excluded Property Amount Field

  1. Changes
    - Add `excluded_property_amount` numeric field to `property_items` table

  2. Purpose
    - Allow users to specify a partial amount of an asset to be excluded
    - Example: A $50,000 savings account may have $25,000 from inheritance that should be excluded
    - Previously, marking an asset as excluded would exclude the entire value

  3. Notes
    - If excluded_property_amount is NULL or 0, the system will use the full value_at_separation
    - The excluded amount cannot exceed the value_at_separation
*/

-- Add excluded_property_amount field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_items' AND column_name = 'excluded_property_amount'
  ) THEN
    ALTER TABLE property_items ADD COLUMN excluded_property_amount numeric(12,2) DEFAULT NULL;
  END IF;
END $$;
