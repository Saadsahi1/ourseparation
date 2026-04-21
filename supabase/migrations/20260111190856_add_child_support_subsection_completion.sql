/*
  # Add Child Support Subsection Completion Tracking

  ## Overview
  Adds completion tracking for three subsections within the Child Support section:
  1. Monthly Child Support - tracks completion of base child support calculation
  2. Special Expenses (Section 7) - tracks completion of special expenses
  3. Retroactive Child Support - tracks completion of retroactive support calculations

  ## Changes
  1. New Columns
    - `section_child_support_monthly_complete` (boolean) - Monthly child support calculation complete
    - `section_child_support_section7_complete` (boolean) - Special expenses (section 7) complete
    - `section_child_support_retroactive_complete` (boolean) - Retroactive child support complete

  ## Notes
  - All new columns default to false
  - These subsections must all be complete for the main Child Support section to be considered complete
  - Uses IF NOT EXISTS for safe migration
*/

-- Add child support subsection completion fields
ALTER TABLE agreements
ADD COLUMN IF NOT EXISTS section_child_support_monthly_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_child_support_section7_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_child_support_retroactive_complete boolean DEFAULT false;