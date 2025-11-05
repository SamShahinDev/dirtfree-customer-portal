-- =====================================================
-- NOTIFICATIONS SYSTEM
-- Creates comprehensive notification system with persistent storage
-- Run this to enable notification history and notification center
-- =====================================================

-- =====================================================
-- 1. CREATE NOTIFICATIONS TABLE
-- =====================================================

CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID REFERENCES customers(id) ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  action_url TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_notifications_customer_id ON notifications(customer_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_read ON notifications(read);
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);
CREATE INDEX IF NOT EXISTS idx_notifications_customer_unread ON notifications(customer_id, read) WHERE read = FALSE;

-- Add comments
COMMENT ON TABLE notifications IS 'Persistent notification storage for customer portal';
COMMENT ON COLUMN notifications.type IS 'Notification type: appointment_confirmed, appointment_reminder, appointment_cancelled, message_reply, invoice_created, payment_received, loyalty_points_earned, reward_available, maintenance_due';
COMMENT ON COLUMN notifications.metadata IS 'Additional data specific to notification type (e.g., job_id, message_id, invoice_id)';
COMMENT ON COLUMN notifications.action_url IS 'Optional URL for notification action (e.g., /dashboard/jobs/123)';

-- =====================================================
-- 2. ENABLE RLS ON NOTIFICATIONS TABLE
-- =====================================================

ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if any
DROP POLICY IF EXISTS "Customers can view own notifications" ON notifications;
DROP POLICY IF EXISTS "Customers can update own notifications" ON notifications;
DROP POLICY IF EXISTS "Customers can insert own notifications" ON notifications;

-- Allow customers to view their own notifications
CREATE POLICY "Customers can view own notifications"
ON notifications FOR SELECT
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = auth.email()
  )
);

-- Allow customers to mark their own notifications as read
CREATE POLICY "Customers can update own notifications"
ON notifications FOR UPDATE
TO authenticated
USING (
  customer_id IN (
    SELECT id FROM customers WHERE email = auth.email()
  )
)
WITH CHECK (
  customer_id IN (
    SELECT id FROM customers WHERE email = auth.email()
  )
);

-- Allow system to insert notifications (will be used by server-side functions)
CREATE POLICY "Customers can insert own notifications"
ON notifications FOR INSERT
TO authenticated
WITH CHECK (
  customer_id IN (
    SELECT id FROM customers WHERE email = auth.email()
  )
);

-- =====================================================
-- 3. CREATE HELPER FUNCTIONS
-- =====================================================

-- Function to get unread notification count for a customer
CREATE OR REPLACE FUNCTION get_unread_notification_count(cust_id UUID)
RETURNS INTEGER AS $$
  SELECT COUNT(*)::INTEGER
  FROM notifications
  WHERE customer_id = cust_id AND read = FALSE;
$$ LANGUAGE SQL STABLE;

-- Function to mark all notifications as read for a customer
CREATE OR REPLACE FUNCTION mark_all_notifications_read(cust_id UUID)
RETURNS INTEGER AS $$
  UPDATE notifications
  SET read = TRUE
  WHERE customer_id = cust_id AND read = FALSE
  RETURNING 1;
$$ LANGUAGE SQL VOLATILE;

-- Function to mark a single notification as read
CREATE OR REPLACE FUNCTION mark_notification_read(notif_id UUID)
RETURNS BOOLEAN AS $$
  UPDATE notifications
  SET read = TRUE
  WHERE id = notif_id AND read = FALSE
  RETURNING TRUE;
$$ LANGUAGE SQL VOLATILE;

-- Function to delete old read notifications (cleanup)
CREATE OR REPLACE FUNCTION cleanup_old_notifications(days_old INTEGER DEFAULT 30)
RETURNS INTEGER AS $$
  DELETE FROM notifications
  WHERE read = TRUE
    AND created_at < NOW() - (days_old || ' days')::INTERVAL
  RETURNING 1;
$$ LANGUAGE SQL VOLATILE;

-- =====================================================
-- 4. CREATE NOTIFICATION VIEWS
-- =====================================================

-- View for recent unread notifications
CREATE OR REPLACE VIEW recent_unread_notifications AS
SELECT
  n.id,
  n.customer_id,
  n.type,
  n.title,
  n.message,
  n.action_url,
  n.metadata,
  n.created_at,
  c.name as customer_name,
  c.email as customer_email
FROM notifications n
JOIN customers c ON n.customer_id = c.id
WHERE n.read = FALSE
ORDER BY n.created_at DESC;

-- Add comment
COMMENT ON VIEW recent_unread_notifications IS 'All unread notifications with customer info';

-- View for notification statistics by type
CREATE OR REPLACE VIEW notification_stats AS
SELECT
  type,
  COUNT(*) as total_count,
  SUM(CASE WHEN read = TRUE THEN 1 ELSE 0 END) as read_count,
  SUM(CASE WHEN read = FALSE THEN 1 ELSE 0 END) as unread_count,
  MAX(created_at) as latest_notification
FROM notifications
GROUP BY type
ORDER BY total_count DESC;

COMMENT ON VIEW notification_stats IS 'Notification statistics by type';

-- =====================================================
-- 5. VERIFICATION
-- =====================================================

DO $$
DECLARE
  table_exists BOOLEAN;
  policy_count INTEGER;
  function_count INTEGER;
  index_count INTEGER;
BEGIN
  RAISE NOTICE '🔔 Verifying notifications system setup...';

  -- Check if table exists
  SELECT EXISTS (
    SELECT 1
    FROM information_schema.tables
    WHERE table_name = 'notifications'
  ) INTO table_exists;

  IF table_exists THEN
    RAISE NOTICE '  ✅ notifications table created';
  ELSE
    RAISE WARNING '  ⚠️ notifications table NOT found';
  END IF;

  -- Check policies
  SELECT COUNT(*) INTO policy_count
  FROM pg_policies
  WHERE tablename = 'notifications';

  RAISE NOTICE '  ✅ notifications RLS policies: %', policy_count;

  -- Check functions
  SELECT COUNT(*) INTO function_count
  FROM pg_proc
  WHERE proname LIKE '%notification%';

  RAISE NOTICE '  ✅ Helper functions created: %', function_count;

  -- Check indexes
  SELECT COUNT(*) INTO index_count
  FROM pg_indexes
  WHERE tablename = 'notifications';

  RAISE NOTICE '  ✅ Indexes created: %', index_count;

  RAISE NOTICE '';
  RAISE NOTICE '✅ Notifications system configured!';
  RAISE NOTICE '🔔 Persistent notification storage is now active';
  RAISE NOTICE '📊 Use get_unread_notification_count(customer_id) to get unread counts';
  RAISE NOTICE '🔒 RLS policies applied for customer access';
  RAISE NOTICE '🧹 Use cleanup_old_notifications(30) to clean up old read notifications';
END $$;
