'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import { ArrowRight, ArrowLeft } from 'lucide-react'
import { addDays, format, startOfTomorrow } from 'date-fns'

const TIME_SLOTS = [
  '08:00:00', '09:00:00', '10:00:00', '11:00:00',
  '12:00:00', '13:00:00', '14:00:00', '15:00:00',
  '16:00:00', '17:00:00'
]

export default function DateTimePage() {
  const [selectedDate, setSelectedDate] = useState<Date>()
  const [selectedTime, setSelectedTime] = useState<string>()
  const [availableSlots, setAvailableSlots] = useState<string[]>([])
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    if (selectedDate) {
      checkAvailability(selectedDate)
    }
  }, [selectedDate])

  const checkAvailability = async (date: Date) => {
    const dateStr = format(date, 'yyyy-MM-dd')

    // Get booked slots for this date
    const { data: bookedJobs } = await supabase
      .from('jobs')
      .select('scheduled_time')
      .eq('scheduled_date', dateStr)
      .in('status', ['scheduled', 'confirmed', 'in_progress'])

    const bookedTimes = bookedJobs?.map(job => job.scheduled_time) || []
    const available = TIME_SLOTS.filter(slot => !bookedTimes.includes(slot))

    setAvailableSlots(available)
  }

  const formatTimeSlot = (time: string) => {
    const [hours, minutes] = time.split(':')
    const hour = parseInt(hours)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour % 12 || 12
    return `${displayHour}:${minutes} ${ampm}`
  }

  const handleContinue = () => {
    if (!selectedDate || !selectedTime) return

    sessionStorage.setItem('bookingDate', format(selectedDate, 'yyyy-MM-dd'))
    sessionStorage.setItem('bookingTime', selectedTime)
    router.push('/dashboard/appointments/new/confirm')
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
        <p className="text-muted-foreground">Step 2 of 3: Select date & time</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {/* Calendar */}
        <Card>
          <CardHeader>
            <CardTitle>Select Date</CardTitle>
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
            <CardTitle>Select Time</CardTitle>
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
          Back
        </Button>
        <Button disabled={!selectedDate || !selectedTime} onClick={handleContinue}>
          Review Booking
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
