import { render, screen, fireEvent, waitFor } from '@testing-library/react'
import { Sidebar } from '@/components/dashboard/sidebar'

// Mock next/navigation
const mockPush = jest.fn()
const mockPathname = jest.fn()

jest.mock('next/navigation', () => ({
  usePathname: () => mockPathname(),
  useRouter: () => ({
    push: mockPush,
  }),
}))

// Mock Supabase client
const mockSignOut = jest.fn()

jest.mock('@/lib/supabase/client', () => ({
  createClient: () => ({
    auth: {
      signOut: mockSignOut,
    },
  }),
}))

// Mock sonner toast
jest.mock('sonner', () => ({
  toast: {
    success: jest.fn(),
  },
}))

// Mock useUnreadMessages hook
const mockUseUnreadMessages = jest.fn()

jest.mock('@/hooks/useUnreadMessages', () => ({
  useUnreadMessages: () => mockUseUnreadMessages(),
}))

describe('Sidebar', () => {
  beforeEach(() => {
    jest.clearAllMocks()
    mockPathname.mockReturnValue('/dashboard')
    mockUseUnreadMessages.mockReturnValue({
      unreadCount: 0,
      hasNewReplies: false,
      refreshUnreadCount: jest.fn(),
      markAllAsRead: jest.fn(),
    })
  })

  describe('Navigation Items', () => {
    it('renders all navigation items', () => {
      render(<Sidebar />)

      expect(screen.getByText('Dashboard')).toBeInTheDocument()
      expect(screen.getByText('Appointments')).toBeInTheDocument()
      expect(screen.getByText('Invoices')).toBeInTheDocument()
      expect(screen.getByText('Account')).toBeInTheDocument()
      expect(screen.getByText('Loyalty Rewards')).toBeInTheDocument()
      expect(screen.getByText('Messages')).toBeInTheDocument()
      expect(screen.getByText('Documents')).toBeInTheDocument()
    })

    it('renders navigation items with correct hrefs', () => {
      render(<Sidebar />)

      const dashboardLink = screen.getByText('Dashboard').closest('a')
      const appointmentsLink = screen.getByText('Appointments').closest('a')
      const invoicesLink = screen.getByText('Invoices').closest('a')
      const rewardsLink = screen.getByText('Loyalty Rewards').closest('a')

      expect(dashboardLink).toHaveAttribute('href', '/dashboard')
      expect(appointmentsLink).toHaveAttribute('href', '/dashboard/appointments')
      expect(invoicesLink).toHaveAttribute('href', '/dashboard/invoices')
      expect(rewardsLink).toHaveAttribute('href', '/dashboard/rewards')
    })
  })

  describe('Active Route Highlighting', () => {
    it('highlights active route with bg-primary class', () => {
      mockPathname.mockReturnValue('/dashboard')
      render(<Sidebar />)

      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('bg-primary')
    })

    it('highlights appointments route when active', () => {
      mockPathname.mockReturnValue('/dashboard/appointments')
      render(<Sidebar />)

      const appointmentsLink = screen.getByText('Appointments').closest('a')
      expect(appointmentsLink).toHaveClass('bg-primary')
    })

    it('does not highlight inactive routes', () => {
      mockPathname.mockReturnValue('/dashboard')
      render(<Sidebar />)

      const appointmentsLink = screen.getByText('Appointments').closest('a')
      expect(appointmentsLink).not.toHaveClass('bg-primary')
      expect(appointmentsLink).toHaveClass('text-muted-foreground')
    })
  })

  describe('Unread Messages Badge', () => {
    it('does not show badge when unreadCount is 0', () => {
      mockUseUnreadMessages.mockReturnValue({
        unreadCount: 0,
        hasNewReplies: false,
        refreshUnreadCount: jest.fn(),
        markAllAsRead: jest.fn(),
      })

      render(<Sidebar />)

      const messagesLink = screen.getByText('Messages').closest('a')
      const badge = messagesLink?.querySelector('.bg-red-500')
      expect(badge).not.toBeInTheDocument()
    })

    it('shows badge when unreadCount is greater than 0', () => {
      mockUseUnreadMessages.mockReturnValue({
        unreadCount: 3,
        hasNewReplies: true,
        refreshUnreadCount: jest.fn(),
        markAllAsRead: jest.fn(),
      })

      render(<Sidebar />)

      expect(screen.getByText('3')).toBeInTheDocument()
    })

    it('shows "9+" when unreadCount is greater than 9', () => {
      mockUseUnreadMessages.mockReturnValue({
        unreadCount: 15,
        hasNewReplies: true,
        refreshUnreadCount: jest.fn(),
        markAllAsRead: jest.fn(),
      })

      render(<Sidebar />)

      expect(screen.getByText('9+')).toBeInTheDocument()
    })
  })

  describe('Logo and Branding', () => {
    it('displays company logo and name', () => {
      render(<Sidebar />)

      expect(screen.getByText('DF')).toBeInTheDocument()
      expect(screen.getByText('Dirt Free')).toBeInTheDocument()
      expect(screen.getByText('Customer Portal')).toBeInTheDocument()
    })
  })

  describe('Sign Out Functionality', () => {
    it('renders sign out button', () => {
      render(<Sidebar />)

      expect(screen.getByText('Sign Out')).toBeInTheDocument()
    })

    it('calls signOut and redirects on logout', async () => {
      mockSignOut.mockResolvedValue({})
      const { toast } = require('sonner')

      render(<Sidebar />)

      const signOutButton = screen.getByText('Sign Out')
      fireEvent.click(signOutButton)

      await waitFor(() => {
        expect(mockSignOut).toHaveBeenCalledTimes(1)
      })

      await waitFor(() => {
        expect(toast.success).toHaveBeenCalledWith('Signed out successfully')
      })

      await waitFor(() => {
        expect(mockPush).toHaveBeenCalledWith('/login')
      })
    })
  })

  describe('Accessibility', () => {
    it('has minimum touch target size for navigation items', () => {
      render(<Sidebar />)

      const dashboardLink = screen.getByText('Dashboard').closest('a')
      expect(dashboardLink).toHaveClass('min-h-[44px]')
    })

    it('has minimum touch target size for sign out button', () => {
      render(<Sidebar />)

      const signOutButton = screen.getByText('Sign Out').closest('button')
      expect(signOutButton).toHaveClass('min-h-[44px]')
    })
  })
})
