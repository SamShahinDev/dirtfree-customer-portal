'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { CheckCircle2, ArrowRight } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

export default function NewAppointmentPage() {
  const [selectedServices, setSelectedServices] = useState<string[]>([])
  const [services, setServices] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    loadServices()
  }, [])

  const loadServices = async () => {
    const { data } = await supabase
      .from('services')
      .select('*')
      .eq('active', true)
      .order('name')

    setServices(data || [])
    setLoading(false)
  }

  const toggleService = (serviceId: string) => {
    setSelectedServices(prev =>
      prev.includes(serviceId)
        ? prev.filter(id => id !== serviceId)
        : [...prev, serviceId]
    )
  }

  const handleContinue = () => {
    if (selectedServices.length === 0) return

    // Store selection in sessionStorage
    sessionStorage.setItem('bookingServices', JSON.stringify(selectedServices))
    router.push('/dashboard/appointments/new/datetime')
  }

  if (loading) return <div>Loading...</div>

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Book an Appointment</h1>
        <p className="text-muted-foreground">Step 1 of 3: Select services</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {services.map((service) => (
          <Card
            key={service.id}
            className={`cursor-pointer transition-all ${
              selectedServices.includes(service.id)
                ? 'ring-2 ring-primary'
                : 'hover:border-primary'
            }`}
            onClick={() => toggleService(service.id)}
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-lg">{service.name}</CardTitle>
                </div>
                {selectedServices.includes(service.id) && (
                  <CheckCircle2 className="h-6 w-6 text-primary" />
                )}
              </div>
              <CardDescription>{service.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-semibold text-primary">
                Starting at {formatCurrency(service.base_price)}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="flex justify-between">
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button disabled={selectedServices.length === 0} onClick={handleContinue}>
          Continue to Date & Time
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  )
}
