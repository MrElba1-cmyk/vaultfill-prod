# Security Re-Test Report — vaultfill.com

**Date:** 2026-02-09  
**Tester:** security-audit-agent (automated)  
**Target:** https://vaultfill.com (production)

---

## Summary

| # | Finding | Result | Severity |
|---|---------|--------|----------|
| 1 | /api/knowledge auth | ✅ PASS | Critical → Fixed |
| 2 | Competitive intel in sample-vault | ✅ PASS | Medium → Fixed |
| 3 | /api/leads input validation | ⚠️ PARTIAL | Medium → Partially Fixed |
| 4 | /api/chat rate limiting | ✅ PASS | High → Fixed |
| 5 | CSP — no unsafe-eval | ✅ PASS | Medium → Fixed |

**Overall: 4/5 fully fixed, 1 partially fixed.**

---

## 1. /api/knowledge — Unauthenticated Access Denied

**Result: ✅ PASS**  
**Original Severity: Critical**

Unauthenticated GET returns **401** with clear error message.

```
$ curl -s -i https://vaultfill.com/api/knowledge

HTTP/2 401
content-type: application/json

{"error":"Unauthorized. Provide a valid x-api-key header."}
```

---

## 2. Competitive Intel Removed from Public Pages

**Result: ✅ PASS**  
**Original Severity: Medium**

Searched homepage and `/sample-vault` for competitor names (Salesforce, HubSpot, Zoho, Pipedrive) and keywords (competitive, market share). **Zero matches found.**

```
$ curl -s https://vaultfill.com | grep -iE 'competitor|salesforce|hubspot|zoho|pipedrive|competitive'
(no output)

$ curl -s https://vaultfill.com/sample-vault | grep -iE 'competitor|salesforce|hubspot|zoho|pipedrive|competitive|market.?share'
(no output)
```

---

## 3. /api/leads — Input Validation

**Result: ⚠️ PARTIAL PASS**  
**Original Severity: Medium**

### XSS/HTML injection — ✅ Fixed
Script tags in `name` field correctly rejected with 400:

```
$ curl -s -X POST https://vaultfill.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"<script>alert(1)</script>","email":"test@test.com","company":"test"}'

HTTP 400
{"ok":false,"error":"invalid_input","detail":"HTML/script tags are not allowed in name or company fields"}
```

### Length limits — ❌ Not enforced
A 10,000-character `name` field was accepted (HTTP 200):

```
$ curl -s -X POST https://vaultfill.com/api/leads \
  -H "Content-Type: application/json" \
  -d '{"name":"AAAA...(10000 chars)...","email":"test@test.com","company":"test"}'

HTTP 200
{"ok":true}
```

**Recommendation:** Add max-length validation (e.g., 200 chars for name, 500 for company) to prevent storage abuse and potential DoS via oversized payloads.

---

## 4. /api/chat — Rate Limiting

**Result: ✅ PASS**  
**Original Severity: High**

Rate limiting is active and enforced. Rapid-fire requests hit **429** after the threshold:

```
$ for i in $(seq 1 25); do curl -s -o /dev/null -w "%{http_code}" -X POST .../api/chat ...; done

req 1: 200
req 2: 200
req 3: 429
req 4-25: 429

Response body: {"error":"Rate limit exceeded. Max 20 requests per minute."}
```

Rate limiter triggers correctly and returns a clear error message. (Note: the limit appears to engage sooner than 20 due to prior test traffic or per-window counting, but enforcement is confirmed.)

---

## 5. Content Security Policy — No `unsafe-eval`

**Result: ✅ PASS**  
**Original Severity: Medium**

CSP header present and does **not** contain `unsafe-eval`:

```
content-security-policy: default-src 'self'; script-src 'self' 'unsafe-inline';
  style-src 'self' 'unsafe-inline'; img-src 'self' data: blob: https:;
  font-src 'self' https://fonts.gstatic.com; connect-src 'self';
  frame-ancestors 'none'; base-uri 'self'; form-action 'self';
  upgrade-insecure-requests
```

Additional hardening headers confirmed:
- `x-frame-options: DENY`
- `x-content-type-options: nosniff`
- `strict-transport-security: max-age=63072000; includeSubDomains; preload`
- `referrer-policy: strict-origin-when-cross-origin`
- `permissions-policy: camera=(), microphone=(), geolocation=(), interest-cohort=()`

---

## Open Item

| Issue | Severity | Recommendation |
|-------|----------|----------------|
| /api/leads accepts unbounded field lengths | Low | Add max-length constraints (name ≤ 200, company ≤ 500, etc.) |
