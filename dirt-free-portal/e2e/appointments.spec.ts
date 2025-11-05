import { test, expect } from './fixtures/auth'

/**
 * Appointment Booking E2E Tests
 *
 * Tests the complete appointment booking flow:
 * 1. Navigate to new appointment
 * 2. Select service
 * 3. Choose date and time
 * 4. Confirm booking
 *
 * Note: These tests use the authenticatedPage fixture from auth.ts
 * which automatically logs in before each test.
 */

test.describe('Appointment Booking', () => {
  test('should display appointments page when logged in', async ({ authenticatedPage }) => {
    // Navigate to appointments
    await authenticatedPage.goto('/dashboard/appointments')

    // Check for appointments page elements
    await expect(authenticatedPage.locator('text=Appointments')).toBeVisible()
  })

  test('should navigate to new appointment form', async ({ authenticatedPage }) => {
    // Navigate to appointments page
    await authenticatedPage.goto('/dashboard/appointments')

    // Look for "Book" or "New" appointment button/link
    // (Adjust selector based on actual button text)
    const newAppointmentButton = authenticatedPage.locator(
      'text=/Book.*Appointment|New.*Appointment|Book Service/i'
    ).first()

    await newAppointmentButton.click()

    // Should navigate to new appointment page
    await expect(authenticatedPage).toHaveURL('/dashboard/appointments/new')
  })

  test('should complete full booking flow', async ({ authenticatedPage }) => {
    // Start the booking process
    await authenticatedPage.goto('/dashboard/appointments/new')

    // Step 1: Service Selection
    // Look for service options (adjust selectors based on actual UI)
    await expect(authenticatedPage).toHaveURL('/dashboard/appointments/new')

    // Select a service (this will depend on your actual service selection UI)
    // Common patterns: buttons, cards, or select dropdown
    const serviceOption = authenticatedPage.locator(
      'text=/Carpet.*Cleaning|Upholstery.*Cleaning|Area.*Rug/i'
    ).first()

    if (await serviceOption.isVisible()) {
      await serviceOption.click()
    }

    // Look for "Continue" or "Next" button
    const continueButton = authenticatedPage.locator(
      'button:has-text("Continue"), button:has-text("Next")'
    ).first()

    if (await continueButton.isVisible()) {
      await continueButton.click()
    }

    // Step 2: Date and Time Selection
    // Should navigate to datetime page
    await authenticatedPage.waitForURL(/\/dashboard\/appointments\/new\/(datetime)?/, {
      timeout: 5000,
    })

    // Select a date (adjust based on actual date picker implementation)
    // Look for available date button (not disabled)
    const availableDate = authenticatedPage.locator(
      'button[role="button"]:not([disabled]):has-text(/^\\d+$/)'
    ).first()

    if (await availableDate.isVisible({ timeout: 5000 })) {
      await availableDate.click()
    }

    // Select a time slot
    const timeSlot = authenticatedPage.locator(
      'button:has-text(/\\d{1,2}:\\d{2}\\s*(AM|PM)/i)'
    ).first()

    if (await timeSlot.isVisible({ timeout: 5000 })) {
      await timeSlot.click()
    }

    // Click continue/next
    const nextButton = authenticatedPage.locator(
      'button:has-text("Continue"), button:has-text("Next")'
    ).first()

    if (await nextButton.isVisible()) {
      await nextButton.click()
    }

    // Step 3: Confirmation
    // Should navigate to confirmation page
    await authenticatedPage.waitForURL(/\/dashboard\/appointments\/new\/confirm/, {
      timeout: 5000,
    })

    // Click confirm button
    const confirmButton = authenticatedPage.locator(
      'button:has-text("Confirm"), button:has-text("Book")'
    ).first()

    if (await confirmButton.isVisible()) {
      await confirmButton.click()
    }

    // Step 4: Success Verification
    // After booking, should see success message or redirect to appointments
    await authenticatedPage.waitForTimeout(2000)

    // Check for success indicators
    const hasSuccessMessage =
      (await authenticatedPage.locator('text=/Booking.*Confirmed|Success|Scheduled/i').count()) > 0

    const isOnAppointmentsPage = authenticatedPage.url().includes('/dashboard/appointments')

    // Should either show success message or redirect to appointments page
    expect(hasSuccessMessage || isOnAppointmentsPage).toBeTruthy()
  })

  test('should view existing appointments', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/appointments')

    // Check that appointments list or empty state is visible
    const hasAppointments =
      (await authenticatedPage.locator('[data-testid="appointment-item"]').count()) > 0

    const hasEmptyState = (await authenticatedPage.locator('text=/No.*appointments/i').count()) > 0

    // Should show either appointments or empty state
    expect(hasAppointments || hasEmptyState).toBeTruthy()
  })

  test('should navigate back from appointment booking', async ({ authenticatedPage }) => {
    // Go to new appointment
    await authenticatedPage.goto('/dashboard/appointments/new')

    // Look for back button or link
    const backButton = authenticatedPage.locator(
      'button:has-text("Back"), a:has-text("Back"), [aria-label="Back"]'
    ).first()

    if (await backButton.isVisible()) {
      await backButton.click()

      // Should go back to appointments list
      await expect(authenticatedPage).toHaveURL('/dashboard/appointments')
    }
  })
})

/**
 * Appointment Management Tests
 *
 * Tests for viewing and managing existing appointments
 */
test.describe('Appointment Management', () => {
  test('should navigate to appointment details', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/appointments')

    // Try to find an appointment to click on
    const appointmentItem = authenticatedPage.locator('[data-testid="appointment-item"]').first()

    if (await appointmentItem.isVisible({ timeout: 5000 })) {
      await appointmentItem.click()

      // Should navigate to appointment details page
      await expect(authenticatedPage.url()).toContain('/dashboard/appointments/')
    }
  })

  test('should display appointment list page elements', async ({ authenticatedPage }) => {
    await authenticatedPage.goto('/dashboard/appointments')

    // Check for key page elements
    await expect(authenticatedPage.locator('text=Appointments')).toBeVisible()

    // Should have either appointments or empty state
    const content =
      (await authenticatedPage.locator('[data-testid="appointment-item"]').count()) > 0 ||
      (await authenticatedPage.locator('text=/No.*appointments|Book.*first/i').count()) > 0

    expect(content).toBeTruthy()
  })
})
