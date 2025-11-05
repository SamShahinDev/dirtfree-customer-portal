# Performance Optimization Guide

This document describes the database query optimization and caching implementation for the Dirt Free Customer Portal.

## Overview

The portal implements a two-tier performance optimization strategy:

1. **Database Layer**: Composite indexes for faster query execution
2. **Application Layer**: LRU caching for frequently accessed data

## Expected Performance Improvements

- **Customer lookups**: 90% reduction in database queries (cached for 15 minutes)
- **Notification queries**: 70% reduction in database queries (cached for 2 minutes)
- **Jobs/Invoice queries**: 40-60% faster with composite indexes
- **Cache hit rate**: 80-90% after warm-up period
- **Memory usage**: ~50-100MB for typical workload

---

## Database Indexes

### Implementation

All database indexes are defined in `/supabase/10-add-performance-indexes.sql`

### Index Details

#### Jobs Table (4 indexes)
```sql
-- Customer + date filtering
idx_jobs_customer_date ON jobs(customer_id, scheduled_date DESC)

-- Status filtering for active jobs
idx_jobs_status ON jobs(status) WHERE status IN ('scheduled', 'confirmed', 'in_progress')

-- Triple composite for complex queries
idx_jobs_customer_status_date ON jobs(customer_id, status, scheduled_date DESC)
```

**Use Cases:**
- Dashboard job lists
- Upcoming appointments
- Service history
- Status-filtered queries

#### Invoices Table (3 indexes)
```sql
-- Customer + status filtering
idx_invoices_customer_status ON invoices(customer_id, status)

-- Unpaid invoice queries
idx_invoices_status ON invoices(status) WHERE status IN ('sent', 'overdue')

-- Customer invoice history
idx_invoices_customer_date ON invoices(customer_id, created_at DESC)
```

**Use Cases:**
- Outstanding balance calculations
- Payment status checks
- Invoice history page
- Payment reminders

#### Loyalty Transactions (1 index)
```sql
-- Transaction history with sorting
idx_loyalty_transactions_customer_date ON loyalty_transactions(customer_id, created_at DESC)
```

**Use Cases:**
- Loyalty points page
- Transaction history display

#### Messages Table (1 index)
```sql
-- Customer + status + date filtering
idx_messages_customer_status_date ON messages(customer_id, status, created_at DESC)
```

**Use Cases:**
- Message center
- Filtered message lists
- Status-based queries

#### Notifications Table (1 index)
```sql
-- Customer + read status + date sorting
idx_notifications_customer_read_date ON notifications(customer_id, read, created_at DESC)
```

**Use Cases:**
- Unread notification counts
- Notification center
- Recent notifications

### Applying Indexes

To apply the indexes to your Supabase database:

```bash
# Connect to your Supabase database
psql [your-connection-string]

# Run the migration
\i supabase/10-add-performance-indexes.sql
```

Or through the Supabase Dashboard:
1. Go to SQL Editor
2. Paste contents of `10-add-performance-indexes.sql`
3. Run the query

### Verifying Indexes

Check if indexes are created:

```sql
SELECT
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE schemaname = 'public'
  AND tablename IN ('jobs', 'invoices', 'messages', 'notifications', 'loyalty_transactions')
ORDER BY tablename, indexname;
```

---

## Application Caching

### Architecture

The caching layer uses `lru-cache` with separate cache instances for different data types:

- **Customer Cache**: 1000 entries, 15 min TTL
- **Notification Cache**: 500 entries, 2 min TTL
- **Invoice Cache**: 500 entries, 10 min TTL
- **Job Cache**: 500 entries, 10 min TTL
- **Query Cache**: 500 entries, 5 min TTL

### Implementation Files

- `/src/lib/db-cache.ts` - Core caching utilities
- `/src/app/(dashboard)/layout.tsx` - Customer lookup caching
- `/src/components/notifications/NotificationBell.tsx` - Notification caching
- `/src/app/api/cache/stats/route.ts` - Monitoring endpoint
- `/src/app/api/cache/clear/route.ts` - Management endpoint

### Usage Examples

#### Basic Caching

```typescript
import { getCachedCustomer, setCachedCustomer } from '@/lib/db-cache'

// Try to get from cache
let customer = getCachedCustomer(email)

if (!customer) {
  // Cache miss - fetch from database
  const { data } = await supabase
    .from('customers')
    .select('*')
    .eq('email', email)
    .single()

  customer = data

  // Store in cache
  if (data) {
    setCachedCustomer(email, data)
  }
}
```

