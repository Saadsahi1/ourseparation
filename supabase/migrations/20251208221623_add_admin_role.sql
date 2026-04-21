/*
  # Add Admin Role System

  1. Changes
    - Add `is_admin` column to `profiles` table
      - `is_admin` (boolean, default false) - Indicates if user has admin privileges
  
  2. Security
    - Admin users can bypass subscription requirements
    - Only admins can modify the is_admin field (enforced at application level)
  
  3. Notes
    - Admins have full access without requiring active subscriptions
    - The is_admin field should only be set manually via direct database access
*/

-- Add is_admin column to profiles
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'is_admin'
  ) THEN
    ALTER TABLE profiles ADD COLUMN is_admin boolean DEFAULT false;
  END IF;
END $$;

-- Create an index for quick admin lookups
CREATE INDEX IF NOT EXISTS idx_profiles_is_admin ON profiles(is_admin) WHERE is_admin = true;