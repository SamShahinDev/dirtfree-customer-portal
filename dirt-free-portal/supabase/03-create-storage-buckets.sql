-- =====================================================
-- SUPABASE STORAGE CONFIGURATION
-- Creates storage buckets and RLS policies
-- Run this after 01-create-portal-tables.sql and 02-apply-rls-policies.sql
-- =====================================================

-- =====================================================
-- CREATE STORAGE BUCKETS
-- =====================================================

-- Customer Documents Bucket
-- For storing customer-uploaded documents, warranties, receipts, etc.
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'customer-documents',
  'customer-documents',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- Message Attachments Bucket
-- For storing photos attached to customer messages
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'message-attachments',
  'message-attachments',
  true,
  10485760, -- 10MB in bytes
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = 10485760,
  allowed_mime_types = ARRAY['image/jpeg', 'image/png', 'image/webp', 'application/pdf'];

-- =====================================================
-- DROP EXISTING STORAGE POLICIES (if any)
-- =====================================================

DROP POLICY IF EXISTS "Customers can upload own documents" ON storage.objects;
DROP POLICY IF EXISTS "Customers can view own documents" ON storage.objects;
DROP POLICY IF EXISTS "Customers can delete own documents" ON storage.objects;
DROP POLICY IF EXISTS "Customers can upload message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Customers can view own message attachments" ON storage.objects;
DROP POLICY IF EXISTS "Customers can delete own message attachments" ON storage.objects;

-- =====================================================
-- STORAGE POLICIES FOR CUSTOMER-DOCUMENTS BUCKET
-- =====================================================

-- Allow authenticated customers to upload files to their own folder
CREATE POLICY "Customers can upload own documents"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'customer-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM customers WHERE email = auth.email()
  )
);

-- Allow authenticated customers to view files in their own folder
CREATE POLICY "Customers can view own documents"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'customer-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM customers WHERE email = auth.email()
  )
);

-- Allow authenticated customers to delete files from their own folder
CREATE POLICY "Customers can delete own documents"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'customer-documents' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM customers WHERE email = auth.email()
  )
);

-- =====================================================
-- STORAGE POLICIES FOR MESSAGE-ATTACHMENTS BUCKET
-- =====================================================

-- Allow authenticated customers to upload message attachments to their own folder
CREATE POLICY "Customers can upload message attachments"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM customers WHERE email = auth.email()
  )
);

-- Allow authenticated customers to view their own message attachments
CREATE POLICY "Customers can view own message attachments"
ON storage.objects FOR SELECT
TO authenticated
USING (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM customers WHERE email = auth.email()
  )
);

-- Allow authenticated customers to delete their own message attachments
CREATE POLICY "Customers can delete own message attachments"
ON storage.objects FOR DELETE
TO authenticated
USING (
  bucket_id = 'message-attachments' AND
  (storage.foldername(name))[1] IN (
    SELECT id::text FROM customers WHERE email = auth.email()
  )
);

-- =====================================================
-- VERIFY BUCKETS AND POLICIES
-- =====================================================

DO $$
DECLARE
  bucket_record RECORD;
  policy_count INTEGER;
BEGIN
  RAISE NOTICE '📦 Verifying storage buckets...';

  -- Check customer-documents bucket
  SELECT * INTO bucket_record FROM storage.buckets WHERE id = 'customer-documents';
  IF FOUND THEN
    RAISE NOTICE '  ✅ customer-documents bucket exists';
    RAISE NOTICE '     - Public: %', bucket_record.public;
    RAISE NOTICE '     - Size limit: % MB', bucket_record.file_size_limit / 1024 / 1024;
  ELSE
    RAISE WARNING '  ⚠️ customer-documents bucket NOT found';
  END IF;

  -- Check message-attachments bucket
  SELECT * INTO bucket_record FROM storage.buckets WHERE id = 'message-attachments';
  IF FOUND THEN
    RAISE NOTICE '  ✅ message-attachments bucket exists';
    RAISE NOTICE '     - Public: %', bucket_record.public;
    RAISE NOTICE '     - Size limit: % MB', bucket_record.file_size_limit / 1024 / 1024;
  ELSE
    RAISE WARNING '  ⚠️ message-attachments bucket NOT found';
  END IF;

  -- Check policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE schemaname = 'storage'
    AND tablename = 'objects'
    AND policyname LIKE '%Customers can%';

  RAISE NOTICE '';
  RAISE NOTICE '🔒 Storage policies created: %', policy_count;

  IF policy_count >= 6 THEN
    RAISE NOTICE '✅ Storage configuration complete!';
    RAISE NOTICE '📁 Buckets: customer-documents, message-attachments';
    RAISE NOTICE '🔐 RLS policies: 6 policies applied';
    RAISE NOTICE '';
    RAISE NOTICE '💡 File structure:';
    RAISE NOTICE '   customer-documents/<customer-id>/<category>/<timestamp>-<filename>';
    RAISE NOTICE '   message-attachments/<customer-id>/messages/<timestamp>-<filename>';
  ELSE
    RAISE WARNING '⚠️ Expected 6 policies, found %', policy_count;
  END IF;
END $$;
