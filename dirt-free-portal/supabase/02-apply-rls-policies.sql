-- =====================================================
-- CUSTOMER PORTAL - ROW LEVEL SECURITY POLICIES
-- Run this SECOND (after creating tables)
-- =====================================================

-- =====================================================
-- ENABLE RLS ON ALL PORTAL TABLES
-- =====================================================

ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- DROP EXISTING POLICIES (if any)
-- =====================================================

-- Customers
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
DROP POLICY IF EXISTS "Customers can update own data" ON customers;

-- Jobs
DROP POLICY IF EXISTS "Customers can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Customers can create jobs" ON jobs;
DROP POLICY IF EXISTS "Customers can update own jobs" ON jobs;

-- Invoices
DROP POLICY IF EXISTS "Customers can view own invoices" ON invoices;

-- Loyalty Points
DROP POLICY IF EXISTS "Customers can view own loyalty" ON loyalty_points;

-- Loyalty Transactions
DROP POLICY IF EXISTS "Customers can view own transactions" ON loyalty_transactions;

-- Messages
DROP POLICY IF EXISTS "Customers can view own messages" ON messages;
DROP POLICY IF EXISTS "Customers can create messages" ON messages;

-- Message Replies
DROP POLICY IF EXISTS "Customers can view message replies" ON message_replies;
DROP POLICY IF EXISTS "Customers can create replies" ON message_replies;

-- Rewards
DROP POLICY IF EXISTS "Everyone can view active rewards" ON rewards;

-- Reward Redemptions
DROP POLICY IF EXISTS "Customers can view own redemptions" ON reward_redemptions;

-- Referrals
DROP POLICY IF EXISTS "Customers can view own referrals" ON referrals;
DROP POLICY IF EXISTS "Customers can view referrals they created" ON referrals;

-- =====================================================
-- CUSTOMERS TABLE POLICIES
-- =====================================================

CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  USING (auth.email() = email);

CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE
  USING (auth.email() = email)
  WITH CHECK (auth.email() = email);

-- =====================================================
-- JOBS TABLE POLICIES
-- =====================================================

CREATE POLICY "Customers can view own jobs"
  ON jobs FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

CREATE POLICY "Customers can create jobs"
  ON jobs FOR INSERT
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

CREATE POLICY "Customers can update own jobs"
  ON jobs FOR UPDATE
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

-- =====================================================
-- INVOICES TABLE POLICIES
-- =====================================================

CREATE POLICY "Customers can view own invoices"
  ON invoices FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- =====================================================
-- LOYALTY POINTS TABLE POLICIES
-- =====================================================

CREATE POLICY "Customers can view own loyalty"
  ON loyalty_points FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- =====================================================
-- LOYALTY TRANSACTIONS TABLE POLICIES
-- =====================================================

CREATE POLICY "Customers can view own transactions"
  ON loyalty_transactions FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- =====================================================
-- MESSAGES TABLE POLICIES
-- =====================================================

CREATE POLICY "Customers can view own messages"
  ON messages FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

CREATE POLICY "Customers can create messages"
  ON messages FOR INSERT
  WITH CHECK (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

CREATE POLICY "Customers can update own messages"
  ON messages FOR UPDATE
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

-- =====================================================
-- MESSAGE REPLIES TABLE POLICIES
-- =====================================================

CREATE POLICY "Customers can view message replies"
  ON message_replies FOR SELECT
  USING (
    message_id IN (
      SELECT id FROM messages
      WHERE customer_id IN (
        SELECT id FROM customers WHERE email = auth.email()
      )
    )
  );

CREATE POLICY "Customers can create replies"
  ON message_replies FOR INSERT
  WITH CHECK (
    message_id IN (
      SELECT id FROM messages
      WHERE customer_id IN (
        SELECT id FROM customers WHERE email = auth.email()
      )
    )
  );

-- =====================================================
-- REWARDS TABLE POLICIES
-- =====================================================

CREATE POLICY "Everyone can view active rewards"
  ON rewards FOR SELECT
  USING (active = true);

-- =====================================================
-- REWARD REDEMPTIONS TABLE POLICIES
-- =====================================================

CREATE POLICY "Customers can view own redemptions"
  ON reward_redemptions FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- =====================================================
-- REFERRALS TABLE POLICIES
-- =====================================================

CREATE POLICY "Customers can view referrals they created"
  ON referrals FOR SELECT
  USING (
    referring_customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

CREATE POLICY "Customers can create referrals"
  ON referrals FOR INSERT
  WITH CHECK (
    referring_customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- =====================================================
-- PERFORMANCE INDEXES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);

-- =====================================================
-- VERIFY RLS IS ENABLED
-- =====================================================

DO $$
DECLARE
  table_name TEXT;
  rls_enabled BOOLEAN;
BEGIN
  RAISE NOTICE '🔒 Verifying RLS is enabled on all tables...';
  
  FOR table_name IN 
    SELECT tablename FROM pg_tables 
    WHERE schemaname = 'public' 
    AND tablename IN ('customers', 'jobs', 'invoices', 'loyalty_points', 'loyalty_transactions', 'messages', 'message_replies', 'rewards', 'reward_redemptions', 'referrals')
  LOOP
    SELECT relrowsecurity INTO rls_enabled
    FROM pg_class
    WHERE relname = table_name;
    
    IF rls_enabled THEN
      RAISE NOTICE '  ✅ % - RLS enabled', table_name;
    ELSE
      RAISE WARNING '  ⚠️ % - RLS NOT enabled', table_name;
    END IF;
  END LOOP;
  
  RAISE NOTICE '✅ RLS policies applied successfully!';
  RAISE NOTICE '🔐 Customer data is now secured';
END $$;
