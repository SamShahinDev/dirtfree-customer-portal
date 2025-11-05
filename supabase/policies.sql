-- Row Level Security Policies for Dirt Free Customer Portal
-- These policies ensure customers can only access their own data

-- Enable RLS on all tables
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
ALTER TABLE jobs ENABLE ROW LEVEL SECURITY;
ALTER TABLE invoices ENABLE ROW LEVEL SECURITY;
ALTER TABLE loyalty_points ENABLE ROW LEVEL SECURITY;
ALTER TABLE messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE message_replies ENABLE ROW LEVEL SECURITY;

-- Customers can only view/update their own data
CREATE POLICY "Customers can view own data"
  ON customers FOR SELECT
  USING (auth.email() = email);

CREATE POLICY "Customers can update own data"
  ON customers FOR UPDATE
  USING (auth.email() = email);

-- Jobs: Customers can view and create jobs
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

-- Invoices: Customers can view own invoices
CREATE POLICY "Customers can view own invoices"
  ON invoices FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Loyalty: Customers can view own loyalty points
CREATE POLICY "Customers can view own loyalty"
  ON loyalty_points FOR SELECT
  USING (
    customer_id IN (
      SELECT id FROM customers WHERE email = auth.email()
    )
  );

-- Messages: Customers can view/create own messages
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

-- Message replies: Customers can view/create replies
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
