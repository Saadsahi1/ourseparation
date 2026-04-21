/*
  # Separation Agreement Application Schema

  ## Overview
  This migration creates the complete database schema for "Our Separation", an Ontario-based
  separation agreement generation application.

  ## New Tables

  ### 1. profiles
  - `id` (uuid, references auth.users)
  - `email` (text)
  - `full_name` (text)
  - `phone` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 2. agreements
  Main separation agreement entity
  - `id` (uuid, primary key)
  - `party1_id` (uuid, references profiles)
  - `party2_id` (uuid, references profiles)
  - `marriage_date` (date)
  - `separation_date` (date)
  - `marriage_location` (text)
  - `status` (text: draft, completed, signed)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 3. children
  Information about children for support calculations
  - `id` (uuid, primary key)
  - `agreement_id` (uuid, references agreements)
  - `full_name` (text)
  - `birth_date` (date)
  - `primary_residence` (text: party1, party2, shared)
  - `created_at` (timestamptz)

  ### 4. property_items
  Assets and debts for Net Family Property calculation
  - `id` (uuid, primary key)
  - `agreement_id` (uuid, references agreements)
  - `owner` (text: party1, party2, joint)
  - `item_type` (text: asset, debt)
  - `category` (text: real_estate, vehicle, bank_account, investment, pension, business, personal_property, other)
  - `description` (text)
  - `value_at_marriage` (numeric)
  - `value_at_separation` (numeric)
  - `is_matrimonial_home` (boolean)
  - `created_at` (timestamptz)

  ### 5. income_documents
  References to uploaded tax documents
  - `id` (uuid, primary key)
  - `agreement_id` (uuid, references agreements)
  - `party` (text: party1, party2)
  - `document_type` (text: tax_return, notice_of_assessment, pay_stub, other)
  - `tax_year` (integer)
  - `file_path` (text)
  - `file_name` (text)
  - `uploaded_at` (timestamptz)

  ### 6. support_calculations
  Child and spousal support amounts
  - `id` (uuid, primary key)
  - `agreement_id` (uuid, references agreements)
  - `party1_income` (numeric)
  - `party2_income` (numeric)
  - `child_support_payor` (text: party1, party2, none)
  - `child_support_amount` (numeric)
  - `spousal_support_payor` (text: party1, party2, none)
  - `spousal_support_amount` (numeric)
  - `spousal_support_duration` (text)
  - `calculation_notes` (text)
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Enable RLS on all tables
  - Profiles: Users can view and update their own profile
  - Agreements: Users can access agreements where they are party1 or party2
  - Children: Users can access children records for their agreements
  - Property Items: Users can access property items for their agreements
  - Income Documents: Users can access documents for their agreements
  - Support Calculations: Users can access calculations for their agreements
*/

-- Create profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id uuid PRIMARY KEY REFERENCES auth.users ON DELETE CASCADE,
  email text NOT NULL,
  full_name text NOT NULL,
  phone text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Create agreements table
CREATE TABLE IF NOT EXISTS agreements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  party1_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  party2_id uuid REFERENCES profiles(id) ON DELETE CASCADE,
  marriage_date date,
  separation_date date,
  marriage_location text,
  status text DEFAULT 'draft',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_status CHECK (status IN ('draft', 'completed', 'signed'))
);

-- Create children table
CREATE TABLE IF NOT EXISTS children (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid REFERENCES agreements(id) ON DELETE CASCADE,
  full_name text NOT NULL,
  birth_date date NOT NULL,
  primary_residence text DEFAULT 'shared',
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_residence CHECK (primary_residence IN ('party1', 'party2', 'shared'))
);

-- Create property_items table
CREATE TABLE IF NOT EXISTS property_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid REFERENCES agreements(id) ON DELETE CASCADE,
  owner text NOT NULL,
  item_type text NOT NULL,
  category text NOT NULL,
  description text NOT NULL,
  value_at_marriage numeric(15,2) DEFAULT 0,
  value_at_separation numeric(15,2) DEFAULT 0,
  is_matrimonial_home boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT valid_owner CHECK (owner IN ('party1', 'party2', 'joint')),
  CONSTRAINT valid_item_type CHECK (item_type IN ('asset', 'debt')),
  CONSTRAINT valid_category CHECK (category IN ('real_estate', 'vehicle', 'bank_account', 'investment', 'pension', 'business', 'personal_property', 'other'))
);

