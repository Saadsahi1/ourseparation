/*
  # Add Per-Child Parenting Schedules and Support

  ## Overview
  This migration enables different parenting schedules and child support calculations for each child
  when parents indicate that children have different arrangements.

  ## Changes
  
  1. Parenting Terms
    - Add `different_schedules_per_child` boolean field to track if children have different parenting arrangements
    
  2. Parenting Schedules
    - Add `child_id` field (nullable) to allow per-child schedules
    - When NULL, schedule applies to all children (default behavior)
    - When set, schedule applies only to that specific child
    
  3. Support Calculations
    - Add `per_child_support` JSONB field to store individual child support amounts
    - Format: { child_id: { payor: 'party1'|'party2'|'none', amount: number, parenting_time_party1: number } }
    - This allows tracking different support amounts when children have different parenting time
    
  ## Security
    - All RLS policies remain in place for new fields
    
  ## Notes
    - Existing records remain unchanged
    - Different schedules are only used when explicitly enabled
    - Default behavior (one schedule for all children) is preserved
*/

-- Add field to track if children have different parenting schedules
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_terms' AND column_name = 'different_schedules_per_child'
  ) THEN
    ALTER TABLE parenting_terms ADD COLUMN different_schedules_per_child boolean DEFAULT false;
  END IF;
END $$;

-- Add child_id to parenting_schedules to allow per-child schedules
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_schedules' AND column_name = 'child_id'
  ) THEN
    ALTER TABLE parenting_schedules ADD COLUMN child_id uuid REFERENCES children(id) ON DELETE CASCADE;
    CREATE INDEX IF NOT EXISTS idx_parenting_schedules_child_id ON parenting_schedules(child_id);
  END IF;
END $$;

-- Add per-child support calculations field
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'support_calculations' AND column_name = 'per_child_support'
  ) THEN
    ALTER TABLE support_calculations ADD COLUMN per_child_support jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;

-- Add comment for clarity
COMMENT ON COLUMN parenting_schedules.child_id IS 'When NULL, schedule applies to all children. When set, schedule is specific to that child.';
COMMENT ON COLUMN parenting_terms.different_schedules_per_child IS 'When true, each child has their own parenting schedule. When false, all children share one schedule.';
COMMENT ON COLUMN support_calculations.per_child_support IS 'Stores per-child support calculations when children have different parenting arrangements. Format: { child_id: { payor, amount, parenting_time_party1 } }';