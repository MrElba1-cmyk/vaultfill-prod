import { generateCsrfToken, csrfCookieHeader } from '../../../lib/security';

export const runtime = 'nodejs';

/**
 * GET /api/csrf-token
 * Returns a CSRF token and sets it as an httpOnly cookie.
 * Frontend should call this on load and include the token in X-CSRF-Token header.
 */
export async function GET() {
  const token = generateCsrfToken();
  return Response.json(
    { csrfToken: token },
    {
      headers: {
        'Set-Cookie': csrfCookieHeader(token),
        'Cache-Control': 'no-store',
      },
    }
  );
}
