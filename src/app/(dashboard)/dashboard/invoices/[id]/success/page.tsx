import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CheckCircle2, Download, Home } from 'lucide-react'
import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { PaymentSuccessTracker } from '@/components/analytics/payment-success-tracker'

export const metadata = {
  title: 'Payment Successful | Dirt Free Customer Portal',
  description: 'Your payment has been processed successfully',
}

interface Props {
  params: { id: string }
  searchParams: { payment_intent: string }
}

export default async function PaymentSuccessPage({ params, searchParams }: Props) {
  const supabase = await createClient()

  const { data: invoice } = await supabase
    .from('invoices')
    .select('*, job:jobs(services:job_services(service:services(name)))')
    .eq('id', params.id)
    .single()

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <PaymentSuccessTracker invoiceId={params.id} amount={invoice?.amount || 0} />
      <Card className="border-green-200 bg-green-50">
        <CardHeader className="text-center pb-4">
          <div className="flex justify-center mb-4">
            <div className="p-3 rounded-full bg-green-100">
              <CheckCircle2 className="h-12 w-12 text-green-600" />
            </div>
          </div>
          <CardTitle className="text-2xl">Payment Successful!</CardTitle>
          <p className="text-muted-foreground">
            Your payment has been processed successfully
          </p>
        </CardHeader>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Payment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Invoice Number</span>
            <span className="font-medium">#{invoice?.id.slice(0, 8)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment Date</span>
            <span className="font-medium">{formatDate(new Date())}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Services</span>
            <span className="font-medium">
              {invoice?.job?.services?.map((s: any) => s.service?.name).join(', ')}
            </span>
          </div>
          <div className="flex justify-between text-lg font-bold pt-4 border-t">
            <span>Amount Paid</span>
            <span className="text-green-600">{formatCurrency(invoice?.amount || 0)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Payment ID</span>
            <span className="font-mono text-xs">{searchParams.payment_intent}</span>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="pt-6">
          <p className="text-sm text-muted-foreground mb-4">
            A receipt has been sent to your email. Thank you for your payment!
          </p>
          <div className="flex gap-3">
            <Button asChild variant="outline" className="flex-1">
              <Link href="/dashboard/invoices">
                View All Invoices
              </Link>
            </Button>
            <Button asChild className="flex-1">
              <Link href="/dashboard">
                <Home className="mr-2 h-4 w-4" />
                Back to Dashboard
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
