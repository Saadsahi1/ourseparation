/*
  # Add Previous Relationship Children Tracking

  ## Overview
  This migration adds support for tracking children from previous relationships
  and documenting loco parentis status for child support obligations.

  ## New Tables
  
  ### previous_relationship_children
  - `id` (uuid, primary key)
  - `agreement_id` (uuid, references agreements)
  - `party` (text: party1, party2) - which party has the child from a previous relationship
  - `full_name` (text) - child's full name
  - `birth_date` (date) - child's date of birth
  - `lived_with_parties` (boolean) - whether child lived with the parties during the relationship
  - `stood_in_loco_parentis` (boolean) - whether the other party stood in loco parentis
  - `has_support_obligation` (boolean) - whether there is a child support obligation
  - `created_at` (timestamptz)

  ## Security
  - Enable RLS on previous_relationship_children table
  - Users can access records for their agreements
*/

-- Create previous_relationship_children table
CREATE TABLE IF NOT EXISTS previous_relationship_children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid REFERENCES agreements(id) ON DELETE CASCADE,
  party text NOT NULL,
  full_name text NOT NULL,
  birth_date date NOT NULL,
  lived_with_parties boolean DEFAULT false,
  stood_in_loco_parentis boolean DEFAULT false,
  has_support_obligation boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_party CHECK (party IN ('party1', 'party2'))
);

-- Enable Row Level Security
ALTER TABLE previous_relationship_children ENABLE ROW LEVEL SECURITY;

-- RLS Policies for previous_relationship_children
CREATE POLICY "Users can view previous children in their agreements"
  ON previous_relationship_children FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = previous_relationship_children.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert previous children in their agreements"
  ON previous_relationship_children FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = previous_relationship_children.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update previous children in their agreements"
  ON previous_relationship_children FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = previous_relationship_children.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = previous_relationship_children.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete previous children in their agreements"
  ON previous_relationship_children FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = previous_relationship_children.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_previous_children_agreement ON previous_relationship_children(agreement_id);