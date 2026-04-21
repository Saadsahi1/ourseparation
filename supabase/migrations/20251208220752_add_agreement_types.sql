/*
  # Add Agreement Types Support

  ## Overview
  This migration adds support for multiple types of agreements beyond just separation agreements.

  ## Changes Made
  
  ### 1. New Column in agreements table
    - `agreement_type` (text): The type of agreement
      - separation: Traditional separation agreement (default)
      - cohabitation: Cohabitation agreement for common-law couples
      - prenuptial: Pre-nuptial agreement (before marriage)
      - postnuptial: Post-nuptial agreement (after marriage)
      - amendment: Amendment to a previous agreement
  
  ### 2. Reference to Original Agreement
    - `original_agreement_id` (uuid): For amendment agreements, references the original agreement being amended

  ## Notes
  - Default type is 'separation' to maintain backwards compatibility
  - Amendment agreements can reference an original agreement
*/

-- Add agreement_type column to agreements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'agreement_type'
  ) THEN
    ALTER TABLE agreements ADD COLUMN agreement_type text DEFAULT 'separation';
    ALTER TABLE agreements ADD CONSTRAINT valid_agreement_type 
      CHECK (agreement_type IN ('separation', 'cohabitation', 'prenuptial', 'postnuptial', 'amendment'));
  END IF;
END $$;

-- Add original_agreement_id for amendment agreements
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'original_agreement_id'
  ) THEN
    ALTER TABLE agreements ADD COLUMN original_agreement_id uuid REFERENCES agreements(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Create index for original_agreement_id lookups
CREATE INDEX IF NOT EXISTS idx_agreements_original ON agreements(original_agreement_id);

-- Update existing agreements to have 'separation' type
UPDATE agreements SET agreement_type = 'separation' WHERE agreement_type IS NULL;
