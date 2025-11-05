import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Calendar, CheckCircle, Clock } from 'lucide-react'
import { formatDate, formatCurrency } from '@/lib/utils'

interface TimelineJob {
  id: string
  scheduled_date: string
  status: string
  total_amount: number
  services: Array<{ service: { name: string } }>
}

interface ServiceTimelineProps {
  jobs: TimelineJob[]
}

export function ServiceTimeline({ jobs }: ServiceTimelineProps) {
  // Group jobs by year
  const jobsByYear = jobs.reduce((acc, job) => {
    const year = new Date(job.scheduled_date).getFullYear()
    if (!acc[year]) acc[year] = []
    acc[year].push(job)
    return acc
  }, {} as Record<number, TimelineJob[]>)

  const years = Object.keys(jobsByYear).sort((a, b) => parseInt(b) - parseInt(a))

  return (
    <div className="space-y-8">
      {years.map((year) => (
        <div key={year} className="space-y-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-semibold">{year}</h3>
            <div className="flex-1 h-px bg-border" />
            <Badge variant="secondary">{jobsByYear[parseInt(year)].length} services</Badge>
          </div>

          <div className="space-y-4">
            {jobsByYear[parseInt(year)].map((job, index) => (
              <div key={job.id} className="relative">
                {/* Timeline line */}
                {index < jobsByYear[parseInt(year)].length - 1 && (
                  <div className="absolute left-[11px] top-[48px] bottom-[-16px] w-[2px] bg-border" />
                )}

                <Card className="ml-6">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-4">
                      {/* Timeline dot */}
                      <div className="absolute left-0 -translate-x-[18px] mt-1">
                        <div className="p-1.5 rounded-full bg-primary">
                          {job.status === 'completed' ? (
                            <CheckCircle className="h-4 w-4 text-primary-foreground" />
                          ) : (
                            <Clock className="h-4 w-4 text-primary-foreground" />
                          )}
                        </div>
                      </div>

                      <div className="flex-1">
                        <div className="flex items-start justify-between">
                          <div>
                            <h4 className="font-semibold">
                              {job.services.map(s => s.service.name).join(', ')}
                            </h4>
                            <div className="flex items-center gap-2 mt-1 text-sm text-muted-foreground">
                              <Calendar className="h-3 w-3" />
                              {formatDate(job.scheduled_date)}
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="font-semibold">{formatCurrency(job.total_amount)}</p>
                            <Badge
                              variant={job.status === 'completed' ? 'default' : 'secondary'}
                              className="mt-1"
                            >
                              {job.status}
                            </Badge>
                          </div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>
            ))}
          </div>
        </div>
      ))}

      {jobs.length === 0 && (
        <Card>
          <CardContent className="text-center py-12">
            <Calendar className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground">No service history yet</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
