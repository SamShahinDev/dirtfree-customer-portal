// src/lib/realtime/sync.ts
/**
 * Real-Time Data Synchronization
 *
 * Provides real-time updates from CRM to Customer Portal using Supabase Realtime.
 * Customers see instant updates when staff make changes in the CRM.
 */

import { createClient } from '@/lib/supabase/client';
import { RealtimeChannel, RealtimePostgresChangesPayload } from '@supabase/supabase-js';

// ============================================================================
// Types
// ============================================================================

export type ChangeEvent = 'INSERT' | 'UPDATE' | 'DELETE' | '*';

export interface RealtimePayload<T = any> {
  eventType: 'INSERT' | 'UPDATE' | 'DELETE';
  new: T;
  old: T;
  errors: string[] | null;
}

export interface SubscriptionOptions {
  onConnect?: () => void;
  onDisconnect?: () => void;
  onError?: (error: Error) => void;
}

// ============================================================================
// Customer Updates
// ============================================================================

/**
 * Subscribe to customer profile updates
 *
 * Receives updates when:
 * - Customer information is updated by staff
 * - Loyalty points change
 * - Account status changes
 */
export function subscribeToCustomerUpdates(
  customerId: string,
  callback: (data: any) => void,
  options?: SubscriptionOptions
): () => void {
  const supabase = createClient();
  let channel: RealtimeChannel;

  try {
    channel = supabase
      .channel(`customer:${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'customers',
          filter: `id=eq.${customerId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[Realtime] Customer updated:', payload);
          callback({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
            errors: payload.errors,
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Customer subscription active');
          options?.onConnect?.();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Customer subscription error');
          options?.onError?.(new Error('Channel error'));
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Customer subscription timeout');
          options?.onError?.(new Error('Connection timeout'));
        } else if (status === 'CLOSED') {
          console.log('[Realtime] Customer subscription closed');
          options?.onDisconnect?.();
        }
      });

    return () => {
      console.log('[Realtime] Unsubscribing from customer updates');
      channel.unsubscribe();
    };
  } catch (error) {
    console.error('[Realtime] Error setting up customer subscription:', error);
    options?.onError?.(error instanceof Error ? error : new Error('Unknown error'));
    return () => {};
  }
}

// ============================================================================
// Job/Appointment Updates
// ============================================================================

/**
 * Subscribe to job/appointment updates
 *
 * Receives updates when:
 * - New appointments are scheduled
 * - Appointment status changes (confirmed, in-progress, completed, etc.)
 * - Appointment time/date changes
 * - Technician assignment changes
 */
export function subscribeToJobUpdates(
  customerId: string,
  callback: (payload: RealtimePayload) => void,
  options?: SubscriptionOptions
): () => void {
  const supabase = createClient();
  let channel: RealtimeChannel;

  try {
    channel = supabase
      .channel(`jobs:${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[Realtime] Job updated:', payload);
          callback({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
            errors: payload.errors,
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Jobs subscription active');
          options?.onConnect?.();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Jobs subscription error');
          options?.onError?.(new Error('Channel error'));
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Jobs subscription timeout');
          options?.onError?.(new Error('Connection timeout'));
        } else if (status === 'CLOSED') {
          console.log('[Realtime] Jobs subscription closed');
          options?.onDisconnect?.();
        }
      });

    return () => {
      console.log('[Realtime] Unsubscribing from job updates');
      channel.unsubscribe();
    };
  } catch (error) {
    console.error('[Realtime] Error setting up jobs subscription:', error);
    options?.onError?.(error instanceof Error ? error : new Error('Unknown error'));
    return () => {};
  }
}

// ============================================================================
// Invoice Updates
// ============================================================================

/**
 * Subscribe to invoice updates
 *
 * Receives updates when:
 * - New invoices are created
 * - Invoice status changes (draft, sent, paid, overdue)
 * - Payment is received
 * - Invoice amount changes
 */
export function subscribeToInvoiceUpdates(
  customerId: string,
  callback: (payload: RealtimePayload) => void,
  options?: SubscriptionOptions
): () => void {
  const supabase = createClient();
  let channel: RealtimeChannel;

  try {
    channel = supabase
      .channel(`invoices:${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[Realtime] Invoice updated:', payload);
          callback({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
            errors: payload.errors,
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Invoices subscription active');
          options?.onConnect?.();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Invoices subscription error');
          options?.onError?.(new Error('Channel error'));
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Invoices subscription timeout');
          options?.onError?.(new Error('Connection timeout'));
        } else if (status === 'CLOSED') {
          console.log('[Realtime] Invoices subscription closed');
          options?.onDisconnect?.();
        }
      });

    return () => {
      console.log('[Realtime] Unsubscribing from invoice updates');
      channel.unsubscribe();
    };
  } catch (error) {
    console.error('[Realtime] Error setting up invoices subscription:', error);
    options?.onError?.(error instanceof Error ? error : new Error('Unknown error'));
    return () => {};
  }
}

// ============================================================================
// Message Updates
// ============================================================================

/**
 * Subscribe to message updates
 *
 * Receives updates when:
 * - Staff sends a new message
 * - Message is marked as read
 * - Message is deleted
 */
export function subscribeToMessageUpdates(
  customerId: string,
  callback: (payload: RealtimePayload) => void,
  options?: SubscriptionOptions
): () => void {
  const supabase = createClient();
  let channel: RealtimeChannel;

  try {
    channel = supabase
      .channel(`messages:${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[Realtime] Message updated:', payload);
          callback({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
            errors: payload.errors,
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Messages subscription active');
          options?.onConnect?.();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Messages subscription error');
          options?.onError?.(new Error('Channel error'));
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Messages subscription timeout');
          options?.onError?.(new Error('Connection timeout'));
        } else if (status === 'CLOSED') {
          console.log('[Realtime] Messages subscription closed');
          options?.onDisconnect?.();
        }
      });

    return () => {
      console.log('[Realtime] Unsubscribing from message updates');
      channel.unsubscribe();
    };
  } catch (error) {
    console.error('[Realtime] Error setting up messages subscription:', error);
    options?.onError?.(error instanceof Error ? error : new Error('Unknown error'));
    return () => {};
  }
}

// ============================================================================
// Loyalty Points Updates
// ============================================================================

/**
 * Subscribe to loyalty points/transactions updates
 *
 * Receives updates when:
 * - Points are earned
 * - Points are redeemed
 * - Bonus points are awarded
 * - Points expire
 */
export function subscribeToLoyaltyUpdates(
  customerId: string,
  callback: (payload: RealtimePayload) => void,
  options?: SubscriptionOptions
): () => void {
  const supabase = createClient();
  let channel: RealtimeChannel;

  try {
    channel = supabase
      .channel(`loyalty:${customerId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'loyalty_transactions',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload: RealtimePostgresChangesPayload<any>) => {
          console.log('[Realtime] Loyalty updated:', payload);
          callback({
            eventType: payload.eventType,
            new: payload.new,
            old: payload.old,
            errors: payload.errors,
          });
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Loyalty subscription active');
          options?.onConnect?.();
        } else if (status === 'CHANNEL_ERROR') {
          console.error('[Realtime] Loyalty subscription error');
          options?.onError?.(new Error('Channel error'));
        } else if (status === 'TIMED_OUT') {
          console.error('[Realtime] Loyalty subscription timeout');
          options?.onError?.(new Error('Connection timeout'));
        } else if (status === 'CLOSED') {
          console.log('[Realtime] Loyalty subscription closed');
          options?.onDisconnect?.();
        }
      });

    return () => {
      console.log('[Realtime] Unsubscribing from loyalty updates');
      channel.unsubscribe();
    };
  } catch (error) {
    console.error('[Realtime] Error setting up loyalty subscription:', error);
    options?.onError?.(error instanceof Error ? error : new Error('Unknown error'));
    return () => {};
  }
}

// ============================================================================
// Subscribe to All Updates (Convenience Function)
// ============================================================================

/**
 * Subscribe to all customer-related updates at once
 *
 * Returns an unsubscribe function that cleans up all subscriptions
 */
export function subscribeToAllUpdates(
  customerId: string,
  callbacks: {
    onCustomerUpdate?: (payload: RealtimePayload) => void;
    onJobUpdate?: (payload: RealtimePayload) => void;
    onInvoiceUpdate?: (payload: RealtimePayload) => void;
    onMessageUpdate?: (payload: RealtimePayload) => void;
    onLoyaltyUpdate?: (payload: RealtimePayload) => void;
  },
  options?: SubscriptionOptions
): () => void {
  const unsubscribers: Array<() => void> = [];

  if (callbacks.onCustomerUpdate) {
    unsubscribers.push(
      subscribeToCustomerUpdates(customerId, callbacks.onCustomerUpdate, options)
    );
  }

  if (callbacks.onJobUpdate) {
    unsubscribers.push(
      subscribeToJobUpdates(customerId, callbacks.onJobUpdate, options)
    );
  }

  if (callbacks.onInvoiceUpdate) {
    unsubscribers.push(
      subscribeToInvoiceUpdates(customerId, callbacks.onInvoiceUpdate, options)
    );
  }

  if (callbacks.onMessageUpdate) {
    unsubscribers.push(
      subscribeToMessageUpdates(customerId, callbacks.onMessageUpdate, options)
    );
  }

  if (callbacks.onLoyaltyUpdate) {
    unsubscribers.push(
      subscribeToLoyaltyUpdates(customerId, callbacks.onLoyaltyUpdate, options)
    );
  }

  // Return combined unsubscribe function
  return () => {
    console.log('[Realtime] Unsubscribing from all updates');
    unsubscribers.forEach(unsub => unsub());
  };
}

// ============================================================================
// Presence (Online Status)
// ============================================================================

/**
 * Subscribe to presence channel to see who's online
 * Useful for showing "Staff is typing..." or "Staff is viewing your profile"
 */
export function subscribeToPresence(
  channelName: string,
  userId: string,
  metadata: Record<string, any>,
  callbacks: {
    onJoin?: (key: string, currentPresence: any, newPresence: any) => void;
    onLeave?: (key: string, currentPresence: any, leftPresence: any) => void;
    onSync?: () => void;
  }
): () => void {
  const supabase = createClient();
  let channel: RealtimeChannel;

  try {
    channel = supabase.channel(channelName, {
      config: {
        presence: {
          key: userId,
        },
      },
    });

    // Track presence
    channel
      .on('presence', { event: 'sync' }, () => {
        console.log('[Realtime] Presence synced');
        callbacks.onSync?.();
      })
      .on('presence', { event: 'join' }, ({ key, newPresences }) => {
        console.log('[Realtime] User joined:', key);
        callbacks.onJoin?.(key, channel.presenceState(), newPresences);
      })
      .on('presence', { event: 'leave' }, ({ key, leftPresences }) => {
        console.log('[Realtime] User left:', key);
        callbacks.onLeave?.(key, channel.presenceState(), leftPresences);
      })
      .subscribe(async (status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Presence subscription active');
          await channel.track(metadata);
        }
      });

    return () => {
      console.log('[Realtime] Unsubscribing from presence');
      channel.untrack();
      channel.unsubscribe();
    };
  } catch (error) {
    console.error('[Realtime] Error setting up presence:', error);
    return () => {};
  }
}

