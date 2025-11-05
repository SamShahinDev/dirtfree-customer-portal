'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { loadStripe } from '@stripe/stripe-js'
import { Elements } from '@stripe/react-stripe-js'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { PaymentForm } from '@/components/payments/payment-form'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Loader2 } from 'lucide-react'

const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

interface Props {
  params: { id: string }
}

export default function PayInvoicePage({ params }: Props) {
  const [invoice, setInvoice] = useState<any>(null)
  const [clientSecret, setClientSecret] = useState('')
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadInvoiceAndCreatePaymentIntent()
  }, [])

  const loadInvoiceAndCreatePaymentIntent = async () => {
    // Load invoice
    const { data: invoiceData } = await supabase
      .from('invoices')
      .select('*, job:jobs(services:job_services(service:services(name)))')
      .eq('id', params.id)
      .single()

    setInvoice(invoiceData)

    // Create payment intent
    const response = await fetch('/api/payments/create-intent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        invoiceId: params.id,
        amount: invoiceData.amount,
      }),
    })

    const { clientSecret } = await response.json()
    setClientSecret(clientSecret)
    setLoading(false)
  }

  if (loading || !clientSecret) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Loader2 className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Pay Invoice</h1>
        <p className="text-muted-foreground">
          Invoice #{invoice.id.slice(0, 8)}
        </p>
      </div>

      {/* Invoice Summary */}
      <Card>
        <CardHeader>
          <CardTitle>Invoice Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Date</span>
            <span className="font-medium">{formatDate(invoice.created_at)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Due Date</span>
            <span className="font-medium">{formatDate(invoice.due_date)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Services</span>
            <span className="font-medium">
              {invoice.job?.services?.map((s: any) => s.service?.name).join(', ')}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-4 border-t">
            <span>Amount Due</span>
            <span>{formatCurrency(invoice.amount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Payment Form */}
      <Card>
        <CardHeader>
          <CardTitle>Payment Information</CardTitle>
        </CardHeader>
        <CardContent>
          <Elements
            stripe={stripePromise}
            options={{
              clientSecret,
              appearance: {
                theme: 'stripe',
              },
            }}
          >
            <PaymentForm
              invoiceId={invoice.id}
              amount={invoice.amount}
            />
          </Elements>
        </CardContent>
      </Card>
    </div>
  )
}
