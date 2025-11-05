import { Calendar, Receipt, Gift, Zap } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import Link from 'next/link'

export function QuickActionsCard() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Zap className="h-5 w-5 text-primary" />
          Quick Actions
        </CardTitle>
      </CardHeader>
      <CardContent className="grid gap-4 md:grid-cols-3">
        {/* Book Appointment - Primary Action */}
        <Button
          asChild
          className="h-32 flex-col gap-3 text-base bg-gradient-to-br from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 shadow-md hover:shadow-xl transition-all duration-200"
        >
          <Link href="/dashboard/appointments/new">
            <div className="p-3 rounded-full bg-white/20">
              <Calendar className="h-7 w-7" />
            </div>
            <span className="font-semibold">Book Appointment</span>
          </Link>
        </Button>

        {/* View Invoices */}
        <Button
          asChild
          variant="outline"
          className="h-32 flex-col gap-3 text-base border-2 hover:border-gray-900 hover:bg-gray-50 transition-all duration-200 hover:shadow-md"
        >
          <Link href="/dashboard/invoices">
            <div className="p-3 rounded-full bg-gray-100">
              <Receipt className="h-7 w-7 text-gray-700" />
            </div>
            <span className="font-semibold">View Invoices</span>
          </Link>
        </Button>

        {/* Redeem Rewards */}
        <Button
          asChild
          variant="outline"
          className="h-32 flex-col gap-3 text-base border-2 border-yellow-300 hover:border-yellow-400 bg-yellow-50 hover:bg-yellow-100 transition-all duration-200 hover:shadow-md"
        >
          <Link href="/dashboard/rewards">
            <div className="p-3 rounded-full bg-yellow-200">
              <Gift className="h-7 w-7 text-yellow-700" />
            </div>
            <span className="font-semibold text-yellow-900">Redeem Rewards</span>
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
