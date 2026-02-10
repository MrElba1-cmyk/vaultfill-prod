import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

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

// Cleanup stale entries every 5 minutes
if (typeof globalThis !== 'undefined') {
  const cleanup = () => {
    const now = Date.now();
    for (const [ip, entry] of chatRateLimit) {
      if (now > entry.resetTime) chatRateLimit.delete(ip);
    }
  };
  setInterval(cleanup, 300_000);
}

export function proxy(_request: NextRequest) {
  // Rate limit /api/chat
  if (_request.nextUrl.pathname === '/api/chat' && _request.method === 'POST') {
    const ip = _request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || _request.headers.get('x-real-ip')
      || 'unknown';
    if (!checkChatRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded. Max 20 requests per minute.' },
        { status: 429, headers: { 'Retry-After': '60' } }
      );
    }
  }
  const response = NextResponse.next();

  // ── Anti-clickjacking ──
  response.headers.set("X-Frame-Options", "DENY");

  // ── Prevent MIME-type sniffing ──
  response.headers.set("X-Content-Type-Options", "nosniff");

  // ── Referrer control ──
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");

  // ── HSTS — enforce HTTPS (2 years, includeSubDomains, preload-ready) ──
  response.headers.set(
    "Strict-Transport-Security",
    "max-age=63072000; includeSubDomains; preload"
  );

  // ── Permissions Policy — disable unused browser APIs ──
  response.headers.set(
    "Permissions-Policy",
    "camera=(), microphone=(), geolocation=(), interest-cohort=()"
  );

  // ── DNS prefetch for performance ──
  response.headers.set("X-DNS-Prefetch-Control", "on");

  // ── Content Security Policy ──
  response.headers.set(
    "Content-Security-Policy",
    [
      "default-src 'self'",
      "script-src 'self' 'unsafe-inline'", // unsafe-eval removed for security; unsafe-inline kept for Next.js hydration
      "style-src 'self' 'unsafe-inline'", // Tailwind + Framer Motion inject inline styles
      "img-src 'self' data: blob: https:",
      "font-src 'self' https://fonts.gstatic.com",
      "connect-src 'self'",
      "frame-ancestors 'none'",
      "base-uri 'self'",
      "form-action 'self'",
      "upgrade-insecure-requests",
    ].join("; ")
  );

  // ── Strip server identity ──
  response.headers.delete("X-Powered-By");

  return response;
}

export const config = {
  matcher: "/((?!_next/static|_next/image|favicon.ico|robots.txt|.well-known/).*)",
};
