'use client'

import { motion } from 'framer-motion'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import {
  Circle,
  Clock,
  CheckCircle2,
  Calendar,
  MessageSquare,
  ChevronRight,
  Paperclip
} from 'lucide-react'
import { formatDate } from '@/lib/utils'

interface Message {
  id: string
  subject: string
  message: string
  category: string
  status: string
  created_at: string
  reply_count?: number
  has_unread_replies?: boolean
  attachments?: any[]
}

interface MessageListProps {
  messages: Message[]
  onSelectMessage: (messageId: string) => void
}

export function MessageList({ messages, onSelectMessage }: MessageListProps) {
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'open':
        return <Circle className="h-3 w-3 fill-blue-600 text-blue-600 mr-1" />
      case 'in_progress':
      case 'responded':
        return <Clock className="h-3 w-3 mr-1 text-yellow-600" />
      case 'resolved':
      case 'closed':
        return <CheckCircle2 className="h-3 w-3 mr-1 text-green-600" />
      default:
        return null
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

  const getCategoryColor = (category: string) => {
    const colors: Record<string, string> = {
      schedule: 'text-blue-600',
      service: 'text-purple-600',
      billing: 'text-green-600',
      feedback: 'text-yellow-600',
      general: 'text-gray-600',
    }
    return colors[category] || 'text-gray-600'
  }

  return (
    <div className="space-y-3">
      {messages.map((message, index) => (
        <motion.div
          key={message.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 0.3,
            delay: index * 0.05,
            ease: "easeOut"
          }}
        >
          <Card
            className="cursor-pointer hover:shadow-md transition-all hover:border-blue-500 hover:scale-[1.01]"
            onClick={() => onSelectMessage(message.id)}
          >
            <CardContent className="p-4">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  {/* Status Badge & Category */}
                  <div className="flex items-center gap-2 mb-2 flex-wrap">
                    <Badge variant={getStatusBadgeVariant(message.status)} className="gap-1">
                      {getStatusIcon(message.status)}
                      {getStatusLabel(message.status)}
                    </Badge>
                    <span className={`text-xs font-medium capitalize ${getCategoryColor(message.category)}`}>
                      {message.category}
                    </span>
                  </div>

                  {/* Subject & Preview */}
                  <h3 className="font-semibold mb-1 truncate">{message.subject}</h3>
                  <p className="text-sm text-muted-foreground line-clamp-2 mb-2">
                    {message.message}
                  </p>

                  {/* Metadata */}
                  <div className="flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {formatDate(message.created_at)}
                    </span>
                    {message.reply_count !== undefined && message.reply_count > 0 && (
                      <span className="flex items-center gap-1">
                        <MessageSquare className="h-3 w-3" />
                        {message.reply_count} {message.reply_count === 1 ? 'reply' : 'replies'}
                      </span>
                    )}
                    {message.attachments && message.attachments.length > 0 && (
                      <span className="flex items-center gap-1 text-blue-600">
                        <Paperclip className="h-3 w-3" />
                        {message.attachments.length} {message.attachments.length === 1 ? 'file' : 'files'}
                      </span>
                    )}
                    {message.has_unread_replies && (
                      <Badge variant="destructive" className="h-5 text-xs">
                        New Reply
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Chevron */}
                <ChevronRight className="h-5 w-5 text-muted-foreground mt-2 flex-shrink-0" />
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ))}
    </div>
  )
}
