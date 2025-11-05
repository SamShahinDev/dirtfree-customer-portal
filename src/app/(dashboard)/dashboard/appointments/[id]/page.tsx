import { createClient } from '@/lib/supabase/server'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Calendar, Clock, MapPin, User, FileText } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export const metadata = {
  title: 'Appointment Details | Dirt Free Customer Portal',
  description: 'View your appointment details and service information',
}

const statusColors = {
  scheduled: 'bg-blue-100 text-blue-800',
  confirmed: 'bg-green-100 text-green-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  completed: 'bg-gray-100 text-gray-800',
  cancelled: 'bg-red-100 text-red-800',
}

interface Props {
  params: { id: string }
}

export default async function AppointmentDetailPage({ params }: Props) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('*')
    .eq('email', user?.email)
    .single()

  const { data: appointment } = await supabase
    .from('jobs')
    .select(`
      *,
      services:job_services(
        quantity,
        price,
        service:services(name, description)
      ),
      technician:technicians(first_name, last_name, phone)
    `)
    .eq('id', params.id)
    .eq('customer_id', customer?.id)
    .single()

  if (!appointment) {
    notFound()
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h1 className="text-3xl font-bold">Appointment Details</h1>
          <p className="text-muted-foreground">
            Appointment #{appointment.id.slice(0, 8)}
          </p>
        </div>
        <Badge className={statusColors[appointment.status as keyof typeof statusColors]}>
          {appointment.status}
        </Badge>
      </div>

      {/* Main Details */}
      <Card>
        <CardHeader>
          <CardTitle>Service Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Date & Time */}
          <div className="grid md:grid-cols-2 gap-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Calendar className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Date</p>
                <p className="font-medium">{formatDate(appointment.scheduled_date)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-muted">
                <Clock className="h-5 w-5" />
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Time</p>
                <p className="font-medium">{formatTime(appointment.scheduled_time)}</p>
              </div>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-3">Services</h3>
            <div className="space-y-3">
              {appointment.services?.map((item: any, index: number) => (
                <div key={index} className="flex justify-between items-start p-3 rounded-lg bg-muted/50">
                  <div>
                    <p className="font-medium">{item.service?.name}</p>
                    <p className="text-sm text-muted-foreground">{item.service?.description}</p>
                  </div>
                  <p className="font-medium">{formatCurrency(item.price)}</p>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg">
            <span className="font-semibold">Total Amount</span>
            <span className="font-bold">{formatCurrency(appointment.total_amount)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Location & Technician */}
      <div className="grid md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p>{customer?.address}</p>
            <p>{customer?.city}, {customer?.state} {customer?.zip}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Technician
            </CardTitle>
          </CardHeader>
          <CardContent>
            {appointment.technician ? (
              <>
                <p className="font-medium">
                  {appointment.technician.first_name} {appointment.technician.last_name}
                </p>
                <p className="text-sm text-muted-foreground">{appointment.technician.phone}</p>
              </>
            ) : (
              <p className="text-muted-foreground">To be assigned</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Notes */}
      {appointment.notes && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Special Instructions
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground">{appointment.notes}</p>
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      {(appointment.status === 'scheduled' || appointment.status === 'confirmed') && (
        <div className="flex gap-4">
          <Button variant="outline">Reschedule</Button>
          <Button variant="destructive">Cancel Appointment</Button>
        </div>
      )}
    </div>
  )
}