#### Using the withCache Helper

```typescript
import { withCache } from '@/lib/db-cache'

// Automatic cache management
const customer = await withCache(
  `customer:${email}`,
  async () => {
    const { data } = await supabase
      .from('customers')
      .select('*')
      .eq('email', email)
      .single()
    return data
  },
  { cache: 'customers' }
)
```

#### Cache Invalidation

```typescript
import { invalidateCustomerCaches, invalidateNotifications } from '@/lib/db-cache'

// When customer data changes
invalidateCustomerCaches(customerId, email)

// When notifications change
invalidateNotifications(customerId)
```

### Available Cache Functions

#### Customer Cache
- `getCachedCustomer(email)` / `setCachedCustomer(email, data)`
- `getCachedCustomerById(id)` / `setCachedCustomerById(id, data)`
- `invalidateCustomer(identifier)`

#### Notification Cache
- `getCachedNotifications(customerId)` / `setCachedNotifications(customerId, data)`
- `getCachedNotificationCount(customerId)` / `setCachedNotificationCount(customerId, count)`
- `invalidateNotifications(customerId)`

#### Invoice Cache
- `getCachedInvoices(customerId)` / `setCachedInvoices(customerId, data)`
- `getCachedInvoice(invoiceId)` / `setCachedInvoice(invoiceId, data)`
- `invalidateInvoices(customerId)`

#### Job Cache
- `getCachedJobs(customerId)` / `setCachedJobs(customerId, data)`
- `getCachedJob(jobId)` / `setCachedJob(jobId, data)`
- `invalidateJobs(customerId)`

#### General Functions
- `getCachedQuery(key)` / `setCachedQuery(key, value)`
- `clearCachePattern(pattern)`
- `clearAllCaches()`
- `invalidateCustomerCaches(customerId, email)`

---

## Monitoring & Debugging

### Cache Statistics API

Get real-time cache statistics:

```bash
# Development
curl http://localhost:3009/api/cache/stats

# Production
curl https://your-domain.com/api/cache/stats
```

Response:
```json
{
  "success": true,
  "caches": {
    "customers": {
      "size": 145,
      "max": 1000,
      "calculatedSize": 145,
      "ttl": 900000
    },
    "notifications": {
      "size": 67,
      "max": 500,
      "calculatedSize": 67,
      "ttl": 120000
    },
    // ... other caches
  },
  "performance": {
    "hitRate": "87.34%",
    "totalEntries": 342,
    "totalCapacity": 3000,
    "utilizationRate": "11.40%"
  },
  "timestamp": "2025-01-19T12:34:56.789Z"
}
```

### Cache Management API

Clear caches programmatically:

```bash
# Clear all caches
curl -X POST http://localhost:3009/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{"all": true}'

# Clear by pattern
curl -X POST http://localhost:3009/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{"pattern": "customer:john@example.com"}'

# Clear specific customer
curl -X POST http://localhost:3009/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{"customerId": "uuid-here", "email": "john@example.com"}'

# Reset metrics
curl -X POST http://localhost:3009/api/cache/clear \
  -H "Content-Type: application/json" \
  -d '{"metrics": true}'
```

### Console Logging

Log cache statistics to console:

```typescript
import { logCacheStats } from '@/lib/db-cache'

logCacheStats()
```

Output:
```
📊 Cache Statistics:
==================
customers:
  Size: 145/1000
  TTL: 900s
notifications:
  Size: 67/500
  TTL: 120s
...

Cache Hit Rate: 87.34%
Total Hits: 1234
Total Misses: 178
```

---

## Best Practices

### 1. Cache Invalidation Strategy

**When to invalidate:**
- After data mutations (INSERT, UPDATE, DELETE)
- When customer data changes
- When real-time accuracy is critical

**Example:**
```typescript
// After creating a new invoice
await supabase.from('invoices').insert(newInvoice)

// Invalidate invoice cache
invalidateInvoices(customerId)
```

### 2. TTL Selection

- **Customer data**: Long TTL (15 min) - changes infrequently
- **Notifications**: Short TTL (2 min) - needs to be fresh
- **Transactional data**: Medium TTL (5-10 min) - balance between freshness and performance

### 3. Cache Key Naming

Use consistent, descriptive patterns:
- `customer:${email}` or `customer:id:${id}`
- `invoices:${customerId}`
- `notifications:${customerId}`
- `unread:${customerId}`

### 4. Memory Management

