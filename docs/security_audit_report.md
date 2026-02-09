# VaultFill Security & Privacy Audit Report

**Date:** 2026-02-09  
**Auditor:** Security Audit Agent  
**Scope:** Full application codebase — `/src`, environment files, Prisma schema, Next.js config  
**Overall Risk Rating:** 🔴 HIGH — Multiple critical and high-severity findings require immediate remediation

---

## Executive Summary

| Severity | Count |
|----------|-------|
| 🔴 Critical | 3 |
| 🟠 High | 4 |
| 🟡 Medium | 3 |
| 🔵 Low | 2 |
| **Total** | **12** |

The VaultFill application has **no CSRF protection, no API rate limiting, and leaks PII (email addresses) in logs and Telegram notifications**. Database connections use SSL but several other foundational security controls are missing. The email sending infrastructure is health-checked but no actual email-sending code exists in the codebase yet.

---

## 1. PII Leakage — 🔴 CRITICAL

### Finding 1.1: Email addresses logged to stdout

**Location:** `src/app/api/leads/route.ts` lines ~113, ~119  
**Evidence:**
```typescript
console.warn("[VaultFill] Lead save returned false for:", email);
console.error("[VaultFill] Lead database write failed:", err);
```

The `email` variable (PII) is logged directly. In serverless environments (Vercel), these logs persist in the provider's log aggregation and may be accessible to team members without need-to-know.

**Severity:** 🔴 Critical  
**Recommendation:** Replace PII with a hash or redacted form:
```typescript
const redacted = email.replace(/(.{2}).*@/, '$1***@');
console.warn("[VaultFill] Lead save returned false for:", redacted);
```

### Finding 1.2: Full PII sent to Telegram in plaintext

**Location:** `src/app/api/leads/route.ts` lines ~130-145  
**Evidence:**
```typescript
const msg = `...Email: ${lead.email}\n...`;
await telegramAlert(msg);
```

Full email addresses, role, process, and volume data are sent via Telegram Bot API over HTTPS, but stored in plaintext in Telegram chat history. This creates an uncontrolled PII data store outside the application boundary.

**Severity:** 🔴 Critical  
**Recommendation:** Send only the email domain and tier for alerts. Store full PII only in the database:
```typescript
const msg = `New lead: *@${domain} (${lead.tier})`;
```

### Finding 1.3: Full PII sent to arbitrary webhook

**Location:** `src/app/api/leads/route.ts` lines ~148-160  
**Evidence:** `LEAD_ALERT_WEBHOOK_URL` receives email + all lead fields with no encryption or signing.

**Severity:** 🟠 High  
**Recommendation:** Sign webhook payloads with HMAC; redact email to domain-only.

### Finding 1.4: User-Agent stored as PII

**Location:** `src/app/api/leads/route.ts`, `src/lib/leads-db.ts`  
**Evidence:** `ua: req.headers.get("user-agent")` is captured and stored.

**Severity:** 🟡 Medium  
**Recommendation:** User-Agent strings can be fingerprinting data under GDPR. Document the legal basis or truncate to browser family only.

---

## 2. SMTP Sender (SendGrid) — 🟡 MEDIUM

### Finding 2.1: No email-sending code exists

**Evidence:** `grep -r "sendgrid\|sgMail" src/` returns zero results outside the health-check cron. The health cron (`/api/cron/health`) correctly validates that `contact@vaultfill.com` is a verified sender identity, but **no code actually sends emails** (no lead confirmation, no notification emails).

The success screen in `LeadModal.tsx` promises: *"Check your inbox for a confirmation email"* — but no such email is sent.

**Severity:** 🟡 Medium (functional gap, not a security vulnerability)  
**Recommendation:**
1. Implement email sending via `@sendgrid/mail` with hardcoded `from: { email: 'contact@vaultfill.com', name: 'VaultFill Support' }`.
2. Never derive the sender address from user input or environment variables alone — hardcode it.
3. Add the `SENDGRID_API_KEY` to `.env` and verify the sender identity in the SendGrid dashboard.

---

## 3. CSRF Protection — 🔴 CRITICAL

### Finding 3.1: Zero CSRF protection on any endpoint

**Evidence:** `grep -r "csrf\|CSRF\|csrfToken\|xsrf" src/` returns zero results. There is:
- No CSRF token generation
- No CSRF token validation
- No `SameSite` cookie configuration
- No custom header requirement (e.g., `X-Requested-With`)
- No middleware implementing CSRF checks

