/**
 * CSRF Protection - Double Submit Cookie Pattern
 * 
 * Compatible with Next.js App Router (no session needed).
 * Token is set as an httpOnly cookie and must be sent back via X-CSRF-Token header.
 */
import { randomBytes } from 'crypto';

const CSRF_COOKIE = 'vf-csrf-token';
const CSRF_HEADER = 'x-csrf-token';
const TOKEN_LENGTH = 32;

export function generateCsrfToken(): string {
  return randomBytes(TOKEN_LENGTH).toString('hex');
}

/**
 * Validate CSRF token from request.
 * Compares cookie value with header value (double-submit pattern).
 */
export function validateCsrf(req: Request): { valid: boolean; token?: string } {
  const cookieHeader = req.headers.get('cookie') || '';
  const cookies = Object.fromEntries(
    cookieHeader.split(';').map((c) => {
      const [k, ...v] = c.trim().split('=');
      return [k, v.join('=')];
    })
  );

  const cookieToken = cookies[CSRF_COOKIE];
  const headerToken = req.headers.get(CSRF_HEADER);

  // If no cookie token exists, generate one (first request)
  if (!cookieToken) {
    const newToken = generateCsrfToken();
    return { valid: false, token: newToken };
  }

  // Both must match
  if (!headerToken || cookieToken !== headerToken) {
    return { valid: false };
  }

  return { valid: true };
}

/**
 * Create Set-Cookie header for CSRF token.
 */
export function csrfCookieHeader(token: string): string {
  return `${CSRF_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Secure; Max-Age=86400`;
}

/**
 * CSRF middleware for API routes. Returns a Response if validation fails, or null if OK.
 * For GET/HEAD/OPTIONS requests, it sets/refreshes the cookie.
 */
export function csrfGuard(req: Request): { error: Response | null; setCookie?: string } {
  const method = req.method.toUpperCase();
  const safeMethods = ['GET', 'HEAD', 'OPTIONS'];

  if (safeMethods.includes(method)) {
    // For safe methods, ensure a CSRF cookie is set
    const cookieHeader = req.headers.get('cookie') || '';
    const hasCookie = cookieHeader.includes(CSRF_COOKIE);
    if (!hasCookie) {
      const token = generateCsrfToken();
      return { error: null, setCookie: csrfCookieHeader(token) };
    }
    return { error: null };
  }

  // Mutating methods require CSRF validation
  const { valid, token } = validateCsrf(req);

  if (!valid) {
    // If token is returned, it means no cookie was set yet - set it and reject
    if (token) {
      return {
        error: Response.json(
          { error: 'CSRF token missing. Refresh the page and try again.' },
          { status: 403, headers: { 'Set-Cookie': csrfCookieHeader(token) } }
        ),
      };
    }
    return {
      error: Response.json(
        { error: 'CSRF validation failed.' },
        { status: 403 }
      ),
    };
  }

  return { error: null };
}
