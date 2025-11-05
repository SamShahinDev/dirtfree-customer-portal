'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'

export function useUnreadMessages() {
  const [unreadCount, setUnreadCount] = useState(0)
  const [hasNewReplies, setHasNewReplies] = useState(false)
  const supabase = createClient()

  useEffect(() => {
    loadUnreadCount()
    subscribeToReplies()
  }, [])

  const loadUnreadCount = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!customer) return

      // Count messages with unread replies or unread status
      const { data: messages } = await supabase
        .from('messages')
        .select('id, has_unread_replies, status')
        .eq('customer_id', customer.id)

      const unread = messages?.filter(m => m.has_unread_replies || m.status === 'responded').length || 0

      setUnreadCount(unread)
      setHasNewReplies(unread > 0)
    } catch (error) {
      console.error('Error loading unread count:', error)
    }
  }

  const subscribeToReplies = () => {
    const channel = supabase
      .channel('message-replies-notifications')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_replies'
        },
        async (payload: any) => {
          // Only count staff replies
          if (payload.new.is_staff) {
            await loadUnreadCount()
          }
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadUnreadCount()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const markAllAsRead = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .single()

      if (!customer) return

      await supabase
        .from('messages')
        .update({ has_unread_replies: false })
        .eq('customer_id', customer.id)
        .eq('has_unread_replies', true)

      setUnreadCount(0)
      setHasNewReplies(false)
    } catch (error) {
      console.error('Error marking messages as read:', error)
    }
  }

  return {
    unreadCount,
    hasNewReplies,
    refreshUnreadCount: loadUnreadCount,
    markAllAsRead
  }
}
