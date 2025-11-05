'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { toast } from 'sonner'
import { Loader2 } from 'lucide-react'
import { formatCurrency } from '@/lib/utils'

interface RedeemButtonProps {
  rewardId: string
  rewardName: string
  pointsCost: number
  rewardValue: number
  currentPoints: number
  disabled?: boolean
}

export function RedeemButton({
  rewardId,
  rewardName,
  pointsCost,
  rewardValue,
  currentPoints,
  disabled
}: RedeemButtonProps) {
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const router = useRouter()

  const handleRedeem = async () => {
    setLoading(true)

    try {
      const response = await fetch(`/api/rewards/${rewardId}/redeem`, {
        method: 'POST',
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error)
      }

      toast.success(`Successfully redeemed ${rewardName}!`)
      setOpen(false)
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to redeem reward')
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button className="w-full" disabled={disabled}>
          Redeem
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Redeem {rewardName}?</DialogTitle>
          <DialogDescription>
            This will deduct {pointsCost} points from your balance.
          </DialogDescription>
        </DialogHeader>
        <div className="space-y-2 py-4">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Cost:</span>
            <span className="font-medium">{pointsCost} points</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Value:</span>
            <span className="font-medium">{formatCurrency(rewardValue)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Current Balance:</span>
            <span className="font-medium">{currentPoints} points</span>
          </div>
          <div className="flex justify-between font-bold">
            <span>New Balance:</span>
            <span>{currentPoints - pointsCost} points</span>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRedeem} disabled={loading}>
            {loading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Redeeming...
              </>
            ) : (
              'Confirm Redemption'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
