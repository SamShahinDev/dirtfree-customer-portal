'use client'

import { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Skeleton } from '@/components/ui/skeleton'
import {
  MessageSquare,
  Plus,
  Calendar,
  HelpCircle,
  Receipt,
  Clock,
  Phone,
  CheckCircle2,
  Inbox
} from 'lucide-react'
import { NewMessageDialog } from '@/components/messages/NewMessageDialog'
import { MessageList } from '@/components/messages/MessageList'
import { MessageThread } from '@/components/messages/MessageThread'
import { toast } from 'sonner'

const statusColors = {
  open: 'bg-blue-100 text-blue-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  responded: 'bg-yellow-100 text-yellow-800',
  resolved: 'bg-green-100 text-green-800',
  closed: 'bg-gray-100 text-gray-800',
}

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([])
  const [filteredMessages, setFilteredMessages] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [dialogOpen, setDialogOpen] = useState(false)
  const [threadOpen, setThreadOpen] = useState(false)
  const [selectedMessageId, setSelectedMessageId] = useState<string | null>(null)
  const [preselectedCategory, setPreselectedCategory] = useState<string | null>(null)
  const [filter, setFilter] = useState('all')
  const [sortBy, setSortBy] = useState('newest')

  const supabase = createClient()

  const loadMessages = async () => {
    setLoading(true)
    try {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) return

      const { data: customer } = await supabase
        .from('customers')
        .select('id')
        .eq('email', user.email)
        .single()

      if (customer) {
        // Load messages with reply count
        const { data: messagesData } = await supabase
          .from('messages')
          .select('*, message_replies(count)')
          .eq('customer_id', customer.id)
          .order('created_at', { ascending: false })

        // Transform the data to include reply_count
        const transformedMessages = messagesData?.map((msg: any) => ({
          ...msg,
          reply_count: msg.message_replies?.[0]?.count || 0,
        })) || []

        setMessages(transformedMessages)
        applyFiltersAndSort(transformedMessages, filter, sortBy)
      }
    } catch (error) {
      console.error('Error loading messages:', error)
    } finally {
      setLoading(false)
    }
  }

  const applyFiltersAndSort = (msgs: any[], filterValue: string, sortValue: string) => {
    let filtered = [...msgs]

    // Apply filter
    if (filterValue === 'active') {
      filtered = filtered.filter(m => m.status === 'open' || m.status === 'in_progress' || m.status === 'responded')
    } else if (filterValue === 'resolved') {
      filtered = filtered.filter(m => m.status === 'resolved' || m.status === 'closed')
    }

    // Apply sort
    if (sortValue === 'newest') {
      filtered.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime())
    } else if (sortValue === 'oldest') {
      filtered.sort((a, b) => new Date(a.created_at).getTime() - new Date(b.created_at).getTime())
    } else if (sortValue === 'unread') {
      filtered.sort((a, b) => {
        if (a.has_unread_replies === b.has_unread_replies) {
          return new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        }
        return a.has_unread_replies ? -1 : 1
      })
    }

    setFilteredMessages(filtered)
  }

  useEffect(() => {
    loadMessages()
    subscribeToMessages()
  }, [])

  useEffect(() => {
    applyFiltersAndSort(messages, filter, sortBy)
  }, [filter, sortBy, messages])

  const subscribeToMessages = () => {
    const channel = supabase
      .channel('messages-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'messages'
        },
        () => {
          loadMessages()
        }
      )
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'message_replies'
        },
        async (payload: any) => {
          // Only show notification for staff replies
          if (payload.new.is_staff) {
            // Load the message to get subject
            const { data: message } = await supabase
              .from('messages')
              .select('subject, id')
              .eq('id', payload.new.message_id)
              .single()

            if (message) {
              toast(
                <div className="flex items-start gap-2">
                  <MessageSquare className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="font-semibold">New reply from Dirt Free Team</p>
                    <p className="text-sm text-muted-foreground">
                      Re: {message.subject}
                    </p>
                  </div>
                </div>,
                {
                  action: {
                    label: "View",
                    onClick: () => {
                      setSelectedMessageId(message.id)
                      setThreadOpen(true)
                    }
                  },
                  duration: 6000,
                }
              )
            }
          }

          loadMessages()
        }
      )
      .subscribe()

    return () => {
      supabase.removeChannel(channel)
    }
  }

  const openCount = messages.filter(m => m.status === 'open' || m.status === 'in_progress' || m.status === 'responded').length

  const openMessageDialog = (category?: string) => {
    setPreselectedCategory(category || null)
    setDialogOpen(true)
  }

  const handleNewMessage = () => {
    openMessageDialog()
  }

  const handleSelectMessage = (messageId: string) => {
    setSelectedMessageId(messageId)
    setThreadOpen(true)
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Messages</h1>
          <p className="text-muted-foreground">
            Communicate with the Dirt Free team
          </p>
        </div>
        <Button
          onClick={handleNewMessage}
          className="transition-all hover:scale-105 hover:shadow-md min-h-[44px] min-w-[44px]"
        >
          <Plus className="mr-2 h-4 w-4" />
          New Message
        </Button>
      </div>

      {openCount > 0 && (
        <Card className="border-blue-200 bg-blue-50">
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-blue-900">
              You have {openCount} active {openCount === 1 ? 'message' : 'messages'}
            </p>
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>All Messages</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Filter & Sort Controls */}
          {messages.length > 0 && (
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
              <Tabs value={filter} onValueChange={setFilter} className="w-full sm:w-auto">
                <TabsList>
                  <TabsTrigger value="all">All Messages</TabsTrigger>
                  <TabsTrigger value="active">Active</TabsTrigger>
                  <TabsTrigger value="resolved">Resolved</TabsTrigger>
                </TabsList>
              </Tabs>

              <Select value={sortBy} onValueChange={setSortBy}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="newest">Newest First</SelectItem>
                  <SelectItem value="oldest">Oldest First</SelectItem>
                  <SelectItem value="unread">Unread First</SelectItem>
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Messages List or Empty State */}
          <div className="space-y-3">
            {loading ? (
              /* Loading Skeleton - 3 card skeletons */
              <div className="space-y-3">
                {[1, 2, 3].map((i) => (
                  <Card key={i} className="p-4">
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 space-y-3">
                        {/* Status badge and category */}
                        <div className="flex items-center gap-2">
                          <Skeleton className="h-5 w-16" />
                          <Skeleton className="h-4 w-20" />
                        </div>
                        {/* Subject */}
                        <Skeleton className="h-5 w-3/4" />
                        {/* Message preview */}
                        <div className="space-y-2">
                          <Skeleton className="h-4 w-full" />
                          <Skeleton className="h-4 w-2/3" />
                        </div>
                        {/* Metadata */}
                        <div className="flex items-center gap-4">
                          <Skeleton className="h-3 w-24" />
                          <Skeleton className="h-3 w-20" />
                        </div>
                      </div>
                      <Skeleton className="h-5 w-5 rounded-full" />
                    </div>
                  </Card>
                ))}
              </div>
            ) : filteredMessages.length > 0 ? (
              <MessageList
                messages={filteredMessages}
                onSelectMessage={handleSelectMessage}
              />
            ) : messages.length > 0 ? (
              /* Contextual Empty States for Different Filters */
              <div className="text-center py-16">
                {filter === 'active' ? (
                  <>
                    <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100">
                      <CheckCircle2 className="h-10 w-10 text-green-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">All caught up!</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      You have no active messages. All your conversations have been resolved.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setFilter('all')}
                    >
                      View All Messages
                    </Button>
                  </>
                ) : filter === 'resolved' ? (
                  <>
                    <div className="mb-4 inline-flex items-center justify-center w-20 h-20 rounded-full bg-blue-100">
                      <Inbox className="h-10 w-10 text-blue-600" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">No resolved messages</h3>
                    <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
                      You don't have any resolved or closed messages yet.
                    </p>
                    <Button
                      variant="outline"
                      onClick={() => setFilter('all')}
                    >
                      View All Messages
                    </Button>
                  </>
                ) : (
                  <>
                    <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                    <p className="text-muted-foreground">No messages match your filters</p>
                    <Button
                      variant="outline"
                      onClick={() => {
                        setFilter('all')
                        setSortBy('newest')
                      }}
                      className="mt-4"
                    >
                      Clear Filters
                    </Button>
                  </>
                )}
              </div>
            ) : (
              /* Enhanced Empty State */
              <div className="py-16">
                {/* Icon Grid with Gradient Background */}
                <div className="relative mb-8">
                  <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-purple-50 to-blue-50 rounded-3xl opacity-50 blur-3xl"></div>
                  <div className="relative grid grid-cols-2 gap-4 max-w-[200px] mx-auto">
                    <div className="p-4 rounded-xl bg-blue-100">
                      <Calendar className="h-8 w-8 text-blue-600" />
                    </div>
                    <div className="p-4 rounded-xl bg-purple-100">
                      <HelpCircle className="h-8 w-8 text-purple-600" />
                    </div>
                    <div className="p-4 rounded-xl bg-green-100">
                      <Receipt className="h-8 w-8 text-green-600" />
                    </div>
                    <div className="p-4 rounded-xl bg-yellow-100">
                      <MessageSquare className="h-8 w-8 text-yellow-600" />
                    </div>
                  </div>
                </div>

                {/* Informative Heading */}
                <h3 className="text-2xl font-bold text-center mb-3">
                  How can we help you today?
                </h3>
                <p className="text-center text-muted-foreground mb-8 max-w-md mx-auto">
                  Our team is here to assist with scheduling, billing, service questions, and more
                </p>

                {/* Common Topics Section */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 max-w-2xl mx-auto mb-6">
                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-500 hover:scale-105 active:scale-100"
                    onClick={() => openMessageDialog('schedule')}
                  >
                    <CardContent className="pt-6">
                      <Calendar className="h-8 w-8 text-blue-600 mb-3" />
                      <h3 className="font-semibold mb-1">Schedule Change</h3>
                      <p className="text-sm text-muted-foreground">
                        Reschedule or modify appointment
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-500 hover:scale-105 active:scale-100"
                    onClick={() => openMessageDialog('service')}
                  >
                    <CardContent className="pt-6">
                      <HelpCircle className="h-8 w-8 text-blue-600 mb-3" />
                      <h3 className="font-semibold mb-1">Service Question</h3>
                      <p className="text-sm text-muted-foreground">
                        Ask about our services
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-500 hover:scale-105 active:scale-100"
                    onClick={() => openMessageDialog('billing')}
                  >
                    <CardContent className="pt-6">
                      <Receipt className="h-8 w-8 text-blue-600 mb-3" />
                      <h3 className="font-semibold mb-1">Billing Inquiry</h3>
                      <p className="text-sm text-muted-foreground">
                        Questions about invoices
                      </p>
                    </CardContent>
                  </Card>

                  <Card
                    className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:border-blue-500 hover:scale-105 active:scale-100"
                    onClick={() => openMessageDialog('general')}
                  >
                    <CardContent className="pt-6">
                      <MessageSquare className="h-8 w-8 text-blue-600 mb-3" />
                      <h3 className="font-semibold mb-1">General Message</h3>
                      <p className="text-sm text-muted-foreground">
                        Send us any message
                      </p>
                    </CardContent>
                  </Card>
                </div>

                {/* Response Time Indicator */}
                <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground mb-8">
                  <Clock className="h-4 w-4" />
                  <span>We typically respond within 4 business hours</span>
                </div>

                {/* Alternative Contact Banner */}
                <Alert className="max-w-2xl mx-auto border-2 border-blue-200 bg-blue-50">
                  <Phone className="h-5 w-5 text-blue-600" />
                  <AlertTitle className="text-blue-900">Need immediate assistance?</AlertTitle>
                  <AlertDescription className="text-blue-800">
                    Call us at{' '}
                    <a
                      href="tel:7137302782"
                      className="font-semibold text-blue-600 hover:underline"
                    >
                      (713) 730-2782
                    </a>
                    {' '}for urgent matters
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <NewMessageDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        preselectedCategory={preselectedCategory}
        onSuccess={loadMessages}
      />

      <MessageThread
        open={threadOpen}
        onOpenChange={setThreadOpen}
        messageId={selectedMessageId}
        onNewMessage={handleNewMessage}
      />
    </div>
  )
}
