/*
  # Update Holiday Templates with Complete Odd/Even Year Language

  ## Overview
  Updates all holiday templates to explicitly state both odd AND even year assignments
  for complete clarity in separation agreements.

  ## Changes Made
  For all templates with "odd year" arrangements:
  - Updated mother_odd_years to state: Mother in odd years AND Father in even years
  - Updated father_odd_years to state: Father in odd years AND Mother in even years
  
  ## Affected Holidays
  1. Family Day Weekend
  2. Spring Break
  3. Easter Weekend
  4. Christmas Eve
  5. Christmas Day
  6. Christmas Holiday
  7. Boxing Day and Remainder of Winter Break
  8. New Year's Eve and New Year's Day
  9. Victoria Day Weekend
  10. Canada Day
  11. Civic Holiday Weekend
  12. Labour Day Weekend
  13. Thanksgiving Weekend
  14. Halloween
  15. Child's Birthday
*/

-- Family Day Weekend
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on Family Day Weekend in odd-numbered years and with Father in even-numbered years, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on Family Day Weekend in odd-numbered years and with Mother in even-numbered years, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on Family Day Weekend every year, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on Family Day Weekend every year, from after school on Friday until the start of school on Tuesday."
  }
]'::jsonb
WHERE holiday_name = 'Family Day Weekend';

-- Spring Break
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother during Spring Break in odd-numbered years and with Father in even-numbered years, from after school as the break starts until the start of school following the break."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father during Spring Break in odd-numbered years and with Mother in even-numbered years, from after school as the break starts until the start of school following the break."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother during Spring Break every year, from after school as the break starts until the start of school following the break."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father during Spring Break every year, from after school as the break starts until the start of school following the break."
  },
  {
    "value": "split_week",
    "label": "The children will stay with Mother for the first half of Spring Break and with Father for the second half, alternating who gets the first half each year."
  }
]'::jsonb
WHERE holiday_name = 'Spring Break';

-- Easter Weekend
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on Easter Weekend in odd-numbered years and with Father in even-numbered years, from after school on the Thursday before the Easter weekend until the start of school the following Tuesday."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on Easter Weekend in odd-numbered years and with Mother in even-numbered years, from after school on the Thursday before the Easter weekend until the start of school the following Tuesday."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on Easter Weekend every year, from after school on the Thursday before the Easter weekend until the start of school the following Tuesday."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on Easter Weekend every year, from after school on the Thursday before the Easter weekend until the start of school the following Tuesday."
  }
]'::jsonb
WHERE holiday_name = 'Easter Weekend';

-- Christmas Eve
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on Christmas Eve in odd-numbered years and with Father in even-numbered years, from 5:00 PM on December 24 until 9:00 AM on December 25."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on Christmas Eve in odd-numbered years and with Mother in even-numbered years, from 5:00 PM on December 24 until 9:00 AM on December 25."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on Christmas Eve every year, from 5:00 PM on December 24 until 9:00 AM on December 25."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on Christmas Eve every year, from 5:00 PM on December 24 until 9:00 AM on December 25."
  },
  {
    "value": "split_evening",
    "label": "The children will spend Christmas Eve evening (5:00 PM - 9:00 PM) with one parent and overnight (9:00 PM - 9:00 AM) with the other parent, alternating each year."
  },
  {
    "value": "follow_regular_schedule",
    "label": "The parties will follow their regular parenting schedule. No special holiday arrangements apply."
  }
]'::jsonb
WHERE holiday_name = 'Christmas Eve';

-- Christmas Day
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on Christmas Day in odd-numbered years and with Father in even-numbered years, from 9:00 AM on December 25 until 9:00 AM on December 26."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on Christmas Day in odd-numbered years and with Mother in even-numbered years, from 9:00 AM on December 25 until 9:00 AM on December 26."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on Christmas Day every year, from 9:00 AM on December 25 until 9:00 AM on December 26."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on Christmas Day every year, from 9:00 AM on December 25 until 9:00 AM on December 26."
  },
  {
    "value": "split_day",
    "label": "The children will spend Christmas Day morning (9:00 AM - 2:00 PM) with one parent and afternoon/evening (2:00 PM - 9:00 AM next day) with the other parent, alternating each year."
  },
  {
    "value": "both_parents",
    "label": "The children will spend Christmas Day with both parents together."
  },
  {
    "value": "follow_regular_schedule",
    "label": "The parties will follow their regular parenting schedule. No special holiday arrangements apply."
  }
]'::jsonb
WHERE holiday_name = 'Christmas Day';

-- Christmas Holiday
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother during the Christmas holiday in odd-numbered years and with Father in even-numbered years, from after school on the last day before the break until 12:00 PM on December 26."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father during the Christmas holiday in odd-numbered years and with Mother in even-numbered years, from after school on the last day before the break until 12:00 PM on December 26."
  },
  {
    "value": "split_holiday",
    "label": "The children will stay with Mother from after school on the last day before the break until 12:00 PM on December 26, then with Father from 12:00 PM on December 26 until the start of school, alternating each year."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother during the Christmas holiday every year, from after school on the last day before the break until 12:00 PM on December 26."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father during the Christmas holiday every year, from after school on the last day before the break until 12:00 PM on December 26."
  }
]'::jsonb
WHERE holiday_name = 'Christmas Holiday';

