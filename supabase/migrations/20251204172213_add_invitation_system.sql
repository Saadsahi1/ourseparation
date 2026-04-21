/*
  # Add Invitation System for Spouses

  ## Overview
  This migration adds an invitation system that allows one spouse to invite another
  spouse to collaborate on a separation agreement.

  ## New Tables
  
  ### invitations
  - `id` (uuid, primary key) - Unique identifier for the invitation
  - `agreement_id` (uuid, references agreements) - The agreement being shared
  - `inviter_id` (uuid, references profiles) - User who sent the invitation
  - `invitee_email` (text) - Email of the person being invited
  - `status` (text) - Status: pending, accepted, declined, expired
  - `invitation_code` (text, unique) - Unique code for accepting invitation
  - `created_at` (timestamptz) - When invitation was created
  - `accepted_at` (timestamptz) - When invitation was accepted
  - `expires_at` (timestamptz) - When invitation expires

  ## Changes to Existing Tables
  
  ### agreements
  - Add `invitation_status` column to track if waiting for party2
  
  ## Security
  - Enable RLS on invitations table
  - Users can view invitations they sent
  - Users can view invitations sent to their email
  - Users can update invitations sent to their email (to accept/decline)
  - Authenticated users can insert invitations for their agreements
*/

-- Create invitations table
CREATE TABLE IF NOT EXISTS invitations (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid REFERENCES agreements(id) ON DELETE CASCADE NOT NULL,
  inviter_id uuid REFERENCES profiles(id) ON DELETE CASCADE NOT NULL,
  invitee_email text NOT NULL,
  status text DEFAULT 'pending' NOT NULL,
  invitation_code text UNIQUE NOT NULL,
  created_at timestamptz DEFAULT now(),
  accepted_at timestamptz,
  expires_at timestamptz DEFAULT (now() + interval '7 days'),
  CONSTRAINT valid_invitation_status CHECK (status IN ('pending', 'accepted', 'declined', 'expired'))
);

-- Add invitation_status to agreements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'invitation_status'
  ) THEN
    ALTER TABLE agreements ADD COLUMN invitation_status text DEFAULT 'none';
    ALTER TABLE agreements ADD CONSTRAINT valid_invitation_status 
      CHECK (invitation_status IN ('none', 'pending', 'accepted'));
  END IF;
END $$;

-- Enable Row Level Security
ALTER TABLE invitations ENABLE ROW LEVEL SECURITY;

-- Invitations policies
CREATE POLICY "Users can view invitations they sent"
  ON invitations FOR SELECT
  TO authenticated
  USING (auth.uid() = inviter_id);

CREATE POLICY "Users can view invitations sent to their email"
  ON invitations FOR SELECT
  TO authenticated
  USING (
    invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

CREATE POLICY "Users can insert invitations for their agreements"
  ON invitations FOR INSERT
  TO authenticated
  WITH CHECK (
    auth.uid() = inviter_id
    AND EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = invitations.agreement_id
      AND agreements.party1_id = auth.uid()
    )
  );

CREATE POLICY "Users can update invitations sent to their email"
  ON invitations FOR UPDATE
  TO authenticated
  USING (
    invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  )
  WITH CHECK (
    invitee_email = (SELECT email FROM profiles WHERE id = auth.uid())
  );

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_invitations_agreement ON invitations(agreement_id);
CREATE INDEX IF NOT EXISTS idx_invitations_invitee_email ON invitations(invitee_email);
CREATE INDEX IF NOT EXISTS idx_invitations_code ON invitations(invitation_code);

-- Function to generate invitation code
CREATE OR REPLACE FUNCTION generate_invitation_code()
RETURNS text AS $$
DECLARE
  code text;
BEGIN
  code := substr(md5(random()::text || clock_timestamp()::text), 1, 16);
  RETURN upper(code);
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate invitation code
CREATE OR REPLACE FUNCTION set_invitation_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.invitation_code IS NULL OR NEW.invitation_code = '' THEN
    NEW.invitation_code := generate_invitation_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_invitation_code
  BEFORE INSERT ON invitations
  FOR EACH ROW
  EXECUTE FUNCTION set_invitation_code();
