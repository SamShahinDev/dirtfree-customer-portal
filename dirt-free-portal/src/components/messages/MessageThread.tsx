'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/lib/supabase/client'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Textarea } from '@/components/ui/textarea'
import {
  CheckCircle2,
  Send,
  Paperclip,
  Loader2
} from 'lucide-react'
import { toast } from 'sonner'
import { formatDate } from '@/lib/utils'
import { AttachmentList, type Attachment } from './AttachmentCard'
import { FileUpload, type UploadedFile } from '@/components/ui/file-upload'

interface MessageThreadProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  messageId: string | null
  onNewMessage?: () => void
}

interface Reply {
  id: string
  message: string
  created_at: string
  is_staff: boolean
  staff_name?: string
  attachments?: Attachment[]
}

interface Message {
  id: string
  subject: string
  message: string
  category: string
  status: string
  created_at: string
  customer_id: string
  attachments?: Attachment[]
}

export function MessageThread({
  open,
  onOpenChange,
  messageId,
  onNewMessage
}: MessageThreadProps) {
  const [message, setMessage] = useState<Message | null>(null)
  const [replies, setReplies] = useState<Reply[]>([])
  const [replyText, setReplyText] = useState('')
  const [replyAttachments, setReplyAttachments] = useState<UploadedFile[]>([])
  const [loading, setLoading] = useState(true)
  const [sending, setSending] = useState(false)
  const [customerName, setCustomerName] = useState('')
  const [customerId, setCustomerId] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (open && messageId) {
      loadThread()
      markAsRead()
      subscribeToReplies()
    }
  }, [open, messageId])

  const loadThread = async () => {
    if (!messageId) return

    setLoading(true)
    try {
      // Load message
      const { data: messageData, error: messageError } = await supabase
        .from('messages')
        .select('*')
        .eq('id', messageId)
        .single()

      if (messageError) throw messageError
      setMessage(messageData)

      // Load customer name and set customer ID
      const { data: customerData } = await supabase
        .from('customers')
        .select('id, name')
        .eq('id', messageData.customer_id)
        .single()

      setCustomerName(customerData?.name || 'Customer')
      setCustomerId(customerData?.id || null)

      // Load replies
      const { data: repliesData, error: repliesError } = await supabase
        .from('message_replies')
        .select('*')
        .eq('message_id', messageId)
        .order('created_at', { ascending: true })

      if (repliesError && repliesError.code !== 'PGRST116') {
        // Ignore "no rows returned" error
        console.error('Error loading replies:', repliesError)
      } else {
        setReplies(repliesData || [])
      }
    } catch (error) {
      console.error('Error loading thread:', error)
      toast.error('Failed to load conversation')
    } finally {
      setLoading(false)
    }
  }

  const markAsRead = async () => {
    if (!messageId) return

    await supabase
      .from('messages')
      .update({ has_unread_replies: false })
      .eq('id', messageId)
  }

  const subscribeToReplies = () => {
    if (!messageId) return

    const channel = supabase
      .channel(`message-${messageId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_replies',
          filter: `message_id=eq.${messageId}`
        },
        (payload) => {
          setReplies((prev) => [...prev, payload.new as Reply])
          markAsRead()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const handleSendReply = async () => {
    if (!replyText.trim() || !messageId || !message) return

    setSending(true)
    try {
      const { error } = await supabase.from('message_replies').insert({
        message_id: messageId,
        message: replyText.trim(),
        is_staff: false,
        attachments: replyAttachments,
        created_at: new Date().toISOString(),
      })

      if (error) throw error

      // Update message status to in_progress if it was new
      if (message.status === 'open') {
        await supabase
          .from('messages')
          .update({ status: 'in_progress' })
          .eq('id', messageId)
      }

      setReplyText('')
      setReplyAttachments([])
      toast.success('Reply sent successfully')
    } catch (error) {
      console.error('Error sending reply:', error)
      toast.error('Failed to send reply')
    } finally {
      setSending(false)
    }
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  const getCustomerInitials = () => {
    if (!customerName) return 'C'
    const parts = customerName.split(' ')
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[1][0]}`.toUpperCase()
    }
    return customerName[0].toUpperCase()
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case 'resolved':
      case 'closed':
        return 'default'
      case 'in_progress':
      case 'responded':
        return 'secondary'
      default:
        return 'outline'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'open':
        return 'New'
      case 'in_progress':
      case 'responded':
        return 'In Progress'
      case 'resolved':
      case 'closed':
        return 'Resolved'
      default:
        return status
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] flex flex-col">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : message ? (
          <>
            <DialogHeader>
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1">
                  <DialogTitle className="text-xl mb-1">{message.subject}</DialogTitle>
                  <DialogDescription>
                    <span className="capitalize">{message.category}</span> • {formatDate(message.created_at)}
                  </DialogDescription>
                </div>
                <Badge variant={getStatusBadgeVariant(message.status)}>
                  {getStatusLabel(message.status)}
                </Badge>
              </div>
            </DialogHeader>

            {/* Message Thread */}
            <ScrollArea className="flex-1 px-1 py-2 max-h-[400px]">
              <div className="space-y-4 pr-4">
                {/* Original Message */}
                <div className="bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500">
                  <div className="flex items-start gap-3">
                    <div className="bg-blue-600 text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold flex-shrink-0">
                      {getCustomerInitials()}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1 flex-wrap">
                        <span className="font-semibold">You</span>
                        <span className="text-xs text-muted-foreground">
                          {formatDateTime(message.created_at)}
                        </span>
                      </div>
                      <p className="text-sm whitespace-pre-wrap break-words">{message.message}</p>

                      {/* Display attachments if any */}
                      {message.attachments && message.attachments.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-blue-200">
                          <AttachmentList
                            attachments={message.attachments}
                            messageId={message.id}
                          />
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Replies from Staff */}
                {replies.map((reply) => (
                  <div key={reply.id} className={reply.is_staff ? 'bg-gray-50 rounded-lg p-4' : 'bg-blue-50 rounded-lg p-4 border-l-4 border-blue-500'}>
                    <div className="flex items-start gap-3">
                      <div className={`${reply.is_staff ? 'bg-gray-600' : 'bg-blue-600'} text-white rounded-full h-8 w-8 flex items-center justify-center text-sm font-semibold flex-shrink-0`}>
                        {reply.is_staff ? 'DF' : getCustomerInitials()}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="font-semibold">
                            {reply.is_staff ? (reply.staff_name || 'Dirt Free Team') : 'You'}
                          </span>
                          {reply.is_staff && (
                            <Badge variant="outline" className="text-xs">Staff</Badge>
                          )}
                          <span className="text-xs text-muted-foreground">
                            {formatDateTime(reply.created_at)}
                          </span>
                        </div>
                        <p className="text-sm whitespace-pre-wrap break-words">{reply.message}</p>

                        {/* Display reply attachments if any */}
                        {reply.attachments && reply.attachments.length > 0 && (
                          <div className={`mt-3 pt-3 border-t ${reply.is_staff ? 'border-gray-200' : 'border-blue-200'}`}>
                            <AttachmentList
                              attachments={reply.attachments}
                              replyId={reply.id}
                              compact
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Reply Input (only if not resolved) */}
            {message.status !== 'resolved' && message.status !== 'closed' ? (
              <div className="border-t pt-4 space-y-3">
                <Textarea
                  placeholder="Type your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                  className="min-h-[80px] resize-none"
                  disabled={sending}
                />

                {/* File Upload for Replies */}
                {customerId && (
                  <div>
                    <FileUpload
                      customerId={customerId}
                      bucket="MESSAGE_ATTACHMENTS"
                      category="replies"
                      maxFiles={3}
                      onFilesChange={setReplyAttachments}
                      existingFiles={replyAttachments}
                      disabled={sending}
                    />
                  </div>
                )}

                <div className="flex justify-end items-center">
                  <Button
                    size="sm"
                    onClick={handleSendReply}
                    disabled={!replyText.trim() || sending}
                  >
                    {sending ? (
                      <>
                        <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                        Sending...
                      </>
                    ) : (
                      <>
                        <Send className="h-4 w-4 mr-2" />
                        Send Reply
                      </>
                    )}
                  </Button>
                </div>
              </div>
            ) : (
              /* Resolved Banner */
              <Alert className="border-green-200 bg-green-50">
                <CheckCircle2 className="h-4 w-4 text-green-600" />
                <AlertTitle className="text-green-900">This conversation has been resolved</AlertTitle>
                <AlertDescription className="text-green-800">
                  Need to discuss something else?{' '}
                  <button
                    onClick={() => {
                      onOpenChange(false)
                      if (onNewMessage) onNewMessage()
                    }}
                    className="text-blue-600 underline font-semibold hover:text-blue-700"
                  >
                    Start a new message
                  </button>
                </AlertDescription>
              </Alert>
            )}
          </>
        ) : (
          <div className="text-center py-12">
            <p className="text-muted-foreground">Message not found</p>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
