import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function proxy(_request: NextRequest) {
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
      "script-src 'self' 'unsafe-inline' 'unsafe-eval'", // Next.js requires unsafe-inline/eval in dev; tighten with nonces in production
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
