/*
  # Add Parenting Sub-Section Completion Tracking

  1. Changes
    - Add completion tracking for each parenting sub-tab
    - Allows users to track progress through the 4 parenting sections
    - Each sub-section can be marked as complete independently
  
  2. New Columns
    - `section_parenting_decision_complete` (boolean) - Decision-Making Responsibility sub-tab
    - `section_parenting_schedule_complete` (boolean) - Regular Parenting Schedule sub-tab
    - `section_parenting_holiday_complete` (boolean) - Holiday Parenting Schedule sub-tab
    - `section_parenting_special_complete` (boolean) - Special Clauses sub-tab
*/

-- Add sub-section completion tracking columns for parenting tabs
ALTER TABLE agreements 
ADD COLUMN IF NOT EXISTS section_parenting_decision_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_parenting_schedule_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_parenting_holiday_complete boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS section_parenting_special_complete boolean DEFAULT false;