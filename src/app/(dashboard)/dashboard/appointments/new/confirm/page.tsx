'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Calendar, Clock, MapPin, Loader2, CheckCircle } from 'lucide-react'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'
import { toast } from 'sonner'
import { analytics } from '@/lib/analytics'

export default function ConfirmBookingPage() {
  const [services, setServices] = useState<any[]>([])
  const [customer, setCustomer] = useState<any>(null)
  const [date, setDate] = useState<string>('')
  const [time, setTime] = useState<string>('')
  const [notes, setNotes] = useState('')
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadBookingData()
  }, [])

  const loadBookingData = async () => {
    // Get booking data from sessionStorage
    const serviceIds = JSON.parse(sessionStorage.getItem('bookingServices') || '[]')
    const bookingDate = sessionStorage.getItem('bookingDate') || ''
    const bookingTime = sessionStorage.getItem('bookingTime') || ''

    setDate(bookingDate)
    setTime(bookingTime)

    // Load services
    const { data: servicesData } = await supabase
      .from('services')
      .select('*')
      .in('id', serviceIds)

    setServices(servicesData || [])

    // Load customer
    const { data: { user } } = await supabase.auth.getUser()
    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('email', user?.email)
      .single()

    setCustomer(customerData)
    setLoading(false)
  }

  const totalAmount = services.reduce((sum, service) => sum + service.base_price, 0)

  const handleSubmit = async () => {
    setSubmitting(true)

    try {
      // Create job
      const { data: job, error: jobError } = await supabase
        .from('jobs')
        .insert({
          customer_id: customer.id,
          scheduled_date: date,
          scheduled_time: time,
          status: 'scheduled',
          total_amount: totalAmount,
          notes: notes || null,
        })
        .select()
        .single()

      if (jobError) throw jobError

      // Create job_services entries
      const jobServices = services.map(service => ({
        job_id: job.id,
        service_id: service.id,
        quantity: 1,
        price: service.base_price,
      }))

      const { error: servicesError } = await supabase
        .from('job_services')
        .insert(jobServices)

      if (servicesError) throw servicesError

      // Clear sessionStorage
      sessionStorage.removeItem('bookingServices')
      sessionStorage.removeItem('bookingDate')
      sessionStorage.removeItem('bookingTime')

      // Track appointment booking
      analytics.track('appointment_booked', {
        services: services.map(s => s.name),
        date: date,
        amount: totalAmount,
      })

      toast.success('Appointment booked successfully!')
      router.push('/dashboard/appointments')
    } catch (error: any) {
      toast.error(error.message || 'Failed to book appointment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Confirm Booking</h1>
        <p className="text-muted-foreground">Step 3 of 3: Review and confirm</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Appointment Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Date & Time */}
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <Calendar className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{formatDate(date)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-muted-foreground" />
              <span className="font-medium">{formatTime(time)}</span>
            </div>
          </div>

          <Separator />

          {/* Services */}
          <div>
            <h3 className="font-semibold mb-3">Selected Services</h3>
            <div className="space-y-2">
              {services.map(service => (
                <div key={service.id} className="flex justify-between items-center">
                  <span>{service.name}</span>
                  <span className="font-medium">{formatCurrency(service.base_price)}</span>
                </div>
              ))}
            </div>
          </div>

          <Separator />

          {/* Total */}
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Total</span>
            <span>{formatCurrency(totalAmount)}</span>
          </div>

          <Separator />

          {/* Service Address */}
          <div>
            <h3 className="font-semibold mb-2 flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              Service Address
            </h3>
            <p className="text-muted-foreground">
              {customer?.address}<br />
              {customer?.city}, {customer?.state} {customer?.zip}
            </p>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Special Instructions (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Any special requests or instructions for our team..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()} disabled={submitting}>
          Back
        </Button>
        <Button onClick={handleSubmit} disabled={submitting}>
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Booking...
            </>
          ) : (
            <>
              <CheckCircle className="mr-2 h-4 w-4" />
              Confirm Booking
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
