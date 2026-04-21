/*
  # Create Storage Bucket for Income Documents

  ## Overview
  Creates a storage bucket for storing income tax documents, notices of assessment,
  and other financial documents uploaded by users.

  ## Storage Bucket
  - Name: income-documents
  - Public: false (private bucket)
  - File size limit: 50MB
  - Allowed MIME types: PDF, JPG, JPEG, PNG

  ## Security Policies
  - Users can upload files to their own agreement folders
  - Users can view files from agreements they are part of
  - Users can delete files from agreements they are part of
*/

-- Create the storage bucket
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'income-documents',
  'income-documents',
  false,
  52428800,
  ARRAY['application/pdf', 'image/jpeg', 'image/jpg', 'image/png']
)
ON CONFLICT (id) DO NOTHING;

-- Policy: Users can upload files to their agreements
CREATE POLICY "Users can upload income documents to their agreements"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'income-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM agreements
    WHERE party1_id = auth.uid() OR party2_id = auth.uid()
  )
);

-- Policy: Users can view files from their agreements
CREATE POLICY "Users can view income documents from their agreements"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'income-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM agreements
    WHERE party1_id = auth.uid() OR party2_id = auth.uid()
  )
);

-- Policy: Users can delete files from their agreements
CREATE POLICY "Users can delete income documents from their agreements"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'income-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM agreements
    WHERE party1_id = auth.uid() OR party2_id = auth.uid()
  )
);
