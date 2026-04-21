/*
  # Add Digital Signatures Support
  
  1. Changes to Agreements Table
    - Add `party1_signature` (text) - Base64 encoded signature image
    - Add `party1_signature_ip` (text) - IP address when party1 signed
    - Add `party2_signature` (text) - Base64 encoded signature image
    - Add `party2_signature_ip` (text) - IP address when party2 signed
    - Add `signature_status` (text) - Status of signature process
    - Add `party1_notified_at` (timestamptz) - When party1 was notified to sign
    - Add `party2_notified_at` (timestamptz) - When party2 was notified to sign
  
  2. New Table: Signature Audit Log
    - Track all signature-related actions for legal compliance
    - Records who did what and when
  
  3. Notes
    - Signature status values: 'draft', 'awaiting_party1', 'awaiting_party2', 'awaiting_both', 'completed'
    - Signatures are stored as base64 PNG images
    - IP addresses are recorded for legal verification
*/

-- Add signature fields to agreements table
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'party1_signature'
  ) THEN
    ALTER TABLE agreements ADD COLUMN party1_signature text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'party1_signature_ip'
  ) THEN
    ALTER TABLE agreements ADD COLUMN party1_signature_ip text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'party2_signature'
  ) THEN
    ALTER TABLE agreements ADD COLUMN party2_signature text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'party2_signature_ip'
  ) THEN
    ALTER TABLE agreements ADD COLUMN party2_signature_ip text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'signature_status'
  ) THEN
    ALTER TABLE agreements ADD COLUMN signature_status text DEFAULT 'draft';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'party1_notified_at'
  ) THEN
    ALTER TABLE agreements ADD COLUMN party1_notified_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreements' AND column_name = 'party2_notified_at'
  ) THEN
    ALTER TABLE agreements ADD COLUMN party2_notified_at timestamptz;
  END IF;
END $$;

-- Create signature audit log table
CREATE TABLE IF NOT EXISTS signature_audit_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  user_id uuid NOT NULL REFERENCES profiles(id),
  action text NOT NULL,
  ip_address text,
  user_agent text,
  metadata jsonb DEFAULT '{}',
  created_at timestamptz DEFAULT now()
);

-- Enable RLS on signature audit log
ALTER TABLE signature_audit_log ENABLE ROW LEVEL SECURITY;

-- Policies for signature_audit_log
CREATE POLICY "Users can read audit logs for their agreements"
  ON signature_audit_log
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = signature_audit_log.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert audit logs for their agreements"
  ON signature_audit_log
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = signature_audit_log.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
    AND user_id = auth.uid()
  );

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_signature_audit_log_agreement_id 
  ON signature_audit_log(agreement_id);

CREATE INDEX IF NOT EXISTS idx_agreements_signature_status 
  ON agreements(signature_status);
