'use client'

import { useEffect } from 'react'
import { trackPaymentCompleted } from '@/lib/analytics'

interface PaymentSuccessTrackerProps {
  invoiceId: string
  amount: number
}

export function PaymentSuccessTracker({ invoiceId, amount }: PaymentSuccessTrackerProps) {
  useEffect(() => {
    // Track payment completion
    trackPaymentCompleted(amount, invoiceId)
  }, [invoiceId, amount])

  return null
}
