'use client'

import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'
import {
  Home,
  Calendar,
  Receipt,
  User,
  Gift,
  MessageSquare,
  FileText,
  HelpCircle,
  LogOut,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { createClient } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { useUnreadMessages } from '@/hooks/useUnreadMessages'

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: Home },
  { name: 'Appointments', href: '/dashboard/appointments', icon: Calendar },
  { name: 'Invoices', href: '/dashboard/invoices', icon: Receipt },
  { name: 'Account', href: '/dashboard/account', icon: User },
  { name: 'Loyalty Rewards', href: '/dashboard/rewards', icon: Gift },
  { name: 'Messages', href: '/dashboard/messages', icon: MessageSquare },
  { name: 'Documents', href: '/dashboard/documents', icon: FileText },
  { name: 'Help', href: '/dashboard/help', icon: HelpCircle },
]

export function Sidebar() {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const { unreadCount } = useUnreadMessages()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    toast.success('Signed out successfully')
    router.push('/login')
  }

  return (
    <div className="flex h-full w-64 flex-col bg-white border-r">
      {/* Logo */}
      <div className="flex h-16 items-center px-6 border-b">
        <div className="flex items-center space-x-2">
          <div className="w-10 h-10 bg-primary rounded-full flex items-center justify-center">
            <span className="text-lg font-bold text-white">DF</span>
          </div>
          <div>
            <h2 className="text-sm font-semibold">Dirt Free</h2>
            <p className="text-xs text-muted-foreground">Customer Portal</p>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 space-y-1 px-3 py-4">
        {navigation.map((item) => {
          const isActive = pathname === item.href
          const isMessages = item.href === '/dashboard/messages'

          return (
            <Link
              key={item.name}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 relative min-h-[44px]',
                isActive
                  ? 'bg-primary text-primary-foreground shadow-md'
                  : 'text-muted-foreground hover:bg-muted hover:text-foreground hover:scale-105 hover:shadow-sm'
              )}
            >
              <item.icon className="h-5 w-5" />
              <span>{item.name}</span>
              {isMessages && unreadCount > 0 && (
                <Badge className="ml-auto h-5 min-w-5 flex items-center justify-center px-1.5 bg-red-500 hover:bg-red-500 text-xs">
                  {unreadCount > 9 ? '9+' : unreadCount}
                </Badge>
              )}
            </Link>
          )
        })}
      </nav>

      {/* User Section */}
      <div className="p-4 border-t">
        <Button
          variant="ghost"
          className="w-full justify-start transition-all hover:scale-105 hover:shadow-sm min-h-[44px]"
          onClick={handleLogout}
        >
          <LogOut className="mr-2 h-5 w-5" />
          Sign Out
        </Button>
      </div>
    </div>
  )
}
