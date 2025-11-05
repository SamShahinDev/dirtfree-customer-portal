-- =====================================================
-- FILE ATTACHMENTS SUPPORT
-- Adds file attachment support to messages and creates job_photos table
-- Run this after 03-create-storage-buckets.sql
-- =====================================================

-- =====================================================
-- 1. ADD ATTACHMENTS COLUMN TO MESSAGES TABLE
-- =====================================================

-- Add attachments column to store array of file metadata
-- Structure: [{ url: string, filename: string, size: number, type: string, path: string }]
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Create index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_messages_attachments ON messages USING GIN (attachments);

-- Add comment explaining the structure
COMMENT ON COLUMN messages.attachments IS 'Array of file attachment metadata. Format: [{ url: string, filename: string, size: number, type: string, path: string }]';

-- =====================================================
-- 2. CREATE JOB_PHOTOS TABLE
-- =====================================================

-- Table for storing before/after photos from completed jobs
CREATE TABLE IF NOT EXISTS job_photos (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_id UUID NOT NULL REFERENCES jobs(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  storage_path TEXT NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('before', 'after')),
  filename VARCHAR(255),
  size INTEGER,
  uploaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  uploaded_by VARCHAR(50) DEFAULT 'customer',
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_job_photos_job_id ON job_photos(job_id);
CREATE INDEX IF NOT EXISTS idx_job_photos_type ON job_photos(type);
CREATE INDEX IF NOT EXISTS idx_job_photos_uploaded_at ON job_photos(uploaded_at DESC);

-- Add comment
COMMENT ON TABLE job_photos IS 'Stores before/after photos for completed service jobs';

-- =====================================================
-- 3. ENABLE RLS ON JOB_PHOTOS TABLE
-- =====================================================

ALTER TABLE job_photos ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Customers can view photos from own jobs" ON job_photos;
DROP POLICY IF EXISTS "Customers can upload photos to own jobs" ON job_photos;
DROP POLICY IF EXISTS "Customers can delete own photo uploads" ON job_photos;

-- Allow customers to view photos from their own jobs
CREATE POLICY "Customers can view photos from own jobs"
ON job_photos FOR SELECT
TO authenticated
USING (
  job_id IN (
    SELECT id FROM jobs
    WHERE customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  )
);

-- Allow customers to upload photos to their own jobs
CREATE POLICY "Customers can upload photos to own jobs"
ON job_photos FOR INSERT
TO authenticated
WITH CHECK (
  job_id IN (
    SELECT id FROM jobs
    WHERE customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  )
);

-- Allow customers to delete their own uploaded photos
CREATE POLICY "Customers can delete own photo uploads"
ON job_photos FOR DELETE
TO authenticated
USING (
  uploaded_by = 'customer' AND
  job_id IN (
    SELECT id FROM jobs
    WHERE customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  )
);

-- =====================================================
-- 4. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get total attachment size for a message
CREATE OR REPLACE FUNCTION get_message_attachments_size(message_id UUID)
RETURNS BIGINT AS $$
  SELECT COALESCE(
    SUM((attachment->>'size')::BIGINT),
    0
  )
  FROM messages,
  LATERAL jsonb_array_elements(attachments) AS attachment
  WHERE id = message_id;
$$ LANGUAGE SQL STABLE;

-- Function to count attachments for a message
CREATE OR REPLACE FUNCTION count_message_attachments(message_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(jsonb_array_length(attachments), 0)
  FROM messages
  WHERE id = message_id;
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- 5. UPDATE EXISTING MESSAGES (if any)
-- =====================================================

-- Ensure all existing messages have the attachments field
UPDATE messages
SET attachments = '[]'::jsonb
WHERE attachments IS NULL;

-- =====================================================
-- 6. CREATE MESSAGE_ATTACHMENTS VIEW (optional)
-- =====================================================

-- Convenient view to query message attachments
CREATE OR REPLACE VIEW message_attachments_view AS
SELECT
  m.id AS message_id,
  m.customer_id,
  m.subject,
  m.created_at AS message_created_at,
  attachment->>'url' AS url,
  attachment->>'filename' AS filename,
  (attachment->>'size')::INTEGER AS size,
  attachment->>'type' AS file_type,
  attachment->>'path' AS storage_path
FROM messages m,
LATERAL jsonb_array_elements(m.attachments) AS attachment;

-- Add comment
COMMENT ON VIEW message_attachments_view IS 'Flattened view of message attachments for easier querying';

-- =====================================================
-- 7. VERIFICATION
-- =====================================================

DO $$
DECLARE
  attachments_column_exists BOOLEAN;
  job_photos_table_exists BOOLEAN;
  job_photos_policies_count INTEGER;
BEGIN
  RAISE NOTICE '📎 Verifying file attachments support...';

  -- Check if attachments column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'messages'
      AND column_name = 'attachments'
  ) INTO attachments_column_exists;

  IF attachments_column_exists THEN
    RAISE NOTICE '  ✅ messages.attachments column added';
  ELSE
    RAISE WARNING '  ⚠️ messages.attachments column NOT found';
  END IF;

  -- Check if job_photos table exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'job_photos'
  ) INTO job_photos_table_exists;

  IF job_photos_table_exists THEN
    RAISE NOTICE '  ✅ job_photos table created';
  ELSE
    RAISE WARNING '  ⚠️ job_photos table NOT found';
  END IF;

  -- Check job_photos policies
  SELECT COUNT(*) INTO job_photos_policies_count
  FROM pg_policies
  WHERE tablename = 'job_photos';

  RAISE NOTICE '  ✅ job_photos RLS policies: %', job_photos_policies_count;

  RAISE NOTICE '';
  RAISE NOTICE '✅ File attachments support configured!';
  RAISE NOTICE '📸 job_photos table ready for before/after photos';
  RAISE NOTICE '📎 messages.attachments ready for file uploads';
  RAISE NOTICE '🔒 RLS policies applied';
END $$;
