-- Agreement Database Query Reference
-- Use these queries directly in your database client (psql, pgAdmin, etc.)

-- List all agreements for a user
SELECT id, label, agreement_type, status, created_at
FROM agreements
WHERE user_id = 'USER_ID_HERE'
ORDER BY created_at DESC;

-- View specific agreement details
SELECT * FROM agreements WHERE id = 'AGREEMENT_ID_HERE';

-- View agreement interview data as readable JSON
SELECT id, label, agreement_type, jsonb_pretty(interview_data) as data
FROM agreements WHERE id = 'AGREEMENT_ID_HERE';

-- Update agreement label
UPDATE agreements
SET label = 'New Label', updated_at = NOW()
WHERE id = 'AGREEMENT_ID_HERE';

-- Update agreement status
UPDATE agreements
SET status = 'final', updated_at = NOW()
WHERE id = 'AGREEMENT_ID_HERE';

-- Update a single field in interview_data
UPDATE agreements
SET interview_data = jsonb_set(interview_data, '{party1Name}', '"New Name"'::jsonb),
    updated_at = NOW()
WHERE id = 'AGREEMENT_ID_HERE';

-- Update multiple fields in interview_data
UPDATE agreements
SET interview_data = interview_data || '{"party1Name": "Jane Doe", "party2Name": "John Smith"}'::jsonb,
    updated_at = NOW()
WHERE id = 'AGREEMENT_ID_HERE';

-- Add/update a nested array item (e.g., add child)
UPDATE agreements
SET interview_data = jsonb_set(
  interview_data,
  '{children,0}',
  '{"name": "Alice", "dateOfBirth": "2015-01-15", "residence": "Toronto, ON"}'::jsonb
),
updated_at = NOW()
WHERE id = 'AGREEMENT_ID_HERE';

-- View only specific fields from interview data
SELECT id, label,
  agreement_type,
  interview_data->>'party1Name' as party1,
  interview_data->>'party2Name' as party2,
  interview_data->'children' as children
FROM agreements WHERE id = 'AGREEMENT_ID_HERE';

-- Delete agreement (use with caution!)
DELETE FROM agreements WHERE id = 'AGREEMENT_ID_HERE';

-- Count agreements by type
SELECT agreement_type, COUNT(*)
FROM agreements
WHERE user_id = 'USER_ID_HERE'
GROUP BY agreement_type;

-- Find agreements created in last 7 days
SELECT id, label, agreement_type, created_at
FROM agreements
WHERE created_at >= NOW() - INTERVAL '7 days'
ORDER BY created_at DESC;

-- Copy agreement to create a draft version
INSERT INTO agreements (user_id, calculation_id, agreement_type, label, status, interview_data)
SELECT user_id, calculation_id, agreement_type, label || ' (Copy)', 'draft', interview_data
FROM agreements
WHERE id = 'AGREEMENT_ID_TO_COPY';

-- View interview_data keys for a specific agreement
SELECT jsonb_object_keys(interview_data) as field_names
FROM agreements
WHERE id = 'AGREEMENT_ID_HERE';

-- Export all agreements as JSON
SELECT jsonb_agg(jsonb_build_object(
  'id', id,
  'label', label,
  'type', agreement_type,
  'created_at', created_at,
  'data', interview_data
)) as all_agreements
FROM agreements
WHERE user_id = 'USER_ID_HERE';
