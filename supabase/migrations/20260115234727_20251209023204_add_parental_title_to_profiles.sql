/*
  # Add Parental Title Field to Profiles

  1. Changes
    - Add `parental_title` column to `profiles` table
      - Allows users to choose how they want to be referred to in the agreement
      - Options: 'parent', 'mother', 'father'
      - Defaults to 'parent' for gender-neutral language
  
  2. Notes
    - This field is used throughout the agreement to personalize language
    - Can be updated at any time by the user
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'parental_title'
  ) THEN
    ALTER TABLE profiles ADD COLUMN parental_title text DEFAULT 'parent';
  END IF;
END $$;