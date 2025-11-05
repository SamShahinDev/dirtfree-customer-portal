import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { FileText, Download, Image } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

export const metadata = {
  title: 'Documents & History | Dirt Free Customer Portal',
  description: 'Access your service records, photos, and receipts',
}

export default async function DocumentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  // Get completed jobs with documents
  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      services:job_services(service:services(name)),
      photos:job_photos(*)
    `)
    .eq('customer_id', customer?.id)
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })

  // Get invoices
  const { data: invoices } = await supabase
    .from('invoices')
    .select('*')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Documents & History</h1>
        <p className="text-muted-foreground">
          Access your service records, photos, and receipts
        </p>
      </div>

      {/* Service History with Photos */}
      <Card>
        <CardHeader>
          <CardTitle>Service History</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => (
                <div key={job.id} className="pb-6 border-b last:border-0">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h3 className="font-semibold text-lg">
                        {job.services?.map((s: any) => s.service?.name).join(', ')}
                      </h3>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(job.scheduled_date)} • {formatCurrency(job.total_amount)}
                      </p>
                    </div>
                    <Badge variant="secondary">Completed</Badge>
                  </div>

                  {job.notes && (
                    <div className="bg-muted p-3 rounded-lg mb-4">
                      <p className="text-sm font-medium mb-1">Service Notes:</p>
                      <p className="text-sm text-muted-foreground">{job.notes}</p>
                    </div>
                  )}

                  {/* Before/After Photos */}
                  {job.photos && job.photos.length > 0 && (
                    <div>
                      <p className="text-sm font-medium mb-3">Service Photos:</p>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {job.photos.map((photo: any) => (
                          <div key={photo.id} className="relative group">
                            <div className="aspect-square rounded-lg overflow-hidden border">
                              <img
                                src={photo.url}
                                alt={photo.type}
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <Badge
                              className="absolute top-2 left-2 text-xs"
                              variant={photo.type === 'before' ? 'destructive' : 'default'}
                            >
                              {photo.type}
                            </Badge>
                            <Button
                              size="sm"
                              variant="secondary"
                              className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                              asChild
                            >
                              <a href={photo.url} download target="_blank">
                                <Download className="h-3 w-3" />
                              </a>
                            </Button>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No service history available
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Invoices & Receipts */}
      <Card>
        <CardHeader>
          <CardTitle>Invoices & Receipts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {invoices && invoices.length > 0 ? (
              invoices.map((invoice) => (
                <div
                  key={invoice.id}
                  className="flex items-center justify-between p-4 rounded-lg border"
                >
                  <div className="flex items-center gap-3">
                    <div className="p-2 rounded-lg bg-muted">
                      <FileText className="h-5 w-5" />
                    </div>
                    <div>
                      <p className="font-medium">Invoice #{invoice.id.slice(0, 8)}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(invoice.created_at)} • {formatCurrency(invoice.amount)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Badge
                      variant={invoice.status === 'paid' ? 'default' : 'secondary'}
                    >
                      {invoice.status}
                    </Badge>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={`/api/invoices/${invoice.id}/pdf`} download>
                        <Download className="h-4 w-4" />
                      </a>
                    </Button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No invoices available
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
