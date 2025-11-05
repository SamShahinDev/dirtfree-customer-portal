-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_replies ENABLE ROW LEVEL SECURITY;
ALTER TABLE rewards ENABLE ROW LEVEL SECURITY;
ALTER TABLE reward_redemptions ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Customers can view own data" ON customers;
DROP POLICY IF EXISTS "Customers can update own data" ON customers;
DROP POLICY IF EXISTS "Customers can view own jobs" ON jobs;
DROP POLICY IF EXISTS "Customers can create jobs" ON jobs;
DROP POLICY IF EXISTS "Customers can update own jobs" ON jobs;
DROP POLICY IF EXISTS "Customers can view own invoices" ON invoices;
DROP POLICY IF EXISTS "Customers can view own loyalty" ON loyalty_points;
DROP POLICY IF EXISTS "Customers can view own transactions" ON loyalty_transactions;
DROP POLICY IF EXISTS "Customers can view own messages" ON messages;
DROP POLICY IF EXISTS "Customers can create messages" ON messages;
DROP POLICY IF EXISTS "Customers can view message replies" ON message_replies;
DROP POLICY IF EXISTS "Customers can create replies" ON message_replies;
DROP POLICY IF EXISTS "Everyone can view active rewards" ON rewards;
DROP POLICY IF EXISTS "Customers can view own redemptions" ON reward_redemptions;

-- Customers Table Policies
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  USING (auth.email() = email);

CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE
  USING (auth.email() = email);

-- Jobs Table Policies
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

-- Invoices Table Policies
CREATE POLICY "Customers can view own invoices"
  ON invoices FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Loyalty Points Table Policies
CREATE POLICY "Customers can view own loyalty"
  ON loyalty_points FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Loyalty Transactions Table Policies
CREATE POLICY "Customers can view own transactions"
  ON loyalty_transactions FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Messages Table Policies
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

-- Message Replies Table Policies
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

-- Rewards Table Policies
CREATE POLICY "Everyone can view active rewards"
  ON rewards FOR SELECT
  USING (active = true);

-- Reward Redemptions Table Policies
CREATE POLICY "Customers can view own redemptions"
  ON reward_redemptions FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_email ON customers(email);
CREATE INDEX IF NOT EXISTS idx_jobs_customer_id ON jobs(customer_id);
CREATE INDEX IF NOT EXISTS idx_jobs_scheduled_date ON jobs(scheduled_date);
CREATE INDEX IF NOT EXISTS idx_invoices_customer_id ON invoices(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);
