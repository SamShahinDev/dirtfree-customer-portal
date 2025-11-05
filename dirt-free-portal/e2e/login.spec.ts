import { test, expect } from '@playwright/test'

/**
 * Login Flow E2E Tests
 *
 * Tests the authentication flow including:
 * - Successful login
 * - Invalid credentials handling
 * - UI elements and navigation
 */

test.describe('Login Flow', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/login')
  })

  test('should display login page with all elements', async ({ page }) => {
    // Check page title and branding
    await expect(page.locator('text=Customer Portal')).toBeVisible()
    await expect(page.locator('text=DF')).toBeVisible()

    // Check form elements
    await expect(page.locator('input#email')).toBeVisible()
    await expect(page.locator('input#password')).toBeVisible()
    await expect(page.locator('button[type="submit"]')).toBeVisible()

    // Check forgot password link
    await expect(page.locator('a[href="/forgot-password"]')).toBeVisible()
  })

  test('should login successfully with valid credentials', async ({ page }) => {
    // Use test credentials (should be set in environment variables)
    const email = process.env.TEST_USER_EMAIL || 'test@example.com'
    const password = process.env.TEST_USER_PASSWORD || 'password123'

    // Fill in login form
    await page.fill('input#email', email)
    await page.fill('input#password', password)

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for navigation to dashboard
    await page.waitForURL('/dashboard', { timeout: 10000 })

    // Verify we're on the dashboard
    await expect(page).toHaveURL('/dashboard')

    // Check for dashboard elements (adjust based on actual dashboard content)
    await expect(page.locator('text=Dashboard')).toBeVisible()
  })

  test('should show error for invalid credentials', async ({ page }) => {
    // Try to login with invalid credentials
    await page.fill('input#email', 'wrong@example.com')
    await page.fill('input#password', 'wrongpassword')

    // Submit the form
    await page.click('button[type="submit"]')

    // Wait for toast notification to appear
    // The app uses Sonner for toast notifications
    await page.waitForSelector('[data-sonner-toast]', { timeout: 5000 })

    // Verify error message is displayed
    const toast = page.locator('[data-sonner-toast]')
    await expect(toast).toBeVisible()

    // Should still be on login page
    await expect(page).toHaveURL('/login')
  })

  test('should show loading state while submitting', async ({ page }) => {
    await page.fill('input#email', 'test@example.com')
    await page.fill('input#password', 'password123')

    // Check that button shows loading state when clicked
    const submitButton = page.locator('button[type="submit"]')

    // Click and immediately check for loading state
    await submitButton.click()

    // The button should show "Signing in..." text
    await expect(submitButton).toContainText('Signing in')
  })

  test('should validate email format', async ({ page }) => {
    // Try to submit with invalid email format
    await page.fill('input#email', 'not-an-email')
    await page.fill('input#password', 'password123')

    // Try to submit
    await page.click('button[type="submit"]')

    // Browser should show HTML5 validation error
    const emailInput = page.locator('input#email')
    const validationMessage = await emailInput.evaluate(
      (el: HTMLInputElement) => el.validationMessage
    )

    expect(validationMessage).toBeTruthy()
  })

  test('should require both email and password', async ({ page }) => {
    // Try to submit without filling fields
    const submitButton = page.locator('button[type="submit"]')
    await submitButton.click()

    // Should not navigate away from login page
    await expect(page).toHaveURL('/login')
  })

  test('should navigate to forgot password page', async ({ page }) => {
    // Click forgot password link
    await page.click('a[href="/forgot-password"]')

    // Should navigate to forgot password page
    await expect(page).toHaveURL('/forgot-password')
  })

  test('should disable form inputs while loading', async ({ page }) => {
    await page.fill('input#email', 'test@example.com')
    await page.fill('input#password', 'password123')

    // Click submit
    await page.click('button[type="submit"]')

    // Inputs should be disabled during submission
    const emailInput = page.locator('input#email')
    const passwordInput = page.locator('input#password')
    const submitButton = page.locator('button[type="submit"]')

    await expect(emailInput).toBeDisabled()
    await expect(passwordInput).toBeDisabled()
    await expect(submitButton).toBeDisabled()
  })
})
