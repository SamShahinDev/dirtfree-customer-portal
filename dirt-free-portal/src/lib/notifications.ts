/**
 * Notification System Utilities
 *
 * Provides type-safe functions for creating and managing customer notifications
 * in the Dirt Free Customer Portal.
 *
 * Usage:
 * - Import notification helper functions in client or server components
 * - Always pass a Supabase client instance (client or server)
 * - Call appropriate notification function when events occur
 * - Notifications are stored in database and shown in notification center
 */

import type { SupabaseClient } from '@supabase/supabase-js'

// =====================================================
// TYPES
// =====================================================

/**
 * All supported notification types in the system
 */
export type NotificationType =
  | 'appointment_confirmed'
  | 'appointment_reminder'
  | 'appointment_cancelled'
  | 'message_reply'
  | 'invoice_created'
  | 'payment_received'
  | 'loyalty_points_earned'
  | 'reward_available'
  | 'maintenance_due'

/**
 * Notification data structure
 */
export interface Notification {
  id?: string
  customer_id: string
  type: NotificationType
  title: string
  message: string
  read?: boolean
  action_url?: string | null
  metadata?: Record<string, any>
  created_at?: string
}

/**
 * Parameters for creating a notification
 */
export interface CreateNotificationParams {
  customerId: string
  type: NotificationType
  title: string
  message: string
  actionUrl?: string | null
  metadata?: Record<string, any>
}

// =====================================================
// BASE NOTIFICATION FUNCTION
// =====================================================

/**
 * Core function to create a notification in the database
 *
 * @param params - Notification parameters
 * @param supabaseClient - Supabase client instance (required)
 * @returns The created notification or null if error
 */
export async function createNotification(
  params: CreateNotificationParams,
  supabaseClient: SupabaseClient
): Promise<Notification | null> {
  try {
    const notificationData: Notification = {
      customer_id: params.customerId,
      type: params.type,
      title: params.title,
      message: params.message,
      action_url: params.actionUrl || null,
      metadata: params.metadata || {},
      read: false,
    }

    const { data, error } = await supabaseClient
      .from('notifications')
      .insert(notificationData)
      .select()
      .single()

    if (error) {
      console.error('Error creating notification:', error)
      return null
    }

    return data
  } catch (error) {
    console.error('Failed to create notification:', error)
    return null
  }
}

// =====================================================
// NOTIFICATION HELPER FUNCTIONS
// =====================================================

/**
 * Notify customer that their appointment has been confirmed
 */
export async function notifyAppointmentConfirmed(
  customerId: string,
  appointmentDate: string,
  jobId: string,
  supabaseClient: SupabaseClient
): Promise<Notification | null> {
  return createNotification(
    {
      customerId,
      type: 'appointment_confirmed',
      title: 'Appointment Confirmed',
      message: `Your carpet cleaning appointment for ${appointmentDate} has been confirmed!`,
      actionUrl: `/dashboard/jobs/${jobId}`,
      metadata: {
        job_id: jobId,
        appointment_date: appointmentDate,
      },
    },
    supabaseClient
  )
}

/**
 * Notify customer about upcoming appointment
 */
export async function notifyAppointmentReminder(
  customerId: string,
  appointmentDate: string,
  jobId: string,
  hoursUntil: number,
  supabaseClient: SupabaseClient
): Promise<Notification | null> {
  const timeText = hoursUntil === 24
    ? 'tomorrow'
    : `in ${hoursUntil} hours`

  return createNotification(
    {
      customerId,
      type: 'appointment_reminder',
      title: 'Upcoming Appointment',
      message: `Reminder: Your carpet cleaning appointment is ${timeText} on ${appointmentDate}`,
      actionUrl: `/dashboard/jobs/${jobId}`,
      metadata: {
        job_id: jobId,
        appointment_date: appointmentDate,
        hours_until: hoursUntil,
      },
    },
    supabaseClient
  )
}

/**
 * Notify customer that their appointment has been cancelled
 */
