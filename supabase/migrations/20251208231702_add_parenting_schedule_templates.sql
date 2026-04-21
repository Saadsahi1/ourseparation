/*
  # Add Template Support for Parenting Schedules

  ## Changes
  1. Add template fields to parenting_schedules table
     - regular_schedule_template (text): Selected template for regular schedule
     - regular_schedule_variables (jsonb): Variables for the template
     - holiday_schedule_template (text): Selected template for holidays
     - holiday_schedule_variables (jsonb): Variables for holidays
     - summer_schedule_template (text): Selected template for summer
     - summer_schedule_variables (jsonb): Variables for summer
     - transportation_template (text): Selected template for transportation
     - transportation_variables (jsonb): Variables for transportation
  
  2. Add template fields to parenting_terms table
     - communication_template (text): Selected template for communication
     - communication_variables (jsonb): Variables for communication
  
  ## Template System
  - Users select from predefined schedule templates
  - Templates have placeholders filled with specific times, dates, locations
  - No free-text drafting allowed
  
  ## Security
  - Existing RLS policies apply
*/

DO $$
BEGIN
  -- Add parenting_schedules template fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_schedules' AND column_name = 'regular_schedule_template'
  ) THEN
    ALTER TABLE parenting_schedules ADD COLUMN regular_schedule_template text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_schedules' AND column_name = 'regular_schedule_variables'
  ) THEN
    ALTER TABLE parenting_schedules ADD COLUMN regular_schedule_variables jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_schedules' AND column_name = 'holiday_schedule_template'
  ) THEN
    ALTER TABLE parenting_schedules ADD COLUMN holiday_schedule_template text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_schedules' AND column_name = 'holiday_schedule_variables'
  ) THEN
    ALTER TABLE parenting_schedules ADD COLUMN holiday_schedule_variables jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_schedules' AND column_name = 'summer_schedule_template'
  ) THEN
    ALTER TABLE parenting_schedules ADD COLUMN summer_schedule_template text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_schedules' AND column_name = 'summer_schedule_variables'
  ) THEN
    ALTER TABLE parenting_schedules ADD COLUMN summer_schedule_variables jsonb DEFAULT '{}'::jsonb;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_schedules' AND column_name = 'transportation_template'
  ) THEN
    ALTER TABLE parenting_schedules ADD COLUMN transportation_template text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_schedules' AND column_name = 'transportation_variables'
  ) THEN
    ALTER TABLE parenting_schedules ADD COLUMN transportation_variables jsonb DEFAULT '{}'::jsonb;
  END IF;

  -- Add parenting_terms template fields
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_terms' AND column_name = 'communication_template'
  ) THEN
    ALTER TABLE parenting_terms ADD COLUMN communication_template text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'parenting_terms' AND column_name = 'communication_variables'
  ) THEN
    ALTER TABLE parenting_terms ADD COLUMN communication_variables jsonb DEFAULT '{}'::jsonb;
  END IF;
END $$;