import {
  formatCurrency,
  formatDate,
  formatDateTime,
  formatTime,
  formatPhone,
  getInitials,
  calculateLoyaltyReward,
  cn,
} from '@/lib/utils'

describe('Utility Functions', () => {
  describe('formatCurrency', () => {
    it('formats number as USD currency', () => {
      expect(formatCurrency(100)).toBe('$100.00')
      expect(formatCurrency(1234.56)).toBe('$1,234.56')
    })

    it('handles zero amount', () => {
      expect(formatCurrency(0)).toBe('$0.00')
    })

    it('handles decimal amounts', () => {
      expect(formatCurrency(99.99)).toBe('$99.99')
      expect(formatCurrency(0.5)).toBe('$0.50')
    })

    it('handles large amounts with commas', () => {
      expect(formatCurrency(1000000)).toBe('$1,000,000.00')
      expect(formatCurrency(12345.67)).toBe('$12,345.67')
    })

    it('handles negative amounts', () => {
      expect(formatCurrency(-50)).toBe('-$50.00')
    })
  })

  describe('formatDate', () => {
    it('formats date correctly from Date object', () => {
      const date = new Date('2025-03-15T12:00:00')
      const formatted = formatDate(date)
      expect(formatted).toContain('Mar')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2025')
    })

    it('formats date correctly from string', () => {
      // Use explicit time to avoid timezone issues
      const formatted = formatDate('2025-03-15T12:00:00')
      expect(formatted).toContain('Mar')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2025')
    })

    it('handles different months', () => {
      expect(formatDate('2025-01-15T12:00:00')).toContain('Jan')
      expect(formatDate('2025-12-15T12:00:00')).toContain('Dec')
    })
  })

  describe('formatDateTime', () => {
    it('formats date and time correctly', () => {
      const dateTime = new Date('2025-03-15T14:30:00')
      const formatted = formatDateTime(dateTime)

      expect(formatted).toContain('Mar')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2025')
      // Time should be present (either 2:30 PM or 14:30 depending on locale)
      expect(formatted).toMatch(/\d{1,2}:\d{2}/)
    })

    it('formats from string', () => {
      const formatted = formatDateTime('2025-03-15T09:00:00')
      expect(formatted).toContain('Mar')
      expect(formatted).toContain('15')
      expect(formatted).toContain('2025')
    })
  })

  describe('formatTime', () => {
    it('formats 24h time to 12h with AM/PM', () => {
      expect(formatTime('09:00:00')).toBe('9:00 AM')
      expect(formatTime('14:30:00')).toBe('2:30 PM')
      expect(formatTime('00:00:00')).toBe('12:00 AM')
    })

    it('handles noon correctly', () => {
      expect(formatTime('12:00:00')).toBe('12:00 PM')
      expect(formatTime('12:30:00')).toBe('12:30 PM')
    })

    it('handles midnight correctly', () => {
      expect(formatTime('00:00:00')).toBe('12:00 AM')
      expect(formatTime('00:30:00')).toBe('12:30 AM')
    })

    it('handles morning times', () => {
      expect(formatTime('01:15:00')).toBe('1:15 AM')
      expect(formatTime('11:45:00')).toBe('11:45 AM')
    })

    it('handles afternoon/evening times', () => {
      expect(formatTime('13:00:00')).toBe('1:00 PM')
      expect(formatTime('23:59:00')).toBe('11:59 PM')
    })
  })

  describe('formatPhone', () => {
    it('formats phone number correctly', () => {
      expect(formatPhone('7137302782')).toBe('(713) 730-2782')
    })

    it('formats 10-digit phone numbers', () => {
      expect(formatPhone('5551234567')).toBe('(555) 123-4567')
      expect(formatPhone('8005551234')).toBe('(800) 555-1234')
    })

    it('strips non-numeric characters before formatting', () => {
      expect(formatPhone('(713) 730-2782')).toBe('(713) 730-2782')
      expect(formatPhone('713-730-2782')).toBe('(713) 730-2782')
      expect(formatPhone('713.730.2782')).toBe('(713) 730-2782')
    })

    it('returns original string if not valid 10-digit number', () => {
      expect(formatPhone('123')).toBe('123')
      expect(formatPhone('12345678901')).toBe('12345678901')
      expect(formatPhone('')).toBe('')
    })
  })

  describe('getInitials', () => {
    it('returns initials from first and last name', () => {
      expect(getInitials('John', 'Doe')).toBe('JD')
      expect(getInitials('Jane', 'Smith')).toBe('JS')
    })

    it('converts to uppercase', () => {
      expect(getInitials('john', 'doe')).toBe('JD')
      expect(getInitials('JANE', 'SMITH')).toBe('JS')
    })

    it('handles single character names', () => {
      expect(getInitials('A', 'B')).toBe('AB')
    })

    it('takes only first character of each name', () => {
      expect(getInitials('Alexander', 'Montgomery')).toBe('AM')
    })
  })

  describe('calculateLoyaltyReward', () => {
    it('calculates reward at $10 per 100 points', () => {
      expect(calculateLoyaltyReward(100)).toBe(10)
      expect(calculateLoyaltyReward(200)).toBe(20)
      expect(calculateLoyaltyReward(500)).toBe(50)
    })

    it('floors partial rewards', () => {
      expect(calculateLoyaltyReward(150)).toBe(10)
      expect(calculateLoyaltyReward(199)).toBe(10)
      expect(calculateLoyaltyReward(99)).toBe(0)
    })

    it('handles zero points', () => {
      expect(calculateLoyaltyReward(0)).toBe(0)
    })

    it('handles large point values', () => {
      expect(calculateLoyaltyReward(1000)).toBe(100)
      expect(calculateLoyaltyReward(2500)).toBe(250)
    })
  })

  describe('cn (className merger)', () => {
    it('merges class names', () => {
      const result = cn('class1', 'class2')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })

    it('handles conditional classes', () => {
      const result = cn('base', false && 'hidden', true && 'visible')
      expect(result).toContain('base')
      expect(result).toContain('visible')
      expect(result).not.toContain('hidden')
    })

    it('merges Tailwind classes correctly', () => {
      // twMerge should handle conflicting Tailwind classes
      const result = cn('px-2 py-1', 'px-4')
      expect(result).toContain('px-4')
      expect(result).toContain('py-1')
    })

    it('handles empty input', () => {
      expect(cn()).toBe('')
    })

    it('handles undefined and null', () => {
      const result = cn('base', undefined, null, 'end')
      expect(result).toContain('base')
      expect(result).toContain('end')
    })
  })
})
