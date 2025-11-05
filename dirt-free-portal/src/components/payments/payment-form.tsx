'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import {
  useStripe,
  useElements,
  PaymentElement,
} from '@stripe/react-stripe-js'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface PaymentFormProps {
  invoiceId: string
  amount: number
}

export function PaymentForm({ invoiceId, amount }: PaymentFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const router = useRouter()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) return

    setLoading(true)

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/dashboard/invoices/${invoiceId}/success`,
      },
    })

    if (error) {
      toast.error(error.message || 'Payment failed')
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />

      <div className="pt-4">
        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={!stripe || loading}
        >
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Processing...
            </>
          ) : (
            `Pay ${formatCurrency(amount)}`
          )}
        </Button>
      </div>

      <p className="text-xs text-center text-muted-foreground">
        Your payment information is secure and encrypted
      </p>
    </form>
  )
}
