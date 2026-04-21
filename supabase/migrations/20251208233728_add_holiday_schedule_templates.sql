/*
  # Add Holiday Schedule Templates

  1. New Tables
    - `holiday_schedule_templates`
      - `id` (uuid, primary key)
      - `holiday_name` (text) - Name of the holiday
      - `category` (text) - Category of holiday (statutory, religious, family)
      - `preset_options` (jsonb) - Array of preset scheduling options
      - `display_order` (integer) - Order to display holidays
      - `created_at` (timestamp)
    
    - `agreement_holiday_schedules`
      - `id` (uuid, primary key)
      - `agreement_id` (uuid, foreign key to agreements)
      - `holiday_name` (text)
      - `arrangement` (text) - Selected arrangement for this holiday
      - `custom_details` (text) - Optional custom details
      - `created_at` (timestamp)
      - `updated_at` (timestamp)

  2. Security
    - Enable RLS on both tables
    - Users can read all holiday templates
    - Users can manage holiday schedules for their own agreements

  3. Data
    - Pre-populate common holidays with preset options
*/

-- Create holiday schedule templates table
CREATE TABLE IF NOT EXISTS holiday_schedule_templates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  holiday_name text NOT NULL,
  category text NOT NULL,
  preset_options jsonb NOT NULL DEFAULT '[]',
  display_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now()
);

-- Create agreement holiday schedules table
CREATE TABLE IF NOT EXISTS agreement_holiday_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  agreement_id uuid NOT NULL REFERENCES agreements(id) ON DELETE CASCADE,
  holiday_name text NOT NULL,
  arrangement text NOT NULL,
  custom_details text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS
ALTER TABLE holiday_schedule_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE agreement_holiday_schedules ENABLE ROW LEVEL SECURITY;

-- Policies for holiday_schedule_templates (read-only for all authenticated users)
CREATE POLICY "Anyone can read holiday templates"
  ON holiday_schedule_templates
  FOR SELECT
  TO authenticated
  USING (true);

-- Policies for agreement_holiday_schedules
CREATE POLICY "Users can read holiday schedules for their agreements"
  ON agreement_holiday_schedules
  FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = agreement_holiday_schedules.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can insert holiday schedules for their agreements"
  ON agreement_holiday_schedules
  FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = agreement_holiday_schedules.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can update holiday schedules for their agreements"
  ON agreement_holiday_schedules
  FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = agreement_holiday_schedules.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = agreement_holiday_schedules.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

CREATE POLICY "Users can delete holiday schedules for their agreements"
  ON agreement_holiday_schedules
  FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM agreements
      WHERE agreements.id = agreement_holiday_schedules.agreement_id
      AND (agreements.party1_id = auth.uid() OR agreements.party2_id = auth.uid())
    )
  );

