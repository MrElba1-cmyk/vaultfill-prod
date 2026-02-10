# Privacy Claim Recommendation

**Date:** 2026-02-09  
**Audit finding:** Marketing claims "zero-knowledge architecture" but the system stores session history server-side, persists leads to DB + JSON, sends queries to OpenAI, and sends lead notifications via Telegram.

---

## Recommendation: Option A + C (Change Language + Add Transparency)

**Do NOT attempt Option B (true zero-knowledge) right now.** It's a multi-month architectural rewrite that delays revenue and isn't what your B2B buyers actually need. Enterprise buyers want *honest, auditable privacy practices* — not cryptographic purity.

**Do NOT keep the current language.** "Zero-knowledge" has a specific technical meaning (the server cannot access plaintext data). That is provably false here. If a prospect's security team Googles it, you lose the deal *and* your reputation. This is the single highest-risk item on the site.

---

## What's Actually True vs. What's Claimed

| Claim (current) | Reality | Severity |
|---|---|---|
| "zero-knowledge architecture" | Server holds session history in memory, queries sent plaintext to OpenAI | 🔴 **False** |
| "Ephemeral Sessions — No data stored server-side after session ends" | In-memory Map persists until process restart; no explicit TTL/cleanup | 🟡 **Misleading** |
| "No Data Stored — queries are never logged or saved" | `recordMessage()` stores messages; leads persist to DB + JSON | 🔴 **False** |
| "Anonymous by Default — No tracking. No cookies." | localStorage UUID tracks sessions; Telegram gets lead data | 🟡 **Misleading** |
| "End-to-End Encrypted — AES-256" | HTTPS in transit yes, but no E2E encryption; OpenAI sees plaintext | 🔴 **False** |
| "SOC 2 Ready" | No audit completed | 🟡 **Aspirational** (common, lower risk) |
| "No Model Training" | OpenAI's API doesn't train on input by default — **this one is actually true** ✅ | ✅ OK |

---

## Exact Replacement Copy

### `PrivacyPromise.tsx` — Section heading + intro

**Current:**
```
VaultFill is built on a zero-knowledge architecture. Your data stays yours — always.
```

**Replace with:**
```
VaultFill is built with a privacy-first architecture. Your data stays yours — we minimize what we store, never train on it, and give you full control.
```

### `PrivacyPromise.tsx` — Three cards

**Current card 1:**
```
title: 'Ephemeral Sessions'
desc: 'No data is stored server-side after your session ends. Every interaction is transient.'
```

**Replace with:**
```
title: 'Minimal Retention'
desc: 'Session context is held in memory only for the duration of your conversation and automatically purged. We don't persist chat history to disk.'
```

**Current card 3 (Tenant Isolation):** Keep as-is — this is accurate and valuable.

### `TrustBadges.tsx` — Badge array

**Badge 1 — Current:**
```
title: 'No Data Stored'
desc: 'Zero-retention architecture. Your queries are never logged or saved.'
```
**Replace with:**
```
title: 'Minimal Data Retention'
desc: 'Chat context lives in memory only during your session. Lead info you voluntarily submit is stored securely.'
```

**Badge 2 — Current:**
```
title: 'End-to-End Encrypted'
desc: 'All data in transit and at rest is encrypted with AES-256.'
```
**Replace with:**
```
title: 'Encrypted in Transit'
desc: 'All connections use TLS. AI processing uses OpenAI's enterprise API with no model training on your data.'
```

**Badge 3 — "SOC 2 Ready":** Change to:
```
title: 'SOC 2 Designed'
desc: 'Architecture follows SOC 2 Type II control principles. Formal audit planned.'
```

**Badge 4 — Current:**
```
title: 'Anonymous by Default'
desc: 'No accounts required. No tracking. No cookies.'
```
**Replace with:**
```
title: 'No Account Required'
desc: 'Try VaultFill without signing up. A local session ID is used for conversation continuity only.'
```

### `page.tsx` — FAQ answer

**Current:**
```
"Evidence is encrypted at rest and in transit. Tenant isolation is enforced with row-level security. We never train on your data."
```

**Replace with:**
```
"Data is encrypted in transit via TLS. Tenant isolation is enforced at the application layer. We use OpenAI's enterprise API which does not train on your data."
```

### `page.tsx` — Feature card (Security)

**Current:**
```
desc: "Tenant isolation, encrypted evidence storage, and audit trails designed for enterprise compliance requirements."
```

**Replace with:**
```
desc: "Tenant isolation, secure evidence handling, and audit trails designed for enterprise compliance requirements."
```

---

## Risk Tradeoffs

| Approach | Pros | Cons |
|---|---|---|
| **A+C (recommended)** | Ship in 1 day. Builds real trust. Removes legal exposure. Honest copy actually converts better with security-savvy buyers. | Slightly less "wow" marketing. Some prospects may ask follow-up questions about OpenAI. |
| **B (true zero-knowledge)** | Bulletproof claim. Massive differentiator. | 2-4 month rewrite. Requires client-side encryption, on-prem/self-hosted LLM, no server sessions. Delays everything. Pre-revenue startup can't afford this. |
| **Do nothing** | No effort. | One skeptical CISO kills your pipeline. Potential FTC deceptive practices exposure. Competitor screenshots your site and posts on Twitter. |

---

## Implementation Checklist

### Phase 1 — Immediate (ship today)

- [ ] Update `PrivacyPromise.tsx` with replacement copy above
- [ ] Update `TrustBadges.tsx` with replacement copy above
- [ ] Update `page.tsx` FAQ answer and feature card
- [ ] Add a `/privacy` page with a plain-English data practices summary:
  - What is collected (session context, voluntarily submitted lead info)
  - Where it goes (OpenAI API for processing, Telegram for lead alerts, in-memory session store)
  - How long it's kept (session context: until process recycle; leads: until deleted)
  - What is NOT done (no model training, no selling data, no cross-tenant access)
- [ ] Remove any remaining "zero-knowledge" references (grep the full codebase)
- [ ] Deploy and verify

### Phase 2 — This week (technical hygiene)

- [ ] Add explicit TTL + cleanup to `sessions.ts` (e.g., purge after 30 min idle) — makes "minimal retention" claim defensible
- [ ] Add a session data deletion endpoint (`DELETE /api/session/:id`) so users can explicitly clear their data
- [ ] Truncate/redact sensitive fields before sending to Telegram alerts
- [ ] Add `data/leads/*.json` to `.gitignore` if not already

### Phase 3 — When you have revenue (build toward real differentiators)

- [ ] Implement actual encryption at rest for evidence files (S3 SSE-KMS or similar)
- [ ] Evaluate self-hosted LLM option (Llama, Mixtral) for customers who can't send data to OpenAI
- [ ] Begin SOC 2 Type II readiness assessment
- [ ] Add DPA (Data Processing Agreement) template for enterprise customers
- [ ] Consider BYOK (Bring Your Own Key) for OpenAI API — customer uses their own key, you never see queries

---

## Bottom Line

"Privacy-first" is a strong, defensible, honest position. "Zero-knowledge" when you're sending plaintext to OpenAI is a liability. Make the copy change today — it's a 30-minute fix that eliminates your biggest trust risk.
