'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Badge } from '@/components/ui/badge'
import { Share2, Copy, Mail, MessageSquare, Check } from 'lucide-react'
import { toast } from 'sonner'

export default function ReferralsPage() {
  const [customer, setCustomer] = useState<any>(null)
  const [referrals, setReferrals] = useState<any[]>([])
  const [copied, setCopied] = useState(false)
  const [loading, setLoading] = useState(true)
  const supabase = createClient()

  useEffect(() => {
    loadReferralData()
  }, [])

  const loadReferralData = async () => {
    const { data: { user } } = await supabase.auth.getUser()

    const { data: customerData } = await supabase
      .from('customers')
      .select('*')
      .eq('email', user?.email)
      .single()

    setCustomer(customerData)

    // Get referrals
    const { data: referralsData } = await supabase
      .from('referrals')
      .select('*, referred_customer:customers(*)')
      .eq('referring_customer_id', customerData?.id)
      .order('created_at', { ascending: false })

    setReferrals(referralsData || [])
    setLoading(false)
  }

  const referralLink = `${process.env.NEXT_PUBLIC_WEBSITE_URL}/refer/${customer?.id}`

  const copyToClipboard = () => {
    navigator.clipboard.writeText(referralLink)
    setCopied(true)
    toast.success('Referral link copied!')
    setTimeout(() => setCopied(false), 2000)
  }

  const shareViaEmail = () => {
    const subject = 'Try Dirt Free Carpet - Get 10% Off!'
    const body = `I've been using Dirt Free Carpet and love their service! Use my referral link to get 10% off your first service: ${referralLink}`
    window.location.href = `mailto:?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`
  }

  const shareViaSMS = () => {
    const message = `Check out Dirt Free Carpet! Get 10% off your first service with my referral: ${referralLink}`
    window.location.href = `sms:?body=${encodeURIComponent(message)}`
  }

  if (loading) return <div>Loading...</div>

  const totalReferrals = referrals.length
  const completedReferrals = referrals.filter(r => r.status === 'completed').length
  const pointsEarned = completedReferrals * 500

  return (
    <div className="max-w-4xl space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Referral Program</h1>
        <p className="text-muted-foreground">
          Share the love and earn rewards
        </p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Completed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{completedReferrals}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Points Earned
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{pointsEarned}</div>
          </CardContent>
        </Card>
      </div>

      {/* Share Card */}
      <Card className="bg-gradient-to-r from-blue-50 to-blue-100">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Share2 className="h-5 w-5" />
            <CardTitle>Share Your Referral Link</CardTitle>
          </div>
          <CardDescription>
            Earn 500 points for each friend who completes their first service!
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center gap-2">
            <Input
              value={referralLink}
              readOnly
              className="bg-white"
            />
            <Button onClick={copyToClipboard}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Button variant="outline" onClick={shareViaEmail}>
              <Mail className="mr-2 h-4 w-4" />
              Email
            </Button>
            <Button variant="outline" onClick={shareViaSMS}>
              <MessageSquare className="mr-2 h-4 w-4" />
              SMS
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Referrals List */}
      <Card>
        <CardHeader>
          <CardTitle>Your Referrals</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {referrals.length > 0 ? (
              referrals.map((referral) => (
                <div key={referral.id} className="flex items-center justify-between py-3 border-b last:border-0">
                  <div>
                    <p className="font-medium">
                      {referral.referred_customer?.first_name} {referral.referred_customer?.last_name}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      Referred on {new Date(referral.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="text-right">
                    <Badge
                      className={
                        referral.status === 'completed'
                          ? 'bg-green-100 text-green-800'
                          : referral.status === 'pending'
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-gray-100 text-gray-800'
                      }
                    >
                      {referral.status}
                    </Badge>
                    {referral.status === 'completed' && (
                      <p className="text-sm text-green-600 mt-1">+500 points</p>
                    )}
                  </div>
                </div>
              ))
            ) : (
              <p className="text-sm text-muted-foreground text-center py-8">
                No referrals yet. Share your link to get started!
              </p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
