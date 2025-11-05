import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Shield, AlertCircle, CheckCircle } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Service Warranties | Dirt Free Customer Portal',
  description: 'View your active warranties and satisfaction guarantees',
}

export default async function WarrantiesPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  // Get completed jobs within warranty period (e.g., 30 days)
  const warrantyDate = new Date()
  warrantyDate.setDate(warrantyDate.getDate() - 30)

  const { data: jobs } = await supabase
    .from('jobs')
    .select(`
      *,
      services:job_services(service:services(name, warranty_days))
    `)
    .eq('customer_id', customer?.id)
    .eq('status', 'completed')
    .gte('scheduled_date', warrantyDate.toISOString())
    .order('scheduled_date', { ascending: false })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Service Warranties</h1>
        <p className="text-muted-foreground">
          Active warranties for your recent services
        </p>
      </div>

      {/* Warranty Info */}
      <Card className="bg-blue-50 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-blue-600" />
            <CardTitle className="text-blue-900">Satisfaction Guarantee</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-blue-900">
            All our services come with a 30-day satisfaction guarantee. If you're not completely
            satisfied with our work, we'll return to re-clean at no additional charge.
          </p>
        </CardContent>
      </Card>

      {/* Active Warranties */}
      <Card>
        <CardHeader>
          <CardTitle>Active Warranties</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {jobs && jobs.length > 0 ? (
              jobs.map((job) => {
                const serviceDate = new Date(job.scheduled_date)
                const warrantyEndDate = new Date(serviceDate)
                warrantyEndDate.setDate(warrantyEndDate.getDate() + 30)
                const daysRemaining = Math.ceil(
                  (warrantyEndDate.getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24)
                )
                const isActive = daysRemaining > 0

                return (
                  <div
                    key={job.id}
                    className={`p-4 rounded-lg border ${
                      isActive ? 'border-green-200 bg-green-50' : 'border-gray-200 bg-gray-50'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        {isActive ? (
                          <CheckCircle className="h-5 w-5 text-green-600 mt-0.5" />
                        ) : (
                          <AlertCircle className="h-5 w-5 text-gray-400 mt-0.5" />
                        )}
                        <div>
                          <h3 className="font-semibold">
                            {job.services?.map((s: any) => s.service?.name).join(', ')}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            Service Date: {formatDate(job.scheduled_date)}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            Warranty Until: {formatDate(warrantyEndDate)}
                          </p>
                        </div>
                      </div>
                      <Badge variant={isActive ? 'default' : 'secondary'}>
                        {isActive ? `${daysRemaining} days left` : 'Expired'}
                      </Badge>
                    </div>

                    {isActive && (
                      <div className="mt-3 p-3 bg-white rounded border">
                        <p className="text-xs text-muted-foreground">
                          <strong>What's covered:</strong> If you're not satisfied with the results,
                          contact us and we'll return to re-clean the affected areas at no charge.
                        </p>
                      </div>
                    )}
                  </div>
                )
              })
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No active warranties
              </p>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Warranty Terms */}
      <Card>
        <CardHeader>
          <CardTitle>Warranty Terms & Conditions</CardTitle>
        </CardHeader>
        <CardContent className="prose prose-sm max-w-none">
          <h4>30-Day Satisfaction Guarantee</h4>
          <ul>
            <li>Valid for 30 days from the service date</li>
            <li>Covers re-cleaning of any areas not meeting quality standards</li>
            <li>Customer must notify us within the warranty period</li>
            <li>Normal wear and new stains are not covered</li>
          </ul>

          <h4>How to File a Warranty Claim</h4>
          <ol>
            <li>Contact us at (713) 730-2782 or info@dirtfreecarpet.com</li>
            <li>Provide your service date and describe the issue</li>
            <li>We'll schedule a return visit within 48 hours</li>
            <li>No additional charges for warranty work</li>
          </ol>

          <h4>Exclusions</h4>
          <ul>
            <li>Damage caused by pets or accidents after service</li>
            <li>New stains or spills occurring after service</li>
            <li>Normal traffic wear and tear</li>
            <li>Issues not reported within warranty period</li>
          </ul>
        </CardContent>
      </Card>
    </div>
  )
}
