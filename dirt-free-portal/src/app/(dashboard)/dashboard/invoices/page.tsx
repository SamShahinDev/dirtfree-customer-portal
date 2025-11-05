import { createClient } from '@/lib/supabase/server'
import {
  Receipt,
  Download,
  Check,
  AlertCircle,
  TrendingUp,
  FileText,
  DollarSign,
  Calendar,
  Clock,
  ArrowLeft,
  CreditCard,
  Plus
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { formatCurrency, formatDate, cn } from '@/lib/utils'
import Link from 'next/link'
import { DownloadButton } from '@/components/invoices/DownloadButton'
import { CustomerNotFound } from '@/components/errors/customer-not-found'

export const metadata = {
  title: 'Invoices | Dirt Free Customer Portal',
  description: 'View and manage your invoices and payments',
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
    return <CustomerNotFound />
  }

  const { data: invoices } = await supabase
    .from('invoices')
    .select('*, job:jobs(services:job_services(service:services(name)))')
    .eq('customer_id', customer.id)
    .order('created_at', { ascending: false })

  // Calculate summary stats (total_cents is in cents, convert to dollars)
  const currentYear = new Date().getFullYear()
  const totalOwed = (invoices
    ?.filter(inv => inv.status !== 'paid' && inv.status !== 'cancelled')
    .reduce((sum, inv) => sum + (inv.total_cents || 0), 0) || 0) / 100

  const totalPaidThisYear = (invoices
    ?.filter(inv =>
      inv.status === 'paid' &&
      inv.paid_date &&
      new Date(inv.paid_date).getFullYear() === currentYear
    )
    .reduce((sum, inv) => sum + (inv.total_cents || 0), 0) || 0) / 100

  const pendingInvoices = invoices?.filter(inv => inv.status === 'sent').length || 0
  const overdueInvoices = invoices?.filter(inv => inv.status === 'overdue').length || 0

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Invoices</h1>
          <p className="text-muted-foreground">
            View and manage your invoices and payments
          </p>
        </div>
        {invoices && invoices.length > 0 && (
          <Button variant="outline" size="lg" className="gap-2">
            <Download className="h-5 w-5" />
            Export {currentYear} Payments
          </Button>
        )}
      </div>

      {/* Summary Cards - Only show if invoices exist */}
      {invoices && invoices.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {/* Outstanding Balance */}
          <Card className={cn(
            "transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
            totalOwed > 0 ? "border-l-4 border-yellow-500" : "border-l-4 border-green-500"
          )}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Outstanding</CardTitle>
              <div className={cn(
                "p-2 rounded-full",
                totalOwed > 0 ? "bg-yellow-100" : "bg-green-100"
              )}>
                <Receipt className={cn(
                  "h-4 w-4",
                  totalOwed > 0 ? "text-yellow-600" : "text-green-600"
                )} />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalOwed)}</div>
              <p className={cn(
                "text-xs flex items-center gap-1 mt-1",
                totalOwed === 0 ? "text-green-600" : "text-yellow-600"
              )}>
                {totalOwed === 0 ? (
                  <><Check className="h-3 w-3" />All caught up!</>
                ) : (
                  <>{pendingInvoices} pending{overdueInvoices > 0 && `, ${overdueInvoices} overdue`}</>
                )}
              </p>
            </CardContent>
          </Card>

          {/* Paid This Year */}
          <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-l-4 border-blue-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Paid in {currentYear}</CardTitle>
              <div className="p-2 rounded-full bg-blue-100">
                <TrendingUp className="h-4 w-4 text-blue-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{formatCurrency(totalPaidThisYear)}</div>
              <p className="text-xs text-muted-foreground mt-1">
                Year-to-date spending
              </p>
            </CardContent>
          </Card>

          {/* Total Invoices */}
          <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-l-4 border-purple-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Invoices</CardTitle>
              <div className="p-2 rounded-full bg-purple-100">
                <FileText className="h-4 w-4 text-purple-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{invoices.length}</div>
              <p className="text-xs text-muted-foreground mt-1">
                All-time invoices
              </p>
            </CardContent>
          </Card>

          {/* Average Invoice */}
          <Card className="transition-all duration-200 hover:shadow-lg hover:-translate-y-1 border-l-4 border-green-500">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Avg. Invoice</CardTitle>
              <div className="p-2 rounded-full bg-green-100">
                <DollarSign className="h-4 w-4 text-green-600" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatCurrency(invoices.reduce((sum, inv) => sum + (inv.total_cents || 0), 0) / invoices.length / 100)}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                Per service visit
              </p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Outstanding Balance Alert - Only if balance > 0 */}
      {totalOwed > 0 && (
        <Card className="border-yellow-200 bg-yellow-50">
          <CardContent className="pt-6">
            <div className="flex items-start gap-4">
              <div className="p-2 rounded-full bg-yellow-100">
                <AlertCircle className="h-5 w-5 text-yellow-600" />
              </div>
              <div className="flex-1">
                <h3 className="font-semibold text-yellow-900">Payment Required</h3>
                <p className="text-sm text-yellow-800 mt-1">
                  You have {formatCurrency(totalOwed)} in outstanding invoices.
                  {overdueInvoices > 0 && ` ${overdueInvoices} invoice${overdueInvoices > 1 ? 's are' : ' is'} overdue.`}
                </p>
              </div>
              <Button className="bg-yellow-600 hover:bg-yellow-700">
                Pay Now
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      {/* All Invoices */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">All Invoices</CardTitle>
            {invoices && invoices.length > 0 && (
              <div className="flex gap-2">
                <Button variant="outline" size="sm">
                  Filter
                </Button>
                <Button variant="outline" size="sm">
                  Sort
                </Button>
              </div>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {invoices && invoices.length > 0 ? (
            <div className="space-y-3">
              {invoices.map((invoice) => {
                const invoiceAmount = (invoice.total_cents || 0) / 100
                return (
                  <div
                    key={invoice.id}
                    className="flex items-center justify-between p-4 rounded-lg border-2 hover:border-primary hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-start gap-4 flex-1">
                      {/* Invoice Icon */}
                      <div className={cn(
                        "p-3 rounded-lg",
                        invoice.status === 'paid' && "bg-green-100",
                        invoice.status === 'sent' && "bg-yellow-100",
                        invoice.status === 'overdue' && "bg-red-100",
                        invoice.status === 'cancelled' && "bg-gray-100",
                        invoice.status === 'draft' && "bg-blue-100"
                      )}>
                        <Receipt className={cn(
                          "h-6 w-6",
                          invoice.status === 'paid' && "text-green-600",
                          invoice.status === 'sent' && "text-yellow-600",
                          invoice.status === 'overdue' && "text-red-600",
                          invoice.status === 'cancelled' && "text-gray-600",
                          invoice.status === 'draft' && "text-blue-600"
                        )} />
                      </div>

                      {/* Invoice Details */}
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold truncate">
                            Invoice #{invoice.id.slice(0, 8).toUpperCase()}
                          </h3>
                          <Badge className={cn(
                            invoice.status === 'paid' && 'bg-green-100 text-green-800',
                            invoice.status === 'sent' && 'bg-yellow-100 text-yellow-800',
                            invoice.status === 'overdue' && 'bg-red-100 text-red-800',
                            invoice.status === 'cancelled' && 'bg-gray-100 text-gray-800',
                            invoice.status === 'draft' && 'bg-blue-100 text-blue-800'
                          )}>
                            {invoice.status === 'sent' ? 'Pending' : invoice.status.charAt(0).toUpperCase() + invoice.status.slice(1)}
                          </Badge>
                        </div>

                        <p className="text-sm text-muted-foreground mb-1">
                          {invoice.job?.services?.map((s: any) => s.service?.name).join(', ') || 'Service'}
                        </p>

                        <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Calendar className="h-3 w-3" />
                            Issued {formatDate(invoice.created_at)}
                          </span>
                          {invoice.status === 'paid' && invoice.paid_date ? (
                            <span className="flex items-center gap-1 text-green-600">
                              <Check className="h-3 w-3" />
                              Paid {formatDate(invoice.paid_date)}
                            </span>
                          ) : invoice.due_date && (
                            <span className="flex items-center gap-1">
                              <Clock className="h-3 w-3" />
                              Due {formatDate(invoice.due_date)}
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Amount */}
                      <div className="text-right">
                        <p className="text-xl font-bold">{formatCurrency(invoiceAmount)}</p>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 ml-4">
                      <DownloadButton invoiceId={invoice.id} />
                      {invoice.status !== 'paid' && invoice.status !== 'cancelled' && (
                        <Button size="sm">
                          Pay Now
                        </Button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="text-center py-16">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Receipt className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2">No invoices yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-md mx-auto">
                Your invoices will appear here after you book and complete your first service.
                We&apos;ll send you an email notification when a new invoice is ready.
              </p>
              <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button asChild size="lg">
                  <Link href="/dashboard/appointments/new">
                    <Calendar className="mr-2 h-5 w-5" />
                    Book Your First Service
                  </Link>
                </Button>
                <Button asChild variant="outline" size="lg">
                  <Link href="/dashboard">
                    <ArrowLeft className="mr-2 h-5 w-5" />
                    Back to Dashboard
                  </Link>
                </Button>
              </div>

              {/* Info Cards */}
              <div className="mt-12 grid gap-4 md:grid-cols-3 max-w-3xl mx-auto">
                <Card className="border-2 hover:border-blue-200 hover:shadow-md transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 rounded-full bg-blue-100 mb-3">
                        <FileText className="h-6 w-6 text-blue-600" />
                      </div>
                      <h4 className="font-semibold mb-2">Detailed Invoices</h4>
                      <p className="text-xs text-muted-foreground">
                        Clear breakdown of services, materials, and labor costs
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-green-200 hover:shadow-md transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 rounded-full bg-green-100 mb-3">
                        <CreditCard className="h-6 w-6 text-green-600" />
                      </div>
                      <h4 className="font-semibold mb-2">Easy Payment</h4>
                      <p className="text-xs text-muted-foreground">
                        Pay securely online with credit card or saved payment methods
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="border-2 hover:border-purple-200 hover:shadow-md transition-all">
                  <CardContent className="pt-6">
                    <div className="flex flex-col items-center text-center">
                      <div className="p-3 rounded-full bg-purple-100 mb-3">
                        <Download className="h-6 w-6 text-purple-600" />
                      </div>
                      <h4 className="font-semibold mb-2">Download & Export</h4>
                      <p className="text-xs text-muted-foreground">
                        Download PDFs and export payment history for your records
                      </p>
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Payment Methods Section */}
      {invoices && invoices.length > 0 && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl">Payment Methods</CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Manage your saved payment methods
                </p>
              </div>
              <Button variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Card
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">
              No saved payment methods yet. Add a card for faster checkout.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
