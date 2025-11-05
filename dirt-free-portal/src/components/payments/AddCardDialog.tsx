'use client'

import { useState, useEffect } from 'react'
import { loadStripe } from '@stripe/stripe-js'
import {
  Elements,
  PaymentElement,
  useStripe,
  useElements,
} from '@stripe/react-stripe-js'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface AddCardDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  customerId: string
  onSuccess: () => void
}

function AddCardForm({ onSuccess, onCancel }: { onSuccess: () => void; onCancel: () => void }) {
  const stripe = useStripe()
  const elements = useElements()
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setLoading(true)

    try {
      const { error } = await stripe.confirmSetup({
        elements,
        confirmParams: {
          return_url: window.location.href,
        },
        redirect: 'if_required',
      })

      if (error) {
        toast.error(error.message || 'Failed to add payment method')
      } else {
        toast.success('Payment method added successfully')
        onSuccess()
      }
    } catch (error: any) {
      toast.error(error.message || 'Failed to add payment method')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <PaymentElement />
      <DialogFooter>
        <Button
          type="button"
          variant="outline"
          onClick={onCancel}
          disabled={loading}
        >
          Cancel
        </Button>
        <Button type="submit" disabled={!stripe || loading}>
          {loading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Adding...
            </>
          ) : (
            'Add Payment Method'
          )}
        </Button>
      </DialogFooter>
    </form>
  )
}

export function AddCardDialog({
  open,
  onOpenChange,
  customerId,
  onSuccess,
}: AddCardDialogProps) {
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open && customerId) {
      loadSetupIntent()
    }
  }, [open, customerId])

  const loadSetupIntent = async () => {
    setLoading(true)
    try {
      const response = await fetch('/api/payments/setup-intent', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ customerId }),
      })

      const data = await response.json()
      if (data.clientSecret) {
        setClientSecret(data.clientSecret)
      } else {
        toast.error('Failed to initialize payment form')
      }
    } catch (error) {
      toast.error('Failed to initialize payment form')
    } finally {
      setLoading(false)
    }
  }

  const handleSuccess = () => {
    setClientSecret(null)
    onSuccess()
    onOpenChange(false)
  }

  const handleCancel = () => {
    setClientSecret(null)
    onOpenChange(false)
  }

  const options = {
    clientSecret: clientSecret || '',
    appearance: {
      theme: 'stripe' as const,
    },
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle>Add Payment Method</DialogTitle>
          <DialogDescription>
            Add a new credit or debit card to your account
          </DialogDescription>
        </DialogHeader>

        {loading ? (
          <div className="py-8 text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-primary" />
            <p className="text-sm text-muted-foreground">Loading payment form...</p>
          </div>
        ) : clientSecret ? (
          <Elements stripe={stripePromise} options={options}>
            <AddCardForm onSuccess={handleSuccess} onCancel={handleCancel} />
          </Elements>
        ) : (
          <div className="py-8 text-center">
            <p className="text-sm text-muted-foreground">Failed to load payment form</p>
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => onOpenChange(false)}
            >
              Close
            </Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