-- Insert holiday templates
INSERT INTO holiday_schedule_templates (holiday_name, category, preset_options, display_order) VALUES
  (
    'Christmas Day',
    'statutory',
    '[
      {"value": "mother_all_years", "label": "Mother has children every year"},
      {"value": "father_all_years", "label": "Father has children every year"},
      {"value": "alternate_years", "label": "Alternate years (odd years with Mother, even years with Father)"},
      {"value": "alternate_years_reverse", "label": "Alternate years (odd years with Father, even years with Mother)"},
      {"value": "split_day", "label": "Split the day between parents"},
      {"value": "share_equally", "label": "Share time equally over the holiday period"}
    ]',
    1
  ),
  (
    'Christmas Eve',
    'statutory',
    '[
      {"value": "mother_all_years", "label": "Mother has children every year"},
      {"value": "father_all_years", "label": "Father has children every year"},
      {"value": "alternate_years", "label": "Alternate years (odd years with Mother, even years with Father)"},
      {"value": "alternate_years_reverse", "label": "Alternate years (odd years with Father, even years with Mother)"},
      {"value": "split_day", "label": "Split the day between parents"}
    ]',
    2
  ),
  (
    'New Year''s Day',
    'statutory',
    '[
      {"value": "mother_all_years", "label": "Mother has children every year"},
      {"value": "father_all_years", "label": "Father has children every year"},
      {"value": "alternate_years", "label": "Alternate years (odd years with Mother, even years with Father)"},
      {"value": "alternate_years_reverse", "label": "Alternate years (odd years with Father, even years with Mother)"},
      {"value": "split_day", "label": "Split the day between parents"}
    ]',
    3
  ),
  (
    'New Year''s Eve',
    'statutory',
    '[
      {"value": "mother_all_years", "label": "Mother has children every year"},
      {"value": "father_all_years", "label": "Father has children every year"},
      {"value": "alternate_years", "label": "Alternate years (odd years with Mother, even years with Father)"},
      {"value": "alternate_years_reverse", "label": "Alternate years (odd years with Father, even years with Mother)"},
      {"value": "split_day", "label": "Split the day between parents"}
    ]',
    4
  ),
  (
    'Easter',
    'religious',
    '[
      {"value": "mother_all_years", "label": "Mother has children every year"},
      {"value": "father_all_years", "label": "Father has children every year"},
      {"value": "alternate_years", "label": "Alternate years (odd years with Mother, even years with Father)"},
      {"value": "alternate_years_reverse", "label": "Alternate years (odd years with Father, even years with Mother)"},
      {"value": "split_weekend", "label": "Split the Easter weekend between parents"}
    ]',
    5
  ),
  (
    'Thanksgiving',
    'statutory',
    '[
      {"value": "mother_all_years", "label": "Mother has children every year"},
      {"value": "father_all_years", "label": "Father has children every year"},
      {"value": "alternate_years", "label": "Alternate years (odd years with Mother, even years with Father)"},
      {"value": "alternate_years_reverse", "label": "Alternate years (odd years with Father, even years with Mother)"},
      {"value": "split_day", "label": "Split the day between parents"}
    ]',
    6
  ),
  (
    'Mother''s Day',
    'family',
    '[
      {"value": "mother_always", "label": "Mother has children every year"},
      {"value": "father_has_children", "label": "Father has children to celebrate with their mother"}
    ]',
    7
  ),
  (
    'Father''s Day',
    'family',
    '[
      {"value": "father_always", "label": "Father has children every year"},
      {"value": "mother_has_children", "label": "Mother has children to celebrate with their father"}
    ]',
    8
  ),
  (
    'Victoria Day',
    'statutory',
    '[
      {"value": "mother_all_years", "label": "Mother has children every year"},
      {"value": "father_all_years", "label": "Father has children every year"},
      {"value": "alternate_years", "label": "Alternate years (odd years with Mother, even years with Father)"},
      {"value": "alternate_years_reverse", "label": "Alternate years (odd years with Father, even years with Mother)"},
      {"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}
    ]',
    9
  ),
  (
    'Canada Day',
    'statutory',
    '[
      {"value": "mother_all_years", "label": "Mother has children every year"},
      {"value": "father_all_years", "label": "Father has children every year"},
      {"value": "alternate_years", "label": "Alternate years (odd years with Mother, even years with Father)"},
      {"value": "alternate_years_reverse", "label": "Alternate years (odd years with Father, even years with Mother)"},
      {"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}
    ]',
    10
  ),
  (
    'Labour Day',
    'statutory',
    '[
      {"value": "mother_all_years", "label": "Mother has children every year"},
      {"value": "father_all_years", "label": "Father has children every year"},
      {"value": "alternate_years", "label": "Alternate years (odd years with Mother, even years with Father)"},
      {"value": "alternate_years_reverse", "label": "Alternate years (odd years with Father, even years with Mother)"},
      {"value": "follow_regular_schedule", "label": "Follow regular parenting schedule"}
    ]',
    11
  ),
  (
    'Halloween',
    'family',
    '[
      {"value": "mother_all_years", "label": "Mother has children every year"},
      {"value": "father_all_years", "label": "Father has children every year"},
      {"value": "alternate_years", "label": "Alternate years (odd years with Mother, even years with Father)"},
      {"value": "alternate_years_reverse", "label": "Alternate years (odd years with Father, even years with Mother)"},
      {"value": "split_evening", "label": "Split the evening between parents"}
    ]',
    12
  ),
  (
    'Child''s Birthday',
    'family',
    '[
      {"value": "mother_all_years", "label": "Mother has children every year"},
      {"value": "father_all_years", "label": "Father has children every year"},
      {"value": "alternate_years", "label": "Alternate years (odd years with Mother, even years with Father)"},
      {"value": "alternate_years_reverse", "label": "Alternate years (odd years with Father, even years with Mother)"},
      {"value": "split_day", "label": "Split the day between parents"},
      {"value": "both_parents", "label": "Both parents celebrate together"}
    ]',
    13
  );
