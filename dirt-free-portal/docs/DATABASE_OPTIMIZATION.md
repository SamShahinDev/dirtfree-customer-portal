# Database Optimization Guide

Recommended database indexes and configuration for optimal performance.

## Table of Contents
1. [Audit Logs Indexes](#audit-logs-indexes)
2. [Connection Pooling Configuration](#connection-pooling-configuration)
3. [Query Performance Monitoring](#query-performance-monitoring)

---

## Audit Logs Indexes

These indexes optimize the production monitoring script (`monitor-production.mjs`) and audit log queries.

### Index 1: Recent Audit Logs by Timestamp

**Purpose:** Speeds up queries that fetch recent audit logs (used by monitoring script).

```sql
-- Create index on created_at for time-range queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
ON audit_logs(created_at DESC);
```

**Impact:**
- Monitoring script queries: `WHERE created_at >= cutoff_time`
- Improves performance by 10-100x on large audit_logs tables
- Essential for production monitoring with 15-minute rolling window

### Index 2: User Activity by Timestamp

**Purpose:** Optimizes user-specific audit queries (activity tracking, user reports).

```sql
-- Create composite index for user activity queries
CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
ON audit_logs(user_id, created_at DESC);
```

**Impact:**
- User activity reports: `WHERE user_id = X AND created_at >= Y`
- Customer-specific audit trails
- Security investigations

### Index 3: Audit Logs by Status

**Purpose:** Quickly retrieve failed operations (critical for error monitoring).

```sql
-- Create index on status for filtering failures
CREATE INDEX IF NOT EXISTS idx_audit_logs_status
ON audit_logs(status);
```

**Impact:**
- Production monitoring: `WHERE status = 'failure'`
- Error rate calculations
- Incident response queries

### Index 4: Audit Logs by Action Type

**Purpose:** Performance optimization for action-specific queries.

```sql
-- Create index on action for filtering by action type
CREATE INDEX IF NOT EXISTS idx_audit_logs_action
ON audit_logs(action);
```

**Impact:**
- Payment audit queries: `WHERE action = 'payment_failed'`
- Feature usage analytics
- Compliance reporting

### All-in-One Script

Run all audit_logs indexes at once:

```sql
-- Audit Logs Performance Indexes
CREATE INDEX IF NOT EXISTS idx_audit_logs_created_at
ON audit_logs(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_user_created
ON audit_logs(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_audit_logs_status
ON audit_logs(status);

CREATE INDEX IF NOT EXISTS idx_audit_logs_action
ON audit_logs(action);

-- Verify indexes were created
SELECT
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'audit_logs'
ORDER BY indexname;
```

---

## Other Recommended Indexes

### Portal Sessions Indexes

**Purpose:** Optimize active user tracking and session queries.

```sql
-- Index for recent logins (used by monitoring script)
CREATE INDEX IF NOT EXISTS idx_portal_sessions_login_at
ON portal_sessions(login_at DESC);

-- Index for customer session lookups
CREATE INDEX IF NOT EXISTS idx_portal_sessions_customer_login
ON portal_sessions(customer_id, login_at DESC);
```

### Invoices Indexes

**Purpose:** Speed up payment and invoice queries.

```sql
-- Index for invoice status queries
CREATE INDEX IF NOT EXISTS idx_invoices_status
ON invoices(status);

-- Index for recent paid invoices
CREATE INDEX IF NOT EXISTS idx_invoices_paid_date
ON invoices(paid_date DESC) WHERE status = 'paid';

-- Index for customer invoice lookups
CREATE INDEX IF NOT EXISTS idx_invoices_customer
ON invoices(customer_id, created_at DESC);
```

### Jobs Indexes

**Purpose:** Optimize booking queries and portal statistics.

```sql
-- Index for recent bookings
CREATE INDEX IF NOT EXISTS idx_jobs_created_at
ON jobs(created_at DESC);

-- Index for portal bookings
CREATE INDEX IF NOT EXISTS idx_jobs_portal_bookings
ON jobs(created_at DESC) WHERE booked_via_portal = true;

-- Index for customer job lookups
CREATE INDEX IF NOT EXISTS idx_jobs_customer
ON jobs(customer_id, created_at DESC);
```

---

## Connection Pooling Configuration

Supabase provides built-in connection pooling. Verify your configuration:

### Check Current Connection Pool Settings

1. Go to Supabase Dashboard → Settings → Database
2. Verify connection pooling is enabled
3. Note the pooler connection string (uses port 6543)

### Recommended Pool Settings

For production deployment:

```
Max Connections: 100 (default)
Pool Mode: Transaction (recommended for serverless)
Statement Timeout: 10s
Connection Timeout: 10s
```

### Application Configuration

Already configured in `src/lib/supabase/server.ts`:

```typescript
import { createServerClient } from '@supabase/ssr'

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) =>
            cookieStore.set(name, value, options)
          )
        },
      },
      auth: {
        persistSession: true,
        autoRefreshToken: true,
      },
    }
  )
}
```

No additional configuration needed - Supabase client handles pooling automatically.

---

## Query Performance Monitoring

### Enable Query Stats

Run this once to enable PostgreSQL statistics:

```sql
-- Enable query statistics extension (if not already enabled)
CREATE EXTENSION IF NOT EXISTS pg_stat_statements;
```

### Check Slow Queries

Use this query to find performance bottlenecks:

```sql
-- Find slowest queries
SELECT
  query,
  calls,
  total_exec_time::numeric / 1000 as total_time_seconds,
  mean_exec_time::numeric / 1000 as mean_time_seconds,
  max_exec_time::numeric / 1000 as max_time_seconds
FROM pg_stat_statements
WHERE query NOT LIKE '%pg_stat_statements%'
ORDER BY total_exec_time DESC
LIMIT 20;
```

### Check Missing Indexes

Identify tables that need indexes:

```sql
-- Find tables with sequential scans (potential missing indexes)
SELECT
  schemaname,
  tablename,
  seq_scan,
  seq_tup_read,
  idx_scan,
  seq_tup_read / NULLIF(seq_scan, 0) as avg_seq_read
FROM pg_stat_user_tables
WHERE seq_scan > 0
ORDER BY seq_scan DESC
LIMIT 20;
```

---

## Implementation Steps

### Step 1: Backup Database

Before making any changes:

```bash
# Using Supabase CLI
supabase db dump -f backup-$(date +%Y%m%d).sql

# Or use Supabase Dashboard: Database → Backups → Create Backup
```

### Step 2: Apply Indexes (Production)

1. Go to Supabase Dashboard → SQL Editor
2. Copy the "All-in-One Script" from above
3. Run the script
4. Verify indexes were created (check query results)

### Step 3: Monitor Performance

After applying indexes:

```bash
# Run monitoring script
npm run monitor

# Check query performance in Supabase Dashboard
# Database → Query Performance → Analyze
```

### Step 4: Verify Impact

Expected improvements:

- Monitoring script response time: < 2 seconds (was 5-10 seconds)
- Audit log queries: 10-100x faster
- Active user queries: 5-20x faster
- Payment history queries: 10-50x faster

---

## Index Maintenance

PostgreSQL automatically maintains indexes, but you can manually optimize if needed:

### Reindex (Run during low-traffic periods)

```sql
-- Reindex a specific table
REINDEX TABLE audit_logs;

-- Reindex all tables (use with caution)
REINDEX DATABASE postgres;
```

### Check Index Bloat

```sql
-- Check for bloated indexes
SELECT
  schemaname,
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as index_size
FROM pg_stat_user_indexes
ORDER BY pg_relation_size(indexrelid) DESC
LIMIT 20;
```

---

## Performance Testing

After applying indexes, test the monitoring script:

```bash
# Time the monitoring script
time npm run monitor

# Should complete in < 2 seconds with indexes
# Compare to baseline without indexes (5-10 seconds)
```

---

## Troubleshooting

### Indexes Not Being Used

Check if PostgreSQL is using your indexes:

```sql
-- Explain query plan
EXPLAIN ANALYZE
SELECT * FROM audit_logs
WHERE status = 'failure'
AND created_at >= NOW() - INTERVAL '15 minutes';
```

Look for:
- "Index Scan" (good) vs "Seq Scan" (bad)
- Actual time vs estimated time

### High Index Size

If indexes grow too large:

```sql
-- Check index sizes
SELECT
  tablename,
  indexname,
  pg_size_pretty(pg_relation_size(indexrelid)) as size
FROM pg_stat_user_indexes
WHERE schemaname = 'public'
ORDER BY pg_relation_size(indexrelid) DESC;
```

Consider:
- Partial indexes (WHERE clause in CREATE INDEX)
- Composite indexes instead of multiple single-column indexes
- Regular VACUUM to reclaim space

---

## Next Steps

1. Apply audit_logs indexes (highest priority)
2. Monitor performance with `npm run monitor`
3. Apply additional indexes based on query patterns
4. Set up automated performance monitoring
5. Review query performance weekly

---

**Last Updated:** 2025-10-21
**Status:** Ready for Production
