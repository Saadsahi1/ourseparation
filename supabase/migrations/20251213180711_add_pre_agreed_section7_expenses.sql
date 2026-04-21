/*
  # Add Pre-Agreed Section 7 Expenses

  ## Purpose
  This migration adds a table to track section 7 expenses that both parties have pre-agreed to contribute towards without requiring ongoing consent for each occurrence.

  ## New Tables
  
  ### pre_agreed_section7_expenses
  - `id` (uuid, primary key) - Unique identifier
  - `agreement_id` (uuid, foreign key) - Links to agreements table
  - `expense_category` (text) - Category like 'childcare', 'medical', 'extracurricular'
  - `description` (text) - Description of the pre-agreed expense
  - `created_at` (timestamptz) - When the expense was added
  
  ## Security
  - Enable RLS on pre_agreed_section7_expenses table
  - Users can access pre-agreed expenses for their agreements only
  - Policies ensure both parties in an agreement can view, insert, update, and delete
  
  ## Notes
  This table stores expenses that parties agree to contribute to automatically based on their income split, without requiring mutual consent each time the expense is incurred.
*/

-- Create pre_agreed_section7_expenses table
CREATE TABLE IF NOT EXISTS pre_agreed_section7_expenses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid REFERENCES agreements(id) ON DELETE CASCADE NOT NULL,
  expense_category text NOT NULL,
  description text NOT NULL,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_expense_category CHECK (expense_category IN ('childcare', 'medical', 'dental', 'orthodontic', 'extracurricular', 'post_secondary', 'other'))
);

-- Enable Row Level Security
ALTER TABLE pre_agreed_section7_expenses ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view pre-agreed expenses in their agreements"
  ON pre_agreed_section7_expenses FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = pre_agreed_section7_expenses.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert pre-agreed expenses in their agreements"
  ON pre_agreed_section7_expenses FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = pre_agreed_section7_expenses.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update pre-agreed expenses in their agreements"
  ON pre_agreed_section7_expenses FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = pre_agreed_section7_expenses.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = pre_agreed_section7_expenses.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete pre-agreed expenses in their agreements"
  ON pre_agreed_section7_expenses FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = pre_agreed_section7_expenses.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_pre_agreed_section7_expenses_agreement ON pre_agreed_section7_expenses(agreement_id);