-- Create income_documents table
CREATE TABLE IF NOT EXISTS income_documents (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid REFERENCES agreements(id) ON DELETE CASCADE,
  party text NOT NULL,
  document_type text NOT NULL,
  tax_year integer,
  file_path text NOT NULL,
  file_name text NOT NULL,
  uploaded_at timestamptz DEFAULT now(),
  CONSTRAINT valid_party CHECK (party IN ('party1', 'party2')),
  CONSTRAINT valid_document_type CHECK (document_type IN ('tax_return', 'notice_of_assessment', 'pay_stub', 'other'))
);

-- Create support_calculations table
CREATE TABLE IF NOT EXISTS support_calculations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid REFERENCES agreements(id) ON DELETE CASCADE,
  party1_income numeric(15,2) DEFAULT 0,
  party2_income numeric(15,2) DEFAULT 0,
  child_support_payor text DEFAULT 'none',
  child_support_amount numeric(15,2) DEFAULT 0,
  spousal_support_payor text DEFAULT 'none',
  spousal_support_amount numeric(15,2) DEFAULT 0,
  spousal_support_duration text,
  calculation_notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT valid_child_support_payor CHECK (child_support_payor IN ('party1', 'party2', 'none')),
  CONSTRAINT valid_spousal_support_payor CHECK (spousal_support_payor IN ('party1', 'party2', 'none'))
);

-- Enable Row Level Security
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreements ENABLE ROW LEVEL SECURITY;
ALTER TABLE children ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE income_documents ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_calculations ENABLE ROW LEVEL SECURITY;

-- Profiles policies
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = id);

-- Agreements policies
CREATE POLICY "Users can view their agreements"
  ON agreements FOR SELECT
  TO authenticated
  USING (auth.uid() = party1_id OR auth.uid() = party2_id);

CREATE POLICY "Users can insert agreements as party1"
  ON agreements FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = party1_id);

CREATE POLICY "Users can update their agreements"
  ON agreements FOR UPDATE
  TO authenticated
  USING (auth.uid() = party1_id OR auth.uid() = party2_id)
  WITH CHECK (auth.uid() = party1_id OR auth.uid() = party2_id);

CREATE POLICY "Users can delete their agreements"
  ON agreements FOR DELETE
  TO authenticated
  USING (auth.uid() = party1_id);

-- Children policies
CREATE POLICY "Users can view children in their agreements"
  ON children FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = children.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert children in their agreements"
  ON children FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = children.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update children in their agreements"
  ON children FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = children.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = children.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete children in their agreements"
  ON children FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = children.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

-- Property items policies
CREATE POLICY "Users can view property items in their agreements"
  ON property_items FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = property_items.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert property items in their agreements"
  ON property_items FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = property_items.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update property items in their agreements"
  ON property_items FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = property_items.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = property_items.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete property items in their agreements"
  ON property_items FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = property_items.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

-- Income documents policies
CREATE POLICY "Users can view documents in their agreements"
  ON income_documents FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = income_documents.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert documents in their agreements"
  ON income_documents FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = income_documents.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete documents in their agreements"
  ON income_documents FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = income_documents.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

-- Support calculations policies
CREATE POLICY "Users can view calculations in their agreements"
  ON support_calculations FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = support_calculations.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert calculations in their agreements"
  ON support_calculations FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = support_calculations.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update calculations in their agreements"
  ON support_calculations FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = support_calculations.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = support_calculations.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete calculations in their agreements"
  ON support_calculations FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = support_calculations.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_agreements_party1 ON agreements(party1_id);
CREATE INDEX IF NOT EXISTS idx_agreements_party2 ON agreements(party2_id);
CREATE INDEX IF NOT EXISTS idx_children_agreement ON children(agreement_id);
CREATE INDEX IF NOT EXISTS idx_property_items_agreement ON property_items(agreement_id);
CREATE INDEX IF NOT EXISTS idx_income_documents_agreement ON income_documents(agreement_id);
CREATE INDEX IF NOT EXISTS idx_support_calculations_agreement ON support_calculations(agreement_id);
