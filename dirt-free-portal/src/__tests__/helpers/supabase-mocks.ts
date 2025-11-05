// Mock utilities for Supabase client
import { mockCustomer, mockInvoice, mockLoyaltyPoints } from '../fixtures/invoices'

// Type for the mock Supabase client query builder
type MockQueryBuilder = {
  select: jest.Mock
  eq: jest.Mock
  single: jest.Mock
  update: jest.Mock
  insert: jest.Mock
  from: jest.Mock
}

// Create a chainable mock query builder
export const createMockQueryBuilder = (data: any = null, error: any = null): any => {
  const builder: any = {
    select: jest.fn().mockReturnThis(),
    eq: jest.fn().mockReturnThis(),
    single: jest.fn().mockResolvedValue({ data, error }),
    update: jest.fn().mockReturnThis(),
    insert: jest.fn().mockResolvedValue({ data, error }),
  }
  return builder
}

// Mock Supabase client
export const createMockSupabaseClient = (config?: {
  user?: any
  customer?: any
  invoice?: any
  loyaltyPoints?: any
}) => {
  const mockUser = config?.user || { id: 'user-123', email: 'test@example.com' }
  const mockCustomerData = config?.customer || mockCustomer
  const mockInvoiceData = config?.invoice || mockInvoice
  const mockLoyaltyData = config?.loyaltyPoints || mockLoyaltyPoints

  const mockAuth = {
    getUser: jest.fn().mockResolvedValue({
      data: { user: mockUser },
      error: null
    }),
  }

  const mockFrom = jest.fn((table: string) => {
    switch (table) {
      case 'customers':
        return createMockQueryBuilder(mockCustomerData)
      case 'invoices':
        return createMockQueryBuilder(mockInvoiceData)
      case 'loyalty_points':
        return createMockQueryBuilder(mockLoyaltyData)
      case 'loyalty_transactions':
        return createMockQueryBuilder({ id: 'trans-123' })
      default:
        return createMockQueryBuilder(null)
    }
  })

  return {
    auth: mockAuth,
    from: mockFrom,
  }
}

// Mock unauthorized user (not logged in)
export const createUnauthorizedSupabaseClient = () => {
  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: null },
        error: new Error('Not authenticated')
      }),
    },
    from: jest.fn(),
  }
}

// Mock Supabase client with no customer found
export const createMockSupabaseClientNoCustomer = () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null
      }),
    },
    from: jest.fn((table: string) => {
      if (table === 'customers') {
        return createMockQueryBuilder(null) // No customer found
      }
      return createMockQueryBuilder(null)
    }),
  }
}

// Mock Supabase client with no invoice found
export const createMockSupabaseClientNoInvoice = () => {
  const mockUser = { id: 'user-123', email: 'test@example.com' }

  return {
    auth: {
      getUser: jest.fn().mockResolvedValue({
        data: { user: mockUser },
        error: null
      }),
    },
    from: jest.fn((table: string) => {
      if (table === 'customers') {
        return createMockQueryBuilder(mockCustomer)
      }
      if (table === 'invoices') {
        return createMockQueryBuilder(null) // No invoice found
      }
      return createMockQueryBuilder(null)
    }),
  }
}

// Mock the createClient function from @/lib/supabase/server
export const mockCreateClient = (client: any) => {
  jest.mock('@/lib/supabase/server', () => ({
    createClient: jest.fn().mockResolvedValue(client),
  }))
}
