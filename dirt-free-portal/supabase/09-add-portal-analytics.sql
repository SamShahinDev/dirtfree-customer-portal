-- =====================================================
-- PORTAL ANALYTICS TABLES
-- Adds tracking for portal usage and user behavior analytics
-- =====================================================

-- 1. PORTAL SESSIONS TABLE
-- Tracks customer login activity for engagement metrics
CREATE TABLE IF NOT EXISTS portal_sessions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  login_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  logout_at TIMESTAMP WITH TIME ZONE,
  session_duration INTEGER, -- in minutes
  ip_address INET,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_portal_sessions_customer_id ON portal_sessions(customer_id);
CREATE INDEX IF NOT EXISTS idx_portal_sessions_login_at ON portal_sessions(login_at DESC);

-- 2. ADD BOOKING SOURCE TRACKING TO JOBS TABLE
-- Track whether job was booked via portal or CRM
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS booked_via_portal BOOLEAN DEFAULT false;

-- Create index for analytics queries
CREATE INDEX IF NOT EXISTS idx_jobs_booked_via_portal ON jobs(booked_via_portal) WHERE booked_via_portal = true;
CREATE INDEX IF NOT EXISTS idx_jobs_created_at ON jobs(created_at DESC);

-- 3. ADD PORTAL-SPECIFIC METADATA TO JOBS
-- Optional: Track when jobs were created through the portal
ALTER TABLE jobs
ADD COLUMN IF NOT EXISTS portal_created_at TIMESTAMP WITH TIME ZONE;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES
-- =====================================================

-- Enable RLS on portal_sessions table
ALTER TABLE portal_sessions ENABLE ROW LEVEL SECURITY;

-- Customers can only see their own sessions
CREATE POLICY "Customers can view own portal sessions"
  ON portal_sessions FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Allow service role to insert session records
CREATE POLICY "Service role can insert portal sessions"
  ON portal_sessions FOR INSERT
  WITH CHECK (true);

-- Allow service role to update session records (for logout tracking)
CREATE POLICY "Service role can update portal sessions"
  ON portal_sessions FOR UPDATE
  USING (true);

-- =====================================================
-- HELPER FUNCTIONS FOR ANALYTICS
-- =====================================================

-- Function to get portal adoption rate
CREATE OR REPLACE FUNCTION get_portal_adoption_rate()
RETURNS TABLE (
  total_customers BIGINT,
  active_customers BIGINT,
  adoption_rate NUMERIC
) AS $$
DECLARE
  v_total_customers BIGINT;
  v_active_customers BIGINT;
  v_thirty_days_ago TIMESTAMP WITH TIME ZONE;
BEGIN
  v_thirty_days_ago := NOW() - INTERVAL '30 days';

  SELECT COUNT(*) INTO v_total_customers FROM customers;

  SELECT COUNT(DISTINCT customer_id) INTO v_active_customers
  FROM portal_sessions
  WHERE login_at >= v_thirty_days_ago;

  RETURN QUERY
  SELECT
    v_total_customers,
    v_active_customers,
    CASE
      WHEN v_total_customers > 0
      THEN ROUND((v_active_customers::NUMERIC / v_total_customers::NUMERIC) * 100, 2)
      ELSE 0
    END AS adoption_rate;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get online booking stats
CREATE OR REPLACE FUNCTION get_online_booking_stats(days_back INTEGER DEFAULT 30)
RETURNS TABLE (
  online_bookings BIGINT,
  total_bookings BIGINT,
  online_percentage NUMERIC
) AS $$
DECLARE
  v_online_bookings BIGINT;
  v_total_bookings BIGINT;
  v_cutoff_date TIMESTAMP WITH TIME ZONE;
BEGIN
  v_cutoff_date := NOW() - (days_back || ' days')::INTERVAL;

  SELECT COUNT(*) INTO v_online_bookings
  FROM jobs
  WHERE created_at >= v_cutoff_date
    AND booked_via_portal = true;

  SELECT COUNT(*) INTO v_total_bookings
  FROM jobs
  WHERE created_at >= v_cutoff_date;

  RETURN QUERY
  SELECT
    v_online_bookings,
    v_total_bookings,
    CASE
      WHEN v_total_bookings > 0
      THEN ROUND((v_online_bookings::NUMERIC / v_total_bookings::NUMERIC) * 100, 2)
      ELSE 0
    END AS online_percentage;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Portal analytics tables created successfully!';
  RAISE NOTICE '📊 New table: portal_sessions';
  RAISE NOTICE '🎯 Updated table: jobs (added booked_via_portal column)';
  RAISE NOTICE '🔧 Helper functions: get_portal_adoption_rate(), get_online_booking_stats()';
END $$;