// ============================================================================
// Broadcast (Ephemeral Messages)
// ============================================================================

/**
 * Subscribe to broadcast channel for ephemeral messages
 * Useful for typing indicators, temporary notifications, etc.
 */
export function subscribeToBroadcast(
  channelName: string,
  eventName: string,
  callback: (payload: any) => void
): () => void {
  const supabase = createClient();
  let channel: RealtimeChannel;

  try {
    channel = supabase
      .channel(channelName)
      .on('broadcast', { event: eventName }, (payload) => {
        console.log('[Realtime] Broadcast received:', payload);
        callback(payload);
      })
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log('[Realtime] Broadcast subscription active');
        }
      });

    return () => {
      console.log('[Realtime] Unsubscribing from broadcast');
      channel.unsubscribe();
    };
  } catch (error) {
    console.error('[Realtime] Error setting up broadcast:', error);
    return () => {};
  }
}

/**
 * Send a broadcast message
 */
export async function sendBroadcast(
  channelName: string,
  eventName: string,
  payload: any
): Promise<void> {
  const supabase = createClient();

  try {
    const channel = supabase.channel(channelName);

    await channel.subscribe(async (status) => {
      if (status === 'SUBSCRIBED') {
        await channel.send({
          type: 'broadcast',
          event: eventName,
          payload,
        });
      }
    });
  } catch (error) {
    console.error('[Realtime] Error sending broadcast:', error);
    throw error;
  }
}
