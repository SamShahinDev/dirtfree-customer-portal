# Supabase Database Setup for Customer Portal

## 📋 Overview

This directory contains SQL migration scripts to set up the database for the Dirt Free Customer Portal. These scripts add the missing tables needed for the portal features (loyalty program, messaging, rewards, etc.) and apply Row Level Security (RLS) policies to protect customer data.

---

## 🚀 Quick Start

### Step 1: Create Missing Tables
1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your **dirtFreeCarpet** project
3. Navigate to **SQL Editor**
4. Click **New Query**
5. Copy and paste contents of `01-create-portal-tables.sql`
6. Click **Run** or press `Ctrl/Cmd + Enter`

**Expected Output:**
```
✅ Customer Portal tables created successfully!
📊 Tables created: loyalty_points, loyalty_transactions, rewards, reward_redemptions, messages, message_replies, referrals
```

---

### Step 2: Apply Security Policies
1. Still in **SQL Editor**
2. Click **New Query**
3. Copy and paste contents of `02-apply-rls-policies.sql`
4. Click **Run**

**Expected Output:**
```
🔒 Verifying RLS is enabled on all tables...
  ✅ customers - RLS enabled
  ✅ jobs - RLS enabled
  ✅ invoices - RLS enabled
  ... (all tables)
✅ RLS policies applied successfully!
🔐 Customer data is now secured
```

---

## 📁 Files Explained

### `01-create-portal-tables.sql` (Run First)
Creates these new tables:
- ✅ `loyalty_points` - Customer points balance
- ✅ `loyalty_transactions` - Points history
- ✅ `rewards` - Rewards catalog  
- ✅ `reward_redemptions` - Redeemed rewards
- ✅ `messages` - Customer support messages
- ✅ `message_replies` - Message threads
- ✅ `referrals` - Referral program tracking

Also includes:
- Performance indexes
- Updated_at triggers
- Sample rewards data

### `02-apply-rls-policies.sql` (Run Second)
Applies Row Level Security to:
- ✅ All existing CRM tables (customers, jobs, invoices)
- ✅ All new portal tables

**Key Security Rules:**
- Customers can **only** view/edit their own data
- Customers **cannot** access other customers' data
- Staff/admin access requires CRM authentication (separate)
- Active rewards are public (visible to all customers)

### `policies.sql` (Legacy - Deprecated)
⚠️ **Don't use this file** - it was the original combined script that caused the error. Use the numbered scripts instead.

---

## 🔍 Verify Installation

### Check Tables Were Created
```sql
-- Run in SQL Editor
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
  'loyalty_points', 
  'loyalty_transactions', 
  'rewards', 
  'reward_redemptions', 
  'messages', 
  'message_replies',
  'referrals'
)
ORDER BY table_name;
```

**Expected:** 7 rows showing all the new tables.

---

### Check RLS Policies Are Active
```sql
-- Run in SQL Editor
SELECT 
  schemaname, 
  tablename, 
  policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
ORDER BY tablename, policyname;
```

**Expected:** ~20 policies across all portal tables.

---

### Test Customer Access (Optional)
```sql
-- Check if a test customer can access their data
-- Replace with your test customer email
SELECT * FROM customers WHERE email = 'test@customer.com';

-- This should work (returns customer's jobs)
SET request.jwt.claim.email = 'test@customer.com';
SELECT * FROM jobs WHERE customer_id = (SELECT id FROM customers WHERE email = 'test@customer.com');
```

---

## 🎯 What's Protected?

### Customer Data (Secured by RLS)
| Table | Customer Can View | Customer Can Create | Customer Can Update |
|-------|-------------------|---------------------|---------------------|
| `customers` | ✅ Own profile only | ❌ | ✅ Own profile only |
| `jobs` | ✅ Own jobs only | ✅ | ✅ Own jobs only |
| `invoices` | ✅ Own invoices only | ❌ | ❌ |
| `loyalty_points` | ✅ Own points only | ❌ | ❌ |
| `loyalty_transactions` | ✅ Own history only | ❌ | ❌ |
| `messages` | ✅ Own messages only | ✅ | ✅ Own messages only |
| `message_replies` | ✅ Own threads only | ✅ | ❌ |
| `rewards` | ✅ All active rewards | ❌ | ❌ |
| `reward_redemptions` | ✅ Own redemptions only | ❌ | ❌ |
| `referrals` | ✅ Own referrals only | ✅ | ❌ |

---

## 🛠️ Troubleshooting

### Error: "relation [table] does not exist"
**Solution:** You need to run `01-create-portal-tables.sql` first.

### Error: "policy already exists"
**Solution:** The script handles this automatically with `DROP POLICY IF EXISTS`. Just re-run it.

### No data showing in portal
**Possible causes:**
1. RLS policies are too restrictive
2. Customer email doesn't match auth email
3. No data exists for that customer

**Debug:**
```sql
-- Check if RLS is enabled
SELECT relname, relrowsecurity 
FROM pg_class 
WHERE relname IN ('customers', 'jobs', 'invoices');

-- Check customer exists
SELECT * FROM customers WHERE email = 'customer@email.com';

-- Temporarily disable RLS to test (DANGER - only for testing!)
ALTER TABLE customers DISABLE ROW LEVEL SECURITY;
SELECT * FROM customers;
ALTER TABLE customers ENABLE ROW LEVEL SECURITY;
```

### Performance Issues
The scripts include indexes, but if you have large datasets:
```sql
-- Analyze tables to update statistics
ANALYZE customers;
ANALYZE jobs;
ANALYZE loyalty_points;
ANALYZE messages;
```

---

## 🔐 Security Notes

1. **Never run these scripts in production** without testing in development first
2. **Always backup** before running migrations
3. **RLS policies are critical** - they prevent data breaches
4. **Service role key** bypasses RLS - keep it secret!
5. **Test thoroughly** with a test customer account

---

## 📚 Additional Resources

- [Supabase RLS Documentation](https://supabase.com/docs/guides/auth/row-level-security)
- [PostgreSQL RLS Policies](https://www.postgresql.org/docs/current/ddl-rowsecurity.html)
- [Supabase SQL Editor](https://supabase.com/docs/guides/database/overview)

---

## 🆘 Need Help?

If you encounter issues:
1. Check the Supabase logs: Dashboard → Database → Logs
2. Review error messages carefully
3. Try running scripts one section at a time
4. Check that your Supabase project is on a paid plan (RLS requires it)

---

**Last Updated:** January 2025  
**Version:** 1.0.0  
**Compatible with:** Supabase PostgreSQL 15+
