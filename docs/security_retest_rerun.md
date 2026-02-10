# Security Re-Test Rerun — vaultfill.com

**Date:** 2026-02-09 18:47 CST  
**Tester:** security-audit-agent (automated rerun)  
**Target:** https://vaultfill.com (production)

---

## Summary

| # | Test | Result |
|---|------|--------|
| 1 | /api/knowledge returns 401 without key | ✅ PASS |
| 2 | /api/leads rejects XSS payloads | ✅ PASS |
| 3 | /api/chat rate limiting active | ✅ PASS |
| 4 | CSP header has no unsafe-eval | ✅ PASS |
| 5 | Competitive intel not accessible | ✅ PASS |

**Overall: 5/5 PASS**

---

## 1. /api/knowledge — Unauthenticated Access Denied

**Result: ✅ PASS** — Returns HTTP 401 without API key.

```
$ curl -s -w "HTTP_CODE:%{http_code}" https://vaultfill.com/api/knowledge

HTTP_CODE:401
{"error":"Unauthorized. Provide a valid x-api-key header."}
```

---

## 2. /api/leads — XSS Payload Rejected

**Result: ✅ PASS** — Returns HTTP 400 with clear validation error.

```
$ curl -s -w "HTTP_CODE:%{http_code}" -X POST https://vaultfill.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","email":"test@test.com","company":"TestCo"}'

HTTP_CODE:400
{"ok":false,"error":"invalid_input","detail":"HTML/script tags are not allowed in name or company fields"}
```

---

## 3. /api/chat — Rate Limiting Active

**Result: ✅ PASS** — 429 responses observed under parallel load (25 concurrent requests).

```
$ # 25 parallel POST requests to /api/chat
# Sample output (order varies):
req 9: 429
req 18: 429
req 6: 429
req 20: 429
req 10: 429
req 23: 429
req 24: 429
req 14: 200
req 2: 200
req 17: 200
req 7: 200
...
```

7 of 25 parallel requests returned **429 Too Many Requests**, confirming rate limiting is active.

---

## 4. CSP Header — No unsafe-eval

**Result: ✅ PASS** — `content-security-policy` header present, no `unsafe-eval` directive.

```
$ curl -s -D - -o /dev/null https://vaultfill.com | grep -i content-security-policy

content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:; font-src 'self' https://fonts.gstatic.com; connect-src 'self'; frame-ancestors 'none'; base-uri 'self'; form-action 'self'; upgrade-insecure-requests
```

Confirmed: `unsafe-eval` is **absent** from the CSP policy.

Additional security headers present:
- `strict-transport-security: max-age=63072000; includeSubDomains; preload`
- `x-content-type-options: nosniff`
- `x-frame-options: DENY`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`

---

## 5. Competitive Intel — Not Publicly Accessible

**Result: ✅ PASS** — All paths return 404 or 401.

```
$ curl -s -w "HTTP_CODE:%{http_code}" https://vaultfill.com/docs/competitive_intel_vanta_decon.md
HTTP_CODE:404

$ curl -s -w "HTTP_CODE:%{http_code}" https://vaultfill.com/competitive-intel
HTTP_CODE:404

$ curl -s -w "HTTP_CODE:%{http_code}" https://vaultfill.com/api/knowledge?query=competitive
HTTP_CODE:401
```

Competitive intelligence documents are not served publicly. The `/api/knowledge` endpoint requires authentication even with a `query` parameter.
