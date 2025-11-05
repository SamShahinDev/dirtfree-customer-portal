import { createClient } from '@/lib/supabase/server'
import { format } from 'date-fns'
import {
  Calendar,
  Clock,
  MapPin,
  User,
  ChevronRight,
  History
} from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatDate, formatTime, formatCurrency, cn } from '@/lib/utils'
import { CustomerNotFound } from '@/components/errors/customer-not-found'

export const metadata = {
  title: 'Appointments | Dirt Free Customer Portal',
  description: 'Manage your carpet cleaning appointments',
}

export default async function AppointmentsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('email', user?.email)
    .single()

  if (!customer) {
    return <CustomerNotFound />
  }

  const { data: upcomingAppointments } = await supabase
    .from('jobs')
    .select('*, services:job_services(service:services(name))')
    .eq('customer_id', customer.id)
    .in('status', ['scheduled', 'confirmed', 'in_progress'])
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })

  const { data: pastAppointments } = await supabase
    .from('jobs')
    .select('*, services:job_services(service:services(name))')
    .eq('customer_id', customer.id)
    .in('status', ['completed', 'cancelled'])
    .order('scheduled_date', { ascending: false})
    .limit(5)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold">Appointments</h1>
          <p className="text-muted-foreground">
            Manage your upcoming and past appointments
          </p>
        </div>
        <Button asChild size="lg" className="gap-2">
          <Link href="/dashboard/appointments/new">
            <Calendar className="h-5 w-5" />
            Book New Appointment
          </Link>
        </Button>
      </div>

      {/* Upcoming Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Upcoming Appointments</CardTitle>
            {upcomingAppointments && upcomingAppointments.length > 0 && (
              <Badge variant="secondary" className="gap-1">
                <Clock className="h-3 w-3" />
                {upcomingAppointments.length} scheduled
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {upcomingAppointments && upcomingAppointments.length > 0 ? (
            <div className="space-y-4">
              {upcomingAppointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/dashboard/appointments/${appointment.id}`}
                  className="block"
                >
                  <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4 p-4 rounded-lg border-2 hover:border-primary hover:bg-primary/5 transition-all cursor-pointer">
                    <div className="flex items-start gap-4">
                      {/* Date Badge */}
                      <div className="flex flex-col items-center justify-center w-16 h-16 rounded-lg bg-blue-100 text-blue-700 border-2 border-blue-200">
                        <span className="text-xs font-semibold uppercase">
                          {format(new Date(appointment.scheduled_date), 'MMM')}
                        </span>
                        <span className="text-2xl font-bold">
                          {format(new Date(appointment.scheduled_date), 'd')}
                        </span>
                      </div>

                      {/* Appointment Details */}
                      <div className="space-y-2">
                        <div className="flex items-center gap-3 flex-wrap">
                          <h3 className="font-semibold text-lg">
                            {appointment.services?.map(s => s.service?.name).join(', ')}
                          </h3>
                          <Badge className={cn(
                            appointment.status === 'confirmed' && 'bg-green-100 text-green-800',
                            appointment.status === 'scheduled' && 'bg-blue-100 text-blue-800',
                            appointment.status === 'in_progress' && 'bg-yellow-100 text-yellow-800'
                          )}>
                            {appointment.status}
                          </Badge>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4" />
                            {formatTime(appointment.scheduled_time_start)}
                          </span>
                          <span className="flex items-center gap-1">
                            <MapPin className="h-4 w-4" />
                            {customer.address_line1}, {customer.city}
                          </span>
                        </div>

                        {appointment.description && (
                          <p className="text-sm text-muted-foreground line-clamp-2">
                            Note: {appointment.description}
                          </p>
                        )}
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex sm:flex-col gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          window.location.href = `/dashboard/appointments/${appointment.id}/reschedule`
                        }}
                      >
                        Reschedule
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        onClick={(e) => {
                          e.preventDefault()
                          // Handle cancel
                        }}
                      >
                        Cancel
                      </Button>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-10 w-10 text-blue-600" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No upcoming appointments</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Ready for your next cleaning? Book an appointment and we&apos;ll take care of the rest.
              </p>
              <Button asChild size="lg">
                <Link href="/dashboard/appointments/new">
                  <Calendar className="mr-2 h-5 w-5" />
                  Book Your Next Service
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Past Appointments */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-xl">Past Appointments</CardTitle>
            {pastAppointments && pastAppointments.length > 0 && (
              <Button variant="ghost" size="sm">
                View All History
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {pastAppointments && pastAppointments.length > 0 ? (
            <div className="space-y-3">
              {pastAppointments.map((appointment) => (
                <Link
                  key={appointment.id}
                  href={`/dashboard/appointments/${appointment.id}`}
                  className="block"
                >
                  <div className="flex items-start justify-between p-4 rounded-lg border hover:border-gray-300 hover:bg-gray-50 transition-all opacity-90">
                    <div className="flex items-start gap-4">
                      {/* Date Badge - Muted for past */}
                      <div className="flex flex-col items-center justify-center w-14 h-14 rounded-lg bg-gray-100 text-gray-600 border border-gray-200">
                        <span className="text-xs font-semibold uppercase">
                          {format(new Date(appointment.scheduled_date), 'MMM')}
                        </span>
                        <span className="text-xl font-bold">
                          {format(new Date(appointment.scheduled_date), 'd')}
                        </span>
                      </div>

                      {/* Appointment Details */}
                      <div className="space-y-1">
                        <div className="flex items-center gap-3">
                          <h3 className="font-semibold">
                            {appointment.services?.map(s => s.service?.name).join(', ')}
                          </h3>
                          <Badge variant="secondary" className={cn(
                            appointment.status === 'completed' && 'bg-green-100 text-green-800',
                            appointment.status === 'cancelled' && 'bg-red-100 text-red-800'
                          )}>
                            {appointment.status}
                          </Badge>
                        </div>

                        <div className="flex items-center gap-4 text-sm text-muted-foreground">
                          <span>{formatDate(appointment.scheduled_date)}</span>
                          <span>•</span>
                          <span>{formatTime(appointment.scheduled_time_start)}</span>
                        </div>
                      </div>
                    </div>

                    <Button variant="ghost" size="sm">
                      View Details
                      <ChevronRight className="ml-1 h-4 w-4" />
                    </Button>
                  </div>
                </Link>
              ))}
            </div>
          ) : (
            /* Enhanced Empty State */
            <div className="text-center py-12">
              <div className="mx-auto w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-4">
                <History className="h-10 w-10 text-gray-400" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No service history yet</h3>
              <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                Your completed appointments and service history will appear here after your first visit.
              </p>
              <Button asChild variant="outline">
                <Link href="/dashboard/appointments/new">
                  Book Your First Service
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
