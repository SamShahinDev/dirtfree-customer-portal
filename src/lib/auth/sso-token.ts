// SSO Token Management
// Creates and verifies JWT tokens for Single Sign-On between Portal and Website

import { SignJWT, jwtVerify } from 'jose';

// ============================================================================
// Configuration
// ============================================================================

/**
 * SSO Secret Key
 * IMPORTANT: Set this in environment variables
 * Must be at least 32 characters for HS256 algorithm
 */
const SSO_SECRET = new TextEncoder().encode(
  process.env.SSO_SECRET_KEY || 'your-secret-key-must-be-at-least-32-characters-long-change-this'
);

/**
 * Token expiration time
 * Default: 1 hour
 */
const TOKEN_EXPIRATION = '1h';

// ============================================================================
// Types
// ============================================================================

export interface SSOTokenPayload {
  userId: string;
  customerId: string;
  type: 'sso';
  email?: string;
  name?: string;
}

export interface VerifiedSSOToken {
  userId: string;
  customerId: string;
  type: string;
  email?: string;
  name?: string;
  iat?: number;
  exp?: number;
}

// ============================================================================
// Token Creation
// ============================================================================

/**
 * Create an SSO token for authenticated user
 *
 * @param userId - The Supabase auth user ID
 * @param customerId - The customer ID from the customers table
 * @param metadata - Optional metadata to include in token (email, name)
 * @returns JWT token string
 *
 * @example
 * ```typescript
 * const token = await createSSOToken(user.id, customer.id, {
 *   email: customer.email,
 *   name: `${customer.first_name} ${customer.last_name}`
 * });
 * ```
 */
export async function createSSOToken(
  userId: string,
  customerId: string,
  metadata?: { email?: string; name?: string }
): Promise<string> {
  try {
    const token = await new SignJWT({
      userId,
      customerId,
      type: 'sso',
      email: metadata?.email,
      name: metadata?.name,
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setIssuedAt()
      .setExpirationTime(TOKEN_EXPIRATION)
      .setIssuer('dirt-free-portal')
      .setAudience('dirt-free-website')
      .sign(SSO_SECRET);

    return token;
  } catch (error) {
    console.error('Failed to create SSO token:', error);
    throw new Error('Failed to create SSO token');
  }
}

// ============================================================================
// Token Verification
// ============================================================================

/**
 * Verify an SSO token
 *
 * @param token - The JWT token string to verify
 * @returns Verified token payload or null if invalid
 *
 * @example
 * ```typescript
 * const payload = await verifySSOToken(token);
 * if (payload) {
 *   console.log('User ID:', payload.userId);
 *   console.log('Customer ID:', payload.customerId);
 * }
 * ```
 */
export async function verifySSOToken(token: string): Promise<VerifiedSSOToken | null> {
  try {
    const verified = await jwtVerify(token, SSO_SECRET, {
      issuer: 'dirt-free-portal',
      audience: 'dirt-free-website',
    });

    const payload = verified.payload as VerifiedSSOToken;

    // Validate required fields
    if (!payload.userId || !payload.customerId || payload.type !== 'sso') {
      console.error('Invalid SSO token payload');
      return null;
    }

    return payload;
  } catch (error) {
    // Token is invalid, expired, or tampered with
    console.error('SSO token verification failed:', error);
    return null;
  }
}

// ============================================================================
// Token Utilities
// ============================================================================

/**
 * Check if a token is expired
 *
 * @param token - The JWT token to check
 * @returns true if expired, false otherwise
 */
export async function isTokenExpired(token: string): Promise<boolean> {
  try {
    const verified = await jwtVerify(token, SSO_SECRET);
    const exp = verified.payload.exp;

    if (!exp) return true;

    const now = Math.floor(Date.now() / 1000);
    return exp < now;
  } catch (error) {
    // If verification fails, consider token expired
    return true;
  }
}

/**
 * Get token expiration time
 *
 * @param token - The JWT token
 * @returns Expiration timestamp or null
 */
export async function getTokenExpiration(token: string): Promise<number | null> {
  try {
    const verified = await jwtVerify(token, SSO_SECRET);
    return verified.payload.exp || null;
  } catch (error) {
    return null;
  }
}

// ============================================================================
// Security Notes
// ============================================================================

/**
 * SECURITY BEST PRACTICES:
 *
 * 1. SECRET KEY:
 *    - Set SSO_SECRET_KEY in environment variables
 *    - Use a strong, random key (at least 32 characters)
 *    - Never commit the secret to version control
 *    - Rotate the secret periodically
 *
 * 2. TOKEN EXPIRATION:
 *    - Default 1 hour is recommended for SSO tokens
 *    - Shorter expiration = more secure but less convenient
 *    - Longer expiration = more convenient but less secure
 *
 * 3. HTTPS ONLY:
 *    - Always use HTTPS in production
 *    - Tokens transmitted over HTTP can be intercepted
 *
 * 4. TOKEN STORAGE:
 *    - Store tokens in httpOnly cookies when possible
 *    - If using localStorage, be aware of XSS risks
 *    - Clear tokens on logout
 *
 * 5. VALIDATION:
 *    - Always verify token before trusting the data
 *    - Check token type, issuer, and audience
 *    - Validate userId and customerId exist in database
 *
 * 6. RATE LIMITING:
 *    - Implement rate limiting on SSO endpoints
 *    - Prevent token generation/verification abuse
 */
