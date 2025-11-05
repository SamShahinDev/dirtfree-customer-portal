# Logging System Documentation

## Overview

This document describes the comprehensive logging and audit trail system for the Dirt Free Carpet Customer Portal. The system provides structured logging, audit trails for compliance, and consistent error tracking across the entire application.

## Table of Contents

1. [Features](#features)
2. [Architecture](#architecture)
3. [Components](#components)
4. [Usage Guide](#usage-guide)
5. [Audit Logging](#audit-logging)
6. [Database Setup](#database-setup)
7. [API Route Patterns](#api-route-patterns)
8. [Testing](#testing)
9. [Production Deployment](#production-deployment)
10. [Troubleshooting](#troubleshooting)

---

## Features

### Structured Logging
- **Log Levels**: info, warn, error, debug
- **Development Mode**: Human-readable console output with colors
- **Production Mode**: JSON-formatted logs for aggregation services
- **Context/Metadata**: Attach structured data to every log entry
- **Child Loggers**: Create scoped loggers with persistent context
- **Sentry Integration**: Automatic error reporting to Sentry

### Audit Trail
- **Immutable Records**: Track all sensitive operations in database
- **Compliance Ready**: Full audit trail for payment operations
- **IP Tracking**: Automatic capture of IP addresses
- **User Agent Tracking**: Browser/client identification
- **Status Tracking**: success, failure, pending
- **JSONB Details**: Flexible metadata storage
- **Retention Policies**: Configurable data retention (default: 365 days)

### Security & Privacy
- **Row Level Security**: Customers can only view their own audit logs
- **Service Role Access**: Admin access for compliance queries
- **Indexed Queries**: Fast performance even with millions of records
- **Failed Action Monitoring**: Track security-related failures

---

## Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                      API Routes                             │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Structured Logger                         │    │
│  │  - Development: Human-readable console             │    │
│  │  - Production: JSON logs                           │    │
│  │  - Auto-send errors to Sentry                      │    │
│  └────────────────────────────────────────────────────┘    │
│  ┌────────────────────────────────────────────────────┐    │
│  │           Audit Logger                              │    │
│  │  - Track sensitive operations                      │    │
│  │  - IP & User-Agent capture                         │    │
│  │  - Database persistence                            │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   Sentry (Errors)                            │
│  - Exception tracking                                        │
│  - Stack traces                                              │
│  - User context                                              │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│              Supabase (Audit Logs)                           │
│  - audit_logs table                                          │
│  - RLS policies                                              │
│  - Performance indexes                                       │
│  - Retention functions                                       │
└─────────────────────────────────────────────────────────────┘
```

---

## Components

### 1. `/src/lib/logger.ts` - Structured Logger

Core logging utility with environment-aware formatting.

**Key Features**:
- Log levels: `info`, `warn`, `error`, `debug`
- Development-friendly format with timestamps
- Production JSON format for log aggregation
- Automatic Sentry integration for errors
- Child logger support for scoped logging
- Test environment support

**Example Usage**:

```typescript
import { logger } from '@/lib/logger'

// Simple logging
logger.info('Payment processed')
logger.warn('Rate limit approaching')
logger.error('Payment failed', error)
logger.debug('Processing webhook')

// With context
logger.info('Payment completed', {
  paymentIntentId: 'pi_123',
  amount: 185.00,
  currency: 'usd'
})

// Error with context
logger.error('Failed to create payment', error, {
  endpoint: '/api/payments/create-intent',
  invoiceId: 'inv_123'
})

// Child logger with persistent context
const reqLogger = logger.child({
  requestId: 'req_abc123',
  userId: 'usr_456'
})
reqLogger.info('Processing request') // Includes requestId and userId
```

---

### 2. `/src/lib/audit.ts` - Audit Logging

Tracks sensitive operations and creates immutable audit trail in database.

**Key Features**:
- Type-safe action definitions
- Automatic IP and User-Agent capture
- Helper functions for common scenarios
- Database persistence
- Never throws errors (fail-safe)

**Example Usage**:

```typescript
import { logAudit, logPaymentAudit, logAuthAudit } from '@/lib/audit'

// General audit log
await logAudit({
  userId: customer.id,
  action: 'invoice_viewed',
  resourceType: 'invoice',
  resourceId: invoiceId,
  details: { invoice_number: 'INV-001' },
  request,
  status: 'success',
})

// Payment audit log (helper)
await logPaymentAudit({
  userId: customer.id,
  action: 'payment_completed',
  paymentIntentId: 'pi_123',
  invoiceId: 'inv_456',
  amount: 185.00,
  currency: 'usd',
  request,
  status: 'success',
})

// Authentication audit log (helper)
await logAuthAudit({
  userId: customer.id,
  action: 'login_success',
  email: customer.email,
  request,
  status: 'success',
})
```

---

### 3. `/supabase/11-create-audit-logs-table.sql` - Database Schema

Creates `audit_logs` table with security policies and helper functions.

**Key Features**:
- UUID primary keys
- Foreign key to customers table
- JSONB for flexible details
- INET type for IP addresses
- Indexed for performance
- RLS policies for security
- Retention/cleanup functions

**Schema**:

```sql
CREATE TABLE audit_logs (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES customers(id),
  action VARCHAR(100) NOT NULL,
  resource_type VARCHAR(50),
  resource_id UUID,
  details JSONB,
  ip_address INET,
  user_agent TEXT,
  status VARCHAR(20) DEFAULT 'success',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

---

## Usage Guide

### Basic Logging Pattern

**Step 1**: Import the logger

```typescript
import { logger } from '@/lib/logger'
```

**Step 2**: Replace `console.*` with `logger.*`

```typescript
// ❌ Before
console.log('Payment processed')
console.error('Payment failed:', error)

// ✅ After
logger.info('Payment processed')
logger.error('Payment failed', error)
```

**Step 3**: Add context for better debugging

```typescript
logger.info('Payment intent created', {
  paymentIntentId: paymentIntent.id,
  amount: 185.00,
  customerId: customer.id,
})
```

---

### Error Logging Pattern

**Before**:
```typescript
try {
  // Your code
} catch (error: any) {
  console.error('Error message:', error)
  return NextResponse.json({ error: 'Failed' }, { status: 500 })
}
```

**After**:
```typescript
try {
  // Your code
} catch (error) {
  logger.error('Descriptive error message', error as Error, {
    endpoint: '/api/your-route',
    additionalContext: 'value',
  })
  return NextResponse.json({ error: 'Failed' }, { status: 500 })
}
```

---

### Request Scoped Logging

Use child loggers for consistent request tracking:

```typescript
import { logger, generateRequestId } from '@/lib/logger'

export async function POST(request: Request) {
  const requestId = generateRequestId()
  const reqLogger = logger.child({ requestId })

  reqLogger.info('Request started')

  try {
    // Your logic
    reqLogger.info('Payment processed')
  } catch (error) {
    reqLogger.error('Request failed', error as Error)
  }

  return NextResponse.json({ success: true })
}
```

---

## Audit Logging

### When to Use Audit Logs

**ALWAYS audit these operations**:
- ✅ Payment transactions (create, complete, fail, refund)
- ✅ Invoice status changes (viewed, paid, downloaded)
- ✅ Authentication events (login, logout, password change)
- ✅ Payment method changes (add, remove, set default)
- ✅ Reward redemptions (redeem, cancel)
- ✅ Account changes (email, profile)

**OPTIONAL for these operations**:
- Document views (high volume, consider sampling)
- Message reads (high volume)
- Page visits (use analytics instead)

### Standard Actions

#### Payment Actions
```typescript
- payment_intent_created
- payment_completed
- payment_failed
- refund_issued
```

#### Invoice Actions
```typescript
- invoice_viewed
- invoice_downloaded
- invoice_paid
- invoice_updated
```

#### Account Actions
```typescript
- login_success
- login_failed
- logout
- password_changed
- email_changed
- profile_updated
```

#### Payment Method Actions
```typescript
- payment_method_added
- payment_method_removed
- payment_method_set_default
```

#### Reward Actions
```typescript
- reward_redeemed
- reward_cancelled
- loyalty_points_earned
- loyalty_points_spent
```

---

## Database Setup

### Step 1: Run Migration

```bash
# Connect to your Supabase database
psql -h <your-host> -U postgres -d postgres -f supabase/11-create-audit-logs-table.sql
```

### Step 2: Verify Table Creation

```sql
-- Check table exists
SELECT table_name FROM information_schema.tables
WHERE table_name = 'audit_logs';

-- Check RLS is enabled
SELECT tablename, rowsecurity
FROM pg_tables
WHERE tablename = 'audit_logs';

-- Check indexes
SELECT indexname FROM pg_indexes
WHERE tablename = 'audit_logs';
```

### Step 3: Test Queries

```sql
-- View all audit logs (service role only)
SELECT * FROM audit_logs
ORDER BY created_at DESC
LIMIT 10;

-- Get audit logs for a specific user
SELECT * FROM audit_logs
WHERE user_id = 'customer-uuid'
ORDER BY created_at DESC;

-- Get failed actions (security monitoring)
SELECT * FROM get_recent_failed_actions(100);

-- Get user activity summary
SELECT * FROM get_user_audit_summary('customer-uuid', 30);
```

---

## API Route Patterns

### Pattern 1: Webhook Handler

**File**: `/src/app/api/webhooks/stripe/route.ts`

```typescript
import { logger } from '@/lib/logger'
import { logPaymentAudit } from '@/lib/audit'

export async function POST(request: Request) {
  try {
    // Signature verification
    event = stripe.webhooks.constructEvent(body, signature, secret)
  } catch (error: any) {
    logger.error('Webhook signature verification failed', error, {
      endpoint: '/api/webhooks/stripe',
    })
    return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded':
        // Process payment

        // Audit log
        await logPaymentAudit({
          userId: customerId,
          action: 'payment_completed',
          paymentIntentId: paymentIntent.id,
          amount: paymentIntent.amount / 100,
          request,
          status: 'success',
        })

        logger.info('Payment completed successfully', {
          paymentIntentId: paymentIntent.id,
          customerId,
          amount: paymentIntent.amount / 100,
        })
        break

      case 'payment_intent.payment_failed':
        logger.error('Payment failed', undefined, {
          paymentIntentId: paymentIntent.id,
        })

        await logPaymentAudit({
          userId: customerId,
          action: 'payment_failed',
          paymentIntentId: paymentIntent.id,
          request,
          status: 'failure',
        })
        break

      default:
        logger.debug('Unhandled webhook event', {
          eventType: event.type,
        })
    }

    return NextResponse.json({ received: true })
  } catch (error: any) {
    logger.error('Webhook handler error', error, {
      endpoint: '/api/webhooks/stripe',
      eventType: event?.type,
    })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

### Pattern 2: Payment Confirmation

**File**: `/src/app/api/payments/confirm/route.ts`

```typescript
import { logger } from '@/lib/logger'
import { logAudit } from '@/lib/audit'

export async function POST(request: NextRequest) {
  try {
    const { invoiceId, paymentIntentId } = await request.json()

    // Verify payment
    const paymentIntent = await stripe.paymentIntents.retrieve(paymentIntentId)

    // Update invoice
    const { error } = await supabase
      .from('invoices')
      .update({ status: 'paid' })
      .eq('id', invoiceId)

    if (error) {
      logger.error('Failed to update invoice', error, {
        endpoint: '/api/payments/confirm',
        invoiceId,
        paymentIntentId,
      })
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }

    // Audit log
    await logAudit({
      userId: invoice.customer_id,
      action: 'invoice_paid',
      resourceType: 'invoice',
      resourceId: invoiceId,
      details: {
        amount: invoice.amount,
        payment_intent_id: paymentIntentId,
      },
      request,
      status: 'success',
    })

    logger.info('Payment confirmed successfully', {
      invoiceId,
      customerId: invoice.customer_id,
      amount: invoice.amount,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Failed to confirm payment', error as Error, {
      endpoint: '/api/payments/confirm',
    })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

### Pattern 3: Simple CRUD Operation

**File**: `/src/app/api/customers/profile/route.ts` (example)

```typescript
import { logger } from '@/lib/logger'

export async function PUT(request: Request) {
  try {
    const data = await request.json()

    logger.info('Updating customer profile', {
      customerId: data.id,
      fields: Object.keys(data),
    })

    const { error } = await supabase
      .from('customers')
      .update(data)
      .eq('id', data.id)

    if (error) {
      logger.error('Failed to update profile', error, {
        endpoint: '/api/customers/profile',
        customerId: data.id,
      })
      return NextResponse.json({ error: 'Failed' }, { status: 500 })
    }

    logger.info('Profile updated successfully', {
      customerId: data.id,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    logger.error('Profile update error', error as Error, {
      endpoint: '/api/customers/profile',
    })
    return NextResponse.json({ error: 'Failed' }, { status: 500 })
  }
}
```

---

## Testing

### Test Structured Logging

Create a test route to verify logging output:

**File**: `/src/app/api/test-logging/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { logger } from '@/lib/logger'

export async function GET() {
  // Test all log levels
  logger.debug('Debug message')
  logger.info('Info message', { key: 'value' })
  logger.warn('Warning message', { code: 'WARN_001' })

  try {
    throw new Error('Test error')
  } catch (error) {
    logger.error('Error message', error as Error, {
      endpoint: '/api/test-logging',
    })
  }

  return NextResponse.json({ message: 'Check console/Sentry for logs' })
}
```

**Test in Development**:
```bash
curl http://localhost:3009/api/test-logging
```

**Expected Output** (console):
```
[10:30:45] DEBUG - Debug message
[10:30:45] INFO  - Info message
{
  "key": "value"
}
[10:30:45] WARN  - Warning message
{
  "code": "WARN_001"
}
[10:30:45] ERROR - Error message
Error: Test error
  at /api/test-logging/route.ts:12:11
  ...
```

---

### Test Audit Logging

Create a test route to verify audit logs:

**File**: `/src/app/api/test-audit/route.ts`

```typescript
import { NextResponse } from 'next/server'
import { logAudit } from '@/lib/audit'

export async function GET(request: Request) {
  // Test audit log
  await logAudit({
    userId: 'test-user-id',
    action: 'test_action',
    resourceType: 'invoice',
    resourceId: 'test-resource-id',
    details: {
      test: true,
      timestamp: new Date().toISOString(),
    },
    request,
    status: 'success',
  })

  return NextResponse.json({ message: 'Check audit_logs table' })
}
```

**Test**:
```bash
curl http://localhost:3009/api/test-audit
```

**Verify in Database**:
```sql
SELECT * FROM audit_logs
WHERE action = 'test_action'
ORDER BY created_at DESC
LIMIT 1;
```

---

## Production Deployment

### Step 1: Environment Variables

Ensure these are set in production:

```env
# Sentry (for error tracking)
NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...

# Supabase (for audit logs)
NEXT_PUBLIC_SUPABASE_URL=https://....supabase.co
SUPABASE_SERVICE_ROLE_KEY=eyJ...
```

### Step 2: Deploy Database Migration

```bash
# Connect to production database
psql -h <prod-host> -U postgres -d postgres -f supabase/11-create-audit-logs-table.sql
```

### Step 3: Verify Logging

After deployment:

1. **Check Sentry**: Errors should appear in Sentry dashboard
2. **Check Audit Logs**: Run queries to verify audit logs are being created
3. **Monitor Performance**: Ensure logging doesn't impact response times

---

### Step 4: Set Up Retention Policy

Schedule the cleanup function to run monthly:

```sql
-- Create a cron job (if using pg_cron extension)
SELECT cron.schedule(
  'cleanup-old-audit-logs',
  '0 0 1 * *',  -- Run monthly
  $$SELECT cleanup_old_audit_logs(365);$$
);
```

Or run manually:

```sql
-- Delete logs older than 1 year
SELECT cleanup_old_audit_logs(365);
```

---

## Troubleshooting

### Issue: Logs not appearing in Sentry

**Solution**:

1. **Check environment variable**:
   ```bash
   echo $NEXT_PUBLIC_SENTRY_DSN
   ```

2. **Verify Sentry initialization**:
   Check `sentry.client.config.ts` and `sentry.server.config.ts`

3. **Test manually**:
   ```typescript
   import * as Sentry from '@sentry/nextjs'
   Sentry.captureMessage('Test message')
   ```

4. **Check console for errors**:
   Look for Sentry initialization errors

---

### Issue: Audit logs not being created

**Solution**:

1. **Check database connection**:
   ```typescript
   const { data, error } = await supabase
     .from('audit_logs')
     .select('count')
     .single()
   console.log('Audit logs count:', data, error)
   ```

2. **Check RLS policies**:
   ```sql
   -- Disable RLS temporarily to test
   ALTER TABLE audit_logs DISABLE ROW LEVEL SECURITY;

   -- Test insert
   INSERT INTO audit_logs (action) VALUES ('test_action');

   -- Re-enable RLS
   ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;
   ```

3. **Check service role key**:
   Ensure `SUPABASE_SERVICE_ROLE_KEY` is set and valid

4. **Check logs in logger**:
   Look for "Failed to create audit log" errors

---

### Issue: Performance degradation

**Solution**:

1. **Check index usage**:
   ```sql
   EXPLAIN ANALYZE
   SELECT * FROM audit_logs
   WHERE user_id = 'customer-uuid'
   ORDER BY created_at DESC
   LIMIT 10;
   ```

2. **Add more indexes if needed**:
   ```sql
   CREATE INDEX idx_audit_logs_custom
   ON audit_logs(column1, column2);
   ```

3. **Implement sampling** for high-volume operations:
   ```typescript
   // Only log 10% of document views
   if (Math.random() < 0.1) {
     await logAudit({ action: 'document_viewed', ... })
   }
   ```

4. **Run cleanup more frequently**:
   ```sql
   -- Delete logs older than 90 days instead of 365
   SELECT cleanup_old_audit_logs(90);
   ```

---

## Summary

You now have a production-ready logging system:

✅ **Structured Logger** (`/src/lib/logger.ts`)
- Development-friendly console output
- Production JSON formatting
- Automatic Sentry integration
- Child logger support

✅ **Audit Trail** (`/src/lib/audit.ts`)
- Type-safe action definitions
- IP and User-Agent tracking
- Database persistence
- Helper functions

✅ **Database Schema** (`/supabase/11-create-audit-logs-table.sql`)
- `audit_logs` table with RLS
- Performance indexes
- Retention functions
- Helper queries

✅ **Updated API Routes**
- Webhook handler with full logging
- Payment confirm with audit trail
- Pattern examples for all routes

✅ **Comprehensive Documentation**
- Usage patterns
- Testing procedures
- Production deployment
- Troubleshooting guide

---

## Next Steps

1. **Update Remaining API Routes**: Apply the patterns from this guide to the remaining 15+ API routes
2. **Set Up Monitoring**: Configure alerts in Sentry for critical errors
3. **Review Audit Logs**: Regularly query `audit_logs` for security monitoring
4. **Optimize Retention**: Adjust the retention policy based on compliance requirements
5. **Add Custom Actions**: Define additional audit actions as needed

For questions or issues, refer to this documentation or check the implementation in the updated API routes.
