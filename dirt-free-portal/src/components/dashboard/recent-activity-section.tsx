import { Check, Sparkles } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate } from '@/lib/utils'

interface Job {
  id: string
  scheduled_date: string
  services?: Array<{
    service?: {
      name: string
    }
  }>
}

interface RecentActivitySectionProps {
  recentJobs: Job[] | null
}

export function RecentActivitySection({ recentJobs }: RecentActivitySectionProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Service History</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentJobs && recentJobs.length > 0 ? (
            recentJobs.map((job) => (
              <div key={job.id} className="flex items-center justify-between py-3 border-b last:border-0">
                <div>
                  <p className="font-medium">
                    {job.services?.map(s => s.service?.name).join(', ')}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {formatDate(job.scheduled_date)}
                  </p>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="gap-1 bg-green-100 text-green-700 hover:bg-green-100">
                    <Check className="h-3 w-3" />
                    Completed
                  </Badge>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-muted rounded-full flex items-center justify-center mb-4">
                <Sparkles className="h-10 w-10 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">Your service history will appear here</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                After your first appointment, you'll be able to view photos, invoices, and service details
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/appointments/new">
                  Book Your First Service
                </Link>
              </Button>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