-- Boxing Day and Remainder of Winter Break
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother from 12:00 PM on December 26 until the start of school in odd-numbered years and with Father in even-numbered years."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father from 12:00 PM on December 26 until the start of school in odd-numbered years and with Mother in even-numbered years."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother from 12:00 PM on December 26 until the start of school every year."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father from 12:00 PM on December 26 until the start of school every year."
  }
]'::jsonb
WHERE holiday_name = 'Boxing Day and Remainder of Winter Break';

-- New Year's Eve and New Year's Day
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on New Year''s Eve and New Year''s Day in odd-numbered years and with Father in even-numbered years, from 12:00 PM on December 31 until 6:00 PM on January 1."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on New Year''s Eve and New Year''s Day in odd-numbered years and with Mother in even-numbered years, from 12:00 PM on December 31 until 6:00 PM on January 1."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on New Year''s Eve and New Year''s Day every year, from 12:00 PM on December 31 until 6:00 PM on January 1."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on New Year''s Eve and New Year''s Day every year, from 12:00 PM on December 31 until 6:00 PM on January 1."
  }
]'::jsonb
WHERE holiday_name = 'New Year''s Eve and New Year''s Day';

-- Victoria Day Weekend
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on Victoria Day Weekend in odd-numbered years and with Father in even-numbered years, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on Victoria Day Weekend in odd-numbered years and with Mother in even-numbered years, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on Victoria Day Weekend every year, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on Victoria Day Weekend every year, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "follow_regular_schedule",
    "label": "The children will follow their regular parenting schedule during Victoria Day Weekend."
  }
]'::jsonb
WHERE holiday_name = 'Victoria Day Weekend';

-- Canada Day
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on Canada Day in odd-numbered years and with Father in even-numbered years, for the entire day."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on Canada Day in odd-numbered years and with Mother in even-numbered years, for the entire day."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on Canada Day every year."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on Canada Day every year."
  },
  {
    "value": "follow_regular_schedule",
    "label": "The children will follow their regular parenting schedule on Canada Day."
  }
]'::jsonb
WHERE holiday_name = 'Canada Day';

-- Civic Holiday Weekend
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on Civic Holiday Weekend in odd-numbered years and with Father in even-numbered years, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on Civic Holiday Weekend in odd-numbered years and with Mother in even-numbered years, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on Civic Holiday Weekend every year, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on Civic Holiday Weekend every year, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "follow_regular_schedule",
    "label": "The children will follow their regular parenting schedule during Civic Holiday Weekend."
  }
]'::jsonb
WHERE holiday_name = 'Civic Holiday Weekend';

-- Labour Day Weekend
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on Labour Day Weekend in odd-numbered years and with Father in even-numbered years, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on Labour Day Weekend in odd-numbered years and with Mother in even-numbered years, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on Labour Day Weekend every year, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on Labour Day Weekend every year, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "follow_regular_schedule",
    "label": "The children will follow their regular parenting schedule during Labour Day Weekend."
  }
]'::jsonb
WHERE holiday_name = 'Labour Day Weekend';

-- Thanksgiving Weekend
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on Thanksgiving Weekend in odd-numbered years and with Father in even-numbered years, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on Thanksgiving Weekend in odd-numbered years and with Mother in even-numbered years, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on Thanksgiving Weekend every year, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on Thanksgiving Weekend every year, from after school on Friday until the start of school on Tuesday."
  },
  {
    "value": "split_day",
    "label": "The children will spend Thanksgiving Day with one parent and the remainder of the weekend with the other parent, alternating each year."
  }
]'::jsonb
WHERE holiday_name = 'Thanksgiving Weekend';

-- Halloween
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on Halloween in odd-numbered years and with Father in even-numbered years, from after school until 8:00 PM."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on Halloween in odd-numbered years and with Mother in even-numbered years, from after school until 8:00 PM."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on Halloween every year, from after school until 8:00 PM."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on Halloween every year, from after school until 8:00 PM."
  },
  {
    "value": "follow_regular_schedule",
    "label": "The children will follow their regular parenting schedule on Halloween."
  }
]'::jsonb
WHERE holiday_name = 'Halloween';

-- Child's Birthday
UPDATE holiday_schedule_templates
SET preset_options = '[
  {
    "value": "mother_odd_years",
    "label": "The children will stay with Mother on their birthday in odd-numbered years and with Father in even-numbered years, from after school until 8:00 PM."
  },
  {
    "value": "father_odd_years",
    "label": "The children will stay with Father on their birthday in odd-numbered years and with Mother in even-numbered years, from after school until 8:00 PM."
  },
  {
    "value": "mother_all_years",
    "label": "The children will stay with Mother on their birthday every year, from after school until 8:00 PM."
  },
  {
    "value": "father_all_years",
    "label": "The children will stay with Father on their birthday every year, from after school until 8:00 PM."
  },
  {
    "value": "both_parents",
    "label": "Both parents will celebrate the children''s birthday together."
  },
  {
    "value": "parent_of_the_day",
    "label": "The children will spend their birthday with whichever parent they are scheduled to be with according to the regular parenting schedule."
  },
  {
    "value": "follow_regular_schedule",
    "label": "Follow regular parenting schedule"
  }
]'::jsonb
WHERE holiday_name = 'Child''s Birthday';