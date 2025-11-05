'use client'

import { useRouter } from 'next/navigation'
import { MessageSquare } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { MobileNav } from './mobile-nav'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'
import { NotificationBell } from '@/components/notifications/NotificationBell'

interface HeaderProps {
  customerName?: string
  customerId?: string
}

export function Header({ customerName = 'Customer', customerId }: HeaderProps) {
  const initials = customerName.split(' ').map(n => n[0]).join('').toUpperCase()
  const { hasNewReplies } = useUnreadMessages()
  const router = useRouter()

  return (
    <header className="h-16 border-b bg-white">
      <div className="flex h-full items-center justify-between px-6">
        <MobileNav />

        <div className="hidden lg:block">
          {/* Breadcrumb or title */}
        </div>

        <div className="flex items-center gap-2">
          {/* Notification Bell */}
          {customerId && <NotificationBell customerId={customerId} />}

          {/* Messages Button */}
          <Button
            variant="ghost"
            size="icon"
            className="relative transition-all hover:scale-110 hover:bg-blue-50 min-h-[44px] min-w-[44px]"
            onClick={() => router.push('/dashboard/messages')}
          >
            <MessageSquare className={`h-5 w-5 ${hasNewReplies ? 'animate-bounce' : ''}`} />
            {hasNewReplies && (
              <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full animate-pulse" />
            )}
          </Button>

          <div className="flex items-center gap-3 ml-2">
            <div className="hidden md:block text-right text-sm">
              <p className="font-medium">{customerName}</p>
            </div>
            <Avatar>
              <AvatarFallback className="bg-primary text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
          </div>
        </div>
      </div>
    </header>
  )
}
