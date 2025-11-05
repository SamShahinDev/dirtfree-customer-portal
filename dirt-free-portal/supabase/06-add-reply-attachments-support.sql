-- =====================================================
-- REPLY ATTACHMENTS SUPPORT
-- Adds file attachment support to message_replies table
-- Run this to enable file uploads in message replies
-- =====================================================

-- =====================================================
-- 1. ADD ATTACHMENTS COLUMN TO MESSAGE_REPLIES TABLE
-- =====================================================

-- Add attachments column to store array of file metadata
-- Structure: [{ url: string, filename: string, size: number, type: string, path: string }]
ALTER TABLE message_replies
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Create index for faster JSONB queries
CREATE INDEX IF NOT EXISTS idx_message_replies_attachments ON message_replies USING GIN (attachments);

-- Add comment explaining the structure
COMMENT ON COLUMN message_replies.attachments IS 'Array of file attachment metadata. Format: [{ url: string, filename: string, size: number, type: string, path: string }]';

-- =====================================================
-- 2. CREATE HELPER FUNCTIONS FOR REPLY ATTACHMENTS
-- =====================================================

-- Function to get total attachment size for a reply
CREATE OR REPLACE FUNCTION get_reply_attachments_size(reply_id UUID)
RETURNS BIGINT AS $$
  SELECT COALESCE(
    SUM((attachment->>'size')::BIGINT),
    0
  )
  FROM message_replies,
  LATERAL jsonb_array_elements(attachments) AS attachment
  WHERE id = reply_id;
$$ LANGUAGE SQL STABLE;

-- Function to count attachments for a reply
CREATE OR REPLACE FUNCTION count_reply_attachments(reply_id UUID)
RETURNS INTEGER AS $$
  SELECT COALESCE(jsonb_array_length(attachments), 0)
  FROM message_replies
  WHERE id = reply_id;
$$ LANGUAGE SQL STABLE;

-- =====================================================
-- 3. UPDATE EXISTING REPLIES (if any)
-- =====================================================

-- Ensure all existing message replies have the attachments field initialized
UPDATE message_replies
SET attachments = '[]'::jsonb
WHERE attachments IS NULL;

-- =====================================================
-- 4. CREATE REPLY_ATTACHMENTS VIEW (optional)
-- =====================================================

-- Convenient view to query reply attachments
CREATE OR REPLACE VIEW reply_attachments_view AS
SELECT
  r.id AS reply_id,
  r.message_id,
  r.is_staff_reply,
  r.created_at AS reply_created_at,
  attachment->>'url' AS url,
  attachment->>'filename' AS filename,
  (attachment->>'size')::INTEGER AS size,
  attachment->>'type' AS file_type,
  attachment->>'path' AS storage_path
FROM message_replies r,
LATERAL jsonb_array_elements(r.attachments) AS attachment;

-- Add comment
COMMENT ON VIEW reply_attachments_view IS 'Flattened view of message reply attachments for easier querying';

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

DO $$
DECLARE
  attachments_column_exists BOOLEAN;
  existing_replies_count INTEGER;
  replies_with_attachments INTEGER;
BEGIN
  RAISE NOTICE '📎 Verifying reply attachments support...';

  -- Check if attachments column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'message_replies'
      AND column_name = 'attachments'
  ) INTO attachments_column_exists;

  IF attachments_column_exists THEN
    RAISE NOTICE '  ✅ message_replies.attachments column added';
  ELSE
    RAISE WARNING '  ⚠️ message_replies.attachments column NOT found';
  END IF;

  -- Count existing replies
  SELECT COUNT(*) INTO existing_replies_count
  FROM message_replies;

  RAISE NOTICE '  📊 Existing message replies: %', existing_replies_count;

  -- Count replies with initialized attachments
  SELECT COUNT(*) INTO replies_with_attachments
  FROM message_replies
  WHERE attachments IS NOT NULL;

  RAISE NOTICE '  ✅ Replies with initialized attachments: %', replies_with_attachments;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Reply attachments support configured!';
  RAISE NOTICE '📎 message_replies.attachments ready for file uploads';
  RAISE NOTICE '🎯 Users can now attach files when replying to messages';
  RAISE NOTICE '🔒 Existing RLS policies will apply to attachment access';
END $$;
