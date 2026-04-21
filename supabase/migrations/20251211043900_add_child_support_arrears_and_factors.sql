/*
  # Add Child Support Arrears and Shared Parenting Adjustment Factors

  1. Changes to Existing Tables
    - `support_calculations`
      - Add `has_arrears` (boolean) - Whether there are child support arrears owed
      - Add `arrears_amount` (numeric) - Total amount of arrears owed
      - Add `arrears_payor` (text) - Who owes the arrears ('party1' | 'party2' | 'none')
      - Add `arrears_payment_days` (integer) - Number of days from agreement date to pay arrears
      - Add `section9_considers_increased_costs` (boolean) - Whether increased costs of shared parenting are considered
      - Add `section9_considers_transportation` (boolean) - Whether transportation costs are considered
      - Add `section9_considers_equipment` (boolean) - Whether equipment/clothing costs are considered
      - Add `section9_considers_conditions` (boolean) - Whether conditions, means, needs are considered
      - Add `section9_adjustment_notes` (text) - Additional notes about section 9 adjustments
  
  2. Notes
    - Arrears tracking allows parties to specify if child support was owed but not paid historically
    - Section 9 adjustment factors track what was considered in shared parenting calculations
    - All fields are optional to maintain backwards compatibility
*/

-- Add arrears fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'has_arrears'
  ) THEN
    ALTER TABLE support_calculations ADD COLUMN has_arrears boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'arrears_amount'
  ) THEN
    ALTER TABLE support_calculations ADD COLUMN arrears_amount numeric(12,2) DEFAULT 0;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'arrears_payor'
  ) THEN
    ALTER TABLE support_calculations 
    ADD COLUMN arrears_payor text DEFAULT 'none' 
    CHECK (arrears_payor IN ('party1', 'party2', 'none'));
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'arrears_payment_days'
  ) THEN
    ALTER TABLE support_calculations ADD COLUMN arrears_payment_days integer DEFAULT 30;
  END IF;
END $$;

-- Add Section 9 adjustment factor fields
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'section9_considers_increased_costs'
  ) THEN
    ALTER TABLE support_calculations ADD COLUMN section9_considers_increased_costs boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'section9_considers_transportation'
  ) THEN
    ALTER TABLE support_calculations ADD COLUMN section9_considers_transportation boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'section9_considers_equipment'
  ) THEN
    ALTER TABLE support_calculations ADD COLUMN section9_considers_equipment boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'section9_considers_conditions'
  ) THEN
    ALTER TABLE support_calculations ADD COLUMN section9_considers_conditions boolean DEFAULT false;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'section9_adjustment_notes'
  ) THEN
    ALTER TABLE support_calculations ADD COLUMN section9_adjustment_notes text;
  END IF;
END $$;
