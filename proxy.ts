import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes: only landing + auth pages.
const isPublicRoute = createRouteMatcher(['/', '/sign-in(.*)', '/sign-up(.*)']);

// ── Rate limiting for /api/chat: 20 req/min per IP ──
const chatRateLimit = new Map<string, { count: number; resetTime: number }>();
const CHAT_RATE_LIMIT_WINDOW = 60_000;
const CHAT_RATE_LIMIT_MAX = 20;

function checkChatRateLimit(ip: string): boolean {
  const now = Date.now();
  const entry = chatRateLimit.get(ip);
  if (!entry || now > entry.resetTime) {
    chatRateLimit.set(ip, { count: 1, resetTime: now + CHAT_RATE_LIMIT_WINDOW });
    return true;
  }
  entry.count++;
  return entry.count <= CHAT_RATE_LIMIT_MAX;
}

const clerk = clerkMiddleware(async (auth, req) => {
  // Auth gateway: only '/', '/sign-in', '/sign-up' are public.
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Rate limit /api/chat
  if (req.nextUrl.pathname === '/api/chat' && req.method === 'POST') {
    const ip =
      req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
      req.headers.get('x-real-ip') ||
      'unknown';

    if (!checkChatRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 20 requests per minute.' },
        { status: 429, headers: { 'Retry-After': '60' } },
      );
    }
  }

  const response = NextResponse.next();

  // ── Security headers ──
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Strict-Transport-Security', 'max-age=63072000; includeSubDomains; preload');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=(), interest-cohort=()');
  response.headers.set('X-DNS-Prefetch-Control', 'on');

  response.headers.set(
    'Content-Security-Policy',
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'",
      "style-src 'self' 'unsafe-inline'",
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      // Clerk front-end calls + any other APIs are same-origin
      "connect-src 'self' https://*.clerk.com https://*.clerk.accounts",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      'upgrade-insecure-requests',
    ].join('; '),
  );

  response.headers.delete('X-Powered-By');
  return response;
});

// Next 16+ proxy entrypoint
export function proxy(request: NextRequest) {
  return clerk(request as any, {} as any);
}

export const config = {
  matcher: ['/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml|.*\\.(?:png|jpg|jpeg|gif|webp|svg|ico)$).*)'],
};
