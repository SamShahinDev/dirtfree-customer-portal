'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import {
  createNotification,
  notifyAppointmentConfirmed,
  notifyMessageReply,
  notifyInvoiceCreated,
} from '@/lib/notifications'

// Helper function to send email notifications via API
async function sendEmailNotification(type: string, data: any) {
  try {
    await fetch('/api/notifications/send-email', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ type, data }),
    })
  } catch (error) {
    console.error('Failed to send email notification:', error)
  }
}

export function NotificationProvider({ customerId }: { customerId: string }) {
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    // Subscribe to job updates
    const jobsChannel = supabase
      .channel('job-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'jobs',
          filter: `customer_id=eq.${customerId}`,
        },
        async (payload) => {
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status
            const jobId = payload.new.id
            const scheduledDate = payload.new.scheduled_date

            if (newStatus === 'confirmed') {
              // Show toast
              toast.success('Your appointment has been confirmed!')

              // Persist notification to database
              await notifyAppointmentConfirmed(
                customerId,
                scheduledDate || 'your scheduled date',
                jobId,
                supabase
              )

              // Send email notification
              await sendEmailNotification('appointment_confirmed', {
                customerId,
                jobId,
              })
            } else if (newStatus === 'in_progress') {
              // Show toast
              toast.info('Your technician is on the way!')

              // Persist notification to database
              await createNotification(
                {
                  customerId,
                  type: 'appointment_confirmed',
                  title: 'Technician En Route',
                  message: 'Your technician is on the way to your location!',
                  actionUrl: `/dashboard/jobs/${jobId}`,
                  metadata: {
                    job_id: jobId,
                    status: 'in_progress',
                  },
                },
                supabase
              )
            } else if (newStatus === 'completed') {
              // Show toast
              toast.success('Service completed! Thank you for choosing Dirt Free.')

              // Persist notification to database
              await createNotification(
                {
                  customerId,
                  type: 'appointment_confirmed',
                  title: 'Service Completed',
                  message: 'Your carpet cleaning service has been completed. Thank you for choosing Dirt Free!',
                  actionUrl: `/dashboard/jobs/${jobId}`,
                  metadata: {
                    job_id: jobId,
                    status: 'completed',
                  },
                },
                supabase
              )
            }

            router.refresh()
          }
        }
      )
      .subscribe()

    // Subscribe to message replies
    const messagesChannel = supabase
      .channel('message-replies')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_replies',
        },
        async (payload) => {
          if (payload.new.is_staff) {
            const messageId = payload.new.message_id
            const replyMessage = payload.new.message
            const staffName = payload.new.staff_name || 'Dirt Free Team'

            // Fetch message subject for better context
            const { data: messageData } = await supabase
              .from('messages')
              .select('subject')
              .eq('id', messageId)
              .single()

            const subject = messageData?.subject || 'your message'

            // Show toast
            toast('New message from Dirt Free', {
              description: 'You have a new reply to your message',
              action: {
                label: 'View',
                onClick: () => router.push(`/dashboard/messages/${messageId}`),
              },
            })

            // Persist notification to database
            await notifyMessageReply(
              customerId,
              subject,
              staffName,
              messageId,
              replyMessage,
              supabase
            )

            // Send email notification
            await sendEmailNotification('message_reply', {
              customerId,
              messageId,
              subject,
              staffName,
              replyText: replyMessage,
            })

            router.refresh()
          }
        }
      )
      .subscribe()

    // Subscribe to invoice updates
    const invoicesChannel = supabase
      .channel('invoice-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'invoices',
          filter: `customer_id=eq.${customerId}`,
        },
        async (payload) => {
          if (payload.eventType === 'INSERT') {
            const invoiceId = payload.new.id
            const invoiceNumber = payload.new.invoice_number || 'N/A'
            const amount = payload.new.total_amount || 0

            // Show toast
            toast('New invoice received', {
              description: 'A new invoice has been generated for your service',
              action: {
                label: 'View',
                onClick: () => router.push('/dashboard/invoices'),
              },
            })

            // Persist notification to database
            await notifyInvoiceCreated(
              customerId,
              invoiceNumber,
              amount,
              invoiceId,
              supabase
            )

            // Send email notification
            await sendEmailNotification('invoice_created', {
              customerId,
              invoiceId,
            })

            router.refresh()
          }
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(jobsChannel)
      supabase.removeChannel(messagesChannel)
      supabase.removeChannel(invoicesChannel)
    }
  }, [customerId, router, supabase])

  return null
}