The lead capture form (`LeadModal.tsx`, `LeadCaptureModal.tsx`) submits directly to `/api/leads` via `fetch()` with `Content-Type: application/json`. While JSON content type provides *some* implicit CSRF protection (browsers won't send JSON cross-origin via form submission), this is **not sufficient** because:
- An attacker can use `fetch()` from a malicious page if CORS is misconfigured
- The `Content-Type` check is not enforced server-side

**Affected endpoints:**
| Endpoint | Method | CSRF Risk |
|----------|--------|-----------|
| `/api/leads` | POST | 🔴 High — creates lead records |
| `/api/chat` | POST | 🟠 Medium — consumes OpenAI credits |
| `/api/evidence/upload` | POST | 🔴 High — writes files to server |
| `/api/admin/leads` | GET | 🟡 Low — protected by API key |

**Severity:** 🔴 Critical  
**Recommendations:**
1. **Immediate:** Add server-side `Content-Type: application/json` enforcement on all POST API routes. Reject requests without this header.
2. **Short-term:** Implement the double-submit cookie pattern or use a library like `csrf-csrf` or `next-csrf`.
3. **Verify CORS:** Ensure Next.js is not returning `Access-Control-Allow-Origin: *` on API routes. (Default Next.js behavior is safe — no CORS headers — but verify in production.)

---

## 4. Database Security — ✅ PASS (with notes)

### Finding 4.1: SSL/TLS is enforced on database connections

**Evidence:** All database connection strings include `?sslmode=require`:
```
POSTGRES_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"
DATABASE_URL="postgres://...@db.prisma.io:5432/postgres?sslmode=require"
```

The Prisma Accelerate URLs (`prisma+postgres://accelerate.prisma-data.net/...`) use HTTPS by default.

**Status:** ✅ Pass  

### Finding 4.2: Database credentials in multiple .env files

**Evidence:** Credentials appear in `.env`, `.env.local`, and `.env.development.local` — three files with the **same** credentials. While `.gitignore` covers `.env*`, this creates local sprawl.

**Severity:** 🔵 Low  
**Recommendation:** Consolidate to a single `.env.local` file. Delete `.env` and `.env.development.local` or ensure they contain no secrets.

### Finding 4.3: Raw SQL queries — potential SQL injection surface

**Location:** `src/lib/db.ts`, `src/lib/vector-search.ts`  
**Evidence:**
```typescript
prisma.$queryRawUnsafe(
  `SELECT ... WHERE embedding <=> $1::vector ...`,
  vectorStr, limit
);
```

While parameterized (`$1`, `$2`), `$queryRawUnsafe` bypasses Prisma's type-safe query builder. The `vectorStr` is constructed from float arrays (`embedding.join(",")`) which limits injection risk, but the pattern is dangerous if ever refactored carelessly.

**Severity:** 🟡 Medium  
**Recommendation:** Add input validation ensuring `vectorStr` matches the pattern `^\[[\d.,\-e]+\]$` before passing to the query. Consider using `$queryRaw` with tagged template literals instead.

---

## 5. API Rate Limiting — 🟠 HIGH

### Finding 5.1: No rate limiting on any endpoint

**Evidence:** `grep -r "rate.limit\|rateLimit\|throttle\|limiter" src/` returns zero results. No rate-limiting middleware, no Vercel Edge Config rate limits, no in-memory counters.

**Affected endpoints and abuse vectors:**

| Endpoint | Abuse Vector | Impact |
|----------|-------------|--------|
| `POST /api/chat` | Automated requests → unbounded OpenAI API spend | 💰 Financial (GPT-4o-mini costs) |
| `POST /api/leads` | Email enumeration, spam lead injection | 📊 Data pollution |
| `POST /api/evidence/upload` | Disk/storage exhaustion (10MB × ∞) | 💣 Denial of Service |
| `GET /api/knowledge` | Excessive reads, cache bypass | ⚡ Performance |
| `GET /api/admin/leads` | Brute-force API key | 🔑 Auth bypass |

**Severity:** 🟠 High  
**Recommendations:**
1. **Immediate:** Add rate limiting to `/api/chat` and `/api/evidence/upload`. Use Vercel's `@vercel/edge` rate limiting or `upstash/ratelimit` with Redis:
   ```typescript
   import { Ratelimit } from "@upstash/ratelimit";
   const ratelimit = new Ratelimit({
     redis: Redis.fromEnv(),
     limiter: Ratelimit.slidingWindow(10, "60 s"), // 10 req/min
   });
   ```
2. **Short-term:** Add rate limiting to `/api/leads` (e.g., 5 submissions per IP per hour).
3. **Admin endpoint:** Add exponential backoff or lockout after 5 failed auth attempts on `/api/admin/leads`.

---

## 6. Additional Security Findings

### Finding 6.1: Security headers defined but possibly not active

**Location:** `src/proxy.ts`  
**Evidence:** The file defines a `proxy()` function with excellent security headers (CSP, HSTS, X-Frame-Options, Permissions-Policy), but:
- The file exports `proxy` as a named function, not as a default Next.js middleware
- There is no `src/middleware.ts` file detected
- The `config.matcher` is defined but may not be wired up

**Severity:** 🟠 High  
**Recommendation:** Rename `src/proxy.ts` to `src/middleware.ts` and export the function as `middleware`:
```typescript
export function middleware(request: NextRequest) { ... }
```

### Finding 6.2: CSP allows `unsafe-inline` and `unsafe-eval`

**Location:** `src/proxy.ts`  
**Evidence:** `script-src 'self' 'unsafe-inline' 'unsafe-eval'`

This effectively disables CSP's XSS protection. While necessary for Next.js development, production should use nonce-based CSP.

**Severity:** 🟠 High  
**Recommendation:** Implement nonce-based CSP for production. Next.js 13+ supports this via `next.config.ts` headers or middleware with `crypto.randomUUID()` nonces.

### Finding 6.3: `dangerouslySetInnerHTML` check

**Evidence:** No usage of `dangerouslySetInnerHTML` found in the codebase. ✅ Pass.

### Finding 6.4: Evidence upload writes to local filesystem

**Location:** `src/app/api/evidence/upload/route.ts`  
**Evidence:** Files are written to `data/vector-index.json` on the local filesystem. On Vercel, the filesystem is ephemeral and read-only in production — this endpoint will silently fail.

**Severity:** 🟡 Medium  
**Recommendation:** Migrate vector index storage to the database (pgvector `DocumentSection` table) for production.

### Finding 6.5: Secrets in `.env` files on disk

**Evidence:** `.env`, `.env.local`, and `.env.development.local` all contain:
- Prisma Accelerate API keys (JWT tokens)
- PostgreSQL credentials (username + password)
- Vercel OIDC tokens

While `.gitignore` covers these patterns (`.env*`), the files exist on disk and could be exposed via:
- Accidental `next.config.ts` `publicRuntimeConfig` inclusion
- Source map exposure
- Backup/snapshot leaks

**Severity:** 🔵 Low (mitigated by .gitignore)  
**Recommendation:** Verify no `NEXT_PUBLIC_` prefix is used for secret env vars. Audit Vercel environment variable settings.

---

## 7. Compliance Notes

### GDPR Considerations
- **Right to erasure:** No delete endpoint exists for leads. Users cannot request data deletion.
- **Consent:** The lead form collects data but does not present a privacy policy link or explicit consent checkbox.
- **Data minimization:** User-Agent capture may violate minimization principles.

### SOC 2 Considerations
- **Audit trail:** No audit logging for admin actions (lead retrieval, data access).
- **Access control:** Admin API uses a single shared API key rather than individual credentials.

---

## Remediation Priority Matrix

| Priority | Finding | Effort |
|----------|---------|--------|
| 🔴 P0 | 3.1 — No CSRF protection | Medium |
| 🔴 P0 | 1.1/1.2 — PII in logs and Telegram | Low |
| 🔴 P0 | 6.1 — Security headers not active | Low |
| 🟠 P1 | 5.1 — No rate limiting | Medium |
| 🟠 P1 | 6.2 — CSP unsafe-inline/eval | Medium |
| 🟠 P1 | 1.3 — PII in webhook | Low |
| 🟡 P2 | 4.3 — Raw SQL pattern | Low |
| 🟡 P2 | 2.1 — No email sending code | Medium |
| 🟡 P2 | 6.4 — Ephemeral filesystem writes | Medium |
| 🔵 P3 | 1.4 — User-Agent as PII | Low |
| 🔵 P3 | 4.2 — Credential sprawl in .env files | Low |
| 🔵 P3 | GDPR gaps (consent, deletion) | Medium |

---

## Appendix: Files Reviewed

| File | Purpose |
|------|---------|
| `src/app/api/leads/route.ts` | Lead capture endpoint |
| `src/app/api/chat/route.ts` | AI chat endpoint |
| `src/app/api/evidence/upload/route.ts` | Evidence upload + embedding |
| `src/app/api/admin/leads/route.ts` | Admin lead retrieval |
| `src/app/api/knowledge/route.ts` | Knowledge vault API |
| `src/app/api/cron/health/route.ts` | Health check cron |
| `src/app/api/cron/ingest/route.ts` | Auto-index cron |
| `src/lib/db.ts` | Prisma client + raw queries |
| `src/lib/leads-db.ts` | Lead persistence layer |
| `src/lib/vector-search.ts` | Vector similarity search |
| `src/lib/evidence-extractor.ts` | PDF/image text extraction |
| `src/components/LeadCaptureModal.tsx` | Simple lead form |
| `src/components/LeadModal.tsx` | Full lead form |
| `src/proxy.ts` | Security headers (inactive) |
| `src/app/layout.tsx` | Root layout |
| `src/app/page.tsx` | Landing page |
| `prisma/schema.prisma` | Database schema |
| `next.config.ts` | Next.js config |
| `vercel.json` | Vercel deployment config |
| `.env` / `.env.local` / `.env.development.local` | Environment variables |
| `.gitignore` | Git ignore rules |

---

*Report generated by VaultFill Security Audit Agent — 2026-02-09T02:46:00-06:00*
