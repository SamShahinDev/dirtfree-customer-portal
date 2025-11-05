'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'

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
        (payload) => {
          if (payload.eventType === 'UPDATE') {
            const newStatus = payload.new.status

            if (newStatus === 'confirmed') {
              toast.success('Your appointment has been confirmed!')
            } else if (newStatus === 'in_progress') {
              toast.info('Your technician is on the way!')
            } else if (newStatus === 'completed') {
              toast.success('Service completed! Thank you for choosing Dirt Free.')
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
        (payload) => {
          if (payload.new.is_staff_reply) {
            toast('New message from Dirt Free', {
              description: 'You have a new reply to your message',
              action: {
                label: 'View',
                onClick: () => router.push(`/dashboard/messages/${payload.new.message_id}`),
              },
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
        (payload) => {
          if (payload.eventType === 'INSERT') {
            toast('New invoice received', {
              description: 'A new invoice has been generated for your service',
              action: {
                label: 'View',
                onClick: () => router.push('/dashboard/invoices'),
              },
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
  }, [customerId, router])

  return null
}
