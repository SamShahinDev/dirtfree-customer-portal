# Portal Account Linking

This document describes the account linking system that automatically connects website bookings to portal accounts when customers sign up later.

## Table of Contents

- [Overview](#overview)
- [Problem Statement](#problem-statement)
- [Solution](#solution)
- [Architecture](#architecture)
- [User Flows](#user-flows)
- [API Reference](#api-reference)
- [Components](#components)
- [Database Schema](#database-schema)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The account linking system ensures customers see their complete booking history even if they booked before creating a portal account. It automatically detects existing customer records and links them during signup or allows manual linking later.

### Key Features

- **Automatic Detection**: Finds existing customers by email/phone during signup
- **Manual Linking**: Banner prompts users to link after account creation
- **Complete History**: Shows all bookings (pre-portal and post-portal) in one place
- **Bonus Points**: Rewards customers for linking accounts
- **Audit Trail**: Logs all linking activities
- **Seamless UX**: Transparent to the customer

## Problem Statement

**Scenario:**
1. Customer books via website (no portal account yet)
2. Booking creates customer record in CRM
3. Customer later creates portal account
4. **Problem**: Can't see their previous booking

**Impact:**
- Poor customer experience
- Duplicate customer records
- Increased support calls
- Lost booking history

## Solution

### Automatic Linking During Signup

When creating a portal account, automatically check if customer exists in CRM:

```typescript
// On signup:
1. Check if email/phone matches existing customer
2. If match found:
   - Create auth account
   - Link to existing customer record
   - Show "Welcome back! Found X bookings"
3. If no match:
   - Create auth account
   - Create new customer record
   - Show "Account created!"
```

### Manual Linking After Signup

For users who signed up before linking was implemented:

```typescript
// After login:
1. Check if user can link to existing customer
2. Show banner: "Have you booked before?"
3. On click:
   - Link accounts
   - Show success message
   - Refresh to show history
```

## Architecture

### System Diagram

```
┌─────────────────────────────────────────┐
│        Website Booking                  │
│   (Customer has no portal account)      │
└──────────────┬──────────────────────────┘
               │
               ↓
┌─────────────────────────────────────────┐
│    Customer Record Created in CRM       │
│    email: john@example.com              │
│    portal_user_id: NULL                 │
└──────────────┬──────────────────────────┘
               │
               ↓ (Customer creates portal account)
┌─────────────────────────────────────────┐
│         Portal Signup                   │
│    Check for existing customer          │
└──────────────┬──────────────────────────┘
               │
               ↓
        ┌──────┴──────┐
        │             │
   [Found]       [Not Found]
        │             │
        ↓             ↓
┌──────────────┐  ┌──────────────┐
│ Link Account │  │ Create New   │
│   Customer   │  │   Customer   │
└──────────────┘  └──────────────┘
        │
        ↓
┌─────────────────────────────────────────┐
│    Customer sees complete history       │
│    • Previous bookings (linked)         │
│    • Future bookings                    │
│    • Bonus points awarded               │
└─────────────────────────────────────────┘
```

### Component Structure

```
Portal:
├── src/app/api/auth/link-account/
│   └── route.ts                    # Linking API endpoint
├── src/lib/auth/
│   └── signup.ts                   # Signup with auto-linking
├── src/components/dashboard/
│   └── AccountLinkingBanner.tsx    # Manual linking UI
└── src/app/(dashboard)/dashboard/history/
    └── page.tsx                    # Shows linked history
```

## User Flows

### Flow 1: New Customer (No Previous Bookings)

```
1. Customer fills signup form
2. System checks for existing record: NOT FOUND
3. Creates auth account + customer record
4. Awards 100 welcome points
5. Redirects to dashboard
```

**User sees:**
- "Account created! You earned 100 welcome bonus points."
- Empty booking history

### Flow 2: Returning Customer (Auto-Linked During Signup)

```
1. Customer fills signup form with same email used for booking
2. System checks for existing record: FOUND
3. Creates auth account
4. Links to existing customer record
5. Marks previous jobs as linked
6. Awards 50 linking bonus points
7. Redirects to dashboard
```

**User sees:**
- "Welcome back! We found 3 previous bookings and added them to your account. You earned 50 bonus points!"
- Previous bookings section with 3 bookings
- New "Portal Bookings" section (empty)

### Flow 3: Manual Linking After Signup

```
1. Customer logs in (account already created)
2. System checks for linkable customer: FOUND
3. Shows blue banner: "Have you booked with us before? We found 2 previous bookings"
4. Customer clicks "Link My Account"
5. System links accounts
6. Awards 50 linking bonus points
7. Page refreshes to show complete history
```

**User sees:**
- Blue banner with "Link My Account" button
- After linking: Success toast + 2 bookings appear in history
- Banner disappears

### Flow 4: No Previous Bookings Available

```
1. Customer logs in
2. System checks for linkable customer: NOT FOUND
3. No banner shown
4. User proceeds normally
```

**User sees:**
- No linking banner
- Standard empty dashboard for new customers

## API Reference

### POST /api/auth/link-account

Link authenticated user to existing customer record.

**Authentication:** Required (Bearer token)

**Request:**
```http
POST /api/auth/link-account
Authorization: Bearer {token}
Content-Type: application/json
```

**Response (Success - Account Linked):**
```json
{
  "success": true,
  "alreadyLinked": false,
  "customer": {
    "id": "cust_abc123",
    "name": "John Doe",
    "email": "john@example.com",
    "linkedJobs": 3,
    "linkedInvoices": 2,
    "welcomePoints": 50
  },
  "message": "Welcome back! We found 3 previous booking(s) and added them to your account."
}
```

**Response (Already Linked):**
```json
{
  "success": true,
  "alreadyLinked": true,
  "customer": {
    "id": "cust_abc123",
    "name": "John Doe",
    "email": "john@example.com"
  },
  "message": "Your account is already linked"
}
```

**Response (No Match Found):**
```json
{
  "success": false,
  "error": "No customer record found matching your email",
  "message": "No previous bookings found"
}
```

### GET /api/auth/link-account

Check if user can link to existing customer (eligibility check).

**Authentication:** Required

**Response (Can Link):**
```json
{
  "canLink": true,
  "alreadyLinked": false,
  "potentialMatch": {
    "customerId": "cust_abc123",
    "customerName": "John Doe",
    "jobCount": 3
  }
}
```

**Response (Already Linked):**
```json
{
  "canLink": false,
  "alreadyLinked": true,
  "customerId": "cust_abc123"
}
```

**Response (No Match):**
```json
{
  "canLink": false,
  "alreadyLinked": false,
  "message": "No matching customer record found"
}
```

## Components

### AccountLinkingBanner

Shows banner when user can link to previous bookings.

**Location:** `src/components/dashboard/AccountLinkingBanner.tsx`

**Usage:**
```tsx
import { AccountLinkingBanner } from '@/components/dashboard/AccountLinkingBanner';

export default function DashboardLayout() {
  return (
    <div>
      <AccountLinkingBanner />
      {/* Rest of dashboard */}
    </div>
  );
}
```

**Features:**
- Auto-checks eligibility on mount
- Shows job count if available
- Handles linking with loading state
- Dismissible
- Auto-refreshes after linking

**Props:**
```typescript
// No props - component is self-contained
```

### AccountLinkingBadge

Compact version for header/sidebar.

**Usage:**
```tsx
import { AccountLinkingBadge } from '@/components/dashboard/AccountLinkingBanner';

<nav>
  <AccountLinkingBadge />
  {/* Other nav items */}
</nav>
```

### AccountLinkedSuccess

Success message after linking.

**Usage:**
```tsx
import { AccountLinkedSuccess } from '@/components/dashboard/AccountLinkingBanner';

<AccountLinkedSuccess
  linkedJobs={3}
  welcomePoints={50}
/>
```

### History Page

Shows complete booking history with pre/post portal sections.

**Location:** `src/app/(dashboard)/dashboard/history/page.tsx`

**Features:**
- Separates previous vs portal bookings
- Shows link indicator on previous bookings
- Displays job details, status, pricing
- Links to invoice details
- Shows stats (total, previous, portal bookings)

## Database Schema

### Fields Added

```sql
-- customers table
ALTER TABLE customers ADD COLUMN IF NOT EXISTS portal_account_created_at TIMESTAMP;

-- jobs table
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS linked_to_portal BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN IF NOT EXISTS portal_linked_at TIMESTAMP;

-- invoices table
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS linked_to_portal BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN IF NOT EXISTS portal_linked_at TIMESTAMP;
```

### Indexes (Recommended)

```sql
-- Speed up linking queries
CREATE INDEX IF NOT EXISTS idx_customers_email_unlinked
  ON customers(email) WHERE portal_user_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_customers_phone_unlinked
  ON customers(phone) WHERE portal_user_id IS NULL;

-- Speed up history queries
CREATE INDEX IF NOT EXISTS idx_jobs_linked_to_portal
  ON jobs(customer_id, linked_to_portal, created_at);
```

## Best Practices

### 1. Always Check Email AND Phone

```typescript
// ❌ Bad: Only check email
.eq('email', email)

// ✅ Good: Check both
.or(`email.eq.${email},phone.eq.${phone}`)
```

### 2. Handle Linking During Signup

```typescript
// ✅ Check for existing customer during signup
const existingCustomer = await checkExistingCustomer(email, phone);

if (existingCustomer) {
  // Auto-link
  await linkAccount(user.id, existingCustomer.id);
}
```

### 3. Show Clear Feedback

```typescript
// ✅ Tell user what happened
if (linkedJobs > 0) {
  toast.success(
    `Welcome back! We found ${linkedJobs} previous bookings.`,
    {
      description: 'You earned 50 bonus points!',
    }
  );
}
```

### 4. Award Bonus Points

```typescript
// ✅ Reward customers for linking
const welcomePoints = existingCustomer ? 50 : 100;
await awardLoyaltyPoints(customerId, welcomePoints, 'signup_bonus');
```

### 5. Create Audit Logs

```typescript
// ✅ Log all linking activities
await createAuditLog({
  action: 'account_linked',
  userId: user.id,
  customerId: customer.id,
  details: {
    jobsLinked: linkedJobs,
    pointsAwarded: welcomePoints,
  },
});
```

### 6. Handle Edge Cases

```typescript
// ✅ Handle multiple potential matches
const customers = await findMatchingCustomers(email, phone);

if (customers.length > 1) {
  // Show disambiguation UI
  return { needsSelection: true, options: customers };
}
```

## Troubleshooting

### Account Not Auto-Linking During Signup

**Problem:** User signs up with same email but account doesn't link

**Causes:**
1. Email case mismatch (john@example.com vs JOHN@example.com)
2. Customer already has portal_user_id set
3. Phone number format mismatch

**Solutions:**
```sql
-- Check for case-insensitive duplicates
SELECT * FROM customers WHERE LOWER(email) = LOWER('john@example.com');

-- Check if customer already linked
SELECT * FROM customers WHERE email = 'john@example.com' AND portal_user_id IS NOT NULL;

-- Fix case sensitivity
UPDATE customers SET email = LOWER(email);
CREATE INDEX ON customers(LOWER(email));
```

### Banner Not Showing

**Problem:** User has previous bookings but banner doesn't appear

**Causes:**
1. User already linked
2. Customer record has portal_user_id set
3. JavaScript error preventing banner render

**Solutions:**
```typescript
// Check eligibility
const { data } = await supabase
  .from('customers')
  .select('id, portal_user_id')
  .eq('email', user.email);

console.log('Customer check:', data);
// Should have: id present, portal_user_id null
```

### Linking Fails with "Customer Not Found"

**Problem:** Link button shows but linking fails

**Causes:**
1. Customer was linked by another session
2. Email doesn't match exactly
3. Customer record was deleted

**Solutions:**
```sql
-- Verify customer exists
SELECT * FROM customers
WHERE email = 'john@example.com'
AND portal_user_id IS NULL;

-- Check recent linking activity
SELECT * FROM audit_logs
WHERE action = 'account_linked'
AND details->>'email' = 'john@example.com';
```

### Previous Bookings Not Showing in History

**Problem:** Linked but bookings don't appear

**Causes:**
1. Jobs not marked as `linked_to_portal`
2. RLS policy blocking access
3. Wrong customer_id

**Solutions:**
```sql
-- Check jobs are marked as linked
SELECT id, customer_id, linked_to_portal
FROM jobs
WHERE customer_id = 'cust_abc123';

-- Manually mark as linked
UPDATE jobs
SET linked_to_portal = TRUE,
    portal_linked_at = NOW()
WHERE customer_id = 'cust_abc123'
AND linked_to_portal IS NULL;
```

### Duplicate Customer Records

**Problem:** Multiple customers with same email

**Causes:**
1. Signup before linking was implemented
2. Manual data entry without de-duplication
3. Case sensitivity issues

**Solutions:**
```sql
-- Find duplicates
SELECT email, COUNT(*)
FROM customers
GROUP BY LOWER(email)
HAVING COUNT(*) > 1;

-- Merge duplicates (careful!)
-- 1. Link jobs/invoices to primary customer
UPDATE jobs SET customer_id = 'primary_id' WHERE customer_id = 'duplicate_id';
UPDATE invoices SET customer_id = 'primary_id' WHERE customer_id = 'duplicate_id';

-- 2. Delete duplicate customer
DELETE FROM customers WHERE id = 'duplicate_id';
```

## Testing

### Test Cases

1. **New Customer Signup**
   - Verify creates auth + customer
   - Verify awards 100 points
   - Verify no linking banner

2. **Returning Customer Signup (Auto-Link)**
   - Verify finds existing customer
   - Verify links accounts
   - Verify shows previous bookings
   - Verify awards 50 points

3. **Manual Linking**
   - Verify banner shows when eligible
   - Verify linking works
   - Verify success message
   - Verify history updates

4. **Already Linked**
   - Verify no banner
   - Verify GET returns alreadyLinked: true
   - Verify POST returns already linked message

5. **No Match Available**
   - Verify no banner
   - Verify GET returns canLink: false

### Manual Testing Script

```bash
# 1. Create customer via website booking
curl -X POST http://localhost:3000/api/public/bookings \
  -H "Content-Type: application/json" \
  -d '{
    "customerInfo": {
      "email": "test@example.com",
      "firstName": "Test",
      "lastName": "User",
      ...
    },
    ...
  }'

# 2. Sign up with same email in portal
# Visit: http://localhost:3009/signup
# Email: test@example.com

# 3. Check if auto-linked
# Visit: http://localhost:3009/dashboard/history
# Should see previous booking

# 4. Test banner (if not auto-linked)
# Visit: http://localhost:3009/dashboard
# Should see blue banner with "Link My Account"
```

## Migration Guide

### For Existing Portals

If you're adding linking to an existing portal:

```sql
-- 1. Add new columns
ALTER TABLE customers ADD COLUMN portal_account_created_at TIMESTAMP;
ALTER TABLE jobs ADD COLUMN linked_to_portal BOOLEAN DEFAULT FALSE;
ALTER TABLE jobs ADD COLUMN portal_linked_at TIMESTAMP;
ALTER TABLE invoices ADD COLUMN linked_to_portal BOOLEAN DEFAULT FALSE;
ALTER TABLE invoices ADD COLUMN portal_linked_at TIMESTAMP;

-- 2. Backfill existing linked accounts
UPDATE customers
SET portal_account_created_at = created_at
WHERE portal_user_id IS NOT NULL
AND portal_account_created_at IS NULL;

-- 3. Mark existing portal jobs
UPDATE jobs
SET linked_to_portal = TRUE,
    portal_linked_at = NOW()
WHERE customer_id IN (
  SELECT id FROM customers WHERE portal_user_id IS NOT NULL
);
```

## Related Documentation

- [Portal Provisioning](../dirt-free-crm/PORTAL_PROVISIONING.md)
- [Website Booking Integration](../dirt-free-crm/docs/WEBSITE_BOOKING_INTEGRATION.md)
- [Real-Time Sync](./REALTIME_SYNC.md)

## Support

For questions or issues:
- Check browser console for errors
- Review audit logs for linking activities
- Verify customer exists with correct email
- Contact development team
