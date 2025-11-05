'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CreditCard, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

export default function PaymentMethodsPage() {
  const [paymentMethods, setPaymentMethods] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadPaymentMethods()
  }, [])

  const loadPaymentMethods = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: customer } = await supabase
      .from('customers')
      .select('stripe_customer_id')
      .eq('email', user?.email)
      .single()

    if (customer?.stripe_customer_id) {
      // Fetch payment methods from Stripe via API
      const response = await fetch(`/api/payments/methods?customerId=${customer.stripe_customer_id}`)
      const data = await response.json()
      setPaymentMethods(data.paymentMethods || [])
    }

    setLoading(false)
  }

  const handleDelete = async (paymentMethodId: string) => {
    try {
      const response = await fetch(`/api/payments/methods/${paymentMethodId}`, {
        method: 'DELETE',
      })

      if (!response.ok) throw new Error('Failed to delete payment method')

      toast.success('Payment method removed')
      loadPaymentMethods()
    } catch (error: any) {
      toast.error(error.message)
    }
  }

  return (
    <div className="max-w-4xl space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Payment Methods</h1>
          <p className="text-muted-foreground">
            Manage your saved payment methods
          </p>
        </div>
        <Button>
          <Plus className="mr-2 h-4 w-4" />
          Add Payment Method
        </Button>
      </div>

      {loading ? (
        <Card>
          <CardContent className="py-8">
            <p className="text-center text-muted-foreground">Loading...</p>
          </CardContent>
        </Card>
      ) : paymentMethods.length > 0 ? (
        <div className="grid gap-4">
          {paymentMethods.map((method) => (
            <Card key={method.id}>
              <CardContent className="pt-6">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="p-3 rounded-lg bg-muted">
                      <CreditCard className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="font-medium">
                          {method.card.brand.toUpperCase()} •••• {method.card.last4}
                        </p>
                        {method.is_default && (
                          <Badge variant="secondary">Default</Badge>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        Expires {method.card.exp_month}/{method.card.exp_year}
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    {!method.is_default && (
                      <Button variant="outline" size="sm">
                        Set as Default
                      </Button>
                    )}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(method.id)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <Card>
          <CardHeader>
            <CardTitle>No Payment Methods</CardTitle>
            <CardDescription>
              Add a payment method to make payments faster
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Add Your First Payment Method
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
