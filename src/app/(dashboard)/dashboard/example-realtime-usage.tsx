// src/app/(dashboard)/dashboard/example-realtime-usage.tsx
/**
 * Example: Using Real-Time Updates in Portal Dashboard
 *
 * This is a comprehensive example showing how to use real-time subscriptions
 * in a customer portal dashboard component.
 */

'use client';

import { useEffect, useState } from 'react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ConnectionStatus } from '@/components/realtime/ConnectionStatus';
import {
  useJobUpdates,
  useInvoiceUpdates,
  useMessageUpdates,
  useLoyaltyUpdates,
  useAllUpdates,
} from '@/hooks/useRealtime';

// ==============================================================================
// Example 1: Individual Subscriptions
// ==============================================================================

export function DashboardWithIndividualSubscriptions() {
  const router = useRouter();
  const customerId = 'customer-id'; // Get from auth context

  const [jobs, setJobs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [unreadMessages, setUnreadMessages] = useState(0);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  // Subscribe to job updates
  const jobsConnection = useJobUpdates(customerId, {
    onInsert: (newJob) => {
      setJobs(prev => [newJob, ...prev]);
      toast.success('New appointment scheduled!', {
        description: `${newJob.service_type} on ${new Date(newJob.scheduled_date).toLocaleDateString()}`,
        action: {
          label: 'View',
          onClick: () => router.push(`/appointments/${newJob.id}`),
        },
      });
    },
    onUpdate: (updatedJob, oldJob) => {
      setJobs(prev =>
        prev.map(job => (job.id === updatedJob.id ? updatedJob : job))
      );

      // Notify on status changes
      if (oldJob.status !== updatedJob.status) {
        toast.info(`Appointment status updated`, {
          description: `Your ${updatedJob.service_type} appointment is now ${updatedJob.status}`,
        });
      }
    },
    onDelete: (deletedJob) => {
      setJobs(prev => prev.filter(job => job.id !== deletedJob.id));
      toast.info('Appointment canceled');
    },
  });

  // Subscribe to invoice updates
  const invoicesConnection = useInvoiceUpdates(customerId, {
    onInsert: (newInvoice) => {
      setInvoices(prev => [newInvoice, ...prev]);
      toast.info('New invoice available', {
        description: `Invoice for $${newInvoice.total_amount}`,
        action: {
          label: 'View',
          onClick: () => router.push(`/invoices/${newInvoice.id}`),
        },
      });
    },
    onUpdate: (updatedInvoice, oldInvoice) => {
      setInvoices(prev =>
        prev.map(inv => (inv.id === updatedInvoice.id ? updatedInvoice : inv))
      );

      // Notify on payment received
      if (oldInvoice.status !== 'paid' && updatedInvoice.status === 'paid') {
        toast.success('Payment received!', {
          description: 'Thank you for your payment',
        });
      }
    },
  });

  // Subscribe to message updates
  const messagesConnection = useMessageUpdates(customerId, {
    onNewMessage: (message) => {
      setUnreadMessages(prev => prev + 1);
      toast('New message from Dirt Free', {
        description: message.subject || message.content?.substring(0, 50),
        action: {
          label: 'Read',
          onClick: () => router.push(`/messages/${message.id}`),
        },
      });
    },
    onMessageRead: (message) => {
      setUnreadMessages(prev => Math.max(0, prev - 1));
    },
  });

  // Subscribe to loyalty updates
  const loyaltyConnection = useLoyaltyUpdates(customerId, {
    onPointsEarned: (transaction) => {
      setLoyaltyPoints(prev => prev + transaction.points);
      toast.success(`You earned ${transaction.points} points!`, {
        description: transaction.description,
      });
    },
    onPointsRedeemed: (transaction) => {
      setLoyaltyPoints(prev => prev - transaction.points);
      toast.info(`${transaction.points} points redeemed`, {
        description: transaction.description,
      });
    },
  });

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <ConnectionStatus
        isConnected={
          jobsConnection.isConnected &&
          invoicesConnection.isConnected &&
          messagesConnection.isConnected &&
          loyaltyConnection.isConnected
        }
        variant="badge"
      />

      {/* Dashboard Content */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Upcoming Appointments ({jobs.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Job list */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recent Invoices ({invoices.length})</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Invoice list */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>
              Messages
              {unreadMessages > 0 && (
                <span className="ml-2 px-2 py-1 bg-red-100 text-red-600 text-xs rounded-full">
                  {unreadMessages} new
                </span>
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {/* Message list */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Loyalty Points: {loyaltyPoints}</CardTitle>
          </CardHeader>
          <CardContent>
            {/* Loyalty info */}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// ==============================================================================
// Example 2: Combined Subscriptions (Simpler)
// ==============================================================================

export function DashboardWithCombinedSubscriptions() {
  const router = useRouter();
  const customerId = 'customer-id'; // Get from auth context

  const [jobs, setJobs] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [messages, setMessages] = useState<any[]>([]);
  const [loyaltyPoints, setLoyaltyPoints] = useState(0);

  // Subscribe to all updates at once
  const { isConnected, activeSubscriptions } = useAllUpdates(customerId, {
    // Job updates
    onJobInsert: (job) => {
      setJobs(prev => [job, ...prev]);
      toast.success('New appointment scheduled!');
    },
    onJobUpdate: (job, old) => {
      setJobs(prev => prev.map(j => (j.id === job.id ? job : j)));
      if (old.status !== job.status) {
        toast.info(`Appointment ${job.status}`);
      }
    },

    // Invoice updates
    onInvoiceInsert: (invoice) => {
      setInvoices(prev => [invoice, ...prev]);
      toast.info('New invoice available');
    },
    onInvoiceUpdate: (invoice, old) => {
      setInvoices(prev => prev.map(i => (i.id === invoice.id ? invoice : i)));
      if (old.status !== 'paid' && invoice.status === 'paid') {
        toast.success('Payment received!');
      }
    },

    // Message updates
    onNewMessage: (message) => {
      setMessages(prev => [message, ...prev]);
      toast('New message from Dirt Free', {
        action: {
          label: 'Read',
          onClick: () => router.push(`/messages/${message.id}`),
        },
      });
    },

    // Loyalty updates
    onPointsEarned: (transaction) => {
      setLoyaltyPoints(prev => prev + transaction.points);
      toast.success(`+${transaction.points} points!`);
    },
    onPointsRedeemed: (transaction) => {
      setLoyaltyPoints(prev => prev - transaction.points);
    },
  });

  return (
    <div className="space-y-6">
      {/* Connection Status */}
      <div className="flex items-center justify-between">
        <ConnectionStatus
          isConnected={isConnected}
          variant="compact"
        />
        <span className="text-sm text-gray-500">
          {activeSubscriptions}/5 active connections
        </span>
      </div>

      {/* Dashboard Content */}
      <div className="grid gap-6">
        {/* Your dashboard UI */}
      </div>
    </div>
  );
}

// ==============================================================================
// Example 3: With Error Handling and Reconnection
// ==============================================================================

export function DashboardWithErrorHandling() {
  const customerId = 'customer-id';
  const [retryCount, setRetryCount] = useState(0);

  const jobsConnection = useJobUpdates(customerId, {
    onInsert: (job) => {
      console.log('New job:', job);
    },
  });

  // Handle connection errors
  useEffect(() => {
    if (jobsConnection.error) {
      console.error('Realtime error:', jobsConnection.error);

      // Show user-friendly message
      toast.error('Connection interrupted', {
        description: 'We\'re trying to reconnect...',
      });

      // Implement exponential backoff for retry
      const timeout = Math.min(1000 * Math.pow(2, retryCount), 30000);
      const timer = setTimeout(() => {
        setRetryCount(prev => prev + 1);
        // Trigger reconnection (component will remount subscriptions)
      }, timeout);

      return () => clearTimeout(timer);
    } else {
      // Reset retry count on successful connection
      setRetryCount(0);
    }
  }, [jobsConnection.error, retryCount]);

  // Show connection status to user
  return (
    <div className="space-y-6">
      <ConnectionStatus
        isConnected={jobsConnection.isConnected}
        showLabel
      />

      {jobsConnection.error && (
        <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800">
            Connection error: {jobsConnection.error.message}
          </p>
          <p className="text-xs text-red-600 mt-1">
            Retrying in {Math.min(Math.pow(2, retryCount), 30)} seconds...
          </p>
        </div>
      )}

      {/* Dashboard content */}
    </div>
  );
}

// ==============================================================================
// Example 4: Selective Subscriptions (Performance Optimization)
// ==============================================================================

export function OptimizedDashboard() {
  const customerId = 'customer-id';
  const [activeView, setActiveView] = useState<'jobs' | 'invoices' | 'messages'>('jobs');

  // Only subscribe to what's being viewed
  const jobsEnabled = activeView === 'jobs';
  const invoicesEnabled = activeView === 'invoices';
  const messagesEnabled = activeView === 'messages';

  // Conditionally subscribe
  const jobsConnection = useJobUpdates(
    jobsEnabled ? customerId : undefined,
    {
      onInsert: (job) => console.log('New job'),
    }
  );

  const invoicesConnection = useInvoiceUpdates(
    invoicesEnabled ? customerId : undefined,
    {
      onInsert: (invoice) => console.log('New invoice'),
    }
  );

  const messagesConnection = useMessageUpdates(
    messagesEnabled ? customerId : undefined,
    {
      onNewMessage: (message) => console.log('New message'),
    }
  );

  return (
    <div>
      {/* Tab navigation */}
      <div className="flex gap-4 mb-6">
        <Button
          variant={activeView === 'jobs' ? 'default' : 'outline'}
          onClick={() => setActiveView('jobs')}
        >
          Jobs {jobsConnection.isConnected && '🟢'}
        </Button>
        <Button
          variant={activeView === 'invoices' ? 'default' : 'outline'}
          onClick={() => setActiveView('invoices')}
        >
          Invoices {invoicesConnection.isConnected && '🟢'}
        </Button>
        <Button
          variant={activeView === 'messages' ? 'default' : 'outline'}
          onClick={() => setActiveView('messages')}
        >
          Messages {messagesConnection.isConnected && '🟢'}
        </Button>
      </div>

      {/* Content based on active view */}
      {activeView === 'jobs' && <div>Jobs view</div>}
      {activeView === 'invoices' && <div>Invoices view</div>}
      {activeView === 'messages' && <div>Messages view</div>}
    </div>
  );
}
