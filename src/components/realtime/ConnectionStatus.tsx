// src/components/realtime/ConnectionStatus.tsx
'use client';

import { useState, useEffect } from 'react';
import { Wifi, WifiOff, RefreshCw } from 'lucide-react';
import { cn } from '@/lib/utils';

// ============================================================================
// Types
// ============================================================================

export interface ConnectionStatusProps {
  isConnected: boolean;
  className?: string;
  showLabel?: boolean;
  variant?: 'default' | 'compact' | 'badge';
}

// ============================================================================
// Component
// ============================================================================

export function ConnectionStatus({
  isConnected,
  className,
  showLabel = true,
  variant = 'default',
}: ConnectionStatusProps) {
  const [isReconnecting, setIsReconnecting] = useState(false);
  const [lastConnectedTime, setLastConnectedTime] = useState<Date | null>(null);

  useEffect(() => {
    if (isConnected) {
      setLastConnectedTime(new Date());
      setIsReconnecting(false);
    } else if (lastConnectedTime) {
      // If we were connected before and now we're not, we're reconnecting
      setIsReconnecting(true);
    }
  }, [isConnected, lastConnectedTime]);

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-2', className)}>
        {isConnected ? (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            {showLabel && <span className="text-xs text-green-600">Live</span>}
          </div>
        ) : isReconnecting ? (
          <div className="flex items-center gap-1.5">
            <RefreshCw className="w-3 h-3 text-amber-500 animate-spin" />
            {showLabel && <span className="text-xs text-amber-600">Reconnecting</span>}
          </div>
        ) : (
          <div className="flex items-center gap-1.5">
            <div className="w-2 h-2 bg-gray-400 rounded-full" />
            {showLabel && <span className="text-xs text-gray-500">Offline</span>}
          </div>
        )}
      </div>
    );
  }

  if (variant === 'badge') {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium transition-all',
          isConnected
            ? 'bg-green-100 text-green-700 border border-green-200'
            : isReconnecting
            ? 'bg-amber-100 text-amber-700 border border-amber-200'
            : 'bg-gray-100 text-gray-600 border border-gray-200',
          className
        )}
      >
        {isConnected ? (
          <>
            <Wifi className="w-3.5 h-3.5" />
            <span>Real-time updates active</span>
          </>
        ) : isReconnecting ? (
          <>
            <RefreshCw className="w-3.5 h-3.5 animate-spin" />
            <span>Reconnecting...</span>
          </>
        ) : (
          <>
            <WifiOff className="w-3.5 h-3.5" />
            <span>Offline</span>
          </>
        )}
      </div>
    );
  }

  // Default variant
  return (
    <div
      className={cn(
        'flex items-center gap-3 p-3 rounded-lg border transition-all',
        isConnected
          ? 'bg-green-50 border-green-200'
          : isReconnecting
          ? 'bg-amber-50 border-amber-200'
          : 'bg-gray-50 border-gray-200',
        className
      )}
    >
      <div className="flex-shrink-0">
        {isConnected ? (
          <Wifi className="w-5 h-5 text-green-600" />
        ) : isReconnecting ? (
          <RefreshCw className="w-5 h-5 text-amber-600 animate-spin" />
        ) : (
          <WifiOff className="w-5 h-5 text-gray-500" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <span
            className={cn(
              'text-sm font-medium',
              isConnected
                ? 'text-green-700'
                : isReconnecting
                ? 'text-amber-700'
                : 'text-gray-600'
            )}
          >
            {isConnected
              ? 'Connected'
              : isReconnecting
              ? 'Reconnecting...'
              : 'Disconnected'}
          </span>
          {isConnected && (
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
          )}
        </div>
        {showLabel && (
          <p
            className={cn(
              'text-xs mt-0.5',
              isConnected
                ? 'text-green-600'
                : isReconnecting
                ? 'text-amber-600'
                : 'text-gray-500'
            )}
          >
            {isConnected
              ? 'You'll receive instant updates'
              : isReconnecting
              ? 'Attempting to restore connection'
              : 'Updates paused - will resume when online'}
          </p>
        )}
      </div>
    </div>
  );
}

// ============================================================================
// Notification Toast Component
// ============================================================================

export interface RealtimeNotificationProps {
  type: 'job' | 'invoice' | 'message' | 'loyalty' | 'info';
  title: string;
  message: string;
  onDismiss?: () => void;
  action?: {
    label: string;
    onClick: () => void;
  };
}

export function RealtimeNotification({
  type,
  title,
  message,
  onDismiss,
  action,
}: RealtimeNotificationProps) {
  const icons = {
    job: '📅',
    invoice: '💵',
    message: '💬',
    loyalty: '🎁',
    info: 'ℹ️',
  };

  const colors = {
    job: 'border-blue-200 bg-blue-50',
    invoice: 'border-green-200 bg-green-50',
    message: 'border-purple-200 bg-purple-50',
    loyalty: 'border-amber-200 bg-amber-50',
    info: 'border-gray-200 bg-gray-50',
  };

  return (
    <div
      className={cn(
        'flex items-start gap-3 p-4 rounded-lg border shadow-lg animate-in slide-in-from-right',
        colors[type]
      )}
    >
      <span className="text-2xl flex-shrink-0">{icons[type]}</span>
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-sm text-gray-900">{title}</h4>
        <p className="text-sm text-gray-600 mt-1">{message}</p>
        {action && (
          <button
            onClick={action.onClick}
            className="text-sm font-medium text-blue-600 hover:text-blue-700 mt-2"
          >
            {action.label} →
          </button>
        )}
      </div>
      {onDismiss && (
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600"
        >
          <span className="sr-only">Dismiss</span>
          ✕
        </button>
      )}
    </div>
  );
}

// ============================================================================
// Multi-Subscription Status Component
// ============================================================================

export interface MultiSubscriptionStatusProps {
  subscriptions: {
    name: string;
    isConnected: boolean;
  }[];
  className?: string;
}

export function MultiSubscriptionStatus({
  subscriptions,
  className,
}: MultiSubscriptionStatusProps) {
  const allConnected = subscriptions.every(sub => sub.isConnected);
  const someConnected = subscriptions.some(sub => sub.isConnected);
  const connectedCount = subscriptions.filter(sub => sub.isConnected).length;
  const totalCount = subscriptions.length;

  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between text-sm">
        <span className="font-medium text-gray-700">Real-time Connections</span>
        <span
          className={cn(
            'text-xs font-medium',
            allConnected
              ? 'text-green-600'
              : someConnected
              ? 'text-amber-600'
              : 'text-gray-500'
          )}
        >
          {connectedCount}/{totalCount} active
        </span>
      </div>
      <div className="space-y-1">
        {subscriptions.map((sub, index) => (
          <div key={index} className="flex items-center gap-2 text-xs">
            <div
              className={cn(
                'w-1.5 h-1.5 rounded-full',
                sub.isConnected ? 'bg-green-500' : 'bg-gray-300'
              )}
            />
            <span className={cn(
              sub.isConnected ? 'text-gray-700' : 'text-gray-400'
            )}>
              {sub.name}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
