import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { clerkMiddleware, createRouteMatcher } from '@clerk/nextjs/server';

// Public routes: landing, auth, and static marketing pages.
const isPublicRoute = createRouteMatcher([
  '/', 
  '/sign-in(.*)', 
  '/sign-up(.*)', 
  '/pricing', 
  '/contact', 
  '/privacy', 
  '/terms', 
  '/security',
  '/integrations',
  '/legal(.*)',
  '/internal(.*)'
]);

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

export default clerkMiddleware(async (auth, req) => {
  // Auth gate: protect /demo and /api. Keep specified routes public.
  if (!isPublicRoute(req)) {
    await auth.protect();
  }

  // Rate limit /api/chat (still after auth gate; protects against internal abuse).
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

  // Note: CSP is handled in next.config.ts for this project to ensure consistency with Clerk.
  response.headers.delete('X-Powered-By');
  return response;
});

export const config = {
  matcher: [
    // Skip Next.js internals and all static files, unless found in search params
    '/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)',
    // Always run for API routes
    '/(api|trpc)(.*)',
  ],
};
