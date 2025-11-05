import { createClient } from '@/lib/supabase/server'
import { Receipt, Download, CreditCard } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export const metadata = {
  title: 'Invoices | Dirt Free Customer Portal',
  description: 'View and manage your invoices and payments',
}

const statusColors = {
  paid: 'bg-green-100 text-green-800',
  pending: 'bg-yellow-100 text-yellow-800',
  overdue: 'bg-red-100 text-red-800',
  cancelled: 'bg-gray-100 text-gray-800',
}

export default async function InvoicesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  if (!customer) {
    return <div>Customer not found</div>
  }

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, job:jobs(services:job_services(service:services(name)))')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  const totalOwed = invoices
    ?.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + inv.amount, 0) || 0

  // Get first unpaid invoice for the "Pay Now" button
  const firstUnpaidInvoice = invoices?.find(
    inv => inv.status !== 'paid' && inv.status !== 'cancelled'
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Invoices</h1>
        <p className="text-muted-foreground">
          View and manage your invoices and payments
        </p>
      </div>

      {/* Summary Card */}
      {totalOwed > 0 && firstUnpaidInvoice && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">Outstanding Balance</p>
                <p className="text-3xl font-bold text-yellow-800">
                  {formatCurrency(totalOwed)}
                </p>
              </div>
              <Link href={`/dashboard/invoices/${firstUnpaidInvoice.id}/pay`}>
                <Button>
                  <CreditCard className="mr-2 h-4 w-4" />
                  Pay Now
                </Button>
              </Link>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Invoices List */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>All Invoices</CardTitle>
            <Button variant="outline" asChild>
              <a href="/api/payments/export?format=csv&year=2024" download>
                <Download className="mr-2 h-4 w-4" />
                Export 2024 Payments
              </a>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-start gap-4">
                    <div className="p-2 rounded-lg bg-muted">
                      <Receipt className="h-6 w-6" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="font-semibold">Invoice #{invoice.id.slice(0, 8)}</h3>
                        <Badge className={statusColors[invoice.status as keyof typeof statusColors]}>
                          {invoice.status}
                        </Badge>
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {invoice.job?.services?.map(s => s.service?.name).join(', ')}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {invoice.status === 'paid' && invoice.paid_date ? (
                          <>Paid on {formatDate(invoice.paid_date)}</>
                        ) : (
                          <>Due {formatDate(invoice.due_date)}</>
                        )}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="text-right">
                      <p className="text-lg font-bold">{formatCurrency(invoice.amount)}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(invoice.created_at)}
                      </p>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <Download className="h-4 w-4" />
                      </Button>
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <Link href={`/dashboard/invoices/${invoice.id}/pay`}>
                          <Button size="sm">Pay</Button>
                        </Link>
                      )}
                    </div>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No invoices yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
