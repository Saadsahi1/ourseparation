/*
  # Add Template Support for Property Division Terms

  ## Changes
  1. Add columns to store template selections and their variables
     - vehicle_transfer_template (text): Selected template for vehicle transfers
     - vehicle_transfer_variables (jsonb): Variables to fill in the template
     - pension_division_template (text): Selected template for pension division
     - pension_division_variables (jsonb): Variables for pension template
     - equalization_payment_template (text): Selected template for equalization
     - equalization_payment_variables (jsonb): Variables for equalization template
  
  ## Template System
  - Users select from predefined templates
  - Templates have placeholders that get filled with variables
  - No free-text drafting allowed
  
  ## Security
  - Existing RLS policies apply
*/

DO $$
BEGIN
  -- Add vehicle transfer template fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_division_terms' AND column_name = 'vehicle_transfer_template'
  ) THEN
    ALTER TABLE property_division_terms ADD COLUMN vehicle_transfer_template text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_division_terms' AND column_name = 'vehicle_transfer_variables'
  ) THEN
    ALTER TABLE property_division_terms ADD COLUMN vehicle_transfer_variables jsonb DEFAULT '[]'::jsonb;
  END IF;

  -- Add pension division template fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_division_terms' AND column_name = 'pension_division_template'
  ) THEN
    ALTER TABLE property_division_terms ADD COLUMN pension_division_template text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_division_terms' AND column_name = 'pension_division_variables'
  ) THEN
    ALTER TABLE property_division_terms ADD COLUMN pension_division_variables jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add equalization payment template fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_division_terms' AND column_name = 'equalization_payment_template'
  ) THEN
    ALTER TABLE property_division_terms ADD COLUMN equalization_payment_template text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_division_terms' AND column_name = 'equalization_payment_variables'
  ) THEN
    ALTER TABLE property_division_terms ADD COLUMN equalization_payment_variables jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;