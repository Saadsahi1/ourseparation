/*
  # Add Date of Birth and Occupation to Profiles

  1. Changes
    - Add `date_of_birth` column to profiles table
    - Add `occupation` column to profiles table
    - Add `previous_year_income` column to profiles table for tax return income

  2. Notes
    - These fields are used in the agreement background section
    - Age is calculated from date_of_birth
    - Income from previous year's tax return is stored in previous_year_income
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'date_of_birth'
  ) THEN
    ALTER TABLE profiles ADD COLUMN date_of_birth date;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'occupation'
  ) THEN
    ALTER TABLE profiles ADD COLUMN occupation text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'profiles' AND column_name = 'previous_year_income'
  ) THEN
    ALTER TABLE profiles ADD COLUMN previous_year_income numeric DEFAULT 0;
  END IF;
END $$;