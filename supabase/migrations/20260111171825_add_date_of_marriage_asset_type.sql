/*
  # Add Date of Marriage Asset Type

  1. Changes
    - Update the `valid_item_type` constraint on `property_items` table
    - Add 'date_of_marriage_asset' as a valid item type
  
  2. Purpose
    - Allow users to track assets they owned at the date of marriage
    - These assets are excluded from NFP calculations (except matrimonial home)
    - Improves accuracy of Net Family Property calculations
*/

-- Drop the existing constraint
ALTER TABLE property_items
DROP CONSTRAINT IF EXISTS valid_item_type;

-- Add the updated constraint with the new type
ALTER TABLE property_items
ADD CONSTRAINT valid_item_type CHECK (item_type IN ('asset', 'debt', 'date_of_marriage_asset'));