Monitor cache utilization:
- Total capacity: 3000 entries
- Expected memory: 50-100MB
- If utilization > 80%, consider increasing limits or reducing TTL

### 5. Error Handling

Always handle cache failures gracefully:

```typescript
try {
  const cached = getCachedCustomer(email)
  if (cached) return cached
} catch (error) {
  // Log but don't fail - fall back to database
  console.error('Cache error:', error)
}

// Always fetch from database as fallback
const { data } = await supabase.from('customers')...
```

---

## Performance Testing

### Benchmark Query Performance

Compare query execution times before/after indexes:

```sql
-- Enable timing
\timing on

-- Test query
EXPLAIN ANALYZE
SELECT * FROM jobs
WHERE customer_id = 'uuid-here'
  AND status = 'scheduled'
ORDER BY scheduled_date DESC
LIMIT 10;
```

Look for "Index Scan" instead of "Seq Scan" in the output.

### Monitor Cache Hit Rate

Aim for:
- **First 5 minutes**: 40-60% (warm-up period)
- **After warm-up**: 80-90% sustained hit rate
- **Below 70%**: Review TTL settings or cache invalidation logic

### Load Testing

Test with realistic load:

```bash
# Install k6 for load testing
brew install k6

# Create test script
cat > load-test.js << 'EOF'
import http from 'k6/http';
import { check, sleep } from 'k6';

export const options = {
  vus: 50, // 50 virtual users
  duration: '5m',
};

export default function () {
  const res = http.get('http://localhost:3009/dashboard');
  check(res, {
    'status is 200': (r) => r.status === 200,
    'response time < 500ms': (r) => r.timings.duration < 500,
  });
  sleep(1);
}
EOF

# Run test
k6 run load-test.js
```

---

## Troubleshooting

### High Cache Miss Rate

**Symptoms**: Hit rate < 70% after warm-up

**Solutions:**
1. Check TTL settings - may be too short
2. Review cache invalidation - may be too aggressive
3. Check memory limits - cache may be evicting too frequently

### Memory Issues

**Symptoms**: High memory usage, server slowdowns

**Solutions:**
1. Reduce cache limits (max entries)
2. Reduce TTL values
3. Clear caches: `POST /api/cache/clear {"all": true}`

### Stale Data

**Symptoms**: Users see outdated information

**Solutions:**
1. Reduce TTL for affected cache type
2. Add cache invalidation after mutations
3. Use real-time subscriptions for critical data

### Index Not Being Used

**Symptoms**: Slow queries despite indexes

**Solutions:**
1. Run `ANALYZE` to update statistics
2. Check query plan with `EXPLAIN ANALYZE`
3. Verify index exists: `\di idx_name`
4. Check WHERE clause matches index columns

---

## Migration Checklist

- [ ] Apply database indexes (`10-add-performance-indexes.sql`)
- [ ] Install lru-cache dependency (`npm install lru-cache`)
- [ ] Deploy updated code with caching
- [ ] Monitor cache hit rate
- [ ] Check memory usage
- [ ] Verify query performance improvements
- [ ] Set up cache monitoring dashboard
- [ ] Document any custom cache strategies

---

## Future Enhancements

### Redis Integration

For horizontal scaling, consider migrating to Redis:

```typescript
// Example Redis adapter
import Redis from 'ioredis'

const redis = new Redis(process.env.REDIS_URL)

export async function getCachedCustomer(email: string) {
  const cached = await redis.get(`customer:${email}`)
  return cached ? JSON.parse(cached) : null
}

export async function setCachedCustomer(email: string, data: any) {
  await redis.setex(`customer:${email}`, 900, JSON.stringify(data))
}
```

**Benefits:**
- Shared cache across multiple server instances
- Persistence across deployments
- Better memory management
- Built-in pub/sub for cache invalidation

### Query Result Caching in Supabase

Enable Supabase's built-in caching:

```typescript
const { data } = await supabase
  .from('customers')
  .select('*')
  .eq('email', email)
  .cache(900) // 15 minutes
  .single()
```

### Database Connection Pooling

Optimize database connections for better performance:

```typescript
// In supabase/server.ts
export const createClient = () => {
  return createServerClient({
    ...config,
    db: {
      poolSize: 20, // Increase pool size
      idleTimeout: 30000,
    }
  })
}
```

---

## Support

For questions or issues:
1. Check this documentation
2. Review `/src/lib/db-cache.ts` implementation
3. Check cache stats: `GET /api/cache/stats`
4. Review server logs for cache-related errors

---

**Last Updated**: January 2025
**Version**: 1.0.0
