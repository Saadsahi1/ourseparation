/*
  # Add Template Support to Additional Terms Tables
  
  1. Changes to Tables
    - Add template_id, template_title, processed_content, and variable_values columns to:
      - life_insurance_terms
      - disclosure_terms
      - tax_provisions
      - dispute_resolution_terms
      - spousal_support_terms
  
  2. Notes
    - These columns support the new template-based system where users select pre-written legal language
    - variable_values stores the customized values in JSONB format
    - processed_content stores the final text with variables replaced
    - Existing columns are preserved for backwards compatibility
*/

-- Add template fields to life_insurance_terms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'life_insurance_terms' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE life_insurance_terms 
    ADD COLUMN template_id text,
    ADD COLUMN template_title text,
    ADD COLUMN processed_content text,
    ADD COLUMN variable_values jsonb;
  END IF;
END $$;

-- Add template fields to disclosure_terms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'disclosure_terms' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE disclosure_terms 
    ADD COLUMN template_id text,
    ADD COLUMN template_title text,
    ADD COLUMN processed_content text,
    ADD COLUMN variable_values jsonb;
  END IF;
END $$;

-- Add template fields to tax_provisions
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'tax_provisions' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE tax_provisions 
    ADD COLUMN template_id text,
    ADD COLUMN template_title text,
    ADD COLUMN processed_content text,
    ADD COLUMN variable_values jsonb;
  END IF;
END $$;

-- Add template fields to dispute_resolution_terms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'dispute_resolution_terms' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE dispute_resolution_terms 
    ADD COLUMN template_id text,
    ADD COLUMN template_title text,
    ADD COLUMN processed_content text,
    ADD COLUMN variable_values jsonb;
  END IF;
END $$;

-- Add template fields to spousal_support_terms
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'spousal_support_terms' AND column_name = 'template_id'
  ) THEN
    ALTER TABLE spousal_support_terms 
    ADD COLUMN template_id text,
    ADD COLUMN template_title text,
    ADD COLUMN processed_content text,
    ADD COLUMN variable_values jsonb;
  END IF;
END $$;
