'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Gift,
  TrendingUp,
  Users,
  Award,
  Copy,
  Sparkles,
  Calendar,
  Info,
  DollarSign,
  Star,
  CheckCircle,
  Target
} from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { Badge } from '@/components/ui/badge'
import { Input } from '@/components/ui/input'
import Link from 'next/link'
import { formatCurrency, calculateLoyaltyReward, formatDate, cn } from '@/lib/utils'
import { toast } from 'sonner'

export default function RewardsPage() {
  const [customer, setCustomer] = useState<any>(null)
  const [points, setPoints] = useState(0)
  const [totalEarned, setTotalEarned] = useState(0)
  const [totalRedeemed, setTotalRedeemed] = useState(0)
  const [rewards, setRewards] = useState<any[]>([])
  const [pointsHistory, setPointsHistory] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [nextReward, setNextReward] = useState<any>(null)
  const [progressToNext, setProgressToNext] = useState(0)
  const [memberSince, setMemberSince] = useState('2024')

  const supabase = createClient()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    try {
      setLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      const { data: customerData } = await supabase
        .from('customers')
        .select('*')
        .eq('email', user?.email)
        .single()

      if (!customerData) {
        toast.error('Customer not found')
        setLoading(false)
        return
      }

      setCustomer(customerData)
      setMemberSince(customerData.created_at ? new Date(customerData.created_at).getFullYear().toString() : '2024')

      // Get loyalty points
      const { data: loyalty } = await supabase
        .from('loyalty_points')
        .select('*')
        .eq('customer_id', customerData.id)
        .single()

      const currentPoints = loyalty?.points || 0
      const earned = loyalty?.total_earned || 0
      const redeemed = loyalty?.total_redeemed || 0

      setPoints(currentPoints)
      setTotalEarned(earned)
      setTotalRedeemed(redeemed)

      // Get available rewards
      const { data: rewardsData } = await supabase
        .from('rewards')
        .select('*')
        .eq('active', true)
        .order('points_required')

      setRewards(rewardsData || [])

      // Calculate next reward
      const next = rewardsData?.find(r => r.points_required > currentPoints)
      setNextReward(next)

      if (next) {
        const progress = (currentPoints / next.points_required) * 100
        setProgressToNext(progress)
      } else {
        setProgressToNext(100)
      }

      // Get points history
      const { data: historyData } = await supabase
        .from('loyalty_transactions')
        .select('*, job:jobs(scheduled_date)')
        .eq('customer_id', customerData.id)
        .order('created_at', { ascending: false })
        .limit(5)

      setPointsHistory(historyData || [])
    } catch (error) {
      console.error('Error loading rewards data:', error)
      toast.error('Failed to load rewards data')
    } finally {
      setLoading(false)
    }
  }

  const handleCopyLink = () => {
    const referralLink = `https://dirtfreecarpet.com/refer/${customer?.id}`
    navigator.clipboard.writeText(referralLink)
    toast.success('Referral link copied to clipboard!')
  }

  const handleRedeem = (reward: any) => {
    if (points < reward.points_required) {
      toast.error(`You need ${reward.points_required - points} more points to redeem this reward`)
      return
    }
    // TODO: Implement redeem logic
    toast.success(`Redeeming ${reward.name}...`)
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading your rewards...</p>
        </div>
      </div>
    )
  }

  const rewardValue = calculateLoyaltyReward(points)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Loyalty Rewards</h1>
        <p className="text-muted-foreground">
          Earn points with every service and redeem for rewards
        </p>
      </div>

      {/* Points Overview - Enhanced with colored borders and hover effects */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="border-l-4 border-yellow-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Current Points
            </CardTitle>
            <div className="p-2 rounded-full bg-yellow-100">
              <Gift className="h-4 w-4 text-yellow-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">{points}</div>
            <p className="text-xs text-muted-foreground">
              {formatCurrency(rewardValue)} in rewards
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-green-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Lifetime Earned
            </CardTitle>
            <div className="p-2 rounded-full bg-green-100">
              <TrendingUp className="h-4 w-4 text-green-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalEarned}</div>
            <p className="text-xs text-muted-foreground">
              Total points earned
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-purple-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Total Redeemed
            </CardTitle>
            <div className="p-2 rounded-full bg-purple-100">
              <Award className="h-4 w-4 text-purple-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalRedeemed}</div>
            <p className="text-xs text-muted-foreground">
              Points used
            </p>
          </CardContent>
        </Card>

        <Card className="border-l-4 border-blue-500 transition-all duration-200 hover:shadow-lg hover:-translate-y-1">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Member Since
            </CardTitle>
            <div className="p-2 rounded-full bg-blue-100">
              <Users className="h-4 w-4 text-blue-600" />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{memberSince}</div>
            <p className="text-xs text-muted-foreground">
              Loyal customer
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Next Reward Progress */}
      {nextReward && (
        <Card className="border-t-4 border-blue-500">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-blue-600" />
              <CardTitle>Next Reward</CardTitle>
            </div>
            <CardDescription>
              {nextReward.points_required - points} more points to unlock {nextReward.name}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Progress value={progressToNext} className="h-3 mb-2" />
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">
                {points} / {nextReward.points_required} points
              </span>
              <span className="font-semibold text-blue-600">
                {Math.round(progressToNext)}% complete
              </span>
            </div>
          </CardContent>
        </Card>
      )}

      {/* How to Earn Points */}
      <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-100">
              <Info className="h-5 w-5 text-blue-600" />
            </div>
            <CardTitle>How to Earn Points</CardTitle>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-green-100 mt-1">
                <DollarSign className="h-5 w-5 text-green-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Book Services</h4>
                <p className="text-sm text-muted-foreground">
                  Earn 100 points for every $100 spent on carpet cleaning services
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-purple-100 mt-1">
                <Users className="h-5 w-5 text-purple-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Refer Friends</h4>
                <p className="text-sm text-muted-foreground">
                  Get 500 bonus points when your referral books their first service
                </p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-full bg-yellow-100 mt-1">
                <Star className="h-5 w-5 text-yellow-600" />
              </div>
              <div>
                <h4 className="font-semibold mb-1">Leave Reviews</h4>
                <p className="text-sm text-muted-foreground">
                  Earn 50 points for leaving a review after your service
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Available Rewards */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Available Rewards</CardTitle>
              <CardDescription>
                Redeem your points for these rewards
              </CardDescription>
            </div>
            <Button variant="outline" asChild>
              <Link href="/dashboard/rewards/history">View History</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {rewards && rewards.length > 0 ? (
              rewards.map((reward) => {
                const canRedeem = points >= reward.points_required
                return (
                  <Card
                    key={reward.id}
                    className={cn(
                      "transition-all duration-200",
                      canRedeem
                        ? "border-2 border-green-200 hover:border-green-300 hover:shadow-md"
                        : "opacity-60 hover:opacity-70"
                    )}
                  >
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <CardTitle className="text-lg">{reward.name}</CardTitle>
                        {canRedeem && (
                          <Badge className="bg-green-100 text-green-800">
                            <CheckCircle className="h-3 w-3 mr-1" />
                            Available
                          </Badge>
                        )}
                      </div>
                      <CardDescription>{reward.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Cost</span>
                        <span className="font-bold">{reward.points_required} points</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium">Value</span>
                        <span className="font-bold">{formatCurrency(reward.value)}</span>
                      </div>
                      <Button
                        className={cn(
                          "w-full",
                          canRedeem && "bg-green-600 hover:bg-green-700"
                        )}
                        disabled={!canRedeem}
                        onClick={() => handleRedeem(reward)}
                      >
                        {canRedeem ? 'Redeem Now' : `Need ${reward.points_required - points} more points`}
                      </Button>
                    </CardContent>
                  </Card>
                )
              })
            ) : (
              <div className="col-span-3 text-center py-12">
                <div className="mx-auto w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mb-4">
                  <Gift className="h-10 w-10 text-purple-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">No rewards available yet</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Rewards are being added soon! Keep earning points to be ready when they launch.
                </p>
                <Button asChild variant="outline">
                  <Link href="/dashboard/appointments/new">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Service to Earn Points
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Points History */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Activity</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {pointsHistory && pointsHistory.length > 0 ? (
              pointsHistory.map((transaction: any) => (
                <div key={transaction.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div className="flex items-start gap-3">
                    <div className={cn(
                      "p-2 rounded-full mt-1",
                      transaction.points > 0 ? "bg-green-100" : "bg-red-100"
                    )}>
                      {transaction.points > 0 ? (
                        <TrendingUp className="h-4 w-4 text-green-600" />
                      ) : (
                        <Award className="h-4 w-4 text-red-600" />
                      )}
                    </div>
                    <div>
                      <p className="font-medium">{transaction.description}</p>
                      <p className="text-sm text-muted-foreground">
                        {new Date(transaction.created_at).toLocaleDateString('en-US', {
                          year: 'numeric',
                          month: 'long',
                          day: 'numeric'
                        })}
                      </p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className={cn(
                      "text-lg font-bold",
                      transaction.points > 0 ? 'text-green-600' : 'text-red-600'
                    )}>
                      {transaction.points > 0 ? '+' : ''}{transaction.points}
                    </p>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <div className="mx-auto w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-10 w-10 text-blue-600" />
                </div>
                <h3 className="text-lg font-semibold mb-2">Start earning points today!</h3>
                <p className="text-sm text-muted-foreground mb-6 max-w-sm mx-auto">
                  Your points activity will appear here. Book your first service to start earning rewards!
                </p>
                <Button asChild>
                  <Link href="/dashboard/appointments/new">
                    <Calendar className="mr-2 h-4 w-4" />
                    Book Your First Service
                  </Link>
                </Button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Referral Program */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-2 border-blue-200">
        <CardHeader>
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-full bg-blue-200">
              <Users className="h-5 w-5 text-blue-700" />
            </div>
            <div>
              <CardTitle>Refer a Friend, Earn 500 Points!</CardTitle>
              <CardDescription>
                Share your referral link and earn bonus points
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={customer ? `https://dirtfreecarpet.com/refer/${customer.id}` : ''}
              readOnly
              className="bg-white"
            />
            <Button onClick={handleCopyLink} className="gap-2 bg-blue-600 hover:bg-blue-700">
              <Copy className="h-4 w-4" />
              Copy
            </Button>
          </div>
          <div className="flex items-start gap-2 p-3 rounded-lg bg-blue-200/50">
            <Info className="h-5 w-5 text-blue-700 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-blue-900">
              Your friend gets 10% off their first service, and you get 500 points when they complete their booking!
            </p>
          </div>
          <Button variant="outline" asChild className="w-full sm:w-auto">
            <Link href="/dashboard/rewards/referrals">
              View Your Referrals
            </Link>
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}
