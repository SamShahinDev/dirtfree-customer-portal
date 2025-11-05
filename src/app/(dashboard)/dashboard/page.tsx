import { createClient } from '@/lib/supabase/server'
import { Calendar, Receipt, Gift, Clock } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import { formatCurrency, formatDate, formatTime } from '@/lib/utils'

export const metadata = {
  title: 'Dashboard | Dirt Free Customer Portal',
  description: 'View your appointments, invoices, and loyalty rewards',
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get customer
  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  if (!customer) {
    return <div>Customer not found</div>
  }

  // Get next appointment
  const { data: nextAppointment } = await supabase
    .from('jobs')
    .select('*, services:job_services(service:services(name))')
    .eq('customer_id', customer.id)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time', { ascending: true })
    .limit(1)
    .single()

  // Get total visits
  const { count: totalVisits } = await supabase
    .from('jobs')
    .select('*', { count: 'exact', head: true })
    .eq('customer_id', customer.id)
    .eq('status', 'completed')

  // Get loyalty points
  const { data: loyalty } = await supabase
    .from('loyalty_points')
    .select('points')
    .eq('customer_id', customer.id)
    .single()

  // Get outstanding balance
  const { data: invoices } = await supabase
    .from('invoices')
    .select('amount')
    .eq('customer_id', customer.id)
    .in('status', ['pending', 'overdue'])

  const outstandingBalance = invoices?.reduce((sum, inv) => sum + inv.amount, 0) || 0

  // Get recent jobs
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select('*, services:job_services(service:services(name))')
    .eq('customer_id', customer.id)
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })
    .limit(3)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Welcome Back!</h1>
        <p className="text-muted-foreground">
          Here's what's happening with your account
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Appointment
            </CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <>
                <div className="text-2xl font-bold">
                  {formatDate(nextAppointment.scheduled_date)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTime(nextAppointment.scheduled_time)} - {nextAppointment.services?.[0]?.service?.name}
                </p>
              </>
            ) : (
              <p className="text-sm text-muted-foreground">No upcoming appointments</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalVisits || 0}</div>
            <p className="text-xs text-muted-foreground">
              Completed services
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <Gift className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loyalty?.points || 0}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency((loyalty?.points || 0) / 100)} in rewards
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            <Receipt className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(outstandingBalance)}
            </div>
            <p className={`text-xs ${outstandingBalance === 0 ? 'text-green-600' : 'text-yellow-600'}`}>
              {outstandingBalance === 0 ? 'All caught up!' : 'Payment pending'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <Button asChild className="h-24 flex-col gap-2">
            <Link href="/dashboard/appointments/new">
              <Calendar className="h-6 w-6" />
              <span>Book Appointment</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link href="/dashboard/invoices">
              <Receipt className="h-6 w-6" />
              <span>View Invoices</span>
            </Link>
          </Button>
          <Button asChild variant="outline" className="h-24 flex-col gap-2">
            <Link href="/dashboard/rewards">
              <Gift className="h-6 w-6" />
              <span>Redeem Rewards</span>
            </Link>
          </Button>
        </CardContent>
      </Card>

      {/* Recent Activity */}
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
                    <p className="font-medium">{formatCurrency(job.total_amount)}</p>
                    <p className="text-xs text-green-600">Completed</p>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground">No service history yet</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