export async function notifyAppointmentCancelled(
  customerId: string,
  appointmentDate: string,
  reason?: string,
  jobId?: string,
  supabaseClient: SupabaseClient
): Promise<Notification | null> {
  const message = reason
    ? `Your appointment for ${appointmentDate} has been cancelled. Reason: ${reason}`
    : `Your appointment for ${appointmentDate} has been cancelled.`

  return createNotification(
    {
      customerId,
      type: 'appointment_cancelled',
      title: 'Appointment Cancelled',
      message,
      actionUrl: jobId ? `/dashboard/jobs/${jobId}` : '/dashboard/jobs',
      metadata: {
        job_id: jobId,
        appointment_date: appointmentDate,
        reason: reason || null,
      },
    },
    supabaseClient
  )
}

/**
 * Notify customer of a new reply to their message
 */
export async function notifyMessageReply(
  customerId: string,
  messageSubject: string,
  staffName: string,
  messageId: string,
  replyPreview?: string,
  supabaseClient: SupabaseClient
): Promise<Notification | null> {
  const message = replyPreview
    ? `${staffName} replied to "${messageSubject}": ${replyPreview.substring(0, 100)}...`
    : `${staffName} replied to your message "${messageSubject}"`

  return createNotification(
    {
      customerId,
      type: 'message_reply',
      title: 'New Message Reply',
      message,
      actionUrl: `/dashboard/messages/${messageId}`,
      metadata: {
        message_id: messageId,
        staff_name: staffName,
        subject: messageSubject,
      },
    },
    supabaseClient
  )
}

/**
 * Notify customer that a new invoice has been created
 */
export async function notifyInvoiceCreated(
  customerId: string,
  invoiceNumber: string,
  amount: number,
  invoiceId: string,
  supabaseClient: SupabaseClient
): Promise<Notification | null> {
  return createNotification(
    {
      customerId,
      type: 'invoice_created',
      title: 'New Invoice',
      message: `Invoice #${invoiceNumber} for $${amount.toFixed(2)} has been generated`,
      actionUrl: `/dashboard/invoices/${invoiceId}`,
      metadata: {
        invoice_id: invoiceId,
        invoice_number: invoiceNumber,
        amount: amount,
      },
    },
    supabaseClient
  )
}

/**
 * Notify customer that a payment has been received
 */
export async function notifyPaymentReceived(
  customerId: string,
  amount: number,
  invoiceNumber?: string,
  invoiceId?: string,
  supabaseClient: SupabaseClient
): Promise<Notification | null> {
  const message = invoiceNumber
    ? `Payment of $${amount.toFixed(2)} received for Invoice #${invoiceNumber}. Thank you!`
    : `Payment of $${amount.toFixed(2)} received. Thank you!`

  return createNotification(
    {
      customerId,
      type: 'payment_received',
      title: 'Payment Received',
      message,
      actionUrl: invoiceId ? `/dashboard/invoices/${invoiceId}` : '/dashboard/invoices',
      metadata: {
        invoice_id: invoiceId,
        invoice_number: invoiceNumber,
        amount: amount,
      },
    },
    supabaseClient
  )
}

/**
 * Notify customer that they've earned loyalty points
 */
export async function notifyLoyaltyPointsEarned(
  customerId: string,
  pointsEarned: number,
  totalPoints: number,
  reason: string,
  supabaseClient: SupabaseClient
): Promise<Notification | null> {
  return createNotification(
    {
      customerId,
      type: 'loyalty_points_earned',
      title: 'Points Earned!',
      message: `You earned ${pointsEarned} loyalty points for ${reason}. Total: ${totalPoints} points`,
      actionUrl: '/dashboard/loyalty',
      metadata: {
        points_earned: pointsEarned,
        total_points: totalPoints,
        reason: reason,
      },
    },
    supabaseClient
  )
}

/**
 * Notify customer that a reward is available
 */
