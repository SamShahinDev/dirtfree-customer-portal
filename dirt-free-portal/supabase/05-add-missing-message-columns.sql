-- =====================================================
-- ADD MISSING COLUMNS TO MESSAGES TABLE
-- This fixes the PGRST204 error for job_id and attachments
-- Run this migration to add missing columns
-- =====================================================

-- Add job_id column to link messages to appointments
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS job_id UUID REFERENCES jobs(id) ON DELETE SET NULL;

-- Add attachments column for file uploads
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS attachments JSONB DEFAULT '[]'::jsonb;

-- Add has_unread_replies for tracking unread status
ALTER TABLE messages
ADD COLUMN IF NOT EXISTS has_unread_replies BOOLEAN DEFAULT false;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_messages_job_id ON messages(job_id);
CREATE INDEX IF NOT EXISTS idx_messages_attachments ON messages USING GIN (attachments);
CREATE INDEX IF NOT EXISTS idx_messages_has_unread_replies ON messages(has_unread_replies) WHERE has_unread_replies = true;

-- Add comments explaining the columns
COMMENT ON COLUMN messages.job_id IS 'Optional foreign key linking message to a specific job/appointment';
COMMENT ON COLUMN messages.attachments IS 'Array of file attachment metadata. Format: [{ url: string, filename: string, size: number, type: string, path: string }]';
COMMENT ON COLUMN messages.has_unread_replies IS 'Flag indicating if there are unread staff replies to this message';

-- Update category check constraint to match current code usage
-- Current constraint uses: 'general', 'appointment', 'billing', 'service', 'feedback', 'complaint', 'other'
-- Code uses: 'schedule', 'service', 'billing', 'feedback', 'general'
ALTER TABLE messages
DROP CONSTRAINT IF EXISTS messages_category_check;

ALTER TABLE messages
ADD CONSTRAINT messages_category_check
CHECK (category IN ('general', 'appointment', 'billing', 'service', 'feedback', 'complaint', 'other', 'schedule'));

-- Ensure all existing messages have the new fields initialized
UPDATE messages
SET
  attachments = '[]'::jsonb,
  has_unread_replies = false
WHERE attachments IS NULL OR has_unread_replies IS NULL;

-- =====================================================
-- VERIFICATION
-- =====================================================

DO $$
DECLARE
  job_id_exists BOOLEAN;
  attachments_exists BOOLEAN;
  has_unread_exists BOOLEAN;
  column_count INTEGER;
BEGIN
  RAISE NOTICE '📎 Verifying messages table columns...';

  -- Check if job_id column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'messages'
      AND column_name = 'job_id'
  ) INTO job_id_exists;

  IF job_id_exists THEN
    RAISE NOTICE '  ✅ messages.job_id column added';
  ELSE
    RAISE WARNING '  ⚠️ messages.job_id column NOT found';
  END IF;

  -- Check if attachments column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'messages'
      AND column_name = 'attachments'
  ) INTO attachments_exists;

  IF attachments_exists THEN
    RAISE NOTICE '  ✅ messages.attachments column added';
  ELSE
    RAISE WARNING '  ⚠️ messages.attachments column NOT found';
  END IF;

  -- Check if has_unread_replies column exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_name = 'messages'
      AND column_name = 'has_unread_replies'
  ) INTO has_unread_exists;

  IF has_unread_exists THEN
    RAISE NOTICE '  ✅ messages.has_unread_replies column added';
  ELSE
    RAISE WARNING '  ⚠️ messages.has_unread_replies column NOT found';
  END IF;

  -- Count total columns in messages table
  SELECT COUNT(*) INTO column_count
  FROM information_schema.columns
  WHERE table_name = 'messages';

  RAISE NOTICE '  📊 Total columns in messages table: %', column_count;
  RAISE NOTICE '';

  IF job_id_exists AND attachments_exists AND has_unread_exists THEN
    RAISE NOTICE '✅ Messages table migration complete!';
    RAISE NOTICE '🎯 You can now send messages with file attachments';
    RAISE NOTICE '🔗 Messages can be linked to specific appointments';
  ELSE
    RAISE WARNING '⚠️ Some columns are missing - please check the output above';
  END IF;
END $$;
