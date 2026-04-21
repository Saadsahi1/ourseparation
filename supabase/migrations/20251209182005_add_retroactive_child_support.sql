/*
  # Add Retroactive Child Support Tracking

  1. New Tables
    - `retroactive_support_periods`
      - `id` (uuid, primary key)
      - `agreement_id` (uuid, foreign key to agreements)
      - `calendar_year` (integer) - The calendar year for this period
      - `party1_income` (numeric) - Party 1's income for this year
      - `party2_income` (numeric) - Party 2's income for this year
      - `parenting_arrangement` ('section3' | 'section9') - Type of arrangement during this period
      - `child_support_payor` ('party1' | 'party2' | 'none') - Who should have been paying
      - `monthly_support_amount` (numeric) - Calculated monthly support that should have been paid
      - `months_in_period` (integer) - Number of months this arrangement was in place
      - `total_support_owed` (numeric) - Total support that should have been paid for this period
      - `notes` (text, nullable) - Additional notes about this period
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

    - `retroactive_expenses`
      - `id` (uuid, primary key)
      - `agreement_id` (uuid, foreign key to agreements)
      - `expense_date` (date) - Date the expense was incurred
      - `expense_category` (text) - Category of expense (e.g., medical, dental, extracurricular)
      - `expense_description` (text) - Description of the expense
      - `total_amount` (numeric) - Total amount of the expense
      - `paid_by` ('party1' | 'party2') - Who paid the expense
      - `seeking_contribution_from` ('party1' | 'party2') - Who should contribute
      - `contribution_percentage` (numeric) - Percentage of contribution sought (default 50%)
      - `contribution_amount` (numeric) - Calculated contribution amount
      - `has_receipt` (boolean) - Whether a receipt is available
      - `notes` (text, nullable)
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)

  2. Changes to Existing Tables
    - `agreements`
      - Add `retroactive_support_waived` (boolean, default false) - Whether parties agree no retroactive support is owed

  3. Security
    - Enable RLS on both new tables
    - Add policies for authenticated users to manage their own agreement data
*/

-- Add retroactive_support_waived column to agreements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'retroactive_support_waived'
  ) THEN
    ALTER TABLE agreements ADD COLUMN retroactive_support_waived boolean DEFAULT false;
  END IF;
END $$;

-- Create retroactive_support_periods table
CREATE TABLE IF NOT EXISTS retroactive_support_periods (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  calendar_year integer NOT NULL,
  party1_income numeric(12,2) NOT NULL DEFAULT 0,
  party2_income numeric(12,2) NOT NULL DEFAULT 0,
  parenting_arrangement text NOT NULL CHECK (parenting_arrangement IN ('section3', 'section9')),
  child_support_payor text NOT NULL CHECK (child_support_payor IN ('party1', 'party2', 'none')),
  monthly_support_amount numeric(10,2) NOT NULL DEFAULT 0,
  months_in_period integer NOT NULL DEFAULT 12 CHECK (months_in_period >= 1 AND months_in_period <= 12),
  total_support_owed numeric(12,2) NOT NULL DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  UNIQUE(agreement_id, calendar_year)
);

-- Create retroactive_expenses table
CREATE TABLE IF NOT EXISTS retroactive_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  expense_date date NOT NULL,
  expense_category text NOT NULL DEFAULT '',
  expense_description text NOT NULL DEFAULT '',
  total_amount numeric(10,2) NOT NULL DEFAULT 0,
  paid_by text NOT NULL CHECK (paid_by IN ('party1', 'party2')),
  seeking_contribution_from text NOT NULL CHECK (seeking_contribution_from IN ('party1', 'party2')),
  contribution_percentage numeric(5,2) NOT NULL DEFAULT 50.00 CHECK (contribution_percentage >= 0 AND contribution_percentage <= 100),
  contribution_amount numeric(10,2) NOT NULL DEFAULT 0,
  has_receipt boolean DEFAULT false,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE retroactive_support_periods ENABLE ROW LEVEL SECURITY;
ALTER TABLE retroactive_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies for retroactive_support_periods
CREATE POLICY "Users can view retroactive periods for their agreements"
  ON retroactive_support_periods FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = retroactive_support_periods.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert retroactive periods for their agreements"
  ON retroactive_support_periods FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = retroactive_support_periods.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update retroactive periods for their agreements"
  ON retroactive_support_periods FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = retroactive_support_periods.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = retroactive_support_periods.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete retroactive periods for their agreements"
  ON retroactive_support_periods FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = retroactive_support_periods.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

-- RLS Policies for retroactive_expenses
CREATE POLICY "Users can view retroactive expenses for their agreements"
  ON retroactive_expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = retroactive_expenses.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert retroactive expenses for their agreements"
  ON retroactive_expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = retroactive_expenses.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update retroactive expenses for their agreements"
  ON retroactive_expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = retroactive_expenses.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = retroactive_expenses.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete retroactive expenses for their agreements"
  ON retroactive_expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = retroactive_expenses.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_retroactive_periods_agreement_id ON retroactive_support_periods(agreement_id);
CREATE INDEX IF NOT EXISTS idx_retroactive_periods_year ON retroactive_support_periods(calendar_year);
CREATE INDEX IF NOT EXISTS idx_retroactive_expenses_agreement_id ON retroactive_expenses(agreement_id);
CREATE INDEX IF NOT EXISTS idx_retroactive_expenses_date ON retroactive_expenses(expense_date);