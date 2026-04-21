/*
  # Add Christmas Eve and Christmas Day Holiday Templates

  ## Overview
  Adds separate holiday templates for Christmas Eve and Christmas Day to give users more granular control over holiday scheduling.

  ## Changes
  1. New Holiday Templates
    - Christmas Eve template with multiple arrangement options
    - Christmas Day template with multiple arrangement options
  
  ## Template Options
  Both templates include:
    - Alternating years (Mother odd/Father even and vice versa)
    - Every year with one parent
    - Split between parents
    - Follow regular schedule
  
  ## Display Order
  - Christmas Eve: 4.1
  - Christmas Day: 4.2
  - (Existing Christmas Holiday remains at 4)
*/

-- Add Christmas Eve template
INSERT INTO holiday_schedule_templates (holiday_name, category, preset_options, display_order)
VALUES (
  'Christmas Eve',
  'statutory',
  '[
    {
      "value": "mother_odd_years",
      "label": "The children will stay with Mother on Christmas Eve in odd-numbered years, from 5:00 PM on December 24 until 9:00 AM on December 25."
    },
    {
      "value": "father_odd_years",
      "label": "The children will stay with Father on Christmas Eve in odd-numbered years, from 5:00 PM on December 24 until 9:00 AM on December 25."
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
  ]'::jsonb,
  4.1
);

-- Add Christmas Day template
INSERT INTO holiday_schedule_templates (holiday_name, category, preset_options, display_order)
VALUES (
  'Christmas Day',
  'statutory',
  '[
    {
      "value": "mother_odd_years",
      "label": "The children will stay with Mother on Christmas Day in odd-numbered years, from 9:00 AM on December 25 until 9:00 AM on December 26."
    },
    {
      "value": "father_odd_years",
      "label": "The children will stay with Father on Christmas Day in odd-numbered years, from 9:00 AM on December 25 until 9:00 AM on December 26."
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
  ]'::jsonb,
  4.2
);