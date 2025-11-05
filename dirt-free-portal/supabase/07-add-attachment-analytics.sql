-- =====================================================
-- ATTACHMENT ANALYTICS
-- Tracks download counts for message and reply attachments
-- Run this to enable download tracking
-- =====================================================

-- =====================================================
-- 1. CREATE ATTACHMENT_DOWNLOADS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS attachment_downloads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  attachment_path TEXT NOT NULL,
  downloaded_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  downloaded_by UUID REFERENCES customers(id) ON DELETE SET NULL,
  message_id UUID REFERENCES messages(id) ON DELETE CASCADE,
  reply_id UUID REFERENCES message_replies(id) ON DELETE CASCADE,
  CONSTRAINT either_message_or_reply CHECK (
    (message_id IS NOT NULL AND reply_id IS NULL) OR
    (message_id IS NULL AND reply_id IS NOT NULL)
  )
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_path ON attachment_downloads(attachment_path);
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_message_id ON attachment_downloads(message_id);
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_reply_id ON attachment_downloads(reply_id);
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_by ON attachment_downloads(downloaded_by);
CREATE INDEX IF NOT EXISTS idx_attachment_downloads_at ON attachment_downloads(downloaded_at DESC);

-- Add comment
COMMENT ON TABLE attachment_downloads IS 'Tracks every time an attachment is downloaded';
COMMENT ON COLUMN attachment_downloads.attachment_path IS 'Storage path of the downloaded attachment';

-- =====================================================
-- 2. ENABLE RLS ON ATTACHMENT_DOWNLOADS TABLE
-- =====================================================

ALTER TABLE attachment_downloads ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Customers can view download stats for own attachments" ON attachment_downloads;
DROP POLICY IF EXISTS "Customers can track own downloads" ON attachment_downloads;

-- Allow customers to view download stats for attachments on their messages
CREATE POLICY "Customers can view download stats for own attachments"
ON attachment_downloads FOR SELECT
TO authenticated
USING (
  downloaded_by IN (
    SELECT id FROM customers WHERE email = auth.email()
  ) OR
  message_id IN (
    SELECT id FROM messages WHERE customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  ) OR
  reply_id IN (
    SELECT id FROM message_replies WHERE message_id IN (
      SELECT id FROM messages WHERE customer_id IN (
        SELECT id FROM customers WHERE email = auth.email()
      )
    )
  )
);

-- Allow customers to insert download tracking records
CREATE POLICY "Customers can track own downloads"
ON attachment_downloads FOR INSERT
TO authenticated
WITH CHECK (
  downloaded_by IN (
    SELECT id FROM customers WHERE email = auth.email()
  )
);

-- =====================================================
-- 3. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get download count for a specific attachment path
CREATE OR REPLACE FUNCTION get_attachment_download_count(attachment_path TEXT)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM attachment_downloads
  WHERE attachment_path = $1;
$$ LANGUAGE SQL STABLE;

-- Function to get download count for all attachments in a message
CREATE OR REPLACE FUNCTION get_message_attachment_downloads(msg_id UUID)
RETURNS TABLE (
  attachment_path TEXT,
  download_count BIGINT
) AS $$
  SELECT
    ad.attachment_path,
    COUNT(*) as download_count
  FROM attachment_downloads ad
  WHERE ad.message_id = msg_id
  GROUP BY ad.attachment_path;
$$ LANGUAGE SQL STABLE;

-- Function to get download count for all attachments in a reply
CREATE OR REPLACE FUNCTION get_reply_attachment_downloads(rply_id UUID)
RETURNS TABLE (
  attachment_path TEXT,
  download_count BIGINT
) AS $$
  SELECT
    ad.attachment_path,
    COUNT(*) as download_count
  FROM attachment_downloads ad
  WHERE ad.reply_id = rply_id
  GROUP BY ad.attachment_path;
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- 4. CREATE ANALYTICS VIEWS
-- =====================================================

-- View for attachment download statistics
CREATE OR REPLACE VIEW attachment_download_stats AS
SELECT
  attachment_path,
  COUNT(*) as total_downloads,
  COUNT(DISTINCT downloaded_by) as unique_downloaders,
  MIN(downloaded_at) as first_download,
  MAX(downloaded_at) as latest_download
FROM attachment_downloads
GROUP BY attachment_path;

-- Add comment
COMMENT ON VIEW attachment_download_stats IS 'Aggregated download statistics for each attachment';

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

DO $$
DECLARE
  table_exists BOOLEAN;
  policy_count INTEGER;
  function_count INTEGER;
BEGIN
  RAISE NOTICE '📊 Verifying attachment analytics setup...';

  -- Check if table exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'attachment_downloads'
  ) INTO table_exists;

  IF table_exists THEN
    RAISE NOTICE '  ✅ attachment_downloads table created';
  ELSE
    RAISE WARNING '  ⚠️ attachment_downloads table NOT found';
  END IF;

  -- Check policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'attachment_downloads';

  RAISE NOTICE '  ✅ attachment_downloads RLS policies: %', policy_count;

  -- Check functions
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE proname LIKE '%attachment%download%';

  RAISE NOTICE '  ✅ Helper functions created: %', function_count;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Attachment analytics configured!';
  RAISE NOTICE '📊 Download tracking is now active';
  RAISE NOTICE '📈 Use get_attachment_download_count(path) to get download counts';
  RAISE NOTICE '🔒 RLS policies applied for customer access';
END $$;
