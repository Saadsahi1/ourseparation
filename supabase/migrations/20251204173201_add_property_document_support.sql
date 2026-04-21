/*
  # Add Property Document Support

  ## Overview
  This migration adds support for uploading supporting documents for property items
  in the Net Family Property statement. Users can now attach documentation such as
  appraisals, bank statements, and other proof of value.

  ## Changes to Existing Tables
  
  ### property_items
  - Add `document_file_path` column to store the path to uploaded supporting document
  - Add `document_file_name` column to store the original filename
  - Add `document_uploaded_at` column to track when document was uploaded
  - Add `has_supporting_document` column to indicate if documentation has been provided

  ## Storage Bucket
  - Name: property-documents
  - Public: false (private bucket)
  - File size limit: 50MB
  - Allowed MIME types: PDF, JPG, JPEG, PNG, DOC, DOCX, XLS, XLSX

  ## Security Policies
  - Users can upload files to property items in their agreements
  - Users can view files from property items in their agreements
  - Users can delete files from property items in their agreements
*/

-- Add document tracking columns to property_items
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_items' AND column_name = 'document_file_path'
  ) THEN
    ALTER TABLE property_items ADD COLUMN document_file_path text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_items' AND column_name = 'document_file_name'
  ) THEN
    ALTER TABLE property_items ADD COLUMN document_file_name text;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_items' AND column_name = 'document_uploaded_at'
  ) THEN
    ALTER TABLE property_items ADD COLUMN document_uploaded_at timestamptz;
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'property_items' AND column_name = 'has_supporting_document'
  ) THEN
    ALTER TABLE property_items ADD COLUMN has_supporting_document boolean DEFAULT false;
  END IF;
END $$;

-- Create the storage bucket for property documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  false,
  52428800,
  ARRAY[
    'application/pdf',
    'image/jpeg',
    'image/jpg',
    'image/png',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  ]
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload property documents to their agreements
CREATE POLICY "Users can upload property documents to their agreements"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'property-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM agreements
    WHERE party1_id = auth.uid() OR party2_id = auth.uid()
  )
);

-- Policy: Users can view property documents from their agreements
CREATE POLICY "Users can view property documents from their agreements"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'property-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM agreements
    WHERE party1_id = auth.uid() OR party2_id = auth.uid()
  )
);

-- Policy: Users can update property documents in their agreements
CREATE POLICY "Users can update property documents in their agreements"
ON storage.objects FOR UPDATE
TO authenticated
USING (
  bucket_id = 'property-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM agreements
    WHERE party1_id = auth.uid() OR party2_id = auth.uid()
  )
)
WITH CHECK (
  bucket_id = 'property-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM agreements
    WHERE party1_id = auth.uid() OR party2_id = auth.uid()
  )
);

-- Policy: Users can delete property documents from their agreements
CREATE POLICY "Users can delete property documents from their agreements"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'property-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM agreements
    WHERE party1_id = auth.uid() OR party2_id = auth.uid()
  )
);
