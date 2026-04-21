/*
  # Add Custom Pick-up and Drop-off Times to Holiday Schedules

  ## Overview
  Adds fields to allow users to specify custom pick-up and drop-off times
  for each holiday schedule, providing flexibility beyond preset templates.

  ## Changes Made
  1. New Columns Added to `agreement_holiday_schedules` table:
     - `custom_pickup_time` (text) - Custom pick-up time description (e.g., "5:00 PM on December 24")
     - `custom_dropoff_time` (text) - Custom drop-off time description (e.g., "9:00 AM on December 25")
  
  ## Notes
  - These fields are optional
  - When provided, they can be used to override or supplement the default times in the template text
  - Users can still use preset templates without customization
*/

DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreement_holiday_schedules' AND column_name = 'custom_pickup_time'
  ) THEN
    ALTER TABLE agreement_holiday_schedules ADD COLUMN custom_pickup_time text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'agreement_holiday_schedules' AND column_name = 'custom_dropoff_time'
  ) THEN
    ALTER TABLE agreement_holiday_schedules ADD COLUMN custom_dropoff_time text;
  END IF;
END $$;