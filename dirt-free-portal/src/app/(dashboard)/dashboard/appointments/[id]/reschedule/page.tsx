'use client'




import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { toast } from 'sonner'
import { ArrowLeft, Loader2 } from 'lucide-react'
import { addDays, format, startOfTomorrow } from 'date-fns'
import { formatTime } from '@/lib/utils'

const TIME_SLOTS = [
  '08:00:00', '09:00:00', '10:00:00', '11:00:00',
  '12:00:00', '13:00:00', '14:00:00', '15:00:00',
  '16:00:00', '17:00:00'
]


export default function ReschedulePage({ params }: Props) {
  const [appointment, setAppointment] = useState<any>(null)
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadAppointment()
  }, [])

  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate)
    }
  }, [selectedDate])

  const loadAppointment = async () => {
    const { data } = await supabase
      .from('jobs')
      .select('*')
      .eq('id', params.id)
      .single()

    setAppointment(data)
    setLoading(false)
  }

  const checkAvailability = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')

    const { data: bookedJobs } = await supabase
      .from('jobs')
      .select('scheduled_time')
      .eq('scheduled_date', dateStr)
      .neq('id', params.id) // Exclude current appointment
      .in('status', ['scheduled', 'confirmed', 'in_progress'])

    const bookedTimes = bookedJobs?.map(job => job.scheduled_time) || []
    const available = TIME_SLOTS.filter(slot => !bookedTimes.includes(slot))

    setAvailableSlots(available)
  }

  const formatTimeSlot = (time: string) => {
    return formatTime(time)
  }

  const handleReschedule = async () => {
    if (!selectedDate || !selectedTime) return

    setSubmitting(true)

    try {
      const { error } = await supabase
        .from('jobs')
        .update({
          scheduled_date: format(selectedDate, 'yyyy-MM-dd'),
          scheduled_time: selectedTime,
          updated_at: new Date().toISOString(),
        })
        .eq('id', params.id)

      if (error) throw error

      toast.success('Appointment rescheduled successfully!')
      router.push(`/dashboard/appointments/${params.id}`)
    } catch (error: any) {
      toast.error(error.message || 'Failed to reschedule appointment')
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Reschedule Appointment</h1>
        <p className="text-muted-foreground">Select a new date and time</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Select New Date</CardTitle>
          </CardHeader>
          <CardContent>
            <Calendar
              mode="single"
              selected={selectedDate}
              onSelect={setSelectedDate}
              disabled={(date) => date < startOfTomorrow() || date > addDays(new Date(), 60)}
              className="rounded-md border"
            />
          </CardContent>
        </Card>

        {/* Time Slots */}
        <Card>
          <CardHeader>
            <CardTitle>Select New Time</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedDate ? (
              <div className="grid grid-cols-2 gap-2">
                {availableSlots.length > 0 ? (
                  availableSlots.map((slot) => (
                    <Button
                      key={slot}
                      variant={selectedTime === slot ? 'default' : 'outline'}
                      className="w-full"
                      onClick={() => setSelectedTime(slot)}
                    >
                      {formatTimeSlot(slot)}
                    </Button>
                  ))
                ) : (
                  <p className="col-span-2 text-sm text-muted-foreground text-center py-4">
                    No available slots for this date
                  </p>
                )}
              </div>
            ) : (
              <p className="text-sm text-muted-foreground text-center py-4">
                Please select a date first
              </p>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          <ArrowLeft className="mr-2 h-4 w-4" />
          Cancel
        </Button>
        <Button
          disabled={!selectedDate || !selectedTime || submitting}
          onClick={handleReschedule}
        >
          {submitting ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Rescheduling...
            </>
          ) : (
            'Confirm Reschedule'
          )}
        </Button>
      </div>
    </div>
  )
}
