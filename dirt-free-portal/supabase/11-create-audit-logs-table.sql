-- =====================================================
-- AUDIT LOGS TABLE
-- Tracks sensitive operations and user actions for compliance
-- =====================================================

-- 1. CREATE AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success' CHECK (status IN ('success', 'failure', 'pending')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Add comments for documentation
COMMENT ON TABLE audit_logs IS 'Audit trail of sensitive operations and user actions';
COMMENT ON COLUMN audit_logs.user_id IS 'Customer who performed the action (null for system actions)';
COMMENT ON COLUMN audit_logs.action IS 'Action performed (e.g., payment_completed, invoice_viewed, reward_redeemed)';
COMMENT ON COLUMN audit_logs.resource_type IS 'Type of resource affected (e.g., invoice, payment, reward)';
COMMENT ON COLUMN audit_logs.resource_id IS 'ID of the affected resource';
COMMENT ON COLUMN audit_logs.details IS 'Additional context as JSON (e.g., amount, payment method)';
COMMENT ON COLUMN audit_logs.ip_address IS 'IP address of the request';
COMMENT ON COLUMN audit_logs.user_agent IS 'Browser/client user agent string';
COMMENT ON COLUMN audit_logs.status IS 'Whether the action succeeded or failed';

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

-- Index for querying by user
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_id
  ON audit_logs(user_id)
  WHERE user_id IS NOT NULL;

-- Index for querying by action
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
  ON audit_logs(action);

-- Index for querying by resource
CREATE INDEX IF NOT EXISTS idx_audit_logs_resource
  ON audit_logs(resource_type, resource_id)
  WHERE resource_type IS NOT NULL AND resource_id IS NOT NULL;

-- Index for time-based queries (most recent first)
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
  ON audit_logs(created_at DESC);

-- Composite index for user + time queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
  ON audit_logs(user_id, created_at DESC)
  WHERE user_id IS NOT NULL;

-- Index for failed actions (security monitoring)
CREATE INDEX IF NOT EXISTS idx_audit_logs_failures
  ON audit_logs(created_at DESC)
  WHERE status = 'failure';

-- GIN index for JSONB details searching
CREATE INDEX IF NOT EXISTS idx_audit_logs_details
  ON audit_logs USING GIN (details);

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Customers can view their own audit logs
CREATE POLICY "Customers can view own audit logs"
  ON audit_logs FOR SELECT
  USING (
    user_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Service role can insert audit logs
CREATE POLICY "Service role can insert audit logs"
  ON audit_logs FOR INSERT
  WITH CHECK (true);

-- Service role can view all audit logs (for admin dashboard)
CREATE POLICY "Service role can view all audit logs"
  ON audit_logs FOR SELECT
  USING (true);

-- =====================================================
-- AUDIT LOG CLEANUP/RETENTION
-- =====================================================

-- Function to delete old audit logs (retention policy)
CREATE OR REPLACE FUNCTION cleanup_old_audit_logs(retention_days INTEGER DEFAULT 365)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
  cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  cutoff_date := NOW() - (retention_days || ' days')::INTERVAL;

  DELETE FROM audit_logs
  WHERE created_at < cutoff_date;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;

  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION cleanup_old_audit_logs IS 'Delete audit logs older than specified days (default: 365)';

-- =====================================================
-- HELPER FUNCTIONS FOR AUDIT QUERIES
-- =====================================================

-- Function to get audit log summary for a user
CREATE OR REPLACE FUNCTION get_user_audit_summary(
  p_user_id UUID,
  p_days_back INTEGER DEFAULT 30
)
RETURNS TABLE (
  action VARCHAR(100),
  action_count BIGINT,
  last_occurred TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.action,
    COUNT(*)::BIGINT AS action_count,
    MAX(a.created_at) AS last_occurred
  FROM audit_logs a
  WHERE a.user_id = p_user_id
    AND a.created_at >= NOW() - (p_days_back || ' days')::INTERVAL
  GROUP BY a.action
  ORDER BY action_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_user_audit_summary IS 'Get summary of actions performed by a user in last N days';

-- Function to get recent failed actions (security monitoring)
CREATE OR REPLACE FUNCTION get_recent_failed_actions(
  p_limit INTEGER DEFAULT 100
)
RETURNS TABLE (
  id UUID,
  user_id UUID,
  action VARCHAR(100),
  ip_address INET,
  details JSONB,
  created_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    a.id,
    a.user_id,
    a.action,
    a.ip_address,
    a.details,
    a.created_at
  FROM audit_logs a
  WHERE a.status = 'failure'
  ORDER BY a.created_at DESC
  LIMIT p_limit;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION get_recent_failed_actions IS 'Get recent failed actions for security monitoring';

-- =====================================================
-- COMMON AUDIT ACTIONS (For Reference)
-- =====================================================

/*
  Payment Actions:
  - payment_intent_created
  - payment_completed
  - payment_failed
  - refund_issued

  Invoice Actions:
  - invoice_viewed
  - invoice_downloaded
  - invoice_paid
  - invoice_updated

  Account Actions:
  - login_success
  - login_failed
  - logout
  - password_changed
  - email_changed
  - profile_updated

  Payment Method Actions:
  - payment_method_added
  - payment_method_removed
  - payment_method_set_default

  Reward Actions:
  - reward_redeemed
  - reward_cancelled
  - loyalty_points_earned
  - loyalty_points_spent

  Booking Actions:
  - appointment_booked
  - appointment_cancelled
  - appointment_rescheduled

  Message Actions:
  - message_sent
  - message_viewed
  - message_reply_sent

  Document Actions:
  - document_uploaded
  - document_downloaded
  - document_viewed
  - document_deleted
*/

-- =====================================================
-- SAMPLE QUERIES (For Reference)
-- =====================================================

/*
-- Get all payment-related actions for a customer
SELECT * FROM audit_logs
WHERE user_id = 'customer-uuid'
  AND action LIKE 'payment_%'
ORDER BY created_at DESC;

-- Get all failed login attempts in last 24 hours
SELECT * FROM audit_logs
WHERE action = 'login_failed'
  AND created_at >= NOW() - INTERVAL '24 hours'
ORDER BY created_at DESC;

-- Get audit summary for a user
SELECT * FROM get_user_audit_summary('customer-uuid', 30);

-- Get recent security failures
SELECT * FROM get_recent_failed_actions(50);

-- Clean up logs older than 2 years
SELECT cleanup_old_audit_logs(730);

-- Search audit logs by details (using JSONB)
SELECT * FROM audit_logs
WHERE details @> '{"amount": 185.00}'::JSONB;
*/

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Audit logs table created successfully!';
  RAISE NOTICE '📊 Table: audit_logs';
  RAISE NOTICE '🔒 RLS policies applied for customer access';
  RAISE NOTICE '📈 Performance indexes created';
  RAISE NOTICE '🔧 Helper functions: get_user_audit_summary(), get_recent_failed_actions(), cleanup_old_audit_logs()';
  RAISE NOTICE '⏰ Default retention: 365 days (configurable)';
  RAISE NOTICE '';
  RAISE NOTICE 'ℹ️  To apply this migration:';
  RAISE NOTICE '   psql -h <host> -U postgres -d postgres -f supabase/11-create-audit-logs-table.sql';
END $$;
