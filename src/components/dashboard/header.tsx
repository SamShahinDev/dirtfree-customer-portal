'use client'

import { Bell, Menu } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

interface HeaderProps {
  customerName?: string
  onMenuClick?: () => void
}

export function Header({ customerName = 'Customer', onMenuClick }: HeaderProps) {
  const initials = customerName.split(' ').map(n => n[0]).join('').toUpperCase()

  return (
    <header className="h-16 border-b bg-white">
      <div className="flex h-full items-center justify-between px-6">
        <Button
          variant="ghost"
          size="icon"
          className="lg:hidden"
          onClick={onMenuClick}
        >
          <Menu className="h-6 w-6" />
        </Button>

        <div className="hidden lg:block">
          {/* Breadcrumb or title */}
        </div>

        <div className="flex items-center gap-4">
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1 right-1 h-2 w-2 bg-red-500 rounded-full" />
          </Button>

          <div className="flex items-center gap-3">
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
