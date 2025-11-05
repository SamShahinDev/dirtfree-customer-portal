// Test fixtures for invoice data

export const mockInvoice = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  customer_id: 'cust-123',
  total_cents: 25000, // $250.00
  status: 'sent',
  created_at: '2024-01-01T00:00:00.000Z',
  due_date: '2024-01-15T00:00:00.000Z',
  paid_date: null,
}

export const mockPaidInvoice = {
  ...mockInvoice,
  id: '550e8400-e29b-41d4-a716-446655440001',
  status: 'paid',
  paid_date: '2024-01-10T00:00:00.000Z',
}

export const mockOverdueInvoice = {
  ...mockInvoice,
  id: '550e8400-e29b-41d4-a716-446655440002',
  status: 'overdue',
  due_date: '2023-12-15T00:00:00.000Z',
}

export const mockCustomer = {
  id: 'cust-123',
  email: 'test@example.com',
  first_name: 'John',
  last_name: 'Doe',
  name: 'John Doe',
  phone: '555-0123',
  address_line1: '123 Main St',
  address_line2: 'Apt 4B',
  city: 'Houston',
  state: 'TX',
  postal_code: '77001',
}

export const mockLoyaltyPoints = {
  customer_id: 'cust-123',
  points: 1000,
  total_earned: 5000,
  tier: 'silver',
  created_at: '2024-01-01T00:00:00.000Z',
  updated_at: '2024-01-01T00:00:00.000Z',
}
