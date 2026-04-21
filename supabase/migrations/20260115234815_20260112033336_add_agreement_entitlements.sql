/*
  # Add Agreement Entitlements System

  1. New Tables
    - `agreement_entitlements`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `agreement_type` (text: separation, cohabitation, prenuptial, postnuptial, amendment)
      - `granted_at` (timestamptz)
      - `order_id` (text, references stripe order)
      - `expires_at` (timestamptz, nullable for lifetime access)

  2. Changes
    - Add `agreement_type` column to `stripe_orders` table if not exists
    - Add `product_metadata` jsonb column to `stripe_orders` to store product details

  3. Security
    - Enable RLS on `agreement_entitlements` table
    - Users can view their own entitlements
    - Only system (service role) can insert/update entitlements
    - Add helper function to check if user has access to agreement type

  4. Notes
    - One-time purchases grant lifetime access (expires_at is NULL)
    - Each purchase creates one entitlement record
    - Users cannot create agreements they haven't purchased
*/

-- Add columns to stripe_orders if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_orders' AND column_name = 'agreement_type'
  ) THEN
    ALTER TABLE stripe_orders ADD COLUMN agreement_type text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'stripe_orders' AND column_name = 'product_metadata'
  ) THEN
    ALTER TABLE stripe_orders ADD COLUMN product_metadata jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Create agreement_entitlements table
CREATE TABLE IF NOT EXISTS agreement_entitlements (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  agreement_type text NOT NULL CHECK (agreement_type IN ('separation', 'cohabitation', 'prenuptial', 'postnuptial', 'amendment')),
  granted_at timestamptz NOT NULL DEFAULT now(),
  order_id text,
  expires_at timestamptz,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, agreement_type)
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_entitlements_user_type ON agreement_entitlements(user_id, agreement_type);
CREATE INDEX IF NOT EXISTS idx_entitlements_user ON agreement_entitlements(user_id);

-- Enable RLS
ALTER TABLE agreement_entitlements ENABLE ROW LEVEL SECURITY;

-- Users can view their own entitlements
CREATE POLICY "Users can view own entitlements"
  ON agreement_entitlements FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Only service role can insert entitlements (via webhook)
CREATE POLICY "Service role can insert entitlements"
  ON agreement_entitlements FOR INSERT
  TO service_role
  WITH CHECK (true);

-- Only service role can update entitlements
CREATE POLICY "Service role can update entitlements"
  ON agreement_entitlements FOR UPDATE
  TO service_role
  USING (true)
  WITH CHECK (true);

-- Create helper function to check if user has access to agreement type
CREATE OR REPLACE FUNCTION user_has_agreement_access(
  p_user_id uuid,
  p_agreement_type text
) RETURNS boolean AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1
    FROM agreement_entitlements
    WHERE user_id = p_user_id
    AND agreement_type = p_agreement_type
    AND (expires_at IS NULL OR expires_at > now())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Add policy to agreements table to enforce entitlements
CREATE POLICY "Users can only create agreements they have access to"
  ON agreements FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = party1_id 
    AND user_has_agreement_access(auth.uid(), COALESCE(agreement_type, 'separation'))
  );

-- Drop the old insert policy that didn't check entitlements
DROP POLICY IF EXISTS "Users can insert agreements as party1" ON agreements;