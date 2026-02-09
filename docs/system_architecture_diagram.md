# VaultFill — System Architecture

> Last updated: 2026-02-09

---

## 1. High-Level Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                         USERS / BROWSERS                        │
└──────────────────────────────┬──────────────────────────────────┘
                               │ HTTPS
                               ▼
┌─────────────────────────────────────────────────────────────────┐
│                      VERCEL EDGE NETWORK                        │
│                   (CDN, SSL, Auto-scaling)                       │
│                                                                 │
│  ┌───────────────────────────────────────────────────────────┐  │
│  │              NEXT.JS 16 APPLICATION                       │  │
│  │                                                           │  │
│  │  ┌─────────────┐  ┌─────────────┐  ┌──────────────────┐  │  │
│  │  │  Frontend    │  │  API Routes │  │  Cron Jobs       │  │  │
│  │  │  (React 19)  │  │             │  │                  │  │  │
│  │  │             │  │  /api/chat   │  │  /api/cron/      │  │  │
│  │  │  - Landing   │  │  /api/leads │  │    health        │  │  │
│  │  │  - Chat UI   │  │  /api/know- │  │    ingest        │  │  │
│  │  │  - Lead      │  │    ledge    │  │                  │  │  │
│  │  │    Capture   │  │  /api/evid- │  │                  │  │  │
│  │  │  - Live      │  │    ence/    │  │                  │  │  │
│  │  │    Preview   │  │    upload   │  │                  │  │  │
│  │  │  - Admin     │  │  /api/admin │  │                  │  │  │
│  │  └─────────────┘  └──────┬──────┘  └────────┬─────────┘  │  │
│  │                          │                   │            │  │
│  └──────────────────────────┼───────────────────┼────────────┘  │
│                             │                   │               │
└─────────────────────────────┼───────────────────┼───────────────┘
                              │                   │
              ┌───────────────┼───────────────────┼──────────┐
              │               ▼                   ▼          │
              │  ┌──────────────────────────────────────┐    │
              │  │     VERCEL POSTGRES (PostgreSQL)      │    │
              │  │         + pgvector extension          │    │
              │  │                                       │    │
              │  │  Tables:                              │    │
              │  │  - DocumentSection (RAG embeddings)   │    │
              │  │  - leads (CRM data)                   │    │
              │  └──────────────────────────────────────┘    │
              │                                              │
              │           EXTERNAL SERVICES                  │
              │                                              │
              │  ┌────────────┐  ┌───────────┐  ┌────────┐  │
              │  │  OpenAI    │  │ SendGrid  │  │Telegram│  │
              │  │  API       │  │ Email API │  │Bot API │  │
              │  │            │  │           │  │        │  │
              │  │ - GPT chat │  │ - Trans-  │  │- Health│  │
              │  │ - Embed-   │  │   actional│  │  alerts│  │
              │  │   dings    │  │   email   │  │        │  │
              │  └────────────┘  └───────────┘  └────────┘  │
              └──────────────────────────────────────────────┘
```

---

## 2. Request Flows

### 2.1 Shield Bot (AI Chat)

```
User types question
    │
    ▼
