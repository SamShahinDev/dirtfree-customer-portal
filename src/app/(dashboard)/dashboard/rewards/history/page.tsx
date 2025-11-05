import { createClient } from '@/lib/supabase/server'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { ArrowUp, ArrowDown } from 'lucide-react'
import { formatDate } from '@/lib/utils'

export const metadata = {
  title: 'Points History | Dirt Free Customer Portal',
  description: 'View your loyalty points transaction history',
}

export default async function PointsHistoryPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: customer } = await supabase
    .from('customers')
    .select('id')
    .eq('email', user?.email)
    .single()

  const { data: transactions } = await supabase
    .from('loyalty_transactions')
    .select('*, job:jobs(scheduled_date, services:job_services(service:services(name)))')
    .eq('customer_id', customer?.id)
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Points History</h1>
        <p className="text-muted-foreground">
          Complete transaction history of your loyalty points
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Transactions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {transactions && transactions.length > 0 ? (
              transactions.map((transaction) => (
                <div
                  key={transaction.id}
                  className="flex items-center justify-between py-4 border-b last:border-0"
                >
                  <div className="flex items-start gap-3">
                    <div
                      className={`p-2 rounded-full ${
                        transaction.points > 0
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}
                    >
                      {transaction.points > 0 ? (
                        <ArrowUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <ArrowDown className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {formatDate(transaction.created_at)}
                      </p>
                      {transaction.job && (
                        <p className="text-xs text-muted-foreground mt-1">
                          Service: {transaction.job.services?.[0]?.service?.name}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <p
                      className={`text-lg font-bold ${
                        transaction.points > 0
                          ? 'text-green-600'
                          : 'text-red-600'
                      }`}
                    >
                      {transaction.points > 0 ? '+' : ''}
                      {transaction.points}
                    </p>
                    <Badge variant="outline" className="text-xs">
                      {transaction.type}
                    </Badge>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No transactions yet
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
