/*
  # Add Regular Schedule Option to All Holidays
  
  1. Changes
    - Add "follow_regular_schedule" option to all holiday templates that don't already have it
    - This allows users to explicitly decline special holiday arrangements
    - When selected, the regular parenting schedule continues for that holiday
  
  2. Notes
    - Victoria Day, Canada Day, and Labour Day already have this option
    - All other holidays will be updated to include it
*/

-- Update Christmas Day
UPDATE holiday_schedule_templates
SET preset_options = jsonb_insert(
  preset_options,
  '{999}',
  '{"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}'
)
WHERE holiday_name = 'Christmas Day'
AND NOT preset_options::text LIKE '%follow_regular_schedule%';

-- Update Christmas Eve
UPDATE holiday_schedule_templates
SET preset_options = jsonb_insert(
  preset_options,
  '{999}',
  '{"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}'
)
WHERE holiday_name = 'Christmas Eve'
AND NOT preset_options::text LIKE '%follow_regular_schedule%';

-- Update New Year's Day
UPDATE holiday_schedule_templates
SET preset_options = jsonb_insert(
  preset_options,
  '{999}',
  '{"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}'
)
WHERE holiday_name = 'New Year''s Day'
AND NOT preset_options::text LIKE '%follow_regular_schedule%';

-- Update New Year's Eve
UPDATE holiday_schedule_templates
SET preset_options = jsonb_insert(
  preset_options,
  '{999}',
  '{"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}'
)
WHERE holiday_name = 'New Year''s Eve'
AND NOT preset_options::text LIKE '%follow_regular_schedule%';

-- Update Easter
UPDATE holiday_schedule_templates
SET preset_options = jsonb_insert(
  preset_options,
  '{999}',
  '{"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}'
)
WHERE holiday_name = 'Easter'
AND NOT preset_options::text LIKE '%follow_regular_schedule%';

-- Update Thanksgiving
UPDATE holiday_schedule_templates
SET preset_options = jsonb_insert(
  preset_options,
  '{999}',
  '{"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}'
)
WHERE holiday_name = 'Thanksgiving'
AND NOT preset_options::text LIKE '%follow_regular_schedule%';

-- Update Mother's Day
UPDATE holiday_schedule_templates
SET preset_options = jsonb_insert(
  preset_options,
  '{999}',
  '{"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}'
)
WHERE holiday_name = 'Mother''s Day'
AND NOT preset_options::text LIKE '%follow_regular_schedule%';

-- Update Father's Day
UPDATE holiday_schedule_templates
SET preset_options = jsonb_insert(
  preset_options,
  '{999}',
  '{"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}'
)
WHERE holiday_name = 'Father''s Day'
AND NOT preset_options::text LIKE '%follow_regular_schedule%';

-- Update Halloween
UPDATE holiday_schedule_templates
SET preset_options = jsonb_insert(
  preset_options,
  '{999}',
  '{"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}'
)
WHERE holiday_name = 'Halloween'
AND NOT preset_options::text LIKE '%follow_regular_schedule%';

-- Update Child's Birthday
UPDATE holiday_schedule_templates
SET preset_options = jsonb_insert(
  preset_options,
  '{999}',
  '{"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}'
)
WHERE holiday_name = 'Child''s Birthday'
AND NOT preset_options::text LIKE '%follow_regular_schedule%';
