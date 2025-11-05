import { test as base, Page } from '@playwright/test'

/**
 * Authentication Helper Fixture
 *
 * Provides reusable authentication functions for E2E tests.
 * Use this to avoid duplicating login logic across test files.
 */

type AuthFixtures = {
  authenticatedPage: Page
}

/**
 * Login helper function
 * Performs login with the provided credentials
 */
export async function login(page: Page, email: string, password: string) {
  await page.goto('/login')

  // Fill in login form
  await page.fill('input#email', email)
  await page.fill('input#password', password)

  // Submit the form
  await page.click('button[type="submit"]')

  // Wait for navigation to dashboard
  await page.waitForURL('/dashboard', { timeout: 10000 })
}

/**
 * Extended test with authenticated page fixture
 * Use this in tests that require authentication
 *
 * Example:
 * test('some authenticated test', async ({ authenticatedPage }) => {
 *   await authenticatedPage.goto('/dashboard/appointments')
 *   // test logic...
 * })
 */
export const test = base.extend<AuthFixtures>({
  authenticatedPage: async ({ page }, use) => {
    // Get test credentials from environment variables
    const email = process.env.TEST_USER_EMAIL || 'test@example.com'
    const password = process.env.TEST_USER_PASSWORD || 'password123'

    // Perform login
    await login(page, email, password)

    // Provide the authenticated page to the test
    await use(page)
  },
})

export { expect } from '@playwright/test'
