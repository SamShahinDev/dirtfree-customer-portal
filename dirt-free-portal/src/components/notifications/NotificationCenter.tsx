'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Loader2, Bell, Check, Trash2, ExternalLink } from 'lucide-react'
import { formatDistanceToNow, format } from 'date-fns'
import type { Notification } from '@/lib/notifications'
import { toast } from 'sonner'

interface NotificationCenterProps {
  customerId: string
}

export function NotificationCenter({ customerId }: NotificationCenterProps) {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'all' | 'unread'>('all')
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadNotifications()
  }, [customerId])

  const loadNotifications = async () => {
    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('notifications')
        .select('*')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false })

      if (error) {
        console.error('Error loading notifications:', error)
        toast.error('Failed to load notifications')
        return
      }

      setNotifications(data || [])
    } catch (error) {
      console.error('Failed to load notifications:', error)
      toast.error('Failed to load notifications')
    } finally {
      setLoading(false)
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

      setNotifications((prev) =>
        prev.map((n) => (n.id === notificationId ? { ...n, read: true } : n))
      )
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
        toast.error('Failed to mark all as read')
        return
      }

      setNotifications((prev) => prev.map((n) => ({ ...n, read: true })))
      toast.success('All notifications marked as read')
    } catch (error) {
      console.error('Failed to mark all as read:', error)
      toast.error('Failed to mark all as read')
    }
  }

  const deleteNotification = async (notificationId: string) => {
    try {
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', notificationId)

      if (error) {
        console.error('Error deleting notification:', error)
        toast.error('Failed to delete notification')
        return
      }

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId))
      toast.success('Notification deleted')
    } catch (error) {
      console.error('Failed to delete notification:', error)
      toast.error('Failed to delete notification')
    }
  }

  const handleNotificationClick = (notification: Notification) => {
    if (!notification.read) {
      markAsRead(notification.id!)
    }

    if (notification.action_url) {
      router.push(notification.action_url)
    }
  }

  const getNotificationIcon = (type: string) => {
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
      const date = new Date(dateString)
      const now = new Date()
      const diffInHours = (now.getTime() - date.getTime()) / (1000 * 60 * 60)

      if (diffInHours < 24) {
        return formatDistanceToNow(date, { addSuffix: true })
      }
      return format(date, 'MMM d, yyyy h:mm a')
    } catch {
      return 'recently'
    }
  }

  const filteredNotifications =
    activeTab === 'unread'
      ? notifications.filter((n) => !n.read)
      : notifications

  const unreadCount = notifications.filter((n) => !n.read).length

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as 'all' | 'unread')}>
        <div className="flex items-center justify-between">
          <TabsList>
            <TabsTrigger value="all">
              All ({notifications.length})
            </TabsTrigger>
            <TabsTrigger value="unread">
              Unread ({unreadCount})
            </TabsTrigger>
          </TabsList>

          {unreadCount > 0 && (
            <Button variant="outline" size="sm" onClick={markAllAsRead}>
              <Check className="h-4 w-4 mr-2" />
              Mark all as read
            </Button>
          )}
        </div>

        <TabsContent value={activeTab} className="mt-4 space-y-3">
          {filteredNotifications.length === 0 ? (
            <Card className="p-12">
              <div className="flex flex-col items-center justify-center text-center">
                <Bell className="h-16 w-16 text-muted-foreground/50 mb-4" />
                <h3 className="text-lg font-semibold mb-2">
                  {activeTab === 'unread' ? 'No unread notifications' : 'No notifications yet'}
                </h3>
                <p className="text-sm text-muted-foreground max-w-md">
                  {activeTab === 'unread'
                    ? "You're all caught up! Check back later for updates."
                    : "We'll notify you about appointments, messages, invoices, and more."}
                </p>
              </div>
            </Card>
          ) : (
            filteredNotifications.map((notification) => (
              <Card
                key={notification.id}
                className={`p-4 transition-all hover:shadow-md cursor-pointer ${
                  !notification.read ? 'bg-blue-50/50 border-blue-200' : ''
                }`}
              >
                <div className="flex gap-4">
                  <div className="text-3xl flex-shrink-0">
                    {getNotificationIcon(notification.type)}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold">{notification.title}</h3>
                          {!notification.read && (
                            <Badge variant="default" className="text-xs">
                              New
                            </Badge>
                          )}
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {notification.message}
                        </p>
                      </div>
                      <div className="flex gap-1 flex-shrink-0">
                        {notification.action_url && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNotificationClick(notification)
                            }}
                            title="View details"
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        {!notification.read && (
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={(e) => {
                              e.stopPropagation()
                              markAsRead(notification.id!)
                            }}
                            title="Mark as read"
                          >
                            <Check className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={(e) => {
                            e.stopPropagation()
                            deleteNotification(notification.id!)
                          }}
                          title="Delete"
                          className="text-destructive hover:text-destructive"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-muted-foreground">
                      <span>{formatTime(notification.created_at!)}</span>
                      {notification.action_url && (
                        <>
                          <span>•</span>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleNotificationClick(notification)
                            }}
                            className="text-blue-600 hover:underline"
                          >
                            View details
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </Card>
            ))
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
