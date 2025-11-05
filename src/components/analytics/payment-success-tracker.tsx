'use client'

import { useEffect } from 'react'
import { analytics } from '@/lib/analytics'

interface PaymentSuccessTrackerProps {
  invoiceId: string
  amount: number
}

export function PaymentSuccessTracker({ invoiceId, amount }: PaymentSuccessTrackerProps) {
  useEffect(() => {
    // Track payment completion
    analytics.track('payment_completed', {
      invoiceId: invoiceId,
      amount: amount,
    })
  }, [invoiceId, amount])

  return null
}
