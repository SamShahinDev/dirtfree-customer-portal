-- =====================================================
-- CUSTOMER PORTAL - MISSING TABLES MIGRATION
-- Run this FIRST before applying RLS policies
-- =====================================================

-- 1. LOYALTY POINTS TABLE
-- Tracks customer loyalty points balance
CREATE TABLE IF NOT EXISTS loyalty_points (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  points INTEGER NOT NULL DEFAULT 0,
  total_earned INTEGER NOT NULL DEFAULT 0,
  total_redeemed INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(customer_id)
);

-- 2. LOYALTY TRANSACTIONS TABLE
-- Tracks history of points earned/spent
CREATE TABLE IF NOT EXISTS loyalty_transactions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  points INTEGER NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('earned', 'redeemed', 'expired', 'adjustment')),
  description TEXT NOT NULL,
  job_id UUID REFERENCES jobs(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. REWARDS TABLE
-- Catalog of available rewards customers can redeem
CREATE TABLE IF NOT EXISTS rewards (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name VARCHAR(255) NOT NULL,
  description TEXT,
  points_required INTEGER NOT NULL,
  type VARCHAR(50) NOT NULL CHECK (type IN ('discount', 'free_service', 'upgrade', 'gift_card')),
  value DECIMAL(10,2) NOT NULL,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. REWARD REDEMPTIONS TABLE
-- Tracks when customers redeem rewards
CREATE TABLE IF NOT EXISTS reward_redemptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  reward_id UUID NOT NULL REFERENCES rewards(id) ON DELETE RESTRICT,
  points_used INTEGER NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'redeemed', 'expired', 'cancelled')),
  redeemed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 5. MESSAGES TABLE
-- Customer support messages/tickets
CREATE TABLE IF NOT EXISTS messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  category VARCHAR(50) NOT NULL CHECK (category IN ('general', 'appointment', 'billing', 'service', 'feedback', 'complaint', 'other')),
  subject VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  status VARCHAR(20) NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'responded', 'closed')),
  priority VARCHAR(20) DEFAULT 'normal' CHECK (priority IN ('low', 'normal', 'high', 'urgent')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. MESSAGE REPLIES TABLE
-- Threaded conversation replies to messages
-- Note: staff_id is nullable UUID (no foreign key) since staff_users table may not exist yet
CREATE TABLE IF NOT EXISTS message_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  message_id UUID NOT NULL REFERENCES messages(id) ON DELETE CASCADE,
  customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  staff_id UUID,
  staff_name VARCHAR(255),
  message TEXT NOT NULL,
  is_staff_reply BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 7. REFERRALS TABLE (Bonus - for referral program)
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referring_customer_id UUID NOT NULL REFERENCES customers(id) ON DELETE CASCADE,
  referred_customer_id UUID REFERENCES customers(id) ON DELETE SET NULL,
  referred_email VARCHAR(255),
  referred_name VARCHAR(255),
  status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'signed_up', 'completed', 'expired')),
  points_awarded INTEGER DEFAULT 0,
  first_job_date TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  completed_at TIMESTAMP WITH TIME ZONE
);

-- =====================================================
-- CREATE INDEXES FOR PERFORMANCE
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_loyalty_points_customer_id ON loyalty_points(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_customer_id ON loyalty_transactions(customer_id);
CREATE INDEX IF NOT EXISTS idx_loyalty_transactions_created_at ON loyalty_transactions(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_rewards_active ON rewards(active) WHERE active = true;
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_customer_id ON reward_redemptions(customer_id);
CREATE INDEX IF NOT EXISTS idx_reward_redemptions_status ON reward_redemptions(status);
CREATE INDEX IF NOT EXISTS idx_messages_customer_id ON messages(customer_id);
CREATE INDEX IF NOT EXISTS idx_messages_status ON messages(status);
CREATE INDEX IF NOT EXISTS idx_messages_created_at ON messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_message_replies_message_id ON message_replies(message_id);
CREATE INDEX IF NOT EXISTS idx_message_replies_staff_id ON message_replies(staff_id) WHERE staff_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_referrals_referring_customer ON referrals(referring_customer_id);
CREATE INDEX IF NOT EXISTS idx_referrals_status ON referrals(status);

-- =====================================================
-- CREATE TRIGGERS FOR UPDATED_AT
-- =====================================================

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply trigger to tables
CREATE TRIGGER update_loyalty_points_updated_at
  BEFORE UPDATE ON loyalty_points
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_rewards_updated_at
  BEFORE UPDATE ON rewards
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_messages_updated_at
  BEFORE UPDATE ON messages
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- INSERT SAMPLE REWARDS (Optional)
-- =====================================================

INSERT INTO rewards (name, description, points_required, type, value, active) VALUES
  ('$10 Off Next Service', 'Get $10 off your next carpet cleaning service', 1000, 'discount', 10.00, true),
  ('$25 Off Next Service', 'Get $25 off your next carpet cleaning service', 2500, 'discount', 25.00, true),
  ('Free Room', 'Get one room cleaned for free (up to $50 value)', 5000, 'free_service', 50.00, true),
  ('$50 Off Next Service', 'Get $50 off your next carpet cleaning service', 5000, 'discount', 50.00, true),
  ('Free Upholstery Cleaning', 'Get one piece of upholstery cleaned free (up to $75 value)', 7500, 'free_service', 75.00, true),
  ('$100 Gift Card', 'Get a $100 gift card for future services', 10000, 'gift_card', 100.00, true)
ON CONFLICT DO NOTHING;

-- =====================================================
-- SUCCESS MESSAGE
-- =====================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Customer Portal tables created successfully!';
  RAISE NOTICE '📊 Tables created: loyalty_points, loyalty_transactions, rewards, reward_redemptions, messages, message_replies, referrals';
  RAISE NOTICE '🎯 Next step: Run 02-apply-rls-policies.sql to secure these tables';
END $$;
