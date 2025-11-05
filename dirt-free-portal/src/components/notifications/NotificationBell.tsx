'use client'

import { useState, useEffect } from 'react'
import { Bell, Check, CheckCheck, ExternalLink, Loader2 } from 'lucide-react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { ScrollArea } from '@/components/ui/scroll-area'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import { formatDistanceToNow } from 'date-fns'
import type { Notification } from '@/lib/notifications'
import {
  getCachedNotifications,
  setCachedNotifications,
  getCachedNotificationCount,
  setCachedNotificationCount,
  invalidateNotifications,
} from '@/lib/db-cache'

interface NotificationBellProps {
  customerId: string
}

export function NotificationBell({ customerId }: NotificationBellProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [open, setOpen] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  // Load notifications
  useEffect(() => {
    loadNotifications()
    subscribeToNotifications()
  }, [customerId])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      // Try to get from cache first
      const cachedData = getCachedNotifications(customerId)
      const cachedCount = getCachedNotificationCount(customerId)

      if (cachedData && cachedCount !== undefined) {
        // Use cached data
        setNotifications(cachedData)
        setUnreadCount(cachedCount)
        setLoading(false)
        return
      }

      // Cache miss - fetch from database
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })
        .limit(20)

      if (error) {
        console.error('Error loading notifications:', error)
        return
      }

      const unreadCount = data?.filter((n) => !n.read).length || 0

      // Update state
      setNotifications(data || [])
      setUnreadCount(unreadCount)

      // Store in cache (2 min TTL)
      setCachedNotifications(customerId, data || [])
      setCachedNotificationCount(customerId, unreadCount)
    } catch (error) {
      console.error('Failed to load notifications:', error)
    } finally {
      setLoading(false)
    }
  }

  const subscribeToNotifications = () => {
    const channel = supabase
      .channel(`customer-notifications-${customerId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'notifications',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          setNotifications((prev) => [payload.new as Notification, ...prev])
          setUnreadCount((prev) => prev + 1)
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'notifications',
          filter: `customer_id=eq.${customerId}`,
        },
        (payload) => {
          setNotifications((prev) =>
            prev.map((n) => (n.id === payload.new.id ? (payload.new as Notification) : n))
          )
          // Recalculate unread count
          setUnreadCount(
            notifications.filter((n) => !n.read && n.id !== payload.new.id).length +
              (payload.new.read ? 0 : 1)
          )
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markAsRead = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('id', notificationId)

      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }

      const updatedNotifications = notifications.map((n) =>
        n.id === notificationId ? { ...n, read: true } : n
      )
      const newUnreadCount = Math.max(0, unreadCount - 1)

      setNotifications(updatedNotifications)
      setUnreadCount(newUnreadCount)

      // Invalidate cache so next load gets fresh data
      invalidateNotifications(customerId)

      // Update cache with new values
      setCachedNotifications(customerId, updatedNotifications)
      setCachedNotificationCount(customerId, newUnreadCount)
    } catch (error) {
      console.error('Failed to mark notification as read:', error)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { error } = await supabase
        .from('notifications')
        .update({ read: true })
        .eq('customer_id', customerId)
        .eq('read', false)

      if (error) {
        console.error('Error marking all as read:', error)
        return
      }

      const updatedNotifications = notifications.map((n) => ({ ...n, read: true }))

      setNotifications(updatedNotifications)
      setUnreadCount(0)

      // Invalidate cache so next load gets fresh data
      invalidateNotifications(customerId)

      // Update cache with new values
      setCachedNotifications(customerId, updatedNotifications)
      setCachedNotificationCount(customerId, 0)
    } catch (error) {
      console.error('Failed to mark all as read:', error)
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    // Mark as read
    if (!notification.read) {
      markAsRead(notification.id!)
    }

    // Navigate to action URL if available
    if (notification.action_url) {
      setOpen(false)
      router.push(notification.action_url)
    }
  }

  const getNotificationIcon = (type: string) => {
    // You can customize icons based on notification type
    switch (type) {
      case 'appointment_confirmed':
        return '📅'
      case 'appointment_reminder':
        return '⏰'
      case 'appointment_cancelled':
        return '❌'
      case 'message_reply':
        return '💬'
      case 'invoice_created':
        return '📄'
      case 'payment_received':
        return '💰'
      case 'loyalty_points_earned':
        return '⭐'
      case 'reward_available':
        return '🎁'
      case 'maintenance_due':
        return '🔧'
      default:
        return '🔔'
    }
  }

  const formatTime = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch {
      return 'recently'
    }
  }

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge
              variant="destructive"
              className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs"
            >
              {unreadCount > 9 ? '9+' : unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 sm:w-96 p-0" align="end">
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b">
          <h3 className="font-semibold">Notifications</h3>
          {unreadCount > 0 && (
            <Button
              variant="ghost"
              size="sm"
              onClick={markAllAsRead}
              className="text-xs"
            >
              <CheckCheck className="h-3 w-3 mr-1" />
              Mark all read
            </Button>
          )}
        </div>

        {/* Notifications List */}
        <ScrollArea className="h-[400px]">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
              <Bell className="h-12 w-12 text-muted-foreground/50 mb-2" />
              <p className="text-sm text-muted-foreground">No notifications yet</p>
              <p className="text-xs text-muted-foreground mt-1">
                We'll notify you about important updates
              </p>
            </div>
          ) : (
            <div className="divide-y">
              {notifications.map((notification) => (
                <div
                  key={notification.id}
                  className={`p-4 hover:bg-accent cursor-pointer transition-colors ${
                    !notification.read ? 'bg-blue-50/50' : ''
                  }`}
                  onClick={() => handleNotificationClick(notification)}
                >
                  <div className="flex gap-3">
                    <div className="text-2xl flex-shrink-0">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-semibold text-sm">
                          {notification.title}
                        </p>
                        {!notification.read && (
                          <div className="h-2 w-2 bg-blue-600 rounded-full flex-shrink-0 mt-1" />
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                        {notification.message}
                      </p>
                      <div className="flex items-center gap-2 mt-2">
                        <span className="text-xs text-muted-foreground">
                          {formatTime(notification.created_at!)}
                        </span>
                        {notification.action_url && (
                          <>
                            <span className="text-xs text-muted-foreground">•</span>
                            <span className="text-xs text-blue-600 flex items-center gap-1">
                              View details
                              <ExternalLink className="h-3 w-3" />
                            </span>
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>

        {/* Footer */}
        {notifications.length > 0 && (
          <div className="border-t p-2">
            <Button
              variant="ghost"
              className="w-full text-sm"
              onClick={() => {
                setOpen(false)
                router.push('/dashboard/notifications')
              }}
            >
              View all notifications
            </Button>
          </div>
        )}
      </PopoverContent>
    </Popover>
  )
}
