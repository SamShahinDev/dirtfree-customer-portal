'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'
import { Loader2, Send } from 'lucide-react'

interface ReplyFormProps {
  messageId: string
  customerId: string
}

export function ReplyForm({ messageId, customerId }: ReplyFormProps) {
  const [reply, setReply] = useState('')
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!reply.trim()) {
      toast.error('Please enter a message')
      return
    }

    setLoading(true)

    try {
      const { error } = await supabase
        .from('message_replies')
        .insert({
          message_id: messageId,
          customer_id: customerId,
          message: reply,
          is_staff_reply: false,
        })

      if (error) throw error

      // Update message status
      await supabase
        .from('messages')
        .update({ status: 'open', updated_at: new Date().toISOString() })
        .eq('id', messageId)

      // TODO: Send notification to staff

      toast.success('Reply sent successfully')
      setReply('')
      router.refresh()
    } catch (error: any) {
      toast.error(error.message || 'Failed to send reply')
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <Textarea
        value={reply}
        onChange={(e) => setReply(e.target.value)}
        placeholder="Type your reply..."
        rows={4}
        disabled={loading}
      />
      <Button type="submit" disabled={loading || !reply.trim()}>
        {loading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          <>
            <Send className="mr-2 h-4 w-4" />
            Send Reply
          </>
        )}
      </Button>
    </form>
  )
}