FloatingChat.tsx → POST /api/chat
    │
    ├─► Load knowledge base from data/sample-vault/*.md
    ├─► semanticSearch() → pgvector cosine similarity
    ├─► Construct system prompt + RAG context
    ├─► streamText() via OpenAI GPT
    │
    ▼
Streamed response → User
```

### 2.2 Lead Capture

```
User fills form (LeadCaptureModal / LeadModal)
    │
    ▼
POST /api/leads
    │
    ├─► Validate email, calculate tier (1-5 → tier3, 6-20 → tier2, 20+ → tier1)
    ├─► Guess industry from domain
    ├─► saveLead() → Prisma → PostgreSQL "leads" table
    │
    ▼
200 OK → UI confirmation
```

### 2.3 Health Check (Cron)

```
Vercel Cron (daily 08:00 UTC)
    │
    ▼
GET /api/cron/health
    │
    ├─► checkShieldBot() — POST /api/chat with health ping
    ├─► checkSendGrid() — Verify sender identity via API
    │
    ├─► All OK? → Return JSON { ok: true }
    │
    └─► Failures? → telegramAlert() → Telegram Bot API
                     → 🚨 Alert to configured chat
```

---

## 3. Technology Stack Summary

| Layer | Technology | Purpose |
|---|---|---|
| Framework | Next.js 16 (App Router) | SSR, API routes, static generation |
| Frontend | React 19, Framer Motion, Tailwind CSS | UI, animations, responsive design |
| AI/LLM | Vercel AI SDK, OpenAI GPT | Chat completions, embeddings |
| Database | Vercel Postgres + pgvector | Structured data + vector similarity search |
| ORM | Prisma 5 | Type-safe database access |
| Email | SendGrid | Transactional emails from contact@vaultfill.com |
| Alerts | Telegram Bot API | Real-time health/failure notifications |
| Hosting | Vercel | Edge CDN, serverless functions, auto-deploy |
| CI/CD | Git push → Vercel | Automatic build & deploy on push |

---

## 4. Scaling Considerations

### Phase 1: 1–100 Users (Current)

- **Vercel serverless functions** handle all API traffic — auto-scales to zero, no idle cost
- **Vercel Postgres** single instance is sufficient (connection pooling via Prisma)
- **pgvector** handles RAG searches with low latency at small document counts
- **No infrastructure management** — fully managed platform
- **Cost:** Effectively free tier / minimal Vercel spend

### Phase 2: 100–1,000 Users

| Concern | Solution |
|---|---|
| Database connections | Enable Prisma Accelerate or PgBouncer for connection pooling |
| RAG latency | Index optimization on pgvector; consider HNSW indexes |
| API rate limits | Implement per-user rate limiting middleware |
| Lead volume | Add background job processing (Vercel Queue or Inngest) |
| Email deliverability | Dedicated SendGrid IP, DKIM/SPF/DMARC hardening |
| Monitoring | Add structured logging (e.g., Axiom), expand health checks |

### Phase 3: 1,000+ Users

| Concern | Solution |
|---|---|
| Database | Migrate to dedicated PostgreSQL (e.g., Neon, Supabase) with read replicas |
| Vector search | Dedicated vector DB (Pinecone, Weaviate) if pgvector becomes bottleneck |
| API compute | Edge functions for latency-sensitive routes; serverless for heavy processing |
| Multi-tenancy | Per-organization data isolation in database schema |
| Caching | Redis/Vercel KV for session data, chat history, frequent queries |
| CDN | Already handled by Vercel Edge; add asset optimization |
| Observability | Full APM (Datadog/New Relic), distributed tracing, error budgets |
| Auth | Add authentication layer (NextAuth/Clerk) for user-specific features |

### Horizontally Scalable Components

- ✅ **Vercel serverless functions** — auto-scale per-request
- ✅ **Vercel Edge CDN** — globally distributed, no config needed
- ⬆️ **Database** — vertical first, then read replicas / sharding
- ⬆️ **Vector search** — can offload to dedicated service
- ⬆️ **Background jobs** — add queue workers as needed

---

## 5. Emergency Runbook

### 🔴 Site Completely Down

**Symptoms:** vaultfill.com returns 5xx or is unreachable

1. **Check Vercel Status:** [status.vercel.com](https://status.vercel.com) — if platform-wide, wait for resolution
2. **Check Vercel Dashboard:** Log into Vercel → Deployments → check latest deployment status
3. **Rollback:** If last deploy broke it → Vercel Dashboard → Deployments → click previous working deployment → "Promote to Production"
4. **Check DNS:** Run `dig vaultfill.com` — ensure CNAME points to `cname.vercel-dns.com`
5. **Check environment variables:** Vercel Dashboard → Settings → Environment Variables — ensure nothing was accidentally deleted
6. **Escalation:** If unresolved in 15 min → notify Founder via Telegram

### 🟡 Shield Bot (AI Chat) Not Responding

**Symptoms:** Chat returns errors or hangs; health check reports Shield Bot DOWN

1. **Check OpenAI Status:** [status.openai.com](https://status.openai.com)
2. **Check API key:** Verify `OPENAI_API_KEY` env var in Vercel is valid and has credits
3. **Test directly:** `curl -X POST https://vaultfill.com/api/chat -H 'Content-Type: application/json' -d '{"message":"test"}'`
4. **Check Vercel function logs:** Vercel Dashboard → Logs → filter by `/api/chat`
5. **Fallback:** If OpenAI is down, consider temporary static responses or maintenance message

### 🟡 Database Errors

**Symptoms:** API routes returning 500s; leads not saving; RAG search failing

1. **Check Vercel Postgres dashboard:** Vercel Dashboard → Storage → check connection count and status
2. **Connection pool exhaustion:** Restart deployment (redeploy latest) to reset connections
3. **Schema drift:** Run `npx prisma db push` to sync schema if needed
4. **Data integrity:** Connect via `psql` using DATABASE_URL and inspect tables
5. **Backup:** Vercel Postgres has point-in-time recovery — use if data corruption suspected

### 🟡 SendGrid Email Failures

**Symptoms:** Health check reports SendGrid degraded/down; emails not sending

1. **Check SendGrid Status:** [status.sendgrid.com](https://status.sendgrid.com)
2. **Verify API key:** Ensure `SENDGRID_API_KEY` env var is set and valid
3. **Check sender verification:** SendGrid Dashboard → verify contact@vaultfill.com is still verified
4. **Check sending limits:** Review SendGrid dashboard for rate limit or bounce issues
5. **Temporary workaround:** Manually send critical emails if needed

### 🟡 Telegram Alerts Not Working

**Symptoms:** Health check failures aren't generating alerts

1. **Verify env vars:** `TELEGRAM_BOT_TOKEN` and `TELEGRAM_CHAT_ID` must be set in Vercel
2. **Test bot:** `curl "https://api.telegram.org/bot<TOKEN>/getMe"` — should return bot info
3. **Test message:** `curl -X POST "https://api.telegram.org/bot<TOKEN>/sendMessage" -d "chat_id=<ID>&text=test"`
4. **Check if bot was removed from chat:** Re-add bot to the alert chat group

### 📋 General Debugging Checklist

1. Check Vercel deployment logs (build + runtime)
2. Check Vercel function logs for the failing route
3. Verify all environment variables are present
4. Check external service status pages (OpenAI, SendGrid, Vercel, Telegram)
5. Try rolling back to last known good deployment
6. If all else fails: `git stash && git pull && npm run build` locally to reproduce

---

## 6. Environment Variables Reference

| Variable | Service | Required |
|---|---|---|
| `DATABASE_URL` | Vercel Postgres | ✅ |
| `OPENAI_API_KEY` | OpenAI (chat + embeddings) | ✅ |
| `SENDGRID_API_KEY` | SendGrid email | ✅ |
| `TELEGRAM_BOT_TOKEN` | Telegram alerts | ⚠️ (alerts won't work without) |
| `TELEGRAM_CHAT_ID` | Telegram alerts | ⚠️ (alerts won't work without) |
| `CRON_SECRET` | Cron auth | ⚠️ (recommended) |
| `NEXT_PUBLIC_APP_URL` | Self-reference URL | Optional |
