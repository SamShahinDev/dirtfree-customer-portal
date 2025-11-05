-- =====================================================
-- CREATE TEST CUSTOMER DATA
-- Run this in Supabase SQL Editor to create test data
-- =====================================================

-- Note: You need to create the auth user first through Supabase Dashboard
-- Or use this SQL if you have service role access:

-- Step 1: Insert test customer (use an email you can access for testing)
-- IMPORTANT: Replace 'test@example.com' with your actual test email
INSERT INTO customers (
  name,
  email,
  phone_e164,
  address_line1,
  address_line2,
  city,
  state,
  postal_code,
  zone,
  notes
) VALUES (
  'John Doe',
  'test@example.com',  -- CHANGE THIS to your test email
  '+17137302782',
  '123 Main Street',
  'Apt 4B',
  'Houston',
  'TX',
  '77001',
  'Central',
  'Test customer for portal development'
)
ON CONFLICT (email) DO UPDATE SET
  name = EXCLUDED.name,
  updated_at = NOW();

-- Step 2: Create loyalty points for the test customer
INSERT INTO loyalty_points (
  customer_id,
  points,
  total_earned,
  total_redeemed
)
SELECT
  id,
  500,
  500,
  0
FROM customers
WHERE email = 'test@example.com'  -- CHANGE THIS to match your test email
ON CONFLICT (customer_id) DO UPDATE SET
  points = EXCLUDED.points,
  updated_at = NOW();

-- Step 3: Create a sample completed job for the test customer
INSERT INTO jobs (
  customer_id,
  zone,
  status,
  scheduled_date,
  scheduled_time_start,
  scheduled_time_end,
  description
)
SELECT
  id,
  'Central',
  'completed',
  CURRENT_DATE - INTERVAL '30 days',
  '09:00:00',
  '11:00:00',
  'Carpet cleaning - 3 rooms'
FROM customers
WHERE email = 'test@example.com'  -- CHANGE THIS to match your test email
RETURNING *;

-- Verify the data was created
SELECT
  c.id,
  c.name,
  c.email,
  c.city,
  c.state,
  lp.points as loyalty_points,
  COUNT(j.id) as total_jobs
FROM customers c
LEFT JOIN loyalty_points lp ON lp.customer_id = c.id
LEFT JOIN jobs j ON j.customer_id = c.id
WHERE c.email = 'test@example.com'  -- CHANGE THIS to match your test email
GROUP BY c.id, c.name, c.email, c.city, c.state, lp.points;

-- =====================================================
-- NEXT STEPS:
-- =====================================================
-- 1. Go to Supabase Dashboard > Authentication > Users
-- 2. Click "Add User" > "Create new user"
-- 3. Use the same email as above (test@example.com)
-- 4. Set a password you'll remember
-- 5. Confirm the user
-- 6. Now you can login to the portal with that email and password!
-- =====================================================
