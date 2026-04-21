/*
  # Update Holiday Schedule Templates with Proper Legal Wording
  
  1. Changes
    - Clear existing holiday templates
    - Add new templates with proper legal wording format
    - Include specific timing details (from after school on Friday, etc.)
    - Add missing holidays: Family Day Weekend, Spring Break, March Break
    - Use format: "The children will stay with [Parent] on [Holiday] in odd/even-numbered years..."
  
  2. New Structure
    - Each preset option now contains full legal text
    - Includes specific start and end times
    - Uses proper alternating year language
    - Replaces generic labels with complete clauses
*/

-- Clear existing templates to replace with proper wording
DELETE FROM holiday_schedule_templates;

-- Insert updated holiday templates with proper legal wording
INSERT INTO holiday_schedule_templates (holiday_name, category, preset_options, display_order) VALUES
  (
    'Family Day Weekend',
    'statutory',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother on Family Day Weekend in odd-numbered years and with Father in even-numbered years, from after school on Friday until the start of school on Tuesday."},
      {"value": "father_odd_years", "label": "The children will stay with Father on Family Day Weekend in odd-numbered years and with Mother in even-numbered years, from after school on Friday until the start of school on Tuesday."},
      {"value": "mother_all_years", "label": "The children will stay with Mother on Family Day Weekend every year, from after school on Friday until the start of school on Tuesday."},
      {"value": "father_all_years", "label": "The children will stay with Father on Family Day Weekend every year, from after school on Friday until the start of school on Tuesday."}
    ]',
    1
  ),
  (
    'Spring Break',
    'statutory',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother during Spring Break in odd-numbered years and with Father in even-numbered years, from after school as the break starts until the start of school following the break."},
      {"value": "father_odd_years", "label": "The children will stay with Father during Spring Break in odd-numbered years and with Mother in even-numbered years, from after school as the break starts until the start of school following the break."},
      {"value": "mother_all_years", "label": "The children will stay with Mother during Spring Break every year, from after school as the break starts until the start of school following the break."},
      {"value": "father_all_years", "label": "The children will stay with Father during Spring Break every year, from after school as the break starts until the start of school following the break."},
      {"value": "split_week", "label": "The children will stay with Mother for the first half of Spring Break and with Father for the second half, alternating who gets the first half each year."}
    ]',
    2
  ),
  (
    'Easter Weekend',
    'religious',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother on Easter Weekend in odd-numbered years and with Father in even-numbered years, from after school on the Thursday before the Easter weekend until the start of school the following Tuesday."},
      {"value": "father_odd_years", "label": "The children will stay with Father on Easter Weekend in odd-numbered years and with Mother in even-numbered years, from after school on the Thursday before the Easter weekend until the start of school the following Tuesday."},
      {"value": "mother_all_years", "label": "The children will stay with Mother on Easter Weekend every year, from after school on the Thursday before the Easter weekend until the start of school the following Tuesday."},
      {"value": "father_all_years", "label": "The children will stay with Father on Easter Weekend every year, from after school on the Thursday before the Easter weekend until the start of school the following Tuesday."}
    ]',
    3
  ),
  (
    'Christmas Holiday',
    'statutory',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother during the Christmas holiday in odd-numbered years and with Father in even-numbered years, from after school on the last day before the break until 12:00 PM on December 26."},
      {"value": "father_odd_years", "label": "The children will stay with Father during the Christmas holiday in odd-numbered years and with Mother in even-numbered years, from after school on the last day before the break until 12:00 PM on December 26."},
      {"value": "split_holiday", "label": "The children will stay with Mother from after school on the last day before the break until 12:00 PM on December 26, then with Father from 12:00 PM on December 26 until the start of school, alternating each year."},
      {"value": "mother_all_years", "label": "The children will stay with Mother during the Christmas holiday every year, from after school on the last day before the break until 12:00 PM on December 26."},
      {"value": "father_all_years", "label": "The children will stay with Father during the Christmas holiday every year, from after school on the last day before the break until 12:00 PM on December 26."}
    ]',
    4
  ),
  (
    'Boxing Day and Remainder of Winter Break',
    'statutory',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother from 12:00 PM on December 26 until the start of school in odd-numbered years and with Father in even-numbered years."},
      {"value": "father_odd_years", "label": "The children will stay with Father from 12:00 PM on December 26 until the start of school in odd-numbered years and with Mother in even-numbered years."},
      {"value": "mother_all_years", "label": "The children will stay with Mother from 12:00 PM on December 26 until the start of school every year."},
      {"value": "father_all_years", "label": "The children will stay with Father from 12:00 PM on December 26 until the start of school every year."}
    ]',
    5
  ),
  (
    'New Year''s Eve and New Year''s Day',
    'statutory',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother on New Year''s Eve and New Year''s Day in odd-numbered years and with Father in even-numbered years, from 12:00 PM on December 31 until 6:00 PM on January 1."},
      {"value": "father_odd_years", "label": "The children will stay with Father on New Year''s Eve and New Year''s Day in odd-numbered years and with Mother in even-numbered years, from 12:00 PM on December 31 until 6:00 PM on January 1."},
      {"value": "mother_all_years", "label": "The children will stay with Mother on New Year''s Eve and New Year''s Day every year, from 12:00 PM on December 31 until 6:00 PM on January 1."},
      {"value": "father_all_years", "label": "The children will stay with Father on New Year''s Eve and New Year''s Day every year, from 12:00 PM on December 31 until 6:00 PM on January 1."}
    ]',
    6
  ),
  (
    'Victoria Day Weekend',
    'statutory',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother on Victoria Day Weekend in odd-numbered years and with Father in even-numbered years, from after school on Friday until the start of school on Tuesday."},
      {"value": "father_odd_years", "label": "The children will stay with Father on Victoria Day Weekend in odd-numbered years and with Mother in even-numbered years, from after school on Friday until the start of school on Tuesday."},
      {"value": "mother_all_years", "label": "The children will stay with Mother on Victoria Day Weekend every year, from after school on Friday until the start of school on Tuesday."},
      {"value": "father_all_years", "label": "The children will stay with Father on Victoria Day Weekend every year, from after school on Friday until the start of school on Tuesday."},
      {"value": "follow_regular_schedule", "label": "The children will follow their regular parenting schedule during Victoria Day Weekend."}
    ]',
    7
  ),
  (
    'Canada Day',
    'statutory',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother on Canada Day in odd-numbered years and with Father in even-numbered years, for the entire day."},
      {"value": "father_odd_years", "label": "The children will stay with Father on Canada Day in odd-numbered years and with Mother in even-numbered years, for the entire day."},
      {"value": "mother_all_years", "label": "The children will stay with Mother on Canada Day every year."},
      {"value": "father_all_years", "label": "The children will stay with Father on Canada Day every year."},
      {"value": "follow_regular_schedule", "label": "The children will follow their regular parenting schedule on Canada Day."}
    ]',
    8
  ),
  (
    'Civic Holiday Weekend',
    'statutory',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother on Civic Holiday Weekend in odd-numbered years and with Father in even-numbered years, from after school on Friday until the start of school on Tuesday."},
      {"value": "father_odd_years", "label": "The children will stay with Father on Civic Holiday Weekend in odd-numbered years and with Mother in even-numbered years, from after school on Friday until the start of school on Tuesday."},
      {"value": "mother_all_years", "label": "The children will stay with Mother on Civic Holiday Weekend every year, from after school on Friday until the start of school on Tuesday."},
      {"value": "father_all_years", "label": "The children will stay with Father on Civic Holiday Weekend every year, from after school on Friday until the start of school on Tuesday."},
      {"value": "follow_regular_schedule", "label": "The children will follow their regular parenting schedule during Civic Holiday Weekend."}
    ]',
    9
  ),
  (
    'Labour Day Weekend',
    'statutory',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother on Labour Day Weekend in odd-numbered years and with Father in even-numbered years, from after school on Friday until the start of school on Tuesday."},
      {"value": "father_odd_years", "label": "The children will stay with Father on Labour Day Weekend in odd-numbered years and with Mother in even-numbered years, from after school on Friday until the start of school on Tuesday."},
      {"value": "mother_all_years", "label": "The children will stay with Mother on Labour Day Weekend every year, from after school on Friday until the start of school on Tuesday."},
      {"value": "father_all_years", "label": "The children will stay with Father on Labour Day Weekend every year, from after school on Friday until the start of school on Tuesday."},
      {"value": "follow_regular_schedule", "label": "The children will follow their regular parenting schedule during Labour Day Weekend."}
    ]',
    10
  ),
  (
    'Thanksgiving Weekend',
    'statutory',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother on Thanksgiving Weekend in odd-numbered years and with Father in even-numbered years, from after school on Friday until the start of school on Tuesday."},
      {"value": "father_odd_years", "label": "The children will stay with Father on Thanksgiving Weekend in odd-numbered years and with Mother in even-numbered years, from after school on Friday until the start of school on Tuesday."},
      {"value": "mother_all_years", "label": "The children will stay with Mother on Thanksgiving Weekend every year, from after school on Friday until the start of school on Tuesday."},
      {"value": "father_all_years", "label": "The children will stay with Father on Thanksgiving Weekend every year, from after school on Friday until the start of school on Tuesday."},
      {"value": "split_day", "label": "The children will spend Thanksgiving Day with one parent and the remainder of the weekend with the other parent, alternating each year."}
    ]',
    11
  ),
  (
    'Halloween',
    'family',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother on Halloween in odd-numbered years and with Father in even-numbered years, from after school until 8:00 PM."},
      {"value": "father_odd_years", "label": "The children will stay with Father on Halloween in odd-numbered years and with Mother in even-numbered years, from after school until 8:00 PM."},
      {"value": "mother_all_years", "label": "The children will stay with Mother on Halloween every year, from after school until 8:00 PM."},
      {"value": "father_all_years", "label": "The children will stay with Father on Halloween every year, from after school until 8:00 PM."},
      {"value": "follow_regular_schedule", "label": "The children will follow their regular parenting schedule on Halloween."}
    ]',
    12
  ),
  (
    'Mother''s Day',
    'family',
    '[
      {"value": "mother_always", "label": "The children will stay with Mother on Mother''s Day every year, from 9:00 AM until 6:00 PM."},
      {"value": "mother_always_weekend", "label": "The children will stay with Mother for the entire Mother''s Day weekend every year, from after school on Friday until the start of school on Monday."}
    ]',
    13
  ),
  (
    'Father''s Day',
    'family',
    '[
      {"value": "father_always", "label": "The children will stay with Father on Father''s Day every year, from 9:00 AM until 6:00 PM."},
      {"value": "father_always_weekend", "label": "The children will stay with Father for the entire Father''s Day weekend every year, from after school on Friday until the start of school on Monday."}
    ]',
    14
  ),
  (
    'Child''s Birthday',
    'family',
    '[
      {"value": "mother_odd_years", "label": "The children will stay with Mother on their birthday in odd-numbered years and with Father in even-numbered years, from after school until 8:00 PM."},
      {"value": "father_odd_years", "label": "The children will stay with Father on their birthday in odd-numbered years and with Mother in even-numbered years, from after school until 8:00 PM."},
      {"value": "mother_all_years", "label": "The children will stay with Mother on their birthday every year, from after school until 8:00 PM."},
      {"value": "father_all_years", "label": "The children will stay with Father on their birthday every year, from after school until 8:00 PM."},
      {"value": "both_parents", "label": "Both parents will celebrate the children''s birthday together."},
      {"value": "parent_of_the_day", "label": "The children will spend their birthday with whichever parent they are scheduled to be with according to the regular parenting schedule."}
    ]',
    15
  );
