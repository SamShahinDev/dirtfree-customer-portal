import { createClient } from '@/lib/supabase/server'
import { Calendar, Receipt, Gift, Clock, Check, TrendingUp, ArrowRight } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import Link from 'next/link'
import { formatCurrency, formatDate, formatTime, cn } from '@/lib/utils'
import { Suspense } from 'react'
import dynamic from 'next/dynamic'
import { CustomerNotFound } from '@/components/errors/customer-not-found'

// Dynamic imports for below-fold components
// These components are loaded after the initial page render, reducing initial bundle size
const QuickActionsCard = dynamic(() => import('@/components/dashboard/quick-actions-card').then(m => ({ default: m.QuickActionsCard })), {
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle className="h-6 w-32 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
        <div className="h-32 bg-muted animate-pulse rounded" />
      </CardContent>
    </Card>
  ),
})

const RecentActivitySection = dynamic(() => import('@/components/dashboard/recent-activity-section').then(m => ({ default: m.RecentActivitySection })), {
  loading: () => (
    <Card>
      <CardHeader>
        <CardTitle className="h-6 w-48 bg-muted animate-pulse rounded" />
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="h-16 bg-muted animate-pulse rounded" />
          <div className="h-16 bg-muted animate-pulse rounded" />
          <div className="h-16 bg-muted animate-pulse rounded" />
        </div>
      </CardContent>
    </Card>
  ),
})

export const metadata = {
  title: 'Dashboard | Dirt Free Customer Portal',
  description: 'View your appointments, invoices, and loyalty rewards',
}

function getGreeting() {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 18) return 'Good afternoon'
  return 'Good evening'
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  // Get customer with name
  const { data: customer } = await supabase
    .from('customers')
    .select('id, name')
    .eq('email', user?.email)
    .single()

  if (!customer) {
    return <CustomerNotFound />
  }

  // Extract first name for greeting
  const firstName = customer.name?.split(' ')[0] || 'Customer'

  // Get next appointment
  const { data: nextAppointment } = await supabase
    .from('jobs')
    .select('*, services:job_services(service:services(name))')
    .eq('customer_id', customer.id)
    .in('status', ['scheduled', 'confirmed'])
    .gte('scheduled_date', new Date().toISOString().split('T')[0])
    .order('scheduled_date', { ascending: true })
    .order('scheduled_time_start', { ascending: true })
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
    .select('total_cents')
    .eq('customer_id', customer.id)
    .in('status', ['draft', 'sent'])

  const outstandingBalance = invoices?.reduce((sum, inv) => sum + (inv.total_cents || 0), 0) || 0
  const outstandingBalanceDollars = outstandingBalance / 100

  // Get recent jobs
  const { data: recentJobs } = await supabase
    .from('jobs')
    .select('*, services:job_services(service:services(name))')
    .eq('customer_id', customer.id)
    .eq('status', 'completed')
    .order('scheduled_date', { ascending: false })
    .limit(3)

  // Loyalty points calculations
  const currentPoints = loyalty?.points || 0
  const pointsPerTier = 1000
  const nextTierPoints = Math.ceil(currentPoints / pointsPerTier) * pointsPerTier || pointsPerTier
  const pointsToNextTier = nextTierPoints - currentPoints
  const progressPercentage = currentPoints === 0 ? 0 : ((currentPoints % pointsPerTier) / pointsPerTier) * 100
  const nextTierValue = 10 // $10 per 1000 points

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">
          {getGreeting()}, {firstName}! 👋
        </h1>
        <p className="text-muted-foreground">
          Here's what's happening with your account
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {/* Next Appointment Card */}
        <Card className={cn(
          "min-h-[140px] transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
          "border-l-4 border-blue-500"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Next Appointment
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-100">
              <Calendar className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            {nextAppointment ? (
              <>
                <div className="text-2xl font-bold">
                  {formatDate(nextAppointment.scheduled_date)}
                </div>
                <p className="text-xs text-muted-foreground">
                  {formatTime(nextAppointment.scheduled_time_start)} - {nextAppointment.services?.[0]?.service?.name}
                </p>
              </>
            ) : (
              <div className="text-center py-2">
                <p className="text-sm font-semibold mb-1">Ready for your next cleaning?</p>
                <Button asChild size="sm" variant="link" className="h-auto p-0 text-blue-600">
                  <Link href="/dashboard/appointments/new">
                    Schedule Now <ArrowRight className="h-3 w-3 ml-1" />
                  </Link>
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Total Visits Card */}
        <Card className={cn(
          "min-h-[140px] transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
          "border-l-4 border-green-500"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <div className="p-2 rounded-full bg-green-100">
              <Clock className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <div className="text-2xl font-bold">{totalVisits || 0}</div>
              {totalVisits && totalVisits > 0 && (
                <Badge variant="secondary" className="gap-1">
                  <TrendingUp className="h-3 w-3" />
                  Active
                </Badge>
              )}
            </div>
            <p className="text-xs text-muted-foreground">
              Completed services
            </p>
          </CardContent>
        </Card>

        {/* Loyalty Points Card */}
        <Card className={cn(
          "min-h-[140px] transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
          "border-l-4 border-yellow-500"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Loyalty Points</CardTitle>
            <div className="p-2 rounded-full bg-yellow-100">
              <Gift className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{currentPoints}</div>
            <p className="text-xs text-muted-foreground mb-3">
              {formatCurrency(currentPoints / 100)} in rewards
            </p>
            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-muted-foreground">
                <span>{currentPoints} pts</span>
                <span>{nextTierPoints} pts</span>
              </div>
              <Progress value={progressPercentage} className="h-2" />
              <p className="text-xs text-muted-foreground">
                {pointsToNextTier} more points to unlock {formatCurrency(nextTierValue)} reward!
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Balance Due Card */}
        <Card className={cn(
          "min-h-[140px] transition-all duration-200 hover:shadow-lg hover:-translate-y-1",
          "border-l-4",
          outstandingBalanceDollars === 0
            ? "border-green-500 bg-green-50/50"
            : "border-yellow-500 bg-yellow-50/50"
        )}>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Balance Due</CardTitle>
            <div className={cn(
              "p-2 rounded-full",
              outstandingBalanceDollars === 0 ? "bg-green-100" : "bg-yellow-100"
            )}>
              {outstandingBalanceDollars === 0 ? (
                <Check className="h-4 w-4 text-green-600" />
              ) : (
                <Receipt className="h-4 w-4 text-yellow-600" />
              )}
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {formatCurrency(outstandingBalanceDollars)}
            </div>
            <p className={cn(
              "text-xs mb-2",
              outstandingBalanceDollars === 0 ? 'text-green-600' : 'text-yellow-600'
            )}>
              {outstandingBalanceDollars === 0 ? 'All caught up! ✓' : 'Payment pending'}
            </p>
            {outstandingBalanceDollars > 0 && (
              <Button asChild size="sm" className="w-full mt-1 h-8">
                <Link href="/dashboard/invoices">
                  Pay Now
                </Link>
              </Button>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions - Lazy Loaded */}
      <QuickActionsCard />

      {/* Recent Activity - Lazy Loaded */}
      <RecentActivitySection recentJobs={recentJobs} />
    </div>
  )
}
