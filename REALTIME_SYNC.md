# Real-Time Data Synchronization

This document describes the real-time synchronization system that provides instant updates to customers in the portal when staff make changes in the CRM.

## Table of Contents

- [Overview](#overview)
- [Architecture](#architecture)
- [Setup](#setup)
- [Usage](#usage)
- [Components](#components)
- [Hooks](#hooks)
- [Best Practices](#best-practices)
- [Troubleshooting](#troubleshooting)

## Overview

The real-time synchronization system uses Supabase Realtime to provide instant updates between the CRM and Customer Portal. When staff make changes in the CRM (schedule appointments, send invoices, post messages, award points), customers see the updates immediately in their portal without refreshing the page.

### Features

- **Instant Updates**: Changes appear in real-time (< 1 second)
- **Automatic Reconnection**: Handles network interruptions gracefully
- **Selective Subscriptions**: Only subscribe to data you need
- **Toast Notifications**: Friendly user notifications for updates
- **Connection Status**: Visual indicator of real-time connection
- **Row-Level Security**: Customers only see their own data
- **Presence**: See who's online (staff/customers)
- **Broadcast**: Ephemeral messages (typing indicators, etc.)

### What Gets Synced

| Data Type | When It Updates |
|-----------|----------------|
| **Jobs/Appointments** | Scheduled, rescheduled, status changed, completed |
| **Invoices** | Created, sent, paid, overdue |
| **Messages** | Staff sends message, message read, message deleted |
| **Loyalty Points** | Points earned, points redeemed, bonus awarded |
| **Customer Profile** | Contact info updated, preferences changed |

## Architecture

### System Diagram

```
┌─────────────────────────────────────────────────┐
│                   CRM Staff                     │
│  (Updates customer data in dashboard)           │
└────────────────┬────────────────────────────────┘
                 │
                 ↓
┌─────────────────────────────────────────────────┐
│            Supabase Database                    │
│  (PostgreSQL with logical replication)          │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ (Realtime Publication)
┌─────────────────────────────────────────────────┐
│          Supabase Realtime Server               │
│  (Broadcasts changes via WebSocket)             │
└────────────────┬────────────────────────────────┘
                 │
                 ↓ (WebSocket Connection)
┌─────────────────────────────────────────────────┐
│            Customer Portal                      │
│  (Receives instant updates)                     │
└─────────────────────────────────────────────────┘
```

### Components

```
Portal:
├── src/lib/realtime/
│   └── sync.ts                  # Core subscription functions
├── src/hooks/
│   └── useRealtime.ts           # React hooks for easy usage
├── src/components/realtime/
│   └── ConnectionStatus.tsx     # UI components
└── src/app/(dashboard)/
    └── dashboard/
        └── example-realtime-usage.tsx  # Usage examples

CRM:
└── supabase/migrations/
    └── enable_realtime.sql      # Database configuration
```

## Setup

### 1. Enable Realtime in Supabase

Run the migration in Supabase SQL Editor:

```bash
# Navigate to CRM directory
cd dirt-free-crm

# Run migration
supabase migration up enable_realtime
```

Or copy the SQL from `supabase/migrations/enable_realtime.sql` and run manually.

### 2. Verify Realtime is Enabled

In Supabase SQL Editor:

```sql
-- Check which tables have realtime enabled
SELECT tablename
FROM pg_publication_tables
WHERE pubname = 'supabase_realtime';
```

Should show:
- customers
- jobs
- invoices
- messages
- loyalty_transactions

### 3. Configure Environment Variables

No additional environment variables needed! Realtime uses the same Supabase connection as the rest of the app.

### 4. Test Connection

Use the connection status component to verify:

```tsx
import { ConnectionStatus } from '@/components/realtime/ConnectionStatus';

<ConnectionStatus isConnected={true} variant="badge" />
```

## Usage

### Quick Start

The simplest way to add realtime updates to a page:

```tsx
'use client';

import { useJobUpdates } from '@/hooks/useRealtime';
import { toast } from 'sonner';

export default function AppointmentsPage() {
  const customerId = 'customer-id'; // Get from auth

  useJobUpdates(customerId, {
    onInsert: (job) => {
      toast.success('New appointment scheduled!');
    },
    onUpdate: (job, old) => {
      if (old.status !== job.status) {
        toast.info(`Appointment ${job.status}`);
      }
    },
  });

  return <div>Your appointments...</div>;
}
```

### Individual Subscriptions

Subscribe to specific data types:

```tsx
import {
  useJobUpdates,
  useInvoiceUpdates,
  useMessageUpdates,
  useLoyaltyUpdates,
} from '@/hooks/useRealtime';

export default function Dashboard() {
  const customerId = 'customer-id';

  // Jobs
  const jobs = useJobUpdates(customerId, {
    onInsert: (job) => console.log('New job'),
    onUpdate: (job) => console.log('Job updated'),
    onDelete: (job) => console.log('Job deleted'),
  });

  // Invoices
  const invoices = useInvoiceUpdates(customerId, {
    onInsert: (invoice) => console.log('New invoice'),
    onUpdate: (invoice) => console.log('Invoice updated'),
  });

  // Messages
  const messages = useMessageUpdates(customerId, {
    onNewMessage: (msg) => console.log('New message'),
    onMessageRead: (msg) => console.log('Message read'),
  });

  // Loyalty
  const loyalty = useLoyaltyUpdates(customerId, {
    onPointsEarned: (tx) => console.log('Points earned'),
    onPointsRedeemed: (tx) => console.log('Points redeemed'),
  });

  return (
    <div>
      {jobs.isConnected && <span>🟢 Jobs connected</span>}
      {invoices.isConnected && <span>🟢 Invoices connected</span>}
    </div>
  );
}
```

### Combined Subscription (Recommended)

Subscribe to everything at once:

```tsx
import { useAllUpdates } from '@/hooks/useRealtime';

export default function Dashboard() {
  const customerId = 'customer-id';

  const { isConnected, activeSubscriptions } = useAllUpdates(customerId, {
    onJobInsert: (job) => {
      toast.success('New appointment scheduled!');
    },
    onJobUpdate: (job, old) => {
      if (old.status !== job.status) {
        toast.info(`Appointment ${job.status}`);
      }
    },
    onInvoiceInsert: (invoice) => {
      toast.info('New invoice available');
    },
    onInvoiceUpdate: (invoice, old) => {
      if (old.status !== 'paid' && invoice.status === 'paid') {
        toast.success('Payment received!');
      }
    },
    onNewMessage: (message) => {
      toast('New message from Dirt Free');
    },
    onPointsEarned: (transaction) => {
      toast.success(`+${transaction.points} points!`);
    },
  });

  return (
    <div>
      <ConnectionStatus isConnected={isConnected} />
      <p>{activeSubscriptions}/5 connections active</p>
    </div>
  );
}
```

### With State Management

Update component state when data changes:

```tsx
export default function AppointmentsList() {
  const customerId = 'customer-id';
  const [appointments, setAppointments] = useState<any[]>([]);

  useJobUpdates(customerId, {
    onInsert: (newJob) => {
      // Add to beginning of list
      setAppointments(prev => [newJob, ...prev]);
    },
    onUpdate: (updatedJob) => {
      // Update existing job in list
      setAppointments(prev =>
        prev.map(job =>
          job.id === updatedJob.id ? updatedJob : job
        )
      );
    },
    onDelete: (deletedJob) => {
      // Remove from list
      setAppointments(prev =>
        prev.filter(job => job.id !== deletedJob.id)
      );
    },
  });

  return (
    <div>
      {appointments.map(apt => (
        <div key={apt.id}>{apt.service_type}</div>
      ))}
    </div>
  );
}
```

## Components

### ConnectionStatus

Visual indicator of real-time connection status.

**Props:**
```typescript
interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'badge';
}
```

**Variants:**

**Default:**
```tsx
<ConnectionStatus
  isConnected={true}
  showLabel={true}
/>
```
Shows: Large card with icon, status text, and description

**Compact:**
```tsx
<ConnectionStatus
  isConnected={true}
  variant="compact"
  showLabel={true}
/>
```
Shows: Small indicator dot with text

**Badge:**
```tsx
<ConnectionStatus
  isConnected={true}
  variant="badge"
/>
```
Shows: Pill-shaped badge with icon

### RealtimeNotification

Toast-style notification for real-time updates.

```tsx
import { RealtimeNotification } from '@/components/realtime/ConnectionStatus';

<RealtimeNotification
  type="job"
  title="New Appointment"
  message="Carpet cleaning scheduled for March 15"
  onDismiss={() => {}}
  action={{
    label: 'View Details',
    onClick: () => router.push('/appointments/123'),
  }}
/>
```

**Types:**
- `job` - Blue, calendar icon
- `invoice` - Green, dollar icon
- `message` - Purple, chat icon
- `loyalty` - Amber, gift icon
- `info` - Gray, info icon

### MultiSubscriptionStatus

Shows status of multiple subscriptions at once.

```tsx
<MultiSubscriptionStatus
  subscriptions={[
    { name: 'Appointments', isConnected: true },
    { name: 'Invoices', isConnected: true },
    { name: 'Messages', isConnected: false },
  ]}
/>
```

## Hooks

### useJobUpdates

```typescript
const { isConnected, error, latestUpdate } = useJobUpdates(
  customerId,
  {
    onInsert?: (job: any) => void;
    onUpdate?: (job: any, old: any) => void;
    onDelete?: (job: any) => void;
  }
);
```

### useInvoiceUpdates

```typescript
const { isConnected, error, latestUpdate } = useInvoiceUpdates(
  customerId,
  {
    onInsert?: (invoice: any) => void;
    onUpdate?: (invoice: any, old: any) => void;
    onDelete?: (invoice: any) => void;
  }
);
```

### useMessageUpdates

```typescript
const { isConnected, error, unreadCount } = useMessageUpdates(
  customerId,
  {
    onNewMessage?: (message: any) => void;
    onMessageRead?: (message: any) => void;
    onMessageDeleted?: (message: any) => void;
  }
);
```

### useLoyaltyUpdates

```typescript
const { isConnected, error, totalPoints } = useLoyaltyUpdates(
  customerId,
  {
    onPointsEarned?: (transaction: any) => void;
    onPointsRedeemed?: (transaction: any) => void;
  }
);
```

### useAllUpdates

```typescript
const { isConnected, error, activeSubscriptions } = useAllUpdates(
  customerId,
  {
    onJobInsert?: (job: any) => void;
    onJobUpdate?: (job: any, old: any) => void;
    onInvoiceInsert?: (invoice: any) => void;
    onInvoiceUpdate?: (invoice: any, old: any) => void;
    onNewMessage?: (message: any) => void;
    onPointsEarned?: (transaction: any) => void;
    onPointsRedeemed?: (transaction: any) => void;
  }
);
```

### usePresence

Track who's online:

```typescript
const { onlineUsers, isConnected } = usePresence(
  'customer-portal',
  userId,
  { name: 'John Doe', status: 'active' }
);

// onlineUsers = { 'user-1': { name: 'Staff Member' }, ... }
```

## Best Practices

### 1. Only Subscribe to What You Need

Don't subscribe to all data types on every page:

```tsx
// ❌ Bad: Subscribe to everything everywhere
useAllUpdates(customerId, { /* all callbacks */ });

// ✅ Good: Only subscribe to relevant data for the page
// On appointments page
useJobUpdates(customerId, { onInsert, onUpdate });

// On invoices page
useInvoiceUpdates(customerId, { onInsert, onUpdate });
```

### 2. Handle Connection Errors

Always provide feedback when connection fails:

```tsx
const { isConnected, error } = useJobUpdates(customerId, callbacks);

if (error) {
  return (
    <Alert variant="destructive">
      <AlertTitle>Connection Error</AlertTitle>
      <AlertDescription>
        We're having trouble connecting. Please refresh the page.
      </AlertDescription>
    </Alert>
  );
}
```

### 3. Show Connection Status

Let users know when they're getting live updates:

```tsx
<ConnectionStatus
  isConnected={isConnected}
  variant="compact"
/>
```

### 4. Optimize Toast Notifications

Don't spam users with too many toasts:

```tsx
// ❌ Bad: Toast for every update
onUpdate: (job) => {
  toast.info('Job updated');
},

// ✅ Good: Toast only for significant changes
onUpdate: (job, old) => {
  if (old.status !== job.status) {
    toast.info(`Appointment ${job.status}`);
  }
},
```

### 5. Cleanup on Unmount

Hooks handle cleanup automatically, but if using subscriptions directly:

```tsx
useEffect(() => {
  const unsubscribe = subscribeToJobUpdates(
    customerId,
    (payload) => { /* ... */ }
  );

  return () => {
    unsubscribe(); // Important!
  };
}, [customerId]);
```

### 6. Use Optimistic Updates

Update UI immediately, then sync with server:

```tsx
const handleUpdateJob = async (jobId, updates) => {
  // Optimistic update
  setJobs(prev =>
    prev.map(j => j.id === jobId ? { ...j, ...updates } : j)
  );

  try {
    await updateJob(jobId, updates);
    // Realtime will sync the actual result
  } catch (error) {
    // Revert optimistic update
    fetchJobs();
  }
};
```

## Troubleshooting

### Connection Not Establishing

**Problem:** `isConnected` stays `false`

**Solutions:**
1. Check Supabase URL and anon key are correct
2. Verify realtime is enabled for the table (see Setup)
3. Check browser console for WebSocket errors
4. Test in incognito mode (extensions can block WebSockets)

### Not Receiving Updates

**Problem:** Connection is established but updates don't arrive

**Solutions:**
1. Verify RLS policies allow SELECT for the customer
2. Check filter matches customer ID exactly
3. Test by manually updating data in Supabase dashboard
4. Check if table is in realtime publication

### Updates Are Delayed

**Problem:** Updates take several seconds to appear

**Solutions:**
1. Check internet connection speed
2. Verify Supabase region is close to users
3. Monitor Supabase dashboard for rate limiting
4. Consider upgrading Supabase plan if on free tier

### Multiple Connections

**Problem:** Too many WebSocket connections

**Solutions:**
1. Use `useAllUpdates` instead of individual hooks
2. Only subscribe on pages that need it
3. Unsubscribe when navigating away
4. Use selective subscriptions (see Example 4)

### Memory Leaks

**Problem:** Memory usage increases over time

**Solutions:**
1. Ensure hooks properly cleanup on unmount
2. Don't create subscriptions in loops
3. Use `useCallback` for callback functions
4. Monitor with React DevTools Profiler

### RLS Policy Errors

**Problem:** `Row violates RLS policy` errors

**Solutions:**
1. Check auth user has SELECT permission
2. Verify customer.portal_user_id matches auth.uid()
3. Test RLS policy with:
```sql
SELECT * FROM jobs
WHERE customer_id IN (
  SELECT id FROM customers WHERE portal_user_id = auth.uid()
);
```

## Performance Considerations

### Connection Limits

- **Free tier**: 200 concurrent connections
- **Pro tier**: 500 concurrent connections
- **Enterprise**: Custom limits

### Data Transfer

- Each update sends full row data
- Use filters to reduce data transfer
- Consider broadcast for ephemeral data

### Battery Impact

- WebSocket connections use battery
- Consider pausing when app is in background
- Use page visibility API:

```tsx
useEffect(() => {
  const handleVisibilityChange = () => {
    if (document.hidden) {
      // Pause realtime
    } else {
      // Resume realtime
    }
  };

  document.addEventListener('visibilitychange', handleVisibilityChange);
  return () => {
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}, []);
```

## Security

### Row-Level Security

Realtime respects RLS policies. Customers can only receive updates for data they have SELECT permission for.

### Filters

Always use filters in subscriptions:

```tsx
// ✅ Good: Filtered to customer
subscribeToJobUpdates(customerId, callback);

// ❌ Bad: Would receive all jobs (blocked by RLS anyway)
subscribeToJobUpdates('*', callback);
```

### Data Exposure

Only include necessary data in subscriptions. Don't subscribe to sensitive tables.

## Related Documentation

- [Supabase Realtime Docs](https://supabase.com/docs/guides/realtime)
- [Portal Provisioning](../dirt-free-crm/PORTAL_PROVISIONING.md)
- [Website Booking Integration](../dirt-free-crm/docs/WEBSITE_BOOKING_INTEGRATION.md)

## Support

For issues or questions:
- Check Supabase dashboard for connection errors
- Review browser console for WebSocket messages
- Check Sentry for server-side errors
- Contact development team
