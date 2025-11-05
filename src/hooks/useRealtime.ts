// src/hooks/useRealtime.ts
/**
 * React Hooks for Real-Time Data Synchronization
 *
 * Provides easy-to-use hooks for subscribing to real-time updates
 * with automatic cleanup and state management.
 */

import { useEffect, useState, useCallback, useRef } from 'react';
import {
  subscribeToCustomerUpdates,
  subscribeToJobUpdates,
  subscribeToInvoiceUpdates,
  subscribeToMessageUpdates,
  subscribeToLoyaltyUpdates,
  subscribeToAllUpdates,
  subscribeToPresence,
  RealtimePayload,
  SubscriptionOptions,
} from '@/lib/realtime/sync';

// ============================================================================
// Connection Status Hook
// ============================================================================

export interface ConnectionStatus {
  isConnected: boolean;
  isConnecting: boolean;
  error: Error | null;
  reconnectAttempts: number;
}

export function useConnectionStatus(): ConnectionStatus {
  const [status, setStatus] = useState<ConnectionStatus>({
    isConnected: false,
    isConnecting: true,
    error: null,
    reconnectAttempts: 0,
  });

  return status;
}

// ============================================================================
// Customer Updates Hook
// ============================================================================

export function useCustomerUpdates(
  customerId: string | undefined,
  onUpdate?: (data: any) => void
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    if (!customerId) return;

    const options: SubscriptionOptions = {
      onConnect: () => {
        setIsConnected(true);
        setError(null);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onError: (err) => {
        setError(err);
        setIsConnected(false);
      },
    };

    const unsubscribe = subscribeToCustomerUpdates(
      customerId,
      (data) => {
        onUpdate?.(data);
      },
      options
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [customerId, onUpdate]);

  return { isConnected, error };
}

// ============================================================================
// Job Updates Hook
// ============================================================================

export function useJobUpdates(
  customerId: string | undefined,
  callbacks?: {
    onInsert?: (job: any) => void;
    onUpdate?: (job: any, old: any) => void;
    onDelete?: (job: any) => void;
  }
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [latestUpdate, setLatestUpdate] = useState<RealtimePayload | null>(null);

  useEffect(() => {
    if (!customerId) return;

    const options: SubscriptionOptions = {
      onConnect: () => {
        setIsConnected(true);
        setError(null);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onError: (err) => {
        setError(err);
        setIsConnected(false);
      },
    };

    const unsubscribe = subscribeToJobUpdates(
      customerId,
      (payload) => {
        setLatestUpdate(payload);

        switch (payload.eventType) {
          case 'INSERT':
            callbacks?.onInsert?.(payload.new);
            break;
          case 'UPDATE':
            callbacks?.onUpdate?.(payload.new, payload.old);
            break;
          case 'DELETE':
            callbacks?.onDelete?.(payload.old);
            break;
        }
      },
      options
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [customerId, callbacks?.onInsert, callbacks?.onUpdate, callbacks?.onDelete]);

  return { isConnected, error, latestUpdate };
}

// ============================================================================
// Invoice Updates Hook
// ============================================================================

export function useInvoiceUpdates(
  customerId: string | undefined,
  callbacks?: {
    onInsert?: (invoice: any) => void;
    onUpdate?: (invoice: any, old: any) => void;
    onDelete?: (invoice: any) => void;
  }
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [latestUpdate, setLatestUpdate] = useState<RealtimePayload | null>(null);

  useEffect(() => {
    if (!customerId) return;

    const options: SubscriptionOptions = {
      onConnect: () => {
        setIsConnected(true);
        setError(null);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onError: (err) => {
        setError(err);
        setIsConnected(false);
      },
    };

    const unsubscribe = subscribeToInvoiceUpdates(
      customerId,
      (payload) => {
        setLatestUpdate(payload);

        switch (payload.eventType) {
          case 'INSERT':
            callbacks?.onInsert?.(payload.new);
            break;
          case 'UPDATE':
            callbacks?.onUpdate?.(payload.new, payload.old);
            break;
          case 'DELETE':
            callbacks?.onDelete?.(payload.old);
            break;
        }
      },
      options
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [customerId, callbacks?.onInsert, callbacks?.onUpdate, callbacks?.onDelete]);

  return { isConnected, error, latestUpdate };
}

// ============================================================================
// Message Updates Hook
// ============================================================================

export function useMessageUpdates(
  customerId: string | undefined,
  callbacks?: {
    onNewMessage?: (message: any) => void;
    onMessageRead?: (message: any) => void;
    onMessageDeleted?: (message: any) => void;
  }
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    if (!customerId) return;

    const options: SubscriptionOptions = {
      onConnect: () => {
        setIsConnected(true);
        setError(null);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onError: (err) => {
        setError(err);
        setIsConnected(false);
      },
    };

    const unsubscribe = subscribeToMessageUpdates(
      customerId,
      (payload) => {
        switch (payload.eventType) {
          case 'INSERT':
            callbacks?.onNewMessage?.(payload.new);
            if (!payload.new.read) {
              setUnreadCount(prev => prev + 1);
            }
            break;
          case 'UPDATE':
            if (payload.old.read === false && payload.new.read === true) {
              callbacks?.onMessageRead?.(payload.new);
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
            break;
          case 'DELETE':
            callbacks?.onMessageDeleted?.(payload.old);
            if (!payload.old.read) {
              setUnreadCount(prev => Math.max(0, prev - 1));
            }
            break;
        }
      },
      options
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [customerId, callbacks?.onNewMessage, callbacks?.onMessageRead, callbacks?.onMessageDeleted]);

  return { isConnected, error, unreadCount };
}

// ============================================================================
// Loyalty Updates Hook
// ============================================================================

export function useLoyaltyUpdates(
  customerId: string | undefined,
  callbacks?: {
    onPointsEarned?: (transaction: any) => void;
    onPointsRedeemed?: (transaction: any) => void;
  }
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [totalPoints, setTotalPoints] = useState(0);

  useEffect(() => {
    if (!customerId) return;

    const options: SubscriptionOptions = {
      onConnect: () => {
        setIsConnected(true);
        setError(null);
      },
      onDisconnect: () => {
        setIsConnected(false);
      },
      onError: (err) => {
        setError(err);
        setIsConnected(false);
      },
    };

    const unsubscribe = subscribeToLoyaltyUpdates(
      customerId,
      (payload) => {
        if (payload.eventType === 'INSERT') {
          const points = payload.new.points || 0;
          const transactionType = payload.new.transaction_type;

          if (transactionType === 'earned' || transactionType === 'bonus' || transactionType === 'signup_bonus') {
            setTotalPoints(prev => prev + points);
            callbacks?.onPointsEarned?.(payload.new);
          } else if (transactionType === 'redeemed') {
            setTotalPoints(prev => prev - points);
            callbacks?.onPointsRedeemed?.(payload.new);
          }
        }
      },
      options
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [customerId, callbacks?.onPointsEarned, callbacks?.onPointsRedeemed]);

  return { isConnected, error, totalPoints };
}

// ============================================================================
// All Updates Hook (Kitchen Sink)
// ============================================================================

export interface AllUpdatesCallbacks {
  onCustomerUpdate?: (payload: RealtimePayload) => void;
  onJobInsert?: (job: any) => void;
  onJobUpdate?: (job: any, old: any) => void;
  onJobDelete?: (job: any) => void;
  onInvoiceInsert?: (invoice: any) => void;
  onInvoiceUpdate?: (invoice: any, old: any) => void;
  onInvoiceDelete?: (invoice: any) => void;
  onNewMessage?: (message: any) => void;
  onMessageRead?: (message: any) => void;
  onPointsEarned?: (transaction: any) => void;
  onPointsRedeemed?: (transaction: any) => void;
}

export function useAllUpdates(
  customerId: string | undefined,
  callbacks: AllUpdatesCallbacks
) {
  const [isConnected, setIsConnected] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const [activeSubscriptions, setActiveSubscriptions] = useState(0);

  useEffect(() => {
    if (!customerId) return;

    let connectedCount = 0;
    const totalSubscriptions = Object.keys(callbacks).filter(key => callbacks[key as keyof AllUpdatesCallbacks]).length;

    const options: SubscriptionOptions = {
      onConnect: () => {
        connectedCount++;
        setActiveSubscriptions(connectedCount);
        if (connectedCount === totalSubscriptions) {
          setIsConnected(true);
          setError(null);
        }
      },
      onDisconnect: () => {
        connectedCount--;
        setActiveSubscriptions(connectedCount);
        if (connectedCount === 0) {
          setIsConnected(false);
        }
      },
      onError: (err) => {
        setError(err);
      },
    };

    const unsubscribe = subscribeToAllUpdates(
      customerId,
      {
        onCustomerUpdate: callbacks.onCustomerUpdate,
        onJobUpdate: (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              callbacks.onJobInsert?.(payload.new);
              break;
            case 'UPDATE':
              callbacks.onJobUpdate?.(payload.new, payload.old);
              break;
            case 'DELETE':
              callbacks.onJobDelete?.(payload.old);
              break;
          }
        },
        onInvoiceUpdate: (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              callbacks.onInvoiceInsert?.(payload.new);
              break;
            case 'UPDATE':
              callbacks.onInvoiceUpdate?.(payload.new, payload.old);
              break;
            case 'DELETE':
              callbacks.onInvoiceDelete?.(payload.old);
              break;
          }
        },
        onMessageUpdate: (payload) => {
          switch (payload.eventType) {
            case 'INSERT':
              callbacks.onNewMessage?.(payload.new);
              break;
            case 'UPDATE':
              if (payload.old.read === false && payload.new.read === true) {
                callbacks.onMessageRead?.(payload.new);
              }
              break;
          }
        },
        onLoyaltyUpdate: (payload) => {
          if (payload.eventType === 'INSERT') {
            const transactionType = payload.new.transaction_type;
            if (transactionType === 'earned' || transactionType === 'bonus' || transactionType === 'signup_bonus') {
              callbacks.onPointsEarned?.(payload.new);
            } else if (transactionType === 'redeemed') {
              callbacks.onPointsRedeemed?.(payload.new);
            }
          }
        },
      },
      options
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
      setActiveSubscriptions(0);
    };
  }, [customerId, ...Object.values(callbacks)]);

  return { isConnected, error, activeSubscriptions };
}

// ============================================================================
// Presence Hook
// ============================================================================

export function usePresence(
  channelName: string,
  userId: string | undefined,
  metadata: Record<string, any>
) {
  const [onlineUsers, setOnlineUsers] = useState<Record<string, any>>({});
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    if (!userId) return;

    const unsubscribe = subscribeToPresence(
      channelName,
      userId,
      metadata,
      {
        onJoin: (key, currentPresence, newPresence) => {
          setOnlineUsers(currentPresence);
        },
        onLeave: (key, currentPresence, leftPresence) => {
          setOnlineUsers(currentPresence);
        },
        onSync: () => {
          setIsConnected(true);
        },
      }
    );

    return () => {
      unsubscribe();
      setIsConnected(false);
    };
  }, [channelName, userId, JSON.stringify(metadata)]);

  return { onlineUsers, isConnected };
}