export async function notifyRewardAvailable(
  customerId: string,
  rewardName: string,
  rewardValue: string,
  rewardId?: string,
  supabaseClient: SupabaseClient
): Promise<Notification | null> {
  return createNotification(
    {
      customerId,
      type: 'reward_available',
      title: 'Reward Available!',
      message: `You've unlocked a new reward: ${rewardName} (${rewardValue})`,
      actionUrl: '/dashboard/loyalty',
      metadata: {
        reward_id: rewardId,
        reward_name: rewardName,
        reward_value: rewardValue,
      },
    },
    supabaseClient
  )
}

/**
 * Notify customer that maintenance is due for their carpets
 */
export async function notifyMaintenanceDue(
  customerId: string,
  monthsSinceLastService: number,
  lastServiceDate: string,
  supabaseClient: SupabaseClient
): Promise<Notification | null> {
  return createNotification(
    {
      customerId,
      type: 'maintenance_due',
      title: 'Maintenance Reminder',
      message: `It's been ${monthsSinceLastService} months since your last carpet cleaning (${lastServiceDate}). Schedule your next appointment!`,
      actionUrl: '/dashboard/jobs',
      metadata: {
        months_since_service: monthsSinceLastService,
        last_service_date: lastServiceDate,
      },
    },
    supabaseClient
  )
}

// =====================================================
// NOTIFICATION MANAGEMENT FUNCTIONS
// =====================================================

/**
 * Mark a notification as read
 */
export async function markNotificationAsRead(
  notificationId: string,
  supabaseClient: SupabaseClient
): Promise<boolean> {
  try {
    const supabase = supabaseClient

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('id', notificationId)

    if (error) {
      console.error('Error marking notification as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to mark notification as read:', error)
    return false
  }
}

/**
 * Mark all notifications as read for a customer
 */
export async function markAllNotificationsAsRead(
  customerId: string,
  supabaseClient: SupabaseClient
): Promise<boolean> {
  try {
    const supabase = supabaseClient

    const { error } = await supabase
      .from('notifications')
      .update({ read: true })
      .eq('customer_id', customerId)
      .eq('read', false)

    if (error) {
      console.error('Error marking all notifications as read:', error)
      return false
    }

    return true
  } catch (error) {
    console.error('Failed to mark all notifications as read:', error)
    return false
  }
}

/**
 * Get unread notification count for a customer
 */
export async function getUnreadNotificationCount(
  customerId: string,
  supabaseClient: SupabaseClient
): Promise<number> {
  try {
    const supabase = supabaseClient

    const { count, error } = await supabase
      .from('notifications')
      .select('*', { count: 'exact', head: true })
      .eq('customer_id', customerId)
      .eq('read', false)

    if (error) {
      console.error('Error getting unread count:', error)
      return 0
    }

    return count || 0
  } catch (error) {
    console.error('Failed to get unread count:', error)
    return 0
  }
}

/**
 * Get recent notifications for a customer
 */
export async function getRecentNotifications(
  customerId: string,
  limit: number = 10,
  supabaseClient: SupabaseClient
): Promise<Notification[]> {
  try {
    const supabase = supabaseClient

    const { data, error } = await supabase
      .from('notifications')
      .select('*')
      .eq('customer_id', customerId)
      .order('created_at', { ascending: false })
      .limit(limit)

    if (error) {
      console.error('Error fetching notifications:', error)
      return []
    }

    return data || []
  } catch (error) {
    console.error('Failed to fetch notifications:', error)
    return []
  }
}

/**
 * Delete old read notifications (cleanup utility)
 */
export async function deleteOldReadNotifications(
  customerId: string,
  daysOld: number = 30,
  supabaseClient: SupabaseClient
): Promise<number> {
  try {
    const supabase = supabaseClient

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysOld)

    const { data, error } = await supabase
      .from('notifications')
      .delete()
      .eq('customer_id', customerId)
      .eq('read', true)
      .lt('created_at', cutoffDate.toISOString())
      .select('id')

    if (error) {
      console.error('Error deleting old notifications:', error)
      return 0
    }

    return data?.length || 0
  } catch (error) {
    console.error('Failed to delete old notifications:', error)
    return 0
  }
}
