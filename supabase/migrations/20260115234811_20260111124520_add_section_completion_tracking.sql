/*
  # Add Section Completion Tracking

  1. Changes
    - Add completion tracking columns to agreements table for each section
    - Each section can be marked as complete independently
    - Tracks which sections users have finished filling out
  
  2. New Columns
    - `section_info_complete` (boolean) - Family Information section
    - `section_parenting_complete` (boolean) - Parenting section
    - `section_property_complete` (boolean) - Property (NFP) section
    - `section_property_details_complete` (boolean) - Property Details section
    - `section_income_complete` (boolean) - Income Docs section
    - `section_child_support_complete` (boolean) - Child Support section
    - `section_spousal_support_complete` (boolean) - Spousal Support section
    - `section_additional_complete` (boolean) - Additional Terms section
    - `section_clauses_complete` (boolean) - Special Clauses section
*/

-- Add completion tracking columns
ALTER TABLE agreements 
ADD COLUMN IF NOT EXISTS section_info_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_parenting_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_property_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_property_details_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_income_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_child_support_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_spousal_support_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_additional_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_clauses_complete boolean DEFAULT false;